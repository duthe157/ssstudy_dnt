const appConfig = require('../../config/config');
const BaseHelper = require('../helpers/BaseHelper');
const BookIdCourseModel = require('../models/BookIdCourse');
const ClassroomGroupModel = require('../models/ClassroomGroup');
const ChapterModel = require('../models/Chapter');

const ChapterClassroomModel = require('../models/ChapterClassroom');
const CategoryClassroomModel = require('../models/CategoryClassroom');
const ClassroomService = require('../services/ClassroomService');
const SubjectModel = require('../models/Subject');
const UserModel = require('../models/User');
const UserBuyDataModel = require('../models/UserBuyData');
const UploadService = require('../services/UploadService');
const language = BaseHelper.fileToJSON(`${__dirname}/../languages/vi.json`);
const StudentBookIdModel = require('../models/StudentBookId');
const BookIdModel = require('../models/BookId');
const CategoryModel = require('../models/Category');
const ExamClassroomModel = require('../models/ExamClassroom');

class BookIdCourseController {

    async list(req, res, params) {
        try {
            const keyword = params.keyword || false;
            const page = parseInt(params.page || 1);
            const limit = parseInt(params.limit || 20);
            const subjectID = params.subject_id || null;
            const groupID = params.group_id || null;
            const teacherID = params.teacher_id || null;
            const level = params.level || false;
            const status = params.status;
            const conditions = { deleted_at: null };

            const options = {
                sort: { created_at: -1 }
            }

            if (limit != -1) {
                options.skip = (page - 1) * limit;
                options.limit = limit
            }

            const sortKey = params.sort_key || null;
            const sortValue = params.sort_value || null;
            if (sortKey && (sortValue == 1 || sortValue == -1)) {
                options.sort = {};
                options.sort[sortKey] = sortValue;
            }

            if (keyword) {
                const parserKeyword = keyword.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')
                conditions.name = { $regex: parserKeyword, $options: 'i' };
            }
            if (subjectID)
                conditions['subject.id'] = subjectID;

            if (level)
                conditions.level = level;

            if (status !== undefined)
                conditions.status = status;

            if (teacherID)
                conditions.teacher_id = teacherID;

            if (groupID)
                if (Array.isArray(groupID)) {
                    conditions.$or = [];
                    for (let i = 0; i < groupID.length; i++) {
                        conditions.$or.push({ 'group.id': groupID[i] });
                    }
                } else {
                    conditions['group.id'] = groupID;
                }

            const records = await BookIdCourseModel.find(conditions, null, options);
            const total = await BookIdCourseModel.count(conditions);
            const data = {
                records,
                totalRecord: total,
                perPage: limit,
            };
            return response(res, data, 'Thành công', statusCode.OK);
        } catch (err) {
            logError(err);
            console.log(err);
            return response(res, null, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }

    async listPublic(req, res, params) {
        try {
            const keyword = params.keyword || false;
            const bookId = params.book_id || null;
            const page = parseInt(params.page || appConfig.PAGINATION.PAGE);
            const limit = parseInt(params.limit || appConfig.PAGINATION.LIMIT);
            const subjectID = params.subject_id || null;
            const groupID = params.group_id || null;
            const isFeatured = params.is_featured;
            const teacherID = params.teacher_id || null;
            const level = params.level || false;
            const conditions = { deleted_at: null, status: true };


            const options = {
                sort: { created_at: -1 }
            }

            if (limit != -1) {
                options.skip = (page - 1) * limit;
                options.limit = limit
            }

            const sortKey = params.sort_key || null;
            const sortValue = params.sort_value || null;
            if (sortKey && (sortValue == 1 || sortValue == -1)) {
                options.sort = {};
                options.sort[sortKey] = sortValue;
            }
            if (keyword) {
                const parserKeyword = keyword.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')
                conditions.name = { $regex: parserKeyword, $options: 'i' };
            }

            if (subjectID)
                conditions['subject.id'] = subjectID;

            if (level)
                conditions.level = level;

            if (isFeatured !== undefined)
                conditions.is_featured = isFeatured;

            if (teacherID)
                conditions.teacher_id = teacherID;

            if (groupID)
                if (Array.isArray(groupID)) {
                    conditions.$or = [];
                    for (let i = 0; i < groupID.length; i++) {
                        conditions.$or.push({ 'group.id': groupID[i] });
                    }
                } else {
                    conditions['group.id'] = groupID;
                }
            const records = await BookIdCourseModel.find(conditions, null, options);
            const total = await BookIdCourseModel.count(conditions);
            const data = {
                records,
                totalRecord: total,
                perPage: limit,
            };

            return response(res, data, 'Thành công', statusCode.OK);
        } catch (err) {
            logError(err);
            console.log(err);
            return response(res, null, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }

    async listRelated(req, res, params) {
        try {
            const page = parseInt(params.page || appConfig.PAGINATION.PAGE);
            const limit = parseInt(params.limit || appConfig.PAGINATION.LIMIT);
            const id = params.id || null;
            const groupID = params.group_id || null;
            const level = params.level || false;
            const conditions = { deleted_at: null };

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
            if (id) {
                conditions._id = { $ne: id };
            }
            const records = await BookIdCourseModel.db.find(conditions, null, options).lean();
            for (let i = 0; i < records.length; i++) {
                const course = records[i];
                let teacher = null;
                if (course.teacher_id)
                    teacher = await UserModel.db.findOne({ _id: course.teacher_id });
                course.teacher = teacher;
            }
            const total = await BookIdCourseModel.count(conditions);
            const data = {
                records,
                totalRecord: total,
                perPage: limit,
            };
            return response(res, data, 'Thành công', statusCode.OK);
        } catch (err) {
            logError(err);
            console.log(err);
            return response(res, null, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }

    async detail(req, res, params) {
        try {
            const { id } = params;
            const course = await BookIdCourseModel.db.findOne({ _id: id }).lean();
            if (!course) {
                return response(res, null, 'Không tìm thấy dữ liệu', statusCode.ERROR);
            }

            let isBought = false;
            let userBookDetail = null;

            if (req.user && req.user.user_group === 'STUDENT') {
                const userBooks = await StudentBookIdModel.db.find({
                    'user.id': req.user.user_id,
                    deleted_at: null
                }).lean();

                const bookIds = userBooks
                    .map(b => b.bookIdCourse?.id)
                    .filter(Boolean);

                if (bookIds.length > 0) {
                    const matchedBook = await BookIdModel.db.findOne({
                        _id: { $in: bookIds },
                        classroom_attached: course._id,
                        deleted_at: null
                    }).lean();

                    if (matchedBook) {
                        isBought = true;
                        userBookDetail = userBooks.find(b =>
                            b.bookIdCourse?.id?.toString() === matchedBook._id.toString()
                        );
                    }
                }
            }

            if (course.teacher_id) {
                const teacher = await UserModel.db.findOne({
                    _id: course.teacher_id
                }).lean();

                if (teacher) {
                    course.teacher_obj = teacher;
                }
            }
            return response(
                res,
                {
                    course,
                    isBought,
                    userBookDetail,
                },
                'Thành công',
                statusCode.OK
            );

        } catch (err) {
            logError(err);
            console.log(err)
            return response(res, null, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }
    async create(req, res, params) {
        try {
            const { name, content, files, description, video_intro, chapters } = params;
            const subjectID = params.subject_id || null;
            const code = params.code || null;
            const group_id = params.group_id || false;
            const teacherID = params.teacher_id || null;
            const promotion = params.promotion || null;
            const level = params.level || null;
            const includes = params.includes || null;
            const highlightInformations = params.highlightInformations;
            const note = params.note || null;
            const group_chapter = params.group_chapter || null;
            if (!name)
                return response(res, null, language.CANNOT_EMPTY.replace('%s', language.NAME), statusCode.ERROR);

            if (!subjectID)
                return response(res, null, language.CANNOT_EMPTY.replace('%s', language.SUBJECT), statusCode.ERROR);

            const subject = await SubjectModel.findOne({ _id: subjectID });
            if (!subject)
                return response(res, null, language.ITEM_NOT_EXIST.replace('%s', language.SUBJECT), statusCode.ERROR);

            if (!group_id)
                return response(res, null, language.CANNOT_EMPTY.replace('%s', 'Danh mục'), statusCode.ERROR);

            if (!teacherID)
                return response(res, null, language.CANNOT_EMPTY.replace('%s', 'Giáo viên'), statusCode.ERROR);

            let BookCourseID = null;
            if (code) {
                const exist = await BookIdCourseModel.findOne({ code: code });
                if (exist)
                    return response(res, null, 'Mã sách đã tồn tại, vui lòng thử lại!', statusCode.ERROR);
                newBookCourseId = BookCourseID;
            } else {
                const latest = await BookIdCourseModel.db
                    .findOne({})
                    .sort({ _id: -1 })
                    .lean();
                let nextX = 1000;
                if (latest?.code) {
                    const x = parseInt(latest.code, 10);
                    if (!isNaN(x)) nextX = x + 1000;
                }
                BookCourseID = `${nextX}`;
            }

            const alias = BaseHelper.seoURL(name.trim());
            const _doc = {
                name,
                alias,
                code: BookCourseID,
                group_id,
                subject: { id: subject.id, name: subject.name },
                description,
                content,
                video_intro,
                level,
                teacher_id: teacherID,
                promotion,
                includes: includes,
                highlightInformations: highlightInformations,
                note,
                group_chapter
            };

            if (files && files.length > 0) {
                const fileData = await UploadService.upload(files[0], 'base64', 'course');
                if (fileData) {
                    _doc.image = appConfig.FILE_DOMAIN + '/' + fileData[0];
                }
            }


            const course = await BookIdCourseModel.create(_doc);
            if (!course)
                return response(res, {}, language.ERROR, statusCode.ERROR);

            if (chapters && Array.isArray(chapters) && chapters.length > 0) {
                for (const chap of chapters) {
                    let group_id = chap.group_id || null;
                    if (!group_id && chap.group_title && Array.isArray(group_chapter)) {
                        const foundGroup = group_chapter.find(g => g.title === chap.group_title || g.name === chap.group_title);
                        if (foundGroup) {
                            group_id = foundGroup.id;
                        }
                    }

                    const docChapter = {
                        classroom_id: course._id.toString(),
                        chapter: { id: chap.id, name: chap.name },
                        group_id: group_id,
                        ordering: chap.ordering || 1
                    };
                    await ChapterClassroomModel.create(docChapter);

                    const chapterDetail = await ChapterModel.findOne({ _id: chap.id, deleted_at: null });
                    if (chapterDetail) {
                        ClassroomService.updateBookCourseExam(chap.id, course);
                        const classroomIds = chapterDetail.classroom_ids || [];
                        if (classroomIds.indexOf(course._id.toString()) === -1) {
                            classroomIds.push(course._id.toString());
                            await ChapterModel.updateOne({ _id: chap.id }, { $set: { classroom_ids: classroomIds } });
                        }
                    }
                }
            }

            return response(res, course, 'Thành công', statusCode.OK);
        } catch (err) {
            logError(err);
            console.log(err);
            return response(res, {}, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }

    async listUserCoursesFromBooks(req, res, params) {
        try {
            const keyword = params.keyword || false;
            const page = parseInt(params.page || appConfig.PAGINATION.PAGE);
            let limit = parseInt(params.limit || appConfig.PAGINATION.LIMIT);
            if (limit === 100) limit = 200;

            const subjectID = params.subject_id || null;
            const groupID = params.group_id || null;
            const teacherID = params.teacher_id || null;
            const level = params.level || [];

            const conditions = { deleted_at: null };
            if (teacherID) conditions.teacher_id = teacherID;

            let arrayCourseID = [];
            let userBooks = [];
            let books = []
            // ================= USER BOOK =================
            if (req.user && req.user.user_group === 'STUDENT') {
                userBooks = await StudentBookIdModel.db.find({
                    'user.id': req.user.user_id,
                    deleted_at: null
                }).lean();

                const arrayBookID = userBooks
                    .map(b => b.bookIdCourse?.id)
                    .filter(id => id);

                books = await BookIdModel.db.find({
                    _id: { $in: arrayBookID },
                    deleted_at: null
                }).lean();

                for (const book of books) {
                    if (book.classroom_attached?.length) {
                        for (const courseId of book.classroom_attached) {
                            if (!arrayCourseID.includes(courseId)) {
                                arrayCourseID.push(courseId);
                            }
                        }
                    }
                }

                conditions._id = { $in: arrayCourseID };
            }

            // ================= PAGINATION =================
            const options = {
                skip: (page - 1) * limit,
                limit: limit,
                sort: { created_at: -1 }
            };

            const sortKey = params.sort_key || null;
            const sortValue = params.sort_value || null;
            if (sortKey && (sortValue == 1 || sortValue == -1)) {
                options.sort = { [sortKey]: sortValue };
            }

            // ================= FILTER =================
            if (keyword) {
                const alias = BaseHelper.seoURL(keyword);
                conditions.alias = { $regex: alias, $options: 'i' };
            }

            if (subjectID) conditions['subject.id'] = subjectID;

            if (groupID) {
                if (Array.isArray(groupID)) {
                    conditions.$or = groupID.map(g => ({ 'group.id': g }));
                } else {
                    conditions['group.id'] = groupID;
                }
            }

            if (level && level.length > 0) {
                conditions.level = { $in: level };
            }

            // ================= QUERY =================
            const records = await BookIdCourseModel.db.find(conditions, null, options).lean();
            const total = await BookIdCourseModel.db.countDocuments(conditions);

            // ================= HELPER =================
            function getExtendedExpiredDate(expriredDate, totalMonths = 0) {
                if (!expriredDate) return null;
                const date = new Date(expriredDate);
                date.setMonth(date.getMonth() + totalMonths);
                date.setHours(23, 59, 59, 999);
                return date;
            }

            // ================= MAP USER BOOK =================
            const userBookMap = {};

            for (const ub of userBooks) {
                const bookId = ub.bookIdCourse?.id?.toString();
                if (!bookId) continue;
                console.log('Processing user book:', ub);
                const current = userBookMap[bookId];
                const currentExpire = current?.exprired_date ? new Date(current.exprired_date) : null;
                const newExpire = ub.exprired_date ? new Date(ub.exprired_date) : null;

                if (!current || (newExpire && (!currentExpire || newExpire > currentExpire))) {
                    userBookMap[bookId] = ub;
                }
            }
            const courseToBookMap = {};
            for (const book of books) {
                const bookId = book._id?.toString();

                for (const courseId of book.classroom_attached || []) {
                    const cId = courseId.toString();

                    const currentBookId = courseToBookMap[cId];

                    if (!currentBookId) {
                        courseToBookMap[cId] = bookId;
                    } else {
                        const currentUserBook = userBookMap[currentBookId];
                        const newUserBook = userBookMap[bookId];

                        const currentExpire = currentUserBook?.exprired_date ? new Date(currentUserBook.exprired_date) : null;
                        const newExpire = newUserBook?.exprired_date ? new Date(newUserBook.exprired_date) : null;

                        if (newExpire && (!currentExpire || newExpire > currentExpire)) {
                            courseToBookMap[cId] = bookId;
                        }
                    }
                }
            }
            // ================= MERGE =================
            const now = new Date();

            const recordsWithUserBook = records.map(course => {
                const courseId = course._id?.toString();

                const bookId = courseToBookMap[courseId];
                const userBook = bookId ? userBookMap[bookId] : null;

                let status = "EXPIRED";
                let finalExpiredDate = null;

                if (userBook) {
                    const originalExpired = getExtendedExpiredDate(userBook.exprired_date, 0);

                    const extendedExpired = getExtendedExpiredDate(
                        userBook.exprired_date,
                        userBook.total_extended_months || 0
                    );

                    finalExpiredDate = extendedExpired;

                    if (originalExpired && originalExpired > now) {
                        status = "ACTIVE";
                    } else if (extendedExpired && extendedExpired >= now && userBook.extend_times > 0) {
                        status = "EXTENDED";
                    }
                }

                return {
                    ...course,
                    userBook,
                    status, // ACTIVE | EXTENDED | EXPIRED
                    finalExpiredDate
                };
            });

            const data = {
                records: recordsWithUserBook,
                limit,
                totalRecord: total,
                perPage: limit,
            };

            return response(res, data, 'Thành công', statusCode.OK);

        } catch (err) {
            logError(err);
            console.log(err);
            return response(res, null, 'Có lỗi xảy ra. Vui lòng thử lại!', statusCode.ERROR);
        }
    }

    async getNextItemCode(req, res, params) {
        try {
            const id = params.id || req.body.id || req.query.id || req.params.id;
            if (!id) return response(res, null, 'Thiếu classroom_id / Khóa học ID', statusCode.ERROR);

            const classroom = await BookIdCourseModel.findOne({ _id: id });
            if (!classroom) return response(res, null, 'Khóa học Sách ID không tồn tại', statusCode.ERROR);

            let baseCode = classroom.code ? parseInt(classroom.code) : 1000;
            const bookParent = await BookIdModel.findOne({ classroom_attached: id });
            if (bookParent && bookParent.book_id) {
                const parsedBookId = parseInt(bookParent.book_id);
                if (!isNaN(parsedBookId)) baseCode = parsedBookId;
            }
            let maxCode = baseCode;

            const chapterClassrooms = await ChapterClassroomModel.find({ classroom_id: id });
            const chapterIds = chapterClassrooms.map(c => c.chapter.id);

            const categories = await CategoryModel.find({ 'chapter.id': { $in: chapterIds } });

            for (let i = 0; i < categories.length; i++) {
                const cat = categories[i];
                if (cat.code && !isNaN(parseInt(cat.code))) {
                    maxCode = Math.max(maxCode, parseInt(cat.code));
                }
                if (cat.exam && Array.isArray(cat.exam)) {
                    for (let j = 0; j < cat.exam.length; j++) {
                        const ex = cat.exam[j];
                        if (ex && ex.code && !isNaN(parseInt(ex.code))) {
                            maxCode = Math.max(maxCode, parseInt(ex.code));
                        }
                    }
                }
            }

            const examClassrooms = await ExamClassroomModel.find({ "classroom.id": id });
            for (let i = 0; i < examClassrooms.length; i++) {
                const ex = examClassrooms[i];
                if (ex.exam && ex.exam.code && !isNaN(parseInt(ex.exam.code))) {
                    maxCode = Math.max(maxCode, parseInt(ex.exam.code));
                }
            }
            const nextCode = (maxCode + 1).toString();
            return response(res, { code: nextCode }, 'Thành công', statusCode.OK);
        } catch (err) {
            logError(err);
            console.log(err);
            return response(res, null, 'Có lỗi xảy ra', statusCode.ERROR);
        }
    }

    async update(req, res, params) {
        try {
            const { id, name, content, files, description, video_intro, chapters, group_chapter } = params;

            if (!id)
                return response(res, null, 'Request không hợp lệ!', statusCode.ERROR);
            const group_id = params.group_id || false;

            const subjectID = params.subject_id || null;
            const teacherID = params.teacher_id || null;
            const code = params.code || null;
            const promotion = params.promotion || null;
            const level = params.level || null;
            const includes = params.includes || null;
            const highlightInformations = params.highlightInformations || null;
            const note = params.note || null;

            // ===== Check tồn tại =====
            const courseExist = await BookIdCourseModel.db.findById(id);
            if (!courseExist)
                return response(res, null, language.ITEM_NOT_EXIST.replace('%s', 'KHÓA HỌC'), statusCode.ERROR);

            if (!name)
                return response(res, null, language.CANNOT_EMPTY.replace('%s', language.NAME), statusCode.ERROR);

            if (!subjectID)
                return response(res, null, language.CANNOT_EMPTY.replace('%s', language.SUBJECT), statusCode.ERROR);

            const subject = await SubjectModel.findOne({ _id: subjectID });
            if (!subject)
                return response(res, null, language.ITEM_NOT_EXIST.replace('%s', language.SUBJECT), statusCode.ERROR);


            if (!teacherID)
                return response(res, null, language.CANNOT_EMPTY.replace('%s', 'Giáo viên'), statusCode.ERROR);
            let newBookCourseId = null;
            if (code) {
                const exist = await BookIdCourseModel.findOne({
                    code: code,
                    _id: { $ne: id }
                });

                if (exist) {
                    return response(
                        res,
                        null,
                        'Mã sách đã tồn tại, vui lòng thử lại!',
                        statusCode.ERROR
                    );
                }
                newBookCourseId = code;
            } else {
                const latest = await BookIdCourseModel.db
                    .findOne({})
                    .sort({ _id: -1 })
                    .lean();
                let nextX = 1000;
                if (latest?.code) {
                    const x = parseInt(latest.code, 10);
                    if (!isNaN(x)) nextX = x + 1000;
                }
                newBookCourseId = `${nextX}`;
            }
            const alias = BaseHelper.seoURL(name.trim());
            const _doc = {
                name,
                alias,
                code: newBookCourseId,
                group_id,
                subject: { id: subject.id, name: subject.name },
                description,
                content,
                video_intro,
                level,
                teacher_id: teacherID,
                promotion,
                includes,
                highlightInformations,
                note,
                group_chapter: group_chapter || []
            };

            if (files && files.length > 0) {
                const fileData = await UploadService.upload(files[0], 'base64', 'course');
                if (fileData) {
                    _doc.image = appConfig.FILE_DOMAIN + '/' + fileData[0];
                }
            }

            const course = await BookIdCourseModel.db.findByIdAndUpdate(
                id,
                { $set: _doc },
                { new: true }
            );

            // Cập nhật chapters
            if (chapters && Array.isArray(chapters)) {
                await ChapterClassroomModel.delete({ classroom_id: id }, true);
                for (const chap of chapters) {
                    let group_id = chap.group_id || null;
                    if (!group_id && chap.group_title && Array.isArray(group_chapter)) {
                        const foundGroup = group_chapter.find(g => g.title === chap.group_title || g.name === chap.group_title);
                        if (foundGroup) {
                            group_id = foundGroup.id;
                        }
                    }

                    const docChapter = {
                        classroom_id: id,
                        chapter: { id: chap.id, name: chap.name },
                        group_id: group_id,
                        ordering: chap.ordering || 1
                    };
                    await ChapterClassroomModel.create(docChapter);

                    const chapterDetail = await ChapterModel.findOne({ _id: chap.id, deleted_at: null });
                    if (chapterDetail) {
                        ClassroomService.updateBookCourseExam(chap.id, course);
                        const classroomIds = chapterDetail.classroom_ids || [];
                        if (classroomIds.indexOf(id) === -1) {
                            classroomIds.push(id);
                            await ChapterModel.updateOne({ _id: chap.id }, { $set: { classroom_ids: classroomIds } });
                        }
                    }
                }
            }

            return response(res, course, 'Thành công', statusCode.OK);

        } catch (err) {
            logError(err);
            console.log(err);
            return response(res, {}, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }

    async updateMetaData(req, res, params) {
        try {
            const id = params.id || null;
            const ordering = params.ordering || 999;
            const status = params.status;
            const isFeatured = params.is_featured;

            if (!id)
                return response(res, null, 'Request không hợp lệ!', statusCode.ERROR);

            const doc = {};
            doc.ordering = parseInt(ordering);
            if (status !== undefined) doc.status = status;
            if (isFeatured !== undefined) doc.is_featured = isFeatured;

            let course = await BookIdCourseModel.findOne({ _id: id });
            if (!course)
                return response(res, {}, language.ITEM_NOT_EXIST.replace('%s', 'KHÓA HỌC'), statusCode.ERROR);
            const rs = await BookIdCourseModel.updateOne({ _id: id }, { $set: doc });
            if (rs.nModified) {
                course = await BookIdCourseModel.findOne({ _id: id });
                return response(res, course, 'Thành công', statusCode.OK);
            }
            return response(res, course, language.ERROR, statusCode.ERROR);
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

            const rs = await BookIdCourseModel.softDelete({ _id: { $in: ids } }, true);
            if (rs)
                return response(res, {}, 'Thành công', statusCode.OK);
            return response(res, null, language.ERROR, statusCode.ERROR);
        } catch (err) {
            logError(err);
            return response(res, null, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }
    async addChapter(req, res, params) {
        try {
            const chapterID = params.chapter_id || null;
            const classroomID = params.classroom_id || null;
            const group_id = params.group_id || null;
            let conditions = {};
            // if (req.user.user_group === appConfig.USER_GROUP.STUDENT) {
            //     return response(res, null, 'Bạn không có quyền truy cập!', statusCode.FORBIDDEN);
            // }


            const chapter = await ChapterModel.findOne({ _id: chapterID, deleted_at: null });
            if (!chapter)
                return response(res, null, 'Chương này không tồn tại!', statusCode.ERROR);


            const classroom = await BookIdCourseModel.findOne({ _id: classroomID });
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
                ClassroomService.updateBookCourseExam(chapterID, classroom);
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
            console.log(err)
            return response(res, null, 'Có lỗi xảy ra. Vui lòng thử lại!', statusCode.ERROR);
        }
    }
    async removeChapter(req, res, params) {
        try {
            const chapterID = params.chapter_id || null;
            const classroomID = params.classroom_id || null;
            let conditions = {};
            // if (req.user.user_group === appConfig.USER_GROUP.STUDENT) {
            //     return response(res, null, 'Bạn không có quyền truy cập!', statusCode.FORBIDDEN);
            // }

            const chapter = await ChapterModel.findOne({ _id: chapterID });
            if (!chapter)
                return response(res, null, 'Chương này không tồn tại!', statusCode.ERROR);


            const classroom = await BookIdCourseModel.findOne({ _id: classroomID });
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
            console.log(err)
            return response(res, null, 'Có lỗi xảy ra. Vui lòng thử lại!', statusCode.ERROR);
        }
    }
    async UpdateGroupChapter(req, res, params) {
        try {
            const group_chapter = params.group_chapter || [];
            const classroomID = params.classroom_id || null;

            const classroom = await BookIdCourseModel.findOne({ _id: classroomID });
            if (!classroom)
                return response(res, null, 'Lớp này không tồn tại!', statusCode.ERROR);

            // Quy chuẩn mã Bài học & Bài tập: sinh liên tục tăng dần từ mã Sách ID + 1
            let baseCode = classroom.code ? parseInt(classroom.code) : 1000;
            const bookParent = await BookIdModel.findOne({ classroom_attached: classroomID });
            if (bookParent && bookParent.book_id) {
                const parsedBookId = parseInt(bookParent.book_id);
                if (!isNaN(parsedBookId)) baseCode = parsedBookId;
            }
            let currentCode = baseCode;

            if (Array.isArray(group_chapter)) {
                for (const group of group_chapter) {
                    const items = group.items || group.children || [];
                    if (Array.isArray(items)) {
                        for (const item of items) {
                            currentCode++;
                            item.code = currentCode.toString();
                            if (item.id) {
                                ChapterClassroomModel.updateOne({ classroom_id: classroomID, 'chapter.id': item.id }, { $set: { code: item.code } }).catch(() => { });
                            }

                            const subItems = item.children || item.items || item.lessons || item.exercises || item.exams || item.exam || [];
                            if (Array.isArray(subItems)) {
                                for (const sub of subItems) {
                                    currentCode++;
                                    sub.code = currentCode.toString();
                                    if (sub.id) {
                                        CategoryClassroomModel.updateOne({ classroom_id: classroomID, 'category.id': sub.id }, { $set: { code: sub.code } }).catch(() => { });
                                    }

                                    const exercises = sub.exercises || sub.exams || sub.exam || [];
                                    if (Array.isArray(exercises)) {
                                        for (const ex of exercises) {
                                            currentCode++;
                                            ex.code = currentCode.toString();
                                            if (ex.id) {
                                                ExamClassroomModel.updateOne({ "classroom.id": classroomID, exam_id: ex.id }, { $set: { "exam.code": ex.code } }).catch(() => { });
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }

            const rs = await BookIdCourseModel.updateOne({ _id: classroomID }, { $set: { group_chapter: group_chapter } });
            if (rs.nModified || rs.ok)
                return response(res, { group_chapter }, 'Đã cập nhật nhóm chương và mã ID thành công (theo mã Sách ID)!', statusCode.OK);
            return response(res, {}, language.ERROR, statusCode.ERROR);
        } catch (err) {
            logError(err);
            console.log(err);
            return response(res, null, 'Có lỗi xảy ra. Vui lòng thử lại!', statusCode.ERROR);
        }
    }
    async view(req, res, params) {
        try {
            const { id } = params;
            let otherCourses = [];
            let conditions = { _id: id };
            let isBought = false;
            const course = await BookIdCourseModel.findOne(conditions);
            if (course) {
                if (course.group)
                    otherCourses = await BookIdCourseModel.find({ 'group_id': course.group.id, deleted_at: null });

                if (req.user) {
                    const num = await UserBuyDataModel.findOne({ user_id: req.user.user_id, item_id: course._id, type: 'BOOK_ID_COURSE' });
                    if (num)
                        isBought = true;
                }
            }
            let teacher = null;
            if (course && course.teacher_id)
                teacher = await UserModel.findOne({ _id: course.teacher_id });

            return response(res, { course, teacher, otherCourses, is_bought: isBought }, 'Thành công', statusCode.OK);
        } catch (err) {
            logError(err);
            console.error(err);
            return response(res, null, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }


}

module.exports = new BookIdCourseController();
