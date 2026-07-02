const appConfig = require("../../config/app");
const BaseHelper = require("../helpers/BaseHelper");
const ReviewModel = require("../models/Review");
const UserModel = require("../models/User");
const ClassroomModel = require("../models/Classroom");
const SubjectModel = require("../models/Subject");
const ClassroomGroupModel = require("../models/ClassroomGroup");
const language = BaseHelper.fileToJSON(`${__dirname}/../languages/vi.json`);
const ScoreHistory = require("../models/ScoreHistory");
const { param } = require("../routes/routes");
const mongoose = require("mongoose");
// const { response } = require('../../app');
class ReviewController {
  async list(req, res, params) {
    try {
      const keyword = params.keyword || false;
      const userID = params.user_id || false;
      const classroomID = params.classroom_id || false;
      const groupId = params.group_id || false;
      const subjectId = params.subject_id || false;
      const type = params.type || false;
      const page = parseInt(params.page || appConfig.PAGINATION.PAGE);
      const limit = parseInt(params.limit || appConfig.PAGINATION.LIMIT);

      const conditions = { deleted_at: null };

      const options = {
        skip: (page - 1) * limit,
        limit: limit,
        sort: { updated_at: -1 },
      };

      if (keyword) {
        const alias = BaseHelper.seoURL(keyword);
        conditions.alias = { $regex: alias, $options: "i" };
      }

      if (userID) conditions["user.id"] = userID;

      if (classroomID) conditions["classroom.id"] = classroomID;

      if (groupId) conditions["classroom_group.id"] = groupId;

      if (subjectId) conditions["subject.id"] = subjectId;

      if (type) {
        if (type == 0) {
          conditions["type"] = "HOC_SINH";
        } else if (type == 1) {
          conditions["type"] = "PHU_HUYNH";
        } else if (type == 2) {
          conditions["type"] = "VINH_DANH";
        }
      }

      if (
        req.user && (
          req.user.user_group === appConfig.USER_GROUP.TEACHER ||
          req.user.user_group === appConfig.USER_GROUP.SUPPORTER
        )
      ) {
        conditions["subject.id"] = { $in: req.user.subject_ids };
      }

      const records = await ReviewModel.find(conditions, null, options);

      const total = await ReviewModel.count(conditions);
      const totalPage = Math.ceil(total / limit);
      const data = {
        records,
        totalRecord: total,
        perPage: limit,
        totalPage: totalPage
      };
      return response(res, data, "Thành công", statusCode.OK);
    } catch (err) {
      logError(err);
      return response(res, null, language.PROCESS_ERROR, statusCode.ERROR);
    }
  }

  async detail(req, res, params) {
    try {
      const { id } = params;

      const conditions = { _id: id };
      const rs = await ReviewModel.findOne(conditions);
      return response(res, rs, "Thành công", statusCode.OK);
    } catch (err) {
      logError(err);
      return response(res, null, language.PROCESS_ERROR, statusCode.ERROR);
    }
  }

  async create(req, res, params) {
    try {
      const {
        comment,
        month,
        year,
        teacher,
        hiden,
        parents,
        students,
        score,
        honors,
        type
      } = params;

      if (type == null)
        return response(res, null, "Chưa chọn loại đánh giá!", statusCode.ERROR);

      const alias = comment ? BaseHelper.seoURL(comment) : "";
      let docReview = {};
      let results = null;

      // Helper check function
      const getDoc = async (model, id, notFoundMsg) => {
        const doc = await model.findOne({ _id: id });
        if (!doc)
          throw new Error(notFoundMsg);
        return doc;
      };

      switch (Number(type)) {
        // ===================== HỌC SINH =====================
        case 0:
          if (!students)
            return response(res, null, "Khai báo thiếu học sinh!", statusCode.ERROR);

          const { classroom_id, group_id, subject_id } = students;
          // if (!group_id || !subject_id)
          //   return response(res, null, "Thiếu thông tin lớp học!", statusCode.ERROR);
          const classroom = await getDoc(ClassroomModel, classroom_id, "Khóa học này không tồn tại!") || {};
          const group = await getDoc(ClassroomGroupModel, group_id, "Danh mục này không tồn tại!") || {};
          const subject = await getDoc(SubjectModel, subject_id, "Lớp học này không tồn tại!") || {};

          docReview = {
            comment,
            alias,
            month,
            year,
            teacher,
            students,
            type: "HOC_SINH",
            classroom: { id: classroom_id || "", name: classroom.name || "" },
            subject: { id: subject_id || "", name: subject.name || "" },
            classroom_group: { id: group_id || "", name: group.name || "" },
            hiden,
          };
          results = await ReviewModel.create(docReview);
          break;

        // ===================== PHỤ HUYNH =====================
        case 1:
          if (!parents)
            return response(res, null, "Khai báo thiếu phụ huynh!", statusCode.ERROR);

          docReview = {
            comment,
            alias,
            month,
            year,
            teacher,
            parents,
            // type: "PHU_HUYNH",
            type: "PHU_HUYNH",
            hiden,
          };
          results = await ReviewModel.create(docReview);
          break;

        // ===================== VINH DANH =====================
        case 2:
          const { classroom_id: cId, group_id: gId, subject_id: sId } = params;
          if (!cId || !gId || !sId)
            return response(res, null, "Thiếu thông tin vinh danh!", statusCode.ERROR);

          const c = await getDoc(ClassroomModel, cId, "Khóa học này không tồn tại!");
          const g = await getDoc(ClassroomGroupModel, gId, "Danh mục này không tồn tại!");
          const s = await getDoc(SubjectModel, sId, "Lớp học này không tồn tại!");

          docReview = {
            comment,
            alias,
            month,
            year,
            honors,
            score,
            type: "VINH_DANH",
            classroom: { id: cId, name: c.name },
            subject: { id: sId, name: s.name },
            classroom_group: { id: gId, name: g.name },
            hiden,
          };
          results = await ReviewModel.create(docReview);
          break;

        default:
          return response(res, null, "Loại đánh giá không hợp lệ!", statusCode.ERROR);
      }

      return response(res, results, "Thành công", statusCode.OK);
    } catch (err) {
      console.log(err);
      return response(res, {}, language.PROCESS_ERROR, statusCode.ERROR);
    }
  }

