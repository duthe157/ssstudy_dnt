const appConfig = require('../../config/app');
const BaseHelper = require('../helpers/BaseHelper');
// const ChapterModel = require('../models/Chapter');
const CLassRoomChapterSubjectModel = require('../models/ClassroomChapterSubject');
const SubjectModel = require('../models/Subject');
const ChapterClassroomModel = require('../models/ChapterClassroom');
const ClassroomService = require('../services/ClassroomService');
const ClassroomReviewModel = require("../models/ClassroomReview");
const ClassroomModel = require("../models/Classroom");
const UploadService = require("../services/UploadService");
const language = BaseHelper.fileToJSON(`${__dirname}/../languages/vi.json`);

class ClassroomChapterSubjectController {
    async list(req, res, params) {
        try {
            const page = parseInt(params.page || appConfig.PAGINATION.PAGE);
            const paramslimit = parseInt(params.limit);
            const limitParse = paramslimit === -1 ? 0 : (paramslimit > 0 ? paramslimit : appConfig.PAGINATION.LIMIT);
            const classroomID = params.classroom_id || null;
            const sortByOrdering = params.is_sort_ordering || false;

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


            if (classroomID)
                conditions.classroom_ids = { $in: [classroomID] };


            const records = await CLassRoomChapterSubjectModel.find(conditions, null, options);
            const total = await CLassRoomChapterSubjectModel.count(conditions);
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

    async update(req, res, params) {
        try {
            const classroomID = params.classroom_id || null;
            const chapterID = params.chapter_id || null;
            const subjectId = params.subject_id || null;

            // Kiểm tra các tham số bắt buộc
            if (!classroomID) {
                return response(res, null, 'Classroom ID không được để trống', statusCode.ERROR);
            }

            if (!chapterID) {
                return response(res, null, 'Chapter ID không được để trống', statusCode.ERROR);
            }

            try {
                // Tìm bản ghi dựa trên classroom_id và chapter_id
                const conditions = {
                    classroom_id: classroomID,
                    chapter_id: chapterID,
                    deleted_at: null
                };

                const existingRecord = await CLassRoomChapterSubjectModel.findOne(conditions);

                if (existingRecord) {
                    // Nếu có bản ghi thì update
                    const updateData = {};
                    if (subjectId) {
                        updateData.subject_id = subjectId;
                    }
                    updateData.updated_at = new Date();

                    const rs = await CLassRoomChapterSubjectModel.updateOne(conditions, { $set: updateData });
                    
                    if (rs.nModified || rs.matchedCount > 0) {
                        // Lấy bản ghi sau khi update để trả về
                        const updatedRecord = await CLassRoomChapterSubjectModel.findOne(conditions);
                        return response(res, updatedRecord, 'Cập nhật thành công', statusCode.OK);
                    } else {
                        return response(res, existingRecord, 'Không có thay đổi nào được thực hiện', statusCode.OK);
                    }
                } else {
                    // Nếu không có bản ghi thì tạo mới
                    const newRecord = {
                        classroom_id: classroomID,
                        chapter_id: chapterID
                    };

                    if (subjectId) {
                        newRecord.subject_id = subjectId;
                    }

                    const createdRecord = await CLassRoomChapterSubjectModel.create(newRecord);
                    
                    if (createdRecord) {
                        return response(res, createdRecord, 'Tạo bản ghi mới thành công', statusCode.OK);
                    } else {
                        return response(res, null, 'Không thể tạo bản ghi mới', statusCode.ERROR);
                    }
                }
            } catch (err) {
                logError(err);
                return response(res, null, 'Lỗi trong quá trình xử lý dữ liệu', statusCode.ERROR);
            }
        } catch (err) {
            logError(err);
            return response(res, {}, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }
}

module.exports = new ClassroomChapterSubjectController();