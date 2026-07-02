const appConfig = require('../../config/app');
const dateFormat = require('dateformat');
const StudentClassroomModel = require('../models/StudentClassroom');
const StudentBookIdModel = require('../models/StudentBookId');
const ClassroomModel = require('../models/Classroom');
const BookIdModel = require('../models/BookId')
const ChapterModel = require('../models/Chapter');
const ChapterClassroomModel = require('../models/ChapterClassroom');
const CategoryModel = require('../models/Category');
const UserModel = require('../models/User');
const UserBuyDataModel = require('../models/UserBuyData');
const ExcelService = require('./ExcelService');
const ExamClassroomModel = require('../models/ExamClassroom');
const CategoryVideoModel = require('../models/CategoryVideo');
const moment = require('moment');
const StudentBookId = require('../models/StudentBookId');
class ClassroomService {
    async copyChapterCategory(chapter, chapterID) {
        try {
            const categories = await CategoryModel.find({ "chapter.id": chapterID });
            if (!categories) return;
            for (let i = 0; i < categories.length; i++) {
                let docCategory = categories[i];
                docCategory = docCategory.toObject();
                delete docCategory._id;
                docCategory.chapter = {
                    id: chapter._id,
                    code: chapter.code,
                    name: chapter.name
                };
                docCategory.classroom_ids = [];
                docCategory.exam_doc_link_1 = null;
                docCategory.exam_doc_link_2 = null;
                delete docCategory.exam;

                const category = await CategoryModel.create(docCategory);
                if (category) {
                    const categoryVideos = await CategoryVideoModel.find({ category_id: category._id });
                    for (let j = 0; j < categoryVideos.length; j++) {
                        let docCategoryVideo = categoryVideos[j];
                        docCategoryVideo = docCategoryVideo.toObject();
                        delete docCategoryVideo._id;
                        docCategoryVideo.category_id = category._id;
                        await CategoryVideoModel.create(docCategoryVideo);
                    }
                }
            }
        } catch (err) {
            console.log(err);
            logError(err);
            return false;
        }
    }

    async updateClassroomChapter(chapters, classroom, deleteIds = []) {
        try {

            if (deleteIds.length > 0)
                await ChapterClassroomModel.delete({
                    'chapter.id': { $in: deleteIds },
                    classroom_id: classroom._id
                });

            if (chapters && chapters.length > 0) {

                for (let i = 0; i < chapters.length; i++) {
                    const _chapter = chapters[i];
                    const docChapter = {
                        classroom_id: classroom._id,
                        chapter: { id: _chapter.id, name: _chapter.name },
                        ordering: _chapter.ordering || 1,
                        selected_subject_id: _chapter.selected_subject_id
                    };

                    let conditions = {};
                    conditions['chapter.id'] = _chapter.id;
                    conditions['classroom_id'] = classroom._id;
                    const chapterClassroom = await ChapterClassroomModel.findOne(conditions);
                    if (!chapterClassroom) {
                        const _rs = await ChapterClassroomModel.create(docChapter);
                        if (_rs) {
                            const classroomIds = _chapter.classroom_ids || [];
                            if (classroomIds.indexOf(classroom._id) <= 0) {
                                classroomIds.push(classroom._id);
                                ChapterModel.updateOne({ _id: _chapter.id }, { $set: { classroom_ids: classroomIds } });
                            }
                        }
                    } else {
                        ChapterClassroomModel.updateOne(conditions, { $set: docChapter });
                    }
                }
            }
        } catch (err) {
            logError(err);
            return false;
        }
    }