  async updateReview(req, res, params){
    try {

      const { id, comment, month, year, teacher, students } = params;
      // if (!group_id || !subject_id)
      //   return response(res, null, "Thiếu thông tin lớp học!", statusCode.ERROR);

      if (!id)
        return response(res, null, "Request không hợp lệ!", statusCode.ERROR);

      const subject = await ReviewModel.findOne({ _id: new mongoose.Types.ObjectId(id) });
      if (!subject)
        return response(
          res,
          {},
          language.ITEM_NOT_EXIST.replace("%s", language.SUBJECT),
          statusCode.ERROR
        );

      const alias = BaseHelper.seoURL(comment);

      if (comment) subject.comment = comment;
      subject.alias = alias;
      if (month) subject.month = month;

      if (year) subject.year = year;

      if (teacher) subject.teacher = teacher;

      if(students) subject.students = students;

      const rs = await ReviewModel.updateOne({ _id: new mongoose.Types.ObjectId(id) }, subject);
      if (rs.nModified)
        return response(res, subject, "Thành công", statusCode.OK);

      return response(res, subject, language.ERROR, statusCode.ERROR);
    } catch (err) {
      logError(err);
      return response(res, {}, language.PROCESS_ERROR, statusCode.ERROR);
    }

  }

  async update(req, res, params) {
    try {

      const { id, comment, month, year, teacher } = params;
      const userID = params.user_id || null;
      // if (!group_id || !subject_id)
      //   return response(res, null, "Thiếu thông tin lớp học!", statusCode.ERROR);

      if (!userID)
        return response(
          res,
          null,
          language.CANNOT_EMPTY.replace("%s", "Học sinh"),
          statusCode.ERROR
        );

      if (!id)
        return response(res, null, "Request không hợp lệ!", statusCode.ERROR);

      const subject = await ReviewModel.findOne({ _id: new mongoose.Types.ObjectId(id) });
      if (!subject)
        return response(
          res,
          {},
          language.ITEM_NOT_EXIST.replace("%s", language.SUBJECT),
          statusCode.ERROR
        );

      const usr = await UserModel.findOne({ _id: userID });
      if (!usr)
        return response(
          res,
          null,
          "Học sinh này không tồn tại!",
          statusCode.ERROR
        );
      const alias = BaseHelper.seoURL(comment);
      if (comment) subject.comment = comment;
      subject.alias = alias;
      if (month) subject.month = month;

      if (year) subject.year = year;

      if (teacher) subject.teacher = teacher;

      subject.user = { id: usr.id, name: usr.fullname };
      const rs = await ReviewModel.updateOne({ _id: new mongoose.Types.ObjectId(id) }, subject);
      if (rs.nModified)
        return response(res, subject, "Thành công", statusCode.OK);

      return response(res, subject, language.ERROR, statusCode.ERROR);
    } catch (err) {
      logError(err);
      return response(res, {}, language.PROCESS_ERROR, statusCode.ERROR);
    }
  }

