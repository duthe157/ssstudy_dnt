const fs = require('fs');
const mongoose = require('mongoose');
const randomize = require('randomatic');
const appConfig = require('../../config/app');
const BaseHelper = require('../helpers/BaseHelper');
const RedisService = require('../services/RedisService');
const ClassroomService = require('../services/ClassroomService');
const ClassroomModel = require('../models/Classroom');
const TestingModel = require('../models/Testing');
const UserModel = require('../models/User');
const PointLogModel = require('../models/PointLog');
const AvgPointLogModel = require('../models/AvgPointLog');
const StudentClassroomModel = require('../models/StudentClassroom');
const ExamClassroomModel = require('../models/ExamClassroom');
const ExamModel = require('../models/Exam');
const AttendanceModel = require('../models/Attendance');
const ChapterModel = require('../models/Chapter');
const ChapterClassroomModel = require('../models/ChapterClassroom');
const CategoryModel = require('../models/Category');
const CategoryClassroomModel = require('../models/CategoryClassroom');
const UserTestingModel = require('../models/UserTesting');
const UserService = require('../services/UserService');
const language = BaseHelper.fileToJSON(`${__dirname}/../languages/vi.json`);

function containsObject(obj, list) {
    var i;
    for (i = 0; i < list.length; i++) {
        if (list[i].id === obj.id) {
            return true;
        }
    }

    return false;
}

class MyClassroomController {
    async list(req, res, params) {
        try {
            const keyword = params.keyword || false;
            const page = parseInt(params.page || appConfig.PAGINATION.PAGE);
            let limit = 200;
            const isOnline = params.is_online;

            const conditions = { deleted_at: null };
            let arrayClassroomID = [];
            if (req.user.user_group === appConfig.USER_GROUP.STUDENT) {
                const userClassrooms = await StudentClassroomModel.find({ 'user.id': req.user.user_id, deleted_at: null });
                arrayClassroomID = [];
                for (let i = 0; i < userClassrooms.length; i++) {
                    arrayClassroomID.push(userClassrooms[i].classroom.id);
                }
                conditions._id = { $in: arrayClassroomID };
                conditions.status = true;
            }

            const options = {
                skip: (page - 1) * limit,
                limit: limit,
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
                conditions.alias = { $regex: alias, $options: 'i' };
            }

            if (isOnline === true || isOnline === false)
                conditions.is_online = isOnline;

            const records = await ClassroomModel.find(conditions, null, options);
            const subjects = [];
            for (let i = 0; i < records.length; i++) {
                if (!containsObject(records[i].subject, subjects)) {
                    const subjectObj = records[i].subject.toObject();
                    subjectObj.classrooms = [];
                    subjects.push(subjectObj);
                }
            }

            for (let i = 0; i < subjects.length; i++) {
                for (let j = 0; j < records.length; j++) {
                    if (subjects[i].id === records[j].subject.id) {
                        subjects[i].classrooms.push(records[j]);
                    }
                }
            }

            const data = {
                subjects,
                records,
                is_show_video_tab: appConfig.CLASSROOM_CONFIG.SHOW_VIDEO_TAB,
                is_show_access_menu: appConfig.SHOW_ACCESS_MENU
            };
            return response(res, data, 'Thành công', statusCode.OK);
        } catch (err) {
            console.log(err);
            logError(err);
            return response(res, null, 'Có lỗi xảy ra. Vui lòng thử lại!', statusCode.ERROR);
        }
    }

    async detail(req, res, params) {
        try {
            const { id } = params;
            const conditions = { _id: id };
            const rs = await ClassroomModel.findOne(conditions);
            rs.toObject();
            rs.is_show_video_tab = appConfig.CLASSROOM_CONFIG.SHOW_VIDEO_TAB;
            return response(res, { classroom: rs }, 'Thành công', statusCode.OK);
        } catch (err) {
            logError(err);
            return response(res, null, 'Có lỗi xảy ra. Vui lòng thử lại!', statusCode.ERROR);
        }
    }

