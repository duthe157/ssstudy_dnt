const fs = require('fs');
const config = require('../../config/config');
const appConfig = require('../../config/app');
const BaseHelper = require('../helpers/BaseHelper');
const FileModel = require('../models/File');
const TestingModel = require('../models/Testing');
const ExamModel = require('../models/Exam');
const TestingQuestionModel = require('../models/TestingQuestion');
const UserModel = require('../models/User');
const PointLogModel = require('../models/PointLog');
const MessageModel = require('../models/Message');
const UserTestingModel = require('../models/UserTesting');
const StudentClassroomModel = require('../models/StudentClassroom');
const QuestionModel = require('../models/Question');
const OneSignalService = require('./OneSignalService');
const ClassroomModel = require('../models/Classroom');
const QuestionV2Model= require('../models/Question_v2')

class AppService {
    async updatePoint(objUser, testingids = [], action = 'PLUS', type = 'EXAM_ONLINE') {
        try {
            const user = await UserModel.findOne({ _id: objUser.user_id });
            if (!user)
                return false;

            const testings = await TestingModel.find({ _id: { $in: testingids } });
            if (!testings)
                return false;

            for (let i = 0; i < testings.length; i++) {
                const userPointLog = {
                    user_id: user.id,
                    user_code: user.code
                };

                const examPointLog = {
                    exam_id: testings[i].exam.exam_id,
                    exam_code: testings[i].exam.exam_code
                };

                const docPointLog = {
                    user: userPointLog,
                    exam: examPointLog,
                    point: testings[i].point,
                    action: action,
                    type: type
                };
                // Sinh Point Log
                await PointLogModel.create(docPointLog);

                // Cong diem vao user
                const _point = user.point + testings[i].point;
                await UserModel.updateOne({ _id: user.id }, { point: _point });
            }
        } catch (err) {
            logError(err);
        }
    }

    async updatePointLog(testing = null, user = null, exam = null, subject = null, classroom = null, point = 0, action = 'PLUS', type = 'EXAM_ONLINE') {
        try {
            const _user = await UserModel.findOne({ _id: user.id });
            if (!_user)
                return false;

            const docPointLog = {
                testing: testing,
                user: user,
                exam: exam,
                subject: subject,
                classroom: classroom,
                point: point,
                action: action,
                type: type
            };
            // Sinh Point Log
            await PointLogModel.create(docPointLog);

            // Cong diem vao user
            const _point = _user.point + point;
            await UserModel.updateOne({ _id: user.id }, { point: _point });
        } catch (err) {
            logError(err);
        }
    }

    async removeExamIDFromTesting(testingids = []) {
        try {
            if (testingids.length == 0)
                return true;

            for (let i = 0; i < testingids.length; i++) {
                const testing = await TestingModel.findOne({ _id: testingids[i] });
                if (testing) {
                    await UserTestingModel.updateOne({ user_id: testing.user.id }, { $pull: { exam_ids: testing.exam.id } });
                }
            }
        } catch (err) {
            logError(err);
        }
    }

    async updateTestingQuestion(data) {
        for (let i = 0; i < data.length; i++) {
            const condition = {
                exam_id: data[i].exam_id,
                question_id: data[i].question_id
            };

            if (data[i].classroom_id)
                condition.classroom_id = data[i].classroom_id;
            else
                condition.classroom_id = 'CLASSROOM_ID';

            const rs = await TestingQuestionModel.findOne(condition);
            if (rs) {
                if (data[i].is_right)
                    await TestingQuestionModel.updateOne({ _id: rs.id }, { $inc: { total_right: +1 } });
                else
                    await TestingQuestionModel.updateOne({ _id: rs.id }, { $inc: { total_wrong: +1 } });
            } else {
                if (data[i].is_right) {
                    data[i].total_right = 1;
                    data[i].total_wrong = 0;
                } else {
                    data[i].total_right = 0;
                    data[i].total_wrong = 1;
                }
                delete data[i].is_right;
                await TestingQuestionModel.create(data[i]);
            }
        }
    }