    async updateClassroomExam(chapterID, classroom, action = null) {
        try {
            if (action === 'REMOVE') {

            } else {
                console.log(1);
                const categories = await CategoryModel.find({ "chapter.id": chapterID });
                for (let i = 0; i < categories.length; i++) {
                    if (!categories[i].exam) continue;
                    console.log(2);
                    const exam = categories[i].exam;
                    const docExamClassroom = {
                        type: 'TRAC_NGHIEM',
                        exam_id: exam.id,
                        exam: exam,
                        classroom: {
                            id: classroom._id,
                            name: classroom.name,
                            code: classroom.code
                        },
                        subject: classroom.subject,
                        status: 'PENDING'
                    };
                    // console.log(JSON.stringify(docExamClassroom));
                    const item = await ExamClassroomModel.findOne({ exam_id: exam.id, "classroom.id": classroom._id });
                    if (!item)
                        ExamClassroomModel.create(docExamClassroom);
                }
            }
        } catch (err) {
            console.log(err);
            logError(err);
            return false;
        }
    }
    async updateBookCourseExam(chapterID, classroom, action = null) {
        try {
            if (action === 'REMOVE') {
                return;
            }

            const categories = await CategoryModel.find({ "chapter.id": chapterID });

            for (const category of categories) {
                if (!category.exam) continue;

                const exams = Array.isArray(category.exam)
                    ? category.exam
                    : [category.exam];

                for (const ex of exams) {
                    if (!ex) continue;

                    const examObj = ex.toObject?.() || ex;

                    const docExamClassroom = {
                        type: 'TRAC_NGHIEM',
                        exam_id: examObj.id,
                        exam: {
                            id: examObj.id,
                            name: examObj.name,
                            code: classroom.code
                        },
                        classroom: {
                            id: classroom._id,
                            name: classroom.name,
                            code: classroom.code
                        },
                        subject: classroom.subject,
                        status: 'PENDING'
                    };

                    const item = await ExamClassroomModel.findOne({

                        exam_id: examObj.id,
                        "classroom.id": classroom._id
                    });

                    if (!item) {
                        await ExamClassroomModel.create(docExamClassroom);
                    }
                }
            }

        } catch (err) {
            console.log(err);
            logError(err);
            return false;
        }
    }
    async isUserInClassroom(user, classroomID) {
        try {
            if (user.user_group !== appConfig.USER_GROUP.STUDENT) {
                return true;
            }

            const conditions = {
                'user.id': user.user_id,
                'classroom.id': classroomID,
                deleted_at: null
            };

            const userClassroom = await StudentClassroomModel.db.findOne(conditions).lean();

            if (userClassroom) {
                return true;
            }

            const userBooks = await StudentBookIdModel.db.find({
                'user.id': user.user_id,
                deleted_at: null
            }).lean();


            if (!userBooks || userBooks.length === 0) {
                return false;
            }

            const bookIds = userBooks
                .map(b => b.bookIdCourse?.id)
                .filter(id => id);

            if (!bookIds.length) {
                return false;
            }

            const books = await BookIdModel.db.find({
                _id: { $in: bookIds },
                deleted_at: null
            }).lean();

            const now = new Date();
            function getExtendedExpiredDate(expriredDate, totalMonths = 0) {
                if (!expriredDate) return null;
                const date = new Date(expriredDate);
                date.setMonth(date.getMonth() + totalMonths);
                date.setHours(23, 59, 59, 999);
                return date;
            }

            // ================= CHECK MATCH CLASSROOM =================
            for (const book of books) {

                if (!book.classroom_attached?.length) {
                    continue;
                }

                if (!book.classroom_attached.includes(classroomID)) {
                    continue;
                }
                const userBook = userBooks.find(
                    ub => ub.bookIdCourse?.id?.toString() === book._id.toString()
                );
                if (!userBook) {
                    continue;
                }

                const originalExpired = userBook.exprired_date
                    ? new Date(userBook.exprired_date)
                    : null;

                const extendedExpired = getExtendedExpiredDate(
                    userBook.exprired_date,
                    userBook.total_extended_months || 0
                );
                if (originalExpired && originalExpired > now) {
                    return true;
                }

                if (extendedExpired && extendedExpired > now) {
                    return true;
                }

            }
            return false;
        } catch (err) {
            logError(err);
            return false;
        }
    }

