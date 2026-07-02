const fs = require('fs');
const mongoose = require('mongoose');
const randomize = require('randomatic');
const appConfig = require('../../config/app');
const BaseHelper = require('../helpers/BaseHelper');
const AppService = require('../services/AppService');
const RedisService = require('../services/RedisService');
const ClassroomService = require('../services/ClassroomService');
const UploadService = require('../services/UploadService');
const ClassroomModel = require('../models/Classroom');
const SubjectModel = require('../models/Subject');
const TestingModel = require('../models/Testing');
const UserModel = require('../models/User');
const PointLogModel = require('../models/PointLog');
const AvgPointLogModel = require('../models/AvgPointLog');
const StudentClassroomModel = require('../models/StudentClassroom');
const ClassroomCodeModel = require('../models/ClassroomCode');
const ClassroomGroupModel = require('../models/ClassroomGroup');
const ExamClassroomModel = require('../models/ExamClassroom');
const ExamModel = require('../models/Exam');
const AttendanceModel = require('../models/Attendance');
const ChapterModel = require('../models/Chapter');
const ChapterClassroomModel = require('../models/ChapterClassroom');
const ClassroomReviewModel = require('../models/ClassroomReview');
const CategoryModel = require('../models/Category');
const CategoryClassroomModel = require('../models/CategoryClassroom');
const SettingModel = require('../models/Setting');
const CartCategoryModel = require('../models/CartCategory');
const BookModel = require('../models/Book');
const UserTestingModel = require('../models/UserTesting');
const UserService = require('../services/UserService');
const language = BaseHelper.fileToJSON(`${__dirname}/../languages/vi.json`);

class UserDashboardController {
    async dashboardOverview(req, res, params) {
        try {

            let conditions = null;
            if (req.user.user_group === appConfig.USER_GROUP.STUDENT) {
                const userClassrooms = await StudentClassroomModel.find({ 'user.id': req.user.user_id, deleted_at: null });
                const arrayClassroomID = [];
                for (let i = 0; i < userClassrooms.length; i++) {
                    arrayClassroomID.push(userClassrooms[i].classroom.id);
                }
                conditions._id = { $in: arrayClassroomID };
                conditions.status = true;
            }
            const subjects = [];
            const classrooms = await ClassroomModel.find(conditions);
            for (let i = 0; i < classrooms.length; i++) {
                const _classroom = classrooms[i];
                const _subject = _classroom.subject.toObject();
                _subject.classrooms = [];
                subjects.push(_subject);
            }

            for (let i = 0; i < subjects.length; i++) {
                for (let j = 0; j < classrooms.length; j++) {
                    const _classroom = classrooms[j];
                    if (_classroom.subject.id == subjects[i].id) {
                        subjects[i].classrooms.push(_classroom);
                    }
                }
            }
            const data = {
                subjectClassrooms: subjects
            };
            return response(res, data, 'OK', statusCode.OK);
        } catch (err) {
            logError(err);
            return response(res, null, 'Có lỗi xảy ra. Vui lòng thử lại!', statusCode.ERROR);
        }
    }
}

module.exports = new UserDashboardController();
