const cf = require("../../config/config");
const appConfig = require("../../config/app");
const BaseHelper = require("../helpers/BaseHelper");
const ClassroomGroupModel = require("../models/ClassroomGroup");
const ClassroomModel = require("../models/Classroom");
const SubjectModel = require("../models/Subject");
const UploadService = require("../services/UploadService");

class ClassroomGroupController {
    async listByGroup(req, res) {
        try {
            let conditions = {};
            const arrayData = [];

      const options = { limit: 8, sort: { ordering: 1 } };
      conditions = {
        status: true,
        deleted_at: null,
      };
      let records = await ClassroomGroupModel.find(conditions, null, options);
      for (let i = 0; i < records.length; i++) {
        const _record = records[i].toObject();
        conditions = {
          "group.id": records[i]._id,
          status: true,
          deleted_at: null,
        };

                const classrooms = await ClassroomModel.find(conditions, null, options);
                _record.classrooms = classrooms;
                arrayData.push(_record);
            }

      return response(res, arrayData, "Success", statusCode.OK);
    } catch (err) {
      logError(err);
      return response(res, null, "Error", statusCode.ERROR);
    }
  }

    async listPublic(req, res, params) {
        try {
            const keyword = params.keyword || false;
            const page = parseInt(params.page || appConfig.PAGINATION.PAGE);
            const limit = parseInt(params.limit || appConfig.PAGINATION.LIMIT);
            const subjectID = params.subject_id || null;

            const conditions = { deleted_at: null, status: true };

      const options = {
        skip: (page - 1) * limit,
        limit: limit,
        sort: { created_at: -1 },
      };

      if (keyword) {
        const alias = BaseHelper.seoURL(keyword);
        conditions.alias = { $regex: alias, $options: "i" };
      }

      if (subjectID) {
        conditions["subject.id"] = subjectID;
        if (typeof subjectID === "array" && subjectID.length > 0) {
          conditions["subject.id"] = {
            $in: subjectID,
          };
        }
      }

      const records = await ClassroomGroupModel.find(conditions, null, options);
      const total = await ClassroomGroupModel.count(conditions);
      const data = {
        records,
        total,
      };
      return response(res, data, "Success", statusCode.OK);
    } catch (err) {
      logError(err);
      return response(res, null, "Error", statusCode.ERROR);
    }
  }

  async listClassroomGroup(req, res, params) {
    try {
      let conditions = {
        status: true,
        is_show_home: true,
        deleted_at: null,
      };
      const classroomGroups = await ClassroomGroupModel.find(
        conditions,
        "name banner image is_show_home status subject",
        { limit: 100, sort: { ordering: 1 } }
      );
      const classroomGroupHomeBlocks = [];
      const megaMenuHome = [];
      const options = { limit: 16, sort: { ordering: 1 } };
      for (let i = 0; i < classroomGroups.length; i++) {
        const _record = classroomGroups[i].toObject();
        const _recordMenu = classroomGroups[i].toObject();
        conditions = {
          "group.id": _record._id,
          deleted_at: null,
          status: true,
          is_featured: true,
          is_online: true,
        };
        const projection =
          "name video_intro alias banner subject group level image teacher promotion teacher_id code rating price origin_price";
        const classrooms = await ClassroomModel.find(
          conditions,
          projection,
          options
        );
        _record.classrooms = classrooms;
        classroomGroupHomeBlocks.push(_record);

        const listSubjects = [];
        for (let j = 0; j < classrooms.length; j++) {
          const index = listSubjects.findIndex(
            (x) => x.subject_id === classrooms[j].subject.id
          );
          if (index < 0) {
            listSubjects.push({
              subject_id: classrooms[j].subject.id,
              subject_name: classrooms[j].subject.name,
              classrooms: [classrooms[j]],
            });
          } else {
            listSubjects[index].classrooms.push(classrooms[j]);
          }
        }
        _recordMenu.list_subjects = listSubjects;
        megaMenuHome.push(_recordMenu);
      }
      const data = megaMenuHome.filter(
        (item) => item.list_subjects.length !== 0
      );
      return response(res, data, "Success", statusCode.OK);
    } catch (err) {
      logError(err);
      return response(res, null, "Error", statusCode.ERROR);
    }
  }

