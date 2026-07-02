const fs = require('fs');
const mime = require('mime');
const schedule = require('node-schedule');
const config = require('../../config/config');
const appConfig = require('../../config/app');
const BaseHelper = require('../helpers/BaseHelper');
const UserModel = require('../models/User');
const TestingModel = require('../models/Testing');
const UserTestingModel = require('../models/UserTesting');
const ExamClassroomModel = require('../models/ExamClassroom');
const ClassroomModel = require('../models/Classroom');
const ExamPendingModel = require('../models/ExamPending');
const PointLogModel = require('../models/PointLog');
const AvgPointLogModel = require('../models/AvgPointLog');
const AppConfigModel = require('../models/AppConfig');
const StudentClassroomModel = require('../models/StudentClassroom');
const AttendanceModel = require('../models/Attendance');
const BillingModel = require('../models/Billing');
const OneSignalService = require('../services/OneSignalService');
const AppService = require('../services/AppService');
const RedisService = require('./RedisService');
const AwsService = require('../services/AwsService');
const LinkPaymentsModel = require('../models/LinkPayments');
const _dir = '/home/cdn.luyenthitiendat.vn/public_html';


async function listFileInFolder(path) {
    try {
        const { join } = require('path');
        const dirs = p => fs.readdirSync(p).filter(f => fs.statSync(join(p, f)).isFile());
        return dirs(path);
    } catch (err) {
        return null;
    }
}

async function listAllInFolder(path) {
    return await fs.readdirSync(path);
}

async function syncDataIMG(_path) {
    try {
        const folder = await listAllInFolder(_path);
        for (let i = 0; i < folder.length; i++) {
            const files = await listFileInFolder(_path + '/' + folder[i]);
            if (!files) {
                const _file = _path + '/' + folder[i];
                try {
                    const mediaURL = _file.replace(_dir + '/', '');
                    const fileType = mime.getType(_file);
                    if (fileType) {
                        const _rs = await AwsService.s3Upfile(_file, mediaURL, fileType);
                        if (_rs) {
                            console.log('mediaURL===', mediaURL, fileType);
                            fs.unlink(_file, (err) => {
                                if (err)
                                    console.log(err);
                                else
                                    console.log('Deleted');
                            });
                        }
                    }
                } catch (err) {
                    console.log(err);
                }
            } else {
                await syncDataIMG(_path + '/' + folder[i]);
            }
        }
        console.log('END IMG');
    } catch (err) {
        console.log(err);
    }
}

async function endTesting() {
    try {
        let conditions = {
            deleted_at: null,
            status: appConfig.TESTING_STATUS.PENDING
        };
        const testings = await TestingModel.find(conditions);
        for (let i = 0; i < testings.length; i++) {
            conditions = {
                exam_id: testings[i].exam_id,
                'classroom.id': testings[i].classroom.id
            };
            const examClassroom = await ExamClassroomModel.findOne(conditions);
            if (examClassroom) {
                const currentDate = new Date();
                if (examClassroom.finished_at) {
                    if (currentDate >= new Date(examClassroom.finished_at)) {
                        const data = {
                            status: appConfig.TESTING_STATUS.DONE,
                            point: 0,
                            num_right: 0,
                            num_wrong: testings[i].questions.length
                        };
                        await TestingModel.updateOne({ _id: testings[i].id }, { $set: data });
                    }
                } else {
                    const d1 = new Date();
                    const d2 = new Date(examClassroom.updated_at);
                    const diffDay = BaseHelper.diffDateDay(d1, d2);
                    if (diffDay >= 3) {
                        const data = {
                            status: appConfig.TESTING_STATUS.DONE,
                            point: 0,
                            num_right: 0,
                            num_wrong: testings[i].questions.length
                        };
                        await TestingModel.updateOne({ _id: testings[i].id }, { $set: data });
                    }
                }
            } else {
                const d1 = new Date();
                const d2 = new Date(testings[i].created_at);
                const diffDay = BaseHelper.diffDateDay(d1, d2);
                if (diffDay >= 3) {
                    const data = {
                        status: appConfig.TESTING_STATUS.DONE,
                        point: 0,
                        num_right: 0,
                        num_wrong: testings[i].questions.length
                    };
                    await TestingModel.updateOne({ _id: testings[i].id }, { $set: data });
                }
            }
        }
    } catch (err) {
        logError(err);
    }
}