    async isFree(classroomID) {
        try {
            const conditions = {
                _id: classroomID,
                deleted_at: null,
                price: 0
            };
            const userClassroom = await ClassroomModel.findOne(conditions);
            if (userClassroom)
                return true;
            return false;
        } catch (err) {
            logError(err);
            return false;
        }
    }

    async isFreeChapterClassroom(categoryID) {
        try {
            const conditions = {
                '_id': categoryID,
                is_free: true
            };
            const categoriesFree = await CategoryModel.findOne(conditions);
            if (categoriesFree)
                return true;
            return false;
        } catch (err) {
            logError(err);
            return false;
        }
    }

    async updateUserBuyData(order, items, source = null) {
        try {
            if (!order || !order.customer_id)
                return false;

            if (!items || items.length === 0)
                return false;

            const userID = order.customer_id;
            if (!userID)
                return false;

            for (let i = 0; i < items.length; i++) {
                const item = items[i];
                let itemID = item.id;
                if (source === 'DB') itemID = item.item_id;
                const type = item.type;
                const qty = item.qty;
                const conditions = {
                    item_id: itemID,
                    type: type,
                    user_id: userID
                };
                const userBuy = await UserBuyDataModel.findOne(conditions);
                try {
                    if (userBuy) {
                        if (type === 'BOOK') {
                            UserBuyDataModel.updateOne(conditions, { $set: { $inc: { num: +qty } } });
                            _updateData.$set = {
                                $inc: { qty: +1 }
                            };
                        }
                    } else {
                        conditions.num = qty;
                        UserBuyDataModel.create(conditions);
                    }
                } catch (err) {

                }
            }
        } catch (err) {
            logError(err);
        }
    }

    async addUserToClassroomOnline(order, item, source = null) {
        try {
            if (!order?.customer_id || !item) return false;

            if (item.type !== 'CLASSROOM') return false;

            const userID = order.customer_id;

            const user = await UserModel.findById(userID).lean();
            if (!user) return false;

            let itemID = item.id;
            if (source === 'DB') itemID = item.item_id;

            const conditions = {
                'classroom.id': itemID,
                'user.id': userID,
                deleted_at: null
            };
            
            const existed = await StudentClassroomModel.findOne(conditions).lean();

            if (!existed) {
                await StudentClassroomModel.create({
                    classroom: {
                        id: itemID,
                        name: item.name,
                        code: item.code
                    },
                    user: {
                        id: userID,
                        name: user.fullname,
                        code: user.code
                    },
                    sobuoihoc: 1000,
                    deleted_at: null,
                    joined_at: new Date(),
                    last_card_updated_at: new Date()
                });
            }

            await this.updateUserBuyData(order, [item], source);

            return true;
        } catch (err) {
            logError(err);
            return false;
        }
    }
    async extendBookId(order, item) {
        try {
            if (!order?.customer_id || !item) return false;

            if (item.type !== 'EXTEND_BOOKID') return false;

            const userID = order.customer_id;

            const user = await UserModel.db.findById(userID).lean();
            if (!user) return false;

            const itemID = item.item_id || item.id;

            const bookId = await BookIdModel.db.findById(itemID).lean();
            if (!bookId) return false;

            const studentBookId = await StudentBookId.findOne({
                'bookIdCourse.id': itemID,
                'user.id': userID,
                deleted_at: null
            });

            if (!studentBookId) return false;

            const now = new Date();
            const baseDate =
                new Date(studentBookId.exprired_date) > now
                    ? new Date(studentBookId.exprired_date)
                    : now;

            const months = Number(bookId?.renewed_bookId?.expired_time || 0);

            const newExpriredDate = new Date(baseDate);
            newExpriredDate.setMonth(newExpriredDate.getMonth() + months);
            newExpriredDate.setHours(23, 59, 59, 999);

            const extendTimes = Math.max(0, Number(studentBookId.extend_times || 0) - 1);

            await StudentBookId.updateOne(
                { _id: studentBookId._id },
                {
                    $set: {
                        exprired_date: newExpriredDate,
                        extend_times: extendTimes
                    }
                }
            );

            return true;
        } catch (err) {
            logError(err);
            console.log(err)
            return false;
        }
    }