    async overview(req, res, params) {
        try {
            const { id, from_date, to_date } = params;
            let conditions = { _id: id };
            const classroom = await ClassroomModel.findOne(conditions);

            if (req.user.user_group == appConfig.USER_GROUP.STUDENT) {
                const userOnClassroom = await ClassroomService.checkUserOnClassroom(req.user, id, classroom);
                if (!userOnClassroom)
                    return response(res, {}, 'Bạn đã hết số buổi học. Không thể truy cập Lớp. Vui lòng đóng học phí!', statusCode.ERROR);
            }

            conditions = {};

            if (req.user.user_group == appConfig.USER_GROUP.STUDENT) {
                conditions['user.id'] = req.user.user_id;
                conditions['classroom.id'] = id;
                conditions.deleted_at = null;
                conditions.status = appConfig.TESTING_STATUS.DONE;
            }

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

            // Dem tong so hoc sinh trong Lop
            const classroomUser = await StudentClassroomModel.findOne({ 'classroom.id': id, 'user.id': req.user.user_id });

            const numStudent = await StudentClassroomModel.count({ 'classroom.id': id });

            let aggregate = [];

            // Tinh DTB cua Lop
            let classroomAvgPoint = 0;
            const _match = {
                'classroom.id': classroom.id
            };

            if (from_date) {
                _match.created_at = {
                    $gte: new Date(from_date)
                };
            }

            if (to_date) {
                _match.created_at = {
                    $lte: new Date(to_date)
                };
            }

            aggregate = [
                { $match: _match },
                { $group: { _id: null, avg_point: { $avg: '$point' } } }
            ];
            const avgPointLog = await PointLogModel.aggregate(aggregate);
            if (avgPointLog && avgPointLog[0])
                classroomAvgPoint = Math.round(avgPointLog[0].avg_point);

            // Tinh Rank cho Student trong Lop
            let avgRankLog = [];

            let studentAvgPoint = 0;
            let rank = null;
            const arrayMemeberID = [];

            for (let i = 0; i < avgRankLog.length; i++) {
                if (arrayMemeberID.indexOf(avgRankLog[i]._id.id) < 0)
                    arrayMemeberID.push(avgRankLog[i]._id.id);
                if (i == 100)
                    break;
            }

            for (let i = 0; i < avgRankLog.length; i++) {
                if (avgRankLog[i]._id.id == req.user.user_id) {
                    rank = i + 1;
                    studentAvgPoint = Math.round(avgRankLog[i].avg_point);
                    break;
                }
            }

            // Dem tong so bai da thi cua hoc sinh
            conditions = {};
            conditions['user.id'] = req.user.user_id;
            conditions['classroom.id'] = id;
            conditions.deleted_at = null;
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

            conditions.status = appConfig.TESTING_STATUS.DONE;
            const testings = await TestingModel.find(conditions);

            conditions = {};
            conditions['user.id'] = req.user.user_id;
            conditions['classroom.id'] = id;
            if (from_date) {
                conditions.attended_date = {
                    $gte: new Date(from_date)
                };
            }

            if (to_date) {
                conditions.attended_date = {
                    $lte: new Date(to_date)
                };
            }

            conditions.status = 'JOINED';
            const tongdihoc = await AttendanceModel.count(conditions);
            const data = {
                tongdihoc,
                vangmat: 0,
                cophep: 0,
                khongphep: 0,
                classroom,
                classroomUser,
                num_student: numStudent,
                classroom_avg_point: classroomAvgPoint,
                student_ranking: rank,
                student_avg_point: studentAvgPoint,
                testings,
                student_num_testing: testings.length,
                classroom_top_ranking: avgRankLog,
                is_show_video_tab: appConfig.CLASSROOM_CONFIG.SHOW_VIDEO_TAB
            };
            return response(res, data, 'Thành công', statusCode.OK);
        } catch (err) {
            logError(err);
            return response(res, null, 'Có lỗi xảy ra. Vui lòng thử lại!', statusCode.ERROR);
        }
    }

