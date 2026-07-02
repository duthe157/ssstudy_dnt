const appConfig = require("../../config/app");
const BaseHelper = require("../helpers/BaseHelper");
const BookIdModel = require("../models/BookId");
const ClassroomGroupModel = require("../models/ClassroomGroup");
const ChapterClassroomModel = require("../models/ChapterClassroom");
const ChapterModel = require("../models/Chapter");
const CategoryModel = require("../models/Category");
const CategoryClassroomModel = require("../models/CategoryClassroom");
const BookIdCodeModel = require("../models/BookIdCode");
const SubjectModel = require("../models/Subject");
const UserBookIdModel = require("../models/StudentBookId");
const mongoose = require('mongoose');
const StudentClassroomModel = require("../models/StudentClassroom");
const ExamClassroomModel = require("../models/ExamClassroom");
const StudentBookIdModel = require("../models/StudentBookId");
const BookReviewModel = require("../models/BookReview");
const BookIdCourseModel = require("../models/BookIdCourse");
const UserModel = require("../models/User");
const UploadService = require("../services/UploadService");
const language = BaseHelper.fileToJSON(`${__dirname}/../languages/vi.json`);

async function syncLabelNumItem(labelId) {
    const count = await LabelItemModel.count({ label_id: labelId });
    await LabelModel.updateOne({ _id: labelId }, { $set: { num_item: count } });
}

const randomize = require("randomatic");
const fs = require("fs");
const AppService = require("../services/AppService");
const ClassroomService = require("../services/ClassroomService");
const {
  Document,
  Packer,
  Paragraph,
  HeadingLevel,
  AlignmentType,
  TableOfContents,
} = require("docx");
const { map } = require("lodash");
const QuestionWordModel = require("../models/QuestionWord");
const ExamWord = require("../models/ExamWord");
const LabelModel = require('../models/Label');
const LabelItemModel = require('../models/LabelItem');

