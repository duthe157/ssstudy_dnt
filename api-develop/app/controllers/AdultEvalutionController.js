const appConfig = require('../../config/app');
const BaseHelper = require('../helpers/BaseHelper');
const AdultEvalutionModel = require('../models/AdultEvalution');
const ReviewModel = require('../models/Review');
const UploadService = require('../services/UploadService');
const mongoose = require("mongoose");
const ClassroomModel = require("../models/Classroom");
const ClassroomGroupModel = require("../models/ClassroomGroup");
const SubjectModel = require("../models/Subject");
const language = BaseHelper.fileToJSON(`${__dirname}/../languages/vi.json`);

class AdultEvalutionController {
  async list(req, res, params) {
    try {
      const keyword = params.keyword || false;
      const page = parseInt(params.page || appConfig.PAGINATION.PAGE);
      const limit = parseInt(params.limit || appConfig.PAGINATION.LIMIT);
      const type = params.type;
      const conditions = {deleted_at: null, hiden: {$ne: true}};
      if (type != null)
        switch (type) {
          case 0:
            conditions.type = {$in: ["DANHGIA_HOCSINH", "HOC_SINH"]};
            break

          case 1:
            conditions.type = {$in: ["DANHGIA_PHUHUYNH", "PHU_HUYNH"]};
            break

          case 'DANHGIA_PHUHUYNH':
            conditions.type = {$in: ['DANHGIA_PHUHUYNH']};
            break

          case 'TOP_RANKS': {
            conditions.type = {$in: ["TOP_RANKS"]};
            break;
          }

          case 'HOC_SINH':
            conditions.type = {$in: ["HOC_SINH"]};
            break;

          default:
            conditions.type = {$in: ['HOC_SINH', 'DANHGIA_PHUHUYNH', 'TOP_RANKS']};
            break
        }
      const options = {
        skip: (page - 1) * limit,
        limit: limit,
        sort: {created_at: -1}
      };
      if (keyword) {
        const alias = BaseHelper.seoURL(keyword);
        conditions.alias = {$regex: alias, $options: 'i'};
      }
      const review = await ReviewModel.find(conditions, null, options);
      const records = await AdultEvalutionModel.find(conditions, null, options);
      const total = await AdultEvalutionModel.count(conditions) + await ReviewModel.count(conditions);
      const data = {
        records: [...review, ...records],
        totalRecord: total,
        perPage: limit,
        totalPages: Math.ceil(total / limit)
      };
      return response(res, data, 'Thành công', statusCode.OK);
    } catch (err) {
      logError(err);
      return response(res, null, language.PROCESS_ERROR, statusCode.ERROR);
    }
  }

  getDoc = async (model, id, notFoundMsg) => {
    const doc = await model.findOne({ _id: id });
    if (!doc)
      throw new Error(notFoundMsg);
    return doc;
  };


  async detail(req, res, params) {
    try {
      const {id} = params;
      const conditions = {_id:  new mongoose.Types.ObjectId(id)};
      let rs = await AdultEvalutionModel.findOne(conditions);
      if (!rs)
        rs = await ReviewModel.findOne(conditions);

      return response(res, rs, 'Thành công', statusCode.OK);
    } catch (err) {
      logError(err);
      return response(res, null, language.PROCESS_ERROR, statusCode.ERROR);
    }
  }