async function customStudent() {
    try {
        const data = await BaseHelper.getRequest2('http://cdn.luyenthitiendat.vn/hocsinh2.txt');
        const arrayPhone = data.split('|');
        let num = 0;
        for (let i = 0; i < arrayPhone.length; i++) {
            const password = BaseHelper.encryptMD5(config.TOKEN.MD5_BEFORE, appConfig.STUDENT_PASSWORD_DEFAULT, config.TOKEN.MD5_AFTER);
            const _user = arrayPhone[i].split(',');
            const _phone = _user[1].trim().replace(/\s/g, '').replace("\'}'", '').replace('+', '');
            const docUser = {
                fullname: _user[0].trim(),
                phone: _phone,
                email: _phone + '@luyenthitiendat.vn',
                password: password,
                dob: null,
                gender: null,
                code: _phone,
                card_code: _phone,
                school: null,
                user_group: appConfig.USER_GROUP.STUDENT,
                avatar: null,
                fw_id: 9000,
                status: 'ACTIVE'
            };

            let rs = await UserModel.findOne({ phone: _phone });
            if (!rs) {
                num++;
                console.log(_phone + '---' + num);
                rs = await UserModel.create(docUser);
            }

            if (rs) {
                const objStudentClassroom = {
                    user: { id: rs.id, name: rs.fullname, code: rs.code },
                    classroom: { id: '5e95e6f1284f89a5b6db85da', name: 'LUYỆN ĐỀ PRO', code: '207' },
                    deleted_at: null
                };

                const cond = {};
                cond['user.id'] = rs.id;
                cond['classroom.id'] = '5e95e6f1284f89a5b6db85da';
                const ck = await StudentClassroomModel.findOne(cond);
                if (!ck)
                    await StudentClassroomModel.create(objStudentClassroom);
            }

            if (i == (arrayPhone.length - 1))
                console.log('------------------HET----');
        }
    } catch (err) {
        console.log(err);
    }
}

async function updateStatusExamClassroom() {
    try {
        const limit = 100;
        let page = 1;

        while (true) {
            const options = {
                skip: (page - 1) * limit,
                limit: limit
            };
            const conditions = {
                status: 'SENT',
                finished_at: { $lte: new Date() }
            };
            const examClassrooms = await ExamClassroomModel.find(conditions, null, options);

            if (!examClassrooms || examClassrooms.length == 0)
                break;
            const arrayExamClassroomID = [];
            for (let i = 0; i < examClassrooms.length; i++) {
                const item = examClassrooms[i];
                // if (item.is_fixed_time) {
                if (item.finished_at) {
                    const currentTime = new Date();
                    const finishedAt = new Date(item.finished_at);
                    if (currentTime > finishedAt) {
                        arrayExamClassroomID.push(item.id);
                    }
                }
                // }
            }

            if (arrayExamClassroomID.length > 0) {
                await ExamClassroomModel.updateMany({ _id: { $in: arrayExamClassroomID } }, { $set: { status: 'DONE' } });
            }
            page++;
        }
    } catch (err) {
        console.log(err);
    }
}

async function deleteExamPending() {
    try {
        const conditions = {
            is_fixed_time: true,
            finished_at: { $lte: new Date() }
        };
        await ExamPendingModel.delete(conditions, true);
    } catch (err) {
        console.log(err);
    }
}

async function removeUser() {
    try {
        console.log('RUN');
        let page = 1;
        const limit = 5000;
        const options = {
            skip: (page - 1) * limit,
            limit
        };

        const conditions = {};

        while (true) {
            options.skip = (page - 1) * limit;
            const _users = await UserModel.find(conditions, null, options);
            if (_users.length == 0) {
                console.log('END');
                break;
            }

            for (let i = 0; i < _users.length; i++) {
                const user = _users[i]
                const _count = await UserModel.count({ code: user.code });
                if (_count >= 2) {
                    //const check1 = await StudentClassroomModel.count({ 'user.code': user.code });
                    //const check2 = await BillingModel.count({ 'user.code': user.code });
                    /*if (check1 == 0) {
                        console.log('DELETE===>' + user.code);
                        
                    }*/
                    console.log(user.code);
                    const __id = user.id;
                    await UserModel.delete({ code: user.code, _id: { $ne: user.id } }, true);
                }
            }
            page++;
            console.log('PAGE:' + page);
        }

        console.log('END2');
    } catch (err) {
        logError(err);
    }
}

