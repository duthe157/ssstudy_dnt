const fs = require('fs');
const mongoose = require('mongoose');
const randomize = require('randomatic');
const appConfig = require('../../config/app');
const BaseHelper = require('../helpers/BaseHelper');
const AppService = require('../services/AppService');
const ClassroomModel = require('../models/Classroom');
const SubjectModel = require('../models/Subject');
const TestingModel = require('../models/Testing');
const UserModel = require('../models/User');
const PointLogModel = require('../models/PointLog');
const StudentClassroomModel = require('../models/StudentClassroom');
const ClassroomScheduleModel = require('../models/ClassroomSchedule');
const language = BaseHelper.fileToJSON(`${__dirname}/../languages/vi.json`);

class ClassroomScheduleController {
    async list(req, res, params) {
        try {
            const keyword = params.keyword || false;
            const page = parseInt(params.page || appConfig.PAGINATION.PAGE);
            const limit = parseInt(params.limit || appConfig.PAGINATION.LIMIT);
            const classroomID = params.classroom_id || null;
            const subjectID = params.subject_id || null;

            const conditions = {};

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

            if (classroomID)
                conditions['classroom.id'] = classroomID;

            if (subjectID)
                conditions['subject.id'] = subjectID;

            const records = await ClassroomScheduleModel.find(conditions, null, options);
            const total = await ClassroomScheduleModel.count(conditions);
            const data = {
                records,
                limit,
                totalRecord: total,
                perPage: limit
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

            const conditions = { _id: id };
            const rs = await ClassroomScheduleModel.findOne(conditions);
            return response(res, rs, 'Thành công', statusCode.OK);
        } catch (err) {
            logError(err);
            return response(res, null, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }

    async create(req, res, params) {
        try {
            const numDayOfWeek = params.num_day_of_week || 0;
            const supportTeacher = params.support_teacher || null;
            const startedAt = params.started_at || null;
            const finishedAt = params.finished_at || null;
            const note = params.note || null;
            const classroomID = params.classroom_id || null;

            if (!classroomID)
                return response(res, null, language.CANNOT_EMPTY.replace('%s', language.CLASSROOM), statusCode.ERROR);

            const classroom = await ClassroomModel.findOne({ _id: classroomID });
            if (!classroom)
                return response(res, null, 'Lớp học không tồn tại!', statusCode.ERROR);

            let doc = {
                classroom: { id: classroom.id, name: classroom.name, code: classroom.code },
                subject: classroom.subject,
                num_day_of_week: numDayOfWeek,
                day_of_week: BaseHelper.dayOfWeek(numDayOfWeek),
                started_at: startedAt,
                finished_at: finishedAt,
                support_teacher: supportTeacher,
                note
            };

            const rs = await ClassroomScheduleModel.create(doc);
            if (!rs)
                return response(res, {}, language.ERROR, statusCode.ERROR);

            return response(res, rs, 'Thành công', statusCode.OK);
        } catch (err) {
            logError(err);
            return response(res, {}, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }

    async update(req, res, params) {
        try {
            const id = params.id || null;
            const numDayOfWeek = params.num_day_of_week || 0;
            const supportTeacher = params.support_teacher || null;
            const startedAt = params.started_at || null;
            const finishedAt = params.finished_at || null;
            const note = params.note || null;
            const classroomID = params.classroom_id || null;
            if (!classroomID)
                return response(res, null, language.CANNOT_EMPTY.replace('%s', language.CLASSROOM), statusCode.ERROR);

            const classroom = await ClassroomModel.findOne({ _id: classroomID });
            if (!classroom)
                return response(res, null, 'Lớp học không tồn tại!', statusCode.ERROR);

            const doc = await ClassroomScheduleModel.findOne({ _id: id });

            if (numDayOfWeek) {
                doc.num_day_of_week = numDayOfWeek;
                doc.day_of_week = BaseHelper.dayOfWeek(numDayOfWeek);
            }

            if (supportTeacher)
                doc.support_teacher = support_teacher;

            if (startedAt)
                doc.started_at = startedAt;

            if (finishedAt)
                doc.finished_at = finishedAt;

            if (note)
                doc.note = note;

            doc.classroom = {
                id: classroom.id,
                name: classroom.name,
                code: classroom.code
            };

            doc.subject = classroom.subject;

            const rs = await ClassroomScheduleModel.updateOne({ _id: id }, { $set: doc });
            if (rs.nModified) {
                return response(res, doc, 'Thành công', statusCode.OK);
            }
            return response(res, classroom, language.ERROR, statusCode.ERROR);
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

            const rs = await ClassroomScheduleModel.delete({ _id: { $in: ids } }, true);
            if (rs)
                return response(res, {}, 'Thành công', statusCode.OK);
            return response(res, null, language.ERROR, statusCode.ERROR);
        } catch (err) {
            logError(err);
            return response(res, null, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }
}

module.exports = new ClassroomScheduleController();
