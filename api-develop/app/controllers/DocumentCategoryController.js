const appConfig = require('../../config/app');
const BaseHelper = require('../helpers/BaseHelper');
const DocumentCategoryModel = require('../models/DocumentCategory');
const DocumentModel = require('../models/Document');
const SubjectModel = require('../models/Subject');
const language = BaseHelper.fileToJSON(`${__dirname}/../languages/vi.json`);

class DocumentCategoryController {
    async listCategory(req, res, params) {
        try {
            const keyword = params.keyword || false;
            const page = parseInt(params.page || appConfig.PAGINATION.PAGE);
            const limit = parseInt(params.limit || appConfig.PAGINATION.LIMIT);
            const conditions = { deleted_at: null, status: true };

            const options = {
                skip: (page - 1) * limit,
                limit: limit,
                sort: { updated_at: -1 }
            };

            if (keyword) {
                const alias = BaseHelper.seoURL(keyword);
                conditions.alias = { $regex: alias, $options: 'i' };
            }

            const records = await DocumentCategoryModel.find(conditions, null, options);
            const total = await DocumentCategoryModel.count(conditions);
            const data = {
                records,
                totalRecord: total,
                perPage: limit
            };
            return response(res, data, 'Thành công', statusCode.OK);
        } catch (err) {
            logError(err);
            console.log(err);

            return response(res, null, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }

    async list(req, res, params) {
        try {
            const keyword = params.keyword || false;
            const page = parseInt(params.page || appConfig.PAGINATION.PAGE);
            const limit = parseInt(params.limit || appConfig.PAGINATION.LIMIT);
            const sort_key = params.sort_key || 'updated_at';
            const sort_value = parseInt(params.sort_value || -1);
            const conditions = { deleted_at: null };

            const options = {
                skip: (page - 1) * limit,
                limit: limit,
                sort: { [sort_key]: sort_value }
            };

            if (keyword) {
                const alias = BaseHelper.seoURL(keyword);
                conditions.alias = { $regex: alias, $options: 'i' };
            }

            const records = await DocumentCategoryModel.find(conditions, null, options);
            const total = await DocumentCategoryModel.count(conditions);
            const data = {
                records,
                totalRecord: total,
                perPage: limit
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
            let conditions = { _id: id };
            const rs = await DocumentCategoryModel.findOne(conditions);
            if (!rs)
                return response(res, null, language.ITEM_NOT_EXIST.replace('%s', language.CATEGORY), statusCode.ERROR);
            return response(res, rs, 'Thành công', statusCode.OK);
        } catch (err) {
            logError(err);
            console.log(err);

            return response(res, null, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }

    async create(req, res, params) {
        try {
            const name = params.name;
            const status = params.status || false;
            const ordering = params.ordering || 0;
            const google_name = params.google_name || null;
            const google_description = params.google_description || null;
            const url = params.url || null;
            const sub_categories = params.sub_categories || [];
            if (!name)
                return response(res, null, "Chưa có tên danh mục cha", statusCode.ERROR);

            const existingCategory = await DocumentCategoryModel.findOne({ name: name, deleted_at: null });
            if (existingCategory)
                return response(res, null, 'Danh mục đã tồn tại', statusCode.ERROR);
            const alias = BaseHelper.seoURL(name);
            const docCategory = {
                name,
                alias,
                google_name,
                google_description,
                url,
                sub_categories,
                ordering,
                status
            };

            const category = await DocumentCategoryModel.create(docCategory);
            if (!category)
                return response(res, {}, language.ERROR, statusCode.ERROR);

            return response(res, category, 'Thành công', statusCode.OK);
        } catch (err) {
            logError(err);
            console.log(err);
            return response(res, {}, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }

    async update(req, res, params) {
        try {
            const { id, name } = params;
            const status = params.status || false;
            const ordering = params.ordering || 0;
            const google_name = params.google_name || null;
            const google_description = params.google_description || null;
            const url = params.url || null;
            const sub_categories = params.sub_categories || [];

            if (!id)
                return response(res, null, 'Request không hợp lệ!', statusCode.ERROR);


            const category = await DocumentCategoryModel.findOne({ _id: id });
            if (!category)
                return response(res, {}, language.ITEM_NOT_EXIST.replace('%s', language.CATEGORY), statusCode.ERROR);

            const alias = BaseHelper.seoURL(name);
            if (google_name)
                category.google_name = google_name;
            if (google_description)
                category.google_description = google_description;
            if (url)
                category.url = url;
            if (sub_categories)
                category.sub_categories = sub_categories;
            if (name) {
                category.name = name;
                category.alias = alias;
            }
            category.status = status;
            if (ordering)
                category.ordering = ordering;

            const rs = await DocumentCategoryModel.updateOne({ _id: category.id }, category);
            if (rs.nModified)
                return response(res, category, 'Thành công', statusCode.OK);
            return response(res, category, language.ERROR, statusCode.ERROR);
        } catch (err) {
            logError(err);
            console.log(err);

            return response(res, {}, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }

    async delete(req, res, params) {
        try {
            const { ids } = params || [];
            if (ids.length == 0)
                return response(res, null, 'Request không hợp lệ!', statusCode.ERROR);
            const usedCategory = await DocumentModel.findOne({
                'category.id': { $in: ids },
                deleted_at: null
            });
            if (usedCategory)
                return response(res, null, 'Không thể xóa danh mục đang được sử dụng!', statusCode.ERROR);
            const rs = await DocumentCategoryModel.softDelete({ _id: { $in: ids } }, true);
            if (rs)
                return response(res, {}, 'Thành công', statusCode.OK);
            return response(res, null, language.ERROR, statusCode.ERROR);
        } catch (err) {
            logError(err);
            console.log(err);

            return response(res, null, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }
}

module.exports = new DocumentCategoryController();