async function syncUserTesting() {
    try {
        console.log('RUN');
        let page = 1;
        const limit = 1000;
        const options = {
            skip: (page - 1) * limit,
            limit
        };

        const conditions = {};

        while (true) {
            options.skip = (page - 1) * limit;
            const testings = await TestingModel.find(conditions, null, options);
            if (testings.length == 0) {
                console.log('END');
                break;
            }

            for (let i = 0; i < testings.length; i++) {
                const user = testings[i].user;
                const exam = testings[i].exam;
                const userTesting = await UserTestingModel.findOne({ user_id: user.id });
                if (userTesting)
                    await UserTestingModel.updateOne({ user_id: user.id }, { $addToSet: { exam_ids: exam.id } });
                else
                    await UserTestingModel.create({
                        user_id: user.id,
                        exam_ids: [exam.id]
                    });
            }
            page++;
            console.log('PAGE:' + page);
        }

        console.log('END2');
    } catch (err) {
        logError(err);
    }
}

async function editDeviceOneSignal() {
    try {

        const limit = 300;
        let offset = 0;
        const _key = 'onesignal_user_offset';
        offset = await RedisService.getValueByKey(_key);
        offset = parseInt(offset);
        if (!offset || offset <= 0) {
            const offsetData = await AppConfigModel.findOne({ key: _key });
            if (!offsetData)
                return false;

            offset = parseInt(offsetData.value);
            if (!offset || offset <= 0)
                return false;
        }
        offset -= 300;
        while (true) {
            // console.log('offset=', offset);
            const url = 'https://onesignal.com/api/v1/players?app_id=' + appConfig.ONESIGNAL.APP_ID + '&limit=' + limit + '&offset=' + offset;
            const options = {
                method: 'GET',
                url: url,
                headers: { 'Authorization': 'Basic ' + appConfig.ONESIGNAL.API_KEY },
            };
            const data = await BaseHelper.sendRequest(options);
            // console.log('data.players.length', data.players.length);
            if (data.players.length <= 0) {
                console.log('DONE');
                break;
            }
            const players = data.players;
            const userID = [];
            for (let i = 0; i < players.length; i++) {
                const playerID = players[i].id;
                const playerTags = players[i].tags;
                const _tagClassroomID = [];
                let externalUserID = players[i].external_user_id ? players[i].external_user_id : null;
                const _bodyData = {};
                _bodyData.tags = {};
                if (!playerTags.user_code)
                    continue;

                try {
                    const userCode = playerTags.user_code;
                    const _tags = {};
                    const _dbTags = {};
                    _tags.user_code = userCode;
                    _dbTags.user_code = userCode;

                    const _studentClassrooms = await StudentClassroomModel.find({ 'user.code': userCode, deleted_at: null });
                    if (_studentClassrooms) {
                        for (let j = 0; j < _studentClassrooms.length; j++) {
                            _tagClassroomID.push(_studentClassrooms[j].classroom.id);
                            const _tagKey = _studentClassrooms[j].classroom.id;
                            if (userCode == _studentClassrooms[j].user.code) {
                                if (!externalUserID)
                                    externalUserID = _studentClassrooms[j].user.id;
                            }
                            if (playerTags[_studentClassrooms[j].classroom.id] !== undefined || !playerTags[_studentClassrooms[j].classroom.id]) {
                                _tags[_tagKey] = 1;
                                _dbTags[_tagKey] = 1;
                            } else {
                                _tags[_tagKey] = "";
                                // console.log('REMOVE TAG:' + externalUserID + '- TAGID: ' + _tagKey);
                            }

                        }

                        if (externalUserID)
                            userID.push(externalUserID);
                        _bodyData.external_user_id = externalUserID;
                        _bodyData.tags = _tags;
                        OneSignalService.editDevice(playerID, _bodyData);
                        let _aa = null;
                        if (_dbTags)
                            _aa = JSON.stringify(_dbTags)
                        UserModel.updateOne({ _id: externalUserID }, { $set: { device_tags: _aa, is_os_external_user_id: true } });
                        // console.log('Done:' + playerID + ' - Body:' + JSON.stringify(_bodyData));
                    }
                } catch (err) {
                    logError(err);
                }
            }

            if (data.players.length < limit)
                offset += data.players.length;
            else
                offset += limit;

            // console.log('_offsetDB', offset);
            RedisService.add(_key, offset);
            AppConfigModel.updateOne({ key: _key }, { $set: { value: offset } });
            UserModel.updateMany({ _id: { $in: userID } }, { $set: { is_os_external_user_id: true } });
        }
    } catch (err) {
        logError(err);
    }
}