    async updateNumTagItem(model, type, oldTag, uniqueTag) {
        try {
            for (let i = 0; i < oldTag.length; i++) {
                if (uniqueTag.indexOf(oldTag[i]) < 0)
                    uniqueTag[uniqueTag.length] = oldTag[i];
            }

            for (let i = 0; i < uniqueTag.length; i++) {
                const count = await model.count({ tags: { $in: uniqueTag[i], type: type }, deleted_at: null });
                await model.updateOneRecord({ _id: uniqueTag[i] }, { num_item: count });
            }
        } catch (err) {
            logError(err);
        }
    }

    async addFile(user, files, object, multiple = false, type = 'IMAGE', savedb = true) {
        try {
            const date = new Date();
            const month = date.getMonth() + 1;
            const day = date.getDate();
            const year = date.getFullYear();
            const userID = user.user_id;
            const rootPath = appConfig.LOCAL.DIR_TEMP + '/' + userID + '/' + object + '/' + year + month + day;
            const mediaRootURL = userID + '/' + object + '/' + year + month + day;
            await BaseHelper.createFolderFull(rootPath);

            let mediaURL = null;
            let newFullPath = null;
            const arrFile = [];
            for (let i = 0; i < files.length; i++) {
                const fileObject = files[i].originalname.split('.');
                const ext = fileObject[1];
                let fileName = fileObject[0];
                fileName = BaseHelper.seoURL(fileName) + '-' + Date.now();
                mediaURL = mediaRootURL + '/' + fileName + '.' + ext;
                files[i].filename = fileName + '.' + ext;
                files[i].file_url = mediaURL;
                const fullPathInServ = files[i].path;
                newFullPath = rootPath + '/' + files[i].filename;
                files[i].full_path = newFullPath;
                await fs.renameSync(fullPathInServ, newFullPath);
                if (fs.existsSync(newFullPath)) {
                    arrFile.push(files[i]);
                    if (savedb) {
                        const alias = BaseHelper.seoURL(files[i].originalname);
                        const fileData = {
                            creator_id: user.user_id,
                            name: files[i].originalname,
                            alias: alias,
                            path: mediaURL,
                            object: object,
                            type: type,
                            size: files[i].size,
                            tags: []
                        };
                        await FileModel.create(fileData);
                    }
                }
            }

            return arrFile;
        } catch (err) {
            logError(err);
        }
    }

    async removeFile(files) {
        try {
            for (let i = 0; i < files.length; i++) {
                fs.unlink(files[i].full_path, (err) => {
                    if (err)
                        logError(err);
                });
            }
        } catch (err) {
            logError(err);
        }
    }

    async createTesting(doc) {
        try {
            // eslint-disable-next-line no-constant-condition
            while (true) {
                const options = {
                    limit: 1,
                    sort: { created_at: -1 }
                };
                let code = 1000000;
                const cursor = await TestingModel.findOne({ deleted_at: null }, null, options);
                if (cursor)
                    code = cursor.code + 1;
                doc.code = code;
                try {
                    const rs = await TestingModel.create(doc);
                    if (rs)
                        return rs;
                } catch (err) {
                    if (err && err.code && err.code === 11000) {
                        logError(err);
                    } else {
                        logError(err);
                        return null;
                    }
                }
            }
        } catch (err) {
            logError(err);
            return null;
        }
    }

    async createExam(doc) {
        try {
            // eslint-disable-next-line no-constant-condition
            while (true) {
                const options = {
                    limit: 1,
                    sort: { created_at: -1 }
                };
                let code = 100000;
                const cursor = await ExamModel.findOne({ deleted_at: null }, null, options);
                if (cursor)
                    code = cursor.code + 1;
                doc.code = code;
                try {
                    const rs = await ExamModel.create(doc);
                    if (rs)
                        return rs;
                } catch (err) {
                    if (err && err.code && err.code === 11000) {
                        logError(err);
                    } else {
                        logError(err);
                        return null;
                    }
                }
            }
        } catch (err) {
            logError(err);
            return null;
        }
    }

