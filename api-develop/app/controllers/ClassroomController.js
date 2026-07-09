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
const ExamWordModel = require('../models/ExamWord');
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
const BillingModel = require('../models/Billing');
const UserService = require('../services/UserService');
const FastGiftModel = require("../models/FastGift");
const CategoryLivestreamModel = require('../models/CategoryLivestream');
const LabelModel = require('../models/Label');
const LabelItemModel = require('../models/LabelItem');
const language = BaseHelper.fileToJSON(`${__dirname}/../languages/vi.json`);

async function syncLabelNumItem(labelId) {
    const count = await LabelItemModel.count({ label_id: labelId });
    await LabelModel.updateOne({ _id: labelId }, { $set: { num_item: count } });
}

function removeSpacesAndSpecialChars(str) {
    str.replace(/[^a-zA-Z ]/g, "");
    str.replace(/[^\w\s]/gi, '');
    if (str == '')
        return "NOT_FOUND_999999";
    return str;
}

class ClassroomController {
    async listPublic(req, res, params) {
        try {
            let keyword = params.keyword || false;
            const page = parseInt(params.page || appConfig.PAGINATION.PAGE);
            let limit = parseInt(params.limit || appConfig.PAGINATION.LIMIT);
            if (limit === 100)
                limit = 200;
            const subjectID = params.subject_id || null;
            const isOnline = params.is_online;
            const groupID = params.group_id || null;
            const teacherID = params.teacher_id || null;
            let level = params.level || null;
            const conditions = { deleted_at: null };
            const price = params.price || null;
            const type = params.type || null;
            const bookID = params.book_id || null;
            let rangePrice = null;
            let fromPrice = null;
            let toPrice = null;
            let orderingFillter = null;

            if (type) {
                switch (type) {
                    case 'PROMOTION':
                        orderingFillter = 1
                        break;
                    case 'MOST_POPULAR':
                        orderingFillter = 2
                        break;
                    case 'HOT':
                        orderingFillter = 3
                        break;
                }
            }

            if (price) {
                if (typeof price === 'object' && price.length > 0) {
                    // Lay gia lon nhat, gia nho nhat
                    const priceArray = [];
                    for (let i = 0; i < price.length; i++) {
                        const _price = price[i];
                        rangePrice = _price.split('-');
                        fromPrice = parseFloat(rangePrice[0]);
                        toPrice = parseFloat(rangePrice[1]);
                        priceArray.push(fromPrice);
                        priceArray.push(toPrice);
                    }
                    const minPrice = Math.min.apply(null, priceArray);
                    const maxPrice = Math.max.apply(null, priceArray);
                    conditions.price = {
                        $lte: maxPrice,
                        $gte: minPrice
                    };
                } else {
                    rangePrice = price.split('-');
                    fromPrice = parseFloat(rangePrice[0]);
                    toPrice = parseFloat(rangePrice[1]);
                    conditions.price = {
                        $lte: toPrice,
                        $gte: fromPrice
                    };
                }
            }

            if (level) {
                level = level.split(',');
                conditions.level = { $in: level };
            }

            if (teacherID)
                conditions.teacher_id = teacherID;

            if (orderingFillter)
                conditions.ordering = orderingFillter;

            const options = {
                skip: (page - 1) * limit,
                limit: limit,
                sort: { ordering: 1 }
            };
            conditions.status = true;
            const sortKey = params.sort_key || null;
            const sortValue = params.sort_value || null;
            const sortKeys = [
                'name',
                'code',
                'level',
                'group',
                'teacher_id',
                'subject.id',
                'price',
                'order',
                'is_featured',
                'stock_status',
                'status',
                'updated_at'
            ];
            if (sortKey && sortKeys.indexOf(sortKey) >= 0 && (sortValue == 1 || sortValue == -1)) {
                options.sort[sortKey] = sortValue;
            }

            if (keyword) {
                keyword = removeSpacesAndSpecialChars(keyword);
                const parserKeyword = keyword.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
                conditions['$or'] = [
                    { name: { $regex: `\\b${parserKeyword}\\b`, $options: 'i' } },
                    { code: { $regex: `\\b${parserKeyword}\\b`, $options: 'i' } }
                ]
            }

            if (subjectID) {
                conditions['subject.id'] = subjectID;
                if (typeof subjectID === 'array' && subjectID.length > 0) {
                    conditions['subject.id'] = {
                        $in: subjectID
                    };
                }
            }

            if (groupID) {
                conditions['group.id'] = groupID;
                if (typeof groupID === 'array' && groupID.length > 0) {
                    conditions['group.id'] = {
                        $in: groupID
                    };
                }
            }

            if (isOnline === true || isOnline === false)
                conditions.is_online = isOnline;

            if (bookID) {
                const book = await BookModel.findOne({ _id: bookID });
                if (book && book.classroom_relates && book.classroom_relates.length > 0) {
                    conditions._id = { $in: book.classroom_relates };
                }
            }

            const labelId = params.label_id || null;
            if (labelId) {
                const childLabels = await LabelModel.find({ parent_id: labelId, deleted_at: null }, { _id: 1 });
                const labelIds = [labelId, ...childLabels.map(c => c._id.toString())];
                const assignedItemIds = await LabelItemModel.distinct('item_id', { label_id: { $in: labelIds }, item_type: 'CLASSROOM' });
                if (conditions._id && conditions._id.$in) {
                    const assignedSet = new Set(assignedItemIds);
                    conditions._id = { $in: conditions._id.$in.filter(id => assignedSet.has(id)) };
                } else {
                    conditions._id = { $in: assignedItemIds };
                }
            }

            const records = await ClassroomModel.find(conditions, null, options);
            const total = await ClassroomModel.count(conditions);

            const data = {
                records,
                limit,
                totalRecord: total,
                perPage: limit
            };

            // const teachers = await UserModel.find({ user_group: appConfig.USER_GROUP.TEACHER, status: 'ACTIVE', deleted_at: null });
            // data.teachers = teachers;

            return response(res, data, 'Thành công', statusCode.OK);
        } catch (err) {
            logError(err);
            console.log(err);
            return response(res, null, 'Có lỗi xảy ra. Vui lòng thử lại!', statusCode.ERROR);
        }
    }