async function synTagByID() {
    try {
        console.log('RUN');
        let page = 1;
        const limit = 1000;
        const options = {
            skip: (page - 1) * limit,
            limit
        };

        const conditions = {
            is_os_external_user_id: false
        };

        while (true) {
            options.skip = (page - 1) * limit;
            const users = await UserModel.find(conditions, null, options);
            if (users.length == 0) {
                console.log('END');
                break;
            }

            for (let i = 0; i < users.length; i++) {
            }
            page++;
            console.log('PAGE:' + page);
        }

        console.log('END2');
    } catch (err) {
        logError(err);
    }
}


Date.prototype.isValid = function () {
    return this.getTime() === this.getTime();
};

async function syncDOB() {
    try {
        const limit = 1000;
        let page = 1;

        while (true) {
            const options = {
                skip: (page - 1) * limit,
                limit: limit
            };
            const conditions = {};
            const users = await UserModel.find(conditions, null, options);

            if (!users || users.length == 0) {
                console.log('DONE');
                break;
            }

            for (let i = 0; i < users.length; i++) {
                const item = users[i];
                let _dob = null;
                if (item.dob && (item.dob !== '0000-00-00' || item.dob !== 'undefined')) {
                    _dob = new Date(item.dob);
                    console.log(_dob);
                    if (!_dob.isValid()) {
                        const _arr = item.dob.split('/');
                        console.log(_arr);
                        if (_arr.length == 3) {
                            const _uDOB = _arr[2] + '-' + _arr[1] + '-' + _arr[0];
                            console.log('_uDOB = ' + _uDOB);
                            _dob = new Date(_uDOB);
                            if (!_dob.isValid()) {
                                _dob = null;
                            }
                        } else {
                            _dob = null;
                        }
                    }
                }

                console.log({ _id: item.id, aaa: item.dob, dob_2: _dob });
                await UserModel.updateOne({ _id: item.id }, { $set: { dob_2: _dob } });
            }
            page++;
        }
    } catch (err) {
        console.log(err);
    }
}

async function addStudentToan() {
    try {
        const classroomIds = [
            '60c83de7d673795d36fd556d',
            '60c83bf0d673795d36fd5563',
            '60c83c20d673795d36fd5566',
            '60c83e139906df5d42ec9000',
            '60c83c53d673795d36fd5567',
            '60c83959d673795d36fd5558',
            '60c838ed9906df5d42ec8fe9'
        ];

        console.log('RUN');
        let page = 1;
        const limit = 1000;
        const options = {
            skip: (page - 1) * limit,
            limit
        };

        const conditions = { 'classroom.id': { $in: classroomIds } };

        while (true) {
            options.skip = (page - 1) * limit;
            const userClassrooms = await StudentClassroomModel.find(conditions, null, options);
            if (userClassrooms.length == 0) {
                console.log('END');
                break;
            }

            for (let i = 0; i < userClassrooms.length; i++) {
                const user = userClassrooms[i].user;
                const _classroom = userClassrooms[i].classroom;
                if (_classroom.id != '6114e77d86c16e6021606aae') {
                    if (user.code) {
                        const _doc = {
                            user: user,
                            classroom: {
                                id: '6114e77d86c16e6021606aae',
                                code: '999',
                                name: '[2K4] Lấy Gốc Hình Không Gian'
                            },
                            rank: 0,
                            total_testing: 0,
                            total_testing_sent: 0,
                            avg_point: 0,
                            sobuoihoc: 1,
                            buoidahoc: 0
                        }
                        const check = await StudentClassroomModel.findOne({ 'user.id': user.id, 'classroom.id': '6114e77d86c16e6021606aae' });
                        if (!check) {
                            const rs = await StudentClassroomModel.create(_doc);
                            if (rs) {
                                console.log('added');
                                AppService.editTagDeviceWithID(user.id, { "6114e77d86c16e6021606aae": 1 });
                            }
                        }
                    }
                }
            }
            page++;
            console.log('PAGE:' + page);
        }

        console.log('END2');
    } catch (err) {
        logError(err);
    }
}

