const appConfig = require('../../config/app');
const BaseHelper = require('../helpers/BaseHelper');
const ChapterModel = require('../models/Chapter');
const SubjectModel = require('../models/Subject');
const ChapterClassroomModel = require('../models/ChapterClassroom');
const ClassroomService = require('../services/ClassroomService');
const language = BaseHelper.fileToJSON(`${__dirname}/../languages/vi.json`);
class ChapterController {
    async listPublic(req, res, params) {
        try {
            const keyword = params.keyword || false;
            const page = parseInt(params.page || appConfig.PAGINATION.PAGE);
            const limit = parseInt(params.limit || appConfig.PAGINATION.LIMIT);
            const subjectID = params.subject_id || null;
            const classroomID = params.classroom_id || null;

            const conditions = { deleted_at: null };

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
                const alias = BaseHelper.seoURL(keyword);
                conditions.alias = { $regex: alias, $options: 'i' };
            }

            if (subjectID)
                conditions['subject.id'] = subjectID;

            if (req.user.user_group === appConfig.USER_GROUP.TEACHER || req.user.user_group === appConfig.USER_GROUP.SUPPORTER) {
                conditions['subject.id'] = { $in: req.user.subject_ids };
            }

            if (classroomID)
                conditions.classroom_ids = { $in: [classroomID] };

            const records = await ChapterModel.find(conditions, null, options);
            const total = await ChapterModel.count(conditions);
            const data = {
                records,
                total,
                limit,
                totalRecord: total,
                perPage: limit,
                items: records
            };
            return response(res, data, 'Thành công', statusCode.OK);
        } catch (err) {
            logError(err);
            return response(res, null, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }

    async list(req, res, params) {
        try {
            const keyword = params.keyword || false;
            const page = parseInt(params.page || appConfig.PAGINATION.PAGE);
            const subjectID = params.subject_id || null;
            const paramslimit = parseInt(params.limit);
            const limitParse = paramslimit === -1 ? 0 : (paramslimit > 0 ? paramslimit : appConfig.PAGINATION.LIMIT);
            const classroomID = params.classroom_id || null;
            const status = params.status || null;
            const level = params.level || null;
            const sortByOrdering = params.is_sort_ordering || false;
            const teacherId = params.teacher_id || null;

            const conditions = { deleted_at: null };

            const options = {
                skip: (page - 1) * limitParse,
                limit: limitParse
            };
            options.sort = {};
            if (sortByOrdering) {
                options.sort.ordering = 1;
            } else {
                options.sort.updated_at = -1;
            }

            if (keyword) {
                const alias = BaseHelper.seoURL(keyword);
                conditions.alias = { $regex: alias, $options: 'i' };
            }

            if (subjectID)
                conditions['subject.id'] = subjectID;

            if (req.user.user_group === appConfig.USER_GROUP.TEACHER) {
                conditions['subject.id'] = { $in: req.user.subject_ids };
            }

            if (classroomID)
                conditions.classroom_ids = { $in: [classroomID] };

            if (status !== null)
                conditions.status = status;

            if (level)
                conditions.level = level;

            if (teacherId) {
                const subjects = await SubjectModel.find({
                    'teacher.id': teacherId,
                    deleted_at: null,
                });
                const subjectIds = subjects.map((item) => item._id);
                conditions['subject.id'] = { $in: subjectIds }
            }

            const records = await ChapterModel.find(conditions, null, options);
            const total = await ChapterModel.count(conditions);
            const data = {
                records,
                total,
                limit: limitParse,
                totalRecord: total,
                perPage: limitParse,
                items: records
            };
            return response(res, data, 'Thành công', statusCode.OK);
        } catch (err) {
            logError(err);
            return response(res, null, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }

    async show(req, res, params) {
        try {
            const { id } = params;

            const conditions = { _id: id };
            const rs = await ChapterModel.findOne(conditions);
            return response(res, rs, 'Thành công', statusCode.OK);
        } catch (err) {
            logError(err);
            return response(res, null, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }

    async detail(req, res, params) {
        try {
            const { id } = params;

            const conditions = { _id: id };
            const rs = await ChapterModel.findOne(conditions);
            return response(res, rs, 'Thành công', statusCode.OK);
        } catch (err) {
            logError(err);
            return response(res, null, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }

    async create(req, res, params) {
        try {
            const { name, level } = params;
            const ordering = params.ordering || 1;
            const subjectID = params.subject_id || null;
            const code = params.code || '';

            if (!name)
                return response(res, null, language.CANNOT_EMPTY.replace('%s', language.NAME), statusCode.ERROR);

            if (!subjectID)
                return response(res, null, language.CANNOT_EMPTY.replace('%s', language.SUBJECT), statusCode.ERROR);

            let subject = null;
            if (subjectID)
                subject = await SubjectModel.findOne({ _id: subjectID });

            if (!subject)
                return response(res, null, language.ITEM_NOT_EXIST.replace('%s', language.SUBJECT), statusCode.ERROR);

            const alias = BaseHelper.seoURL(name);
            const docChapter = {
                code,
                name: name,
                alias: alias,
                level,
                subject: { id: subject.id, name: subject.name },
                ordering
            };

            const chapter = await ChapterModel.create(docChapter);
            if (!chapter)
                return response(res, {}, language.ERROR, statusCode.ERROR);

            return response(res, chapter, 'Thành công', statusCode.OK);
        } catch (err) {
            logError(err);
            return response(res, {}, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }

    async copy(req, res, params) {
        try {
            const { id } = params;

            let chapter = await ChapterModel.findOne({ _id: id });
            if (!chapter)
                return response(res, null, 'Chương không tồn tại!', statusCode.ERROR);
            chapter = chapter.toObject();
            delete chapter._id;
            chapter.name  = chapter.name + '-Copy';
            chapter.alias = chapter.alias + '-copy';
            chapter.classroom_ids = [];
            const docChapter = chapter;
            chapter = await ChapterModel.create(docChapter);
            if (!chapter)
                return response(res, {}, language.ERROR, statusCode.ERROR);
            ClassroomService.copyChapterCategory(chapter, id);
            return response(res, chapter, 'Thành công', statusCode.OK);
        } catch (err) {
            logError(err);
            return response(res, {}, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }

    async update(req, res, params) {
        try {
            const { id, name, level } = params;
            const subjectID = params.subject_id || null;
            const ordering = params.ordering || 1;
            if (!id)
                return response(res, null, 'Request không hợp lệ!', statusCode.ERROR);

            const chapter = await ChapterModel.findOne({ _id: id });
            if (!chapter)
                return response(res, {}, language.ITEM_NOT_EXIST.replace('%s', language.CHAPTER), statusCode.ERROR);

            if (!subjectID)
                return response(res, null, language.CANNOT_EMPTY.replace('%s', language.SUBJECT), statusCode.ERROR);

            let subject = null;
            if (subjectID)
                subject = await SubjectModel.findOne({ _id: subjectID });

            if (!subject)
                return response(res, null, language.ITEM_NOT_EXIST.replace('%s', language.SUBJECT), statusCode.ERROR);
            const alias = BaseHelper.seoURL(name);

            let isChangeName = false;

            if (name) {
                if (chapter.name != name) isChangeName = true;
                chapter.name = name;
                chapter.alias = alias;
            }

            chapter.ordering = ordering;
            chapter.level = level;

            if (subjectID)
                chapter.subject = { id: subject.id, name: subject.name };

            const rs = await ChapterModel.updateOne({ _id: id }, chapter);
            if (rs.nModified >= 1) {
                if (isChangeName) {
                    ChapterClassroomModel.updateMany({ "chapter.id": id }, {
                        $set: {
                            "chapter.name": name
                        }
                    });
                }

                return response(res, chapter, 'Thành công', statusCode.OK);
            }

            return response(res, subject, language.ERROR, statusCode.ERROR);
        } catch (err) {
            logError(err);
            return response(res, {}, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }

    async ordering(req, res, params) {
        try {
            const data = params.data || [];
            if (data.length == 0)
                return response(res, null, 'Request không hợp lệ!', statusCode.ERROR);

            for (let i = 0; i < data.length; i++) {
                const id = data[i].id;
                const ordering = data[i].ordering;
                await ChapterModel.updateOne({ _id: id }, { $set: { ordering } })
            }
            return response(res, null, 'Thành công', statusCode.OK);
        } catch (err) {
            logError(err);
            return response(res, {}, 'Có lỗi xảy ra. Vui lòng thử lại!', statusCode.ERROR);
        }
    }

    async updateMetaData(req, res, params) {
        try {
            const id = params.id || null;
            const ordering = params.ordering || 999;
            const status = params.status;

            if (!id)
                return response(res, null, 'Request không hợp lệ!', statusCode.ERROR);

            const _doc = {};
            _doc.ordering = parseInt(ordering);
            if (status !== undefined) _doc.status = status;

            let chapter = await ChapterModel.findOne({ _id: id });
            if (!chapter)
                return response(res, {}, language.ITEM_NOT_EXIST.replace('%s', 'Chương'), statusCode.ERROR);

            const rs = await ChapterModel.updateOne({ _id: id }, { $set: _doc });
            if (rs.nModified) {
                chapter.ordering = ordering;
                return response(res, chapter, 'Thành công', statusCode.OK);
            }
            return response(res, null, language.ERROR, statusCode.ERROR);
        } catch (err) {
            logError(err);
            return response(res, {}, 'Có lỗi xảy ra. Vui lòng thử lại!', statusCode.ERROR);
        }
    }

    async delete(req, res, params) {
        try {
            const { ids } = params || [];
            if (ids.length == 0)
                return response(res, null, 'Request không hợp lệ!', statusCode.ERROR);

            const rs = await ChapterModel.softDelete({ _id: { $in: ids } }, true);
            if (rs)
                return response(res, {}, 'Thành công', statusCode.OK);
            return response(res, null, language.ERROR, statusCode.ERROR);
        } catch (err) {
            logError(err);
            return response(res, null, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }
}

module.exports = new ChapterController();
