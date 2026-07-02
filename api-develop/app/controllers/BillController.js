const fs = require('fs');
const appConfig = require('../../config/app');
const BaseHelper = require('../helpers/BaseHelper');
const ClassroomModel = require('../models/Classroom');
const BillingModel = require('../models/Billing');
const BillingItemModel = require('../models/BillingItem');
const BillingHistoryModel = require('../models/BillingHistory');
const UserModel = require('../models/User');
const StudentClassroomModel = require('../models/StudentClassroom');
const ClassroomService = require('../services/ClassroomService');
const OrderService = require('../services/OrderService');
const BillingService = require('../services/BillingService');
const language = BaseHelper.fileToJSON(`${__dirname}/../languages/vi.json`);
class BillController {
    async list(req, res, params) {
        try {
            const keyword = params.keyword || false;
            const page = parseInt(params.page || appConfig.PAGINATION.PAGE);
            const limit = parseInt(params.limit || appConfig.PAGINATION.LIMIT);
            let billFromDate = params.bill_from_date || null;
            let billToDate = params.bill_to_date || null;
            const subjectID = params.subject_id || null;
            const classroomID = params.classroom_id || null;
            const paymentMethod = params.payment_method || null;
            const type = params.type || null;
            if (billFromDate) {
                billFromDate += ' 00:00:00';
                billFromDate = new Date(billFromDate);
            }

            if (billToDate) {
                billToDate += ' 23:59:59';
                billToDate = new Date(billToDate);
            }

            const conditions = {};

            if (!type)
                conditions.type = 'PT';
            else
                conditions.type = type;

            const options = {
                skip: (page - 1) * limit,
                limit: limit,
                sort: { updated_at: -1 }
            };

            const sortKey = params.sort_key || null;
            const sortValue = params.sort_value || null;
            const sortKeys = [
                'code',
                'user.id',
                'creator.id',
                'subtotal',
                'total',
                'type',
                'pay_type',
                'payment_method',
                'billed_at',
                'status',
                'updated_at'
            ];
            if (sortKey && (sortValue == 1 || sortValue == -1)) {
                options.sort = {};
                options.sort[sortKey] = sortValue;
            }

            if (keyword) {
                const _user = await UserModel.findOne({ phone: keyword });
                conditions.$or = [
                    { 'user.code': { $regex: keyword, $options: 'i' } },
                    { 'user.name': { $regex: keyword, $options: 'i' } },
                    { 'user.phone': { $regex: keyword, $options: 'i' } }
                ];

                if (_user) {
                    conditions.$or.push({ 'user.code': { $regex: _user.code, $options: 'i' } });
                } else {
                    conditions.$or.push({ 'user.code': { $regex: keyword, $options: 'i' } });
                }

                const keywordNumber = parseInt(keyword);
                if (!Number.isNaN(keywordNumber)) {
                    conditions.$or.push({ code: keywordNumber });
                }
            }
            if (billFromDate && !billToDate) {
                conditions.billed_at = { $gte: billFromDate };
            }

            if (billToDate && !billFromDate) {
                conditions.billed_at = { $lte: billToDate };
            }

            if (billToDate && billFromDate) {
                conditions.billed_at = {
                    $gte: billFromDate,
                    $lte: billToDate
                };
            }

            if (subjectID)
                conditions.subject_id = subjectID;

            if (paymentMethod)
                conditions.payment_method = paymentMethod;

            if (classroomID) {
                conditions.items = {
                    $elemMatch: {
                        id: classroomID
                    }
                }
            }

            // Mặc định loại trừ bill có order.type = QUICK_PAYMENT (bill có order null vẫn được giữ).
            const orderTypeFilter = {
                $or: [
                    { order: null },
                    { order: { $exists: false } },
                    { 'order.type': { $ne: 'QUICK_PAYMENT' } }
                ]
            };
            if (conditions.$or) {
                conditions.$and = (conditions.$and || []).concat([{ $or: conditions.$or }, orderTypeFilter]);
                delete conditions.$or;
            } else {
                conditions.$or = orderTypeFilter.$or;
            }

            if (req.user.user_group === appConfig.USER_GROUP.STUDENT) {
                conditions['user.id'] = req.user.user_id;
            }

            if (req.user.user_group === appConfig.USER_GROUP.TEACHER && subjectID) {
                if (req.user.user_group === appConfig.USER_GROUP.TEACHER) {
                    if (req.user.subject_ids.indexOf(subjectID) < 0)
                        return response(res, null, 'Không có quyền truy cập!', statusCode.ERROR);
                }
            }

            const records = await BillingModel.find(conditions, null, options);
            const total = await BillingModel.count(conditions);
            const userIds = [];
            let userInfos = {};
            for (let i = 0; i < records.length; i++) {
                if (userIds.indexOf(records[i].user.id) < 0)
                    userIds.push(records[i].user.id);
                userInfos[records[i].user.id] = {};
            }
            const _userInfos = await UserModel.find({ _id: { $in: userIds } });

            for (let i = 0; i < _userInfos.length; i++) {
                userInfos[_userInfos[i]._id] = {
                    code: _userInfos[i].code,
                    phone: _userInfos[i].phone,
                    fullname: _userInfos[i].fullname
                };
            }
            const data = {
                records,
                totalRecord: total,
                perPage: limit,
                userInfos
            };
            return response(res, data, 'Thành công', statusCode.OK);
        } catch (err) {
            logError(err);
            return response(res, null, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }

    async listHistory(req, res, params) {
        try {
            const keyword = params.keyword || false;
            const page = parseInt(params.page || appConfig.PAGINATION.PAGE);
            const limit = parseInt(params.limit || appConfig.PAGINATION.LIMIT);
            let fromDate = params.from_date || null;
            let toDate = params.to_date || null;
            const billingID = params.billing_id || null;
            const paymentMethod = params.payment_method || null;

            if (fromDate) {
                fromDate += ' 00:00:00';
                fromDate = new Date(fromDate);
            }

            if (toDate) {
                toDate += ' 23:59:59';
                toDate = new Date(toDate);
            }

            const conditions = {};

            const options = {
                skip: (page - 1) * limit,
                limit: limit,
                sort: { updated_at: -1 }
            };

            if (keyword) {
                conditions.$or = [
                    { 'note': { $regex: keyword, $options: 'i' } }
                ];
            }

            if (fromDate && !toDate) {
                conditions.created_at = { $gte: fromDate };
            }

            if (toDate && !fromDate) {
                conditions.created_at = { $lte: toDate };
            }

            if (toDate && fromDate) {
                conditions.billed_at = {
                    $gte: fromDate,
                    $lte: toDate
                };
            }

            if (billingID)
                conditions.billing_id = billingID;

            if (paymentMethod)
                conditions.payment_method = paymentMethod;

            const records = await BillingHistoryModel.find(conditions, null, options);
            const total = await BillingHistoryModel.count(conditions);
            const data = {
                records,
                totalRecord: total,
                perPage: limit,
            };
            return response(res, data, 'Thành công', statusCode.OK);
        } catch (err) {
            logError(err);
            return response(res, null, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }

    async exportExcel(req, res, params) {
        try {
            if (req.user.user_group !== appConfig.USER_GROUP.ADMIN)
                return response(res, null, language.SCOPE_INVALID, statusCode.FORBIDDEN);

            let fromDate = params.from_date || null;
            let toDate = params.to_date || null;
            if (!fromDate || !toDate)
                return response(res, null, 'Vui lòng chọn ngày bắt đầu và ngày kết thúc. Thời gian tối đa 90 ngày cho 1 lần Export', statusCode.ERROR);

            fromDate = new Date(fromDate);
            fromDate = BaseHelper.firstDay(fromDate);

            toDate = new Date(toDate);
            toDate = BaseHelper.lastDay(toDate);

            const day = BaseHelper.diffDateDay(fromDate, toDate);
            if (day > 90)
                return response(res, null, 'Thời gian tối đa 90 ngày cho 1 lần Export', statusCode.ERROR);

            const fileName = await BillingService.exportBilling(fromDate, toDate);
            const streamFile = fs.readFileSync('./temp/excel/' + fileName);
            download(res, streamFile, fileName, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        } catch (err) {
            logError(err);
        }
    }

    async detail(req, res, params) {
        try {
            const { id } = params;

            let conditions = { _id: id };
            if (req.user.user_group === appConfig.USER_GROUP.STUDENT) {
                conditions['user.id'] = req.user.user_id;
            }

            let rs = await BillingModel.findOne(conditions);
            rs = rs.toObject();
            const user = await UserModel.findOne({ _id: rs.user.id });
            rs.user_info = user;
            if (req.user.user_group != appConfig.USER_GROUP.STUDENT) {
                conditions = {
                    'user.id': rs.user.id,
                    deleted_at: null
                };
                const options = {
                    skip: 0,
                    limit: 10,
                    sort: { created_at: -1 }
                };
                const other_bills = await BillingModel.find(conditions, null, options);
                if (other_bills)
                    rs.other_bills = other_bills;
            }

            return response(res, rs, 'Thành công', statusCode.OK);
        } catch (err) {
            logError(err);
            return response(res, null, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }

    async create(req, res, params) {
        try {
            const userID = params.user_id || null;
            let items = params.items || [];
            const payType = params.pay_type || 'DAY';
            const billedAt = params.billed_at || new Date();
            const type = params.type || 'PT';
            const subtotal = params.subtotal || 0;
            const total = params.total || 0;
            const note = params.note || null;
            let _totalItemDiscount = 0;
            const paymentMethod = params.payment_method || 'CASH';

            const user = await UserModel.findOne({ _id: userID });
            if (!user)
                return response(res, null, 'Học sinh không tồn tại', statusCode.ERROR);

            if (items.length > 0) {
                for (let i = 0; i < items.length; i++) {
                    if (items[i].discount_type && items[i].discount_value > 0) {
                        if (items[i].discount_type === 'PERCENT' || items[i].discount_vnd == 0) {
                            items[i].discount = (items[i].discount_value * items[i].price * items[i].qty) / 100;
                        } else {
                            items[i].discount = items[i].discount_vnd;
                            items[i].discount_type = 'FIXED';
                        }
                    } else {
                        items[i].discount_type = 'PERCENT';
                        items[i].discount_value = 0;
                        items[i].discount = 0;
                    }

                    _totalItemDiscount += items[i].discount;
                }
            }

            const docBill = {
                user: { id: user.id, name: user.fullname, code: user.code },
                creator: { id: req.user.user_id, name: req.user.fullname, code: req.user.code },
                items: items,
                discount: _totalItemDiscount,
                subtotal: subtotal,
                total: total,
                type,
                payment_method: paymentMethod,
                pay_type: payType,
                billed_at: billedAt,
                note
            };

            const bill = await OrderService.createBill(docBill);
            if (!bill)
                return response(res, {}, language.ERROR, statusCode.ERROR);

            try {
                // Ghi lich su tao bill thanh cong
                let _historyNote = '';
                _historyNote += 'Tạo phiếu thu #' + bill.code;
                _historyNote += ' - Nội dung: ';
                _historyNote += ', Chiết khấu: ' + _totalItemDiscount;
                _historyNote += ', Tổng tiền: ' + subtotal;
                _historyNote += ', Thanh toán: ' + total;

                const docBillHistory = {
                    billing_id: bill.id,
                    creator: { id: req.user.user_id, code: req.user.code, name: req.user.fullname },
                    note: _historyNote
                };

                OrderService.createBillHistory(docBillHistory);
            } catch (err) { }

            if (items.length > 0) {
                for (let i = 0; i < items.length; i++) {
                    items[i].item_id = items[i].id;
                    const classroom = await ClassroomModel.findOne({ _id: items[i].id });
                    const subtotalItem = items[i].qty * items[i].price;
                    const docBillingItem = {
                        billing_id: bill.id,
                        user: { id: user.id, name: user.fullname, code: user.code },
                        creator: { id: req.user.user_id, name: req.user.fullname, code: req.user.code },
                        subject: classroom.subject,
                        classroom: { id: classroom.id, name: classroom.name, code: classroom.code },
                        qty: items[i].qty,
                        price: items[i].price,
                        payment_method: paymentMethod,
                        type: type,
                        subtotal: subtotalItem,
                        discount_type: items[i].discount_type,
                        discount_value: items[i].discount_value,
                        discount: items[i].discount,
                        total: (subtotalItem - items[i].discount),
                        billed_at: billedAt
                    };

                    try {
                        const billItem = await BillingItemModel.findOne({ billing_id: bill.id, 'user.id': user.id, 'classroom.id': classroom.id, deleted_at: null });
                        if (billItem)
                            await BillingItemModel.updateOne({ _id: billItem.id }, { $set: docBillingItem });
                        else
                            await BillingItemModel.create(docBillingItem);
                    } catch (err) {
                        logError(err);
                        // console.log('BillingItemModel' + JSON.stringify(err));
                        return response(res, bill, 'Lỗi tạo Billing Item', statusCode.ERROR);
                    }

                    // Them hoc sinh vao lop
                    ClassroomService.updateUserToClassroom(items[i], bill, docBillingItem, 0);
                }
            }

            return response(res, bill, 'Thành công', statusCode.OK);
        } catch (err) {
            logError(err);
            // console.log('CreateFunction: ' + JSON.stringify(err));
            return response(res, {}, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }

    async update(req, res, params) {
        try {
            const userID = params.user_id || null;
            const id = params.id || null;
            const items = params.items || [];
            const payType = params.pay_type || 'DAY';
            const billedAt = params.billed_at || new Date();
            const type = params.type || 'PT';
            const discount = params.discount || 0;
            const subtotal = params.subtotal || 0;
            const total = params.total || 0;
            const note = params.note || null;
            let _totalItemDiscount = 0;
            const paymentMethod = params.payment_method || 'CASH';

            if (!id)
                return response(res, null, 'Request không hợp lệ!', statusCode.ERROR);

            const bill = await BillingModel.findOne({ _id: id });
            if (!bill)
                return response(res, {}, 'Phiếu này không tồn tại', statusCode.ERROR);

            if (bill.deleted_at)
                return response(res, {}, 'Phiếu này đã bị hủy. Bạn không thể cập nhật trên phiếu thu này!', statusCode.ERROR);

            const billItemIds = [];
            const billItemClassroomID = [];
            const removeClassroomID = [];
            const billItems = await BillingItemModel.find({ billing_id: bill.id });

            // Lay ca classroom ID va id cua bill items hien tai
            for (let i = 0; i < billItems.length; i++) {
                if (billItemIds.indexOf(billItems[i].id) < 0)
                    billItemIds.push(billItems[i].id);

                if (billItems[i].classroom && billItemClassroomID.indexOf(billItems[i].classroom.id) < 0)
                    billItemClassroomID.push(billItems[i].classroom.id);
            }

            // Tao mang classroom ID se duoc them vao
            const classroomItemID = [];
            if (items.length > 0) {
                for (let i = 0; i < items.length; i++) {
                    if (classroomItemID.indexOf(items[i].id) < 0)
                        classroomItemID.push(items[i].id);
                }
            }

            // Lay ra nhung classroomID can phai xoa
            for (let i = 0; i < billItemClassroomID.length; i++) {
                if (classroomItemID.indexOf(billItemClassroomID[i]) < 0)
                    removeClassroomID.push(billItemClassroomID[i]);
            }

            const user = await UserModel.findOne({ _id: userID });
            if (!user)
                return response(res, null, 'Học sinh không tồn tại', statusCode.ERROR);

            if (items.length > 0) {
                for (let i = 0; i < items.length; i++) {
                    const _itemDiscountValue = (items[i].discount_value) ? parseFloat(items[i].discount_value) : 0;

                    if (items[i].discount_type === 'PERCENT') {
                        items[i].discount = (_itemDiscountValue * items[i].price * items[i].qty) / 100;
                    } else {
                        items[i].discount = _itemDiscountValue;
                        items[i].discount_type = 'FIXED';
                        items[i].discount_value = _itemDiscountValue;
                    }

                    _totalItemDiscount += items[i].discount;
                }
            }

            if (items)
                bill.items = items;

            if (payType)
                bill.pay_type = payType;

            if (type)
                bill.type = type;

            if (total !== undefined && total !== null)
                bill.total = total;

            if (subtotal !== undefined && subtotal !== null)
                bill.subtotal = subtotal;

            if (note !== undefined && note !== null)
                bill.note = note;

            if (discount !== undefined && discount !== null)
                bill.discount = _totalItemDiscount;

            if (paymentMethod)
                bill.payment_method = paymentMethod;

            const rs = await BillingModel.updateOne({ _id: bill.id }, bill);
            if (rs.nModified) {
                if (items.length > 0) {
                    for (let i = 0; i < items.length; i++) {
                        const classroom = await ClassroomModel.findOne({ _id: items[i].id });
                        if (!classroom)
                            continue;
                        const subtotalItem = items[i].qty * items[i].price;
                        const docBillingItem = {
                            billing_id: bill.id,
                            user: { id: user.id, name: user.fullname, code: user.code },
                            subject: classroom.subject,
                            classroom: { id: classroom.id, name: classroom.name, code: classroom.code },
                            qty: items[i].qty,
                            price: items[i].price,
                            payment_method: paymentMethod,
                            type: type,
                            subtotal: items[i].qty * items[i].price,
                            discount_type: items[i].discount_type,
                            discount_value: items[i].discount_value,
                            discount: items[i].discount,
                            total: (subtotalItem - items[i].discount)
                        };

                        let oldQTY = 0;
                        let billItem = await BillingItemModel.findOne({ billing_id: bill.id, 'user.id': user.id, 'classroom.id': classroom.id, deleted_at: null });
                        if (billItem) {
                            oldQTY = billItem.qty;
                            await BillingItemModel.updateOne({ _id: billItem.id }, { $set: docBillingItem });
                        } else {
                            docBillingItem.billed_at = bill.billed_at;
                            billItem = await BillingItemModel.create(docBillingItem);
                        }
                        // Them hoc sinh vao lop
                        ClassroomService.updateUserToClassroom(items[i], bill, docBillingItem, oldQTY);
                    }
                }

                // Dau ra co classroom id can xoa va billing_id
                await StudentClassroomModel.softDelete({ 'classroom.id': { $in: removeClassroomID }, 'user.id': user.id }, true);
                await BillingItemModel.softDelete({ billing_id: id, 'classroom.id': { $in: removeClassroomID }, 'user.id': user.id }, true);

                try {
                    // Ghi lich su tao bill thanh cong

                    let _historyNote = '';
                    _historyNote += 'Cập nhật phiếu thu #' + bill.code;
                    _historyNote += ' - Nội dung: ';
                    _historyNote += ', Chiết khấu: ' + bill.discount;
                    _historyNote += ', Tổng tiền: ' + bill.subtotal;
                    _historyNote += ', Thanh toán: ' + bill.total;

                    const docBillHistory = {
                        billing_id: bill.id,
                        creator: { id: req.user.user_id, code: req.user.code, name: req.user.fullname },
                        note: _historyNote
                    };
                    BillingHistoryModel.create(docBillHistory);
                } catch (err) {
                    logError(err);
                    // console.log('Tao history:' + JSON.stringify(err));
                }

                return response(res, bill, 'Thành công', statusCode.OK);
            }

            return response(res, null, language.ERROR, statusCode.ERROR);
        } catch (err) {
            logError(err);
            return response(res, {}, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }

    async report(req, res, params) {
        try {
            const subjectID = params.subject_id || null;
            const creatorID = params.creator_id || null;
            const paymentMethod = params.payment_method || null;
            const type = params.type || 'BY_SUBJECT';
            let fromDate = params.from_date || null;
            let toDate = params.to_date || null;
            if (type === 'BY_SUBJECT' && !subjectID)
                return response(res, null, 'Vui lòng chọn môn!', statusCode.ERROR);

            if (type === 'BY_ACCOUNTANT' && !creatorID)
                return response(res, null, 'Vui lòng chọn một thu ngân!', statusCode.ERROR);

            if (!fromDate || !toDate)
                return response(res, null, 'Yêu cầu không hợp lệ!', statusCode.ERROR);

            fromDate += ' 00:00:00';
            toDate += ' 23:59:59';

            if (req.user.user_group === appConfig.USER_GROUP.TEACHER) {
                if (req.user.subject_ids.indexOf(subjectID) < 0)
                    return response(res, null, 'Không có quyền truy cập!', statusCode.ERROR);
            }

            let data = [];
            const _match = {};

            _match.billed_at = {
                $lte: new Date(toDate),
                $gte: new Date(fromDate)
            };
            _match.deleted_at = null;

            if (paymentMethod)
                _match.payment_method = paymentMethod;

            if (type === 'BY_SUBJECT') {
                _match['subject.id'] = subjectID;
                const aggregate = [
                    {
                        $match: _match
                    },
                    { $group: { _id: '$classroom', total: { $sum: '$total' } } },
                    { $sort: { total: 1 } }
                ];
                data = await BillingItemModel.aggregate(aggregate);
            }

            if (type === 'BY_ACCOUNTANT') {
                _match['creator.id'] = creatorID;
                const aggregate = [
                    {
                        $match: _match
                    },
                    { $group: { _id: '$creator', total: { $sum: '$total' } } },
                    { $sort: { total: 1 } }
                ];
                data = await BillingModel.aggregate(aggregate);
            }

            return response(res, data, 'Thành công', statusCode.OK);
        } catch (err) {
            logError(err);
            return response(res, null, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }

    async delete(req, res, params) {
        try {
            const { ids } = params || [];
            if (ids.length == 0)
                return response(res, null, 'Request không hợp lệ!', statusCode.ERROR);

            const rs = await BillingModel.softDelete({ _id: { $in: ids } }, true);
            if (rs) {
                const items = await BillingItemModel.find({ billing_id: { $in: ids } });
                for (let i = 0; i < items.length; i++) {
                    // Cập nhật lại số buổi cho học sinh. Tức là trừ số buổi của phiếu thu đã xóa.
                    // await StudentClassroomModel.softDelete({ 'classroom.id': items[i].classroom.id, 'user.id': items[i].user.id });
                    try {
                        const _userClassroom = await StudentClassroomModel.findOne({ 'classroom.id': items[i].classroom.id, 'user.id': items[i].user.id, deleted_at: null });
                        if (_userClassroom) {
                            if (_userClassroom.sobuoihoc && _userClassroom.sobuoihoc > 0) {
                                const _doc = {
                                    sobuoihoc: _userClassroom.sobuoihoc - parseInt(items[i].qty)
                                }
                                const rs1 = await StudentClassroomModel.updateOne({ _id: _userClassroom.id }, { $set: _doc });
                                // console.log(JSON.stringify(rs1));
                            }
                        }
                    } catch (err) {
                        logError(err);
                        continue;
                    }
                }

                await BillingItemModel.softDelete({ billing_id: { $in: ids } }, true);

                try {
                    // Ghi lich su tao bill thanh cong
                    const docBillHistory = {
                        billing_id: bill.id,
                        creator: { id: req.user.user_id, code: req.user.code, name: req.user.fullname },
                        note: 'Xóa phiếu thu - ND: ' + JSON.stringify(ids)
                    };
                    BillingHistoryModel.create(docBillHistory);
                } catch (err) {
                    logError(err);
                }

                return response(res, {}, 'Thành công', statusCode.OK);
            }
            return response(res, null, language.ERROR, statusCode.ERROR);
        } catch (err) {
            logError(err);
            return response(res, null, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }
}

module.exports = new BillController();