    async createQuestion(doc) {
        try {
            // eslint-disable-next-line no-constant-condition
            while (true) {
                const options = {
                    limit: 1,
                    sort: { created_at: -1 }
                };
                let code = 100000;
                const cursor = await QuestionModel.findOne(null, null, options);
                if (cursor)
                    code = cursor.code + 1;
                doc.code = code;
                try {
                    const rs = await QuestionModel.create(doc);
                    if (rs)
                        return rs;
                } catch (err) {
                    if (err && err.code && err.code === 11000) {
                        logError(err);
                    } else {
                        logError(err);
                        return null;
                    }
                }
            }
        } catch (err) {
            logError(err);
            return null;
        }
    }

    async createQuestionV2(doc) {
        try {
            // eslint-disable-next-line no-constant-condition
            while (true) {
                const options = {
                    limit: 1,
                    sort: { code: -1 }
                };
                let code = 300000;
                const cursor = await QuestionV2Model.findOne(null, null, options);
                if (cursor)
                    code = cursor.code + 1;
                doc.code = code;
                try {
                    const rs = await QuestionV2Model.create(doc);
                    if (rs)
                        return rs;
                } catch (err) {
                    if (err && err.code && err.code === 11000) {
                        logError(err);
                    } else {
                        logError(err);
                        return null;
                    }
                }
            }
        } catch (err) {
            logError(err);
            return null;
        }
    }

    async sendExamToStudent(exam, users, startedAt = null, finishedAt = null) {
        try {
            let userSent = 0;
            let userNew = 0;
            for (let i = 0; i < users.length; i++) {
                if (users[i].user && users[i].user.id) {
                    const docTesting = {
                        type: exam.type,
                        exam: {
                            id: exam.id,
                            code: exam.code,
                            name: exam.name
                        },
                        subject: exam.subject,
                        classroom: users[i].classroom,
                        user: users[i].user,
                        questions: exam.questions,
                        answers: null,
                        num_right: null,
                        num_wrong: null,
                        point: null,
                        status: appConfig.TESTING_STATUS.PENDING,
                        started_at: startedAt,
                        finished_at: finishedAt,
                    };
                    const conditions = {};
                    conditions['exam.id'] = exam.id;
                    conditions['user.id'] = users[i].user.id;
                    conditions['classroom.id'] = users[i].classroom.id;
                    const ck = await TestingModel.findOne(conditions);
                    if (!ck) {
                        const testing = await this.createTesting(docTesting);
                        if (testing)
                            userNew++;
                    } else {
                        userSent++;
                    }
                }
            }
            return { total_is_sent: userSent, total_is_new: userNew };
        } catch (err) {
            logError(err);
        }
    }

    async sendNotifyExam(exam, classroom) {
        try {
            const classroomID = classroom._id ? classroom._id : classroom.id;
            const docNotify = {
                name: 'Đề:' + exam.name + ' cho lớp: ' + classroom.name,
                content: classroom.name + ' có đề thi: ' + exam.name + '. Chúc các em làm bài tốt.',
                group: 'CLASSROOM',
                configs: {
                    object_id: [classroomID],
                    send_type: 'CLASSROOM'
                },
                app_url: null,
                web_url: null,
                status: 'PENDING'
            };

            const message = await MessageModel.create(docNotify);
            if (message) {
                const { configs } = message;
                const filters = [];
                if (configs && configs.send_type === 'CLASSROOM' && configs.object_id.length > 0) {
                    for (let cid = 0; cid < configs.object_id.length; cid++) {
                        const _filter = {
                            field: 'tag',
                            key: configs.object_id[cid],
                            relation: 'exists'
                        };
                        filters.push(_filter);
                    }
                }

                const heading = 'Thông báo';
                const appURL = 'myapp://root/home/home-navigation/notification/' + message.id;
                const platformMsgID = await OneSignalService.sendNotification(heading, message.content, null, filters, null, appURL);
                await MessageModel.updateOne({ _id: message.id }, { $set: { platform_msg_id: platformMsgID, app_url: appURL } });
            }
        } catch (err) {
            logError(err);
        }
    }