async function syncToOnesignal() {
    try {
        console.log('RUN');
        let page = 1;
        const limit = 1000;
        const options = {
            skip: (page - 1) * limit,
            limit
        };

        const conditions = { 'classroom.id': '5fbd134949a77c0551b3d630' };

        while (true) {
            options.skip = (page - 1) * limit;
            const userClassrooms = await StudentClassroomModel.find(conditions, null, options);
            if (userClassrooms.length == 0) {
                console.log('END');
                break;
            }

            for (let i = 0; i < userClassrooms.length; i++) {
                const user = userClassrooms[i].user;
                if (user.code) {
                    AppService.editTagDeviceWithID(user.id, { "5fbd134949a77c0551b3d630": 1 });
                    console.log(JSON.stringify(rs));
                }
            }
            page++;
            console.log('PAGE:' + page);
        }

        console.log('END2');
    } catch (err) {
        logError(err);
        console.log(err);
    }
}

async function congBuoiHocToan() {
    try {
        console.log('RUN');
        let page = 1;
        const limit = 1000;
        const options = {
            skip: (page - 1) * limit,
            limit
        };

        const conditions = {
            'classroom.id': {
                $in: ['5fbd133240eae8053580afb0', '5fad1ed7c2e2b90bbf77d2f1', '5f71d2fb6d15b631ab7f7258',
                    '5f2ee3635a6bbb6768482afd', '5f1695f97db8d5148b8185d0', '5f1695e525cf7714a7c01ecc', '5f16960f25cf7714a7c01ecd', '5f1696697db8d5148b8185d2', '5f16962325cf7714a7c01ece',
                    '5f1ac7f025cf7714a7c028ec', '5f1696517db8d5148b8185d1', '5f1695ae25cf7714a7c01eca', '5f1ac7d67db8d5148b818f70', '5f1695cc25cf7714a7c01ecb', '5f36dbfaac9dec38fb27a392', '5f2fde9edfbc5676f5086b72',
                    '5f2fde8cdfbc5676f5086b71', '5f5e1979d0b08f35f0934a25', '5f5d1e4da029cd360cf8fe1b']
            }
        };

        while (true) {
            options.skip = (page - 1) * limit;
            const userClassrooms = await StudentClassroomModel.find(conditions, null, options);
            if (userClassrooms.length == 0) {
                console.log('END');
                break;
            }

            for (let i = 0; i < userClassrooms.length; i++) {
                let _sbh = 1;
                if (userClassrooms[i].sobuoihoc) {
                    _sbh = userClassrooms[i].sobuoihoc + 1;
                }

                console.log(_sbh, _sbh);
                // await StudentClassroomModel.updateOne({ _id: userClassrooms[i].id }, { $set: { sobuoihoc: _sbh } });
            }
            page++;
            console.log('PAGE:' + page);
        }

        console.log('END2');
    } catch (err) {
        logError(err);
        console.log(err);
    }
}

async function buildClassroomRanking() {
    try {
        const year = new Date().getFullYear();
        const month = new Date().getMonth() + 1;
        const date = BaseHelper.startDateEndDate(month, year);
        const classrooms = await ClassroomModel.find({ enable_stats: true });
        for (let i = 0; i < classrooms.length; i++) {
            const _classroom = classrooms[i];
            // Tinh Rank cho Student trong Lop
            aggregate = [
                { $match: { 'classroom.id': _classroom.id, created_at: { $gte: date.start_date, $lte: date.end_date } } },
                { $group: { _id: '$user', avg_point: { $avg: '$point' } } },
                { $sort: { avg_point: -1 } }
            ];
            const logKey = _classroom.id + '-' + year + '-' + month;
            const avgRankLog = await PointLogModel.aggregate(aggregate);
            const logPoint = await AvgPointLogModel.findOne({ key: logKey });
            if (!logPoint) {
                const _doc = {
                    key: logKey,
                    log: JSON.stringify(avgRankLog)
                };
                try {
                    await AvgPointLogModel.create(_doc);
                } catch (err) {
                    console.log(err);
                    continue;
                }

            }
        }
        console.log('==========================> DONE stats logs');
    } catch (err) {
        console.log(err);
    }
}

