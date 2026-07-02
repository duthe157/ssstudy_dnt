const config = require('../../config/config');
const appConfig = require('../../config/app');
const BaseHelper = require('../helpers/BaseHelper');
const AppService = require('../services/AppService');
const UploadService = require('../services/UploadService');
const QuestionModel = require('../models/Question');
const QuestionClassroomModel = require('../models/QuestionClassroom');
const QuestionUserLogModel = require('../models/QuestionUserLog');
const ClassroomModel = require('../models/Classroom');
const ChapterModel = require('../models/Chapter');
const CategoryModel = require('../models/Category');
const ExamModel = require('../models/Exam');
const ExamQuestionModel = require('../models/ExamQuestion');
const StudentClassroomModel = require('../models/StudentClassroom');
const UserModel = require('../models/User');
const KeyModel = require('../models/Key');
const ChangePointLogModel = require('../models/ChangePointLog');
const language = BaseHelper.fileToJSON(`${__dirname}/../languages/vi.json`);

class QuestionController {
    async list(req, res, params) {
        try {
            const keyword = params.keyword || false;
            const subjectID = params.subject_id || false;
            const chapterID = params.chapter_id || false;
            const categoryID = params.category_id || false;
            const level = params.level || appConfig.QUESTION_LEVEL.QUESTION_LEVEL;
            const page = parseInt(params.page || appConfig.PAGINATION.PAGE);
            const limit = parseInt(params.limit || appConfig.PAGINATION.LIMIT);

            const conditions = { deleted_at: null };

            const options = {
                skip: (page - 1) * limit,
                limit: limit,
                sort: { created_at: -1 }
            };

            if (keyword) {
                conditions.$or = [
                    { code: keyword },
                    { question: { $regex: keyword, $options: 'i' } },
                    { answer: { $regex: keyword, $options: 'i' } }
                ];
            }

            if (subjectID)
                conditions['subject.id'] = subjectID;

            if (chapterID)
                conditions['chapter.id'] = chapterID;

            if (level)
                conditions.level = level;

            if (categoryID)
                conditions['category.id'] = categoryID;

            if (req.user.user_group === appConfig.USER_GROUP.TEACHER || req.user.user_group === appConfig.USER_GROUP.SUPPORTER) {
                conditions['subject.id'] = { $in: req.user.subject_ids };
            }

            const records = await QuestionModel.find(conditions, null, options);
            const total = await QuestionModel.count(conditions);
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

    async show(req, res, params) {
        try {
            const { id } = params;

            const conditions = { _id: id };
            const rs = await QuestionModel.findOne(conditions);
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
            const rs = await QuestionModel.findOne(conditions);
            return response(res, rs, 'Thành công', statusCode.OK);
        } catch (err) {
            logError(err);
            return response(res, null, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }

    async preAnswer(req, res, params) {
        try {
            const { id } = params;
            const examID = params.exam_id || null;

            const conditions = { _id: id };
            const projections = '_id answer answer_content video_link';
            const rs = await QuestionModel.findOne(conditions, projections);
            let vID = null;
            let vLink = rs.video_link;
            if (rs.video_link) {
                const arrLink = rs.video_link.split('?v=');
                vID = BaseHelper.base64Encode(arrLink[1]);
            }
            if (rs.video_link && rs.video_link.indexOf('mediadelivery.net')) {
                vLink = vLink.replace('/play/', '/embed/');
            }

            const data = {
                _id: rs.id,
                answer: rs.answer,
                answer_content: rs.answer_content,
                v_id: vID,
                video_link: vLink
            };

            return response(res, data, 'Thành công', statusCode.OK);
        } catch (err) {
            logError(err);
            console.log(err);
            return response(res, null, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }

    async answer(req, res, params) {
        try {
            const { id } = params;
            const conditions = { _id: id };
            const projections = '_id answer answer_content video_link';
            const rs = await QuestionModel.findOne(conditions, projections);
            let vID = null;
            let vLink = rs.video_link;
            if (rs.video_link) {
                const arrLink = rs.video_link.split('?v=');
                vID = BaseHelper.base64Encode(arrLink[1]);
            }

            if (rs.video_link && rs.video_link.indexOf('mediadelivery.net')) {
                vLink = vLink.replace('/play/', '/embed/');
            }

            const data = {
                _id: rs.id,
                answer: rs.answer,
                answer_content: rs.answer_content,
                v_id: vID,
                video_link: vLink
            };

            return response(res, data, 'Thành công', statusCode.OK);
        } catch (err) {
            logError(err);
            console.log(err);
            return response(res, null, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }

    async getVideo(req, res, params) {
        try {
            const { code } = params;
            const classroomID = params.classroom_id || null;
            if (!code)
                return response(res, null, 'Request không hợp lệ!', statusCode.ERROR);
            let conditions = { code: code };
            const question = await QuestionModel.findOne(conditions);
            if (!question)
                return response(res, {}, 'Video này không tồn tại!', statusCode.ERROR);

            // Kiem tra quyen truy cap Lop cua user.
            conditions = {};
            conditions['user.id'] = req.user.user_id;
            conditions['classroom.id'] = classroomID;
            const userOnClassroom = await StudentClassroomModel.findOne(conditions);
            if (!userOnClassroom)
                return response(res, {}, 'Bạn không được phép truy cập tài nguyên của Lớp này!', statusCode.ERROR);

            // Kiem tra Video co duoc ap dung cho Lop hay khong
            conditions = {};
            conditions.question_id = question.id;
            conditions['classroom.id'] = classroomID;
            const check = await QuestionClassroomModel.count(conditions);
            if (!check)
                return response(res, {}, 'Bạn không được phép truy cập Video này!', statusCode.ERROR);

            conditions = {};
            conditions['user.id'] = req.user.user_id;
            conditions['video.id'] = question.id;
            const questionLog = await QuestionUserLogModel.findOne(conditions);
            if (questionLog) {
                if (questionLog.total_view >= 90 && req.user.user_group == appConfig.USER_GROUP.STUDENT) {
                    await UserModel.updateOne({ _id: req.user.user_id }, { $set: { status: 'BLOCKED_ON_VIDEO' } });
                    await KeyModel.delete({ user_id: req.user.user_id });
                    return response(res, {}, 'Tài khoản của bạn bị nghi ngờ Spam. Hệ thống đã block tài khoản này. Vui lòng liên hệ để được hỗ trợ!', statusCode.FORBIDDEN);
                }

                await QuestionUserLogModel.updateOne({ _id: questionLog.id }, { $set: { total_view: questionLog.total_view + 1 } });
            } else {
                const docQuestionLog = {
                    user: { id: req.user.user_id, code: req.user.code },
                    question: { id: question.id, code: question.code },
                    total_view: 1
                };
                await QuestionUserLogModel.create(docQuestionLog);
            }
            let vID = null;
            if (question.video_link) {
                const arrLink = question.video_link.split('?v=');
                vID = BaseHelper.base64Encode(arrLink[1]);
            }

            const data = {
                _id: question.id,
                name: question.code,
                alias: question.alias,
                code: question.code,
                v_id: vID,
                video_link: question.video_link
            };
            return response(res, data, 'Thành công', statusCode.OK);
        } catch (err) {
            logError(err);
            return response(res, null, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }

    async create(req, res, params) {
        try {
            const answer = params.answer || null;
            const options = params.options || null;
            const docLink = params.doc_link || null;
            const videoLink = params.video_link || null;
            const chapterID = params.chapter_id || null;
            const categoryID = params.category_id || null;
            const _question = params.question || null;
            const questionJson = params.question_json || null;
            const answerContent = params.answer_content || null;
            const level = params.level || appConfig.QUESTION_LEVEL.NHAN_BIET;
            const docType = params.doc_type || 'PDF';

            // if (!_question)
                // return response(res, null, 'Vui lòng nhập nội dung câu hỏi!', statusCode.ERROR);

            const docQuestion = {
                code: 0,
                question: _question,
                question_json: questionJson,
                options,
                level: level,
                answer: answer,
                answer_content: answerContent,
                doc_link: docLink,
                doc_type: docType,
                video_link: videoLink
            };

            if (docLink && docLink != 'null' && docType == 'GOOGLE_DRIVE' && docLink && docLink.indexOf('google.com') < 0)
                return response(res, null, 'Link tài liệu không đúng định dạng Google Drive', statusCode.ERROR);

            if (docType === 'PDF') {
                const { files } = req;
                if (files && files[0]) {
                    try {
                        const fileData = await UploadService.upload(files, 'binary', 'doc-questions');
                        if (fileData && fileData.length > 0) {
                            docQuestion.doc_link = config.FILE_DOMAIN + '/' + fileData[0];
                        }
                    } catch (err) {
                        logError(err);
                        return response(res, {}, 'Không thể tải được FILE', statusCode.ERROR);
                    }
                }
            }

            let chapter = null;
            if (chapterID)
                chapter = await ChapterModel.findOne({ _id: chapterID });

            if (chapter) {
                docQuestion.chapter = { id: chapter.id, name: chapter.name };
                docQuestion.subject = { id: chapter.subject.id, name: chapter.subject.name };
            }

            let category = null;
            if (categoryID)
                category = await CategoryModel.findOne({ _id: categoryID });

            if (category)
                docQuestion.category = { id: category.id, name: category.name };

            const question = await AppService.createQuestion(docQuestion);

            if (!question)
                return response(res, {}, language.ERROR, statusCode.ERROR);

            return response(res, question, 'Thành công', statusCode.OK);
        } catch (err) {
            logError(err);
            return response(res, {}, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }

    async update(req, res, params) {
        try {
            const id = params.id || false;
            const answer = params.answer || null;
            const options = params.options || null;
            const answerContent = params.answer_content || null;
            const docLink = params.doc_link || null;
            const videoLink = params.video_link || null;
            const chapterID = params.chapter_id || null;
            const categoryID = params.category_id || null;
            const questionJson = params.question_json || null;
            const _question = params.question || null;
            const level = params.level || appConfig.QUESTION_LEVEL.NHAN_BIET;
            const docType = params.doc_type || 'PDF';

            if (!id)
                return response(res, null, 'Request không hợp lệ!', statusCode.OK);

            // if (!_question)
                // return response(res, null, 'Vui lòng nhập nội dung câu hỏi!', statusCode.ERROR);

            const question = await QuestionModel.findOne({ _id: id });
            if (!question)
                return response(res, null, language.ITEM_NOT_EXIST.replace('%s', language.QUESTION), statusCode.ERROR);

            let currentAnswer = question.answer;

            if (docType)
                question.doc_type = docType;

            if (answer)
                question.answer = answer;

            question.answer_content = answerContent;

            question.question = _question;

            if (questionJson)
                question.question_json = questionJson;

            if (options)
                question.options = options;

            if (docLink && docLink != 'null') {
                if (docType == 'GOOGLE_DRIVE' && docLink && docLink.indexOf('google.com') < 0)
                    return response(res, null, 'Link tài liệu không đúng định dạng Google Drive', statusCode.ERROR);
                question.doc_link = docLink;
            } else {
                question.doc_link = null;
            }

            if (docType === 'PDF') {
                const { files } = req;
                if (files && files[0]) {
                    const fileData = await UploadService.upload(files, 'binary', 'doc-questions');
                    if (fileData && fileData.length > 0) {
                        question.doc_link = config.FILE_DOMAIN + '/' + fileData[0];
                    }
                }
            }

            if (videoLink)
                question.video_link = videoLink;

            question.level = level;

            let chapter = null;
            if (chapterID)
                chapter = await ChapterModel.findOne({ _id: chapterID });

            if (chapter) {
                question.chapter = { id: chapter.id, name: chapter.name };
                question.subject = { id: chapter.subject.id, name: chapter.subject.name };
            }

            let category = null;
            if (categoryID)
                category = await CategoryModel.findOne({ _id: categoryID });

            if (category)
                question.category = { id: category.id, name: category.name };

            const rs = await QuestionModel.updateOne({ _id: id }, { $set: question });
            if (rs.nModified) {
                if (currentAnswer != question.answer) {
                    // Create Log ChangePoint
                    const _cl = await ChangePointLogModel.findOne({ question_id: id });
                    if (!_cl) {
                        ChangePointLogModel.create(
                            {
                                question_id: id,
                                question_code: question.code,
                                old_answer: currentAnswer,
                                new_answer: question.answer,
                                num: 1
                            }
                        );
                    } else {
                        ChangePointLogModel.updateOne({ _id: _cl.id },
                            {
                                $set: {
                                    question_id: id,
                                    question_code: question.code,
                                    old_answer: currentAnswer,
                                    new_answer: question.answer,
                                    num: _cl.num + 1
                                }
                            }
                        );
                    }
                }
                return response(res, question, 'Thành công', statusCode.OK);
            }

            return response(res, null, language.ERROR, statusCode.ERROR);
        } catch (err) {
            logError(err);
            return response(res, null, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }

    async upload(req, res) {
        try {
            const { files } = req;
            if (files) {
                const fileData = await UploadService.upload(files, 'binary', 'questions');
                const data = [];

                if (fileData && fileData.length > 0) {
                    for (let i = 0; i < fileData.length; i++) {
                        data[i] = config.FILE_DOMAIN + '/' + fileData[i];
                    }
                }

                if (data.length > 0)
                    return response(res, data, 'Thành công', statusCode.OK);

                return response(res, {}, language.ERROR, statusCode.ERROR);
            }

            return response(res, {}, 'Request không hợp lệ!', statusCode.ERROR);
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

            const rs = await QuestionModel.softDelete({ _id: { $in: ids } }, true);

            if (rs) {
                await ExamQuestionModel.softDelete({ question_id: { $in: ids } });
                const pullData = { $pull: { questions: { $in: ids } } };
                await ExamModel.updateMany({}, pullData);
                return response(res, {}, 'Thành công', statusCode.OK);
            }

            return response(res, null, language.ERROR, statusCode.ERROR);
        } catch (err) {
            logError(err);
            return response(res, null, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }

    async classrooms(req, res, params) {
        try {
            const keyword = params.keyword || false;
            const questionID = params.question_id || null;
            const page = parseInt(params.page || appConfig.PAGINATION.PAGE);
            const limit = parseInt(params.limit || appConfig.PAGINATION.LIMIT);
            if (!questionID)
                return response(res, null, 'Request không hợp lệ!', statusCode.ERROR);

            const conditions = {};
            conditions.question_id = questionID;
            conditions.deleted_at = null;
            const options = {
                skip: (page - 1) * limit,
                limit: limit,
                sort: { updated_at: -1 }
            };

            if (keyword) {
                const alias = BaseHelper.seoURL(keyword);
                conditions.alias = { $regex: alias, $options: 'i' };
            }

            const records = await QuestionClassroomModel.find(conditions, null, options);
            const total = await QuestionClassroomModel.count(conditions);
            const data = {
                records,
                total,
                totalRecord: total,
                limit,
                perPage: limit,
                items: records
            };
            return response(res, data, 'Thành công', statusCode.OK);
        } catch (err) {
            logError(err);
            return response(res, null, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }

    async addClassroom(req, res, params) {
        try {
            const classroomID = params.classroom_id || null;
            const questionID = params.question_id || null;

            if (!classroomID || !questionID)
                return response(res, null, 'Request không hợp lệ!', statusCode.ERROR);

            const question = await QuestionModel.findOne({ _id: questionID });
            if (!question)
                return response(res, {}, language.ITEM_NOT_EXIST.replace('%s', language.QUESTION), statusCode.ERROR);

            const classroom = await ClassroomModel.findOne({ _id: classroomID });
            if (!classroom)
                return response(res, {}, language.ITEM_NOT_EXIST.replace('%s', language.CLASSROOM), statusCode.ERROR);

            const docQuestionClassroom = {
                question_id: question.id,
                classroom: { id: classroom.id, code: classroom.code, name: classroom.name },
                deleted_at: null
            };
            const conditions = {};
            conditions.question_id = question.id;
            conditions['classroom.id'] = classroom.id;

            const qClassroom = await QuestionClassroomModel.findOne(conditions);
            let flag = false;
            if (qClassroom && qClassroom.deleted_at) {
                const check = await QuestionClassroomModel.updateOne({ _id: qClassroom.id }, { $set: { deleted_at: null } });
                if (check)
                    flag = true;
            }

            if (!qClassroom) {
                const rs = await QuestionClassroomModel.create(docQuestionClassroom);
                if (rs)
                    flag = true;
            }
            if (qClassroom && !qClassroom.deleted_at) {
                return response(res, {}, 'Lớp này đã được áp dụng cho câu hỏi này!', statusCode.ERROR);
            }

            if (flag) {
                let questionClassrooms = [];
                const questionClassroomID = [];
                if (question.classrooms && question.classrooms.length > 0) {
                    questionClassrooms = question.classrooms;
                    for (let i = 0; i < questionClassrooms.length; i++) {
                        questionClassroomID.push(questionClassrooms[i].id);
                    }
                }

                if (questionClassroomID.indexOf(classroomID) < 0) {
                    questionClassrooms.push({
                        id: classroom.id,
                        code: classroom.code,
                        name: classroom.name
                    });
                }

                await QuestionModel.updateOne({ _id: question.id }, { $set: { classrooms: questionClassrooms } });

                return response(res, {}, 'Thành công', statusCode.OK);
            }

            return response(res, null, language.ERROR, statusCode.ERROR);
        } catch (err) {
            logError(err);
            return response(res, null, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }

    async removeClassroom(req, res, params) {
        try {
            const questionID = params.question_id || null;
            const classroomID = params.classroom_id || null;
            if (!questionID || !classroomID)
                return response(res, null, 'Request không hợp lệ!', statusCode.ERROR);
            const question = await QuestionModel.findOne({ _id: questionID });
            if (!question)
                return response(res, null, language.ITEM_NOT_EXIST.replace('%s', language.QUESTION), statusCode.ERROR);

            const classroom = await ClassroomModel.findOne({ _id: classroomID });
            if (!classroom)
                return response(res, null, language.ITEM_NOT_EXIST.replace('%s', language.CLASSROOM), statusCode.ERROR);

            const conditions = { question_id: questionID };
            conditions['classroom.id'] = classroomID;
            const rs = await QuestionClassroomModel.delete(conditions);
            if (rs.deletedCount) {
                let questionClassrooms = [];

                const pullData = { $pull: { classrooms: { id: classroomID } } };

                if (question.classrooms && question.classrooms.length > 0) {
                    questionClassrooms = question.classrooms;
                    for (let i = 0; i < questionClassrooms.length; i++) {
                        if (questionClassrooms[i].id !== classroomID) {
                            questionClassrooms.push({
                                id: classroom.id,
                                code: classroom.code,
                                name: classroom.name
                            });
                        }
                    }
                }
                await QuestionModel.updateOne({ _id: question.id }, pullData);
                return response(res, null, 'Thành công', statusCode.OK);
            }

            return response(res, null, language.ERROR, statusCode.ERROR);
        } catch (err) {
            logError(err);
            return response(res, {}, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }
}

module.exports = new QuestionController();
