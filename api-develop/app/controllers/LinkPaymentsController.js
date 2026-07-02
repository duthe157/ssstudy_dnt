const config = require('../../config/config');
const BaseHelper = require('../helpers/BaseHelper');
const ValidateHelper = require('../helpers/ValidateHelper');
const language = BaseHelper.fileToJSON(`${__dirname}/../languages/vi.json`);
const LinkPaymentsModel = require('../models/LinkPayments');
const UsersModel = require('../models/User');

class LinkPaymentsController {
    async createLinkPayment(req, res, body) {
        try {
            const { student, courses, total_money, status } = body;

            const { phone, email } = student;
            if (!phone || !email) {
                return response(res, null, language.CANNOT_EMPTY.replace('%s', 'Số điện thoại hoặc email'), statusCode.ERROR);
            }
            const isPhone = BaseHelper.getPhone(phone);
            const emailParse = email.toLowerCase();
            const isEmail = await ValidateHelper.isEmail(emailParse);
            if (phone.length > 1 && !isPhone)
                return response(res, null, language.PHONE_INVALID, statusCode.ERROR);
            if (!isEmail) {
                return response(res, null, language.EMAIL_INVALID, statusCode.ERROR);
            }
            if (!student || !courses || courses.length === 0) {
                return response(res, null, language.CANNOT_EMPTY.replace('%s', 'Học sinh hoặc khoá học'), statusCode.ERROR);
            }

            let calculatedTotalMoney = 0;
            if (courses && courses.length > 0) {
                calculatedTotalMoney = courses.reduce((sum, course) => sum + (course.update_price || 0), 0);
            }
            // Ưu tiên tìm theo số điện thoại, không có thì tìm theo email
            let existsStudent = await UsersModel.findOne({ phone, deleted_at: null });
            if (!existsStudent) {
                existsStudent = await UsersModel.findOne({ email: emailParse, deleted_at: null });
            }
            let studentRegistration = {}
            if (!existsStudent) {
                // create user with status PENDING FOR PAYMENT...
                const passEncrypt = BaseHelper.encryptMD5(config.TOKEN.MD5_BEFORE, '12345678', config.TOKEN.MD5_AFTER);
                const aliasSource = student.fullname || student.name || phone || emailParse;
                const alias = BaseHelper.seoURL(aliasSource) + '-' + Date.now();
                const userDoc = {
                    email: emailParse,
                    phone: phone,
                    alias,
                    password: passEncrypt,
                    fullname: 'Student Account',
                    avatar: null,
                    user_group: 'STUDENT',
                    code: Date.now().toString(),
                    dob: null,
                    gender: null,
                    balance: 0,
                    sub_balance: 0,
                    school: null,
                    classroom: null,
                    level: null,
                    status: 'PENDING_FOR_PAYMENT',
                };
                const newUser = await UsersModel.create(userDoc);
                studentRegistration = { id: newUser._id, ...student, name: 'Học sinh mới' }
            } else {
                studentRegistration = { id: existsStudent._id, email: existsStudent.email, phone: existsStudent.phone, name: existsStudent.fullname };
            }

            const newLinkPayment = await LinkPaymentsModel.create({
                student: studentRegistration,
                courses: courses,
                total_money: total_money !== undefined ? total_money : calculatedTotalMoney, // Use provided total_money or calculate
                status: status || 'PENDING', // Default to PENDING if not provided
                payment_date: null,
                creator:  { id: req.user.user_id, name: req.user.fullname, code: req.user.code }
            });

            return response(res, newLinkPayment, 'Tạo link thanh toán thành công', statusCode.OK);
        } catch (err) {
            console.log(err);
            return response(res, {}, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }

    async paymentsStatistics(req, res) {
        try {
            const conditionCommon = { deleted_at: null };
            const totalPayments = await LinkPaymentsModel.count({ ...conditionCommon });
            const pendingPayments = await LinkPaymentsModel.count({ status: 'PENDING', ...conditionCommon });
            const successPayments = await LinkPaymentsModel.count({ status: 'PAID', ...conditionCommon });
            const failedPayments = await LinkPaymentsModel.count({ status: 'FAILED', ...conditionCommon });
            const cancelledPayments = await LinkPaymentsModel.count({ status: 'CANCELLED', ...conditionCommon });
            const expiredPayments = await LinkPaymentsModel.count({ status: 'EXPIRED', ...conditionCommon });

            const totalRevenueResult = await LinkPaymentsModel.aggregate([
                { $match: { status: 'PAID', ...conditionCommon } },
                { $group: { _id: null, totalRevenue: { $sum: '$total_money' } } }
            ]);
            const totalRevenue = totalRevenueResult.length > 0 ? totalRevenueResult[0].totalRevenue : 0;

            const data = {
                total_payments: totalPayments,
                pending_payments: pendingPayments,
                success_payments: successPayments,
                failed_payments: failedPayments,
                cancelled_payments: cancelledPayments,
                total_revenue: totalRevenue,
                expired_payment: expiredPayments
            };

            return response(res, data, 'Thống kê thanh toán thành công', statusCode.OK);
        } catch (err) {
            logError(err);
            return response(res, {}, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }

    async paymentList(req, res, query) {
        const { keyword, creator_id, course_id, status, page, limit } = query;
        try {
            const currentPage = parseInt(page) || 1;
            const perPage = parseInt(limit) || 10;
            const conditions = { deleted_at: null };

            // Cập nhật PENDING quá 7 ngày thành EXPIRED
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            await LinkPaymentsModel.updateMany(
                { deleted_at: null, status: 'PENDING', created_at: { $lt: sevenDaysAgo } },
                { $set: { status: 'EXPIRED' } }
            );

            if (keyword) {
                const escapedSearch = keyword.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&');
                const searchRegex = new RegExp(escapedSearch, 'i');
                conditions.$or = [
                    { 'student.phone': searchRegex },
                    { 'student.email': searchRegex },
                ];
            }

            if (creator_id) {
                conditions['creator.id'] = creator_id;
            }

            if (course_id) {
                conditions['courses.id'] = course_id;
            }

            if (status) {
                conditions.status = status;
            }

            const options = {
                skip: (currentPage - 1) * perPage,
                limit: perPage,
                sort: { created_at: -1 } // Order by payment_date descending
            };
            const items = await LinkPaymentsModel.find(conditions, null, options);
            const total = await LinkPaymentsModel.count(conditions);

            const data = {
                items: items,
                total: total,
                perPage: perPage
            };

            return response(res, data, 'Danh sách thanh toán thành công', statusCode.OK);
        } catch (err) {
            console.log(err); // Keeping this for debugging as per your last diff
            logError(err);
            return response(res, {}, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }

    async paymentDetail(req, res, body) {
        try {
            const { id } = body;
            if (!id) {
                return response(res, null, language.CANNOT_EMPTY.replace('%s', 'id'), statusCode.ERROR);
            }

            const linkPayment = await LinkPaymentsModel.findOne({ _id: id, deleted_at: null });
            if (!linkPayment) {
                return response(res, null, 'Không tìm thấy link thanh toán.', statusCode.NOT_FOUND);
            }
            if (linkPayment.status !== 'PENDING') {
                return response(res, null, 'Trang thái liên kết không hợp lệ',statusCode.ERROR)
            }

            return response(res, linkPayment, 'Lấy chi tiết link thanh toán thành công', statusCode.OK);
        } catch (err) {
            logError(err);
            return response(res, {}, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }
 
    async updateLinkPayment(req, res, body) {
        try {
            const { id, isChangeStatus, status } = body;
            if (!id) {
                return response(res, null, language.CANNOT_EMPTY.replace('%s', 'id'), statusCode.ERROR);
            }
            const linkPayment = await LinkPaymentsModel.findOne({ _id: id, deleted_at: null });
            if (!linkPayment) {
                return response(res, null, 'Không tìm thấy link thanh toán.', statusCode.NOT_FOUND);
            }

            if (isChangeStatus && status) {
                await LinkPaymentsModel.updateOne({_id: id}, { status: status });
            } else {
                await LinkPaymentsModel.updateOne({_id: id}, { deleted_at: new Date() });
            }

            return response(res, {}, 'Thành công', statusCode.OK);
        } catch(err) {
            logError(err);
            return response(res, {}, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }

    /** API chỉ cập nhật trạng thái link thanh toán */
    async updateLinkPaymentStatus(req, res, body) {
        try {
            const { id, status } = body;
            if (!id) {
                return response(res, null, language.CANNOT_EMPTY.replace('%s', 'id'), statusCode.ERROR);
            }
            const allowedStatuses = ['PENDING', 'PAID', 'EXPIRED', 'CANCELLED'];
            if (!status || !allowedStatuses.includes(status)) {
                return response(res, null, 'Trạng thái không hợp lệ. Cho phép: PENDING, PAID, EXPIRED, CANCELLED', statusCode.ERROR);
            }
            const linkPayment = await LinkPaymentsModel.findOne({ _id: id, deleted_at: null });
            if (!linkPayment) {
                return response(res, null, 'Không tìm thấy link thanh toán.', statusCode.NOT_FOUND);
            }
            const updateData = { status };
            if (status === 'PAID') {
                updateData.payment_date = new Date();
            }
            await LinkPaymentsModel.updateOne({ _id: id }, updateData);
            return response(res, { id, status, payment_date: updateData.payment_date || linkPayment.payment_date }, 'Cập nhật trạng thái thành công', statusCode.OK);
        } catch (err) {
            logError(err);
            return response(res, {}, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }

    async updateUserForLinkPayment(req, res, body) {
        try {
            const { id } = body;
            if (!id) {
                return response(res, null, language.CANNOT_EMPTY.replace('%s', 'id'), statusCode.ERROR);
            }
            const user = await UsersModel.findOne({ _id: id, deleted_at: null });
            if (!user) {
                return response(res, null, 'Không tìm thấy người dùng.', statusCode.NOT_FOUND);
            }

            await UsersModel.updateOne({_id: id}, { status: "ACTIVE" });

            return response(res, {}, 'Thành công', statusCode.OK);
        } catch(err) {
            logError(err);
            return response(res, {}, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }
}

module.exports = new LinkPaymentsController();