function removeSpacesAndSpecialChars(str) {
  console.log("first", str);
  str.replace(/[^a-zA-Z ]/g, "");
  str.replace(/[^\w\s]/gi, "");
  console.log("last", str);
  if (str == "") return "NOT_FOUND_999999";
  return str;
}
async function buildBookStructure(bookID) {
  const book = await BookIdModel.db.findOne({ _id: bookID }).lean();
  if (!book || book.deleted_at) return [];

  const classroomID = book.classroom_attached?.[0];
  if (!classroomID) return [];

  const bookCourse = await BookIdCourseModel.db.findOne({
    _id: classroomID,
    deleted_at: null,
  }).lean();

  if (!bookCourse) return [];

  // ===== 2. LOAD SONG SONG =====
  const classroomChapters = await ChapterClassroomModel.db
    .find({ classroom_id: classroomID })
    .sort({ ordering: 1, created_at: 1 })
    .lean();

  const chapterIds = classroomChapters.map(c => c.chapter.id);

  const [chapters, categories] = await Promise.all([
    ChapterModel.db.find({ _id: { $in: chapterIds } })
      .sort({ ordering: 1 })
      .lean(),

    CategoryModel.db.find({
      deleted_at: null,
      "chapter.id": { $in: chapterIds }
    }).lean()
  ]);

  // ===== 3. PREPARE MAP =====

  const chapterMap = {};
  chapters.forEach(c => {
    chapterMap[c._id.toString()] = c;
  });

  const classroomChapterMap = {};
  const subjectToGroup = {};
  let groupIndex = 1;

  for (const cc of classroomChapters) {
    const chapId = cc.chapter.id;

    if (cc.selected_subject_id && !subjectToGroup[cc.selected_subject_id]) {
      subjectToGroup[cc.selected_subject_id] = groupIndex++;
    }

    const groupId =
      cc.group_id ||
      subjectToGroup[cc.selected_subject_id] ||
      1;

    classroomChapterMap[chapId] = {
      ...cc,
      group_id: groupId,
    };
  }


  const categoryMap = {};
  const examIds = [];

  for (const cat of categories) {
    const chapId = cat.chapter?.id;
    if (!chapId) continue;

    if (!categoryMap[chapId]) categoryMap[chapId] = [];

    if (cat.exam?.id) examIds.push(cat.exam.id);

    categoryMap[chapId].push(cat);
  }

  // ===== 5. LOAD EXTRA =====

  const categoryIds = categories.map(c => c._id);

  const [classroomCategories, examClassrooms] = await Promise.all([
    CategoryClassroomModel.db.find({
      classroom_id: classroomID,
      "category.id": { $in: categoryIds }
    }).lean(),

    ExamClassroomModel.db.find({
      exam_id: { $in: examIds },
      "classroom.id": classroomID
    }).lean()
  ]);

  const classroomCategoryMap = {};
  classroomCategories.forEach(i => {
    classroomCategoryMap[i.category.id] = i;
  });

  const examMap = {};
  examClassrooms.forEach(i => {
    examMap[i.exam_id] = i;
  });

  // ===== 6. BUILD CHAPTER FULL =====

  const chaptersFull = [];

  for (const chapId of chapterIds) {
    const chap = chapterMap[chapId];
    if (!chap) continue;

    const cc = classroomChapterMap[chapId] || {};

    const lessonsRaw = categoryMap[chapId] || [];

    const lessons = lessonsRaw.map(lesson => {
      const classroomCat = classroomCategoryMap[lesson._id.toString()];

      let exam_started_at = null;
      let exam_finished_at = null;
      let is_fixed_time = false;

      if (lesson.exam?.id) {
        const exam = examMap[lesson.exam.id];
        if (exam) {
          exam_started_at = exam.started_at;
          exam_finished_at = exam.finished_at;
          is_fixed_time = exam.is_fixed_time;
        }
      }

      return {
        ...lesson,
        code: classroomCat?.code || lesson.code,
        publish_at: classroomCat?.publish_at || null,
        exam_started_at,
        exam_finished_at,
        is_fixed_time,
        exam_id: lesson.exam?.id || null,
      };
    });

    chaptersFull.push({
      ...chap,
      code: cc.code || chap.code,
      selected_subject_id: cc.selected_subject_id || null,
      group_id: cc.group_id || 1,
      lessons,
    });
  }

  const groupMap = {};
  let globalCode = Number(book.book_id) + 1;

  for (const chapter of chaptersFull) {
    const groupId = chapter.group_id || 1;

    if (!groupMap[groupId]) {
      const group = bookCourse.group_chapter?.find(g => g.id === groupId);

      groupMap[groupId] = {
        name: group?.title || `Nhóm ${groupId}`,
        items: [],
      };
    }

    const chapterItem = {
      name: chapter.name,
      count: `${chapter.lessons.length} bài`,
      children: [],
    };

    for (const lesson of chapter.lessons) {
      const lessonCode = globalCode++;

      const examList = Array.isArray(lesson.exam)
        ? lesson.exam
        : lesson.exam ? [lesson.exam] : [];

      const exercises = examList.map(ex => ({
        id: ex.id,
        name: ex.name,
        code: globalCode++,
        type: ex.type,
      }));

      chapterItem.children.push({
        name: lesson.name,
        code: lessonCode,
        count: lesson.exam?.total_question
          ? `${lesson.exam.total_question} câu`
          : "",
        exercises,
      });
    }

    groupMap[groupId].items.push(chapterItem);
  }

  return Object.values(groupMap);
}
class BookIdController {
  async search(req, res, params) {
    try {
      const keyword = params.keyword?.trim();
      if (!keyword) {
        return response(res, null, language.PROCESS_ERROR, statusCode.ERROR);
      }

      const now = new Date();
      const bookCode = keyword.slice(0, -3) + "000";
      const subCode = keyword.slice(-3);

      const isStudent = req.user?.user_group === "STUDENT";

      let userBookMap = {};
      let userClassroomMap = {};
      if (isStudent) {
        const [userBooks, userClassrooms] = await Promise.all([
          StudentBookIdModel.db
            .find({
              "user.id": req.user.user_id,
              deleted_at: null,
            })
            .select("bookIdCourse.id exprired_date")
            .lean(),
          StudentClassroomModel.db
            .find({
              "user.id": req.user.user_id,
              deleted_at: null,
            })
            .select("classroom.id")
            .lean(),
        ]);

        for (const ub of userBooks) {
          const id = String(ub.bookIdCourse?.id);
          if (!id) continue;

          const expired = ub.exprired_date
            ? new Date(ub.exprired_date) < now
            : false;

          userBookMap[id] = { expired };
        }

        for (const uc of userClassrooms) {
          const classroomId = String(uc.classroom?.id);
          if (classroomId) {
            userClassroomMap[classroomId] = true;
          }
        }
      }

      const isAllowed = (bookId) =>
        !isStudent || userBookMap[String(bookId)];

      const isActive = (bookId) =>
        !isStudent || (userBookMap[String(bookId)] && !userBookMap[String(bookId)].expired);

      const book = await BookIdModel.db
        .findOne({
          deleted_at: null,
          book_id: { $in: [keyword, bookCode] },
        })
        .select("_id book_id classroom_attached")
        .lean();

      if (book && book.book_id === keyword) {
        if (!isAllowed(book._id)) {
          return response(res, null, "Chưa kích hoạt", statusCode.ERROR);
        }

        return response(res, {
          type: "book_id",
          book_id: book._id,
          course_id: book.classroom_attached?.[0],
        }, "OK", statusCode.OK);
      }

      if (book) {
        if (!isAllowed(book._id)) {
          return response(res, null, "Chưa kích hoạt", statusCode.ERROR);
        }

        if (!isActive(book._id)) {
          return response(res, null, "Đã hết hạn", statusCode.ERROR);
        }

        const groups = await buildBookStructure(book._id);
        console.log("groups", JSON.stringify(groups, null, 2));
        for (const group of groups) {
          for (const chapter of group.items) {
            for (const lesson of chapter.children) {
              if (String(lesson.code).endsWith(subCode)) {
                return response(res, {
                  type: "category",
                  data: lesson,
                  book_id: book._id,
                  course_id: book.classroom_attached[0],
                }, "OK", statusCode.OK);
              }

              const ex = lesson.exercises?.find(e =>
                String(e.code).endsWith(subCode)
              );

              if (ex) {
                return response(res, {
                  type: "exam",
                  data: ex,
                  book_id: book._id,
                  course_id: book.classroom_attached[0],
                }, "OK", statusCode.OK);
              }
            }
          }
        }
      }

      const question = await QuestionWordModel.model.db
        .findOne({ searchId: keyword })
        .select("_id")
        .lean();

      // Tìm kiếm theo search_id trong ExamWord (A1, A2, ...) - case insensitive
      const examBySearchId = !question ? await ExamWord.db
        .findOne({
          deleted_at: null,
          search_id: { $regex: `^${keyword}$`, $options: "i" },
        })
        .select("_id , group")
        .lean() : null;

      if (examBySearchId) {
        if (isStudent) {
          const categories = await CategoryModel.db
            .find({
              deleted_at: null,
              "exam.id": String(examBySearchId._id),
            })
            .select("chapter.id")
            .lean();

          const chapterIds = categories.map(c => c.chapter?.id).filter(Boolean);

          const chapterClassrooms = await ChapterClassroomModel.db
            .find({
              "chapter.id": { $in: chapterIds },
            })
            .select("classroom_id")
            .lean();

          const courseIds = [...new Set(
            chapterClassrooms.map(c => c.classroom_id)
          )];

          const books = await BookIdModel.db
            .find({
              classroom_attached: { $in: courseIds.map(String) },
              deleted_at: null,
            })
            .select("_id")
            .lean();

          const hasClassroomAccess = courseIds.some(cid => userClassroomMap[String(cid)]);

          let hasActive = false;
          let hasExpired = false;
          let hasBookAccess = false;

          for (const b of books) {
            const perm = userBookMap[String(b._id)];
            if (perm) {
              hasBookAccess = true;
              if (!perm.expired) {
                hasActive = true;
                break;
              } else {
                hasExpired = true;
              }
            }
          }

          if (!hasActive && !hasClassroomAccess && !hasBookAccess) {
            return response(
              res,
              null,
              hasExpired ? "Đã hết hạn" : "Chưa sở hữu",
              statusCode.ERROR
            );
          }
        }
console.log("examBySearchId", examBySearchId);
        return response(res, {
          type: "exam",
          data: {
            id: examBySearchId._id,
            type: examBySearchId.group === "SACH_ID" ? "SACH_ID" : "WORD",
          },
        }, "OK", statusCode.OK);
      }

      if (!question) {
        return response(res, null, "Không tìm thấy", statusCode.ERROR);
      }
      const questionId = new mongoose.Types.ObjectId(question._id);

      const exam = await ExamWord.db
        .findOne({
          deleted_at: null,
          "parts.subpart.children.questions.question": questionId,
        })
        .select("_id")
        .lean();
      if (!exam) {
        return response(res, null, "Không tìm thấy", statusCode.ERROR);
      }

      if (isStudent) {
        const categories = await CategoryModel.db
          .find({
            deleted_at: null,
            "exam.id": String(exam._id),
          })
          .select("chapter.id")
          .lean();

        const chapterIds = categories.map(c => c.chapter?.id).filter(Boolean);

        const chapterClassrooms = await ChapterClassroomModel.db
          .find({
            "chapter.id": { $in: chapterIds },
          })
          .select("classroom_id")
          .lean();

        const courseIds = [...new Set(
          chapterClassrooms.map(c => c.classroom_id)
        )];

        const books = await BookIdModel.db
          .find({
            classroom_attached: { $in: courseIds.map(String) },
            deleted_at: null,
          })
          .select("_id")
          .lean();

        const hasClassroomAccess = courseIds.some(cid => userClassroomMap[String(cid)]);

        let hasActive = false;
        let hasExpired = false;
        let hasBookAccess = false;

        for (const b of books) {
          const perm = userBookMap[String(b._id)];
          if (perm) {
            hasBookAccess = true;
            if (!perm.expired) {
              hasActive = true;
              break;
            } else {
              hasExpired = true;
            }
          }
        }

        if (!hasActive && !hasClassroomAccess && !hasBookAccess) {
          return response(
            res,
            null,
            hasExpired ? "Đã hết hạn" : "Chưa sở hữu",
            statusCode.ERROR
          );
        }
      }

      return response(res, {
        type: "question",
        id: question._id,
      }, "OK", statusCode.OK);

    } catch (err) {
      logError(err);
      console.error(err);
      return response(res, null, language.PROCESS_ERROR, statusCode.ERROR);
    }
  }
  async list(req, res, params) {
    try {
      const keyword = params.keyword || false;
      const page = parseInt(params.page || appConfig.PAGINATION.PAGE);
      const limit = parseInt(params.limit || appConfig.PAGINATION.LIMIT);
      const subjectID = params.subject_id || null;
      const categoryID = params.category_id || null;
      const isFeatured = params.is_featured;
      const teacherID = params.teacher_id || null;
      const level = params.level || false;
      const conditions = { deleted_at: null };
      const combo_mode = params.combo_mode;

      const options = {
        sort: { created_at: -1 },
      };

      if (limit != -1) {
        options.skip = (page - 1) * limit;
        options.limit = limit;
      }

      const sortKey = params.sort_key || null;
      const sortValue = params.sort_value || null;
      if (sortKey && (sortValue == 1 || sortValue == -1)) {
        options.sort = {};
        options.sort[sortKey] = sortValue;
      }
      if (keyword) {
        const parserKeyword = keyword.replace(
          /[-[\]{}()*+?.,\\^$|#\s]/g,
          "\\$&",
        );
        conditions.name = { $regex: parserKeyword, $options: "i" };
      }
      if (subjectID) conditions["subject.id"] = subjectID;

      if (level) conditions.level = level;

      if (isFeatured !== undefined) conditions.is_featured = isFeatured;

      if (teacherID) conditions.teacher_id = teacherID;
      if (combo_mode !== undefined) conditions.combo_mode = combo_mode;
      // if (req.user.user_group === appConfig.USER_GROUP.TEACHER || req.user.user_group === appConfig.USER_GROUP.SUPPORTER) {
      //     conditions['subject.id'] = no $in: req.user.subject_ids };
      // }

      if (categoryID)
        if (Array.isArray(categoryID)) {
          conditions.$or = [];
          for (let i = 0; i < categoryID.length; i++) {
            conditions.$or.push({ "category.id": categoryID[i] });
          }
        } else {
          conditions["category.id"] = categoryID;
        }

      const labelId = params.label_id || null;
      if (labelId) {
        const childLabels = await LabelModel.find({ parent_id: labelId, deleted_at: null }, { _id: 1 });
        const labelIds = [labelId, ...childLabels.map(c => c._id.toString())];
        const assignedItemIds = await LabelItemModel.distinct('item_id', { label_id: { $in: labelIds }, item_type: 'BOOK_ID' });
        conditions._id = { $in: assignedItemIds };
      }

      const records = await BookIdModel.find(conditions, null, options);
      const total = await BookIdModel.count(conditions);
      const data = {
        records,
        totalRecord: total,
        perPage: limit,
      };
      return response(res, data, "Thành công", statusCode.OK);
    } catch (err) {
      logError(err);
      console.log(err);
      return response(res, null, language.PROCESS_ERROR, statusCode.ERROR);
    }
  }
  async listPublic(req, res, params) {
    try {
      const keyword = params.keyword || false;
      const page = parseInt(params.page || appConfig.PAGINATION.PAGE);
      const limit = parseInt(params.limit || appConfig.PAGINATION.LIMIT);
      const subjectID = params.subject_id || null;
      const price = params.price;
      const categoryID = params.category_id || null;
      const isFeatured = params.is_featured;
      const teacherID = params.teacher_id || null;
      const level = params.level || false;
      const type = params.type;
      const sortKey = params.sort_key || null;
      const sortValue = parseInt(params.sort_value) || -1;

      const now = new Date();

      let conditions = {
        deleted_at: null,
        status: true,
      };

      // ===== KEYWORD =====
      if (keyword) {
        const parserKeyword = keyword.replace(
          /[-[\]{}()*+?.,\\^$|#\s]/g,
          "\\$&",
        );
        conditions.name = { $regex: parserKeyword, $options: "i" };
      }

      // ===== FILTER =====
      if (subjectID) conditions["subject.id"] = subjectID;
      if (level) conditions.level = level;
      if (teacherID) conditions.teacher_id = teacherID;
      if (isFeatured !== undefined) conditions.is_featured = isFeatured;

      // ===== CATEGORY =====
      if (categoryID) {
        if (Array.isArray(categoryID)) {
          conditions["category.id"] = { $in: categoryID };
        } else {
          conditions["category.id"] = categoryID;
        }
      }

      if (price) {
        let fromPrice = null;
        let toPrice = null;

        if (Array.isArray(price)) {
          const priceArray = [];

          for (let p of price) {
            const [from, to] = p.split("-").map(Number);
            priceArray.push(from, to);
          }

          const minPrice = Math.min(...priceArray);
          const maxPrice = Math.max(...priceArray);

          conditions.price = {
            $gte: minPrice,
            $lte: maxPrice,
          };
        } else {
          const [from, to] = price.split("-").map(Number);
          conditions.price = {
            $gte: from,
            $lte: to,
          };
        }
      }

      // ===== TYPE FILTER =====
      if (type === "PROMOTION") {
        // conditions["promotion.type"] = "PROMOTION";
        // conditions["promotion.from_date"] = { $lte: now };
        // conditions["promotion.to_date"] = { $gte: now };
        sortKey === "discount_percent";
      }

      if (type === "HOT") {
        conditions.is_featured = true;
      }

      // ===== LABEL FILTER =====
      const labelId = params.label_id || null;
            if (labelId) {
        const childLabels = await LabelModel.find({ parent_id: labelId, deleted_at: null }, { _id: 1 });
        const labelIds = [labelId, ...childLabels.map(c => c._id.toString())];
        const assignedItemIds = await LabelItemModel.distinct('item_id', { label_id: { $in: labelIds }, item_type: 'BOOK_ID' });
        conditions._id = { $in: assignedItemIds.map(id => new mongoose.Types.ObjectId(id)) };
      }

      const pipeline = [];
      pipeline.push({ $match: conditions });

      pipeline.push({
        $addFields: {
          discount_percent: {
            $cond: [
              { $gt: ["$origin_price", 0] },
              {
                $divide: [
                  { $subtract: ["$origin_price", "$price"] },
                  "$origin_price",
                ],
              },
              0,
            ],
          },
        },
      });

      if (sortKey === "discount_percent") {
        pipeline.push({
          $sort: { discount_percent: sortValue },
        });
      } else if (sortKey) {
        pipeline.push({
          $sort: { [sortKey]: sortValue },
        });
      } else {
        pipeline.push({
          $sort: { created_at: -1 },
        });
      }

      // PAGINATION
      if (limit != -1) {
        pipeline.push({ $skip: (page - 1) * limit });
        pipeline.push({ $limit: limit });
      }

      // QUERY
      const records = await BookIdModel.aggregate(pipeline);

      // COUNT
      const totalAgg = await BookIdModel.aggregate([
        { $match: conditions },
        { $count: "total" },
      ]);

      const total = totalAgg[0]?.total || 0;

      const data = {
        records,
        totalRecord: total,
        perPage: limit,
      };

      return response(res, data, "Thành công", statusCode.OK);
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
      // const subjectID = params.subject_id || null;
      const bookID = params.book_id || null;
      const categoryID = params.category_id || null;
      const level = params.level || false;
      const conditions = { deleted_at: null, status: true };

      const options = {
        sort: { created_at: -1 },
      };

      if (limit != -1) {
        options.skip = (page - 1) * limit;
        options.limit = limit;
      }

      if (level) conditions.level = level;

      if (categoryID)
        if (Array.isArray(categoryID)) {
          conditions.$or = [];
          for (let i = 0; i < categoryID.length; i++) {
            conditions.$or.push({ "category.id": categoryID[i] });
          }
        } else {
          conditions["category.id"] = categoryID;
        }
      if (bookID) {
        conditions._id = { $ne: bookID };
      }
      const records = await BookIdModel.db
        .find(conditions, null, options)
        .lean();
      const teacherIds = records.map(b => b.teacher_id).filter(Boolean);

      const teachers = await UserModel.db.find({
        _id: { $in: teacherIds }
      }).lean();

      const teacherMap = {};
      teachers.forEach(t => teacherMap[t._id] = t);

      for (const book of records) {
        book.teacher = teacherMap[book.teacher_id] || null;
      }
      const total = await BookIdModel.count(conditions);
      const data = {
        records,
        totalRecord: total,
        perPage: limit,
      };
      return response(res, data, "Thành công", statusCode.OK);
    } catch (err) {
      logError(err);
      console.log(err);
      return response(res, null, language.PROCESS_ERROR, statusCode.ERROR);
    }
  }
  async detail(req, res, params) {
    try {
      const { id } = params;

      const conditions = { _id: id };
      let rs = await BookIdModel.db.findOne(conditions).lean();
      let isBought = false;
      let detail = null;
      if (req.user) {
        const num = await UserBookIdModel.findOne({
          "user.id": req.user.user_id,
          "bookIdCourse.id": id,
        });
        if (num) {
          ((detail = num), (isBought = true));
        }
      }
      if (rs.teacher_id != null) {
        const teacher = await UserModel.db.find({ _id: rs.teacher_id });
        rs.teacher = teacher;
      }
      let classroomAttached = [];
      if (rs.classroom_attached && rs.classroom_attached.length > 0)
        classroomAttached = await BookIdCourseModel.find({
          _id: { $in: rs.classroom_attached },
          deleted_at: null,
        });

      let bookRelates = [];
      if (rs.book_relates && rs.book_relates.length > 0)
        bookRelates = await BookIdModel.find({
          _id: { $in: rs.book_relates },
          deleted_at: null,
        });
      return response(
        res,
        {
          book: rs,
          classroomAttached,
          bookRelates,
          is_bought: isBought,
          detail: detail,
        },
        "Thành công",
        statusCode.OK,
      );
    } catch (err) {
      logError(err);
      console.log(err);
      return response(res, null, language.PROCESS_ERROR, statusCode.ERROR);
    }
  }

  async create(req, res, params) {
    try {
      const { name, content, files, description } = params;
      const bookID = params.book_id || null;
      const subjectID = params.subject_id || null;
      const categoryID = params.category_id || null;
      const code = params.code || null;
      const demo_link = params.demo_link || null;
      const price = params.price || 0;
      const originPrice = params.origin_price || 0;
      let status = params.status || false;
      const ordering = params.ordering || 1;
      const stockStatus = params.stock_status || "IN_STOCK";
      const isFeatured = params.is_featured || false;

      const combo_mode = params.combo_mode || false;
      const bookId_attached = params.bookId_attached || [];
      const renewed_bookId = params.renewed_bookId || null;
      const publish_mode = params.publish_mode || false;
      const publish_end_date = params.publish_end_date || null;

      const classroomAttached = params.classroom_attached || [];
      const teacherID = params.teacher_id || null;
      const promotion = params.promotion || null;
      const level = params.level || null;
      const quantity = params.quantity || null;
      const includes = params.includes || null;
      const highlightInformations = params.highlightInformations;
      const student_owned = params.student_owned || 0;
      const suspension_date = params.suspension_date || null;
      if (!name)
        return response(
          res,
          null,
          language.CANNOT_EMPTY.replace("%s", language.NAME),
          statusCode.ERROR,
        );

      if (!subjectID)
        return response(
          res,
          null,
          language.CANNOT_EMPTY.replace("%s", language.SUBJECT),
          statusCode.ERROR,
        );

      const subject = await SubjectModel.findOne({ _id: subjectID });
      if (!subject)
        return response(
          res,
          null,
          language.ITEM_NOT_EXIST.replace("%s", language.SUBJECT),
          statusCode.ERROR,
        );

      if (!categoryID)
        return response(
          res,
          null,
          language.CANNOT_EMPTY.replace("%s", "Danh mục sách"),
          statusCode.ERROR,
        );

      const category = await ClassroomGroupModel.findOne({ _id: categoryID });
      if (!category)
        return response(
          res,
          null,
          language.ITEM_NOT_EXIST.replace("%s", "Danh mục sách"),
          statusCode.ERROR,
        );

      if (!teacherID)
        return response(
          res,
          null,
          language.CANNOT_EMPTY.replace("%s", "Giáo viên"),
          statusCode.ERROR,
        );
      let newBookId = null;
      if (bookID) {
        const exist = await BookIdModel.findOne({ book_id: bookID });
        if (exist)
          return response(
            res,
            null,
            "Mã sách đã tồn tại, vui lòng thử lại!",
            statusCode.ERROR,
          );
        newBookId = bookID;
      } else {
        const latest = await BookIdModel.db
          .findOne({})
          .sort({ _id: -1 })
          .lean();
        let nextX = 1000;
        if (latest?.book_id) {
          const x = parseInt(latest.book_id, 10);
          if (!isNaN(x)) nextX = x + 1000;
        }
        newBookId = `${nextX}`;
      }
      if (classroomAttached) {
        const chapter = await ChapterClassroomModel.findOne({
          classroom_id: classroomAttached[0],
        });
      }

      const alias = BaseHelper.seoURL(name.trim());
      const suspensionDate = new Date(suspension_date);
      const now = new Date();

      if (suspensionDate < now && suspension_date) {
        status = false;
      }
      const _doc = {
        book_id: newBookId,
        name,
        alias,
        code,
        subject: { id: subject.id, name: subject.name },
        category: { id: category._id, name: category.name },
        demo_link: demo_link,
        description,
        content,
        origin_price: parseFloat(originPrice),
        price: parseFloat(price),
        combo_mode,
        bookId_attached,
        renewed_bookId,
        publish_mode,
        publish_end_date,
        ordering,
        level,
        teacher_id: teacherID,
        stock_status: stockStatus,
        is_featured: isFeatured,
        classroom_attached: classroomAttached,
        promotion,
        status,
        quantity: quantity ? parseInt(quantity) : 0,
        includes: includes,
        highlightInformations: highlightInformations,
        student_owned: student_owned,
        suspension_date: suspension_date,
      };

      if (files && files.length > 0) {
        const fileData = await UploadService.upload(files[0], "base64", "book");
        if (fileData) {
          _doc.image = appConfig.FILE_DOMAIN + "/" + fileData[0];
        }
      }

      const book = await BookIdModel.create(_doc);
      if (!book) return response(res, {}, language.ERROR, statusCode.ERROR);

      return response(res, book, "Thành công", statusCode.OK);
    } catch (err) {
      logError(err);
      console.log(err);
      return response(res, {}, language.PROCESS_ERROR, statusCode.ERROR);
    }
  }

  async update(req, res, params) {
    try {
      const { id, name, content, files, description } = params;

      if (!id)
        return response(res, null, "Request không hợp lệ!", statusCode.ERROR);

      const subjectID = params.subject_id || null;
      const categoryID = params.category_id || null;
      const teacherID = params.teacher_id || null;
      const bookID = params.book_id || null;
      const demo_link = params.demo_link || null;
      const price = params.price || 0;
      const originPrice = params.origin_price || 0;
      let status = params.status || false;
      const ordering = params.ordering || 1;
      const stockStatus = params.stock_status || "IN_STOCK";
      const showOnCart = params.show_on_cart || false;
      const isFeatured = params.is_featured || false;

      const combo_mode = params.combo_mode || false;
      const bookId_attached = params.bookId_attached || [];
      const renewed_bookId = params.renewed_bookId || null;
      const publish_mode = params.publish_mode || false;
      const publish_end_date = params.publish_end_date || null;

      const classroomAttached = params.classroom_attached || [];
      const promotion = params.promotion || null;
      const level = params.level || null;
      const quantity = params.quantity || 0;
      const includes = params.includes || null;
      const highlightInformations = params.highlightInformations || null;
      const student_owned = params.student_owned || 0;
      const suspension_date = params.suspension_date || null;
      const bookRelates = params.book_relates || [];
      const labelIds = params.label_ids !== undefined
        ? (Array.isArray(params.label_ids) ? params.label_ids : [])
        : undefined;

      // ===== Check tồn tại =====
      const bookExist = await BookIdModel.db.findById(id);
      if (!bookExist)
        return response(
          res,
          null,
          language.ITEM_NOT_EXIST.replace("%s", "SÁCH"),
          statusCode.ERROR,
        );

      if (!name)
        return response(
          res,
          null,
          language.CANNOT_EMPTY.replace("%s", language.NAME),
          statusCode.ERROR,
        );

      if (!subjectID)
        return response(
          res,
          null,
          language.CANNOT_EMPTY.replace("%s", language.SUBJECT),
          statusCode.ERROR,
        );

      const subject = await SubjectModel.findOne({ _id: subjectID });
      if (!subject)
        return response(
          res,
          null,
          language.ITEM_NOT_EXIST.replace("%s", language.SUBJECT),
          statusCode.ERROR,
        );

      if (!categoryID)
        return response(
          res,
          null,
          language.CANNOT_EMPTY.replace("%s", "Danh mục sách"),
          statusCode.ERROR,
        );

      const category = await ClassroomGroupModel.findOne({ _id: categoryID });
      if (!category)
        return response(
          res,
          null,
          language.ITEM_NOT_EXIST.replace("%s", "Danh mục sách"),
          statusCode.ERROR,
        );

      if (!teacherID)
        return response(
          res,
          null,
          language.CANNOT_EMPTY.replace("%s", "Giáo viên"),
          statusCode.ERROR,
        );

      let newBookId = null;
      if (bookID) {
        const exist = await BookIdModel.findOne({
          book_id: bookID,
          _id: { $ne: id },
        });

        if (exist) {
          return response(
            res,
            null,
            "Mã sách đã tồn tại, vui lòng thử lại!",
            statusCode.ERROR,
          );
        }
        newBookId = bookID;
      } else {
        const lastBook = await BookIdModel.db
          .findOne({})
          .sort({ book_id: -1 })
          .lean();

        let nextX = 1;

        if (lastBook?.book_id) {
          const x = parseInt(lastBook.book_id.replace(/000$/, ""), 10);
          nextX = x + 1;
        }

        newBookId = `${nextX}000`;
      }
      const alias = BaseHelper.seoURL(name.trim());
      if (suspension_date) {
        const suspensionDate = new Date(suspension_date);
        const now = new Date();

        if (suspensionDate < now) {
          status = false;
        }
      }

      const _doc = {
        book_id: newBookId ? newBookId : bookExist.book_id,
        name: name ? name : bookExist.name,
        alias: alias ? alias : bookExist.alias,
        subject: { id: subject.id, name: subject.name },
        category: { id: category._id, name: category.name },
        demo_link: demo_link !== undefined ? demo_link : bookExist.demo_link,
        description: description !== undefined ? description : bookExist.description,
        content: content !== undefined ? content : bookExist.content,
        origin_price: parseFloat(originPrice),
        price: parseFloat(price),
        combo_mode: combo_mode !== undefined ? combo_mode : bookExist.combo_mode,
        bookId_attached: bookId_attached.length > 0 ? bookId_attached : bookExist.bookId_attached,
        renewed_bookId: renewed_bookId !== null ? renewed_bookId : bookExist.renewed_bookId,
        publish_mode: publish_mode !== undefined ? publish_mode : bookExist.publish_mode,
        publish_end_date: publish_end_date !== null ? publish_end_date : bookExist.publish_end_date,
        ordering: parseInt(ordering),
        level: level !== null ? level : bookExist.level,
        teacher_id: teacherID ? teacherID : bookExist.teacher_id,
        stock_status: stockStatus !== undefined ? stockStatus : bookExist.stock_status,
        show_on_cart: showOnCart !== undefined ? showOnCart : bookExist.show_on_cart,
        is_featured: isFeatured !== undefined ? isFeatured : bookExist.is_featured,
        book_relates: bookRelates.length > 0 ? bookRelates : bookExist.book_relates,
        classroom_attached: classroomAttached.length > 0 ? classroomAttached : bookExist.classroom_attached,
        promotion: promotion !== null ? promotion : bookExist.promotion,
        status: status !== null ? status : bookExist.status,
        quantity: quantity ? parseInt(quantity) : bookExist.quantity,
        includes: includes !== null ? includes : bookExist.includes,
        highlightInformations: highlightInformations !== null ? highlightInformations : bookExist.highlightInformations,
        suspension_date: suspension_date !== null ? suspension_date : bookExist.suspension_date,
        student_owned: student_owned !== undefined ? student_owned : bookExist.student_owned,
      };

      if (files && files.length > 0) {
        const fileData = await UploadService.upload(files[0], "base64", "book");
        if (fileData) {
          _doc.image = appConfig.FILE_DOMAIN + "/" + fileData[0];
        }
      }

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

      const book = await BookIdModel.db.findByIdAndUpdate(
        id,
        { $set: _doc },
        { new: true },
      );

      // Đồng bộ nhãn nếu label_ids được truyền vào
      if (labelIds !== undefined) {
        const bookIdStr = id.toString();
        const oldItems = await LabelItemModel.find({ item_id: bookIdStr, item_type: 'BOOK_ID' }, { label_id: 1 });
        const oldLabelIds = oldItems.map(i => i.label_id);

        await LabelItemModel.delete({ item_id: bookIdStr, item_type: 'BOOK_ID' }, true);

        if (labelIds.length > 0) {
          await Promise.all(labelIds.map(lid => LabelItemModel.create({ label_id: lid, item_id: bookIdStr, item_type: 'BOOK_ID' })));
        }

        const affectedIds = [...new Set([...oldLabelIds, ...labelIds])];
        if (affectedIds.length > 0) {
          await Promise.all(affectedIds.map(lid => syncLabelNumItem(lid)));
        }
      }

      return response(res, book, "Thành công", statusCode.OK);
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
        return response(res, null, "Request không hợp lệ!", statusCode.ERROR);

      const docBook = {};
      docBook.ordering = parseInt(ordering);
      if (status !== undefined) docBook.status = status;
      if (isFeatured !== undefined) docBook.is_featured = isFeatured;

      let book = await BookIdModel.findOne({ _id: id });
      if (!book)
        return response(
          res,
          {},
          language.ITEM_NOT_EXIST.replace("%s", language.BOOK),
          statusCode.ERROR,
        );
      const rs = await BookIdModel.updateOne({ _id: id }, { $set: docBook });
      if (rs.nModified) {
        book = await BookIdModel.findOne({ _id: id });
        return response(res, book, "Thành công", statusCode.OK);
      }
      return response(res, book, language.ERROR, statusCode.ERROR);
    } catch (err) {
      logError(err);
      return response(
        res,
        {},
        "Có lỗi xảy ra. Vui lòng thử lại!",
        statusCode.ERROR,
      );
    }
  }

  async delete(req, res, params) {
    try {
      const { ids } = params || [];
      if (ids.length == 0)
        return response(res, null, "Request không hợp lệ!", statusCode.ERROR);

      const rs = await BookIdModel.softDelete({ _id: { $in: ids } }, true);
      if (rs) return response(res, {}, "Thành công", statusCode.OK);
      return response(res, null, language.ERROR, statusCode.ERROR);
    } catch (err) {
      logError(err);
      return response(res, null, language.PROCESS_ERROR, statusCode.ERROR);
    }
  }

  async view(req, res, params) {
    try {
      const { alias } = params;
      let otherBooks = [];
      let reviews = [];
      let totalReview = 0;
      let conditions = { alias: alias };
      let isBought = false;
      const book = await BookIdModel.findOne(conditions);
      if (book) {
        if (book.category)
          otherBooks = await BookIdModel.find({
            "category.id": book.category.id,
            deleted_at: null,
          });
        conditions = {
          book_id: book._id,
          status: true,
          deleted_at: null,
        };
        const options = {
          skip: 0,
          limit: 20,
          sort: { created_at: -1 },
        };
        reviews = await BookReviewModel.find(conditions, null, options);
        totalReview = await BookReviewModel.count(conditions);

        if (req.user) {
          const num = await UserBuyDataModel.findOne({
            user_id: req.user.user_id,
            item_id: book._id,
            type: "BOOK",
          });
          if (num) isBought = true;
        }
      }
      let teacher = null;
      if (book.teacher_id)
        teacher = await UserModel.findOne({ _id: book.teacher_id });

      let classroomAttached = [];
      if (book.classroom_attached && book.classroom_attached.length > 0)
        classroomAttached = await BookIdCourseModel.find({
          _id: { $in: book.classroom_attached },
          deleted_at: null,
        });

      let bookRelates = [];
      if (book.book_relates && book.book_relates.length > 0)
        bookRelates = await BookIdModel.find({
          _id: { $in: book.book_relates },
          deleted_at: null,
        });

      let classroomRelates = [];
      if (book.classroom_relates && book.classroom_relates.length > 0)
        classroomRelates = await BookIdCourseModel.find({
          _id: { $in: book.classroom_relates },
          deleted_at: null,
        });

      return response(
        res,
        {
          book,
          teacher,
          otherBooks,
          reviews,
          totalReview,
          classroomAttached,
          bookRelates,
          classroomRelates,
          is_bought: isBought,
        },
        "Thành công",
        statusCode.OK,
      );
    } catch (err) {
      logError(err);
      console.error(err);
      return response(res, null, language.PROCESS_ERROR, statusCode.ERROR);
    }
  }

  async listBook(req, res, params) {
    try {
      let keyword = params.keyword || "";
      const page = parseInt(params.page || appConfig.PAGINATION.PAGE);
      const limit = parseInt(params.limit || appConfig.PAGINATION.LIMIT);
      const subjectID = params.subject_id || null;
      const teacherID = params.teacher_id || null;
      const categoryID = params.category_id || null;
      const categoryAlias = params.category_alias || null;
      const conditions = { deleted_at: null };
      const price = params.price || null;
      const level = params.level || null;
      const type = params.type || null;

      let rangePrice = null;
      let fromPrice = null;
      let toPrice = null;

      let orderingFillter = null;
      if (type) {
        switch (type) {
          case "sale":
            orderingFillter = 1;
            break;
          case "hot":
            orderingFillter = 3;
            break;
        }
      }

      if (orderingFillter) conditions.ordering = orderingFillter;

      if (price) {
        if (typeof price === "object" && price.length > 0) {
          // Lay gia lon nhat, gia nho nhat
          const priceArray = [];
          for (let i = 0; i < price.length; i++) {
            const _price = price[i];
            rangePrice = _price.split("-");
            fromPrice = parseFloat(rangePrice[0]);
            toPrice = parseFloat(rangePrice[1]);
            priceArray.push(fromPrice);
            priceArray.push(toPrice);
          }
          const minPrice = Math.min.apply(null, priceArray);
          const maxPrice = Math.max.apply(null, priceArray);
          conditions.price = {
            $lte: maxPrice,
            $gte: minPrice,
          };
        } else {
          rangePrice = price.split("-");
          fromPrice = parseFloat(rangePrice[0]);
          toPrice = parseFloat(rangePrice[1]);
          conditions.price = {
            $lte: toPrice,
            $gte: fromPrice,
          };
        }
      }
      if (level) conditions.level = level;

      const options = {
        skip: (page - 1) * limit,
        limit: limit,
        sort: { updated_at: -1 },
      };

      if (keyword) {
        keyword = removeSpacesAndSpecialChars(keyword);
        const parserKeyword = keyword.replace(
          /[-[\]{}()*+?.,\\^$|#\s]/g,
          "\\$&",
        );
        conditions["$or"] = [
          { name: { $regex: `\\b${parserKeyword}\\b`, $options: "i" } },
          { code: { $regex: `\\b${parserKeyword}\\b`, $options: "i" } },
        ];
      }

      if (subjectID) conditions["subject.id"] = subjectID;

      if (categoryID)
        if (Array.isArray(categoryID)) {
          conditions.$or = [];
          for (let i = 0; i < categoryID.length; i++) {
            conditions.$or.push({ "category.id": categoryID[i] });
          }
        } else {
          conditions["category.id"] = categoryID;
        }

      if (categoryAlias) {
        const _category = await ClassroomGroupModel.findOne({
          alias: categoryAlias,
        });
        if (_category) {
          conditions["category.id"] = _category._id;
        }
      }

      if (teacherID) conditions.teacher_id = teacherID;

      conditions.deleted_at = null;
      conditions.status = true;

      const records = await BookIdModel.find(conditions, null, options);
      const total = await BookIdModel.count(conditions);
      const data = {
        records,
        totalRecord: total,
        perPage: limit,
      };

      // const teachers = await UserModel.find({ user_group: 'TEACHER', status: 'ACTIVE', deleted_at: null });
      // data.teachers = teachers;

      return response(res, data, "Thành công", statusCode.OK);
    } catch (err) {
      logError(err);
      console.log(err);
      return response(res, null, language.PROCESS_ERROR, statusCode.ERROR);
    }
  }

  async updateRelate(req, res, params) {
    try {
      const classroomAttached = params.classroom_attached;
      const bookRelates = params.book_relates;
      const classroomRelates = params.classroom_relates;
      const bookID = params.book_id || null;
      if (!bookID)
        return response(res, {}, "Sách không tồn tại!", statusCode.OK);

      const data = {};
      if (classroomAttached) data.classroom_attached = classroomAttached;

      if (bookRelates) data.book_relates = bookRelates;

      if (classroomRelates) data.classroom_relates = classroomRelates;

      let rs = null;
      if (JSON.stringify(data) !== "{}")
        rs = await BookIdModel.updateOne({ _id: bookID }, { $set: data });

      if (rs && rs.nModified)
        return response(res, {}, "Cập nhật thành công!", statusCode.OK);
      return response(
        res,
        null,
        "Không cập nhật được dữ liệu",
        statusCode.ERROR,
      );
    } catch (err) {
      logError(err);
      return response(res, null, language.PROCESS_ERROR, statusCode.ERROR);
    }
  }

  async accessByCode(req, res, params) {
    try {
      const { book_id, code } = params;

      if (!code) {
        return response(res, null, "Request không hợp lệ!", statusCode.ERROR);
      }
      const infoBook = await BookIdModel.findOne({
        book_id: book_id,
      });
      if (!infoBook) {
        return response(res, null, "Sách không tồn tại!", statusCode.ERROR);
      }
      const bookIdCode = await BookIdCodeModel.findOne({
        "bookIdCourse.id": infoBook._id.toString(),
        code: code,
      });

      if (!bookIdCode) {
        return response(res, {}, "Mã không hợp lệ!", statusCode.ERROR);
      }

      if (bookIdCode.is_used && bookIdCode.user.id !== req.user.user_id) {
        const code = bookIdCode.user?.code?.toString() || "";
        const maskedCode = code.slice(-4);

        return response(
          res,
          {},
          `Mã đã được tài khoản ${bookIdCode.user?.name}, số điện thoại ****${maskedCode} sử dụng! `,
          statusCode.ERROR,
        );
      } else if (
        bookIdCode.is_used &&
        bookIdCode.user.id === req.user.user_id
      ) {
        return response(
          res,
          {},
          `Mã đã được bạn sử dụng trước đó! `,
          statusCode.ERROR,
        );
      }

      const user = await UserModel.db.findById(req.user.user_id);

      if (!user) {
        return response(res, {}, "Học sinh không tồn tại!", statusCode.ERROR);
      }

      if (!user.code) {
        return response(
          res,
          null,
          "Vui lòng cập nhật mã học sinh!",
          statusCode.ERROR,
        );
      }

      const book = await BookIdModel.db.findById(bookIdCode.bookIdCourse.id);

      if (!book) {
        return response(res, {}, "Sách không tồn tại!", statusCode.ERROR);
      }

      const months = Number(book?.renewed_bookId?.expired_time) || 0;
      const monthsExpired =
        Number(book?.renewed_bookId?.can_renewal_after) || 0;
      if (months <= 0) {
        return response(
          res,
          {},
          "Gói sách chưa cấu hình thời hạn!",
          statusCode.ERROR,
        );
      }

      const now = new Date();
      const expiredDate = new Date(now);
      expiredDate.setMonth(expiredDate.getMonth() + months);
      expiredDate.setHours(23, 59, 59, 999);

      let studentBook = await StudentBookIdModel.findOne({
        "user.id": user.id,
        "bookIdCourse.id": book._id.toString(),
      });

      if (studentBook) {
        const now = new Date();
        const currentExpired = studentBook.exprired_date;

        // ===== CASE 1: CÒN HẠN -> KHÔNG CHO KÍCH HOẠT =====
        if (currentExpired && currentExpired > now) {
          const formatDate = currentExpired.toLocaleDateString("vi-VN");
          return response(
            res,
            {},
            `Kích hoạt không thành công. Khóa học còn hạn sử dụng đến ngày ${formatDate}.`,
            statusCode.ERROR,
          );
        }

        // ===== CASE 2: HẾT HẠN -> XÓA & TẠO MỚI =====
        await StudentBookIdModel.db.deleteOne({ _id: studentBook._id });

        await StudentBookIdModel.create({
          user: {
            id: user.id,
            code: user.code,
            name: user.fullname,
          },
          bookIdCourse: bookIdCode.bookIdCourse,
          joined_at: now,
          activation_date: now,
          exprired_date: expiredDate,
          total_extended_months: monthsExpired,
          extend_times: 1,
        });
      } else {
        // ===== CASE 3: CHƯA CÓ -> TẠO MỚI =====
        await StudentBookIdModel.create({
          user: {
            id: user.id,
            code: user.code,
            name: user.fullname,
          },
          bookIdCourse: bookIdCode.bookIdCourse,
          joined_at: now,
          activation_date: now,
          exprired_date: expiredDate,
          total_extended_months: monthsExpired,
          extend_times: 1,
        });
      }
      await BookIdCodeModel.updateOne(
        { _id: bookIdCode._id },
        {
          $set: {
            user: {
              id: user.id,
              code: user.code,
              name: user.fullname,
            },
            activation_date: now,
            exprired_date: expiredDate,
            is_used: true,
          },
        },
      );

      if (book.combo_mode && book.bookId_attached?.length > 0) {
        const listBookIds = book.bookId_attached.map((id) => id.toString());

        const existing = await StudentBookIdModel.find({
          "user.id": user.id,
          "bookIdCourse.id": { $in: listBookIds },
        });

        const existingIds = new Set(
          existing.map((item) => item.bookIdCourse.id),
        );

        const attachedBooks = await BookIdModel.find(
          {
            _id: { $in: listBookIds },
          },
          { name: 1, code: 1 },
        );

        const insertData = [];

        for (const b of attachedBooks) {
          const id = b._id.toString();

          if (!existingIds.has(id)) {
            insertData.push({
              user: {
                id: user.id,
                code: user.code,
                name: user.fullname,
              },
              bookIdCourse: {
                id,
                name: b.name,
                code: b.code,
              },
              joined_at: now,
            });
          }
        }

        if (insertData.length) {
          await StudentBookIdModel.insertMany(insertData);
        }
      }

      return response(res, { book_id: book._id }, "Thành công", statusCode.OK);
    } catch (err) {
      logError(err);
      console.error(err);
      return response(res, {}, "Có lỗi xảy ra!", statusCode.ERROR);
    }
  }

  async generateAccessCode(req, res, params) {
    try {
      const totalCode = params.total_code || 0;
      const bookID = params.book_id || null;
      if (!totalCode || !bookID)
        return response(res, null, "Request không hợp lệ!", statusCode.ERROR);
      const bookId = await BookIdModel.findOne({ _id: bookID });
      if (!bookId)
        return response(res, {}, "Sách này không tồn tại!", statusCode.ERROR);
      let i = 0;
      let d = 0;
      while (i < totalCode) {
        i++;
        const newCode = await randomize("A0", 6);
        const code = await BookIdCodeModel.findOne({ code: newCode });
        if (!code) {
          const docCode = {
            user: null,
            bookIdCourse: {
              id: bookId.id,
              name: bookId.name,
              code: bookId.code,
            },
            code: newCode,
            created_by: {
              id: req.user.user_id,
              name: req.user.fullname,
              code: req.user.code,
            },
            is_used: false,
          };
          const _code = await BookIdCodeModel.create(docCode);
          if (_code) {
            d++;
          }
        }
      }

      if (d > 0)
        return response(res, { total_code: d }, "Thành công", statusCode.OK);
      return response(res, null, language.ERROR, statusCode.ERROR);
    } catch (err) {
      logError(err);
      console.log(err);
      return response(
        res,
        {},
        "Có lỗi xảy ra. Vui lòng thử lại!",
        statusCode.ERROR,
      );
    }
  }

  async codes(req, res, params) {
    try {
      const keyword = params.keyword || false;
      const bookID = params.book_id || null;
      let isUsed =
        params.is_used !== undefined && params.is_used !== ""
          ? params.is_used
          : null;
      if (isUsed === "true") isUsed = true;
      if (isUsed === "false") isUsed = false;
      const page = parseInt(params.page || appConfig.PAGINATION.PAGE);
      let limit = parseInt(params.limit || appConfig.PAGINATION.LIMIT);
      if (limit < 0) limit = 100000;
      const conditions = {};
      if (req.user.user_group === "STUDENT") {
        return response(
          res,
          data,
          "Bạn không có quyền truy cập!",
          statusCode.FORBIDDEN,
        );
      }

      const options = {
        skip: (page - 1) * limit,
        limit: limit,
        sort: { updated_at: -1 },
      };

      if (keyword) {
        conditions.code = { $regex: keyword, $options: "i" };
      }

      if (bookID) conditions["bookIdCourse.id"] = bookID;

      if (isUsed !== null) conditions["is_used"] = isUsed;

      const start_date = params.start_date || false;
      const end_date = params.end_date || false;
      const date_type = params.date_type || "created_at";

      if (start_date && end_date) {
        conditions[date_type] = {
          $gte: new Date(start_date),
          $lte: new Date(end_date),
        };
      } else if (start_date) {
        conditions[date_type] = {
          $gte: new Date(start_date),
        };
      } else if (end_date) {
        conditions[date_type] = {
          $lte: new Date(end_date),
        };
      }

      const rs = await BookIdCodeModel.find(conditions, null, options);
      const total = await BookIdCodeModel.count(conditions);
      const data = {
        total: total,
        limit: limit,
        items: rs,
      };
      return response(res, data, "Thành công", statusCode.OK);
    } catch (err) {
      logError(err);
      console.log(err);
      return response(
        res,
        null,
        "Có lỗi xảy ra. Vui lòng thử lại!",
        statusCode.ERROR,
      );
    }
  }

  async deleteCode(req, res, params) {
    try {
      const ids = params.ids || [];
      let conditions = {};

      let deletedIds = 0;
      for (let i = 0; i < ids.length; i++) {
        const bookIdCode = await BookIdCodeModel.findOne({ _id: ids[i] });
        if (!bookIdCode) continue;
        const rs = await BookIdCodeModel.delete({ _id: ids[i] });
        if (!rs) continue;
        deletedIds += 1;
        if (bookIdCode.user) {
          const userID = bookIdCode.user.id || null;
          const bookID = bookIdCode.classroom.id || null;
          if (userID && bookID) {
            conditions = {};
            conditions["classroom.id"] = bookID;
            conditions["user.id"] = userID;
            conditions.deleted_at = null;
            const studentClassroom =
              await StudentBookIdModel.findOne(conditions);
            if (studentClassroom) {
              const rs = await StudentBookIdModel.softDelete({
                _id: studentClassroom.id,
              });
              if (rs) {
                // Remove Tag tren OneSignal
                const user = await UserModel.findOne({ _id: userID });
                const userTagDevice = user.device_tags
                  ? JSON.parse(user.device_tags)
                  : { user_code: user.code };
                userTagDevice[bookID] = "";
                AppService.editTagDeviceWithID(userID, userTagDevice);
                logError(
                  req.user.user_id +
                  " đã xóa học sinh: " +
                  studentClassroom.user.code,
                );
              }
            }
          }
        }
      }

      if (deletedIds > 0) return response(res, {}, "Thành công", statusCode.OK);

      return response(res, {}, language.ERROR, statusCode.ERROR);
    } catch (err) {
      logError(err);
      console.log(err);

      return response(
        res,
        null,
        "Có lỗi xảy ra. Vui lòng thử lại!",
        statusCode.ERROR,
      );
    }
  }

  async exportCode(req, res, params) {
    try {
      const keyword = params.keyword || false;
      const bookID = params.book_id || null;
      const page = parseInt(params.page || appConfig.PAGINATION.PAGE);
      const limit = 10000000;

      const conditions = {};
      // if (req.user.user_group === appConfig.USER_GROUP.STUDENT) {
      //     return response(res, data, 'Bạn không có quyền truy cập!', statusCode.FORBIDDEN);
      // }

      const options = {
        skip: (page - 1) * limit,
        limit: limit,
        sort: { updated_at: -1 },
      };

      if (keyword) {
        conditions.code = { $regex: keyword, $options: "i" };
      }

      if (bookID) conditions["bookIdCourse.id"] = bookID;

      const classroom = await BookIdModel.findOne({ _id: bookID });
      if (!classroom)
        return response(res, {}, "Lớp học không tồn tại!", statusCode.ERROR);
      const rs = await BookIdCodeModel.find(conditions, null, options);
      const fileName = await ClassroomService.exportBookIdCode(classroom, rs);
      const streamFile = fs.readFileSync("./temp/excel/" + fileName);
      download(
        res,
        streamFile,
        fileName,
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      );
    } catch (err) {
      logError(err);
      console.log(err);
      return response(
        res,
        null,
        "Có lỗi xảy ra. Vui lòng thử lại!",
        statusCode.ERROR,
      );
    }
  }

  async listMember(req, res, params) {
    try {
      const { id, keyword } = params;
      let month = params.month || new Date().getMonth();
      const year = params.year || new Date().getFullYear();
      const status = params.status || null;
      const page = parseInt(params.page || appConfig.PAGINATION.PAGE);
      let limit = parseInt(params.limit || appConfig.PAGINATION.LIMIT);

      const isExport = params.is_export || false;
      if (isExport) limit = 500000;

      let conditions = {};
      conditions["bookIdCourse.id"] = id;
      if (keyword) {
        conditions.$or = [
          { "user.name": { $regex: keyword, $options: "i" } },
          { "user.code": { $regex: keyword, $options: "i" } },
        ];
      }
      conditions.deleted_at = null;
      const arrayBuoiHoc = {};

      const options = {
        skip: (page - 1) * limit,
        limit: limit,
      };
      if (status !== null) {
        if (status === "active") {
          conditions.exprired_date = { $gte: new Date() };
        } else if (status === "expired") {
          conditions.exprired_date = { $lt: new Date() };
        }
      }
      const total = await StudentBookIdModel.count(conditions);
      const studentClassroom = await StudentBookIdModel.find(
        conditions,
        null,
        options,
      );
      const arrayID = [];
      for (let i = 0; i < studentClassroom.length; i++) {
        if (studentClassroom[i].user) {
          if (arrayID.indexOf(studentClassroom[i].user.id) < 0) {
            arrayID.push(studentClassroom[i].user.id);
            const sbh = studentClassroom[i].sobuoihoc
              ? studentClassroom[i].sobuoihoc
              : 0;
            const sbdh = studentClassroom[i].buoidahoc
              ? studentClassroom[i].buoidahoc
              : 0;
            const lesson_view_dates = studentClassroom[i].lesson_view_dates
              ? studentClassroom[i].lesson_view_dates
              : null;
            arrayBuoiHoc[studentClassroom[i].user.id] = {
              sobuoihoc: sbh,
              buoidahoc: sbdh,
              joined_at: studentClassroom[i].created_at,
              lesson_view_dates,
              activation_date: studentClassroom[i].activation_date,
              exprired_date: studentClassroom[i].exprired_date,
              exprired_time: studentClassroom[i].exprired_time,
              total_extended_months: studentClassroom[i].total_extended_months,
              extend_times: studentClassroom[i].extend_times,
            };
          }
        }
      }
      conditions = { _id: { $in: arrayID } };
      if (keyword) {
        conditions.$or = [
          { fullname: { $regex: keyword, $options: "i" } },
          { phone: { $regex: keyword, $options: "i" } },
          { code: { $regex: keyword, $options: "i" } },
          { email: { $regex: keyword, $options: "i" } },
        ];
      }
      const members = await UserModel.find(conditions);
      conditions = {};
      const date = BaseHelper.startDateEndDate(month, year);
      conditions["bookIdCourse.id"] = id;
      conditions.deleted_at = null;
      if (date)
        conditions.created_at = {
          $gte: new Date(date.start_date),
          $lte: new Date(date.end_date),
        };

      const data = [];
      for (let i = 0; i < members.length; i++) {
        const student = {};
        student._id = members[i].id;
        student.fullname = members[i].fullname;
        student.code = members[i].code;
        student.phone = members[i].phone;
        student.parent_phone = members[i].parent_phone;
        // if (userTesting[members[i].id]) {
        //     student.total_point = userTesting[members[i].id].total_point;
        //     student.total_testing = userTesting[members[i].id].total_testing;
        //     student.total_num_right = userTesting[members[i].id].total_num_right;
        //     student.total_num_wrong = userTesting[members[i].id].total_num_wrong;
        // } else {
        // student.total_point = 0;
        // student.total_testing = 0;
        // student.total_num_right = 0;
        // student.total_num_wrong = 0;
        // }

        // student.sobuoihoc = arrayBuoiHoc[members[i].id] ? arrayBuoiHoc[members[i].id].sobuoihoc : 0;
        // student.buoidahoc = arrayBuoiHoc[members[i].id] ? arrayBuoiHoc[members[i].id].buoidahoc : 0;
        student.joined_at = arrayBuoiHoc[members[i].id]
          ? arrayBuoiHoc[members[i].id].joined_at
          : null;
        student.lesson_view_dates =
          arrayBuoiHoc[members[i].id].lesson_view_dates;
        student.activation_date = arrayBuoiHoc[members[i].id]
          ? arrayBuoiHoc[members[i].id].activation_date
          : null;
        student.exprired_date = arrayBuoiHoc[members[i].id]
          ? arrayBuoiHoc[members[i].id].exprired_date
          : null;
        student.exprired_time = arrayBuoiHoc[members[i].id]
          ? arrayBuoiHoc[members[i].id].exprired_time
          : null;
        student.total_extended_months = arrayBuoiHoc[members[i].id]
          ? arrayBuoiHoc[members[i].id].total_extended_months
          : null;
        student.extend_times = arrayBuoiHoc[members[i].id]
          ? arrayBuoiHoc[members[i].id].extend_times
          : null;
        data.push(student);
      }

      if (isExport) {
        const fileName = await ClassroomService.exportMemberBookId(data);
        const streamFile = fs.readFileSync("./temp/excel/" + fileName);
        return download(
          res,
          streamFile,
          fileName,
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        );
      }

      const _data = {
        totalRecord: total,
        perPage: limit,
        records: data,
      };
      return response(res, _data, "Thành công", statusCode.OK);
    } catch (err) {
      logError(err);
      console.log(err);
      return response(
        res,
        null,
        "Có lỗi xảy ra. Vui lòng thử lại!",
        statusCode.ERROR,
      );
    }
  }

  async removeMember(req, res, params) {
    try {
      const bookID = params.book_id || null;
      const studentID = params.student_id || null;
      let conditions = {};
      if (req.user.user_group === "STUDENT") {
        return response(
          res,
          null,
          "Bạn không có quyền truy cập!",
          statusCode.FORBIDDEN,
        );
      }

      if (studentID === "625c3c11354c5431ba7e77d1")
        return response(
          res,
          null,
          "Tài khoản Demo Review App (ios, Android) - Không được xoá - Không được đổi mật khẩu.",
          statusCode.FORBIDDEN,
        );

      const user = await UserModel.findOne({ _id: studentID });
      if (!user || user.deleted_at)
        return response(
          res,
          null,
          "Học sinh này không tồn tại!",
          statusCode.ERROR,
        );
      const book = await BookIdModel.findOne({ _id: bookID });
      if (!book)
        return response(res, null, "Lớp này không tồn tại!", statusCode.ERROR);
      const bookIdCourse = await BookIdCourseModel.findOne({
        _id: book.classroom_attached[0],
      });
      if (!bookIdCourse || bookIdCourse.deleted_at)
        return response(res, null, "Lớp này không tồn tại!", statusCode.ERROR);

      conditions = {};
      conditions["bookIdCourse.id"] = bookID;
      conditions["user.id"] = studentID;
      conditions.deleted_at = null;
      const studentClassroom = await StudentBookIdModel.findOne(conditions);
      if (studentClassroom) {
        const rs = await StudentBookIdModel.softDelete({
          _id: studentClassroom.id,
        });
        if (rs) {
          BookIdCourseModel.updateOne(
            { _id: bookID },
            { $inc: { num_student: -1 } },
          );
          // Remove Tag tren OneSignal
          const userTagDevice = user.device_tags
            ? JSON.parse(user.device_tags)
            : { user_code: user.code };
          userTagDevice[bookID] = "";
          AppService.editTagDeviceWithID(studentID, userTagDevice);
          logError(
            req.user.user_id +
            " đã xóa học sinh: " +
            studentClassroom.user.code,
          );
          return response(
            res,
            rs,
            "Đã xóa thành công học sinh khỏi lớp học!",
            statusCode.OK,
          );
        }
      }

      return response(res, {}, language.ERROR, statusCode.ERROR);
    } catch (err) {
      logError(err);
      console.log(err);
      return response(
        res,
        null,
        "Có lỗi xảy ra. Vui lòng thử lại!",
        statusCode.ERROR,
      );
    }
  }

  async exportDocx(req, res, params) {
    try {
      const bookID = params.book_id || null;

      if (!bookID)
        return response(res, null, "Request không hợp lệ!", statusCode.ERROR);

      if (req.user.user_group === "STUDENT") {
        return response(
          res,
          null,
          "Bạn không có quyền truy cập!",
          statusCode.FORBIDDEN,
        );
      }

      const book = await BookIdModel.findOne({ _id: bookID });
      if (!book || book.deleted_at)
        return response(res, null, "Lớp không tồn tại!", statusCode.ERROR);

      const groups = await buildBookStructure(bookID);

      const children = [];

      // ===== TRANG 1: MỤC LỤC =====
      children.push(
        new Paragraph({
          text: "MỤC LỤC",
          heading: HeadingLevel.HEADING_1,
          alignment: AlignmentType.CENTER,
          spacing: { after: 300 },
        }),
      );

      children.push(
        new TableOfContents("Danh sách nội dung", {
          hyperlink: true,
          headingStyleRange: "1-5", // 🔥 full level
          rightTabStop: 9000,
        }),
      );

      children.push(new Paragraph(""));

      children.push(
        new Paragraph({
          pageBreakBefore: true,
        }),
      );

      // ===== TRANG 2: NỘI DUNG =====
      children.push(
        new Paragraph({
          text: `Sách: ${book.name}`,
          heading: HeadingLevel.HEADING_1,
          alignment: AlignmentType.CENTER,
          spacing: { after: 400 },
        }),
      );

      groups.forEach((group, gIndex) => {
        if (group.name.toLowerCase() !== "nhóm mới") {
          children.push(
            new Paragraph({
              text: ` ${group.name}`,
              heading: HeadingLevel.HEADING_2,
              spacing: { before: 200, after: 100 },
            }),
          );
        }
        group.items.forEach((chapter, cIndex) => {

          children.push(
            new Paragraph({
              text: `${chapter.name}`,
              heading: HeadingLevel.HEADING_3,
              spacing: { before: 100, after: 100 },
            }),
          );

          chapter.children.forEach((lesson, lIndex) => {
            // ===== LESSON =====
            children.push(
              new Paragraph({
                text: `[${lesson.code}] ${lesson.name}`,
                heading: HeadingLevel.HEADING_4,
                spacing: { before: 50, after: 50 },
              }),
            );
            if (lesson.exercises.length > 1) {
              lesson.exercises.forEach((ex, eIndex) => {
                // ===== EXERCISE =====
                children.push(
                  new Paragraph({
                    text: `[${ex.code}] ${ex.name}`,
                    heading: HeadingLevel.HEADING_5,
                  }),
                );
              });
            } else {
              lesson.exercises.forEach((ex, eIndex) => {
                // ===== EXERCISE =====
                children.push(
                  new Paragraph({
                    text: ` [${ex.code}]${ex.name}`,
                    heading: HeadingLevel.HEADING_5,
                  }),
                );
              });
            }
          });
        });
      });

      const doc = new Document({
        sections: [{ children }],
      });

      const buffer = await Packer.toBuffer(doc);

      res.setHeader(
        "Content-Disposition",
        `attachment; filename=class_${bookID}.docx`,
      );

      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      );

      return res.send(buffer);
    } catch (err) {
      logError(err);
      console.log(err);
      return response(res, null, "Có lỗi xảy ra!", statusCode.ERROR);
    }
  }

  async getInfo(req, res, params) {
    try {
      const bookID = params.book_id || null;

      if (!bookID) {
        return response(res, null, "Request không hợp lệ!", statusCode.ERROR);
      }

      // ===== CALL CORE BUILDER =====
      const groups = await buildBookStructure(bookID);

      if (!groups || groups.length === 0) {
        return response(res, null, "Sách không tồn tại hoặc không có dữ liệu!", statusCode.ERROR);
      }

      // ===== RESPONSE =====
      return response(
        res,
        { groups },
        "Thành công",
        statusCode.OK
      );

    } catch (err) {
      logError(err);
      console.log(err);

      return response(
        res,
        null,
        "Có lỗi xảy ra. Vui lòng thử lại!",
        statusCode.ERROR
      );
    }
  }

  async getExpiringBooks(req, res) {
    try {
      const now = new Date();
      const threeDaysLater = new Date();
      threeDaysLater.setDate(now.getDate() + 3);

      const userId = req.user.user_id;
      const result = await StudentBookIdModel.aggregate([
        {
          $match: {
            deleted_at: null,
            "user.id": userId,
          },
        },

        // ===== TÍNH final_expired =====
        {
          $addFields: {
            base_date: {
              $cond: [
                { $ifNull: ["$exprired_date", false] },
                "$exprired_date",
                { $toDate: "$exprired_time" },
              ],
            },
          },
        },
        {
          $addFields: {
            final_expired: {
              $dateAdd: {
                startDate: "$base_date",
                unit: "month",
                amount: { $ifNull: ["$total_extended_months", 0] },
              },
            },
          },
        },

        // ===== FILTER ≤ 3 NGÀY =====
        // {
        //   $match: {
        //     final_expired: {
        //       $gte: now,
        //       $lte: threeDaysLater
        //     }
        //   }
        // },

        // ===== TÍNH SỐ NGÀY CÒN LẠI =====
        {
          $addFields: {
            days_left: {
              $ceil: {
                $divide: [
                  { $subtract: ["$final_expired", now] },
                  1000 * 60 * 60 * 24,
                ],
              },
            },
          },
        },

        // ===== SORT =====
        {
          $sort: { final_expired: 1 },
        },
      ]);

      return response(
        res,
        {
          total: result.length,
          data: result, // 👈 full document + field mới
        },
        "Thành công",
        statusCode.OK,
      );
    } catch (err) {
      console.error(err);
      return response(
        res,
        null,
        "Có lỗi xảy ra. Vui lòng thử lại!",
        statusCode.ERROR,
      );
    }
  }
}

module.exports = new BookIdController();