    async list(req, res, params) {
        try {
            const keyword = params.keyword || false;
            const name = params.name || false;
            const page = parseInt(params.page || appConfig.PAGINATION.PAGE);
            let limit = parseInt(params.limit || appConfig.PAGINATION.LIMIT);
            if (limit === 100)
                limit = 200;
            const subjectID = params.subject_id || null;
            const groupID = params.group_id || null;
            const isOnline = params.is_online;
            const userCode = params.user_code || null;
            const teacherID = params.teacher_id || null;
            const level = params.level || [];

            const conditions = { deleted_at: null };
            if (teacherID)
                conditions.teacher_id = teacherID;

            let userClassrooms = null;
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
            const userClassroomInfo = {};
            if (userCode && (req.user.user_group === appConfig.USER_GROUP.ADMIN || req.user.user_group === appConfig.USER_GROUP.ACCOUNTANT)) {
                userClassrooms = await StudentClassroomModel.find({ 'user.code': userCode, deleted_at: null });
                arrayClassroomID = [];
                for (let i = 0; i < userClassrooms.length; i++) {
                    arrayClassroomID.push(userClassrooms[i].classroom.id);
                    userClassroomInfo[userClassrooms[i].classroom.id] = {
                        sobuoihoc: userClassrooms[i].sobuoihoc,
                        buoidahoc: userClassrooms[i].buoidahoc
                    };
                }
                conditions._id = { $in: arrayClassroomID };
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

            if (subjectID){
                conditions['subject.id'] = subjectID;
            }

            if (groupID)
                conditions['group.id'] = groupID;

            if (name)
                conditions.name = { $regex: name, $options: 'i' };

            if (level.length > 0)
                conditions.level = { $in: level };

            if (isOnline === true || isOnline === false)
                conditions.is_online = isOnline;

            // if (req.user.user_group === appConfig.USER_GROUP.TEACHER) {
            //     conditions['subject.id'] = { $in: req.user.subject_ids };
            // }

            // if (req.user.user_group === appConfig.USER_GROUP.TEACHER) {
            //     conditions['group.id'] = { $in: req.user.group_ids };
            // }

            const labelIdFilter = params.label_id || null;
            if (labelIdFilter) {
                const childLabels = await LabelModel.find({ parent_id: labelIdFilter, deleted_at: null }, { _id: 1 });
                const labelIds = [labelIdFilter, ...childLabels.map(c => c._id.toString())];
                const assignedItemIds = await LabelItemModel.distinct('item_id', { label_id: { $in: labelIds }, item_type: 'CLASSROOM' });
                if (conditions._id && conditions._id.$in) {
                    const assignedSet = new Set(assignedItemIds);
                    conditions._id = { $in: conditions._id.$in.filter(id => assignedSet.has(id)) };
                } else {
                    conditions._id = { $in: assignedItemIds };
                }
            }

            const records = await ClassroomModel.find(conditions, null, options);
            const total = await ClassroomModel.count(conditions);
            const data = {
                records,
                limit,
                totalRecord: total,
                userClassroomInfo,
                perPage: limit,
                is_show_video_tab: appConfig.CLASSROOM_CONFIG.SHOW_VIDEO_TAB,
                is_show_access_menu: appConfig.SHOW_ACCESS_MENU
            };
            return response(res, data, 'Thành công', statusCode.OK);
        } catch (err) {
            logError(err);
            return response(res, null, 'Có lỗi xảy ra. Vui lòng thử lại!', statusCode.ERROR);
        }
    }
    async listRelated(req, res, params) {
        try {
            const page = parseInt(params.page || appConfig.PAGINATION.PAGE);
            const limit = parseInt(params.limit || appConfig.PAGINATION.LIMIT);
            const classroomID = params.classroom_id || null;
            const groupID = params.group_id || null;
            const level = params.level || false;
            const conditions = { is_online: true, deleted_at: null };

            const options = {
                sort: { created_at: -1 }
            }

            if (limit != -1) {
                options.skip = (page - 1) * limit;
                options.limit = limit
            }

            if (level)
                conditions.level = level;

            if (groupID)
                if (Array.isArray(groupID)) {
                    conditions.$or = [];
                    for (let i = 0; i < groupID.length; i++) {
                        conditions.$or.push({ 'group.id': groupID[i] });
                    }
                } else {
                    conditions['group.id'] = groupID;
                }
            if (classroomID) {
                conditions._id = { $ne: classroomID };
            }
            const records = await ClassroomModel.db.find(conditions, null, options).lean();
            for (let i = 0; i < records.length; i++) {
                const book = records[i];
                let teacher = null;
                if (book.teacher_id)
                    teacher = await UserModel.db.findOne({ _id: book.teacher_id });
                book.teacher = teacher;
            }
            const total = await ClassroomModel.count(conditions);
            const data = {
                records,
                totalRecord: total,
                perPage: limit,
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
            const rs = await ClassroomModel.db.findOne(conditions).lean();
            // rs.toObject();
            rs.is_show_video_tab = appConfig.CLASSROOM_CONFIG.SHOW_VIDEO_TAB;

            const numUser = await StudentClassroomModel.count({ 'classroom.id': id, deleted_at: null });
            ClassroomModel.updateOne(conditions, { $set: { num_student: numUser } });
            const cartCategories = await CartCategoryModel.find({ status: true, deleted_at: null });

            let bookAttached = [];
            if (rs.book_attached && rs.book_attached.length > 0)
                bookAttached = await BookModel.find({ _id: { $in: rs.book_attached }, deleted_at: null });

            let bookRelates = [];
            if (rs.book_relates && rs.book_relates.length > 0)
                bookRelates = await BookModel.find({ _id: { $in: rs.book_relates }, deleted_at: null });

            let classroomRelates = [];
            if (rs.classroom_relates && rs.classroom_relates.length > 0)
                classroomRelates = await ClassroomModel.find({ _id: { $in: rs.classroom_relates }, deleted_at: null });
            if (rs.teacher_id) {
                const teacher = await UserModel.db.find({ _id: rs.teacher_id });
                rs.teacher = teacher;
            }
            let classroomAttached = [];
            if (rs.classroom_attached && rs.classroom_attached.length > 0)
                classroomAttached = await ClassroomModel.find({ _id: { $in: rs.classroom_attached }, deleted_at: null });

            return response(res, { classroom: rs, cartCategories, bookAttached, bookRelates, classroomRelates, classroomAttached }, 'Thành công', statusCode.OK);
        } catch (err) {
            logError(err);
            console.log(err);
            return response(res, null, 'Có lỗi xảy ra. Vui lòng thử lại!', statusCode.ERROR);
        }
    }

    async view(req, res, params) {
        try {
            let id = params.id;
            id = id.replace('hoc/', '');
            let userID = params.user_id || null;
            let userGroup = params.user_group || 'STUDENT';
            if (req.user) {
                userID = req.user.user_id;
                userGroup = req.user.user_group;
            }

            let conditions = { _id: id };
            const _classroom = await ClassroomModel.findOne(conditions);
            if (!_classroom)
                return response(res, null, 'Khóa học này không tồn tại!', statusCode.ERROR);
            const classroom = _classroom.toObject();

            conditions = {
                'classroom.id': id,
                status: true,
                deleted_at: null
            };
            const options = {
                skip: 0,
                limit: 50,
                sort: { created_at: -1 }
            };
            const reviews = await ClassroomReviewModel.find(conditions, null, options);
            const totalReview = await ClassroomReviewModel.count(conditions);

            const otherClassrooms = [];
            let teacher = null;
            if (classroom.teacher_id) {
                const projection = 'fullname avatar description alias';
                teacher = await UserModel.findOne({ _id: classroom.teacher_id }, projection);
            }

            // Tinh Rank cho Student trong Lop
            let avgRankLog = [];
            const month = new Date().getMonth();
            const year = new Date().getFullYear();
            const date = BaseHelper.startDateEndDate(month, year);
            const logKey = classroom.id + '-' + year + '-' + month;
            const avgRankLogData = await AvgPointLogModel.findOne({ key: logKey });
            if (avgRankLogData) {
                avgRankLog = JSON.parse(avgRankLogData.log);
                if (avgRankLog.log === '[]') {
                    await AvgPointLogModel.delete({ key: logKey });
                }
            }

            if (avgRankLog.log === '[]' || !avgRankLogData) {
                const aggregate = [
                    { $match: { 'classroom.id': classroom.id, created_at: { $gte: date.start_date, $lte: date.end_date } } },
                    { $group: { _id: '$user', avg_point: { $avg: '$point' } } },
                    { $sort: { avg_point: -1 } }
                ];

                avgRankLog = await PointLogModel.aggregate(aggregate);

                const _doc = {
                    key: logKey,
                    log: JSON.stringify(avgRankLog)
                };
                AvgPointLogModel.create(_doc);
            }

            const arrayMemeberID = [];

            const arrayTop10Data = [];
            for (let i = 0; i < avgRankLog.length; i++) {
                if (arrayMemeberID.indexOf(avgRankLog[i]._id.id) < 0) {
                    arrayTop10Data.push(avgRankLog[i]);
                    arrayMemeberID.push(avgRankLog[i]._id.id);
                }
                if (i == 10)
                    break;
            }

            let top10Array = [];
            if (arrayMemeberID.length > 0) {
                const projection = '_id code fullname avatar';
                top10Array = await UserModel.find({ _id: { $in: arrayMemeberID } }, projection);
            }
            const top10 = [];
            for (let i = 0; i < top10Array.length; i++) {
                const _top10 = top10Array[i].toObject();
                for (let j = 0; j < arrayTop10Data.length; j++) {
                    if (arrayTop10Data[j]._id.id == top10Array[i]._id) {
                        _top10['avg_point'] = arrayTop10Data[j].avg_point;
                        break;
                    }
                }
                top10.push(_top10);
            }

            const guideStudy = await SettingModel.findOne({ setting_name: 'guide_study' });

            const extra_number_student = classroom.extra_number_student ? classroom.extra_number_student : 0;
            classroom.num_student += extra_number_student;

            classroom.link_fb_page = '#';
            classroom.link_fb_group = '#';
            const subject = await SubjectModel.findOne({ _id: classroom.subject.id });
            if (subject) {
                classroom.link_fb_page = subject.support_fb_link || '#';
                classroom.link_fb_group = subject.link_fb_group || '#';
            }

            let bookAttached = [];
            if (classroom.book_attached && classroom.book_attached.length > 0)
                bookAttached = await BookModel.find({ _id: { $in: classroom.book_attached }, deleted_at: null });

            let bookRelates = [];
            if (classroom.book_relates && classroom.book_relates.length > 0)
                bookRelates = await BookModel.find({ _id: { $in: classroom.book_relates }, deleted_at: null });

            let classroomRelates = [];
            if (classroom.classroom_relates && classroom.classroom_relates.length > 0)
                classroomRelates = await ClassroomModel.find({ _id: { $in: classroom.classroom_relates }, deleted_at: null });

            let classroomAttached = [];
            if (classroom.classroom_attached && classroom.classroom_attached.length > 0)
                classroomAttached = await ClassroomModel.find({ _id: { $in: classroom.classroom_attached }, deleted_at: null });

            const data = {
                classroom,
                bookAttached,
                bookRelates,
                classroomRelates,
                classroomAttached,
                reviews,
                totalReview,
                teacher,
                top10,
                guideStudy,
                is_joined: false,
                otherClassrooms
            };

            let checkUser = { user_id: userID, user_group: userGroup };
            data.is_joined = await ClassroomService.isUserInClassroom(checkUser, id);

            return response(res, data, 'Thành công', statusCode.OK);
        } catch (err) {
            logError(err);
            console.log(err);
            return response(res, null, 'Có lỗi xảy ra. Vui lòng thử lại!', statusCode.ERROR);
        }
    }

    async listMember(req, res, params) {
        try {
            const { id, keyword } = params;
            let month = params.month || new Date().getMonth();
            const year = params.year || new Date().getFullYear();
            const page = parseInt(params.page || appConfig.PAGINATION.PAGE);
            let limit = parseInt(params.limit || appConfig.PAGINATION.LIMIT);

            const isExport = params.is_export || false;
            if (isExport)
                limit = 500000;

            let conditions = {};
            conditions['classroom.id'] = id;
            if (keyword) {
                conditions.$or = [
                    { 'user.name': { $regex: keyword, $options: 'i' } },
                    { 'user.code': { $regex: keyword, $options: 'i' } }
                ];
            }
            conditions.deleted_at = null;
            const arrayBuoiHoc = {};

            const options = {
                skip: (page - 1) * limit,
                limit: limit
            };

            const total = await StudentClassroomModel.count(conditions);
            const studentClassroom = await StudentClassroomModel.find(conditions, null, options);
            const arrayID = [];
            for (let i = 0; i < studentClassroom.length; i++) {
                if (studentClassroom[i].user) {
                    if (arrayID.indexOf(studentClassroom[i].user.id) < 0) {
                        arrayID.push(studentClassroom[i].user.id);
                        const sbh = (studentClassroom[i].sobuoihoc) ? studentClassroom[i].sobuoihoc : 0;
                        const sbdh = (studentClassroom[i].buoidahoc) ? studentClassroom[i].buoidahoc : 0;
                        const lesson_view_dates = (studentClassroom[i].lesson_view_dates) ? studentClassroom[i].lesson_view_dates : null;
                        arrayBuoiHoc[studentClassroom[i].user.id] = { sobuoihoc: sbh, buoidahoc: sbdh, joined_at: studentClassroom[i].created_at, lesson_view_dates };
                    }

                }
            }
            conditions = { _id: { $in: arrayID } };
            if (keyword) {
                conditions.$or = [
                    { fullname: { $regex: keyword, $options: 'i' } },
                    { phone: { $regex: keyword, $options: 'i' } },
                    { code: { $regex: keyword, $options: 'i' } },
                    { email: { $regex: keyword, $options: 'i' } }
                ];
            }
            const members = await UserModel.find(conditions);
            const payTypeByUserId = {};
            if (arrayID.length > 0) {
                const bills = await BillingModel.find({
                    'user.id': { $in: arrayID },
                    deleted_at: null,
                    items: {
                        $elemMatch: {
                            id
                        }
                    }
                }, null, { sort: { billed_at: -1, created_at: -1 } });
                for (let i = 0; i < bills.length; i++) {
                    const userID = bills[i].user ? bills[i].user.id : null;
                    if (userID && typeof payTypeByUserId[userID] === 'undefined') {
                        payTypeByUserId[userID] = bills[i].pay_type || null;
                    }
                }
            }
            conditions = {};
            const date = BaseHelper.startDateEndDate(month, year);
            conditions['classroom.id'] = id;
            conditions.deleted_at = null;
            if (date)
                conditions.created_at = { $gte: new Date(date.start_date), $lte: new Date(date.end_date) };
            conditions.status = 'DONE';
            const projection = '_id point user classroom num_right num_wrong';

            const testings = await TestingModel.find(conditions, projection);
            if (!testings)
                return response(res, {}, 'Bài thi không tồn tại.', statusCode.ERROR);
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

            const data = [];
            for (let i = 0; i < members.length; i++) {
                // eslint-disable-next-line valid-typeof
                const student = {};
                student._id = members[i].id;
                student.fullname = members[i].fullname;
                student.code = members[i].code;
                student.phone = members[i].phone;
                student.parent_phone = members[i].parent_phone;
                if (userTesting[members[i].id]) {
                    student.total_point = userTesting[members[i].id].total_point;
                    student.total_testing = userTesting[members[i].id].total_testing;
                    student.total_num_right = userTesting[members[i].id].total_num_right;
                    student.total_num_wrong = userTesting[members[i].id].total_num_wrong;
                } else {
                    student.total_point = 0;
                    student.total_testing = 0;
                    student.total_num_right = 0;
                    student.total_num_wrong = 0;
                }

                student.sobuoihoc = arrayBuoiHoc[members[i].id] ? arrayBuoiHoc[members[i].id].sobuoihoc : 0;
                student.buoidahoc = arrayBuoiHoc[members[i].id] ? arrayBuoiHoc[members[i].id].buoidahoc : 0;
                student.joined_at = arrayBuoiHoc[members[i].id] ? arrayBuoiHoc[members[i].id].joined_at : null;
                student.lesson_view_dates = arrayBuoiHoc[members[i].id].lesson_view_dates;
                student.pay_type = typeof payTypeByUserId[members[i].id] !== 'undefined' ? payTypeByUserId[members[i].id] : null;

                data.push(student);
            }

            if (isExport) {
                const fileName = await ClassroomService.exportMemberClassroom(data);
                const streamFile = fs.readFileSync('./temp/excel/' + fileName);
                download(res, streamFile, fileName, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            }

            const _data = {
                totalRecord: total,
                perPage: limit,
                records: data
            }
            return response(res, _data, 'Thành công', statusCode.OK);
        } catch (err) {
            logError(err);
            return response(res, null, 'Có lỗi xảy ra. Vui lòng thử lại!', statusCode.ERROR);
        }
    }

    async members(req, res, params) {
        try {
            const { id, keyword } = params;
            const month = params.month || new Date().getMonth();
            const year = params.year || new Date().getFullYear();

            const userOnClassroom = await ClassroomService.checkUserOnClassroom(req.user, id, null);
            if (!userOnClassroom)
                return response(res, {}, 'Bạn đã hết số buổi học. Không thể truy cập Lớp. Vui lòng đóng học phí!', statusCode.ERROR);

            let conditions = {};
            conditions['classroom.id'] = id;
            if (keyword) {
                conditions.$or = [
                    { 'user.name': { $regex: keyword, $options: 'i' } },
                    { 'user.code': { $regex: keyword, $options: 'i' } }
                ];
            }
            conditions.deleted_at = null;
            const arrayBuoiHoc = {};
            const studentClassroom = await StudentClassroomModel.find(conditions);
            const arrayID = [];
            for (let i = 0; i < studentClassroom.length; i++) {
                if (studentClassroom[i].user) {
                    if (arrayID.indexOf(studentClassroom[i].user.id) < 0) {
                        arrayID.push(studentClassroom[i].user.id);
                        const sbh = (studentClassroom[i].sobuoihoc) ? studentClassroom[i].sobuoihoc : 0;
                        const sbdh = (studentClassroom[i].buoidahoc) ? studentClassroom[i].buoidahoc : 0;
                        arrayBuoiHoc[studentClassroom[i].user.id] = { sobuoihoc: sbh, buoidahoc: sbdh, joined_at: studentClassroom[i].created_at };
                    }

                }
            }
            conditions = { _id: { $in: arrayID } };
            if (keyword) {
                conditions.$or = [
                    { fullname: { $regex: keyword, $options: 'i' } },
                    { phone: { $regex: keyword, $options: 'i' } },
                    { code: { $regex: keyword, $options: 'i' } },
                    { email: { $regex: keyword, $options: 'i' } }
                ];
            }
            const members = await UserModel.find(conditions);

            conditions = {};
            const date = BaseHelper.startDateEndDate(month, year);
            conditions['classroom.id'] = id;
            conditions.deleted_at = null;
            if (date)
                conditions.created_at = { $gte: new Date(date.start_date), $lte: new Date(date.end_date) };
            conditions.status = 'DONE';
            const projection = '_id point user classroom num_right num_wrong';
            const testings = await TestingModel.find(conditions, projection);
            if (!testings)
                return response(res, {}, 'Bài thi không tồn tại.', statusCode.ERROR);
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

            const data = [];
            for (let i = 0; i < members.length; i++) {
                // eslint-disable-next-line valid-typeof
                const student = {};
                student._id = members[i].id;
                student.fullname = members[i].fullname;
                student.phone = members[i].phone;
                student.parent_phone = members[i].parent_phone;
                student.code = members[i].code;
                if (userTesting[members[i].id]) {
                    student.total_point = userTesting[members[i].id].total_point;
                    student.total_testing = userTesting[members[i].id].total_testing;
                    student.total_num_right = userTesting[members[i].id].total_num_right;
                    student.total_num_wrong = userTesting[members[i].id].total_num_wrong;
                } else {
                    student.total_point = 0;
                    student.total_testing = 0;
                    student.total_num_right = 0;
                    student.total_num_wrong = 0;
                }

                student.sobuoihoc = arrayBuoiHoc[members[i].id] ? arrayBuoiHoc[members[i].id].sobuoihoc : 0;
                student.buoidahoc = arrayBuoiHoc[members[i].id] ? arrayBuoiHoc[members[i].id].buoidahoc : 0;
                student.joined_at = arrayBuoiHoc[members[i].id] ? arrayBuoiHoc[members[i].id].joined_at : null;

                data.push(student);
            }

            return response(res, data, 'Thành công', statusCode.OK);
        } catch (err) {
            logError(err);
            return response(res, null, 'Có lỗi xảy ra. Vui lòng thử lại!', statusCode.ERROR);
        }
    }

    async overview(req, res, params) {
        try {
            const { id, year, month } = params;
            const date = BaseHelper.startDateEndDate(month, year);
            if (!date || !id)
                return response(res, {}, 'Request không hợp lệ!', statusCode.ERROR);

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

            conditions.created_at = { $lte: date.end_date, $gte: date.start_date };
            // List 10 bai Test moi nhat
            const options = {
                skip: 0,
                limit: 10,
                sort: { updated_at: -1 }
            };
            const testings = await TestingModel.find(conditions, null, options);

            // Dem tong so hoc sinh trong Lop
            const classroomUser = await StudentClassroomModel.findOne({ 'classroom.id': id, 'user.id': req.user.user_id });

            const numStudent = await StudentClassroomModel.count({ 'classroom.id': id });

            let aggregate = [];

            // Tinh DTB cua Lop
            let classroomAvgPoint = 0;
            const dTBClassroomKey = 'DTB_' + year + '_' + month + '_' + id;
            const dTB = await RedisService.getValueByKey(dTBClassroomKey);
            if (dTB) {
                classroomAvgPoint = parseFloat(dTB);
            } else {
                aggregate = [
                    { $match: { 'classroom.id': classroom.id, created_at: { $gte: date.start_date, $lte: date.end_date } } },
                    { $group: { _id: null, avg_point: { $avg: '$point' } } }
                ];
                const avgPointLog = await PointLogModel.aggregate(aggregate);
                if (avgPointLog && avgPointLog[0])
                    classroomAvgPoint = Math.round(avgPointLog[0].avg_point);
                await RedisService.add(dTBClassroomKey, classroomAvgPoint, 1800);
            }

            // Tinh Rank cho Student trong Lop
            let avgRankLog = [];
            const logKey = id + '-' + year + '-' + month;
            const avgRankLogData = await AvgPointLogModel.findOne({ key: logKey });

            if (avgRankLogData) {
                avgRankLog = JSON.parse(avgRankLogData.log);
                if (avgRankLog.log === '[]')
                    await AvgPointLogModel.delete({ key: logKey });
            }

            if (avgRankLog.log === '[]' || !avgRankLogData) {
                aggregate = [
                    { $match: { 'classroom.id': classroom.id, created_at: { $gte: date.start_date, $lte: date.end_date } } },
                    { $group: { _id: '$user', avg_point: { $avg: '$point' } } },
                    { $sort: { avg_point: -1 } }
                ];
                avgRankLog = await PointLogModel.aggregate(aggregate);

                if (avgRankLog.length > 0) {
                    const _doc = {
                        key: logKey,
                        log: JSON.stringify(avgRankLog)
                    };
                    AvgPointLogModel.create(_doc);
                }
            }

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

            let members = [];
            if (arrayMemeberID.length > 0) {
                const projection = '_id code fullname';
                members = await UserModel.find({ _id: { $in: arrayMemeberID } }, projection);
            }

            // Dem tong so bai da thi cua hoc sinh
            conditions = {};
            conditions['user.id'] = req.user.user_id;
            conditions['classroom.id'] = id;
            conditions.deleted_at = null;
            conditions.created_at = { $gte: date.start_date, $lte: date.end_date };
            conditions.status = appConfig.TESTING_STATUS.DONE;
            const numTesting = await TestingModel.count(conditions);
            const data = {
                classroom,
                classroomUser,
                num_student: numStudent,
                classroom_avg_point: classroomAvgPoint,
                student_ranking: rank,
                student_avg_point: studentAvgPoint,
                student_num_testing: numTesting,
                testings,
                members,
                classroom_top_ranking: avgRankLog,
                is_show_video_tab: appConfig.CLASSROOM_CONFIG.SHOW_VIDEO_TAB,
                notify_note: appConfig.NOTIFY_NOTE
            };
            return response(res, data, 'Thành công', statusCode.OK);
        } catch (err) {
            logError(err);
            return response(res, null, 'Có lỗi xảy ra. Vui lòng thử lại!', statusCode.ERROR);
        }
    }

    async create(req, res, params) {
        try {
            const {
                name,
                code,
                room,
                note,
                description,
                content,
                files,
                banner,
                chapters,
            } = params;

            const originPrice = params.origin_price || 0;
            const price = params.price || 0;
            const hpDay = params.hp_day || 0;
            const isOnline = params.is_online || false;
            const isFeatured = params.is_featured || false;
            const hp1MonthDay = params.hp_1month_day || 0;
            const hp3MonthDay = params.hp_3month_day || 0;
            const hp6MonthDay = params.hp_6month_day || 0;
            const hp12MonthDay = params.hp_12month_day || 0;
            const isCadup = params.is_cadup || false;
            const isAutoDiffDay = params.is_auto_diff_day || false;
            const subjectID = params.subject_id || null;
            const teacherID = params.teacher_id || null;
            const groupID = params.group_id || null;
            const status = params.status || false;
            const videoIntro = params.video_intro || null;
            const extraNumberStudent = params.extra_number_student || 0;
            const linkFbPage = params.link_fb_page || null;
            const linkFbGroup = params.link_fb_group || null;
            const cartCategoryID = params.cart_category_id || null;
            const classroomRelates = params.classroom_relates || [];
            const classroomAttached = params.classroom_attached || [];
            const bookRelates = params.book_relates || [];
            const bookAttached = params.book_attached || [];
            const promotion = params.promotion || null;
            const ordering = params.ordering || 999;
            const level = params.level || null;
            const quantity = params.quantity || 0;
            const timeCourse = params.timeCourse || null;
            const includes = params.includes || [];
            const highlightInformations = params.highlightInformations || [];
            const student_owned = params.student_owned || 0;

            if (!name)
                return response(res, null, language.CANNOT_EMPTY.replace('%s', language.CLASSROOM), statusCode.ERROR);

            if (!subjectID)
                return response(res, null, language.CANNOT_EMPTY.replace('%s', language.SUBJECT), statusCode.ERROR);

            const subject = await SubjectModel.findOne({ _id: subjectID });
            if (!subject)
                return response(res, null, 'Môn học này không tồn tại!', statusCode.ERROR);


            if (!groupID)
                return response(res, null, language.CANNOT_EMPTY.replace('%s', 'Danh mục'), statusCode.ERROR);
            const group = await ClassroomGroupModel.findOne({ _id: groupID });
            if (!group)
                return response(res, null, 'Danh mục này không tồn tại!', statusCode.ERROR);

            if (!teacherID)
                return response(res, null, language.CANNOT_EMPTY.replace('%s', 'Giáo viên'), statusCode.ERROR);
            const teacherObj = await UserModel.findOne({ _id: teacherID });
            if (!teacherObj)
                return response(res, null, 'Giáo viên này không tồn tại!', statusCode.ERROR);

            const alias = BaseHelper.seoURL(name);
            const docClassroom = {
                name,
                alias,
                code,
                subject: {
                    id: subject.id,
                    name: subject.name
                },
                group: {
                    id: group.id,
                    name: group.name
                },
                room,
                banner,
                teacher: teacherObj.fullname,
                teacher_id: teacherObj.id,
                teacher_alias: teacherObj.alias ? teacherObj.alias : null,
                hp_day: hpDay,
                hp_1month_day: hp1MonthDay,
                hp_3month_day: hp3MonthDay,
                hp_6month_day: hp6MonthDay,
                hp_12month_day: hp12MonthDay,
                is_cadup: isCadup,
                is_auto_diff_day: isAutoDiffDay,
                is_online: isOnline,
                is_featured: isFeatured,
                note,
                description,
                content,
                price: price,
                origin_price: originPrice,
                extra_number_student: extraNumberStudent,
                num_student: 0,
                ordering,
                video_intro: videoIntro,
                link_fb_page: linkFbPage,
                link_fb_group: linkFbGroup,
                status: status,
                promotion,
                cart_category_id: cartCategoryID,
                classroom_relates: classroomRelates,
                classroom_attached: classroomAttached,
                book_relates: bookRelates,
                book_attached: bookAttached,
                level,
                quantity,
                includes: includes,
                highlightInformations: highlightInformations,
                student_owned: student_owned,
                time_course: timeCourse,
            };

            if (files && files.length > 0) {
                const fileData = await UploadService.upload(files[0], 'base64', 'classrooms');
                if (fileData) {
                    docClassroom.image = appConfig.FILE_DOMAIN + '/' + fileData[0];
                }
            }

            const classroom = await ClassroomModel.create(docClassroom);
            if (!classroom)
                return response(res, {}, language.ERROR, statusCode.ERROR);

            ClassroomService.updateClassroomChapter(chapters, classroom);
            return response(res, classroom, 'Thành công', statusCode.OK);
        } catch (err) {
            logError(err);
            console.log(err);
            return response(res, {}, 'Có lỗi xảy ra. Vui lòng thử lại!', statusCode.ERROR);
        }
    }

    async update(req, res, params) {
        try {
            const {
                id,
                name,
                room,
                code,
                note,
                price,
                files,
                level,
                banner,
                content,
                description,
                teacher,
                chapters
            } = params;

            const originPrice = params.origin_price || null;
            const isOnline = params.is_online || false;
            const isFeatured = params.is_featured || false;
            const hpDay = params.hp_day || 0;
            const hp1MonthDay = params.hp_1month_day || 0;
            const hp3MonthDay = params.hp_3month_day || 0;
            const hp6MonthDay = params.hp_6month_day || 0;
            const hp12MonthDay = params.hp_12month_day || 0;
            const isCadup = params.is_cadup || false;
            const isAutoDiffDay = params.is_auto_diff_day || false;
            const subjectID = params.subject_id || null;
            const teacherID = params.teacher_id || null;
            const groupID = params.group_id || null;
            const status = params.status || false;
            const videoIntro = params.video_intro || null;
            const extraNumberStudent = params.extra_number_student || 0;
            const showOnCart = params.show_on_cart || false;
            const linkFbPage = params.link_fb_page || null;
            const linkFbGroup = params.link_fb_group || null;
            const cartCategoryID = params.cart_category_id || null;
            const classroomRelates = params.classroom_relates || [];
            const classroomAttached = params.classroom_attached || [];
            const bookRelates = params.book_relates || [];
            const bookAttached = params.book_attached || [];
            const promotion = params.promotion || null;
            const ordering = params.ordering || 999;
            const quantity = params.quantity || 0;
            const timeCourse = params.timeCourse || null;
            const includes = params.includes || null;
            const highlightInformations = params.highlightInformations || null;
            const student_owned = params.student_owned || 0;
            const labelIds = params.label_ids !== undefined
                ? (Array.isArray(params.label_ids) ? params.label_ids : [])
                : undefined;
            if (!id)
                return response(res, null, 'Request không hợp lệ!', statusCode.ERROR);

            const subject = await SubjectModel.findOne({ _id: subjectID });
            if (!subject)
                return response(res, null, 'Môn học này không tồn tại!', statusCode.ERROR);

            if (!groupID)
                return response(res, null, language.CANNOT_EMPTY.replace('%s', 'Danh mục'), statusCode.ERROR);
            const group = await ClassroomGroupModel.findOne({ _id: groupID });
            if (!group)
                return response(res, null, 'Danh mục này không tồn tại!', statusCode.ERROR);

            if (!teacherID)
                return response(res, null, language.CANNOT_EMPTY.replace('%s', 'Giáo viên'), statusCode.ERROR);
            const teacherObj = await UserModel.findOne({ _id: teacherID });
            if (!teacherObj)
                return response(res, null, 'Giáo viên này không tồn tại!', statusCode.ERROR);

            const alias = BaseHelper.seoURL(name);
            const docClassroom = {
                name: name,
                alias: alias
            };

            if (code)
                docClassroom.code = code;

            if (room)
                docClassroom.room = room;

            if (note)
                docClassroom.note = note;

            if (teacher)
                docClassroom.teacher = teacherObj.fullname;

            if (teacherObj)
                docClassroom.teacher_id = teacherObj.id;

            docClassroom.teacher_alias = teacherObj.alias ? teacherObj.alias : null;

            if (hpDay)
                docClassroom.hp_day = hpDay;

            if (hp1MonthDay)
                docClassroom.hp_1month_day = hp1MonthDay;

            if (hp3MonthDay)
                docClassroom.hp_3month_day = hp3MonthDay;

            if (hp6MonthDay)
                docClassroom.hp_6month_day = hp6MonthDay;

            if (hp12MonthDay)
                docClassroom.hp_12month_day = hp12MonthDay;

            if (price)
                docClassroom.price = price;

            if (originPrice)
                docClassroom.origin_price = originPrice;

            docClassroom.is_cadup = isCadup;
            docClassroom.is_auto_diff_day = isAutoDiffDay;
            docClassroom.content = content;
            docClassroom.description = description;
            docClassroom.is_online = isOnline;
            docClassroom.video_intro = videoIntro;
            docClassroom.classroom_relates = classroomRelates;
            docClassroom.classroom_attached = classroomAttached;
            docClassroom.book_relates = bookRelates;
            docClassroom.book_attached = bookAttached;
            docClassroom.promotion = promotion;
            docClassroom.ordering = ordering;
            if (includes)
                docClassroom.includes = includes;
            if (highlightInformations)
                docClassroom.highlightInformations = highlightInformations;
            docClassroom.student_owned = student_owned;
            if (level)
                docClassroom.level = level;

            if (subject)
                docClassroom.subject = {
                    id: subject.id,
                    name: subject.name
                };

            if (group)
                docClassroom.group = {
                    id: group.id,
                    name: group.name
                };

            if (files && files.length > 0) {
                const fileData = await UploadService.upload(files[0], 'base64', 'classrooms');
                if (fileData) {
                    docClassroom.image = appConfig.FILE_DOMAIN + '/' + fileData[0];
                }
            }

            docClassroom.banner = banner;
            docClassroom.extra_number_student = extraNumberStudent;
            docClassroom.link_fb_group = linkFbGroup;
            docClassroom.link_fb_page = linkFbPage;

            docClassroom.status = status;
            docClassroom.show_on_cart = showOnCart;
            docClassroom.cart_category_id = cartCategoryID;
            docClassroom.is_featured = isFeatured;
            docClassroom.quantity = quantity;
            docClassroom.time_course = timeCourse;

            const classroom = await ClassroomModel.findOne({ _id: id });
            if (!classroom)
                return response(res, {}, language.ITEM_NOT_EXIST.replace('%s', language.CLASSROOM), statusCode.ERROR);

            // Validate nhãn trước khi update
            if (labelIds !== undefined && labelIds.length > 0) {
                const validLabels = await LabelModel.find({ _id: { $in: labelIds }, deleted_at: null, status: 'ACTIVE' });
                if (validLabels.length !== labelIds.length)
                    return response(res, null, 'Một hoặc nhiều nhãn không hợp lệ hoặc đang ẩn', statusCode.ERROR);

                const parentIdSet = new Set(validLabels.filter(l => l.parent_id).map(l => l.parent_id));
                if (validLabels.filter(l => !l.parent_id).some(l => !l.is_primary))
                    return response(res, null, 'Một hoặc nhiều nhãn không thuộc nhãn cha đang được sử dụng', statusCode.ERROR);

                if (parentIdSet.size > 0) {
                    const primaryParents = await LabelModel.find({ _id: { $in: [...parentIdSet] }, is_primary: true, deleted_at: null }, { _id: 1 });
                    const validParentIds = new Set(primaryParents.map(p => p._id.toString()));
                    if ([...parentIdSet].some(pid => !validParentIds.has(pid)))
                        return response(res, null, 'Một hoặc nhiều nhãn không thuộc nhãn cha đang được sử dụng', statusCode.ERROR);
                }
            }

            const rs = await ClassroomModel.updateOne({ _id: id }, docClassroom);
            ClassroomService.updateClassroomChapter(chapters, classroom, params.chapter_delete_ids);

            // Đồng bộ nhãn nếu label_ids được truyền vào
            if (labelIds !== undefined) {
                const classroomId = id.toString();
                const oldItems = await LabelItemModel.find({ item_id: classroomId, item_type: 'CLASSROOM' }, { label_id: 1 });
                const oldLabelIds = oldItems.map(i => i.label_id);

                await LabelItemModel.delete({ item_id: classroomId, item_type: 'CLASSROOM' }, true);

                if (labelIds.length > 0) {
                    await Promise.all(labelIds.map(lid => LabelItemModel.create({ label_id: lid, item_id: classroomId, item_type: 'CLASSROOM' })));
                }

                const affectedIds = [...new Set([...oldLabelIds, ...labelIds])];
                if (affectedIds.length > 0) {
                    await Promise.all(affectedIds.map(lid => syncLabelNumItem(lid)));
                }
            }

            if (rs.nModified || labelIds !== undefined) {
                const updatedClassroom = await ClassroomModel.findOne({ _id: id });
                return response(res, updatedClassroom, 'Thành công', statusCode.OK);
            }
            return response(res, classroom, language.ERROR, statusCode.ERROR);
        } catch (err) {
            logError(err);
            console.log(err);
            return response(res, {}, 'Có lỗi xảy ra. Vui lòng thử lại!', statusCode.ERROR);
        }
    }

    async updateMetaData(req, res, params) {
        try {
            const id = params.id || null;
            const ordering = params.ordering || 999;
            const status = params.status;
            const isOnline = params.is_online;
            const isFeatured = params.is_featured;

            if (!id)
                return response(res, null, 'Request không hợp lệ!', statusCode.ERROR);

            const docClassroom = {};
            docClassroom.ordering = parseInt(ordering);
            if (status !== undefined) docClassroom.status = status;
            if (isOnline !== undefined) docClassroom.is_online = isOnline;
            if (isFeatured !== undefined) docClassroom.is_featured = isFeatured;

            let classroom = await ClassroomModel.findOne({ _id: id });
            if (!classroom)
                return response(res, {}, language.ITEM_NOT_EXIST.replace('%s', language.CLASSROOM), statusCode.ERROR);
            const rs = await ClassroomModel.updateOne({ _id: id }, { $set: docClassroom });
            if (rs.nModified) {
                classroom = await ClassroomModel.findOne({ _id: id });
                return response(res, classroom, 'Thành công', statusCode.OK);
            }
            return response(res, classroom, language.ERROR, statusCode.ERROR);
        } catch (err) {
            logError(err);
            return response(res, {}, 'Có lỗi xảy ra. Vui lòng thử lại!', statusCode.ERROR);
        }
    }

    async accessByCode(req, res, params) {
        try {
            const { code } = params;
            if (!code)
                return response(res, null, 'Request không hợp lệ!', statusCode.ERROR);
            const classroomCode = await ClassroomCodeModel.findOne({ code: code });
            if (!classroomCode)
                return response(res, {}, 'Mã không hợp lệ!', statusCode.ERROR);
            const user = await UserModel.findOne({ _id: req.user.user_id });
            if (!user)
                return response(res, {}, 'Học sinh này không tồn tại!');

            if (!user.code)
                return response(res, null, 'Học sinh này chưa có mã. Vui lòng cập nhật mã học sinh trước!', statusCode.ERROR);

            const docClassrooms = await ClassroomModel.findOne({ _id: classroomCode.classroom.id });
            let rs = { nModified: 1 };
            if (!classroomCode.is_shared) {
                const usedByCurrentUser = classroomCode.user && classroomCode.user.id === user.id;
                if (classroomCode.is_used && !usedByCurrentUser)
                    return response(res, {}, 'Mã này đã được sử dụng bởi học sinh có mã: ' + classroomCode.user.code, statusCode.ERROR);
                if (!classroomCode.is_used) {
                    const docUpdate = {
                        user: { id: user.id, code: user.code, name: user.fullname },
                        is_used: true
                    };
                    rs = await ClassroomCodeModel.updateOne({ _id: classroomCode.id }, { $set: docUpdate });
                }
            }


            if (rs.nModified) {
                await StudentClassroomModel.updateOne(
                    {
                        'user.id': user.id,
                        'classroom.id': classroomCode.classroom.id
                    },
                    {
                        $set: {
                            user: { id: user.id, code: user.code, name: user.fullname },
                            classroom: classroomCode.classroom,
                            joined_at: new Date(),
                            deleted_at: null
                        }
                    },
                    { upsert: true }
                );
                const data = { classroom_id: classroomCode.classroom.id };

                // Xử lý khóa học tặng kèm
                if (docClassrooms && docClassrooms.classroom_attached) {
                    const listClassRoomAttr = docClassrooms.classroom_attached;
                    if (listClassRoomAttr && listClassRoomAttr.length > 0) {
                        // Tìm các khóa học tặng kèm tồn tại
                        const docClassroomAttr = await ClassroomModel.find({
                            _id: { $in: listClassRoomAttr }
                        }, { name: 1, code: 1 });

                        if (docClassroomAttr && docClassroomAttr.length > 0) {
                            // Chuyển đổi array ID để so sánh chính xác
                            const classroomAttachedIds = docClassroomAttr.map(item => item._id.toString());

                            // Kiểm tra user đã tham gia khóa học tặng kèm nào chưa
                            const existingUserClassrooms = await StudentClassroomModel.find({
                                'user.id': user.id,
                                'classroom.id': { $in: classroomAttachedIds },
                                deleted_at: null
                            });

                            const existingClassroomIds = existingUserClassrooms.map(item => item.classroom.id);

                            for (let i = 0; i < docClassroomAttr.length; i++) {
                                const classroomId = docClassroomAttr[i]._id.toString();

                                // Chỉ thêm vào khóa học tặng kèm nếu user chưa tham gia
                                if (!existingClassroomIds.includes(classroomId)) {
                                    const docStudentClassroomAtt = {
                                        user: { id: user.id, code: user.code, name: user.fullname },
                                        classroom: {
                                            id: classroomId,
                                            name: docClassroomAttr[i].name,
                                            code: docClassroomAttr[i].code
                                        },
                                        joined_at: new Date()
                                    };
                                    await StudentClassroomModel.create(docStudentClassroomAtt);
                                }
                            }
                        }
                    }
                }
                return response(res, data, 'Thành công', statusCode.OK);
            }

            return response(res, {}, language.ERROR, statusCode.ERROR);
        } catch (err) {
            logError(err);
            return response(res, {}, 'Có lỗi xảy ra. Vui lòng thử lại!', statusCode.ERROR);
        }
    }

    async delete(req, res, params) {
        try {
            const { ids } = params || [];
            if (ids.length == 0)
                return response(res, null, 'Request không hợp lệ!', statusCode.ERROR);

            const rs = await ClassroomModel.softDelete({ _id: { $in: ids } }, true);
            if (rs)
                return response(res, {}, 'Thành công', statusCode.OK);
            return response(res, null, language.ERROR, statusCode.ERROR);
        } catch (err) {
            logError(err);
            return response(res, null, 'Có lỗi xảy ra. Vui lòng thử lại!', statusCode.ERROR);
        }
    }

    async generateAccessCode(req, res, params) {
        try {
            const totalCode = parseInt(params.total_code || 0);
            const classroomID = params.classroom_id || null;
            const isShared = params.is_shared === true || params.is_shared === 'true' || params.is_shared === 1 || params.is_shared === '1';
            if ((!totalCode && !isShared) || !classroomID)
                return response(res, null, 'Request không hợp lệ!', statusCode.ERROR);

            const classroom = await ClassroomModel.findOne({ _id: classroomID });
            if (!classroom)
                return response(res, {}, 'Lớp này không tồn tại!', statusCode.ERROR);
            if (isShared) {
                const existedSharedCode = await ClassroomCodeModel.findOne({
                    'classroom.id': classroomID,
                    is_shared: true
                });
                if (existedSharedCode)
                    return response(res, null, 'Lớp này đã có mã truy cập dùng chung!', statusCode.ERROR);

                const newCode = await randomize('A0', 6);
                const code = await ClassroomCodeModel.findOne({ code: newCode });
                if (code)
                    return response(res, null, 'Có lỗi xảy ra. Vui lòng thử lại!', statusCode.ERROR);

                const docCode = {
                    user: null,
                    classroom: { id: classroom.id, name: classroom.name, code: classroom.code },
                    code: newCode,
                    is_used: false,
                    is_shared: true
                };
                const createdCode = await ClassroomCodeModel.create(docCode);
                if (createdCode)
                    return response(res, { total_code: 1 }, 'Thành công', statusCode.OK);
                return response(res, null, language.ERROR, statusCode.ERROR);
            }
            let i = 0;
            let d = 0;
            while (i < totalCode) {
                i++;
                const newCode = await randomize('A0', 6);
                const code = await ClassroomCodeModel.findOne({ code: newCode });
                if (!code) {
                    const docCode = {
                        user: null,
                        classroom: { id: classroom.id, name: classroom.name, code: classroom.code },
                        code: newCode,
                        is_used: false,
                        is_shared: false
                    };
                    const _code = await ClassroomCodeModel.create(docCode);
                    if (_code) {
                        d++;
                    }
                }
            }

            if (d > 0)
                return response(res, { total_code: d }, 'Thành công', statusCode.OK);
            return response(res, null, language.ERROR, statusCode.ERROR);
        } catch (err) {
            logError(err);
            return response(res, {}, 'Có lỗi xảy ra. Vui lòng thử lại!', statusCode.ERROR);
        }
    }

    async codes(req, res, params) {
        try {
            const keyword = params.keyword || false;
            const classroomID = params.classroom_id || null;
            const isUsed = params.is_used || null;
            const page = parseInt(params.page || appConfig.PAGINATION.PAGE);
            let limit = parseInt(params.limit || appConfig.PAGINATION.LIMIT);
            if (limit < 0)
                limit = 100000;
            const conditions = {};
            if (req.user.user_group === appConfig.USER_GROUP.STUDENT) {
                return response(res, data, 'Bạn không có quyền truy cập!', statusCode.FORBIDDEN);
            }

            const options = {
                skip: (page - 1) * limit,
                limit: limit,
                sort: { updated_at: -1 }
            };

            if (keyword) {
                conditions.code = { $regex: keyword, $options: 'i' };
            }

            if (classroomID)
                conditions['classroom.id'] = classroomID;

            if (isUsed !== null)
                conditions['is_used'] = isUsed;

            const rs = await ClassroomCodeModel.find(conditions, null, options);
            const total = await ClassroomCodeModel.count(conditions);
            const data = {
                total: total,
                limit: limit,
                items: rs
            };
            return response(res, data, 'Thành công', statusCode.OK);
        } catch (err) {
            logError(err);
            return response(res, null, 'Có lỗi xảy ra. Vui lòng thử lại!', statusCode.ERROR);
        }
    }

    async deleteCode(req, res, params) {
        try {
            const ids = params.ids || [];
            let conditions = {};
            if (req.user.user_group === appConfig.USER_GROUP.STUDENT) {
                return response(res, null, 'Bạn không có quyền truy cập!', statusCode.FORBIDDEN);
            }
            let deletedIds = 0;;
            for (let i = 0; i < ids.length; i++) {
                const classroomCode = await ClassroomCodeModel.findOne({ _id: ids[i] });
                if (!classroomCode)
                    continue;
                const rs = await ClassroomCodeModel.delete({ _id: ids[i] });
                if (!rs)
                    continue;
                deletedIds += 1;
                if (classroomCode.user) {
                    const userID = classroomCode.user.id || null;
                    const classroomID = classroomCode.classroom.id || null;
                    if (userID && classroomID) {
                        conditions = {};
                        conditions['classroom.id'] = classroomID;
                        conditions['user.id'] = userID;
                        conditions.deleted_at = null;
                        const studentClassroom = await StudentClassroomModel.findOne(conditions);
                        if (studentClassroom) {
                            const rs = await StudentClassroomModel.softDelete({ _id: studentClassroom.id });
                            if (rs) {
                                // Remove Tag tren OneSignal
                                const user = await UserModel.findOne({ _id: userID });
                                const userTagDevice = user.device_tags ? JSON.parse(user.device_tags) : { user_code: user.code };
                                userTagDevice[classroomID] = "";
                                AppService.editTagDeviceWithID(userID, userTagDevice);
                                logError(req.user.user_id + ' đã xóa học sinh: ' + studentClassroom.user.code);
                            }
                        }
                    }
                }
            }

            if (deletedIds > 0)
                return response(res, {}, 'Thành công', statusCode.OK);

            return response(res, {}, language.ERROR, statusCode.ERROR);
        } catch (err) {
            logError(err);
            return response(res, null, 'Có lỗi xảy ra. Vui lòng thử lại!', statusCode.ERROR);
        }
    }

    async exportCode(req, res, params) {
        try {
            const keyword = params.keyword || false;
            const classroomID = params.classroom_id || null;
            const page = parseInt(params.page || appConfig.PAGINATION.PAGE);
            const limit = 10000000;

            const conditions = {};
            if (req.user.user_group === appConfig.USER_GROUP.STUDENT) {
                return response(res, data, 'Bạn không có quyền truy cập!', statusCode.FORBIDDEN);
            }

            const options = {
                skip: (page - 1) * limit,
                limit: limit,
                sort: { updated_at: -1 }
            };

            if (keyword) {
                conditions.code = { $regex: keyword, $options: 'i' };
            }

            if (classroomID)
                conditions['classroom.id'] = classroomID;

            const classroom = await ClassroomModel.findOne({ _id: classroomID });
            const rs = await ClassroomCodeModel.find(conditions, null, options);
            const fileName = await ClassroomService.exportClassroomCode(classroom, rs);
            const streamFile = fs.readFileSync('./temp/excel/' + fileName);
            download(res, streamFile, fileName, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        } catch (err) {
            logError(err);
            console.log(err);
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

    async addMember(req, res, params) {
        try {
            const classroomID = params.classroom_id || null;
            const studentID = params.student_id || null;
            let conditions = {};
            if (req.user.user_group === appConfig.USER_GROUP.STUDENT) {
                return response(res, null, 'Bạn không có quyền truy cập!', statusCode.FORBIDDEN);
            }

            const user = await UserModel.findOne({ _id: studentID });
            if (!user)
                return response(res, null, 'Học sinh này không tồn tại!', statusCode.ERROR);

            if (user.deleted_at)
                return response(res, null, 'Học sinh này đã bị block!', statusCode.ERROR);

            if (!user.code)
                return response(res, null, 'Học sinh này chưa có mã. Vui lòng cập nhật mã học sinh trước!', statusCode.ERROR);

            const classroom = await ClassroomModel.findOne({ _id: classroomID });
            if (!classroom)
                return response(res, null, 'Lớp này không tồn tại!', statusCode.ERROR);

            conditions = {};
            conditions['classroom.id'] = classroomID;
            conditions['user.id'] = studentID;
            const studentClassroom = await StudentClassroomModel.findOne(conditions);
            if (studentClassroom) {
                if (studentClassroom.deleted_at) {
                    await StudentClassroomModel.updateOne({ _id: studentClassroom.id }, { $set: { deleted_at: null } });
                    const userTagDevice = user.device_tags ? JSON.parse(user.device_tags) : { user_code: user.code };
                    AppService.editTagDeviceWithID(studentID, userTagDevice);
                    return response(res, studentClassroom, 'Đã thêm thành công học sinh vào lớp học!', statusCode.OK);
                }
                return response(res, null, 'Học sinh này đã tồn tại trong lớp!', statusCode.ERROR);
            }

            const docUser = {
                classroom: { id: classroomID, name: classroom.name, code: classroom.code },
                user: { id: user.id, name: user.fullname, code: user.code },
                joined_at: new Date()
            };
            const rs = await StudentClassroomModel.create(docUser);
            if (rs) {
                const userTagDevice = user.device_tags ? JSON.parse(user.device_tags) : { user_code: user.code };
                AppService.editTagDeviceWithID(studentID, userTagDevice);
                //Update num_student
                ClassroomModel.updateOne({ _id: classroomID }, { $inc: { num_student: +1 } });
                return response(res, rs, 'Đã thêm thành công học sinh vào lớp học!', statusCode.OK);
            }

            return response(res, {}, language.ERROR, statusCode.ERROR);
        } catch (err) {
            logError(err);
            return response(res, null, 'Có lỗi xảy ra. Vui lòng thử lại!', statusCode.ERROR);
        }
    }

    async removeMember(req, res, params) {
        try {
            const classroomID = params.classroom_id || null;
            const studentID = params.student_id || null;
            let conditions = {};
            if (req.user.user_group === appConfig.USER_GROUP.STUDENT) {
                return response(res, null, 'Bạn không có quyền truy cập!', statusCode.FORBIDDEN);
            }

            if (studentID === '625c3c11354c5431ba7e77d1')
                return response(res, null, 'Tài khoản Demo Review App (ios, Android) - Không được xoá - Không được đổi mật khẩu.', statusCode.FORBIDDEN);

            const user = await UserModel.findOne({ _id: studentID });
            if (!user || user.deleted_at)
                return response(res, null, 'Học sinh này không tồn tại!', statusCode.ERROR);

            const classroom = await ClassroomModel.findOne({ _id: classroomID });
            if (!classroom)
                return response(res, null, 'Lớp này không tồn tại!', statusCode.ERROR);

            conditions = {};
            conditions['classroom.id'] = classroomID;
            conditions['user.id'] = studentID;
            conditions.deleted_at = null;
            const studentClassroom = await StudentClassroomModel.findOne(conditions);
            if (studentClassroom) {
                const rs = await StudentClassroomModel.softDelete({ _id: studentClassroom.id });
                if (rs) {
                    ClassroomModel.updateOne({ _id: classroomID }, { $inc: { num_student: -1 } });
                    // Remove Tag tren OneSignal
                    const userTagDevice = user.device_tags ? JSON.parse(user.device_tags) : { user_code: user.code };
                    userTagDevice[classroomID] = "";
                    AppService.editTagDeviceWithID(studentID, userTagDevice);
                    logError(req.user.user_id + ' đã xóa học sinh: ' + studentClassroom.user.code);
                    return response(res, rs, 'Đã xóa thành công học sinh khỏi lớp học!', statusCode.OK);
                }
            }

            return response(res, {}, language.ERROR, statusCode.ERROR);
        } catch (err) {
            logError(err);
            return response(res, null, 'Có lỗi xảy ra. Vui lòng thử lại!', statusCode.ERROR);
        }
    }

    async updateBuoihoc(req, res, params) {
        try {
            const classroomID = params.classroom_id || null;
            const studentID = params.student_id || null;
            const sobuoihoc = params.sobuoihoc || null;
            const buoidahoc = params.buoidahoc || 0;
            let conditions = {};
            if (req.user.user_group === appConfig.USER_GROUP.STUDENT) {
                return response(res, null, 'Bạn không có quyền truy cập!', statusCode.FORBIDDEN);
            }

            const classroom = await ClassroomModel.findOne({ _id: classroomID });
            if (!classroom)
                return response(res, null, 'Lớp này không tồn tại!', statusCode.ERROR);

            conditions = {};
            conditions['classroom.id'] = classroomID;
            conditions['user.id'] = studentID;
            conditions.deleted_at = null;
            const studentClassroom = await StudentClassroomModel.findOne(conditions);
            if (studentClassroom) {
                const doc = {};
                doc.sobuoihoc = parseInt(sobuoihoc);
                doc.buoidahoc = parseInt(buoidahoc);
                const rs = await StudentClassroomModel.updateOne({ _id: studentClassroom.id }, { $set: doc });
                if (rs.nModified)
                    return response(res, {}, 'Đã cập nhật buổi học thành công!', statusCode.OK);
            }

            return response(res, {}, language.ERROR, statusCode.ERROR);
        } catch (err) {
            logError(err);
            return response(res, null, 'Có lỗi xảy ra. Vui lòng thử lại!', statusCode.ERROR);
        }
    }

    async checkClassroomAttend(req, res, params) {
        try {
            const subjectID = params.subject_id || null;
            const classroomIds = params.classroom_ids || [];
            let fromDate = params.from_date || null;
            let toDate = params.to_date || null;
            const isExport = params.is_export || false;

            if (!subjectID || !fromDate || !toDate)
                return response(res, null, 'Yêu cầu không hợp lệ. Vui lòng chọn lớp và ngày!', statusCode.ERROR);

            if (req.user.user_group === appConfig.USER_GROUP.STUDENT) {
                return response(res, null, 'Bạn không có quyền truy cập!', statusCode.FORBIDDEN);
            }

            let conditions = {};

            let fromAttendedDate = fromDate + ' 00:00:00';
            fromAttendedDate = new Date(fromAttendedDate);

            let toAttendedDate = toDate + ' 23:59:59';
            toAttendedDate = new Date(toAttendedDate);

            conditions.attended_date = {
                $gte: fromAttendedDate,
                $lte: toAttendedDate
            };

            const clsConditions = { 'subject.id': subjectID, deleted_at: null };

            if (classroomIds.length > 0)
                clsConditions._id = {
                    $in: classroomIds
                }
            const classrooms = await ClassroomModel.find(clsConditions);
            const dataClassroomAttend = [];

            for (let i = 0; i < classrooms.length; i++) {
                const classroom = classrooms[i].toObject();
                const classroomID = classroom._id;
                conditions['classroom.id'] = classroomID;
                const hsdihoc = await AttendanceModel.count(conditions);
                const sisohs = await StudentClassroomModel.count({ 'classroom.id': classroomID, deleted_at: null });
                const hsnghihoc = sisohs - hsdihoc;
                classroom.hs_dihoc = hsdihoc;
                classroom.hs_nghihoc = hsnghihoc;
                classroom.siso = sisohs;
                dataClassroomAttend.push(classroom);
            }

            const data = {
                dataClassroomAttend
            }

            if (isExport) {
                const fileName = await ClassroomService.exportClassroomAttendDetail(dataClassroomAttend);
                const streamFile = fs.readFileSync('./temp/excel/' + fileName);
                download(res, streamFile, fileName, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            }

            return response(res, data, 'Thành công', statusCode.OK);
        } catch (err) {
            logError(err);
            return response(res, null, 'Có lỗi xảy ra. Vui lòng thử lại!', statusCode.ERROR);
        }
    }

    async checkAttend(req, res, params) {
        try {
            const classroomID = params.classroom_id || null;
            let fromDate = params.from_date || null;
            let toDate = params.to_date || null;
            const isExport = params.is_export || false;
            const currentDate = new Date();
            if (!classroomID || !fromDate || !toDate)
                return response(res, null, 'Yêu cầu không hợp lệ. Vui lòng chọn lớp và ngày!', statusCode.ERROR);

            if (req.user.user_group === appConfig.USER_GROUP.STUDENT) {
                return response(res, null, 'Bạn không có quyền truy cập!', statusCode.FORBIDDEN);
            }

            const classroom = await ClassroomModel.findOne({ _id: classroomID });
            if (!classroom)
                return response(res, null, 'Lớp này không tồn tại!', statusCode.ERROR);
            let conditions = {};
            conditions['classroom.id'] = classroomID;
            let fromAttendedDate = fromDate + ' 00:00:00';
            fromAttendedDate = new Date(fromAttendedDate);

            let toAttendedDate = toDate + ' 23:59:59';
            toAttendedDate = new Date(toAttendedDate);

            conditions.attended_date = {
                $gte: fromAttendedDate,
                $lte: toAttendedDate
            };
            const attendedUsers = await AttendanceModel.find(conditions);
            const arrUserID = [];
            const attendedUserID = [];
            for (let i = 0; i < attendedUsers.length; i++) {
                if (arrUserID.indexOf(attendedUsers[i].user.id) < 0) {
                    arrUserID.push(attendedUsers[i].user.id);
                    attendedUserID.push(attendedUsers[i].user.id);
                }
            }

            const newUserIds = [];
            const currentYear = currentDate.getFullYear();
            const currentMonth = currentDate.getMonth();
            const currentDay = currentDate.getDate();

            const classroomUsers = await StudentClassroomModel.find({ 'classroom.id': classroomID, deleted_at: null });
            for (let i = 0; i < classroomUsers.length; i++) {
                const sDate = new Date(classroomUsers[i].created_at);
                const sYear = sDate.getFullYear();
                const sMonth = sDate.getMonth();
                const sDay = sDate.getDate();

                if (arrUserID.indexOf(classroomUsers[i].user.id) < 0)
                    arrUserID.push(classroomUsers[i].user.id);

                if (sYear === currentYear && sMonth === currentMonth && sDay === currentDay)
                    newUserIds.push(classroomUsers[i].user.id);
            }
            conditions = {
                _id: {
                    $in: arrUserID
                }
            };

            const users = await UserModel.find(conditions);
            const data = {
                attendedUsers,
                classroomUsers,
                newUserIds,
                users,
                attendedUserID
            }

            if (isExport) {
                const fileName = await ClassroomService.exportClassroomAttendDetail(data, classroom);
                const streamFile = fs.readFileSync('./temp/excel/' + fileName);
                download(res, streamFile, fileName, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            }

            return response(res, data, 'Thành công', statusCode.OK);
        } catch (err) {
            logError(err);
            return response(res, null, 'Có lỗi xảy ra. Vui lòng thử lại!', statusCode.ERROR);
        }
    }

    async diffBuoiDaHoc(req, res, params) {
        try {
            const classroomID = params.classroom_id || null;
            const arrayUserID = params.user_ids || [];
            const sobuoihoc = params.sobuoihoc || -1;
            if (!classroomID || arrayUserID.length == 0 || sobuoihoc === -1)
                return response(res, null, 'Request không hợp lệ!', statusCode.ERROR);

            let _rs = 0;
            const users = await StudentClassroomModel.find({ 'classroom.id': classroomID, 'user.id': { $in: arrayUserID } });
            for (let i = 0; i < users.length; i++) {
                const conditions = {};
                conditions['classroom.id'] = classroomID;
                conditions['user.id'] = users[i].user.id;
                conditions.deleted_at = null;
                let _bdh = users[i].buoidahoc;
                if (users[i].buoidahoc && users[i].buoidahoc > 0) {
                    _bdh += parseInt(sobuoihoc);
                } else {
                    _bdh = parseInt(sobuoihoc);
                }

                const rs = await StudentClassroomModel.updateOne(conditions, { buoidahoc: _bdh });

                if (rs.nModified)
                    _rs++;
            }

            if (_rs > 0)
                return response(res, {}, 'Đã cập nhật buổi học thành công!', statusCode.OK);

            return response(res, null, 'Lỗi. Kiểm tra lại trước khi thao tác trừ buổi học tiếp!', statusCode.ERROR);
        } catch (err) {
            logError(err);
            return response(res, null, 'Có lỗi xảy ra. Vui lòng thử lại!', statusCode.ERROR);
        }
    }
    async UpdateGroupChapter(req, res, params) {
        try {
            const group_chapter = params.group_chapter || null;
            const classroomID = params.classroom_id || null;
            if (req.user.user_group === appConfig.USER_GROUP.STUDENT) {
                return response(res, null, 'Bạn không có quyền truy cập!', statusCode.FORBIDDEN);
            }
            const classroom = await ClassroomModel.findOne({ _id: classroomID });
            if (!classroom)
                return response(res, null, 'Lớp này không tồn tại!', statusCode.ERROR);
            const rs = await ClassroomModel.updateOne({ _id: classroomID }, { $set: { group_chapter: group_chapter } });
            if (rs.nModified)
                return response(res, {}, 'Đã cập nhật nhóm chương thành công!', statusCode.OK);
            return response(res, {}, language.ERROR, statusCode.ERROR);
        } catch (err) {
            logError(err);
            console.log(err);
            return response(res, null, 'Có lỗi xảy ra. Vui lòng thử lại!', statusCode.ERROR);
        }
    }
    async addChapter(req, res, params) {
        try {
            const chapterID = params.chapter_id || null;
            const classroomID = params.classroom_id || null;
            const group_id = params.group_id || null;
            let conditions = {};
            if (req.user.user_group === appConfig.USER_GROUP.STUDENT) {
                return response(res, null, 'Bạn không có quyền truy cập!', statusCode.FORBIDDEN);
            }

            const chapter = await ChapterModel.findOne({ _id: chapterID, deleted_at: null });
            if (!chapter)
                return response(res, null, 'Chương này không tồn tại!', statusCode.ERROR);


            const classroom = await ClassroomModel.findOne({ _id: classroomID });
            if (!classroom)
                return response(res, null, 'Lớp này không tồn tại!', statusCode.ERROR);

            conditions = {};
            conditions['chapter.id'] = chapterID;
            conditions['classroom_id'] = classroomID;
            const chapterClassroom = await ChapterClassroomModel.findOne(conditions);
            if (chapterClassroom) {
                return response(res, null, 'Chương này đã tồn tại trong lớp!', statusCode.ERROR);
            }

            const docChapter = {
                classroom_id: classroomID,
                chapter: { id: chapter.id, name: chapter.name },
                group_id: group_id,
                ordering: 1
            };
            const rs = await ChapterClassroomModel.create(docChapter);
            if (rs) {
                ClassroomService.updateClassroomExam(chapterID, classroom);
                const classroomIds = chapter.classroom_ids || [];
                if (classroomIds.indexOf(classroomID) <= 0) {
                    classroomIds.push(classroomID);
                    ChapterModel.updateOne({ _id: chapter.id }, { $set: { classroom_ids: classroomIds } });
                }

                return response(res, rs, 'Đã thêm thành công chương vào lớp học!', statusCode.OK);
            }

            return response(res, {}, language.ERROR, statusCode.ERROR);
        } catch (err) {
            logError(err);
            return response(res, null, 'Có lỗi xảy ra. Vui lòng thử lại!', statusCode.ERROR);
        }
    }
    async updateChapter(req, res, params) {
        try {
            const chapterID = params.chapter_id || null;
            const classroomID = params.classroom_id || null;
            const group_id = params.group_id || null;
            let conditions = {};
            if (req.user.user_group === appConfig.USER_GROUP.STUDENT) {
                return response(res, null, 'Bạn không có quyền truy cập!', statusCode.FORBIDDEN);
            }

            const chapter = await ChapterModel.findOne({ _id: chapterID, deleted_at: null });
            if (!chapter)
                return response(res, null, 'Chương này không tồn tại!', statusCode.ERROR);


            const classroom = await ClassroomModel.findOne({ _id: classroomID });
            if (!classroom)
                return response(res, null, 'Lớp này không tồn tại!', statusCode.ERROR);

            conditions = {};
            conditions['chapter.id'] = chapterID;
            conditions['classroom_id'] = classroomID;
            const chapterClassroom = await ChapterClassroomModel.findOne(conditions);

            if (chapterClassroom) {
                const rs = await ChapterClassroomModel.updateOne({ _id: chapterClassroom.id }, { $set: { group_id: group_id } });
                if (rs.nModified) {
                    return response(res, {}, 'Đã cập nhật thành công chương trong lớp học!', statusCode.OK);
                }
                return response(res, {}, language.ERROR, statusCode.ERROR);
            }

            const docChapter = {
                classroom_id: classroomID,
                chapter: { id: chapter.id, name: chapter.name },
                group_id: group_id,
                ordering: 1
            };
            const rs = await ChapterClassroomModel.create(docChapter);
            if (rs) {
                ClassroomService.updateClassroomExam(chapterID, classroom);
                const classroomIds = chapter.classroom_ids || [];
                if (classroomIds.indexOf(classroomID) <= 0) {
                    classroomIds.push(classroomID);
                    ChapterModel.updateOne({ _id: chapter.id }, { $set: { classroom_ids: classroomIds } });
                }

                return response(res, rs, 'Đã thêm thành công chương vào lớp học!', statusCode.OK);
            }

            return response(res, {}, language.ERROR, statusCode.ERROR);
        } catch (err) {
            logError(err);
            return response(res, null, 'Có lỗi xảy ra. Vui lòng thử lại!', statusCode.ERROR);
        }
    }

    async removeChapter(req, res, params) {
        try {
            const chapterID = params.chapter_id || null;
            const classroomID = params.classroom_id || null;
            let conditions = {};
            if (req.user.user_group === appConfig.USER_GROUP.STUDENT) {
                return response(res, null, 'Bạn không có quyền truy cập!', statusCode.FORBIDDEN);
            }

            const chapter = await ChapterModel.findOne({ _id: chapterID });
            if (!chapter)
                return response(res, null, 'Chương này không tồn tại!', statusCode.ERROR);


            const classroom = await ClassroomModel.findOne({ _id: classroomID });
            if (!classroom)
                return response(res, null, 'Lớp này không tồn tại!', statusCode.ERROR);

            conditions = {};
            conditions['chapter.id'] = chapterID;
            conditions['classroom_id'] = classroomID;
            const chapterClassroom = await ChapterClassroomModel.delete(conditions);
            if (chapterClassroom) {
                try {
                    ClassroomService.updateClassroomExam(chapterID, classroom, "REMOVE");
                    const classroomIds = chapter.classroom_ids && chapter.classroom_ids.length > 0 ? chapter.classroom_ids : [];
                    const _index = classroomIds.indexOf(classroomID);
                    if (_index >= 0) {
                        classroomIds.splice(_index, 1);
                        ChapterModel.updateOne({ _id: chapter.id }, { $set: { classroom_ids: classroomIds } });
                    }

                    conditions = {};
                    conditions['chapter_id'] = chapterID;
                    conditions['classroom_id'] = classroomID;
                    await CategoryClassroomModel.delete(conditions, true);
                    return response(res, null, '', statusCode.OK);
                } catch (err) {
                    logError(err);
                }
            }

            return response(res, {}, language.ERROR, statusCode.ERROR);
        } catch (err) {
            logError(err);
            return response(res, null, 'Có lỗi xảy ra. Vui lòng thử lại!', statusCode.ERROR);
        }
    }
    async addCategory(req, res, params) {
        try {
            const chapterID = params.chapter_id || null;
            const classroomID = params.classroom_id || null;
            const categoryID = params.category_id || null;
            let conditions = {};
            if (req.user.user_group === appConfig.USER_GROUP.STUDENT) {
                return response(res, null, 'Bạn không có quyền truy cập!', statusCode.FORBIDDEN);
            }

            const category = await CategoryModel.findOne({ _id: categoryID, deleted_at: null });
            if (!category)
                return response(res, null, 'Bài giảng này không tồn tại!', statusCode.ERROR);

            const chapter = await ChapterModel.findOne({ _id: chapterID, deleted_at: null });
            if (!chapter)
                return response(res, null, 'Chương này không tồn tại!', statusCode.ERROR);


            const classroom = await ClassroomModel.findOne({ _id: classroomID });
            if (!classroom)
                return response(res, null, 'Lớp này không tồn tại!', statusCode.ERROR);

            conditions = {};
            conditions['chapter_id'] = chapterID;
            conditions['classroom_id'] = classroomID;
            conditions['category.id'] = categoryID;
            const categoryClassroom = await CategoryClassroomModel.findOne(conditions);
            if (categoryClassroom) {
                return response(res, null, 'Bài giảng này đã tồn tại trong lớp!', statusCode.ERROR);
            }

            const docChapter = {
                classroom_id: classroomID,
                chapter_id: chapterID,
                category: { id: category.id, name: category.name },
                ordering: 1
            };
            const rs = await CategoryClassroomModel.create(docChapter);
            if (rs) {
                return response(res, rs, 'Đã thêm thành công bài giảng vào lớp học!', statusCode.OK);
            }

            return response(res, {}, language.ERROR, statusCode.ERROR);
        } catch (err) {
            logError(err);
            return response(res, null, 'Có lỗi xảy ra. Vui lòng thử lại!', statusCode.ERROR);
        }
    }

    async removeCategory(req, res, params) {
        try {
            const id = params.id || null;
            if (req.user.user_group === appConfig.USER_GROUP.STUDENT) {
                return response(res, null, 'Bạn không có quyền truy cập!', statusCode.FORBIDDEN);
            }

            const rs = await CategoryClassroomModel.delete({ _id: id });
            if (rs) {
                return response(res, rs, 'Thành công!', statusCode.OK);
            }

            return response(res, {}, language.ERROR, statusCode.ERROR);
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
            const classroomChapters = await ChapterClassroomModel.find({ classroom_id: classroomID }, null, options);
            const chapterIds = [];
            const chapterSubjectMapping = {};
            const chapterGroupMapping = {};
            const uniqueSubjectIds = [];
            const subjectToGroupMapping = {};

            for (let i = 0; i < classroomChapters.length; i++) {
                chapterIds.push(classroomChapters[i].chapter.id);
                if (classroomChapters[i].selected_subject_id) {
                    chapterSubjectMapping[classroomChapters[i].chapter.id] = classroomChapters[i].selected_subject_id;

                    if (!uniqueSubjectIds.includes(classroomChapters[i].selected_subject_id)) {
                        uniqueSubjectIds.push(classroomChapters[i].selected_subject_id);
                        subjectToGroupMapping[classroomChapters[i].selected_subject_id] = uniqueSubjectIds.length;
                    }
                }
                if (classroomChapters[i].group_id) {
                    chapterGroupMapping[classroomChapters[i].chapter.id] = classroomChapters[i].group_id;
                } else if (classroomChapters[i].group_id === undefined && classroomChapters[i].selected_subject_id) {
                    console.log('Updating group_id for chapter classroom:', classroomChapters[i]._id);
                    const groupId = subjectToGroupMapping[classroomChapters[i].selected_subject_id];
                    chapterGroupMapping[classroomChapters[i].chapter.id] = groupId;
                    ChapterClassroomModel.updateOne({ _id: classroomChapters[i]._id }, { $set: { group_id: groupId } });
                } else if (classroomChapters[i].group_id === undefined) {
                    chapterGroupMapping[classroomChapters[i].chapter.id] = 1;
                    ChapterClassroomModel.updateOne({ _id: classroomChapters[i]._id }, { $set: { group_id: 1 } });
                }
            }

            const chapters = await ChapterModel.find({ _id: { $in: chapterIds } }, null, {
                sort: { ordering: 1 }
            });

            // Thêm selected_subject_id và group vào mỗi chapter
            const chaptersWithSubject = chapters.map(chapter => {
                const chapterObj = chapter.toObject();
                if (chapterSubjectMapping[chapter._id]) {
                    chapterObj.selected_subject_id = chapterSubjectMapping[chapter._id];
                }
                if (chapterGroupMapping[chapter._id]) {
                    chapterObj.group_id = chapterGroupMapping[chapter._id];
                }
                return chapterObj;
            });

            if (classroomChapters)
                return response(res, { records: chaptersWithSubject }, 'Thành công!', statusCode.OK);

            return response(res, {}, language.ERROR, statusCode.ERROR);
        } catch (err) {
            logError(err);
            console.log(err);
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
                        let _category = JSON.parse(JSON.stringify(categories[j]));
                        delete _category.chapter;
                        delete _category.classroom_ids;
                        delete _category.content;
                        _category.classroom_id = classroomID;
                        _category.is_done_exam = false;

                        if (_category.exam) {
                            const examId = Array.isArray(_category.exam) ? _category.exam[0]?.id : _category.exam?.id;
                            const exam_db = await ExamModel.findOne({ _id: examId });
                            if (exam_db) {
                                _category.exam = {
                                    id: exam_db.id,
                                    code: exam_db.code,
                                    name: exam_db.name,
                                    type: exam_db.type
                                }
                            } else {
                                const examId = Array.isArray(_category.exam) ? _category.exam[0]?.id : _category.exam?.id;
                                const exam_word = await ExamWordModel.findOne({ _id: examId });
                                if (exam_word) {
                                    let gift = null;
                                    if (exam_word.fast_gift) {
                                             gift = await FastGiftModel.db.findOne({
                                            _id: exam_word.fast_gift.id,
                                        });
                                    }
                                    _category.exam = {
                                        id: exam_word.id,
                                        code: exam_word.code,
                                        name: exam_word.name,
                                        type: 'WORD',
                                        fast_gift:gift || null
                                    }
                                } else {
                                    _category.exam = null;
                                }
                            }

                        }

                        const examIdCheck = Array.isArray(_category.exam) ? _category.exam[0]?.id : _category.exam?.id;
                        if (examIdCheck && userExamIds.indexOf(examIdCheck) >= 0) {
                            _category.is_done_exam = true;
                        }

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

                        if (_category.livestream_btn) {
                            _category.livestream_max_size = _category.livestreams.length * 2000;
                            const livestreams = await CategoryLivestreamModel.find({ category_id: _category._id, deleted_at: null });
                            _category.livestream_current_size = 0;
                            _category.livestream_registed = false
                            for (const _livestream of livestreams) {
                                if (_livestream.users && _livestream.users.length > 0) {
                                    _category.livestream_current_size = _category.livestream_current_size + _livestream.users.length;
                                    if (_livestream.users.includes(sid)) {
                                        _category.livestream_registed = true;
                                        _category.livestream_registed_link = _livestream.room_link;
                                    }
                                }
                            }
                        }
                        categoryData.push(_category);
                    }
                }
                chapters[i].category = categoryData;
            }

            /*if (categoryIds.length == 0) {
                for (let i = 0; i < chapters.length; i++) {
                    chapters[i].category = [];
                    let categoryData = [];
                    if (chapters[i].chapter) {
                        const categories = await CategoryModel.find({ 'chapter.id': chapters[i].chapter.id }, null, options);
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
                            _category.publish_at = BaseHelper.addDay(new Date(), -1);
                            _category.category = {
                                id: _category._id,
                                name: _category.name
                            }
                            categoryData.push(_category);
                        }
                    }
                    chapters[i].category = categoryData;
                }
            } else {
                const categories = await CategoryModel.find({ _id: { $in: categoryIds } });
                for (let j = 0; j < chapters.length; j++) {
                    chapters[j].category = [];
                    for (let i = 0; i < categoryClassrooms.length; i++) {
                        const _cate = categoryClassrooms[i].toObject();
                        if (_cate.chapter_id === chapters[j].chapter.id) {
                            for (let k = 0; k < categories.length; k++) {
                                if (_cate.category.id === categories[k].id) {
                                    _cate.video_link = categories[k].video_link;
                                    _cate.doc_link = categories[k].doc_link;
                                    _cate.exam = categories[k].exam;
                                    _cate.total_video_time = categories[k].total_video_time || null;
                                    _cate.is_done_exam = false;
                                    _cate.is_done_video = false;
                                    const categoryExamId = Array.isArray(categories[k].exam) ? categories[k].exam[0]?.id : categories[k].exam?.id;
                                    if (categoryExamId)
                                        _cate.is_done_exam = userExamIds.indexOf(categoryExamId) >= 0 ? true : false;
                                    _cate.is_free = categories[k].is_free;
                                    break;
                                }
                            }
                            chapters[j].category.push(_cate);
                        }
                    }
                }
            }*/

            return response(res, chapters, 'Thành công', statusCode.OK);
        } catch (err) {
            logError(err);
            console.log(err);
            return response(res, null, 'Có lỗi xảy ra. Vui lòng thử lại!', statusCode.ERROR);
        }
    }

    async updateCategory(req, res, params) {
        try {
            const id = params.id || null;
            let publishAt = params.publish_at || null;
            if (req.user.user_group === appConfig.USER_GROUP.STUDENT) {
                return response(res, null, 'Bạn không có quyền truy cập!', statusCode.FORBIDDEN);
            }

            if (id && publishAt) {
                publishAt = new Date(publishAt);
                const rs = await CategoryClassroomModel.updateOne({ _id: id }, { $set: { publish_at: publishAt } });
                if (rs.nModified)
                    return response(res, {}, 'SUCCESS', statusCode.OK);
            }
            return response(res, {}, language.ERROR, statusCode.ERROR);
        } catch (err) {
            logError(err);
            console.log(err);
            return response(res, null, 'Có lỗi xảy ra. Vui lòng thử lại!', statusCode.ERROR);
        }
    }

    async updatePosition(req, res, params) {
        try {
            const id = params.id || null;
            const type = params.type || null;
            let ordering = params.ordering || 1;
            if (ordering === 0 || ordering > 800)
                ordering = 1;
            if (req.user.user_group === appConfig.USER_GROUP.STUDENT) {
                return response(res, null, 'Bạn không có quyền truy cập!', statusCode.FORBIDDEN);
            }

            if (id && type) {
                if (type === 'CATEGORY') {
                    await CategoryClassroomModel.updateOne({ _id: id }, { $set: { ordering: ordering } });
                }

                if (type === 'CHAPTER') {
                    await ChapterClassroomModel.updateOne({ _id: id }, { $set: { ordering: ordering } });
                }
            }
            return response(res, {}, '', statusCode.OK);
        } catch (err) {
            logError(err);
            return response(res, null, 'Có lỗi xảy ra. Vui lòng thử lại!', statusCode.ERROR);
        }
    }

    async updateLessonViewMonth(req, res, params) {
        try {
            const ids = params.ids || [];
            const classroomID = params.classroom_id || null;
            const lesson_view_dates = params.lesson_view_dates || null;
            if (req.user.user_group === appConfig.USER_GROUP.STUDENT) {
                return response(res, null, 'Bạn không có quyền truy cập!', statusCode.FORBIDDEN);
            }

            if (!classroomID || !ids || ids.length === 0 || !lesson_view_dates.length === 0)
                return response(res, null, 'Dữ liệu không hợp lệ', statusCode.ERROR);

            const rs = await StudentClassroomModel.updateMany({ "classroom.id": classroomID, "user.id": { $in: ids } }, { $set: { lesson_view_dates } });
            if (rs.nModified)
                return response(res, {}, 'Cập nhật thành công!', statusCode.OK);
            return response(res, null, 'Không cập nhật được dữ liệu', statusCode.ERROR);
        } catch (err) {
            logError(err);
            return response(res, null, 'Có lỗi xảy ra. Vui lòng thử lại!', statusCode.ERROR);
        }
    }

    async updateRelate(req, res, params) {
        try {
            const bookAttached = params.book_attached;
            const bookRelates = params.book_relates;
            const classroomRelates = params.classroom_relates;
            const classroomAttached = params.classroom_attached;
            const classroomID = params.classroom_id || null;
            if (!classroomID)
                return response(res, {}, 'Lớp không tồn tại!', statusCode.OK);

            const data = {};
            if (bookAttached)
                data.book_attached = bookAttached;

            if (bookRelates)
                data.book_relates = bookRelates;

            if (classroomRelates)
                data.classroom_relates = classroomRelates;

            if (classroomAttached)
                data.classroom_attached = classroomAttached;

            let rs = null;
            if (JSON.stringify(data) !== '{}')
                rs = await ClassroomModel.updateOne({ _id: classroomID }, { $set: data });

            if (rs.nModified)
                return response(res, {}, 'Cập nhật thành công!', statusCode.OK);
            return response(res, null, 'Không cập nhật được dữ liệu', statusCode.ERROR);
        } catch (err) {
            logError(err);
            return response(res, null, 'Có lỗi xảy ra. Vui lòng thử lại!', statusCode.ERROR);
        }
    }

    async addMemberByFile(req, res, params) {
        try {
            const { files } = req;
            const XLSX = require('xlsx');
            const workbook = XLSX.readFile(files[0].path);
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const data = XLSX.utils.sheet_to_json(worksheet);
            const classroom_id = params.classroom_id;
            const classroom = await ClassroomModel.findOne({ _id: classroom_id });

            let log = [];
            if (data.length > 0) {
                for (let i = 0; i < data.length; i++) {
                    const student_code = data[i]['Mã HS'];

                    if (!student_code) {
                        log.push({
                            student_code: student_code,
                            message: 'Học sinh này chưa có mã. Vui lòng cập nhật mã học sinh trước!'
                        });
                        continue;
                    }

                    const user = await UserModel.findOne({ code: student_code });
                    if (!user) {
                        log.push({
                            student_code: student_code,
                            message: 'Học sinh không tồn tại'
                        });
                        continue;
                    }

                    if (user.deleted_at) {
                        log.push({
                            student_code: student_code,
                            message: 'Học sinh đã bị block'
                        });
                        continue;
                    }

                    let conditions = {};
                    conditions = {};
                    conditions['classroom.id'] = classroom_id;
                    conditions['user.id'] = user._id;
                    const studentClassroom = await StudentClassroomModel.findOne(conditions);
                    if (studentClassroom) {
                        if (studentClassroom.deleted_at) {
                            await StudentClassroomModel.updateOne({ _id: studentClassroom.id }, { $set: { deleted_at: null } });
                            const userTagDevice = user.device_tags ? JSON.parse(user.device_tags) : { user_code: user.code };
                            await AppService.editTagDeviceWithID(user._id, userTagDevice);
                            log.push({
                                student_code: student_code,
                                message: 'Đã thêm thành công học sinh vào lớp học!'
                            });
                            continue;
                        }
                        log.push({
                            student_code: student_code,
                            message: 'Học sinh này đã tồn tại trong lớp!'
                        });
                        continue;
                    }

                    const docUser = {
                        classroom: { id: classroom_id, name: classroom.name, code: classroom.code },
                        user: { id: user.id, name: user.fullname, code: user.code },
                        joined_at: new Date()
                    };
                    const rs = await StudentClassroomModel.create(docUser);
                    if (rs) {
                        const userTagDevice = user.device_tags ? JSON.parse(user.device_tags) : { user_code: user.code };
                        await AppService.editTagDeviceWithID(user._id, userTagDevice);
                        //Update num_student
                        await ClassroomModel.updateOne({ _id: classroom_id }, { $inc: { num_student: +1 } });

                        log.push({
                            student_code: student_code,
                            message: 'Đã thêm thành công học sinh vào lớp học!'
                        });
                        continue;
                    }
                }
            }

            return response(res, log, language.OK, statusCode.OK);
        } catch (err) {
            console.log(err)
            return response(res, {}, 'Có lỗi xảy ra. Vui lòng thử lại!', statusCode.ERROR);
        }
    }

}

module.exports = new ClassroomController();
