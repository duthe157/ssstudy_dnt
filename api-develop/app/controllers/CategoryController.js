const appConfig = require('../../config/app');
const BaseHelper = require('../helpers/BaseHelper');
const CategoryModel = require('../models/Category');
const CategoryExamModel = require('../models/CategoryExam');
const ExamClassroomModel = require('../models/ExamClassroom')
const CategoryClassroomModel = require('../models/CategoryClassroom');
const ChapterModel = require('../models/Chapter');
const ExamModel = require('../models/Exam');
const ExamWordModel = require('../models/ExamWord');
const ClassroomModel = require('../models/Classroom');
const StudentClassroomModel = require('../models/StudentClassroom');
const TestingModel = require('../models/Testing');
const CategoryVideoModel = require('../models/CategoryVideo');
const CategoryVideoViewerModel = require('../models/CategoryVideoViewer');
const ClassroomService = require('../services/ClassroomService');
const ExamService = require('../services/ExamService');
const ChapterClassroomModel = require('../models/ChapterClassroom');
const Exam = require('../models/Exam');
const CategoryLivestreamModel = require('../models/CategoryLivestream');
const BookIdCourse = require('../models/BookIdCourse');
const ScoreHistoryModel = require("../models/ScoreHistory");
const ScoreWordHistory = require("../models/ScoreWordHistory");
const language = BaseHelper.fileToJSON(`${__dirname}/../languages/vi.json`);