  async create(req, res, params) {
    try {
      const {
        name, content, description, files, image, address, score, data_json
      } = params;
      const type = params.type || 'DANHGIA_PHUHUYNH';
      const status = params.status || appConfig.STATUS.INACTIVE;

      if (!name)
        return response(res, null, language.CANNOT_EMPTY.replace('%s', language.NAME), statusCode.ERROR);

      let classroom = {};
      if (!!params?.classroom_id)
        classroom = await this.getDoc(ClassroomModel, params?.classroom_id, "Khóa học này không tồn tại!") || {}

      let group = {};
      if(!!params?.group_id)
        group = await this.getDoc(ClassroomGroupModel, params?.group_id, "Danh mục này không tồn tại!") || {};

      let subject = {}
      if(!!params?.subject_id)
        subject =await this.getDoc(SubjectModel, params?.subject_id, "Lớp học này không tồn tại!") || {};

      const alias = BaseHelper.seoURL(name.trim()) + '-' + new Date().getTime();
      const _doc = {
        name,
        alias,
        content,
        description,
        type,
        status,
        address,
        score,
        image,
        classroom: { id: params?.classroom_id || "", name: classroom.name || "" },
        subject: { id: params?.subject_id || "", name: subject.name || "" },
        classroom_group: { id: params?.group_id || "", name: group.name || "" },
        data_json
      };

      if (files && files.length > 0) {
        const fileData = await UploadService.upload(files[0], 'base64', 'evalution');
        if (fileData) {
          _doc.image = appConfig.FILE_DOMAIN + '/' + fileData[0];
        }
      }

      const item = await AdultEvalutionModel.create(_doc);
      if (!item)
        return response(res, {}, language.ERROR, statusCode.ERROR);

      return response(res, item, 'Thành công', statusCode.OK);
    } catch (err) {
      logError(err);
      return response(res, {}, language.PROCESS_ERROR, statusCode.ERROR);
    }
  }

  async update(req, res, params) {
    try {
      const {id, name, content, description, files, data_json} = params;
      const type = params.type || 'DANHGIA_PHUHUYNH';
      const status = params.status || appConfig.STATUS.INACTIVE;

      if (!id)
        return response(res, null, 'Request không hợp lệ!', statusCode.ERROR);

      const _id = new mongoose.Types.ObjectId(id);

      const item = await AdultEvalutionModel.findOne({_id});
      if (!item)
        return response(res, {}, language.ITEM_NOT_EXIST.replace('%s', 'Đánh giá phụ huynh'), statusCode.ERROR);

      if (name) {
        item.name = name;
      }

      item.status = status;
      item.description = description;
      item.content = content;
      item.type = type;
      item.data_json = data_json;

      let classroom = {};
      if (!!params?.classroom_id)
        classroom = await this.getDoc(ClassroomModel, params?.classroom_id, "Khóa học này không tồn tại!") || {}

      let group = {};
      if(!!params?.group_id)
        group = await this.getDoc(ClassroomGroupModel, params?.group_id, "Danh mục này không tồn tại!") || {};

      let subject = {}
      if(!!params?.subject_id)
        subject =await this.getDoc(SubjectModel, params?.subject_id, "Lớp học này không tồn tại!") || {};

      item.classroom = { id: params?.classroom_id || "", name: classroom.name || "" };
      item.subject = { id: params?.subject_id || "", name: subject.name || "" };
      item.classroom_group = { id: params?.group_id || "", name: group.name || "" };

      if (files && files.length > 0) {
        const fileData = await UploadService.upload(files[0], 'base64', 'evalution');
        if (fileData) {
          item.image = appConfig.FILE_DOMAIN + '/' + fileData[0];
        }
      }

      const rs = await AdultEvalutionModel.updateOne({_id}, item);

      if (rs.nModified)
        return response(res, rs, 'Thành công', statusCode.OK);

      return response(res, {}, language.ERROR, statusCode.ERROR);
    } catch (err) {
      logError(err);
      return response(res, {}, language.PROCESS_ERROR, statusCode.ERROR);
    }
  }

  async delete(req, res, params) {
    try {
      const {ids} = params || [];
      if (ids.length == 0)
        return response(res, null, 'Request không hợp lệ!', statusCode.ERROR);

      const rs = await AdultEvalutionModel.softDelete({_id: {$in: ids}}, true);
      if (rs)
        return response(res, {}, 'Thành công', statusCode.OK);
      return response(res, null, language.ERROR, statusCode.ERROR);
    } catch (err) {
      logError(err);
      return response(res, null, language.PROCESS_ERROR, statusCode.ERROR);
    }
  }
}

module.exports = new AdultEvalutionController();
