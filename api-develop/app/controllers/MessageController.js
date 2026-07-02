const appConfig = require('../../config/app');
const BaseHelper = require('../helpers/BaseHelper');
const MessageModel = require('../models/Message');
const MessageUserModel = require('../models/MessageUser');
const StudentClassroomModel = require('../models/StudentClassroom');
const UsersModel = require('../models/User');
const OneSignalService = require('../services/OneSignalService');
const language = BaseHelper.fileToJSON(`${__dirname}/../languages/vi.json`);

class MessageController {
    async list(req, res, params) {
        try {
            const keyword = params.keyword || false;
            const page = parseInt(params.page || appConfig.PAGINATION.PAGE);
            const limit = parseInt(params.limit || appConfig.PAGINATION.LIMIT);

            const conditions = { deleted_at: null };

            const options = {
                skip: (page - 1) * limit,
                limit: limit,
                sort: { updated_at: -1 }
            };

            if (keyword) {
                conditions.$or = [
                    { name: { $regex: keyword, $options: 'i' } },
                    { content: { $regex: keyword, $options: 'i' } }
                ];
            }
            if (req.user.user_group === appConfig.USER_GROUP.TEACHER || req.user.user_group === appConfig.USER_GROUP.SUPPORTER) {
                conditions['configs.object_id'] = { $in: req.user.subject_ids };
            }

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

    async my(req, res, params) {
        try {
            const page = parseInt(params.page || appConfig.PAGINATION.PAGE);
            const limit = parseInt(params.limit || appConfig.PAGINATION.LIMIT);
            const options = {
                skip: (page - 1) * limit,
                limit: limit,
                sort: { updated_at: -1 }
            };
            let conditions = {};

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

            let readMessages = [];
            const readMessageIds = [];
            const records = await MessageModel.find(conditions, null, options);
            if (req.user && req.user.user_group == appConfig.USER_GROUP.STUDENT) {
                const read_message_ids = [];
                for (let i = 0; i < records.length; i++) {
                    read_message_ids.push(records[i]._id);
                }


                conditions = {};
                conditions['receiver.id'] = req.user.user_id;
                conditions['message.id'] = { $in: read_message_ids };
                conditions.is_read = true;
                conditions.deleted_at = null;
                readMessages = await MessageUserModel.find(conditions);
                for (let i = 0; i < readMessages.length; i++) {
                    readMessageIds.push(readMessages[i].message.id);
                }
            }

            const total = await MessageModel.count(conditions);
            const data = {
                records,
                readMessages,
                readMessageIds,
                totalRecord: total,
                perPage: limit
            };

            return response(res, data, 'Thành công', statusCode.OK);
        } catch (err) {
            logError(err);
            console.log(err);
            return response(res, null, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }

    async newMy(req, res, params) {
        // Lấy danh sách message user như cũ
        const listNoti = await MessageUserModel.find(
            { 'receiver.id': req.user.user_id, deleted_at: null },
            null,
            { sort: { created_at: -1 } }
        );
        // Lấy toàn bộ message id để filter message bị xóa
        const messageIds = listNoti.map(item => item.message && item.message.id).filter(Boolean);
        // Lấy thông tin các message chưa bị xóa
        const activeMessages = await MessageModel.find({ _id: { $in: messageIds }, deleted_at: null });
        const activeMessageIdSet = new Set(activeMessages.map(msg => String(msg._id)));
        // Filter lại các bản ghi message user dựa theo message còn hoạt động
        const records = listNoti.filter((item) => activeMessageIdSet.has(item.message && String(item.message.id)))
            .map((item) => {
                return {
                    name: item.message.name,
                    created_at: item.created_at,
                    is_read: item.is_read,
                    _id: item.message.id,
                    message_user_id: item._id
                }
            });
        const data = {
            records
        }
        return response(res, data, 'Thành công', statusCode.OK);
    }

    async totalUnread(req, res) {
        try {
            const conditions = {};
            conditions['receiver.id'] = req.user.user_id;
            conditions.is_read = false;
            conditions.deleted_at = null;
            // Lấy danh sách message user chưa đọc
            const listNoti = await MessageUserModel.find(conditions);
            // Lấy toàn bộ message id để filter message bị xóa
            const messageIds = listNoti.map(item => item.message && item.message.id).filter(Boolean);
            // Lấy thông tin các message chưa bị xóa
            const activeMessages = await MessageModel.find({ _id: { $in: messageIds }, deleted_at: null });
            const activeMessageIdSet = new Set(activeMessages.map(msg => String(msg._id)));
            // Filter lại các bản ghi message user dựa theo message còn hoạt động và đếm
            const total = listNoti.filter((item) => activeMessageIdSet.has(item.message && String(item.message.id))).length;
            return response(res, total, 'Thành công', statusCode.OK);
        } catch (err) {
            logError(err);
            return response(res, null, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }

    async detail(req, res, params) {
        try {
            const { id, message_user_id } = params;
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
            if (req.user.user_group === appConfig.USER_GROUP.STUDENT) {
                conditions = {};
                conditions['receiver.id'] = req.user.user_id;
                conditions['message.id'] = data._id;
                conditions['_id'] = message_user_id;
                conditions.deleted_at = null;
                const _rs = await MessageUserModel.findOne(conditions);
                if (!_rs) {
                    return response(res, null, 'Đã xảy ra lỗi', statusCode.ERROR);
                }
                await MessageUserModel.updateOne(conditions, { $set: { is_read: true } });
            }
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

    async send(req, res, params) {
        try {
            const { id } = params;
            const osnAccount = params.osn_app || 1;
            if (!id)
                return response(res, null, 'Request không hợp lệ!', statusCode.ERROR);

            const message = await MessageModel.findOne({ _id: id });
            if (!message)
                return response(res, null, 'Thông báo này không tồn tại!', statusCode.ERROR);

            const configs = message.configs || null;
            const filters = [];
            if (configs && configs.send_type === 'CLASSROOM' && configs.object_id.length > 0) {
                for (let cid = 0; cid < configs.object_id.length; cid++) {
                    const _filter = {
                        field: 'tag',
                        key: configs.object_id[cid],
                        relation: 'exists'
                    };
                    filters.push(_filter);
                }
            }

            const heading = "Thông báo";
            let appURL = 'myapp://root/home/home-navigation/notification/' + id;
            if (osnAccount === 2)
                appURL = 'myapp://notification/' + id;
            const platformMsgID = await OneSignalService.sendNotification(heading, message.content, null, filters, null, appURL, osnAccount);
            if (platformMsgID) {
                await MessageModel.updateOne({ _id: id }, { $set: { platform_msg_id: platformMsgID, app_url: appURL, web_url: null } });
                return response(res, {}, 'Thành công', statusCode.OK);
            }
            return response(res, null, 'Không gửi được thông báo!', statusCode.ERROR);
        } catch (err) {
            logError(err);
            return response(res, {}, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }

    async newSend(_req, res, params) {
        const { id } = params;
        if (!id) {
            return response(res, null, 'Request không hợp lệ!', statusCode.ERROR);
        }
        const message = await MessageModel.findOne({ _id: id })
        if (!message) {
            return response(res, null, 'Thông báo này không tồn tại!', statusCode.ERROR);
        }
        const configs = message.configs;
        if (configs['send_type'] === 'ALL') {
            const listStudent = await UsersModel.find({
                status: "ACTIVE",
                user_group: appConfig.USER_GROUP.STUDENT
            });
            for (let i = 0; i < listStudent.length; i++) {
                const userMessage = {
                    receiver: { id: listStudent[i]._id, name: listStudent[i].fullname, code: listStudent[i].code },
                    message: { id: message._id, name: message.name },
                    is_read: false,
                    deleted_at: null
                }
                // coding send noti to user here ...
                await MessageUserModel.create(userMessage);
                await MessageModel.updateOne({ _id: id }, { status: 'SENT' })
            }
            return response(res, {}, 'Thành công', statusCode.OK);
        }
        if (configs['send_type'] === 'CLASSROOM') {
            const classes = configs['object_id'];
            const listStudents = await StudentClassroomModel.find({
                "classroom.id": { $in: classes },
                deleted_at: null
            });
            for (let i = 0; i < listStudents.length; i++) {
                const userMessage = {
                    receiver: { id: listStudents[i].user.id, name: listStudents[i].user.name, code: listStudents[i].user.code },
                    message: { id: message._id, name: message.name },
                    is_read: false,
                    deleted_at: null
                }
                // coding send noti to user here ...
                await MessageUserModel.create(userMessage);
                await MessageModel.updateOne({ _id: id }, { status: 'SENT' })
            }
            return response(res, {}, 'Thành công', statusCode.OK);
        }
        return response(res, null, 'Không gửi được thông báo!', statusCode.ERROR);
    }

    async update(req, res, params) {
        try {
            const {
                id,
                name,
                content,
                configs,
                buttons
            } = params;
            if (!id)
                return response(res, null, 'Request không hợp lệ!', statusCode.ERROR);
            const message = await MessageModel.findOne({ _id: id });
            if (!message)
                return response(res, null, 'Thông báo này không tồn tại!', statusCode.ERROR);
            const docNotify = {};
            if (name)
                docNotify.name = name;
            if (name)
                docNotify.content = content;
            if (name)
                docNotify.configs = configs;

            if (buttons)
                docNotify.buttons = buttons;

            const rs = await MessageModel.updateOne({ _id: id }, { $set: docNotify });
            if (rs.nModified) {
                return response(res, {}, 'Thành công', statusCode.OK);
            }
        } catch (err) {
            logError(err);
            return response(res, {}, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }

    async delete(req, res, params) {
        try {
            const { ids } = params || [];
            if (ids.length == 0)
                return response(res, null, 'Request không hợp lệ!', statusCode.ERROR);

            const rs = await MessageModel.softDelete({ _id: { $in: ids } }, true);
            if (rs)
                return response(res, {}, 'Thành công', statusCode.OK);
            return response(res, null, language.ERROR, statusCode.ERROR);
        } catch (err) {
            logError(err);
            return response(res, null, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }
}

module.exports = new MessageController();
