const config = require('../../config/config');
const appConfig = require('../../config/app');
const BaseHelper = require('../helpers/BaseHelper');
const AppService = require('../services/AppService');
const ClassroomService = require('../services/ClassroomService');
const QuestionModel = require('../models/Question');
const ExamModel = require('../models/Exam');
const TestingModel = require('../models/Testing');
const ExamClassroomModel = require('../models/ExamClassroom');
const language = BaseHelper.fileToJSON(`${__dirname}/../languages/vi.json`);

class MyTestingController {
    async list(req, res, params) {
        try {
            const { id, from_date, to_date } = params;
            const page = parseInt(params.page || appConfig.PAGINATION.PAGE);
            let limit = parseInt(params.limit || 50);
            const subjectID = params.subject_id || null;
            const classroomID = params.classroom_id || null;
            const examCode = params.exam_code || null;
            const status = params.status || null;
            const sortingPoint = params.sorting_point || null;

            let conditions = { deleted_at: null };

            if (status)
                conditions.status = status;

            if (classroomID)
                conditions['classroom.id'] = classroomID;

            if (subjectID)
                conditions['subject.id'] = subjectID;

            if (examCode)
                conditions['exam.code'] = examCode;

            conditions['user.id'] = req.user.user_id;

            if (from_date) {
                conditions.created_at = {
                    $gte: new Date(from_date)
                };
            }

            if (to_date) {
                conditions.created_at = {
                    $lte: new Date(to_date)
                };  
            }

            const options = {
                skip: (page - 1) * limit,
                limit: limit,
                sort: { created_at: -1 }
            };

            if (sortingPoint !== null && (sortingPoint === 1 || sortingPoint === -1)) {
                options.sort.point = sortingPoint;
                delete options.sort.created_at;
            }

            const sortKey = params.sort_key || null;
            const sortValue = params.sort_value || null;
            if (sortKey && (sortValue == 1 || sortValue == -1)) {
                options.sort = {};
                options.sort[sortKey] = sortValue;
            }

            const records = await TestingModel.find(conditions, null, options);
            const total = await TestingModel.count(conditions);

            const data = {
                records,
                totalRecord: total,
                perPage: limit
            };
            return response(res, data, 'Thành công', statusCode.OK);
        } catch (err) {
            console.log(err);
            logError(err);
            return response(res, null, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }

    async result(req, res, params) {
        try {
            const { exam_id, classroom_id, user_id } = params;
            let conditions = { deleted_at: null };
            conditions['exam.id'] = exam_id;
            conditions['classroom.id'] = classroom_id;
            conditions['user.id'] = user_id;

            const testing = await TestingModel.findOne(conditions);
            if (!testing || testing.deleted_at)
                return response(res, {}, language.TESTING_NOT_EXIST, statusCode.ERROR);


            const userOnClassroom = await ClassroomService.checkUserOnClassroom(req.user, testing.classroom.id, null);
            if (!userOnClassroom)
                return response(res, {}, 'Bạn đã hết số buổi học. Không thể truy cập Lớp. Vui lòng đóng học phí!', statusCode.ERROR);

            const exam = await ExamModel.findOne({ _id: testing.exam.id });
            if (!exam || exam.deleted_at)
                return response(res, {}, language.EXAM_NOT_EXIST, statusCode.ERROR);
            const projections = '_id question level answer';
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

            testing.comment = BaseHelper.getTestingCommentByPoint(testing.point);
            const data = {
                testing,
                exam,
                questions
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
            let conditions = {};
            conditions = { _id: id };
            if (req.user.user_group == appConfig.USER_GROUP.STUDENT)
                conditions['user.id'] = req.user.user_id;

            const testing = await TestingModel.findOne(conditions);
            if (!testing || testing.deleted_at)
                return response(res, {}, language.TESTING_NOT_EXIST, statusCode.ERROR);


            const userOnClassroom = await ClassroomService.checkUserOnClassroom(req.user, testing.classroom.id, null);
            if (!userOnClassroom)
                return response(res, {}, 'Bạn đã hết số buổi học. Không thể truy cập Lớp. Vui lòng đóng học phí!', statusCode.ERROR);

            const exam = await ExamModel.findOne({ _id: testing.exam.id });
            if (!exam || exam.deleted_at)
                return response(res, {}, language.EXAM_NOT_EXIST, statusCode.ERROR);
            let projections = null;
            if (req.user.user_group == appConfig.USER_GROUP.STUDENT)
                projections = '_id question level answer question_json';
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

            const options = {
                skip: 0,
                limit: 50,
                sort: { point: -1 }
            };
            conditions = {};
            conditions['exam.id'] = exam.id;
            conditions['classroom.id'] = testing.classroom.id;
            conditions.deleted_at = null;

            const topTestings = await TestingModel.find(conditions, null, options);

            const data = {
                testing,
                exam,
                questions,
                top_testings: topTestings
            };
            return response(res, data, 'Thành công', statusCode.OK);
        } catch (err) {
            logError(err);
            return response(res, null, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }

    async sendPreTest(req, res, params) {
        try {
            const examID = params.exam_id || null;
            const email = params.email || null;
            const phone = params.phone || null;
            const answers = params.answers || [];
            let user_started_at = params.user_started_at;
            if (user_started_at)
                user_started_at = new Date(user_started_at);
            else
                user_started_at = new Date();

            if (!examID)
                return response(res, null, 'Request không hợp lệ!', statusCode.ERROR);

            const exam = await ExamModel.findOne({ _id: examID });

            if (!exam)
                return response(res, null, language.EXAM_NOT_EXIST, statusCode.ERROR);

            const pointPerQuestion = 10 / exam.questions.length;
            let point = 0;
            let numRight = 0;
            let numWrong = 0;
            const questions = await QuestionModel.find({ _id: { $in: exam.questions } });
            const docQuestionObj = [];
            const failQuestions = [];
            let f = 0;
            const examAnswers = [];
            for (let i = 0; i < questions.length; i++) {
                const _examAnswerItem = {
                    question_id: questions[i].id,
                    value: questions[i].answer
                };
                examAnswers.push(_examAnswerItem);

                docQuestionObj.push({
                    question_id: questions[i].id,
                    question_code: questions[i].code,
                    is_right: false,
                    exam_id: examID
                });
                for (let j = 0; j < answers.length; j++) {
                    if (questions[i].id == answers[j].question_id && answers[j].value == questions[i].answer) {
                        point += pointPerQuestion;
                        numRight += 1;
                        docQuestionObj[i].is_right = true;
                        break;
                    } else {

                        const _q = questions[i].toObject();
                        delete _q.doc_type;
                        delete _q.deleted_at;
                        delete _q.status;
                        delete _q.classrooms;
                        delete _q.doc_type;
                        delete _q.doc_type;
                        delete _q.doc_type;
                        delete _q.code;
                        delete _q._id;
                        if (f >= 3) {
                            delete _q.doc_link;
                            delete _q.question;
                            delete _q.video_link;
                            delete _q.answer;
                            delete _q.answer_content;
                        }
                        failQuestions.push(_q);
                        f++;
                    }
                }
            }

            numWrong = questions.length - numRight;
            const userObj = { email, phone };
            const examObj = { id: exam.id, code: exam.code, name: exam.name };
            point = Math.round(point * 100) / 100;
            const totalTime = BaseHelper.diffDateSecond(new Date(), user_started_at) / 60;
            const user_time = Math.round(totalTime * 100) / 100;
            const result = {
                type: exam.type,
                exam: examObj,
                user: userObj,
                questions: exam.questions,
                examAnswers,
                answers,
                num_right: numRight,
                num_wrong: numWrong,
                point: point,
                fail_questions: failQuestions,
                status: appConfig.TESTING_STATUS.DONE,
                time_sent: new Date(),
                user_started_at: user_started_at,
                user_time: user_time
            };

            return response(res, { result }, 'Thành công', statusCode.OK);
        } catch (err) {
            logError(err);
            return response(res, {}, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }

    async create(req, res, params) {
        try {
            const examID = params.exam_id || null;
            const answers = params.answers || [];
            let classroomID = params.classroom_id || null;
            const testingType = params.testing_type || appConfig.EXAM_TYPE.TRAC_NGHIEM;
            let user_started_at = params.user_started_at;
            const group = params.type || appConfig.EXAM_GROUP.MAC_DINH;

            if (user_started_at)
                user_started_at = new Date(user_started_at);
            else
                user_started_at = new Date();

            if (!examID)
                return response(res, null, 'Request không hợp lệ!', statusCode.ERROR);

            const exam = await ExamModel.findOne({ _id: examID });
            if (!exam)
                return response(res, null, language.EXAM_NOT_EXIST, statusCode.ERROR);

            if (group === appConfig.EXAM_GROUP.MAC_DINH && classroomID) {
                const userOnClassroom = await ClassroomService.checkUserOnClassroom(req.user, classroomID, null);
                if (!userOnClassroom)
                    return response(res, {}, 'Bạn đã hết số buổi học. Không thể truy cập Lớp. Vui lòng đóng học phí!', statusCode.ERROR);
            }

            let startedAt = null;
            let finishedAt = null;
            let conditions = { deleted_at: null };
            conditions.exam_id = examID;
            let examClassroom;
            if (group === appConfig.EXAM_GROUP.MAC_DINH && classroomID) {
                conditions['classroom.id'] = classroomID;
                examClassroom = await ExamClassroomModel.findOne(conditions);
                if (!examClassroom || !examClassroom.classroom)
                    return response(res, null, 'Đề thi này chưa được áp dụng cho lớp này!', statusCode.ERROR);
                classroomID = examClassroom.classroom.id;
            }

            const currentTime = new Date();
            if (group === appConfig.EXAM_GROUP.MAC_DINH && examClassroom) {
                startedAt = examClassroom.started_at;
                finishedAt = examClassroom.finished_at;
                if (startedAt)
                    startedAt = new Date(startedAt);

                if (finishedAt) {
                    finishedAt = new Date(finishedAt);
                    finishedAt = BaseHelper.addMinute(finishedAt, 10);
                    if (examClassroom.is_fixed_time && currentTime > finishedAt) {
                        return response(res, {}, 'Đã hết giờ nộp bài. Xin cảm ơn!', statusCode.ERROR);
                    }
                }
            }

            const pointPerQuestion = 10 / exam.questions.length;
            let point = 0;
            let numRight = 0;
            let numWrong = 0;
            const questions = await QuestionModel.find({ _id: { $in: exam.questions } });
            const docQuestionObj = [];
            const examAnswers = [];
            for (let i = 0; i < questions.length; i++) {
                const _questionItem = {
                    question_id: questions[i].id,
                    question_code: questions[i].code,
                    is_right: false,
                    exam_id: examID
                };

                if (classroomID)
                    _questionItem.classroom_id = classroomID;

                docQuestionObj.push(_questionItem);

                const _examAnswerItem = {
                    question_id: questions[i].id,
                    value: questions[i].answer
                };
                examAnswers.push(_examAnswerItem);
                for (let j = 0; j < answers.length; j++) {
                    if (questions[i].id == answers[j].question_id && answers[j].value == questions[i].answer) {
                        point += pointPerQuestion;
                        numRight += 1;
                        docQuestionObj[i].is_right = true;
                        break;
                    }
                }
            }

            numWrong = questions.length - numRight;
            const userObj = { id: req.user.user_id, code: req.user.code, name: req.user.fullname };
            const examObj = { id: exam.id, code: exam.code, name: exam.name };
            const subjectObj = { id: exam.subject.id, code: exam.subject.code, name: exam.subject.name };
            let classroomObj = { id: 'ID', code: 'CODE', name: 'NAME' };
            if (classroomID && examClassroom)
                classroomObj = { id: examClassroom.classroom.id, code: examClassroom.classroom.code, name: examClassroom.classroom.name };

            point = Math.round(point * 100) / 100;
            const totalTime = BaseHelper.diffDateSecond(new Date(), user_started_at) / 60;
            const user_time = Math.round(totalTime * 100) / 100;
            const docTesting = {
                type: exam.type,
                group: group,
                exam: examObj,
                subject: subjectObj,
                classroom: classroomObj,
                user: userObj,
                questions: exam.questions,
                answers: answers,
                num_right: numRight,
                num_wrong: numWrong,
                point: point,
                status: appConfig.TESTING_STATUS.DONE,
                time_sent: new Date(),
                user_started_at: user_started_at,
                user_time: user_time
            };

            if (testingType === appConfig.EXAM_TYPE.TU_LUAN) {
                docTesting.answers = null;

                const answerFiles = [];
                if (params.device == 'mobile') {
                    if (params.files && params.files.length > 0) {
                        for (let i = 0; i < params.files.length; i++) {
                            const fileName = BaseHelper.generateText(10) + BaseHelper.generateTime();
                            const file = await BaseHelper.base64ToFile(params.files[i], 'testings', req.user.user_id + fileName);
                            if (file) {
                                answerFiles[i] = appConfig.FILE_DOMAIN + '/' + file.file_url;
                            }
                        }
                    }
                } else {
                    const { files } = req;
                    if (files) {
                        const fileData = await AppService.addFile(req.user, files, 'testings', true, 'IMAGE', false);

                        if (fileData.length < files.length) {
                            AppService.removeFile(fileData);
                            return response(res, {}, 'Chưa gửi được bài. Vui lòng thử lại!', statusCode.ERROR);
                        }

                        if (fileData && fileData.length > 0) {
                            for (let i = 0; i < fileData.length; i++) {
                                answerFiles[i] = config.FILE_DOMAIN + '/' + fileData[i].file_url;
                            }
                        }
                    }
                }
                docTesting.answer_files = answerFiles;
            }

            conditions = {};
            conditions['exam.id'] = examID;
            conditions['user.id'] = req.user.user_id;
            if (group === appConfig.EXAM_GROUP.MAC_DINH && classroomID) {
                conditions['classroom.id'] = classroomID;
            }
            conditions.deleted_at = null;

            let testing = await TestingModel.findOne(conditions);
            if (testing) {
                if (testing.status === appConfig.TESTING_STATUS.DONE)
                    return response(res, null, 'Bạn đã hoàn thành bài thi này rồi!', statusCode.ERROR);

                if (testing.status === appConfig.TESTING_STATUS.PENDING) {
                    const rs = await TestingModel.updateOne(conditions, { $set: docTesting });
                    if (rs.nModified)
                        testing = await TestingModel.findOne(conditions);
                }
            } else {
                if (group === appConfig.EXAM_GROUP.MAC_DINH && classroomID) {
                    docTesting.started_at = startedAt;
                    docTesting.finished_at = finishedAt;
                }

                testing = await AppService.createTesting(docTesting);
            }

            if (testing) {
                const testingObj = { id: testing.id, code: testing.code };

                // Cap nhat lich su diem cho hs
                if (classroomID)
                    AppService.updatePointLog(testingObj, userObj, examObj, subjectObj, classroomObj, point);

                // Cap nhat ty le dung sai cho cau hoi
                if (docQuestionObj)
                    AppService.updateTestingQuestion(docQuestionObj);

                // Cap nhat danh sach nhung bai thi da lam cho hoc sinh
                if (req.user.user_id && examID)
                    AppService.updateUserTesing(req.user.user_id, examID);

                testing = testing.toObject();
                testing.examAnswers = examAnswers;
                testing.user_started_at = user_started_at;
                testing.user_time = user_time;
                const _d = new Date();
                testing.finished_at_display = BaseHelper.formatAMPM(_d);
                return response(res, testing, 'Chúc mừng bạn. Bài làm đã được gửi thành công!', statusCode.OK);
            }
            return response(res, {}, language.ERROR, statusCode.ERROR);
        } catch (err) {
            logError(err);
            return response(res, {}, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }

    async classroom(req, res, params) {
        try {
            const { year, month } = params;
            const classroomID = params.classroom_id || null;
            const conditions = {};
            const date = BaseHelper.startDateEndDate(month, year);
            if (!date)
                return response(res, {}, 'Request không hợp lệ!', statusCode.ERROR);

            conditions['classroom.id'] = classroomID;
            conditions.created_at = { $gte: new Date(date.start_date), $lte: new Date(date.end_date) };
            const projection = '_id point user classroom num_right num_wrong';
            const testings = await TestingModel.find(conditions, projection);
            if (!testings)
                return response(res, {}, language.TESTING_NOT_EXIST, statusCode.ERROR);
            const userTesting = {};
            for (let i = 0; i < testings.length; i++) {
                userTesting[testings[i].user.id] = {
                    total_testing: 0,
                    total_point: 0,
                    total_num_right: 0,
                    total_num_wrong: 0
                };
            }

            for (let i = 0; i < testings.length; i++) {
                if (userTesting[testings[i].user.id]) {
                    userTesting[testings[i].user.id].total_testing += 1;
                    userTesting[testings[i].user.id].total_point += Math.round(testings[i].point);
                    userTesting[testings[i].user.id].total_num_right += Math.round(testings[i].num_right);
                    userTesting[testings[i].user.id].total_num_wrong += Math.round(testings[i].num_wrong);
                }
            }

            const data = { user_testings: userTesting, testings: testings };
            return response(res, data, 'Thành công', statusCode.OK);
        } catch (err) {
            logError(err);
            return response(res, null, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }
}

module.exports = new MyTestingController();
