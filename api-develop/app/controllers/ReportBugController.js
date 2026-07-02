const appConfig = require('../../config/app');
const BaseHelper = require('../helpers/BaseHelper');
const ClassroomModel = require('../models/Classroom');
const ReportBugModel = require('../models/ReportBug');
const UserModel = require('../models/User');
const language = BaseHelper.fileToJSON(`${__dirname}/../languages/vi.json`);

class ReportBugController {
    async list(req, res, params) {
        try {
            const keyword = params.keyword || false;
            const page = parseInt(params.page || appConfig.PAGINATION.PAGE);
            const paramslimit = parseInt(params.limit);
            const limitParse = paramslimit === -1 ? 0 : (paramslimit > 0 ? paramslimit : appConfig.PAGINATION.LIMIT);
            const subjectID = params.subject_id || null;
            const classroomID = params.classroom_id || null;
            const conditions = { deleted_at: null };
            const status = params.status || 'PENDING';

            const options = {
                skip: (page - 1) * limitParse,
                limit: limitParse,
                sort: { updated_at: -1 }
            };

            if (keyword) {
                const parserKeyword = keyword.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')
                conditions.code = { $regex: parserKeyword, $options: 'i' };
            }

            if (status)
                conditions.status = status;

            if (subjectID)
                conditions['subject.id'] = subjectID;

            if (classroomID)
                conditions['classroom.id'] = classroomID;

            const records = await ReportBugModel.find(conditions, null, options);
            const total = await ReportBugModel.count(conditions);
            const data = {
                records,
                totalRecord: total,
                limit: limitParse,
                perPage: limitParse
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
            const rs = await ReportBugModel.findOne(conditions);

            return response(res, rs, 'Thành công', statusCode.OK);
        } catch (err) {
            logError(err);
            return response(res, null, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }

    async create(req, res, params) {
        try {
            const { content, phone } = params;
            const classroomID = params.classroom_id || null;
            const status = params.status || 'PENDING';
            const objectType = params.object_type || null;
            const objectID = params.object_id || null;

            /*if (!classroomID)
                return response(res, null, language.CANNOT_EMPTY.replace('%s', language.CLASSROOM), statusCode.ERROR);
            const classroom = await ClassroomModel.findOne({ _id: classroomID });

            if (!classroom)
                return response(res, null, language.ITEM_NOT_EXIST.replace('%s', language.CLASSROOM), statusCode.ERROR);
*/
            const user = await UserModel.findOne({ _id: req.user.user_id });
            if (!user)
                return response(res, null, language.ITEM_NOT_EXIST.replace('%s', 'Người dùng không hợp lệ!'), statusCode.ERROR);

            const _user = { id: req.user.user_id, name: user.fullname };
            // const _classroom = { id: classroom.id, name: classroom.name };
            // const subject = { id: classroom.subject.id, name: classroom.subject.name };
            const code = BaseHelper.generateTime();
            const _doc = {
                code,
                user: _user,
                content,
                // classroom: _classroom,
                object_type: objectType,
                object_id: objectID,
                // subject,
                status
            };

            const item = await ReportBugModel.create(_doc);
            if (!item)
                return response(res, {}, language.ERROR, statusCode.ERROR);

            return response(res, item, 'Thành công', statusCode.OK);
        } catch (err) {
            logError(err);
            return response(res, {}, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }

    async update(req, res, params) {
        try {
            const { id } = params;
            const status = params.status || 'PENDING';

            if (!id)
                return response(res, null, 'Request không hợp lệ!', statusCode.ERROR);

            const category = await ReportBugModel.findOne({ _id: id });
            if (!category)
                return response(res, {}, language.ITEM_NOT_EXIST.replace('%s', language.CATEGORY), statusCode.ERROR);

            category.status = status;

            const rs = await ReportBugModel.updateOne({ _id: category.id }, category);
            if (rs.nModified)
                return response(res, category, 'Thành công', statusCode.OK);
            return response(res, category, language.ERROR, statusCode.ERROR);
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

            const rs = await ReportBugModel.softDelete({ _id: { $in: ids } }, true);
            if (rs)
                return response(res, {}, 'Thành công', statusCode.OK);
            return response(res, null, language.ERROR, statusCode.ERROR);
        } catch (err) {
            logError(err);
            return response(res, null, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }
}

module.exports = new ReportBugController();
