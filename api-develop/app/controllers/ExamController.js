const fs = require('fs');
const readXlsxFile = require('read-excel-file/node');
const config = require('../../config/config');
const appConfig = require('../../config/app');
const BaseHelper = require('../helpers/BaseHelper');
const AppService = require('../services/AppService');
const AwsService = require('../services/AwsService');
const UploadService = require('../services/UploadService');
const ClassroomService = require('../services/ClassroomService');
const QuestionModel = require('../models/Question');
const ExamModel = require('../models/Exam');
const ExamWordModel = require('../models/ExamWord');
const SubjectModel = require('../models/Subject');
const ClassroomModel = require('../models/Classroom');
const ExamClassroomModel = require('../models/ExamClassroom');
const ExamQuestionModel = require('../models/ExamQuestion');
const StudentClassroomModel = require('../models/StudentClassroom');
const TestingModel = require('../models/Testing');
const TestingQuestionModel = require('../models/TestingQuestion');
const UserModel = require('../models/User');
const PointLogModel = require('../models/PointLog');
const ExamPendingModel = require('../models/ExamPending');
const ExamCategoryModel = require('../models/ExamCategory');
const UserService = require('../services/UserService');
const QuestionV2Model = require("../models/Question_v2");
const ExamSectionModel = require("../models/ExamSection");
const ScoreHistoryModel = require("../models/ScoreHistory");
const c = require('config');
const language = BaseHelper.fileToJSON(`${__dirname}/../languages/vi.json`);