class CategoryController {
    async list(req, res, params) {
        try {
            const keyword = params.keyword || false;
            const page = parseInt(params.page || appConfig.PAGINATION.PAGE);
            const limit = parseInt(params.limit || appConfig.PAGINATION.LIMIT);
            const subjectID = params.subject_id || null;
            const chapterID = params.chapter_id || null;
            const conditions = { deleted_at: null };
            const sortByOrdering = params.is_sort_ordering || false;
            const options = {
                skip: (page - 1) * limit,
                limit: limit
            };

            options.sort = {};

            /*const sortKey = params.sort_key || null;
            const sortValue = params.sort_value || null;
            if (sortKey && (sortValue == 1 || sortValue == -1)) {
                options.sort = {};
                options.sort[sortKey] = sortValue;
            }*/

            if (sortByOrdering) {
                options.sort.ordering = 1;
                options.sort.created_at = 1;
            } else {
                options.sort.updated_at = -1;
            }

            if (keyword) {
                const alias = BaseHelper.seoURL(keyword);
                conditions.alias = { $regex: alias, $options: 'i' };
            }

            if (subjectID)
                conditions['subject.id'] = subjectID;

            if (req.user.user_group === appConfig.USER_GROUP.TEACHER || req.user.user_group === appConfig.USER_GROUP.SUPPORTER) {
                conditions['subject.id'] = { $in: req.user.subject_ids };
            }

            if (chapterID)
                if (Array.isArray(chapterID)) {
                    conditions.$or = [];
                    for (let i = 0; i < chapterID.length; i++) {
                        conditions.$or.push({ 'chapter.id': chapterID });
                    }
                } else {
                    conditions['chapter.id'] = chapterID;
                }
            function groupByChapter(items) {
                if (!Array.isArray(items)) return [];

                const grouped = {};

                items.forEach(item => {
                    const chapterId = item.chapter?.id || 'unknown';

                    if (!grouped[chapterId]) {
                        grouped[chapterId] = {
                            chapter_id: chapterId,
                            name: item.chapter?.name || 'Không rõ chương',
                            // chapter: item.chapter || { id: chapterId, name: 'Không rõ chương' },
                            result: []
                        };
                    }

                    grouped[chapterId].result.push(item);
                });

                return Object.values(grouped);
            }

            const records = await CategoryModel.find(conditions, null, options);

            const group = groupByChapter(records);

            const subjects = Array.from(
                new Map(
                    records
                        .filter(item => item.subject && item.subject.id)
                        .map(item => [item.subject.id, item.subject])
                ).values()
            );
            const total = await CategoryModel.count(conditions);
            const data = {
                records,
                total,
                subjects,
                limit,
                totalRecord: total,
                perPage: limit,
                items: group
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
            let rs = await CategoryModel.findOne(conditions);
            rs = rs.toObject();
            rs.videos = CategoryVideoModel.find({ category_id: id, deleted_at: null });
            return response(res, rs, 'Thành công', statusCode.OK);
        } catch (err) {
            logError(err);
            return response(res, null, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }

    async detail(req, res, params) {
        try {
            const id = params.id;
            const classroomID = params.classroom_id || null;
            const action = params.action || 'VIEW_VIDEO';

            let conditions = { _id: id };
            let rs = await CategoryModel.findOne(conditions);
            let classroomCategory = null;
            let exam_started_at = null;
            let exam_finished_at = null;
            let is_fixed_time = false;

            if (classroomID) {
                classroomCategory = await CategoryClassroomModel.findOne({ classroom_id: classroomID, 'category.id': id });
            }

            if (rs.exam) {
                const examclassroom = await ExamClassroomModel.findOne({ exam_id: rs.exam.id, 'classroom.id': classroomID });
                if (examclassroom) {
                    exam_started_at = examclassroom.started_at;
                    exam_finished_at = examclassroom.finished_at;
                    is_fixed_time = examclassroom.is_fixed_time;
                }

            }
            if (rs?.exam?.type && rs.exam.type === 'WORD') {
                rs.exam.name = "(Word) " + rs.exam.name;
            }
            const publishAt = (classroomCategory && classroomCategory.publish_at) ? new Date(classroomCategory.publish_at) : null;

            // Chặn theo thời gian phát hành (theo lớp)
            if (req.user.user_group === appConfig.USER_GROUP.STUDENT) {
                conditions = {
                    'user.id': req.user.user_id,
                    'classroom.id': classroomID,
                    deleted_at: null
                };
                console.log('conditions: ' + JSON.stringify(conditions));
                const classroomUser = await StudentClassroomModel.findOne(conditions);
                if (!classroomUser)
                    return response(res, null, 'Bạn không phải là học sinh của Lớp học này!', statusCode.ERROR);

                if (!publishAt || publishAt && publishAt > new Date())
                    return response(res, null, 'Bài giảng này chưa được phát hành!', statusCode.ERROR);

                let flag = true;
                /*const classroom = await ClassroomModel.findOne({ _id: classroomID });
                if (classroom && !classroom.is_online) {
                    // console.log('online');
                    try {
                        if (publishAt && classroomUser && classroomUser.lesson_view_dates) {
                            if (typeof classroomUser.lesson_view_dates === 'string') {
                                const _lessonViewDates = JSON.parse(classroomUser.lesson_view_dates);
                                // console.log('_lessonViewDates: ' + JSON.stringify(_lessonViewDates));
                                for (let i = 0; i < _lessonViewDates.length; i++) {
                                    const _fromDate = new Date(_lessonViewDates[i].from);
                                    const _toDate = new Date(_lessonViewDates[i].to);
                                    // console.log('publishAt:' + publishAt + '--- _fromDate:' + _fromDate + '----_toDate:' + _toDate);
                                    if (publishAt >= _fromDate && publishAt <= _toDate) {
                                        flag = true;
                                        break;
                                    } else {
                                        flag = false;
                                    }
                                }
                            }
                        }
                        if (!flag)
                            return response(res, null, 'Bạn không có quyền truy cập bài giảng!', statusCode.ERROR);

                    } catch (err) {
                        logError(err);
                    }
                }*/
            }
            if (rs)
                rs = rs.toObject();
            if (rs.video_link)
                rs.video_link = rs.video_link.replace('/play/', '/embed/')
            rs.publish_at = publishAt;
            rs.exam_started_at = exam_started_at;
            rs.exam_finished_at = exam_finished_at;
            rs.is_fixed_time = is_fixed_time;
            rs.exam_id = rs.exam ? rs.exam.id : null;
            let numView = 0;

            if (req && req.user.user_group === appConfig.USER_GROUP.STUDENT && action === 'VIEW_VIDEO') {
                if (rs) {
                    const viewer = await CategoryVideoViewerModel.findOne({ category_video_id: id, user_id: req.user.user_id });
                    if (viewer) {
                        numView = viewer.num_view;
                        CategoryVideoViewerModel.updateOne({ category_video_id: id, user_id: req.user.user_id }, { $inc: { num_view: -1 } });
                    } else {
                        CategoryVideoViewerModel.create({ category_video_id: id, user_id: req.user.user_id, num_view: 20, type: 'DEFAULT' });
                        numView = 20;
                    }

                    if (numView <= 0) {
                        rs.video_link = null;
                        rs.doc_link = null;
                        rs.exam_doc_link_1 = null;
                        rs.exam_doc_link_2 = null;
                    }

                    numView -= 1;
                }
            }

            rs.videos = await CategoryVideoModel.find({ category_id: id, deleted_at: null });
            rs.num_view = numView;
            return response(res, rs, 'Thành công', statusCode.OK);
        } catch (err) {
            logError(err);
            console.log(err);
            return response(res, null, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }

    async viewVideo(req, res, params) {
        try {
            const videoID = params.video_id || false;
            const categoryID = params.category_id || false;
            const classroomID = params.classroom_id || null;
            if (!categoryID || !classroomID)
                return response(res, null, 'Dữ liệu gửi lên không hợp lệ!', statusCode.OK);

            const userOnClassroom = await ClassroomService.isUserInClassroom(req.user, classroomID);
            const isFreeChapterCategory = await ClassroomService.isFreeChapterClassroom(categoryID)
            if (isFreeChapterCategory === false && userOnClassroom === false) {
                return response(res, null, 'Bạn cần tham gia khoá học trước để xem bài giảng!', statusCode.ERROR);
            }

            let conditions = { deleted_at: null };
            if (videoID) {
                conditions = { _id: videoID };
            } else {
                conditions.category_id = categoryID;
            }
            let numView = 0;

            const video = await CategoryVideoModel.findOne(conditions);
            const category_db = await CategoryModel.findOne({ _id: categoryID });
            let category = JSON.parse(JSON.stringify(category_db));
            let videoBackup = null;

            if (video) {
                const viewer = await CategoryVideoViewerModel.findOne({ category_video_id: video._id, user_id: req.user.user_id });

                if (viewer) {
                    if (viewer.num_view < 0) {
                        numView = 10;
                    } else {
                        numView = viewer.num_view;
                    }
                    CategoryVideoViewerModel.updateOne({ category_video_id: video._id, user_id: req.user.user_id }, { $inc: { num_view: -1 } });
                } else {
                    CategoryVideoViewerModel.create({ category_video_id: video._id, user_id: req.user.user_id, num_view: 20 });
                    numView = 20;
                }

                if (numView > 20) {
                    // video.link = null;
                }

                if (numView > 0) {
                    numView -= 1;
                } else {
                    numView = 10;
                }
            } else if (!video && category.video_link) {
                let vType = 'YOUTUBE';
                if (category.video_link && category.video_link.indexOf('vimeo.com') >= 0)
                    vType = 'VIMEO';

                if (category.video_link && category.video_link.indexOf('mediadelivery.net') >= 0)
                    vType = 'BUNNY';

                const valias = BaseHelper.seoURL(category.name + "(Video Bài Học)");
                const _doc = {
                    name: category.name + "(Video Bài Học)",
                    alias: valias,
                    type: vType,
                    link: category.video_link,
                    duration: 0,
                    category_id: category._id,
                    ordering: 1
                };
                numView = 20;

                videoBackup = await CategoryVideoModel.create(_doc);
            }

            let vID = null;
            if (video && video.link && video.link.indexOf('youtube') >= 0) {
                const arrLink = video.link.split('?v=');
                vID = arrLink[1] ? arrLink[1] : null;
            }
            if (Array.isArray(category.exam) && category.exam.length) {
                const examIds = category.exam
                    .map(e => e?.id)
                    .filter(Boolean);

                const [exams, examWords] = await Promise.all([
                    ExamModel.db.find({ _id: { $in: examIds } }).lean(),
                    ExamWordModel.db.find({ _id: { $in: examIds } }).lean()
                ]);

                const mapExam = {};

                for (let e of exams) {
                    mapExam[e._id.toString()] = e;
                }
                for (let e of examWords) {
                    mapExam[e._id.toString()] = e;
                }

                category.exam = await Promise.all(category.exam.map(async (exam) => {
                    const found = mapExam[exam.id?.toString()];
                    const examObj = found ? found : exam;
                    let isDoneExam = false;
                    if (req.user) {
                        const testing = await TestingModel.findOne({ 'exam.id': examObj._id, 'user.id': req.user.user_id,'classroom.id': classroomID});
                        if (testing) {
                            isDoneExam = true;
                        } else {
                            const scoreHistory = await ScoreHistoryModel.findOne({ exam_id: examObj._id, user_id: req.user.user_id,classroom_id: classroomID });
                            if (scoreHistory) {
                                isDoneExam = true;
                            } else {
                                const scoreWordHistory = await ScoreWordHistory.findOne({ exam_id: examObj.id || examObj._id, user_id: req.user.user_id });
                                if (scoreWordHistory) {
                                    isDoneExam = true;
                                }
                            }
                        }
                    }
                    
                    return {
                        ...examObj,
                        is_done_exam: isDoneExam
                    };
                }));
            }

            const otherVideos = await CategoryVideoModel.find({ category_id: categoryID, deleted_at: null });

            const data = {
                category,
                video: video ? video : videoBackup,
                v_id: vID,
                num_view: numView,
                otherVideos
            };
            return response(res, data, 'Thành công', statusCode.OK);
        } catch (err) {
            logError(err);
            console.log(err)
            return response(res, null, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }

    async create(req, res, params) {
        try {
            const { name, content } = params;
            const chapterID = params.chapter_id || null;
            let videoLink = params.video_link || null;
            const docLink = params.doc_link || null;
            const examID = params.exam_id || null;
            const classroomID = params.classroom_id || null;
            const showVideoBtn = params.show_video_btn || false;
            const showExamBtn = params.show_exam_btn || false;
            const showDocBtn = params.show_doc_btn || false;
            const totalVideoTime = params.total_video_time || 0;
            const isFree = params.is_free || false;
            const freeStartedAt = params.free_started_at || null;
            const freeFinishedAt = params.free_finished_at || null;
            const videos = params.videos || [];
            const ordering = params.ordering || 1;
            const examDocLink1 = params.exam_doc_link_1 || null;
            const examDocLink2 = params.exam_doc_link_2 || null;
            let examName = params.exam_name || null;
            //setting livestream
            const livestreamBtn = params.livestream_btn || false;
            let startDateTimeLive = params.start_date_time_live || null;
            const livestreams = params.livestreams || [];

            if (!name)
                return response(res, null, language.CANNOT_EMPTY.replace('%s', language.NAME), statusCode.ERROR);

            if (!chapterID)
                return response(res, null, language.CANNOT_EMPTY.replace('%s', language.CHAPTER), statusCode.ERROR);

            let chapter = null;
            if (chapterID)
                chapter = await ChapterModel.findOne({ _id: chapterID });

            if (!chapter)
                return response(res, null, language.ITEM_NOT_EXIST.replace('%s', language.CHAPTER), statusCode.ERROR);
            let exam = [];
            if (examID && examID.length > 0) {
                const examIds = Array.isArray(examID) ? examID : [examID];

                const defaultExams = await ExamModel.find({ _id: { $in: examIds } });
                if (defaultExams.length > 0) {
                    exam = exam.concat(defaultExams.map(e => {
                        const obj = e.toObject();
                        obj.id = obj._id.toString();
                        obj.type = 'MAC_DINH';
                        return obj;
                    }));
                }

                const wordExams = await ExamWordModel.find({ _id: { $in: examIds } });
                if (wordExams.length > 0) {
                    exam = exam.concat(wordExams.map(e => {
                        const obj = e.toObject();
                        obj.id = obj._id.toString();
                        obj.type = 'WORD';
                        return obj;
                    }));
                }

                if (exam.length === 0) {
                    return response(res, null, language.ITEM_NOT_EXIST.replace('%s', language.EXAM), statusCode.ERROR);
                }
            }
            if (livestreamBtn) {
                startDateTimeLive = new Date(startDateTimeLive);
                if (!startDateTimeLive) {
                    return response(res, null, "Vui lòng nhập thời gian lớp học livestream bắt đầu!", statusCode.ERROR);
                }

                if (!livestreams || livestreams.length === 0) {
                    return response(res, null, "Vui lòng nhập link lớp học livestream!", statusCode.ERROR);
                }

                let validDate = new Date();
                validDate.setHours(validDate.getHours() - 1);
                if (startDateTimeLive <= validDate) {
                    return response(res, null, "Ngày & Giờ livestream: chỉ được nhập tương lai!", statusCode.ERROR);
                }
            }

            if (!videoLink && videos && videos.length > 0) {
                videoLink = videos[0].link;
            }

            const alias = BaseHelper.seoURL(name);
            const docCategory = {
                name,
                alias,
                content,
                subject: { id: chapter.subject.id, name: chapter.subject.name },
                chapter: { id: chapter.id, name: chapter.name },
                video_link: videoLink,
                doc_link: docLink ? docLink : "",
                exam_doc_link_1: examDocLink1,
                exam_doc_link_2: examDocLink2,
                total_video_time: totalVideoTime,
                free_started_at: freeStartedAt ? new Date(freeStartedAt) : null,
                free_finished_at: freeFinishedAt ? new Date(freeFinishedAt) : null,
                is_free: isFree,
                ordering,
                livestream_btn: livestreamBtn,
                start_date_time_live: startDateTimeLive,
                livestreams
            };

            docCategory.show_doc_btn = showDocBtn;
            docCategory.show_exam_btn = showExamBtn;
            docCategory.show_video_btn = showVideoBtn;

            if (exam && exam.length > 0)
                docCategory.exam = exam.map(e => ({ id: e.id, name: e.name, code: e.code, type: e.type }));

            const countCategoriesByChapter = await CategoryModel.count({
                'chapter.id': chapterID
            })
            if (countCategoriesByChapter === 100) {
                return response(res, null, language.MAX_CATEGORIES_CREATE.replace('%s', language.MAX_CATEGORIES_CREATE), statusCode.ERROR);
            }

            const category = await CategoryModel.create(docCategory);
            if (!category)
                return response(res, {}, language.ERROR, statusCode.ERROR);

            if (exam && exam.length > 0 && classroomID) {
                const classroom = await ClassroomModel.findOne({ _id: classroomID });
                for (let i = 0; i < exam.length; i++) {
                    const e = exam[i];
                    const docExamClassroom = {
                        type: e.type,
                        exam_id: e.id,
                        exam: {
                            id: e.id,
                            name: e.name,
                            code: e.code
                        },
                        classroom: {
                            id: classroomID,
                            name: classroom.name,
                            code: classroom.code
                        },
                        subject: classroom.subject,
                        status: 'PENDING'
                    };
                    const existingExamClassroom = await ExamClassroomModel.findOne({ exam_id: e.id, 'classroom.id': classroomID });
                    if (!existingExamClassroom) {
                        ExamClassroomModel.create(docExamClassroom);
                    }
                }
            }

            if (videos && videos.length > 0) {
                for (let i = 0; i < videos.length; i++) {
                    const _video = videos[i];
                    let vType = 'YOUTUBE'
                    if (_video.link && _video.link.indexOf('vimeo.com') >= 0)
                        vType = 'VIMEO';

                    if (_video.link && _video.link.indexOf('mediadelivery.net') >= 0)
                        vType = 'BUNNY';

                    const valias = BaseHelper.seoURL(_video.name);
                    const _doc = {
                        name: _video.name,
                        alias: valias,
                        type: vType,
                        link: _video.link,
                        duration: _video.duration || 0,
                        category_id: category._id,
                        ordering: _video.ordering || 0
                    };
                    const _currentVideo = await CategoryVideoModel.findOne({ link: _doc.link, category_id: category._id, deleted_at: null });
                    if (!_currentVideo)
                        CategoryVideoModel.create(_doc);
                    else
                        CategoryVideoModel.updateOne({ _id: _currentVideo.id }, { $set: _doc });
                }
            }

            if (livestreams && livestreams.length > 0) {
                for (let i = 0; i < livestreams.length; i++) {
                    const _livestream = livestreams[i];
                    const lalias = BaseHelper.seoURL(_livestream.name);

                    const _doc = {
                        name: _livestream.name ? _livestream.name : ('Phòng ' + _livestream.ordering),
                        alias: lalias,
                        room_link: _livestream.room_link,
                        category_id: category._id,
                        ordering: _livestream.ordering || 0,
                        users: [],
                    };
                    const _currentLivestream = await CategoryLivestreamModel.findOne({ room_link: _doc.room_link, category_id: category._id, deleted_at: null });
                    if (!_currentLivestream)
                        CategoryLivestreamModel.create(_doc);
                    else
                        CategoryLivestreamModel.updateOne({ _id: _currentLivestream.id }, { $set: _doc });
                }
            }

            return response(res, category, 'Thành công', statusCode.OK);
        } catch (err) {
            logError(err);
            return response(res, {}, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }

    async update(req, res, params) {
        try {
            const { id, name, content } = params;
            const chapterID = params.chapter_id || null;
            const showVideoBtn = params.show_video_btn || false;
            const showExamBtn = params.show_exam_btn || false;
            const showDocBtn = params.show_doc_btn || false;
            const videoLink = params.video_link || null;
            const docLink = params.doc_link || null;
            const examID = params.exam_id || null;
            const isFree = params.is_free || false;
            const totalVideoTime = params.total_video_time || 0;
            const freeStartedAt = params.free_started_at || null;
            const freeFinishedAt = params.free_finished_at || null;
            const classroomID = params.classroom_id || null;
            const videos = params.videos || [];
            const ordering = params.ordering;
            const examDocLink1 = params.exam_doc_link_1 || null;
            const examDocLink2 = params.exam_doc_link_2 || null;
            let examName = params.exam_name || null;
            let publishAt = params.publish_at || null;
            let examStartedAt = params.exam_started_at || null;
            let examFinishedAt = params.exam_finished_at || null;
            //setting livestream
            const livestreamBtn = params.livestream_btn || null;
            let startDateTimeLive = params.start_date_time_live || null;
            const livestreams = params.livestreams || [];

            if (!id)
                return response(res, null, 'Request không hợp lệ!', statusCode.ERROR);

            const category = await CategoryModel.findOne({ _id: id });
            if (!category)
                return response(res, {}, language.ITEM_NOT_EXIST.replace('%s', language.CATEGORY), statusCode.ERROR);

            if (!chapterID)
                return response(res, null, language.CANNOT_EMPTY.replace('%s', language.CHAPTER), statusCode.ERROR);

            let chapter = null;
            if (chapterID)
                chapter = await ChapterModel.findOne({ _id: chapterID });

            if (!chapter)
                return response(res, null, language.ITEM_NOT_EXIST.replace('%s', language.CHAPTER), statusCode.ERROR);
            let exam = [];
            if (examID && examID.length > 0) {
                const examIds = Array.isArray(examID) ? examID : [examID];

                let defaultExams = await ExamModel.find({ _id: { $in: examIds } });
                if (defaultExams.length > 0) {
                    exam = exam.concat(defaultExams.map(e => {
                        let obj = e.toObject();
                        obj.id = obj._id.toString();
                        obj.type = 'MAC_DINH';
                        return obj;
                    }));
                }

                let wordExams = await ExamWordModel.find({ _id: { $in: examIds } });
                if (wordExams.length > 0) {
                    exam = exam.concat(wordExams.map(e => {
                        let obj = e.toObject();
                        obj.id = obj._id.toString();
                        if (e.group == 'SACH_ID')
                            obj.type = 'SACH_ID';
                        else
                            obj.type = 'WORD';
                        return obj;
                    }));
                }

                if (exam.length === 0) {
                    return response(res, null, language.ITEM_NOT_EXIST.replace('%s', language.EXAM), statusCode.ERROR);
                }
            }
            const alias = BaseHelper.seoURL(name);
            if (name) {
                category.name = name;
                category.alias = alias;
            }

            if (chapterID) {
                category.chapter = { id: chapter.id, name: chapter.name };
                category.subject = { id: chapter.subject.id, name: chapter.subject.name };
            }

            category.doc_link = docLink;

            if (videoLink)
                category.video_link = videoLink;

            if (!videoLink && videos && videos.length > 0) {
                category.video_link = videos[0].link;
            }

            if (examDocLink1 !== null && examDocLink1 !== undefined) {
                category.exam_doc_link_1 = examDocLink1;
                // category.doc_link = examDocLink1;
            } else {
                category.exam_doc_link_1 = "";
                // category.doc_link = "";
            }

            if (examDocLink2 !== null && examDocLink2 !== undefined) {
                category.exam_doc_link_2 = examDocLink2;
            } else {
                category.exam_doc_link_2 = "";
            }

            if (content)
                category.content = content;

            if (exam && exam.length > 0) {
                category.exam = exam.map(e => ({ id: e.id, name: e.name, code: e.code, type: e.type }));
            } else if (!examID) {
                category.exam = [];
            }

            if (livestreamBtn) {
                category.livestream_btn = livestreamBtn;
            } else {
                category.livestream_btn = false;
            }

            if (livestreamBtn) {
                startDateTimeLive = new Date(startDateTimeLive);
                if (!startDateTimeLive) {
                    return response(res, null, "Vui lòng nhập thời gian lớp học livestream bắt đầu!", statusCode.ERROR);
                }

                if (!livestreams || livestreams.length === 0) {
                    return response(res, null, "Vui lòng nhập link lớp học livestream!", statusCode.ERROR);
                } else {
                    category.livestreams = livestreams
                }

                let validDate = new Date();
                validDate.setHours(validDate.getHours() - 1);
                if (startDateTimeLive <= validDate) {
                    return response(res, null, "Ngày & Giờ livestream: chỉ được nhập tương lai!", statusCode.ERROR);
                } else {
                    category.start_date_time_live = startDateTimeLive
                }
            }

            category.show_doc_btn = showDocBtn;
            category.show_exam_btn = showExamBtn;
            category.show_video_btn = showVideoBtn;
            category.is_free = isFree;
            category.total_video_time = totalVideoTime;
            category.free_started_at = freeStartedAt ? new Date(freeStartedAt) : null;
            category.free_finished_at = freeFinishedAt ? new Date(freeFinishedAt) : null;
            if (ordering)
                category.ordering = ordering;
            else
                category.ordering = category.ordering;

            const rs = await CategoryModel.updateOne({ _id: category.id }, category);

            let classroom = null;
            if (rs.nModified) {
                if (exam && exam.length > 0 && classroomID) {
                    classroom = await ClassroomModel.findOne({ _id: classroomID });
                    if (!classroom) {
                        classroom = await BookIdCourse.findOne({ _id: classroomID })
                    }
                    for (let i = 0; i < exam.length; i++) {
                        const e = exam[i];
                        const docExamClassroom = {
                            type: e.type,
                            exam_id: e.id,
                            exam: {
                                id: e.id,
                                name: e.name,
                                code: e.code
                            },
                            classroom: {
                                id: classroomID,
                                name: classroom.name,
                                code: classroom.code
                            },
                            subject: classroom.subject,
                            status: 'PENDING'
                        };
                        const existingExamClassroom = await ExamClassroomModel.findOne({ exam_id: e.id, 'classroom.id': classroomID });
                        if (!existingExamClassroom) {
                            ExamClassroomModel.create(docExamClassroom);
                        }
                    }
                }

                if (classroomID) {
                    if (publishAt)
                        publishAt = new Date(publishAt);
                    const categoryClassroom = {
                        classroom_id: classroomID,
                        category: {
                            id: id,
                            name: category.name
                        },
                        chapter_id: category.chapter ? category.chapter.id : null,
                        publish_at: publishAt,
                        ordering: ordering
                    };
                    const _categoryClassroomRs = await CategoryClassroomModel.findOne({ classroom_id: classroomID, 'category.id': id });
                    if (_categoryClassroomRs)
                        await CategoryClassroomModel.updateOne({ classroom_id: classroomID, 'category.id': id }, { $set: categoryClassroom });
                    else
                        await CategoryClassroomModel.create(categoryClassroom);

                    // Cap nhat thoi gian dong mo de thi theo lop
                    if (exam && exam.length > 0) {
                        for (let i = 0; i < exam.length; i++) {
                            ExamService.sendExam(classroom, exam[i], examStartedAt, examFinishedAt);
                        }
                    }
                }

                if (videos && videos.length > 0) {
                    const _currentVideos = await CategoryVideoModel.find({ category_id: category._id, deleted_at: null });

                    const newLinks = [];
                    for (let i = 0; i < videos.length; i++) {
                        const _video = videos[i];
                        if (!_video.link || _video.link.trim().length == 0)
                            continue;

                        let vType = 'YOUTUBE'
                        if (_video.link && _video.link.indexOf('vimeo.com') >= 0)
                            vType = 'VIMEO';

                        if (_video.link && _video.link.indexOf('mediadelivery.net') >= 0)
                            vType = 'BUNNY';

                        const valias = BaseHelper.seoURL(_video.name);
                        const _doc = {
                            name: _video.name,
                            alias: valias,
                            type: vType,
                            link: _video.link,
                            duration: _video.duration || 0,
                            category_id: category._id,
                            ordering: _video.ordering || 0
                        };
                        const _currentVideo = await CategoryVideoModel.findOne({ link: _doc.link, category_id: category._id, deleted_at: null });
                        if (!_currentVideo)
                            CategoryVideoModel.create(_doc);
                        else
                            CategoryVideoModel.updateOne({ _id: _currentVideo.id }, { $set: _doc });
                        newLinks.push(_doc.link);
                    }

                    if (_currentVideos.length > 0) {
                        for (let i = 0; i < _currentVideos.length; i++) {
                            const _link = _currentVideos[i].link.trim();
                            if (newLinks.indexOf(_link) < 0) {
                                CategoryVideoModel.softDelete({ _id: _currentVideos[i].id });
                            }
                        }
                    }
                } else {
                    CategoryVideoModel.softDelete({ category_id: category._id }, true);
                }

                if (livestreams && livestreams.length > 0) {
                    await CategoryLivestreamModel.softDelete({ category_id: category._id }, true);

                    for (let i = 0; i < livestreams.length; i++) {
                        const _livestream = livestreams[i];
                        const lalias = BaseHelper.seoURL(_livestream.name);

                        const _doc = {
                            name: _livestream.name,
                            alias: lalias,
                            room_link: _livestream.room_link,
                            category_id: category._id,
                            ordering: _livestream.ordering || 0,
                        };
                        const _currentLivestream = await CategoryLivestreamModel.findOne({ room_link: _doc.room_link, category_id: category._id });
                        if (!_currentLivestream) {
                            _doc.users = [];
                            CategoryLivestreamModel.create(_doc);
                        } else {
                            _doc.deleted_at = null;
                            CategoryLivestreamModel.updateOne({ _id: _currentLivestream.id }, { $set: _doc });
                        }
                    }
                } else {
                    CategoryLivestreamModel.softDelete({ category_id: category._id }, true);
                }

                return response(res, category, 'Thành công', statusCode.OK);
            }

            return response(res, category, language.ERROR, statusCode.ERROR);
        } catch (err) {
            logError(err);
            console.log(err);
            return response(res, {}, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }

    async updateExamWord(req, res, params) {
        try {
            const { id, name, content } = params;
            const chapterID = params.chapter_id || null;
            const showVideoBtn = params.show_video_btn || false;
            const showExamBtn = params.show_exam_btn || false;
            const showDocBtn = params.show_doc_btn || false;
            const videoLink = params.video_link || null;
            const docLink = params.doc_link || null;
            const examID = params.exam_id || null;
            const isFree = params.is_free || false;
            const totalVideoTime = params.total_video_time || 0;
            const freeStartedAt = params.free_started_at || null;
            const freeFinishedAt = params.free_finished_at || null;
            const classroomID = params.classroom_id || null;
            const videos = params.videos || [];
            const ordering = params.ordering;
            const examDocLink1 = params.exam_doc_link_1 || null;
            const examDocLink2 = params.exam_doc_link_2 || null;

            let publishAt = params.publish_at || null;
            let examStartedAt = params.exam_started_at || null;
            let examFinishedAt = params.exam_finished_at || null;

            if (!id)
                return response(res, null, 'Request không hợp lệ!', statusCode.ERROR);

            const category = await CategoryModel.findOne({ _id: id });
            if (!category)
                return response(res, {}, language.ITEM_NOT_EXIST.replace('%s', language.CATEGORY), statusCode.ERROR);

            if (!chapterID)
                return response(res, null, language.CANNOT_EMPTY.replace('%s', language.CHAPTER), statusCode.ERROR);

            let chapter = null;
            if (chapterID)
                chapter = await ChapterModel.findOne({ _id: chapterID });

            if (!chapter)
                return response(res, null, language.ITEM_NOT_EXIST.replace('%s', language.CHAPTER), statusCode.ERROR);

            let exam = null;
            if (examID) {
                exam = await ExamWordModel.findOne({ _id: examID });
                if (!exam)
                    return response(res, null, language.ITEM_NOT_EXIST.replace('%s', language.EXAM), statusCode.ERROR);
            }

            const alias = BaseHelper.seoURL(name);
            if (name) {
                category.name = name;
                category.alias = alias;
            }

            if (chapterID) {
                category.chapter = { id: chapter.id, name: chapter.name };
                category.subject = { id: chapter.subject.id, name: chapter.subject.name };
            }

            if (docLink)
                category.doc_link = docLink;

            if (videoLink)
                category.video_link = videoLink;

            if (!videoLink && videos && videos.length > 0) {
                category.video_link = videos[0].link;
            }

            if (examDocLink1) {
                category.exam_doc_link_1 = examDocLink1;
                // category.doc_link = examDocLink1;
            }

            if (examDocLink2)
                category.exam_doc_link_2 = examDocLink2;

            if (content)
                category.content = content;

            if (exam) {
                category.exam = { id: exam.id, name: exam.name, code: exam.code };
            }

            category.show_doc_btn = showDocBtn;
            category.show_exam_btn = showExamBtn;
            category.show_video_btn = showVideoBtn;
            category.is_free = isFree;
            category.total_video_time = totalVideoTime;
            category.free_started_at = freeStartedAt ? new Date(freeStartedAt) : null;
            category.free_finished_at = freeFinishedAt ? new Date(freeFinishedAt) : null;
            if (ordering)
                category.ordering = ordering;
            else
                category.ordering = category.ordering;

            const rs = await CategoryModel.updateOne({ _id: category.id }, category);

            let classroom = null;
            if (rs.nModified) {
                if (exam && classroomID) {
                    classroom = await ClassroomModel.findOne({ _id: classroomID });
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
                    ExamClassroomModel.create(docExamClassroom);
                }

                if (classroomID) {
                    if (publishAt)
                        publishAt = new Date(publishAt);
                    const categoryClassroom = {
                        classroom_id: classroomID,
                        category: {
                            id: id,
                            name: category.name
                        },
                        chapter_id: category.chapter ? category.chapter.id : null,
                        publish_at: publishAt,
                        ordering: ordering
                    };
                    const _categoryClassroomRs = await CategoryClassroomModel.findOne({ classroom_id: classroomID, 'category.id': id });
                    if (_categoryClassroomRs)
                        await CategoryClassroomModel.updateOne({ classroom_id: classroomID, 'category.id': id }, { $set: categoryClassroom });
                    else
                        await CategoryClassroomModel.create(categoryClassroom);

                    // Cap nhat thoi gian dong mo de thi theo lop
                    if (exam && exam._id)
                        ExamService.sendExam(classroom, exam, examStartedAt, examFinishedAt);
                }

                if (videos && videos.length > 0) {
                    const _currentVideos = await CategoryVideoModel.find({ category_id: category._id, deleted_at: null });

                    const newLinks = [];
                    for (let i = 0; i < videos.length; i++) {
                        const _video = videos[i];
                        if (!_video.link || _video.link.trim().length == 0)
                            continue;

                        let vType = 'YOUTUBE'
                        if (_video.link && _video.link.indexOf('vimeo.com') >= 0)
                            vType = 'VIMEO';

                        if (_video.link && _video.link.indexOf('mediadelivery.net') >= 0)
                            vType = 'BUNNY';

                        const valias = BaseHelper.seoURL(_video.name);
                        const _doc = {
                            name: _video.name,
                            alias: valias,
                            type: vType,
                            link: _video.link,
                            duration: _video.duration || 0,
                            category_id: category._id,
                            ordering: _video.ordering || 0
                        };
                        const _currentVideo = await CategoryVideoModel.findOne({ link: _doc.link, category_id: category._id, deleted_at: null });
                        if (!_currentVideo)
                            CategoryVideoModel.create(_doc);
                        else
                            CategoryVideoModel.updateOne({ _id: _currentVideo.id }, { $set: _doc });
                        newLinks.push(_doc.link);
                    }

                    if (_currentVideos.length > 0) {
                        for (let i = 0; i < _currentVideos.length; i++) {
                            const _link = _currentVideos[i].link.trim();
                            if (newLinks.indexOf(_link) < 0) {
                                CategoryVideoModel.softDelete({ _id: _currentVideos[i].id });
                            }
                        }
                    }
                } else {
                    CategoryVideoModel.softDelete({ category_id: category._id }, true);
                }

                return response(res, category, 'Thành công', statusCode.OK);
            }

            return response(res, category, language.ERROR, statusCode.ERROR);
        } catch (err) {
            console.log(err);
            return response(res, {}, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }


    async ordering(req, res, params) {
        try {
            const data = params.data || [];
            if (data.length == 0)
                return response(res, null, 'Request không hợp lệ!', statusCode.ERROR);

            for (let i = 0; i < data.length; i++) {
                const id = data[i].id;
                const ordering = data[i].ordering;
                await CategoryModel.updateOne({ _id: id }, { $set: { ordering } })
            }
            return response(res, null, 'Thành công', statusCode.OK);
        } catch (err) {
            logError(err);
            return response(res, {}, 'Có lỗi xảy ra. Vui lòng thử lại!', statusCode.ERROR);
        }
    }

    async updateMetaData(req, res, params) {
        try {
            const id = params.id || null;
            const ordering = params.ordering || 999;
            const status = params.status;

            if (!id)
                return response(res, null, 'Request không hợp lệ!', statusCode.ERROR);

            const _doc = {};
            _doc.ordering = parseInt(ordering);
            if (status !== undefined) _doc.status = status;

            let category = await CategoryModel.findOne({ _id: id });
            if (!category)
                return response(res, {}, language.ITEM_NOT_EXIST.replace('%s', 'Bài học'), statusCode.ERROR);

            const rs = await CategoryModel.updateOne({ _id: id }, { $set: _doc });
            if (rs.nModified) {
                category.ordering = ordering;
                return response(res, category, 'Thành công', statusCode.OK);
            }
            return response(res, category, language.ERROR, statusCode.ERROR);
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

            const rs = await CategoryModel.softDelete({ _id: { $in: ids } }, true);
            if (rs)
                return response(res, {}, 'Thành công', statusCode.OK);
            return response(res, null, language.ERROR, statusCode.ERROR);
        } catch (err) {
            logError(err);
            return response(res, null, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }

    async addExam(req, res, params) {
        try {
            const examID = params.exam_id || null;
            const classroomID = params.classroom_id || null;
            const categoryID = params.category_id || null;
            const publishAt = params.publish_at || null;
            const ordering = params.ordering || 999;

            let conditions = {};
            if (req.user.user_group === appConfig.USER_GROUP.STUDENT) {
                return response(res, null, 'Bạn không có quyền truy cập!', statusCode.FORBIDDEN);
            }

            const exam = await CategoryModel.findOne({ _id: examID, deleted_at: null });
            if (!exam)
                return response(res, null, 'Đề thi này không tồn tại!', statusCode.ERROR);

            const classroom = await ClassroomModel.findOne({ _id: classroomID });
            if (!classroom)
                return response(res, null, 'Lớp này không tồn tại!', statusCode.ERROR);

            conditions = {};
            conditions['category_id'] = categoryID;
            conditions['classroom_id'] = classroomID;
            conditions['exam.id'] = examID;
            const categoryClassroom = await CategoryExamModel.findOne(conditions);
            if (categoryClassroom) {
                return response(res, null, 'Đề thi này đã tồn tại!', statusCode.ERROR);
            }

            const docChapter = {
                classroom_id: classroomID,
                category_id: categoryID,
                exam: { id: exam.id, name: exam.name, code: exam.code },
                publish_at: publishAt,
                ordering
            };
            const rs = await CategoryExamModel.create(docChapter);
            if (rs) {
                return response(res, rs, 'Đã thêm thành công!', statusCode.OK);
            }

            return response(res, {}, language.ERROR, statusCode.ERROR);
        } catch (err) {
            logError(err);
            return response(res, null, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }

    async removeExam(req, res, params) {
        try {
            const id = params.id || null;
            if (req.user.user_group === appConfig.USER_GROUP.STUDENT) {
                return response(res, null, 'Bạn không có quyền truy cập!', statusCode.FORBIDDEN);
            }

            const rs = await CategoryExamModel.delete({ _id: id });
            if (rs) {
                return response(res, rs, 'Đã thêm thành công chương vào lớp học!', statusCode.OK);
            }

            return response(res, {}, language.ERROR, statusCode.ERROR);
        } catch (err) {
            logError(err);
            return response(res, null, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }

    async listExam(req, res, params) {
        try {
            const categoryID = params.category_id || null;
            const classroomID = params.classroom_id || null;
            const data = {};

            const exams = await CategoryExamModel.find({ classroom_id: classroomID, category_id: categoryID });
            const arrayExamID = [];
            for (let i = 0; i < exams.length; i++) {
                arrayExamID.push(exams[i].exam.id);
            }

            data.exams = exams;

            if (req.user.user_group === appConfig.USER_GROUP.STUDENT) {
                const conditions = {};
                conditions.deleted_at = null;
                conditions['exam.id'] = { $in: arrayExamID };
                conditions['user.id'] = req.user.user_id;
                const testings = await TestingModel.find(conditions);
                const testingExamIds = [];
                for (let i = 0; i < testings.length; i++) {
                    testingExamIds.push(testings[i].exam.id);
                }

                data.testingExamIds = testingExamIds;
                data.testings = testings;
            }

            return response(res, data, 'Thành công', statusCode.OK);
        } catch (err) {
            logError(err);
            return response(res, null, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }

    async listVideo(req, res, params) {
        try {
            const keyword = params.keyword || false;
            const page = parseInt(params.page || appConfig.PAGINATION.PAGE);
            const limit = parseInt(params.limit || appConfig.PAGINATION.LIMIT);
            const categoryID = params.category_id || null;
            const conditions = { deleted_at: null };

            const options = {
                skip: (page - 1) * limit,
                limit: limit,
                sort: { updated_at: -1 }
            };

            if (keyword) {
                const alias = BaseHelper.seoURL(keyword);
                conditions.alias = { $regex: alias, $options: 'i' };
            }

            if (categoryID)
                conditions.category_id = categoryID;

            const records = await CategoryVideoModel.find(conditions, null, options);
            const total = await CategoryVideoModel.count(conditions);
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

    async createVideo(req, res, params) {
        try {
            const { name, link } = params;
            let type = params.type || 'YOUTUBE';
            const categoryID = params.category_id || null;

            if (!name)
                return response(res, null, language.CANNOT_EMPTY.replace('%s', language.NAME), statusCode.ERROR);

            if (!link)
                return response(res, null, language.CANNOT_EMPTY.replace('%s', 'Link VIDEO'), statusCode.ERROR);

            const alias = BaseHelper.seoURL(name);

            if (link && link.indexOf('vimeo.com') >= 0)
                type = 'VIMEO';

            if (link && link.indexOf('mediadelivery.net') >= 0)
                type = 'BUNNY';

            const _doc = {
                name,
                alias,
                type,
                link,
                category_id: categoryID
            };
            const video = await CategoryVideoModel.create(_doc);
            if (!video)
                return response(res, {}, language.ERROR, statusCode.ERROR);

            return response(res, video, 'Thành công', statusCode.OK);
        } catch (err) {
            logError(err);
            return response(res, {}, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }

    async updateVideo(req, res, params) {
        try {
            const { id, name, link, ordering } = params;
            let type = params.type || 'YOUTUBE';
            const categoryID = params.category_id || null;

            if (!id)
                return response(res, null, 'Request không hợp lệ!', statusCode.ERROR);

            if (!name)
                return response(res, null, language.CANNOT_EMPTY.replace('%s', language.NAME), statusCode.ERROR);

            if (!link)
                return response(res, null, language.CANNOT_EMPTY.replace('%s', 'Link VIDEO'), statusCode.ERROR);

            const video = await CategoryVideoModel.findOne({ _id: id });
            if (!video)
                return response(res, {}, language.ITEM_NOT_EXIST.replace('%s', 'Video'), statusCode.ERROR);

            const alias = BaseHelper.seoURL(name);
            if (name) {
                video.name = name;
                video.alias = alias;
            }

            if (link && link.indexOf('vimeo.com') >= 0)
                type = 'VIMEO';

            if (link && link.indexOf('mediadelivery.net') >= 0)
                type = 'BUNNY';

            if (link)
                video.link = link;

            if (type)
                video.type = type;

            if (categoryID)
                video.category_id = category_id;

            const rs = await CategoryVideoModel.updateOne({ _id: category.id }, category);
            if (rs.nModified)
                return response(res, video, 'Thành công', statusCode.OK);
            return response(res, video, language.ERROR, statusCode.ERROR);
        } catch (err) {
            logError(err);
            return response(res, {}, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }

    async deleteVideo(req, res, params) {
        try {
            const { ids } = params || [];
            if (ids.length == 0)
                return response(res, null, 'Request không hợp lệ!', statusCode.ERROR);

            const rs = await CategoryVideoModel.softDelete({ _id: { $in: ids } }, true);
            if (rs)
                return response(res, {}, 'Thành công', statusCode.OK);
            return response(res, null, language.ERROR, statusCode.ERROR);
        } catch (err) {
            logError(err);
            return response(res, null, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }

    async registerLivestream(req, res, params) {
        try {
            const categoryId = params.category_id || null;
            const classroomId = params.classroom_id || null;
            let userId = req.user.user_id || null;

            if (!userId) {
                return response(res, null, 'Không tìm mã người dùng!', statusCode.ERROR);
            }

            const category = await CategoryModel.findOne({ _id: categoryId, deleted_at: null });

            if (!category) {
                return response(res, null, 'Vui lòng nhập thông tin bài hoc!', statusCode.ERROR);
            }

            const userOnClassroom = await ClassroomService.isUserInClassroom(req.user, classroomId);
            const isFreeChapterCategory = await ClassroomService.isFreeChapterClassroom(categoryId)
            if (isFreeChapterCategory === false && userOnClassroom === false) {
                return response(res, null, 'Bạn vui lòng đăng ký khóa học để được tham gia buổi học livestream.', statusCode.ERROR);
            }

            const start_date_time_live = category.start_date_time_live || null;
            if (!start_date_time_live) {
                return response(res, null, 'Đăng ký không thành công!', statusCode.ERROR);
            }

            let end_date_time_live = new Date();
            end_date_time_live = end_date_time_live.setHours(end_date_time_live.getHours() - 3);

            if (end_date_time_live > start_date_time_live) {
                return response(res, null, 'Đã hết thời gian đăng ký!', statusCode.ERROR);
            }

            const livestreams = await CategoryLivestreamModel.find({ category_id: categoryId, deleted_at: null }, null, { sort: { ordering: 1 } });

            let checkFullSlot = true;
            for (const livestream of livestreams) {
                let _live = JSON.parse(JSON.stringify(livestream));
                let sizeStudent = _live.users.length;
                if (_live.users.includes(userId)) {
                    return response(res, {}, 'Bạn đã đăng ký thành công!', statusCode.OK);
                }
                if (sizeStudent < 2000) {
                    checkFullSlot = false;
                    _live.users.push(userId);
                    await CategoryLivestreamModel.updateOne({ _id: _live._id }, { users: _live.users });
                    break;
                }
            }

            if (checkFullSlot) {
                return response(res, null, 'Đã hết chỗ trống có thể đăng ký!', statusCode.ERROR);
            }

            return response(res, {}, 'Đăng ký thành công!', statusCode.OK);
        } catch (error) {
            logError(error);
            return response(res, null, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }

    async updateDocLink(req, res, params) {
        try {
            const categories = await CategoryModel.find({ exam_doc_link_1: null, doc_link: { $ne: null } });

            for (const category of categories) {
                await CategoryModel.updateOne({ _id: category._id }, { $set: { exam_doc_link_1: category.doc_link } })
            }
            return response(res, {}, 'Thành công', statusCode.OK);
        } catch (err) {
            logError(err);
            return response(res, null, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }

}

module.exports = new CategoryController();
