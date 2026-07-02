const appConfig = require('../../config/app');
const BaseHelper = require('../helpers/BaseHelper');
const SubjectModel = require('../models/Subject');
const UserModel = require('../models/User');
const language = BaseHelper.fileToJSON(`${__dirname}/../languages/vi.json`);

class SubjectController {
    async listPublic(req, res, params) {
        try {
            const keyword = params.keyword || false;
            const page = parseInt(params.page || appConfig.PAGINATION.PAGE);
            const limit = parseInt(params.limit || appConfig.PAGINATION.LIMIT);
            const isOnline = params.is_online;
            const status = params.status || true;

            const conditions = { deleted_at: null };

            const options = {
                skip: (page - 1) * limit,
                limit: limit,
                sort: { ordering: 1 }
            };

            if (keyword) {
                const alias = BaseHelper.seoURL(keyword);
                conditions.alias = { $regex: alias, $options: 'i' };
            }

            if (isOnline === true || isOnline === false)
                conditions.is_online = isOnline;

            if (status === true || status === false)
                conditions.status = status;

            const records = await SubjectModel.find(conditions, null, options);
            const total = await SubjectModel.count(conditions);
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

    async list(req, res, params) {
        const { sort_key, sort_value } = params;
        const sortField = sort_key || 'updated_at';
        try {
            const keyword = params.keyword || false;
            const page = parseInt(params.page || appConfig.PAGINATION.PAGE);
            const limit = parseInt(params.limit || appConfig.PAGINATION.LIMIT);
            const isOnline = params.is_online;
            const status = params.status;

            const conditions = { deleted_at: null };

            const options = {
                skip: (page - 1) * limit,
                limit: limit,
                sort: { [sortField]: sort_value }
            };

            if (keyword) {
                const alias = BaseHelper.seoURL(keyword);
                conditions.alias = { $regex: alias, $options: 'i' };
            }

            if (req.user?.user_group === appConfig.USER_GROUP.TEACHER) {
                conditions._id = { $in: req.user.subject_ids };
            }

            if (isOnline === true || isOnline === false)
                conditions.is_online = isOnline;

            if (status === true || status === false)
                conditions.status = status;

            const records = await SubjectModel.find(conditions, null, options);
            const total = await SubjectModel.count(conditions);
            const data = {
                records,
                totalRecord: total,
                perPage: limit
            };
            return response(res, data, 'Thành công', statusCode.OK);
        } catch (err) {
            logError(err);
            return response(res, err, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }

    async detail(req, res, params) {
        try {
            const { id } = params;

            const conditions = { _id: id };
            const rs = await SubjectModel.findOne(conditions);
            return response(res, rs, 'Thành công', statusCode.OK);
        } catch (err) {
            logError(err);
            return response(res, null, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }

    async create(req, res, params) {
        try {
            const { name, code } = params;
            const supportFbLink = params.support_fb_link || null;
            const teacherID = params.teacher_id || null;
            const supporterID = params.supporter_id || null;
            const isOnline = params.is_online || false;
            const status = params.status || false;
            const ordering = params.ordering || 0;
            const icon = params.icon || null;
            const classification = params.classification || null;
            console.log(classification)

            if (!name || !teacherID)
                return response(res, null, language.CANNOT_EMPTY.replace('%s', language.SUBJECT), statusCode.ERROR);

            const user = await UserModel.findOne({ _id: teacherID });
            if (!user)
                return response(res, null, 'Giáo viên này không tồn tại!', statusCode.ERROR);

            let supporter;
            if (supporterID) {
                supporter = await UserModel.findOne({ _id: supporterID });
                if (!supporter)
                    return response(res, null, 'Trợ giảng này không tồn tại!', statusCode.ERROR);
            }
            if (!classification || !["XA_HOI", "TU_NHIEN", "KHONG_XAC_DINH"].includes(classification)) {
                return response(res, null, 'Phân loại môn học không hợp lệ!', statusCode.ERROR);
            }
            const alias = BaseHelper.seoURL(name);
            const docSubject = {
                name: name,
                alias: alias,
                code: code,
                teacher: { id: user.id, name: user.fullname },
                support_fb_link: supportFbLink,
                is_online: isOnline,
                status,
                ordering,
                classification,
                icon
            };

            if (supporter)
                docSubject.supporter = { id: supporter.id, name: supporter.fullname };

            const subject = await SubjectModel.create(docSubject);
            if (!subject)
                return response(res, {}, language.ERROR, statusCode.ERROR);

            return response(res, subject, 'Thành công', statusCode.OK);
        } catch (err) {
            logError(err);
            return response(res, {}, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }

    async update(req, res, params) {
        try {
            const { id, name, code } = params;
            const supportFbLink = params.support_fb_link || null;
            const teacherID = params.teacher_id || null;
            const supporterID = params.supporter_id || null;
            const isOnline = params.is_online || false;
            const status = params.status || false;
            const ordering = params.ordering || 0;
            const icon = params.icon || null;
            const classification = params.classification || null;
            console.log(classification)
            if (!name || !teacherID)
                return response(res, null, language.CANNOT_EMPTY.replace('%s', language.SUBJECT), statusCode.ERROR);

            if (!id)
                return response(res, null, 'Request không hợp lệ!', statusCode.ERROR);

            const subject = await SubjectModel.findOne({ _id: id });
            if (!subject)
                return response(res, {}, language.ITEM_NOT_EXIST.replace('%s', language.SUBJECT), statusCode.ERROR);

            const user = await UserModel.findOne({ _id: teacherID });
            if (!user)
                return response(res, null, 'Giáo viên này không tồn tại!', statusCode.ERROR);

            const alias = BaseHelper.seoURL(name);
            if (!classification || !["XA_HOI", "TU_NHIEN", "KHONG_XAC_DINH"].includes(classification)) {
                return response(res, null, 'Phân loại môn học không hợp lệ!', statusCode.ERROR);
            }
            if (name) {
                subject.name = name;
                subject.alias = alias;
            }

            if (supportFbLink)
                subject.support_fb_link = supportFbLink;

            if (code)
                subject.code = code;

            if (icon)
                subject.icon = icon;

            subject.classification = classification;
            subject.teacher = { id: user.id, name: user.fullname };

            subject.is_online = isOnline;
            subject.ordering = ordering;
            subject.status = status;

            let supporter;
            if (supporterID) {
                supporter = await UserModel.findOne({ _id: supporterID });
                if (!supporter)
                    return response(res, null, 'Trợ giảng này không tồn tại!', statusCode.ERROR);
            }

            if (supporter)
                subject.supporter = { id: supporter.id, name: supporter.fullname };

            const rs = await SubjectModel.updateOne({ _id: id }, subject);
            if (rs.nModified)
                return response(res, subject, 'Thành công', statusCode.OK);

            return response(res, subject, language.ERROR, statusCode.ERROR);
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

            const rs = await SubjectModel.softDelete({ _id: { $in: ids } }, true);
            if (rs)
                return response(res, {}, 'Thành công', statusCode.OK);
            return response(res, null, language.ERROR, statusCode.ERROR);
        } catch (err) {
            logError(err);
            return response(res, null, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }
}

module.exports = new SubjectController();