    async addBookIdToUser(order, item, source = null) {
        try {
            if (!order?.customer_id || !item) return false;

            const userID = order.customer_id;

            const user = await UserModel.db.findById(userID).lean();
            if (!user) return false;

            let itemID = item.id;
            if (source === 'DB') itemID = item.item_id;

            const book = await BookIdModel.db.findById(itemID).lean();
            if (!book) return false;

            const existed = await StudentBookIdModel.findOne({
                'bookIdCourse.id': itemID,
                'user.id': userID,
                deleted_at: null
            });

            const now = new Date();
            const months = Number(book?.renewed_bookId?.expired_time) || 0;
            const expiredDate = new Date(now);
            expiredDate.setMonth(expiredDate.getMonth() + months);
            expiredDate.setHours(23, 59, 59, 999);

            if (!existed) {
                await StudentBookIdModel.create({
                    user: {
                        id: userID,
                        code: user.code,
                        name: user.fullname,
                    },
                    bookIdCourse: {
                        id: itemID,
                        name: book.name || item.name,
                        code: book.code || item.code,
                    },
                    joined_at: now,
                    activation_date: now,
                    exprired_date: expiredDate,
                    total_extended_months: months,
                    extend_times: 1,
                    deleted_at: null
                });
            } else {
                // Neu da co thi update lai ngay het han neu can? 
                // Hoac chi don gian la de no do. Student thong thuong da mua roi se ko mua nua.
                // Nhung de bao dam thi chung ta update neu da het han.
                if (new Date(existed.exprired_date) < now) {
                    await StudentBookIdModel.updateOne({ _id: existed._id }, {
                        $set: {
                            activation_date: now,
                            exprired_date: expiredDate,
                            total_extended_months: months,
                            extend_times: 1
                        }
                    });
                }
            }

            if (book.combo_mode && book.bookId_attached?.length > 0) {
                const listBookIds = book.bookId_attached.map((id) => id.toString());

                const existing = await StudentBookIdModel.find({
                    "user.id": userID,
                    "bookIdCourse.id": { $in: listBookIds },
                    deleted_at: null
                });

                const existingIds = new Set(
                    existing.map((item) => item.bookIdCourse.id),
                );

                const attachedBooks = await BookIdModel.db.find({
                    _id: { $in: listBookIds },
                    deleted_at: null
                }).lean();

                const insertData = [];
                for (const b of attachedBooks) {
                    const id = b._id.toString();
                    if (!existingIds.has(id)) {
                        insertData.push({
                            user: {
                                id: userID,
                                code: user.code,
                                name: user.fullname,
                            },
                            bookIdCourse: {
                                id,
                                name: b.name,
                                code: b.code,
                            },
                            joined_at: now,
                            deleted_at: null
                        });
                    }
                }

                if (insertData.length) {
                    await StudentBookIdModel.insertMany(insertData);
                }
            }

            await this.updateUserBuyData(order, [item], source);

            return true;
        } catch (err) {
            logError(err);
            console.log(err);
            return false;
        }
    }