async function addAllClassroom() {
    try {
        const user = await UserModel.findOne({ phone: '0808080808' });
        if (user) {
            const classrooms = await ClassroomModel.find();
            if (classrooms.length) {
                for (let i = 0; i < classrooms.length; i++) {
                    const _doc = {
                        user: {
                            id: user._id,
                            code: user.code,
                            name: user.name
                        },
                        classroom: {
                            id: classrooms[i]._id,
                            code: classrooms[i].code,
                            name: classrooms[i].name
                        },
                        rank: 0,
                        total_testing: 0,
                        total_testing_sent: 0,
                        avg_point: 0,
                        sobuoihoc: 1000,
                        buoidahoc: 0
                    }
                    const check = await StudentClassroomModel.findOne({ 'user.id': user._id, 'classroom.id': classrooms[i]._id });
                    if (!check) {
                        const rs = await StudentClassroomModel.create(_doc);
                        if (rs)
                            console.log('added');
                    }
                }
            }
        }
    } catch (err) {
        console.log(err);
    }
}

async function autoTruBuoiHoc() {
    try {
        let options = {
            limit: 2
        };
        const classrooms = await ClassroomModel.find({ is_online: false });
        const day = new Date();
        for (let i = 0; i < classrooms.length; i++) {
            const _classroom = classrooms[i];
            const limit = 1000;
            let page = 1;
            const num = _classroom.is_cadup ? 2 : 1;
            while (true) {
                options = {
                    skip: (page - 1) * limit,
                    limit: limit
                };
                const students = await StudentClassroomModel.find({ 'classroom.id': _classroom.id }, null, options);

                if (!students || students.length == 0) {
                    console.log('DONE');
                    break;
                }

                for (let i = 0; i < students.length; i++) {
                    const _student = students[i];
                    const _cond = {
                        'classroom.id': _classroom.id,
                        'user.id': _student.user.id,
                        attended_date: { $lte: day, $gte: BaseHelper.getMonday(day) }
                    };
                    console.log({ $lte: day, $gte: BaseHelper.getMonday(day) });
                    let _sCount = await AttendanceModel.count(_cond);
                    if (!_sCount)
                        _sCount = 0;

                    if (num > _sCount) {
                        const diffDay = num - _sCount;
                        const _buoidahoc = _student.buoidahoc + diffDay;
                        await StudentClassroomModel.updateOne({ 'classroom.id': _classroom.id, 'user.id': _student.user.id }, { $set: _buoidahoc });
                    }
                }
                page++;
                console.log('PAGE: ', page + '-' + _classroom.id);
            }
        }
        console.log('DONE');
    } catch (err) {
        console.log(err);
    }
}

async function deleteFileTemp() {
    try {
        await BaseHelper.deleteAllFileInFolder('temp/', 600);
    } catch (err) {
        logError(err);
    }
}

async function scheduleBy30Phut() {
    try {
        await deleteFileTemp();
    } catch (err) {
        logError(err);
    }
}

// CRON JOB UPDATE LINK PAYMENT
async function updateStatusLinkPayments() {
    try {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const conditions = {
            created_at: { $lte: sevenDaysAgo },
            status: 'PENDING',
            deleted_at: null
        };

        await LinkPaymentsModel.updateMany(conditions, { $set: { status: 'EXPIRED' } });

    } catch (error) {
        console.error('Error updating link payment statuses:', error);
        logError(error);
    }
}

class ScheduleService {
    async checkStartService() {
        try {
            // await addAllClassroom();
            await BaseHelper.createFolder('./testings');
        } catch (err) {
            logError(err);
        }
    }

    async startSchedule() {
        try {
            // syncDataIMG(_dir);
            // await removeUser();
            await this.checkStartService();
            // autoTruBuoiHoc();
            // await congBuoiHocToan();
            // await syncDOB();
            // await editDeviceOneSignal();

            schedule.scheduleJob('*/5 * * * *', () => {
                // updateStatusExamClassroom();
            });

            schedule.scheduleJob('0 * * * *', () => {
                console.log('[Cron] Checking expired links...');
                updateStatusLinkPayments();
              });


            schedule.scheduleJob('*/10 * * * *', () => {
                editDeviceOneSignal();
            });

            schedule.scheduleJob('*/30 * * * *', () => {
                // await buildClassroomRanking();
                scheduleBy30Phut();
            });

            schedule.scheduleJob('1 1 1 * * *', () => {
                // buildClassroomRanking();
            });

            schedule.scheduleJob('1 1 4 * * *', function () {

            });

            schedule.scheduleJob('0 0 * * *', () => {
                // endTesting();
            });
        } catch (err) {
            logError(err);
        }
    }
}

module.exports = ScheduleService;
