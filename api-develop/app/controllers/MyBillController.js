const fs = require('fs');
const appConfig = require('../../config/app');
const BaseHelper = require('../helpers/BaseHelper');
const BillingModel = require('../models/Billing');
const UserModel = require('../models/User');
const language = BaseHelper.fileToJSON(`${__dirname}/../languages/vi.json`);
class MyBillController {
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

            if (sortKey && (sortValue == 1 || sortValue == -1)) {
                options.sort = {};
                options.sort[sortKey] = sortValue;
            }

            if (keyword) {
                const _user = await UserModel.findOne({ phone: keyword });
                conditions.$or = [
                    { 'user.code': { $regex: keyword, $options: 'i' } }
                ];

                if (_user) {
                    conditions.$or.push({ 'user.code': { $regex: _user.code, $options: 'i' } });
                } else {
                    conditions.$or.push({ 'user.code': { $regex: keyword, $options: 'i' } });
                }

                conditions.$or.push({
                    code: parseInt(keyword)
                })
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

            if (req.user.user_group === appConfig.USER_GROUP.STUDENT) {
                conditions['user.id'] = req.user.user_id;
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
}

module.exports = new MyBillController();