    async report(req, res, params) {
        try {
            const month = params.month || new Date().getMonth();
            const year = params.year || new Date().getFullYear();
            const classroomID = params.classroom_id || null;
            let conditions = {};
            if (req.user.user_group === appConfig.USER_GROUP.STUDENT) {
                return response(res, data, 'Bạn không có quyền truy cập!', statusCode.FORBIDDEN);
            }

            const date = BaseHelper.startDateEndDate(month, year);
            if (!date)
                return response(res, {}, 'Request không hợp lệ!', statusCode.ERROR);
            const classroom = await ClassroomModel.findOne({ _id: classroomID });
            if (!classroom)
                return response(res, null, 'Lớp này không tồn tại!', statusCode.ERROR);

            conditions['classroom.id'] = classroomID;
            const studentClassroom = await StudentClassroomModel.find(conditions);
            const arrayID = [];
            const studentTestings = {};
            for (let i = 0; i < studentClassroom.length; i++) {
                if (studentClassroom[i].user)
                    if (arrayID.indexOf(studentClassroom[i].user.id) < 0) {
                        arrayID.push(studentClassroom[i].user.id);
                        studentTestings[studentClassroom[i].user.id] = { testings: [] };
                    }
            }

            conditions = { _id: { $in: arrayID } };
            const members = await UserModel.find(conditions);

            conditions = {};
            conditions['classroom.id'] = classroomID;
            conditions.finished_at = { $gte: date.start_date, $lte: date.end_date };
            conditions.deleted_at = null;
            const testings = await TestingModel.find(conditions);
            let totalPoint = 0;
            for (let i = 0; i < testings.length; i++) {
                if (studentTestings[testings[i].user.id]) {
                    studentTestings[testings[i].user.id].testings.push(testings[i]);
                    totalPoint += testings[i].point;
                }
            }
            const examDateData = BaseHelper.startDateEndDate(month, year);
            // Lay danh sach de cua lop
            let projection = '_id exam_id';
            conditions = {};
            conditions['classroom.id'] = classroomID;
            conditions.finished_at = {
                $gte: examDateData.start_date,
                $lte: examDateData.end_date
            }

            const examIDs = await ExamClassroomModel.find(conditions, projection);
            const arrayExamID = [];
            for (let i = 0; i < examIDs.length; i++) {
                arrayExamID.push(mongoose.Types.ObjectId(examIDs[i].exam_id));
            }

            conditions = {
                _id: { $in: arrayExamID },
                deleted_at: null
            };
            projection = '_id name code';

            const _options = {
                sort: { code: 1 }
            };

            const exams = await ExamModel.find(conditions, projection, _options);
            let avgPoint = 0;
            if (testings.length > 0) {
                avgPoint = totalPoint / testings.length;
            }
            const data = {
                members,
                exams,
                classroom,
                total_student: members.length,
                student_testings: studentTestings,
                avg_point: avgPoint
            };
            return response(res, data, 'Thành công', statusCode.OK);
        } catch (err) {
            logError(err);
            return response(res, null, 'Có lỗi xảy ra. Vui lòng thử lại!', statusCode.ERROR);
        }
    }

    async listChapter(req, res, params) {
        try {
            const options = {
                sort: { ordering: 1, created_at: 1 }
            };
            const classroomID = params.classroom_id || null;
            // Lấy danh sách chương
            const classroomChapters = await ChapterClassroomModel.find({ classroom_id: classroomID }, null, options);
            const chapterIds = [];
            for (let i = 0; i < classroomChapters.length; i++) {
                chapterIds.push(classroomChapters[i].chapter.id);
            }

            const chapters = await ChapterModel.find({ _id: { $in: chapterIds } }, null, {
                sort: { ordering: 1 }
            })

            if (classroomChapters)
                return response(res, { records: chapters }, 'Thành công!', statusCode.OK);

            return response(res, {}, language.ERROR, statusCode.ERROR);
        } catch (err) {
            logError(err);
            return response(res, null, 'Có lỗi xảy ra. Vui lòng thử lại!', statusCode.ERROR);
        }
    }

