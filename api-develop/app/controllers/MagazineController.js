const appConfig = require('../../config/app');
const BaseHelper = require('../helpers/BaseHelper');
const MagazineModel = require('../models/Magazine');
const UploadService = require('../services/UploadService');
const language = BaseHelper.fileToJSON(`${__dirname}/../languages/vi.json`);

class MagazineController {
    async listPublic(req, res, params) {
        try {
            const keyword = params.keyword || false;
            const page = parseInt(params.page || appConfig.PAGINATION.PAGE);
            const limit = parseInt(params.limit || appConfig.PAGINATION.LIMIT);
            const conditions = { deleted_at: null };
            const teacherID = params.teacher_id || null;
            const options = {
                skip: (page - 1) * limit,
                limit: limit,
                sort: { created_at: -1 }
            };

            if (teacherID)
                conditions['teacher_id'] = teacherID;

            if (keyword) {
                const alias = BaseHelper.seoURL(keyword);
                conditions.alias = { $regex: alias, $options: 'i' };
            }

            const records = await MagazineModel.find(conditions, null, options);
            const total = await MagazineModel.count(conditions);
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

    async list(req, res, params) {
        try {
            const keyword = params.keyword || false;
            const page = parseInt(params.page || appConfig.PAGINATION.PAGE);
            const limit = parseInt(params.limit || appConfig.PAGINATION.LIMIT);
            const conditions = { deleted_at: null };
            const teacherID = params.teacher_id || null;
            const options = {
                skip: (page - 1) * limit,
                limit: limit,
                sort: { created_at: -1 }
            };

            if (teacherID)
                conditions['teacher_id'] = teacherID;

            if (keyword) {
                const alias = BaseHelper.seoURL(keyword);
                conditions.alias = { $regex: alias, $options: 'i' };
            }

            const records = await MagazineModel.find(conditions, null, options);
            const total = await MagazineModel.count(conditions);
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
            const rs = await MagazineModel.findOne(conditions);
            return response(res, rs, 'Thành công', statusCode.OK);
        } catch (err) {
            logError(err);
            return response(res, null, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }

    async create(req, res, params) {
        try {
            const { name, external_link, content, teacher_id, description, files } = params;
            const status = params.status || appConfig.STATUS.INACTIVE;

            if (!name)
                return response(res, null, language.CANNOT_EMPTY.replace('%s', language.NAME), statusCode.ERROR);

            const alias = BaseHelper.seoURL(name.trim()) + '-' + new Date().getTime();
            const _doc = {
                name,
                alias,
                external_link,
                description,
                content,
                teacher_id,
                status
            };

            if (files && files.length > 0) {
                const fileData = await UploadService.upload(files[0], 'base64', 'blog');
                if (fileData) {
                    _doc.image = appConfig.FILE_DOMAIN + '/' + fileData[0];
                }
            }

            const item = await MagazineModel.create(_doc);
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
            const { id, name, external_link, description, content, teacher_id, files } = params;
            const status = params.status || appConfig.STATUS.INACTIVE;

            if (!id)
                return response(res, null, 'Request không hợp lệ!', statusCode.ERROR);

            const item = await MagazineModel.findOne({ _id: id });
            if (!item)
                return response(res, {}, language.ITEM_NOT_EXIST.replace('%s', 'Bài viết'), statusCode.ERROR);

            if (name) {
                item.name = name;
            }

            item.status = status;
            item.description = description;
            item.content = content;
            item.external_link = external_link;
            item.teacher_id = teacher_id;

            if (files && files.length > 0) {
                const fileData = await UploadService.upload(files[0], 'base64', 'blogs');
                if (fileData) {
                    _doc.image = appConfig.FILE_DOMAIN + '/' + fileData[0];
                }
            }

            const rs = await MagazineModel.updateOne({ _id: id }, item);
            if (rs.nModified)
                return response(res, item, 'Thành công', statusCode.OK);
            return response(res, item, language.ERROR, statusCode.ERROR);
        } catch (err) {
            logError(err);
            return response(res, {}, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }

    async delete(req, res, params) {
        try {
            const { ids } = params || [];
            if (ids.length == 0)
                return response(res, null, 'Request không hợp lệ!', statusCode.ERROR);

            const rs = await MagazineModel.softDelete({ _id: { $in: ids } }, true);
            if (rs)
                return response(res, {}, 'Thành công', statusCode.OK);
            return response(res, null, language.ERROR, statusCode.ERROR);
        } catch (err) {
            logError(err);
            return response(res, null, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }
}

module.exports = new MagazineController();
