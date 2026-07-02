const appConfig = require('../../config/app');
const BaseHelper = require('../helpers/BaseHelper');
const RegistrationModel = require('../models/Registration');
const ExamModel = require('../models/Exam');
const language = BaseHelper.fileToJSON(`${__dirname}/../languages/vi.json`);

class RegistrationController {
    async list(req, res, params) {
        try {
            const keyword = params.keyword || false;
            const page = parseInt(params.page || appConfig.PAGINATION.PAGE);
            const limit = parseInt(params.limit || appConfig.PAGINATION.LIMIT);

            const conditions = { deleted_at: null };

            if (params.is_called !== undefined)
                conditions.is_called = params.is_called;

            if (params.is_student !== undefined)
                conditions.is_student = params.is_student;

            const options = {
                skip: (page - 1) * limit,
                limit: limit,
                sort: { updated_at: -1 }
            };

            if (keyword) {
                conditions.$or = [
                    { fullname: { $regex: keyword, $options: 'i' } },
                    { phone: { $regex: keyword, $options: 'i' } },
                    { email: { $regex: keyword, $options: 'i' } },
                    { classroom: { $regex: keyword, $options: 'i' } },
                    { subject: { $regex: keyword, $options: 'i' } },
                    { school: { $regex: keyword, $options: 'i' } },
                    { note: { $regex: keyword, $options: 'i' } }
                ];
            }

            const records = await RegistrationModel.find(conditions, null, options);
            const total = await RegistrationModel.count(conditions);
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

    async detail(req, res, params) {
        try {
            const { id } = params;

            const conditions = { _id: id };
            const rs = await RegistrationModel.findOne(conditions);
            return response(res, rs, 'Thành công', statusCode.OK);
        } catch (err) {
            logError(err);
            return response(res, null, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }

    async create(req, res, params) {
        try {
            const { fullname, address, subject, classroom, classroom_group, school, school_2, email, phone, type, exam_category_id, hocluc } = params;
            const examCategodyID = params.exam_category_id || null;
            const targetPoint = params.target_point || 0;
            if (!fullname)
                return response(res, null, language.TAG_NAME_EMPTY, statusCode.OK);

            if (!examCategodyID)
                return response(res, null, 'Bạn chưa chọn bài kiểm tra!', statusCode.OK);

            const _subjectName = subject.subject_name;
            const docItem = {
                fullname,
                subject: _subjectName,
                email,
                phone,
                address,
                school,
                school_2,
                classroom,
                classroom_group,
                target_point: targetPoint,
                tested_point: null,
                is_called: false,
                is_student: false,
                exam_category_id,
                hocluc
            };

            let item = await RegistrationModel.create(docItem);
            if (!item)
                return response(res, {}, language.ERROR, statusCode.ERROR);
            if (type === 'TESTING') {
                item = item.toObject();
                item.exam_id = '5fc3787ff72e1363fc1ad634';
                const exam = await ExamModel.findOne({ 'category.id': examCategodyID, deleted_at: null, status: true });
                if (exam)
                    item.exam.id;
            }
            return response(res, item, 'Thành công', statusCode.OK);
        } catch (err) {
            logError(err);
            return response(res, {}, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }

    async update(req, res, params) {
        try {
            const { id } = params;
            const isCalled = params.is_called || false;
            const isStudent = params.is_student || false;
            const note = params.note || null;

            if (!id)
                return response(res, null, 'Request không hợp lệ!', statusCode.OK);
            const docReg = {
                is_called: isCalled,
                is_student: isStudent
            };

            if (note)
                docReg.note = note;

            const item = await RegistrationModel.findOne({ _id: id });
            if (!item)
                return response(res, {}, 'Bản ghi không tồn tại', statusCode.ERROR);
            const rs = await RegistrationModel.updateOne({ _id: id }, { $set: docReg });
            if (rs.nModified == 1) {
                const item = await RegistrationModel.findOne({ _id: id });
                return response(res, item, 'Thành công', statusCode.OK);
            }
            return response(res, item, language.ERROR, statusCode.ERROR);
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

            const rs = await RegistrationModel.softDelete({ _id: { $in: ids } }, true);
            if (rs)
                return response(res, {}, 'Thành công', statusCode.OK);
            return response(res, null, language.ERROR, statusCode.ERROR);
        } catch (err) {
            logError(err);
            return response(res, null, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }
}

module.exports = new RegistrationController();