    async editTagDeviceWithID(userID, userTagDevice) {
        try {
            let tags = {};
            if (userTagDevice)
                tags = userTagDevice;

            const classrooms = await StudentClassroomModel.find({ 'user.id': userID });
            const _tagClassroomID = [];
            if (classrooms) {
                for (let i = 0; i < classrooms.length; i++) {
                    const _tagKey = classrooms[i].classroom.id;
                    if (!classrooms[i].deleted_at)
                        _tagClassroomID.push(classrooms[i].classroom.id);

                    tags[_tagKey] = classrooms[i].deleted_at ? "" : 1;

                    if (!tags.user_code)
                        tags['user_code'] = classrooms[i].user.code;
                }
                tags.classroom_ids = _tagClassroomID.join(',');
            }
            UserModel.updateOne({ _id: userID }, { $set: { device_tags: JSON.stringify(tags) } });
            OneSignalService.editTagDevice(userID, tags);
        } catch (err) {
            logError(err);
        }
    }


    async updateUserTesing(userID, examID) {
        try {
            if (!userID || !examID) return null;
            const userTesting = await UserTestingModel.findOne({ user_id: userID });
            if (userTesting)
                await UserTestingModel.updateOne({ user_id: userID }, { $addToSet: { exam_ids: examID } });
            else
                await UserTestingModel.create({
                    user_id: userID,
                    exam_ids: [examID]
                });
        } catch (err) {
            logError(err);
        }
    }

    // Lay danh sach bai kiem tra hoc sinh da lam
    async getUserExamIds(userID) {
        try {
            const data = await UserTestingModel.findOne({ user_id: userID });
            if (data && data.exam_ids.length > 0) {
                return data.exam_ids;
            }
            return [];
        } catch (err) {
            logError(err);
            return [];
        }
    }

    // Kiem tra xem hoc sinh da hoan thanh bai kiem tra X chua
    async isUserDoneExam(userID, examID) {
        try {
            const data = await UserTestingModel.findOne({ user_id: userID });
            if (data && data.exam_ids.length > 0 && data.exam_ids.indexOf(examID) >= 0)
                return true;
            return false;
        } catch (err) {
            logError(err);
            return false;
        }
    }

    // Add hoc sinh tu lop A sang lop B
    async addUserToClassroom(classroomIdA, classroomIdB) {
        try {
            const classroomB = await ClassroomModel.findOne({ _id: classroomIdB });
            if (!classroomB)
                return;
            const students = await StudentClassroomModel.find({ "classroom.id": classroomIdA, deleted_at: null });
            if (!students || students.length == 0)
                return;

            for (let i = 0; i < students.length; i++) {
                const _s = students[i];
                const _doc = {
                    user: _s.user,
                    classroom: {
                        id: classroomIdB,
                        name: classroomB.name,
                        code: classroomB.code
                    },
                    rank: 0,
                    total_testing: 0,
                    total_testing_sent: 0,
                    avg_point: 0,
                    sobuoihoc: 1000,
                    buoidahoc: 0,
                    joined_at: new Date()
                };
                const _checkUser = await StudentClassroomModel.findOne({ "classroom.id": classroomIdB, "user.id": _s.user.id });
                if (!_checkUser)
                    StudentClassroomModel.create(_doc);
            }
            return;
        } catch (err) {
            logError(err);
            console.log(err);
            return false;
        }
    }
}

module.exports = new AppService();