    async listChapterCategory2(req, res, params) {
        try {
            const options = {
                sort: { ordering: 1, created_at: 1 }
            };
            const classroomID = params.classroom_id || null;
            if (!classroomID)
                return response(res, null, 'Request invalid', statusCode.ERROR);

            let userExamIds = [];
            let sid = null;
            if (req.user)
                sid = req.user.user_id;
            else {
                if (req.headers.authorization) {
                    const decodedToken = UserService.decodeToken(req.headers.authorization);
                    if (decodedToken)
                        sid = decodedToken.user_id;
                }
            }

            if (sid) {
                const userExams = await UserTestingModel.findOne({ user_id: sid });
                if (userExams)
                    userExamIds = userExams.exam_ids;
            }

            // Lấy danh sách chương
            const classroomChapters = await ChapterClassroomModel.find({ classroom_id: classroomID }, null, options);
            let chapters = [];
            for (let i = 0; i < classroomChapters.length; i++) {
                let chapter = classroomChapters[i].toObject();
                let categoryData = [];
                if (chapter.chapter) {
                    const categories = await CategoryModel.find({ 'chapter.id': chapter.chapter.id }, null, options);
                    for (let j = 0; j < categories.length; j++) {
                        let _category = categories[j].toObject();
                        delete _category.chapter;
                        delete _category.classroom_ids;
                        delete _category.content;
                        _category.classroom_id = classroomID;
                        _category.is_done_exam = false;

                        const examId = Array.isArray(_category.exam) ? _category.exam[0]?.id : _category.exam?.id;
                        if (examId && userExamIds.indexOf(examId) >= 0)
                            _category.is_done_exam = true;

                        _category.is_done_exam = false;
                        _category.is_done_video = false;
                        _category.category = {
                            id: _category._id,
                            name: _category.name
                        }
                        categoryData.push(_category);
                    }
                }
                chapter.category = categoryData;
                chapters.push(chapter);
            }

            return response(res, chapters, 'Thành công', statusCode.OK);
        } catch (err) {
            logError(err);
            return response(res, null, 'Có lỗi xảy ra. Vui lòng thử lại!', statusCode.ERROR);
        }
    }

    async listChapterCategory(req, res, params) {
        try {
            const options = {
                sort: { ordering: 1, created_at: 1 }
            };
            const classroomID = params.classroom_id || null;
            if (!classroomID)
                return response(res, null, 'Request invalid', statusCode.ERROR);

            // Lấy danh sách chương
            const chapters = await ChapterClassroomModel.find({ classroom_id: classroomID }, null, options);
            const categoryClassrooms = await CategoryClassroomModel.find({ classroom_id: classroomID }, null, options);
            const categoryIds = [];
            const categoryClassroomPublishObj = {};
            for (let i = 0; i < categoryClassrooms.length; i++) {
                const _cate = categoryClassrooms[i];
                if (_cate.category && _cate.category.id) {
                    categoryClassroomPublishObj[_cate.category.id] = _cate;
                    categoryIds.push(_cate.category.id);
                }
            }

            let userExamIds = [];
            let sid = null;
            if (req.user)
                sid = req.user.user_id;
            else {
                if (req.headers.authorization) {
                    const decodedToken = UserService.decodeToken(req.headers.authorization);
                    if (decodedToken)
                        sid = decodedToken.user_id;
                }
            }

            if (sid) {
                const userExams = await UserTestingModel.findOne({ user_id: sid });
                if (userExams)
                    userExamIds = userExams.exam_ids;
            }

            // Lay danh sach bai giang theo Chuong
            for (let i = 0; i < chapters.length; i++) {
                chapters[i].category = [];
                let categoryData = [];
                if (chapters[i].chapter) {
                    const categories = await CategoryModel.find({ 'chapter.id': chapters[i].chapter.id, deleted_at: null }, null, options);
                    for (let j = 0; j < categories.length; j++) {
                        let _category = categories[j].toObject();
                        delete _category.chapter;
                        delete _category.classroom_ids;
                        delete _category.content;
                        _category.classroom_id = classroomID;
                        _category.is_done_exam = false;

                        const examId = Array.isArray(_category.exam) ? _category.exam[0]?.id : _category.exam?.id;
                        if (examId && userExamIds.indexOf(examId) >= 0)
                            _category.is_done_exam = true;

                        _category.is_done_exam = false;
                        _category.is_done_video = false;
                        _category.publish_at = null;
                        if (categoryClassroomPublishObj[_category._id] && categoryClassroomPublishObj[_category._id].publish_at) {
                            _category.publish_at = categoryClassroomPublishObj[_category._id].publish_at;
                        }
                        _category.category = {
                            id: _category._id,
                            name: _category.name
                        }
                        categoryData.push(_category);
                    }
                }
                chapters[i].category = categoryData;
            }

            return response(res, chapters, 'Thành công', statusCode.OK);
        } catch (err) {
            logError(err);
            console.log(err);
            return response(res, null, 'Có lỗi xảy ra. Vui lòng thử lại!', statusCode.ERROR);
        }
    }
}

module.exports = new MyClassroomController();