  async updates(req, res, params) {
    try {
      const ids = params.ids || [];
      const classroomID = params.classroom_id || null;
      const subjectId = params.subject_id || null;
      const groupId = params.group_id || null;

      if (!ids.length)
        return response(
          res,
          null,
          "Danh sách id không hợp lệ!",
          statusCode.ERROR
        );

      // Khóa học
      if (!classroomID)
        return response(
          res,
          null,
          language.CANNOT_EMPTY.replace("%s", "khóa học"),
          statusCode.ERROR
        );
      const classroom = await ClassroomModel.findOne({ _id: classroomID });
      if (!classroom)
        return response(
          res,
          null,
          "Khóa học này không tồn tại!",
          statusCode.ERROR
        );

      // Danh mục
      if (!groupId)
        return response(
          res,
          null,
          language.CANNOT_EMPTY.replace("%s", "Danh mục"),
          statusCode.ERROR
        );
      const group = await ClassroomGroupModel.findOne({ _id: groupId });
      if (!group)
        return response(
          res,
          null,
          "Danh mục này không tồn tại!",
          statusCode.ERROR
        );

      // Lớp học
      if (!subjectId)
        return response(
          res,
          null,
          language.CANNOT_EMPTY.replace("%s", "Lớp học"),
          statusCode.ERROR
        );
      const subject = await SubjectModel.findOne({ _id: subjectId });
      if (!subject)
        return response(
          res,
          null,
          "Lớp học này không tồn tại!",
          statusCode.ERROR
        );

      // Data update chung cho tất cả id
      const updateData = {
        classroom: { id: classroomID, name: classroom.name },
        subject: { id: subjectId, name: subject.name },
        classroom_group: { id: groupId, name: group.name },
      };

      // Update nhiều document cùng lúc
      const rs = await ReviewModel.updateMany(
        { _id: { $in: ids } },
        { $set: updateData }
      );

      // Kiểm tra xem có tìm thấy documents không
      if (rs.matchedCount === 0) {
        return response(
          res,
          {},
          "Không tìm thấy bản ghi nào với các ID được cung cấp",
          statusCode.ERROR
        );
      }

      // Nếu có documents được tìm thấy
      if (rs.modifiedCount > 0) {
        return response(res, updateData, "Cập nhật thành công", statusCode.OK);
      }

      // Nếu tìm thấy nhưng không có thay đổi (dữ liệu đã giống nhau)
      return response(
        res,
        updateData,
        "Dữ liệu đã được cập nhật trước đó (không có thay đổi mới)",
        statusCode.OK // Đổi từ ERROR thành OK
      );
    } catch (err) {
      logError(err);
      return response(res, {}, language.PROCESS_ERROR, statusCode.ERROR);
    }
  }

  async delete(req, res, params) {
    try {
      const { ids } = params || [];
      if (ids.length == 0)
        return response(res, null, "Request không hợp lệ!", statusCode.ERROR);

      const rs = await ReviewModel.softDelete({ _id: { $in: ids } }, true);
      if (rs) return response(res, {}, "Thành công", statusCode.OK);
      return response(res, null, language.ERROR, statusCode.ERROR);
    } catch (err) {
      logError(err);
      return response(res, null, language.PROCESS_ERROR, statusCode.ERROR);
    }
  }
  async achievementBoard(req, res) {
    try {
      const { page = 1, limit = 8 } = req.query;

      const pageNum = Math.max(parseInt(page), 1);
      const limitNum = Math.max(parseInt(limit), 1);
      const skip = (pageNum - 1) * limitNum;
      const matchConditions = { deleted_at: null, type: "VINH_DANH" };

      const totalItems = await ReviewModel.db.countDocuments(matchConditions);

      const result = await ReviewModel.db.aggregate([
        { $match: matchConditions },
        { $sort: { year: -1, month: -1, created_at: -1 } },
        { $skip: skip },
        { $limit: limitNum },
        {
          $project: {
            _id: 1,
            comment: 1,
            month: 1,
            year: 1,
            honors: 1,
            classroom: 1,
            classroom_group: 1,
            subject: 1,
          },
        },
      ]);

      const data = result.map((item) => {
        const honors = item.honors || {};
        return {
          id: item._id,
          month: item.month,
          year: item.year,
          title: honors.name || "Vinh danh học sinh",
          avatar: honors.avatar || "/assets/img/logo-ssstudy.svg",
          popup_image: honors.image_popup || null,
          school: honors.school || "",
          classroom: honors.classroom || "",
          comment: item.comment || "",
        };
      });

      return response(res, {
        page: pageNum,
        limit: limitNum,
        totalItems,
        totalPages: Math.ceil(totalItems / limitNum),
        data,
      });
    } catch (err) {
      console.error(err);
      return response(res, null, language.PROCESS_ERROR, statusCode.ERROR);
    }
  }

}

module.exports = new ReviewController();