  async list(req, res, params) {
    try {
      const keyword = params.keyword || null;
      const page = parseInt(params.page || appConfig.PAGINATION.PAGE, 10);
      const limit = parseInt(params.limit || appConfig.PAGINATION.LIMIT, 10);
      const subjectID = params.subject_id || null;
      const classroomID = params.classroom_id || null;
      const isShowHome = params.is_show_home || null;

            const conditions = { deleted_at: null };

      const options = {
        skip: (page - 1) * limit,
        limit: limit,
        sort: { created_at: -1 },
      };

      if (keyword) {
        const alias = BaseHelper.seoURL(keyword);
        conditions.alias = { $regex: alias, $options: "i" };
      }

      let data = {};

      if (classroomID) {
        const classroom = await ClassroomModel.findOne({ _id: classroomID });
        if (!classroom) {
          return response(
            res,
            { records: [], total: 0 },
            "Classroom not found",
            statusCode.ERROR
          );
        }
        const groups = Array.isArray(classroom.group)
          ? classroom.group
          : classroom.group
          ? [classroom.group]
          : [];

        const groupIds = groups.map((g) => g.id).filter(Boolean);

        if (groupIds.length === 0) {
          return response(
            res,
            { records: [], total: 0 },
            "No groups found",
            statusCode.ERROR
          );
        }
        const groupConditions = { _id: { $in: groupIds }, deleted_at: null };
        if (subjectID) groupConditions["subject.id"] = subjectID;

        const [records, total] = await Promise.all([
          ClassroomGroupModel.find(groupConditions, null, options),
          ClassroomGroupModel.count(groupConditions),
        ]);

        data = { records, total };
      } else {
        if (isShowHome) conditions.is_show_home = isShowHome;
        if (subjectID) conditions["subject.id"] = subjectID;

        const [records, total] = await Promise.all([
          ClassroomGroupModel.find(conditions, null, options),
          ClassroomGroupModel.count(conditions),
        ]);

        data = { records, total };
      }

      return response(res, data, "Success", statusCode.OK);
    } catch (err) {
      console.error("Error in ClassroomGroupController.list:", err);
      return response(res, null, "Error", statusCode.ERROR);
    }
  }

    async detail(req, res, params) {
        try {
            const { id } = params;

      const conditions = { _id: id };
      const rs = await ClassroomGroupModel.findOne(conditions);
      return response(res, rs, "Success", statusCode.OK);
    } catch (err) {
      logError(err);
      return response(res, null, "Error", statusCode.ERROR);
    }
  }

    async create(req, res, params) {
        try {
            const { name, content, files, banner } = params;
            const status = params.status || false;
            const isShowHome = params.is_show_home || false;
            const subjectID = params.subject_id || null;
            const ordering = params.ordering || 0;
            const showOnCart = params.show_on_cart || false;

      if (!name)
        return response(
          res,
          null,
          language.CANNOT_EMPTY.replace("%s", language.NAME),
          statusCode.ERROR
        );

            // if (!subjectID)
            // return response(res, null, language.CANNOT_EMPTY.replace('%s', language.SUBJECT), statusCode.ERROR);

      let subject = null;
      if (subjectID) subject = await SubjectModel.findOne({ _id: subjectID });

            // if (!subject)
            // return response(res, null, language.ITEM_NOT_EXIST.replace('%s', language.SUBJECT), statusCode.ERROR);

            let alias = BaseHelper.seoURL(name);
            alias = alias;

      const checkGroup = await ClassroomGroupModel.count({ alias: alias });
      if (checkGroup)
        return response(res, null, "Cấp độ này đã tồn tại!", statusCode.ERROR);

      const doc = {
        name,
        alias,
        content,
        ordering,
        status,
        show_on_cart: showOnCart,
        is_show_home: isShowHome,
      };

      if (subject) doc.subject = { id: subject.id, name: subject.name };

      if (files && files.length > 0) {
        const fileData = await UploadService.upload(
          files[0],
          "base64",
          "classrooms"
        );
        if (fileData) {
          doc.image = appConfig.FILE_DOMAIN + "/" + fileData[0];
        }
      }

      if (banner && banner.length > 0) {
        const fileData = await UploadService.upload(
          banner[0],
          "base64",
          "classrooms"
        );
        if (fileData) {
          doc.banner = appConfig.FILE_DOMAIN + "/" + fileData[0];
        }
      }

      const group = await ClassroomGroupModel.create(doc);
      if (!group) return response(res, {}, language.ERROR, statusCode.ERROR);

      return response(res, group, "Success", statusCode.OK);
    } catch (err) {
      logError(err);
      return response(res, {}, "Error", statusCode.ERROR);
    }
  }