function removeSpacesAndSpecialChars(str) {
    console.log('first', str);
    str.replace(/[^a-zA-Z ]/g, "");
    str.replace(/[^\w\s]/gi, '');
    console.log('last', str);
    if (str == '')
        return "NOT_FOUND_999999";
    return str;
}
class ExamController {
    async listPublic(req, res, params) {
        try {
            const keyword = params.keyword || false;
            const page = parseInt(params.page || appConfig.PAGINATION.PAGE);
            const limit = 12;
            let conditions = { deleted_at: null, group: 'THI_THU' };
            const examCategoryID = params.exam_category_id || null;
            const level = params.level || [];

            const subjectID = params.subject_id || null;
            if (subjectID) {
                if (typeof subjectID === 'object') {
                    conditions['subject.id'] = {
                        $in: subjectID
                    }
                } else {
                    conditions['subject.id'] = { $in: [subjectID] };
                }
            }

            if (examCategoryID) {
                if (typeof examCategoryID === 'object') {
                    conditions['category.id'] = {
                        $in: examCategoryID
                    }
                } else {
                    conditions['category.id'] = { $in: [examCategoryID] };
                }
            }

            if (level.length > 0)
                conditions.level = { $in: level };

            const options = {
                skip: (page - 1) * limit,
                limit: limit,
                sort: { created_at: -1 }
            };

            if (keyword) {
                const keywordTrim = removeSpacesAndSpecialChars(keyword);
                const parserKeyword = keywordTrim.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
                const _code = parseInt(keyword);
                conditions.$or = [
                    { name: { $regex: `\\b${parserKeyword}\\b`, $options: 'i' } }
                ];

                if (!isNaN(_code))
                    conditions.$or.push({ code: _code });
            }
            const records = await ExamModel.find(conditions, null, options);
            const total = await ExamModel.count(conditions);
            let listRecordRS = JSON.parse(JSON.stringify(records));

            const examIds = [];
            for (let i = 0; i < listRecordRS.length; i++) {
                examIds.push(listRecordRS[i]._id);

                let exam_temp = await this.getExamDetailInListPublic(listRecordRS[i]._id);

                listRecordRS[i]['total_time_doing'] = exam_temp['total_time_doing']
                listRecordRS[i]['total_ques'] = exam_temp['total_ques']
                listRecordRS[i]['exam_total_score'] = exam_temp['exam_total_score']
            }

            let testings = [];
            let scoreHistories = [];
            let sid = null;
            if (req.headers.authorization) {
                const decodedToken = UserService.decodeToken(req.headers.authorization);
                if (decodedToken)
                    sid = decodedToken.user_id;
            }

            if (sid) {
                conditions = {
                    'exam.id': {
                        $in: examIds
                    },
                    deleted_at: null,
                    'user.id': sid
                };
                testings = await TestingModel.find(conditions);

                conditions = {
                    'exam_id': {
                        $in: examIds
                    },
                    'user_id': sid,
                    deleted_at: null
                }

                const scoreHistories_db = await ScoreHistoryModel.find(conditions);
                scoreHistories = JSON.parse(JSON.stringify(scoreHistories_db));
                scoreHistories.forEach(function (v) { delete v.exam_section });
            }

            const data = {
                records: listRecordRS,
                totalRecord: total,
                limit: limit,
                testings,
                scoreHistories
            };
            return response(res, data, 'Thành công', statusCode.OK);
        } catch (err) {
            logError(err);
            return response(res, null, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }

    async getExamDetailInListPublic(examId) {
        let total_ques = await QuestionV2Model.count({ exam_id: examId, deleted_at: null });
        let total_time_doing = 0;
        let exam_total_score = 0;
        const exam_db = await ExamModel.findOne({ _id: examId });
        let exam = JSON.parse(JSON.stringify(exam_db));
        const exam_type = exam.type;

        if (exam.creating_type === appConfig.EXAM_CREATING_TYPE.MANUAL) {
            const sections_db = await ExamSectionModel.find({ exam_id: examId });
            let sections = JSON.parse(JSON.stringify(sections_db));
            for (let i = 0; i < sections.length; i++) {
                total_time_doing = total_time_doing + parseInt(sections[i].exam_section_time);
                exam_total_score = exam_total_score + parseInt(sections[i].total_score);
            }

            exam['exam_section'] = sections;
            if (appConfig.NEW_EXAM_TYPE.TOT_NGHIEP === exam_type || appConfig.NEW_EXAM_TYPE.APT === exam_type) {
                exam['total_time_doing'] = parseInt(exam.time);
                exam['total_ques'] = total_ques;
                exam['exam_total_score'] = exam_total_score;
            }

            if (appConfig.NEW_EXAM_TYPE.TSA === exam_type) {
                exam['total_time_doing'] = total_time_doing;
                exam['total_ques'] = total_ques;
                exam['exam_total_score'] = exam_total_score;
            }

            if (appConfig.NEW_EXAM_TYPE.HSA === exam_type) {
                exam['total_time_doing'] = total_time_doing;
                exam['total_ques'] = 150;
                exam['exam_total_score'] = 150;
            }

        }
        return exam;
    }

    async list(req, res, params) {
        try {
            const keyword = params.keyword || false;
            const tags = params.tags || [];
            const page = parseInt(params.page || appConfig.PAGINATION.PAGE);
            const paramslimit = parseInt(params.limit);
            const limitParse = paramslimit === -1 ? 0 : (paramslimit > 0 ? paramslimit : appConfig.PAGINATION.LIMIT);
            const classroomID = params.classroom_id || null;
            const conditions = { deleted_at: null };
            const examStatus = params.exam_status || null;
            const arrExamID = [];
            const creatingType = params.creating_type || null;
            const type = params.type || null;
            const subjectID = params.subject_id || null;
            if (subjectID) {
                conditions['subject.id'] = { $in: [subjectID] };
            }

            if (req.user.user_group == appConfig.USER_GROUP.STUDENT) {
                if (!classroomID)
                    return response(res, null, 'Request không hợp lệ!', statusCode.ERROR);

                const userOnClassroom = await ClassroomService.checkUserOnClassroom(req.user, classroomID, null);
                if (!userOnClassroom)
                    return response(res, {}, 'Bạn đã hết số buổi học. Không thể truy cập Lớp. Vui lòng đóng học phí!', statusCode.ERROR);

                if (examStatus && examStatus == 'PENDING') {
                    const conditionTesting = {};
                    conditionTesting['user.id'] = req.user.user_id;
                    conditionTesting['classroom.id'] = classroomID;
                    conditionTesting.deleted_at = null;
                    conditionTesting.status = appConfig.TESTING_STATUS.PENDING;
                    const testings = await TestingModel.find(conditionTesting);
                    for (let i = 0; i < testings.length; i++) {
                        if (arrExamID.indexOf(testings[i].exam.id) < 0) {
                            arrExamID.push(testings[i].exam.id);
                        }
                    }
                }
            }

            const options = {
                skip: (page - 1) * limitParse,
                limit: limitParse,
                sort: { created_at: -1 }
            };

            const sortKey = params.sort_key || null;
            const sortValue = params.sort_value || null;
            if (sortKey && (sortValue == 1 || sortValue == -1)) {
                options.sort = {};
                options.sort[sortKey] = sortValue;
            }

            if (keyword) {
                const alias = BaseHelper.seoURL(keyword);
                const _code = parseInt(keyword);
                const name = keyword;
                conditions.$or = [
                    { alias: { $regex: alias, $options: 'i' } }
                ];
                conditions.$or.push({ name: { $regex: name, $options: 'i' } });
                if (!isNaN(_code))
                    conditions.$or.push({ code: _code });
            }

            if (tags.length > 0)
                conditions.tags = { $in: tags };

            if (req.user.user_group == appConfig.USER_GROUP.STUDENT) {
                if (arrExamID.length == 0) {
                    return response(res, { total: 0, limit: 20, items: [] }, 'Thành công', statusCode.OK);
                }
                conditions._id = { $in: arrExamID };
            }

            if (req.user.user_group === appConfig.USER_GROUP.TEACHER || req.user.user_group === appConfig.USER_GROUP.SUPPORTER) {
                conditions['subject.id'] = { $in: req.user.subject_ids };
            }

            if (creatingType !== "ALL") {
                if (creatingType === appConfig.EXAM_CREATING_TYPE.MANUAL) {
                    conditions['creating_type'] = appConfig.EXAM_CREATING_TYPE.MANUAL
                } else {
                    conditions.creating_type = { $ne: appConfig.EXAM_CREATING_TYPE.MANUAL };
                }
            }

            const records = await ExamModel.find(conditions, null, options);
            
            const total = await ExamModel.count(conditions) + await ExamWordModel.count(conditions);
            let examwordWithType = [];
            let examwordWithType2 = [];
            const recordsWithType = records.map(record => ({
                ...record.toObject(),
                type: 'default'
            }));
            if (type === "DE_THI") {
                conditions.group = "MAC_DINH";
                const examword = await ExamWordModel.find(conditions, null, options);
                 examwordWithType = examword.map(word => ({
                    ...word.toObject(),
                    name: "(Word) " + word.name,
                    type: 'word'
                }));
                conditions.group = "SACH_ID";
                const examword2 = await ExamWordModel.find(conditions, null, options);
                 examwordWithType2 = examword2.map(word => ({
                    ...word.toObject(),
                    name: "(Sách ID) " + word.name,
                    type: 'SACH_ID'
                }));
            }

            const allRecords = [...recordsWithType, ...examwordWithType,...examwordWithType2];
            const data = {
                records: allRecords,
                total,
                limit: limitParse,
                totalRecord: total,
                perPage: limitParse,
                items: allRecords
            };
            return response(res, data, 'Thành công', statusCode.OK);
        } catch (err) {
            logError(err);
            console.log(err)
            return response(res, null, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }

    async listByCategory(req, res, params) {
        try {
            const keyword = params.keyword || false;
            const tags = params.tags || [];
            const page = parseInt(params.page || appConfig.PAGINATION.PAGE);
            const limit = parseInt(params.limit || appConfig.PAGINATION.LIMIT);
            const classroomID = params.classroom_id || null;
            const conditions = { deleted_at: null };
            const examStatus = params.exam_status || null;
            const arrExamID = [];

            const subjectID = params.subject_id || null;
            if (subjectID) {
                conditions['subject.id'] = { $in: [subjectID] };
            }

            if (req.user.user_group == appConfig.USER_GROUP.STUDENT) {
                if (!classroomID)
                    return response(res, null, 'Request không hợp lệ!', statusCode.ERROR);

                const userOnClassroom = await ClassroomService.checkUserOnClassroom(req.user, classroomID, null);
                if (!userOnClassroom)
                    return response(res, {}, 'Bạn đã hết số buổi học. Không thể truy cập Lớp. Vui lòng đóng học phí!', statusCode.ERROR);

                if (examStatus && examStatus == 'PENDING') {
                    const conditionTesting = {};
                    conditionTesting['user.id'] = req.user.user_id;
                    conditionTesting['classroom.id'] = classroomID;
                    conditionTesting.deleted_at = null;
                    conditionTesting.status = appConfig.TESTING_STATUS.PENDING;
                    const testings = await TestingModel.find(conditionTesting);
                    for (let i = 0; i < testings.length; i++) {
                        if (arrExamID.indexOf(testings[i].exam.id) < 0) {
                            arrExamID.push(testings[i].exam.id);
                        }
                    }
                }
            }

            const options = {
                skip: (page - 1) * limit,
                limit: limit,
                sort: { created_at: -1 }
            };

            if (keyword) {
                const alias = BaseHelper.seoURL(keyword);
                const _code = parseInt(keyword);
                conditions.$or = [
                    { alias: { $regex: alias, $options: 'i' } }
                ];

                if (!isNaN(_code))
                    conditions.$or.push({ code: _code });
            }

            if (tags.length > 0)
                conditions.tags = { $in: tags };

            if (req.user.user_group == appConfig.USER_GROUP.STUDENT) {
                if (arrExamID.length == 0) {
                    return response(res, { total: 0, limit: 20, items: [] }, 'Thành công', statusCode.OK);
                }
                conditions._id = { $in: arrExamID };
            }

            if (req.user.user_group === appConfig.USER_GROUP.TEACHER || req.user.user_group === appConfig.USER_GROUP.SUPPORTER) {
                conditions['subject.id'] = { $in: req.user.subject_ids };
            }

            const records = await ExamModel.find(conditions, null, options);
            const total = await ExamModel.count(conditions);
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

    async countPending(req, res, params) {
        try {
            const classroomID = params.classroom_id || null;
            const chapterID = params.chapter_id || null;
            const categoryID = params.category_id || null;

            let conditions = {};
            conditions = {
                'classroom.id': classroomID,
                status: 'SENT'
            };
            const totalTesting = await ExamClassroomModel.count(conditions);

            return response(res, totalTesting, 'Thành công', statusCode.OK);
        } catch (err) {
            logError(err);
            return response(res, null, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }

    async getPreExam(req, res, params) {
        try {
            const examID = params.exam_id || null;
            const conditions = { _id: examID };
            let projections = '_id code name type subject questions chapters started_at doc_link doc_type video_link finished_at created_at updated_at time';

            const exam = await ExamModel.findOne(conditions, projections);
            if (!exam)
                return response(res, {}, language.EXAM_NOT_EXIST, statusCode.ERROR);


            projections = '_id question level';

            const _questions = await QuestionModel.find({ _id: { $in: exam.questions } }, projections);
            const questions = [];
            for (let i = 0; i < exam.questions.length; i++) {
                for (let j = 0; j < _questions.length; j++) {
                    if (_questions[j].id === exam.questions[i]) {
                        questions.push(_questions[j]);
                        break;
                    }
                }
            }

            const data = { exam, questions };

            return response(res, data, 'Thành công', statusCode.OK);
        } catch (err) {
            logError(err);
            return response(res, null, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }

    async detail(req, res, params) {
        try {
            const { id } = params;
            const classroomID = params.classroom_id || null;
            const type = params.type || null;

            let conditions = { _id: id };
            let projections = null;
            let examClassroom = null;
            if (req.user.user_group == appConfig.USER_GROUP.STUDENT)
                projections = '_id code name type subject chapters started_at configs doc_link finished_at created_at updated_at time questions doc_type group';

            const exam = await ExamModel.findOne(conditions, projections);
            if (!exam)
                return response(res, {}, language.EXAM_NOT_EXIST, statusCode.ERROR);

            const examGroup = exam.group || 'MAC_DINH'; // THI_THU, MAC_DINH
            if (examGroup === 'THI_THU') {
                // Tim lop de nay duoc ap dung neu khong co classroomID
            }

            const currentTime = new Date();

            if (classroomID && classroomID != 'ID') {
                conditions = { exam_id: id };
                conditions['classroom.id'] = classroomID;
                examClassroom = await ExamClassroomModel.findOne(conditions);
                if (req.user.user_group == appConfig.USER_GROUP.STUDENT) {
                    if (!examClassroom) {
                        return response(res, {}, 'Đề thi không được áp dụng cho Lớp này!', statusCode.ERROR);
                    }

                    if (examClassroom.started_at) {
                        const startTime = new Date(examClassroom.started_at);
                        if (currentTime < startTime) {
                            return response(res, {}, 'Chưa đến giờ thi. Vui lòng thử lại khi đề thi được mở. Xin cảm ơn!', statusCode.ERROR);
                        }
                    }

                    if (!exam.time && examClassroom.started_at && examClassroom.finished_at) {
                        const startedTime = new Date(examClassroom.started_at);
                        const finishedTime = new Date(examClassroom.finished_at);
                        const seconds = BaseHelper.diffDateSecond(finishedTime, startedTime);
                        exam.time = seconds / 60;
                    }
                }
            }

            let userTesting = null;

            if (req.user.user_group == appConfig.USER_GROUP.STUDENT) {
                // Check xem đã làm bài hay chưa
                const _cond = {
                    'exam.id': id,
                    'user.id': req.user.user_id
                };
                userTesting = await TestingModel.findOne(_cond);
            }

            if (req.user.user_group == appConfig.USER_GROUP.STUDENT) {
                projections = '_id question question_json level';
            } else {
                projections = '_id question question_json level code answer doc_link video_link created_at chapter category subject answer_content';
            }

            const _questions = await QuestionModel.find({ _id: { $in: exam.questions } }, projections);
            const questions = [];
            for (let i = 0; i < exam.questions.length; i++) {
                for (let j = 0; j < _questions.length; j++) {
                    if (_questions[j].id === exam.questions[i]) {
                        questions.push(_questions[j]);
                        break;
                    }
                }
            }

            const data = { exam, questions, time_req: currentTime, exam_classroom: examClassroom, userTesting };
            return response(res, data, 'Thành công', statusCode.OK);
        } catch (err) {
            logError(err);
            return response(res, null, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }

    async preview(req, res, params) {
        try {
            const examID = params.exam_id || null;
            const classroomID = params.classroom_id || null;
            let conditions = {
                exam_id: examID,
                'classroom.id': classroomID
            };
            const examClassroom = await ExamClassroomModel.findOne(conditions);
            if (!examClassroom)
                return response(res, {}, 'Bạn không được phép truy cập vào đề thi này!', statusCode.ERROR);

            conditions = { _id: examID };
            const projections = '_id code name type subject chapters started_at doc_link doc_type video_link finished_at created_at updated_at time';

            const exam = await ExamModel.findOne(conditions, projections);
            if (!exam)
                return response(res, {}, language.EXAM_NOT_EXIST, statusCode.ERROR);

            return response(res, exam, 'Thành công', statusCode.OK);
        } catch (err) {
            logError(err);
            return response(res, null, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }

    async create(req, res, _params) {
        try {
            const examData = _params.exam_data || null;
            if (!examData)
                return response(res, null, 'Request không hợp lệ!', statusCode.ERROR);
            const params = JSON.parse(examData);

            const name = params.name || '';
            const creatingType = params.creating_type || appConfig.EXAM_CREATING_TYPE.DEFAULT;
            const type = params.type || appConfig.EXAM_TYPE.TRAC_NGHIEM;
            const questions = params.questions || [];
            const startedAt = params.started_at || null;
            const finishedAt = params.finished_at || null;
            let docLink = params.doc_link || null;
            const videoLink = params.video_link || null;
            const subjectID = params.subject_id || null;
            const configQuestion = params.configs || [];
            const chapters = params.chapter_ids || [];
            let timeExam = params.time || null;
            const docType = params.doc_type || 'PDF';
            const tp = params.tp || null;
            const month = params.month || null;
            const categoryID = params.category_id || null;
            const isRedo = params.is_redo || false;
            const group = params.group || 'MAC_DINH';
            const examDocLink = params.exam_doc_link || null;
            const level = params.level || null;

            if (!name)
                return response(res, null, language.EXAM_NAME_EMPTY, statusCode.ERROR);

            if (!subjectID)
                return response(res, null, language.CANNOT_EMPTY.replace('%s', language.SUBJECT), statusCode.ERROR);

            const subject = await SubjectModel.findOne({ _id: subjectID });
            if (!subject)
                return response(res, null, language.ITEM_NOT_EXIST.replace('%s', language.SUBJECT), statusCode.ERROR);

            if (!timeExam)
                return response(res, null, 'Vui lòng nhập thời gian làm bài thi.', statusCode.ERROR);

            timeExam = parseInt(timeExam);

            const alias = await BaseHelper.seoURL(name);
            let exam = null;

            if (creatingType === appConfig.EXAM_CREATING_TYPE.AUTO) {
                if (configQuestion.length <= 0)
                    return response(res, null, language.QUESTION_CONFIG_INVALID, statusCode.ERROR);
                for (let i = 0; i < configQuestion.length; i++) {
                    const configItem = configQuestion[i];
                    let _question = [];
                    let categoryTotalQuestion = 0;

                    if (configItem.NHAN_BIET > 0) {
                        categoryTotalQuestion = await QuestionModel.count({ 'category.id': configItem.category_id, level: appConfig.QUESTION_LEVEL.NHAN_BIET });
                        const options = {
                            skip: Math.floor(Math.random() * categoryTotalQuestion),
                            limit: configItem.NHAN_BIET
                        };

                        _question = await QuestionModel.find({ 'category.id': configItem.category_id, level: appConfig.QUESTION_LEVEL.NHAN_BIET }, null, options);
                        for (let q = 0; q < _question.length; q++) {
                            if (questions.indexOf(_question[q].id) < 0)
                                questions.push(_question[q].id);
                        }
                    }

                    if (configItem.THONG_HIEU > 0) {
                        categoryTotalQuestion = await QuestionModel.count({ 'category.id': configItem.category_id, level: appConfig.QUESTION_LEVEL.THONG_HIEU });
                        const options = {
                            skip: Math.floor(Math.random() * categoryTotalQuestion),
                            limit: configItem.THONG_HIEU
                        };

                        _question = await QuestionModel.find({ 'category.id': configItem.category_id, level: appConfig.QUESTION_LEVEL.THONG_HIEU }, null, options);
                        for (let q = 0; q < _question.length; q++) {
                            if (questions.indexOf(_question[q].id) < 0)
                                questions.push(_question[q].id);
                        }
                    }

                    if (configItem.VAN_DUNG > 0) {
                        categoryTotalQuestion = await QuestionModel.count({ 'category.id': configItem.category_id, level: appConfig.QUESTION_LEVEL.VAN_DUNG });
                        const options = {
                            skip: Math.floor(Math.random() * categoryTotalQuestion),
                            limit: configItem.VAN_DUNG
                        };

                        _question = await QuestionModel.find({ 'category.id': configItem.category_id, level: appConfig.QUESTION_LEVEL.VAN_DUNG }, null, options);
                        for (let q = 0; q < _question.length; q++) {
                            if (questions.indexOf(_question[q].id) < 0)
                                questions.push(_question[q].id);
                        }
                    }

                    if (configItem.VAN_DUNG_CAO > 0) {
                        categoryTotalQuestion = await QuestionModel.count({ 'category.id': configItem.category_id, level: appConfig.QUESTION_LEVEL.VAN_DUNG_CAO });
                        const options = {
                            skip: Math.floor(Math.random() * categoryTotalQuestion),
                            limit: configItem.VAN_DUNG_CAO
                        };

                        _question = await QuestionModel.find({ 'category.id': configItem.category_id, level: appConfig.QUESTION_LEVEL.VAN_DUNG_CAO }, null, options);
                        for (let q = 0; q < _question.length; q++) {
                            if (questions.indexOf(_question[q].id) < 0)
                                questions.push(_question[q].id);
                        }
                    }
                }
            }

            if (docLink && docLink != 'null' && docType == 'GOOGLE_DRIVE' && docLink && docLink.indexOf('google.com') < 0)
                return response(res, null, 'Link tài liệu không đúng định dạng Google Drive', statusCode.ERROR);

            if (docType === 'PDF') {
                const { files } = req;
                if (files && files[0]) {
                    const fileData = await UploadService.upload(files, 'binary', 'doc-exams');
                    if (fileData && fileData.length > 0) {
                        docLink = config.FILE_DOMAIN + '/' + fileData[0];
                    }
                }
            }

            const docExam = {
                name: name,
                alias: alias,
                type: type,
                group,
                level,
                creating_type: creatingType,
                subject: { id: subject.id, name: subject.name },
                doc_link: docLink,
                doc_type: docType,
                video_link: videoLink,
                exam_doc_link: examDocLink,
                started_at: startedAt,
                finished_at: finishedAt,
                time: timeExam,
                chapters: chapters,
                configs: configQuestion,
                questions: questions,
                is_redo: isRedo,
            };

            if (categoryID) {
                const category = await ExamCategoryModel.findOne({ _id: categoryID });
                if (category)
                    docExam.category = { id: category.id, name: category.name };
            }

            if (tp)
                docExam.tp = parseFloat(tp);

            if (month)
                docExam.month = parseInt(month);

            exam = await AppService.createExam(docExam);
            if (!exam)
                return response(res, {}, language.ERROR, statusCode.ERROR);
            for (let i = 0; i < questions.length; i++) {
                const docExamQuestion = {
                    exam_id: exam.id,
                    question_id: questions[i],
                    deleted_at: null
                };
                const check = await ExamQuestionModel.findOne(docExamQuestion);
                if (!check)
                    await ExamQuestionModel.create(docExamQuestion);
            }
            return response(res, exam, 'Thành công', statusCode.OK);
        } catch (err) {
            logError(err);
            return response(res, {}, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }

    async update(req, res, _params) {
        try {
            const examData = _params.exam_data || null;
            if (!examData)
                return response(res, null, 'Request không hợp lệ!', statusCode.ERROR);
            const params = JSON.parse(examData);

            const id = params.id || false;
            const name = params.name || '';
            const type = params.type || appConfig.EXAM_TYPE.TRAC_NGHIEM;
            const questions = params.questions || [];
            const startedAt = params.started_at || null;
            const finishedAt = params.finished_at || null;
            const docLink = params.doc_link || null;
            const videoLink = params.video_link || null;
            const code = params.code || null;
            const subjectID = params.subject_id || null;
            const configQuestion = params.configs || [];
            const chapters = params.chapter_ids || [];
            const timeExam = params.time || null;
            const creatingType = params.creating_type || appConfig.EXAM_CREATING_TYPE.DEFAULT;
            const docType = params.doc_type || 'PDF';
            const tp = params.tp || null;
            const month = params.month || null;
            const categoryID = params.category_id || null;
            const isRedo = params.is_redo || false;
            const group = params.group || 'MAC_DINH';
            const examDocLink = params.exam_doc_link || null;
            const level = params.level || null;

            if (!id)
                return response(res, null, 'Request không hợp lệ!', statusCode.OK);

            const exam = await ExamModel.findOne({ _id: id });
            if (!exam)
                return response(res, {}, language.EXAM_NOT_EXIST, statusCode.ERROR);
            if (!subjectID)
                return response(res, null, language.CANNOT_EMPTY.replace('%s', language.SUBJECT), statusCode.ERROR);

            let subject = null;
            if (subjectID)
                subject = await SubjectModel.findOne({ _id: subjectID });

            if (!subject)
                return response(res, null, language.ITEM_NOT_EXIST.replace('%s', language.SUBJECT), statusCode.ERROR);

            const alias = BaseHelper.seoURL(name);
            if (name) {
                exam.name = name;
                exam.alias = alias;
            }

            if (code)
                exam.code = code;

            if (docLink && docLink != 'null') {
                exam.doc_link = docLink;
                if (docType == 'GOOGLE_DRIVE' && docLink && docLink.indexOf('google.com') < 0)
                    return response(res, null, 'Link tài liệu không đúng định dạng Google Drive', statusCode.ERROR);
            }

            if (docType === 'PDF') {
                const { files } = req;
                if (files && files[0]) {
                    const fileData = await UploadService.upload(files, 'binary', 'doc-exams');
                    if (fileData && fileData.length > 0) {
                        exam.doc_link = config.FILE_DOMAIN + '/' + fileData[0];
                    }
                }
            }

            if (docType)
                exam.doc_type = docType;

            if (videoLink)
                exam.video_link = videoLink;

            if (examDocLink)
                exam.exam_doc_link = examDocLink;

            if (startedAt)
                exam.started_at = startedAt;

            if (finishedAt)
                exam.finished_at = finishedAt;

            if (chapters)
                exam.chapters = chapters;

            if (configQuestion)
                exam.configs = configQuestion;

            if (subjectID)
                exam.subject = { id: subject.id, name: subject.name };

            if (categoryID) {
                const category = await ExamCategoryModel.findOne({ _id: categoryID });
                if (category)
                    exam.category = { id: category.id, name: category.name };
            }

            if (timeExam)
                exam.time = timeExam;

            exam.type = type;
            exam.group = group;
            exam.is_redo = isRedo;
            exam.creating_type = creatingType;

            if (level)
                exam.level = level;

            if (tp)
                exam.tp = parseFloat(tp);

            if (month)
                exam.month = parseInt(month);

            if (creatingType === appConfig.EXAM_CREATING_TYPE.AUTO) {
                if (configQuestion.length <= 0)
                    return response(res, null, language.QUESTION_CONFIG_INVALID, statusCode.ERROR);
                for (let i = 0; i < configQuestion.length; i++) {
                    const configItem = configQuestion[i];
                    let _question = [];
                    let categoryTotalQuestion = 0;

                    if (configItem.NHAN_BIET > 0) {
                        categoryTotalQuestion = await QuestionModel.count({ 'category.id': configItem.category_id, level: appConfig.QUESTION_LEVEL.NHAN_BIET });
                        const options = {
                            skip: Math.floor(Math.random() * categoryTotalQuestion),
                            limit: configItem.NHAN_BIET
                        };

                        _question = await QuestionModel.find({ 'category.id': configItem.category_id, level: appConfig.QUESTION_LEVEL.NHAN_BIET }, null, options);
                        for (let q = 0; q < _question.length; q++) {
                            if (questions.indexOf(_question[q].id) < 0)
                                questions.push(_question[q].id);
                        }
                    }

                    if (configItem.THONG_HIEU > 0) {
                        categoryTotalQuestion = await QuestionModel.count({ 'category.id': configItem.category_id, level: appConfig.QUESTION_LEVEL.THONG_HIEU });
                        const options = {
                            skip: Math.floor(Math.random() * categoryTotalQuestion),
                            limit: configItem.THONG_HIEU
                        };

                        _question = await QuestionModel.find({ 'category.id': configItem.category_id, level: appConfig.QUESTION_LEVEL.THONG_HIEU }, null, options);
                        for (let q = 0; q < _question.length; q++) {
                            if (questions.indexOf(_question[q].id) < 0)
                                questions.push(_question[q].id);
                        }
                    }

                    if (configItem.VAN_DUNG > 0) {
                        categoryTotalQuestion = await QuestionModel.count({ 'category.id': configItem.category_id, level: appConfig.QUESTION_LEVEL.VAN_DUNG });
                        const options = {
                            skip: Math.floor(Math.random() * categoryTotalQuestion),
                            limit: configItem.VAN_DUNG
                        };

                        _question = await QuestionModel.find({ 'category.id': configItem.category_id, level: appConfig.QUESTION_LEVEL.VAN_DUNG }, null, options);
                        for (let q = 0; q < _question.length; q++) {
                            if (questions.indexOf(_question[q].id) < 0)
                                questions.push(_question[q].id);
                        }
                    }

                    if (configItem.VAN_DUNG_CAO > 0) {
                        categoryTotalQuestion = await QuestionModel.count({ 'category.id': configItem.category_id, level: appConfig.QUESTION_LEVEL.VAN_DUNG_CAO });
                        const options = {
                            skip: Math.floor(Math.random() * categoryTotalQuestion),
                            limit: configItem.VAN_DUNG_CAO
                        };

                        _question = await QuestionModel.find({ 'category.id': configItem.category_id, level: appConfig.QUESTION_LEVEL.VAN_DUNG_CAO }, null, options);
                        for (let q = 0; q < _question.length; q++) {
                            if (questions.indexOf(_question[q].id) < 0)
                                questions.push(_question[q].id);
                        }
                    }
                }
            }

            if (questions)
                exam.questions = questions;

            const rs = await ExamModel.updateOne({ _id: id }, { $set: exam });
            if (rs.nModified) {
                for (let i = 0; i < questions.length; i++) {
                    const docExamQuestion = {
                        exam_id: exam.id,
                        question_id: questions[i],
                        deleted_at: null
                    };
                    const check = await ExamQuestionModel.findOne(docExamQuestion);
                    if (!check)
                        await ExamQuestionModel.create(docExamQuestion);
                }
                return response(res, exam, 'Thành công', statusCode.OK);
            }

            return response(res, null, language.ERROR, statusCode.ERROR);
        } catch (err) {
            logError(err);
            return response(res, {}, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }

    async copy(req, res, params) {
        try {
            const id = params.exam_id || false;
            if (!id)
                return response(res, null, 'Request không hợp lệ!', statusCode.OK);

            const examObj = await ExamModel.findOne({ _id: id });
            if (!examObj)
                return response(res, {}, language.EXAM_NOT_EXIST, statusCode.ERROR);

            const docExam = examObj.toObject();
            delete docExam._id;
            delete docExam.code;

            docExam.name += '-Copy';
            docExam.alias += '-copy';

            const exam = await AppService.createExam(docExam);
            if (!exam)
                return response(res, {}, language.ERROR, statusCode.ERROR);

            const questions = docExam.questions;
            for (let i = 0; i < questions.length; i++) {
                const docExamQuestion = {
                    exam_id: exam.id,
                    question_id: questions[i],
                    deleted_at: null
                };
                const check = await ExamQuestionModel.findOne(docExamQuestion);
                if (!check)
                    await ExamQuestionModel.create(docExamQuestion);
            }
            return response(res, exam, 'Thành công', statusCode.OK);
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

            const rs = await ExamModel.delete({ _id: { $in: ids } }, true);

            if (rs) {
                // Xoa ExamClassroom, Testing, Point Log
                let conditions = { exam_id: { $in: ids } };
                await ExamClassroomModel.delete(conditions);
                conditions = {};
                conditions['exam.id'] = { $in: ids };
                await TestingModel.delete(conditions, true);
                await PointLogModel.delete(conditions, true);
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
            const examID = params.exam_id || null;
            const page = parseInt(params.page || appConfig.PAGINATION.PAGE);
            const limit = parseInt(params.limit || appConfig.PAGINATION.LIMIT);
            if (!examID)
                return response(res, null, 'Request không hợp lệ!', statusCode.ERROR);

            const conditions = {};
            conditions.exam_id = examID;
            const options = {
                skip: (page - 1) * limit,
                limit: limit,
                sort: { updated_at: -1 }
            };

            if (keyword) {
                const alias = BaseHelper.seoURL(keyword);
                conditions.alias = { $regex: alias, $options: 'i' };
            }

            const records = await ExamClassroomModel.find(conditions, null, options);
            const total = await ExamClassroomModel.count(conditions);
            const data = {
                total: total,
                totalRecord: total,
                records,
                limit: limit,
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
            const examID = params.exam_id || null;
            const classroomID = params.classroom_id || null;
            if (!examID || !classroomID)
                return response(res, null, 'Request không hợp lệ!', statusCode.ERROR);
            const exam = await ExamModel.findOne({ _id: examID });
            if (!exam)
                return response(res, null, language.ITEM_NOT_EXIST.replace('%s', language.EXAM), statusCode.ERROR);

            const classroom = await ClassroomModel.findOne({ _id: classroomID });
            if (!classroom)
                return response(res, null, language.ITEM_NOT_EXIST.replace('%s', language.CLASSROOM), statusCode.ERROR);
            let examClassroom = await ExamClassroomModel.findOne({ exam_id: examID, 'classroom.id': classroomID });
            if (examClassroom)
                return response(res, null, 'Lớp này đã được áp dụng cho đề thi này!', statusCode.ERROR);

            const docExamClassroom = {
                type: exam.type,
                exam_id: examID,
                exam: {
                    id: exam.id,
                    name: exam.name,
                    code: exam.code
                },
                classroom: {
                    id: classroomID,
                    name: classroom.name,
                    code: classroom.code
                },
                subject: classroom.subject,
                status: 'PENDING'
            };
            examClassroom = await ExamClassroomModel.create(docExamClassroom);
            if (examClassroom) {
                return response(res, examClassroom, 'Thành công', statusCode.OK);
            }

            return response(res, null, language.ERROR, statusCode.ERROR);
        } catch (err) {
            logError(err);
            return response(res, {}, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }

    async removeClassroom(req, res, params) {
        try {
            const examID = params.exam_id || null;
            const classroomID = params.classroom_id || null;
            if (!examID || !classroomID)
                return response(res, null, 'Request không hợp lệ!', statusCode.ERROR);
            const exam = await ExamModel.findOne({ _id: examID });
            if (!exam)
                return response(res, null, language.ITEM_NOT_EXIST.replace('%s', language.EXAM), statusCode.ERROR);

            const classroom = await ClassroomModel.findOne({ _id: classroomID });
            if (!classroom)
                return response(res, null, language.ITEM_NOT_EXIST.replace('%s', language.CLASSROOM), statusCode.ERROR);
            const conditions = { exam_id: examID };
            conditions['classroom.id'] = classroomID;
            const rs = await ExamClassroomModel.delete(conditions);
            if (rs.deletedCount)
                return response(res, null, 'Thành công', statusCode.OK);

            return response(res, null, language.ERROR, statusCode.ERROR);
        } catch (err) {
            logError(err);
            return response(res, {}, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }

    async importResult(req, res, params) {
        try {
            const { files } = req;
            const examID = params.exam_id || null;
            const classroomID = params.classroom_id || null;
            if (!examID || !files || !classroomID)
                return response(res, null, 'Request không hợp lệ!', statusCode.ERROR);
            const exam = await ExamModel.findOne({ _id: examID });
            if (!exam)
                return response(res, null, language.ITEM_NOT_EXIST.replace('%s', language.EXAM), statusCode.ERROR);

            const classroom = await ClassroomModel.findOne({ _id: classroomID });
            if (!classroom)
                return response(res, null, language.ITEM_NOT_EXIST.replace('%s', language.CLASSROOM), statusCode.ERROR);

            const arrayTesting = [];
            if (files) {
                const fileData = await AppService.addFile(req.user, files, 'exams');
                const data = [];
                if (fileData && fileData.length > 0) {
                    for (let i = 0; i < fileData.length; i++) {
                        data[i] = appConfig.LOCAL.DIR_TEMP + '/' + fileData[i].file_url;
                        readXlsxFile(data[i]).then(async (rows) => {
                            for (let r = 1; r <= rows.length; r++) {
                                if (rows[r] === undefined || !rows[r][0])
                                    continue;

                                const studentCode = rows[r][0];
                                const score = rows[r][1];
                                const user = await UserModel.findOne({ code: studentCode });
                                // console.log('studentCode: ' + studentCode + '----' + JSON.stringify(user));
                                if (user) {
                                    const userObj = { id: user.id, code: user.code, name: user.fullname };
                                    const examObj = { id: exam.id, code: exam.code, name: exam.name };
                                    const subjectObj = { id: exam.subject.id, code: exam.subject.code, name: exam.subject.name };
                                    const classroomObj = { id: classroom.id, code: classroom.code, name: classroom.name };
                                    const point = Math.round(score * 100) / 100;

                                    const docTesting = {
                                        type: exam.type,
                                        exam: examObj,
                                        subject: subjectObj,
                                        classroom: classroomObj,
                                        user: userObj,
                                        questions: exam.questions,
                                        answers: null,
                                        num_right: null,
                                        num_wrong: null,
                                        point: point,
                                        status: appConfig.TESTING_STATUS.DONE,
                                        started_at: new Date(exam.created_at),
                                        finished_at: new Date(exam.created_at)
                                    };
                                    let testing = await TestingModel.findOne({ user_id: user.id, exam_id: examID });
                                    if (!testing) {
                                        testing = await AppService.createTesting(docTesting);
                                        // console.log('testing' + JSON.stringify(testing));
                                        arrayTesting.push(testing);

                                        const testingObj = { id: testing.id, code: testing.code };
                                        AppService.updatePointLog(testingObj, userObj, examObj, subjectObj, classroomObj, point);
                                        // AppService.updateTestingQuestion(docQuestionObj);
                                    }
                                }
                            }
                        });
                    }

                    return response(res, arrayTesting, 'Thành công', statusCode.OK);
                }
                return response(res, {}, language.ERROR, statusCode.ERROR);
            }

            return response(res, {}, 'Có lỗi xảy ra!', statusCode.ERROR);
        } catch (err) {
            logError(err);
            return response(res, {}, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }

    async report(req, res, params) {
        const examID = params.id || null;
        const classroomID = params.classroom_id || null;
        if (!examID || !classroomID)
            return response(res, {}, 'Request không hợp lệ!', statusCode.ERROR);
        const exam = await ExamModel.findOne({ _id: examID });

        if (!exam)
            return response(res, {}, 'Đề thi không tồn tại!', statusCode.ERROR);

        const conditions = { deleted_at: null };
        conditions['exam.id'] = examID;
        conditions['classroom.id'] = classroomID;
        const options = { sort: { point: -1 } };
        const projections = '_id user exam num_right num_wrong point created_at started_at finished_at';
        const testings = await TestingModel.find(conditions, projections, options);
        let avgPoint = 0;
        let totalPoint = 0;

        let f9 = 0;
        let f89 = 0;
        let f658 = 0;
        let l65 = 0;
        let cl = 0;

        for (let i = 0; i < testings.length; i++) {
            totalPoint += testings[i].point;
            if (testings[i].point > 9)
                f9++;
            if (testings[i].point >= 8 && testings[i].point <= 9)
                f89++;
            if (testings[i].point >= 6.5 && testings[i].point <= 8)
                f658++;
            if (testings[i].point < 6.5)
                l65++;
        }

        cl = testings.length - (f9 + f89 + f658 + l65);

        if (testings.length > 0)
            avgPoint = totalPoint / testings.length;

        const students = await StudentClassroomModel.find({ 'classroom.id': classroomID, deleted_at: null });

        const testingQuestions = await TestingQuestionModel.find({ exam_id: examID, classroom_id: classroomID });

        const data = {
            testings,
            students,
            total_student: students.length,
            avg_point: Math.round(avgPoint),
            total_testing: testings.length,
            testing_questions: testingQuestions,
            f9,
            f89,
            f658,
            l65,
            cl
        };
        return response(res, data, 'Thành công', statusCode.OK);
    }

    async exportPointExcel(req, res, params) {
        if (req.user.user_group !== appConfig.USER_GROUP.ADMIN)
            return response(res, null, language.SCOPE_INVALID, statusCode.FORBIDDEN);

        const examID = params.exam_id || null;
        const classroomID = params.classroom_id || null;
        if (!examID || !classroomID)
            return response(res, {}, 'Request không hợp lệ!', statusCode.ERROR);
        const exam = await ExamModel.findOne({ _id: examID, deleted_at: null });

        if (!exam)
            return response(res, {}, 'Đề thi không tồn tại!', statusCode.ERROR);

        const conditions = { deleted_at: null };
        conditions['exam.id'] = examID;
        conditions['classroom.id'] = classroomID;
        const options = { sort: { point: -1 } };
        const projections = '_id user exam num_right num_wrong point created_at started_at finished_at';
        const testings = await TestingModel.find(conditions, projections, options);

        const classroom = await ClassroomModel.findOne({ _id: classroomID });
        const fileName = await ClassroomService.exportClassroomExamPoint(exam, classroom, testings);
        const streamFile = await fs.readFileSync('./temp/excel/' + fileName);

        download(res, streamFile, fileName, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    }

    async send(req, res, params) {
        try {
            let conditions = {};
            const classroomID = params.classroom_id || null;
            const examID = params.exam_id || null;
            let startedAt = params.started_at || null;
            let finishedAt = params.finished_at || null;
            const isFixedTime = params.is_fixed_time || false; // FIXED_TIME, FREE_TIME
            if (!classroomID || !examID)
                return response(res, null, 'Request không hợp lệ!', statusCode.ERROR);

            if (isFixedTime && (!startedAt || !finishedAt))
                return response(res, null, 'Bạn cần chọn thời gian bắt đầu và thời gian kết thúc cho tùy chọn Đúng giờ.', statusCode.ERROR);

            conditions = {
                deleted_at: null,
                _id: examID
            };
            const exam = await ExamModel.findOne(conditions);
            if (!exam)
                return response(res, null, language.ITEM_NOT_EXIST.replace('%s', language.EXAM), statusCode.ERROR);

            conditions = {
                deleted_at: null,
                _id: classroomID
            };
            const classroom = await ClassroomModel.findOne({ _id: classroomID });
            if (!classroom)
                return response(res, null, language.ITEM_NOT_EXIST.replace('%s', language.CLASSROOM), statusCode.ERROR);

            conditions = {
                deleted_at: null,
                'classroom.id': classroomID
            };
            const totalUserClassroom = await StudentClassroomModel.count(conditions);
            if (!totalUserClassroom || totalUserClassroom <= 0)
                return response(res, null, 'Không có học sinh nào trong lớp này!', statusCode.ERROR);

            if (startedAt)
                startedAt = new Date(startedAt);
            if (finishedAt)
                finishedAt = new Date(finishedAt);

            const docExamPending = {
                type: exam.type,
                is_fixed_time: isFixedTime,
                exam: {
                    id: exam.id,
                    code: exam.code,
                    name: exam.name
                },
                classroom: {
                    id: classroom.id,
                    code: classroom.code,
                    name: classroom.name
                },
                subject: exam.subject,
                is_redo: exam.is_redo || false,
                started_at: startedAt,
                finished_at: finishedAt
            };
            let msg = '';
            const examPending = await ExamPendingModel.create(docExamPending);
            if (examPending)
                msg = 'Gửi đề thi thành công!';

            conditions = {};
            conditions.exam_id = examID;
            conditions['classroom.id'] = classroomID;
            const docExamClassroom = { status: 'SENT' };
            docExamClassroom.started_at = startedAt;
            docExamClassroom.finished_at = finishedAt;
            docExamClassroom.is_fixed_time = isFixedTime;
            docExamClassroom.type = exam.type;
            const rs = await ExamClassroomModel.updateOne(conditions, { $set: docExamClassroom });
            if (rs.nModified) {
                AppService.sendNotifyExam(exam, classroom);
                return response(res, null, msg, statusCode.OK);
            }
            return response(res, null, 'Chưa gửi được đề thi!', statusCode.ERROR);
        } catch (err) {
            logError(err);
            return response(res, null, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }

    async bulkUpdateVideoVimeoQuestion(req, res, params) {
        try {
            const folderID = params.folder_id || null;

            const options = {
                method: 'GET',
                url: 'https://api.vimeo.com/users/159986718/projects/' + folderID + '/videos',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    Authorization: 'Bearer 13079d6d3ce9ed820c880ee2873b09a3'
                },
                json: {
                    page: 1,
                    per_page: 100
                }
            };
            const rs = await BaseHelper.sendRequest(options);
            const links = [];
            if (rs.data && rs.data.length > 0) {
                for (let i = 0; i < rs.data.length; i++) {
                    const _video = rs.data[i];
                    links[i] = _video.link;
                }
            }

            return response(res, links, 'SUCCESS', statusCode.OK);
        } catch (err) {
            logError(err);
            return response(res, null, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }

    async createByApi(req, res, _params) {
        try {
            // Tai file lên S3 -> Lấy URL -> Gọi API bên kia response và show modal ->Apply thì fill vào các câu hỏi -> Save
            const { files } = req;
            if (files && files[0]) {
                const fileData = await UploadService.upload(files, 'binary', 'api-exams');
                let link = null;
                if (fileData && fileData.length > 0)
                    link = 'https://api.luyenthitiendat.vn/exam-download-s3?name=' + fileData[0];

                if (!link)
                    return response(res, {}, 'Không thể tải được FILE', statusCode.ERROR);
                const apiURL = 'https://apix.shub.edu.vn/get?path=' + link;
                const options = {
                    method: 'GET',
                    url: apiURL,
                    headers: {
                        'Authorization': appConfig.SHUB_TOKEN
                    }
                };
                const rs = await BaseHelper.sendRequest(options);
                return response(res, { link: apiURL, rs: rs }, 'Thành công', statusCode.OK);
            }
            return response(res, {}, 'Không thể tải được FILE', statusCode.ERROR);
        } catch (err) {
            logError(err);
            return response(res, {}, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }

    async downloadExamS3(req, res) {
        try {
            const name = req.query.name || null;
            const path = name;
            const content = await AwsService.downFileS3(path);
            download(res, content.Body, name, content.ContentType);
        } catch (err) {
            logError(err);
            return response(res, null, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }
}

module.exports = new ExamController();