    async updateUserToClassroom(item, bill, docBillingItem, oldQTY) {
        try {
            const conditions = {};
            conditions['classroom.id'] = item.id;
            conditions['user.id'] = bill.user.id;
            conditions.deleted_at = null;
            const studentClassroom = await StudentClassroomModel.findOne(conditions);
            if (studentClassroom) {
                const _sobuoihoc = (studentClassroom.sobuoihoc) ? parseFloat(studentClassroom.sobuoihoc) + docBillingItem.qty : docBillingItem.qty
                const _sobuoihocNew = _sobuoihoc - parseFloat(oldQTY);

                const _update = {
                    sobuoihoc: _sobuoihocNew
                };
                try {
                    const _rs = await StudentClassroomModel.updateOne({ _id: studentClassroom.id }, { $set: _update });
                    // if (!_rs.nModified)
                    // console.log('nModified 0:' + studentClassroom.id + '-' + JSON.stringify(_update));
                } catch (err) {
                    // console.log('UPDATE STUDENT CLASS ERR:' + JSON.stringify(err));
                }

            } else {
                const _from = new Date();
                const _fromMonth = _from.getMonth() + 1;
                const _fromDate = _from.getFullYear() + '-' + _fromMonth + '-' + _from.getDate();

                const _to = new Date();
                const _toMonth = _to.getMonth() + 1;
                const _toYear = _to.getFullYear() + 1;
                const _toDate = _toYear + '-' + _toMonth + '-' + _to.getDate();
                const lesson_view_dates = [{
                    from: _fromDate,
                    to: _toDate
                }];

                const docUser = {
                    classroom: { id: item.id, name: item.name, code: item.code },
                    user: bill.user,
                    sobuoihoc: docBillingItem.qty,
                    lesson_view_dates: JSON.stringify(lesson_view_dates),
                    joined_at: new Date(),
                    last_card_updated_at: bill.billed_at || new Date()
                };

                try {
                    const rs = await StudentClassroomModel.create(docUser);
                    if (!rs)
                        return response(res, null, 'Không thêm được học sinh vào lớp. Vui lòng thêm học sinh vào lớp thủ công từ Menu Lớp học!', statusCode.ERROR);
                } catch (err) {
                    logError(err);
                }
            }
        } catch (err) {
            logError(err);
        }
    }

    async exportClassroomCode(classroom, data) {
        try {
            const _data = [];
            const heading = [];
            heading.push('Mã truy cập');
            heading.push('Họ Tên');
            heading.push("Mã HS");
            heading.push("Trạng thái");
            heading.push("Ngày tạo");
            heading.push("Ngày cập nhật");
            _data.push(heading);

            if (data.length > 0) {
                for (let i = 0; i < data.length; i++) {
                    const row = [];
                    row.push(data[i].code);
                    row.push(data[i].user ? data[i].user.name : 'Chưa sử dụng');
                    row.push(data[i].user ? data[i].user.code : 'Chưa sử dụng');
                    row.push(data[i].is_used ? 'Đã sử dụng' : 'Chưa sử dụng');
                    row.push(dateFormat(new Date(data[i].created_at), 'yyyy-mm-dd'));
                    row.push(dateFormat(new Date(data[i].updated_at), 'yyyy-mm-dd'));
                    _data.push(row);
                    // console.log(row[0] + "\t" + row[1] + "\t" + row[2] + "\t" + row[3] + "\t" + row[4] + "\t" + row[5]);
                }
            }

            const name = 'MaTruyCap-' + classroom.name + '-' + new Date().getTime();
            const filename = await ExcelService.exportData(name, _data);
            // console.log(filename);
            if (filename)
                return filename;
        } catch (err) {
            logError(err);
            console.log(err);
        }
        return false;
    }
    async exportBookIdCode(classroom, data) {
        try {
            const _data = [];
            const heading = [];
            heading.push('Mã truy cập');
            heading.push('Họ Tên');
            heading.push("Mã HS");
            heading.push("Trạng thái");
            heading.push("Ngày kích hoạt");
            heading.push("Ngày hết hạn");
            heading.push("Người tạo");
            heading.push("Ngày tạo");
            heading.push("Ngày cập nhật");
            _data.push(heading);

            if (data.length > 0) {
                for (let i = 0; i < data.length; i++) {
                    const row = [];
                    row.push(data[i].code);
                    row.push(data[i].user ? data[i].user.name : 'Chưa sử dụng');
                    row.push(data[i].user ? data[i].user.code : 'Chưa sử dụng');
                    row.push(data[i].is_used ? 'Đã sử dụng' : 'Chưa sử dụng');
                    row.push(data[i].activation_date ? dateFormat(new Date(data[i].activation_date), 'yyyy-mm-dd') : '');
                    row.push(data[i].exprired_date ? dateFormat(new Date(data[i].exprired_date), 'yyyy-mm-dd') : '');
                    row.push(data[i].created_by ? data[i].created_by.name : '');
                    row.push(dateFormat(new Date(data[i].created_at), 'yyyy-mm-dd'));
                    row.push(dateFormat(new Date(data[i].updated_at), 'yyyy-mm-dd'));
                    _data.push(row);
                }
            }

            const name = 'MaTruyCap-' + classroom.alias + '-' + dateFormat(new Date().getTime());
            const filename = await ExcelService.exportData(name, _data);
            console.log(filename);
            if (filename)
                return filename;
        } catch (err) {
            logError(err);
            console.log(err);
        }
        return false;
    }
    async exportClassroomExamPoint(exam, classroom, data) {
        try {
            const _data = [];
            if (data.length > 0) {
                for (let i = 0; i < data.length; i++) {
                    const row = [];
                    row.push(data[i].classroom.name);
                    row.push(data[i].exam.name);
                    row.push(data[i].exam.code);
                    row.push(data[i].user.name);
                    row.push(data[i].user.code);
                    row.push(data[i].point);
                    row.push(data[i].created_at);
                    _data.push(row);
                }
            }

            const name = 'BangDiem-' + exam.code;
            const filename = await ExcelService.exportData(name, _data);
            if (filename)
                return filename;
        } catch (err) {
            logError(err);
        }
        return false;
    }

