const appConfig = require('../../config/app');
const BaseHelper = require('../helpers/BaseHelper');
const ClassroomModel = require('../models/Classroom');
const SubjectModel = require('../models/Subject');
const UserModel = require('../models/User');
const language = BaseHelper.fileToJSON(`${__dirname}/../languages/vi.json`);
const BillingModel = require('../models/Billing');
const BillingItemModel = require('../models/BillingItem');

class ReportController {
    async revenueByCompany(req, res, params) {
        try {
            if (req.user.user_group !== appConfig.USER_GROUP.ADMIN) {
                return response(res, {}, 'Tài khoản của bạn không có quyền truy cập', statusCode.ERROR)
            }
            const classroomIds = params.classroom_ids || [];
            const subjectIds = params.subject_ids || [];
            const paymentMethod = params.payment_method || null;
            let fromDate = params.from_date || null;
            let toDate = params.to_date || null;
            if (!fromDate || !toDate)
                return response(res, null, 'Yêu cầu không hợp lệ!', statusCode.ERROR);

            fromDate += ' 00:00:00';
            toDate += ' 23:59:59';

            const _match = {};

            _match.billed_at = {
                $lte: new Date(toDate),
                $gte: new Date(fromDate)
            };
            _match.deleted_at = null;

            if (paymentMethod)
                _match.payment_method = paymentMethod;

            let conditions = { deleted_at: null };
            if (classroomIds.length > 0)
                conditions._id = { $in: classroomIds };

            if (subjectIds.length > 0)
                conditions['subject.id'] = { $in: subjectIds };

            const classrooms = await ClassroomModel.find(conditions, '_id name code subject');
            if (classrooms.length == 0)
                return response(res, null, 'Không có môn nào!', statusCode.ERROR);

            const _classroomIds = [];
            const classroomData = {};
            for (let i = 0; i < classrooms.length; i++) {
                _classroomIds.push(classrooms[i]._id);
                classroomData[classrooms[i]._id] = classrooms[i].toObject();
                classroomData[classrooms[i]._id].num_bill = 0;
                classroomData[classrooms[i]._id].total_refund = 0;
                classroomData[classrooms[i]._id].total_revenue = 0;
                classroomData[classrooms[i]._id].total_revenue_cash = 0;
                classroomData[classrooms[i]._id].total_revenue_bank_transfer = 0;
            }
            _match['classroom.id'] = { $in: _classroomIds };
            _match['type'] = 'PT';
            const bills = await BillingItemModel.find(_match);
            if (bills.length > 0) {
                for (let i = 0; i < bills.length; i++) {
                    const bill = bills[i];
                    if (bill.payment_method === 'SSS_BALANCE') continue;

                    if (bill.classroom) {
                        classroomData[bill.classroom.id].total_revenue += bill.total;
                        classroomData[bill.classroom.id].num_bill++;
                    }

                    if (bill.classroom && bill.payment_method === 'CASH')
                        classroomData[bill.classroom.id].total_revenue_cash += bill.total;

                    if (bill.classroom && bill.payment_method !== 'CASH')
                        classroomData[bill.classroom.id].total_revenue_bank_transfer += bill.total;
                }
            }

            const keys = Object.keys(classroomData);
            const _data = [];
            for (let i = 0; i < keys.length; i++) {
                _data.push(classroomData[keys[i]]);
            }

            const data = { report: _data };
            return response(res, data, 'Thành công', statusCode.OK);
        } catch (err) {
            logError(err);
            return response(res, null, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }

    async revenueByStaff(req, res, params) {
        try {
            const staffIds = params.staff_ids || [];
            const paymentMethod = params.payment_method || null;
            let fromDate = params.from_date || null;
            let toDate = params.to_date || null;
            if (!fromDate || !toDate)
                return response(res, null, 'Yêu cầu không hợp lệ!', statusCode.ERROR);

            fromDate += ' 00:00:00';
            toDate += ' 23:59:59';

            const _match = {};

            _match.billed_at = {
                $lte: new Date(toDate),
                $gte: new Date(fromDate)
            };
            _match.deleted_at = null;

            if (paymentMethod)
                _match.payment_method = paymentMethod;

            let staffConditions = { deleted_at: null, user_group: appConfig.USER_GROUP.ACCOUNTANT };
            if (staffIds.length > 0)
                staffConditions._id = { $in: staffIds };

            const accounts = await UserModel.find(staffConditions, '_id fullname code phone');
            if (accounts.length == 0)
                return response(res, null, 'Không có nhân viên thu ngân!', statusCode.ERROR);

            const _staffIds = [];
            const staffInfos = {};
            for (let i = 0; i < accounts.length; i++) {
                _staffIds.push(accounts[i]._id);
                staffInfos[accounts[i]._id] = accounts[i].toObject();
                staffInfos[accounts[i]._id].num_bill = 0;
                staffInfos[accounts[i]._id].total_refund = 0;
                staffInfos[accounts[i]._id].total_revenue = 0;
                staffInfos[accounts[i]._id].total_revenue_cash = 0;
                staffInfos[accounts[i]._id].total_revenue_bank_transfer = 0;
            }

            _match['creator.id'] = { $in: _staffIds };
            _match['type'] = 'PT';
            const bills = await BillingModel.find(_match);
            if (bills.length > 0) {
                for (let i = 0; i < bills.length; i++) {
                    const bill = bills[i];
                    if (bill.payment_method === 'SSS_BALANCE') continue;

                    if (bill.creator) {
                        staffInfos[bill.creator.id].total_revenue += bill.total;
                        staffInfos[bill.creator.id].num_bill++;
                    }

                    if (bill.creator && bill.payment_method === 'CASH')
                        staffInfos[bill.creator.id].total_revenue_cash += bill.total;

                    if (bill.creator && bill.payment_method !== 'CASH')
                        staffInfos[bill.creator.id].total_revenue_bank_transfer += bill.total;
                }
            }

            const keys = Object.keys(staffInfos);
            const _data = [];
            for (let i = 0; i < keys.length; i++) {
                _data.push(staffInfos[keys[i]]);
            }

            const data = { report: _data };
            return response(res, data, 'Thành công', statusCode.OK);
        } catch (err) {
            logError(err);
            return response(res, null, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }

    async revenueBySubject(req, res, params) {
        try {
            const subjectIds = params.subject_ids || [];
            const paymentMethod = params.payment_method || null;
            let fromDate = params.from_date || null;
            let toDate = params.to_date || null;
            if (!fromDate || !toDate)
                return response(res, null, 'Yêu cầu không hợp lệ!', statusCode.ERROR);

            fromDate += ' 00:00:00';
            toDate += ' 23:59:59';

            const _match = {};

            _match.billed_at = {
                $lte: new Date(toDate),
                $gte: new Date(fromDate)
            };
            _match.deleted_at = null;

            if (paymentMethod)
                _match.payment_method = paymentMethod;

            let conditions = { deleted_at: null };
            if (subjectIds.length > 0)
                conditions._id = { $in: subjectIds };

            const subjects = await SubjectModel.find(conditions, '_id name code');
            if (subjects.length == 0)
                return response(res, null, 'Không có môn nào!', statusCode.ERROR);

            const _subjectIds = [];
            const subjectData = {};
            for (let i = 0; i < subjects.length; i++) {
                _subjectIds.push(subjects[i]._id);
                subjectData[subjects[i]._id] = subjects[i].toObject();
                subjectData[subjects[i]._id].num_bill = 0;
                subjectData[subjects[i]._id].total_refund = 0;
                subjectData[subjects[i]._id].total_revenue = 0;
                subjectData[subjects[i]._id].total_revenue_cash = 0;
                subjectData[subjects[i]._id].total_revenue_bank_transfer = 0;
            }
            _match['subject.id'] = { $in: _subjectIds };
            _match['type'] = 'PT';
            const bills = await BillingItemModel.find(_match);
            if (bills.length > 0) {
                for (let i = 0; i < bills.length; i++) {
                    const bill = bills[i];
                    if (bill.payment_method === 'SSS_BALANCE') continue;
                    
                    if (bill.subject) {
                        subjectData[bill.subject.id].total_revenue += bill.total;
                        subjectData[bill.subject.id].num_bill++;
                    }

                    if (bill.subject && bill.payment_method === 'CASH')
                        subjectData[bill.subject.id].total_revenue_cash += bill.total;

                    if (bill.subject && bill.payment_method !== 'CASH')
                        subjectData[bill.subject.id].total_revenue_bank_transfer += bill.total;
                }
            }

            const keys = Object.keys(subjectData);
            const _data = [];
            for (let i = 0; i < keys.length; i++) {
                _data.push(subjectData[keys[i]]);
            }

            const data = { report: _data };
            return response(res, data, 'Thành công', statusCode.OK);
        } catch (err) {
            logError(err);
            return response(res, null, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }
}

module.exports = new ReportController();
