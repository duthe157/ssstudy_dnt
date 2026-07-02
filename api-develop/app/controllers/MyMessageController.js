const appConfig = require('../../config/app');
const BaseHelper = require('../helpers/BaseHelper');
const MessageModel = require('../models/Message');
const MessageUserModel = require('../models/MessageUser');
const StudentClassroomModel = require('../models/StudentClassroom');
const language = BaseHelper.fileToJSON(`${__dirname}/../languages/vi.json`);

class MyMessageController {
    async list(req, res, params) {
        try {
            const page = parseInt(params.page || appConfig.PAGINATION.PAGE);
            const limit = parseInt(params.limit || appConfig.PAGINATION.LIMIT);
            const keyword = params.keyword || null;
            const options = {
                skip: (page - 1) * limit,
                limit: limit,
                sort: { updated_at: -1 }
            };
            const conditions = {};

            let arrayClassroomID = [];
            if (req.user.user_group === appConfig.USER_GROUP.STUDENT) {
                const userClassrooms = await StudentClassroomModel.find({ 'user.id': req.user.user_id, deleted_at: null });
                arrayClassroomID = [];
                for (let i = 0; i < userClassrooms.length; i++) {
                    arrayClassroomID.push(userClassrooms[i].classroom.id);
                }
            }

            conditions.$or = [
                { 'configs.send_type': 'ALL' },
                {
                    'configs.object_id': {
                        $in: [req.user.user_id]
                    }
                },
                {
                    'configs.object_id': {
                        $in: arrayClassroomID
                    }
                }
            ];

            if (keyword)
                conditions.alias = { $regex: keyword, $options: 'i' };

            const records = await MessageModel.find(conditions, null, options);
            const total = await MessageModel.count(conditions);
            const data = {
                records,
                totalRecord: total,
                perPage: limit
            };

            return response(res, data, 'Thành công', statusCode.OK);
        } catch (err) {
            logError(err);
            return response(res, null, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }

    async totalUnread(req, res) {
        try {
            const conditions = {};
            conditions['receiver.id'] = req.user.user_id;
            conditions.is_read = false;
            conditions.deleted_at = null;
            const total = await MessageUserModel.count(conditions);
            return response(res, total, 'Thành công', statusCode.OK);
        } catch (err) {
            logError(err);
            return response(res, null, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }

    async detail(req, res, params) {
        try {
            const { id } = params;
            const platformMsgID = params.platform_msg_id || null;
            let conditions = {};
            if (req.user.user_group === appConfig.USER_GROUP.STUDENT) {
                if (id) {
                    conditions = { _id: id };
                } else {
                    conditions = { platform_msg_id: platformMsgID };
                }
            } else {
                conditions = { _id: id };
            }
            conditions.deleted_at = null;
            const rs = await MessageModel.findOne(conditions);
            if (!rs)
                return response(res, null, 'Thông báo không tồn tại!', statusCode.ERROR);
            const data = rs.toObject();
            data.description = data.content;
            return response(res, data, 'Thành công', statusCode.OK);
        } catch (err) {
            logError(err);
            return response(res, null, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }

    async create(req, res, params) {
        try {
            const { name, content, configs, buttons } = params;
            const group = params.group || 'DEFAULT';
            if (!name)
                return response(res, null, 'Request không hợp lệ!', statusCode.ERROR);
            const docNotify = {
                name: name,
                content: content,
                group: group,
                configs: configs
            };

            if (buttons)
                docNotify.buttons = buttons;
            docNotify.status = 'PENDING';

            const notify = await MessageModel.create(docNotify);
            if (!notify)
                return response(res, {}, language.ERROR, statusCode.ERROR);

            return response(res, notify, 'Thành công', statusCode.OK);
        } catch (err) {
            logError(err);
            return response(res, {}, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }
}

module.exports = new MyMessageController();