    async checkUserOnClassroom(user, classroomID, _classroom) {
        try {
            if (user.user_group !== appConfig.USER_GROUP.STUDENT)
                return true;
            const isOnlineClass = false;
            if (!_classroom) {
                const classroom = await ClassroomModel.findOne({ _id: classroomID });
                if (classroom)
                    isOnlineClass = classroom.is_online;
            } else {
                isOnlineClass = _classroom.is_online;
            }

            if (isOnlineClass)
                return true;

            const conditions = {};
            conditions['user.id'] = user.user_id;
            conditions['classroom.id'] = classroomID;
            conditions.deleted_at = null;
            const userClassroom = await StudentClassroomModel.findOne(conditions);
            if (!userClassroom)
                return false;
            if (userClassroom.sobuoihoc && userClassroom.buoidahoc) {
                const date = new Date();
                if (parseInt(userClassroom.sobuoihoc) === parseInt(userClassroom.buoidahoc) && date.getHours() >= 23)
                    return false;
                if (parseInt(userClassroom.buoidahoc) > parseInt(userClassroom.sobuoihoc))
                    return false;
            }

            return true;
        } catch (err) {
            return true;
        }
    }

    async exportMemberClassroom(_data) {
        try {
            const data = [];
            const heading = [];
            heading.push('Mã HS');
            heading.push('Họ Tên');
            heading.push("SĐT");
            heading.push("SĐT Phụ Huynh");
            heading.push("Tổng bài thi");
            heading.push("Tổng số buổi");
            heading.push("Số buổi đã học");
            heading.push("Số buổi còn lại");
            heading.push("Trạng thái");
            heading.push("Thời gian tham gia");
            data.push(heading);

            for (let i = 0; i < _data.length; i++) {
                const item = _data[i];
                let _item = [];
                _item.push(item.code);
                _item.push(item.fullname);
                _item.push(item.phone);
                _item.push(item.parent_phone);
                _item.push(item.total_testing);
                _item.push(item.sobuoihoc);
                _item.push(item.buoidahoc);
                _item.push(parseInt(item.sobuoihoc) - parseInt(item.buoidahoc));

                let status = '';
                const currentTime = new Date();
                if (item.last_card_updated_at) {
                    let timeLastCart = new Date(item.last_card_updated_at);
                    let miliSeconds = currentTime.getTime() - timeLastCart.getTime();
                    let _days = Math.floor(miliSeconds / (24 * 60 * 60 * 1000));
                    if (_days > 0 && _days <= 10) {
                        status = 'Sắp hết thẻ';
                    } else if (_days > 30) {
                        status = 'Đã nghỉ học';
                    }
                } else if (item.joined_at) {
                    let timeJoinedAt = new Date(item.joined_at);
                    let miliSeconds = currentTime.getTime() - timeJoinedAt.getTime();
                    let _days = Math.floor(miliSeconds / (24 * 60 * 60 * 1000));
                    if (_days > 0 && _days <= 10) {
                        status = 'Sắp hết thẻ';
                    } else if (_days > 30) {
                        status = 'Đã nghỉ học';
                    }
                }

                _item.push(status);
                _item.push(item.joined_at);
                data.push(_item);
            }

            const name = 'HS_Lop-' + new Date().getTime();
            const filename = await ExcelService.exportData(name, data);
            if (filename)
                return filename;
        } catch (err) {
            console.log(err);
            logError(err);
        }
        return false;
    }