  async update(req, res, params) {
    try {
      const { id, name, content, files, banner } = params;
      const status = params.status;
      const ordering = params.ordering || 0;
      const subjectID = params.subject_id || null;
      const isShowHome = params.is_show_home;
      const showOnCart = params.show_on_cart;

      if (!id)
        return response(res, null, "Request không hợp lệ!", statusCode.ERROR);

            let alias = BaseHelper.seoURL(name);
            alias = alias;

      const checkGroup = await ClassroomGroupModel.count({
        alias: alias,
        _id: { $nin: [id] },
      });
      if (checkGroup)
        return response(res, null, "Cấp độ này đã tồn tại!", statusCode.ERROR);

      const group = await ClassroomGroupModel.findOne({ _id: id });
      if (!group)
        return response(
          res,
          {},
          language.ITEM_NOT_EXIST.replace("%s", language.CATEGORY),
          statusCode.ERROR
        );

            let subject = null;
            if (subjectID && subjectID !== "")
                subject = await SubjectModel.findOne({ _id: subjectID });

            /*if (!subject)
                return response(res, null, language.ITEM_NOT_EXIST.replace('%s', language.SUBJECT), statusCode.ERROR);*/

            if (name) {
                group.name = name;
                group.alias = alias;
            }

      if (content) group.content = content;

      if (subjectID) group.subject = { id: subject.id, name: subject.name };

      if (status !== undefined) group.status = status;
      if (showOnCart !== undefined) group.show_on_cart = showOnCart;
      if (isShowHome !== undefined) group.is_show_home = isShowHome;

      group.ordering = ordering;

      if (files && files.length > 0) {
        const fileData = await UploadService.upload(
          files[0],
          "base64",
          "classrooms"
        );
        if (fileData) {
          group.image = appConfig.FILE_DOMAIN + "/" + fileData[0];
        }
      }

      if (banner && banner.length > 0) {
        const fileData = await UploadService.upload(
          banner[0],
          "base64",
          "classrooms"
        );
        if (fileData) {
          group.banner = appConfig.FILE_DOMAIN + "/" + fileData[0];
        }
      }

      const rs = await ClassroomGroupModel.updateOne({ _id: group.id }, group);
      if (rs.nModified) return response(res, group, "Success", statusCode.OK);
      return response(res, group, language.ERROR, statusCode.ERROR);
    } catch (err) {
      logError(err);
      console.log(err);
      return response(res, {}, "Error", statusCode.ERROR);
    }
  }

  async delete(req, res, params) {
    try {
      const { ids } = params || [];
      if (ids.length == 0)
        return response(res, null, "Request không hợp lệ!", statusCode.ERROR);

      const rs = await ClassroomGroupModel.softDelete(
        { _id: { $in: ids } },
        true
      );
      if (rs) {
        return response(res, {}, "Success", statusCode.OK);
      }

      return response(res, null, language.ERROR, statusCode.ERROR);
    } catch (err) {
      logError(err);
      console.log(err);
      return response(res, null, "Error", statusCode.ERROR);
    }
  }
}

module.exports = new ClassroomGroupController();