    async exportClassroomAttendTotal(_data) {
        try {
            const data = [];
            const heading = [];
            heading.push('Lớp');
            heading.push('Sĩ số');
            heading.push("Môn");
            heading.push("HS đi học");
            heading.push("HS nghỉ học");
            heading.push("HS mới làm thẻ");
            data.push(heading);
            for (let i = 0; i < _data.length; i++) {
                const item = _data[i];
                let _item = [];
                _item.push(item.name);
                _item.push(item.siso);
                _item.push(item.subject.name || '');
                _item.push(item.hs_dihoc);
                _item.push(item.hs_nghihoc);
                data.push(_item);
            }

            const name = 'Chuyencan-' + new Date().getTime();
            const filename = await ExcelService.exportData(name, data);
            if (filename)
                return filename;
        } catch (err) {
            console.log(err);
            logError(err);
        }
        return false;
    }
    async exportMemberBookId(_data) {
        try {
            const data = [];
            const heading = [];
            heading.push('Mã HS');
            heading.push('Họ Tên');
            heading.push("SĐT");
            heading.push("SĐT Phụ Huynh");
            heading.push("Trạng thái");
            heading.push("Ngày hết hạn");
            heading.push("Ngày kích hoạt");
            heading.push("Thời gian tham gia");
            data.push(heading);

            for (let i = 0; i < _data.length; i++) {
                const item = _data[i];
                let _item = [];
                _item.push(item.code);
                _item.push(item.fullname);
                _item.push(item.phone);
                _item.push(item.parent_phone);
                let status = '';
                if (moment(item.exprired_date).isAfter(moment())) {
                    status = "Đang sử dụng";
                } else {
                    status = "Đã hết hạn";
                }

                _item.push(status);
                _item.push(item.exprired_date ? dateFormat(new Date(item.exprired_date), 'yyyy-mm-dd') : '');
                _item.push(item.activation_date ? dateFormat(new Date(item.activation_date), 'yyyy-mm-dd') : '');
                _item.push(item.joined_at);
                data.push(_item);
            }

            const name = 'HS_Lop-' + new Date().getTime();
            const filename = await ExcelService.exportData(name, data);
            if (filename)
                return filename;
        } catch (err) {
            console.log(err);
            logError(err);
        }
        return false;
    }
    async exportClassroomAttendDetail(dataInput, classroom) {
        try {

            const {
                attendedUsers,
                classroomUsers,
                newUserIds,
                users,
                attendedUserID
            } = dataInput;

            const data = [];
            const heading = [];

            heading.push('Học sinh');
            heading.push("Mã HS");
            heading.push("SĐT");
            heading.push("SDT phụ huynh");
            heading.push('Lớp');
            heading.push("Thời gian vào lớp");
            heading.push("Ngày tham gia");
            heading.push("Tổng số buổi");
            heading.push("Số buổi đã học");
            heading.push("Số buổi còn lại");
            heading.push("Trạng thái");
            heading.push("Học sinh mới");
            data.push(heading);
            const dataUser = {};
            for (let i = 0; i < users.length; i++) {
                dataUser[users[i]._id] = users[i];
            }

            const dataUserClassroom = {};
            for (let i = 0; i < classroomUsers.length; i++) {
                dataUserClassroom[classroomUsers[i].user.id] = classroomUsers[i];
            }

            for (let i = 0; i < attendedUsers.length; i++) {
                const item = attendedUsers[i];
                let _item = [];
                _item.push(dataUser[item.user.id] ? dataUser[item.user.id].fullname : '');
                _item.push(dataUser[item.user.id] ? dataUser[item.user.id].code : '');
                _item.push(dataUser[item.user.id] ? dataUser[item.user.id].phone : '');
                _item.push(dataUser[item.user.id] ? dataUser[item.user.id].parent_phone : '');
                _item.push(item.classroom.name);
                _item.push(item.attended_date);

                const sobuoidahoc = dataUserClassroom[item.user.id] ? dataUserClassroom[item.user.id].buoidahoc || 0 : 0;
                const sobuoihoc = dataUserClassroom[item.user.id] ? dataUserClassroom[item.user.id].sobuoihoc || 0 : 0;
                const sobuoiconlai = parseInt(sobuoihoc) - parseInt(sobuoidahoc);

                _item.push(dataUserClassroom[item.user.id] ? dataUserClassroom[item.user.id].created_at : '');
                _item.push(sobuoihoc);
                _item.push(sobuoidahoc);
                _item.push(sobuoiconlai);
                _item.push("Đi học");
                let hsmoi = '';
                if (newUserIds.indexOf(item.user.id) > 0)
                    hsmoi = 'HS mới';
                _item.push(hsmoi);
                data.push(_item);
            }

            for (let i = 0; i < users.length; i++) {
                const user = users[i];
                let _item = [];
                if (attendedUserID.indexOf(users[i]._id) < 0) {
                    _item.push(user.fullname);
                    _item.push(user.code);
                    _item.push(user.phone);
                    _item.push(user.parent_phone);
                    _item.push(classroom.name);
                    _item.push("");

                    const sobuoidahoc = dataUserClassroom[user._id] ? dataUserClassroom[user._id].buoidahoc || 0 : 0;
                    const sobuoihoc = dataUserClassroom[user._id] ? dataUserClassroom[user._id].sobuoihoc || 0 : 0;
                    const sobuoiconlai = parseInt(sobuoihoc) - parseInt(sobuoidahoc);

                    _item.push(dataUserClassroom[user._id] ? dataUserClassroom[user._id].created_at : '');
                    _item.push(sobuoihoc);
                    _item.push(sobuoidahoc);
                    _item.push(sobuoiconlai);
                    _item.push("Nghỉ học");
                    let hsmoi = '';
                    if (newUserIds.indexOf(user._id) > 0)
                        hsmoi = 'HS mới';
                    _item.push(hsmoi);
                    data.push(_item);
                }
            }

            const name = 'Chuyencan-Lop' + classroom.code + '-' + new Date().getTime();
            const filename = await ExcelService.exportData(name, data);
            if (filename)
                return filename;
        } catch (err) {
            console.log(err);
            logError(err);
        }
        return false;
    }
}

module.exports = new ClassroomService();