const appConfig = require('../../config/app');
const BaseHelper = require('../helpers/BaseHelper');
const BookCategoryModel = require('../models/BookCategory');
const BookModel = require('../models/Book');
const language = BaseHelper.fileToJSON(`${__dirname}/../languages/vi.json`);

class BookCategoryController {
    async listCategory(req, res, params) {
        try {
            const keyword = params.keyword || false;
            const page = parseInt(params.page || appConfig.PAGINATION.PAGE);
            const limit = parseInt(params.limit || appConfig.PAGINATION.LIMIT);
            const subjectID = params.subject_id || null;
            const conditions = { deleted_at: null };

            const options = {
                skip: (page - 1) * limit,
                limit: limit,
                sort: { updated_at: -1 }
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

            if (subjectID)
                conditions['subject.id'] = subjectID;

            if (params.show_on_cart)
                conditions.show_on_cart = true;

            const records = await BookCategoryModel.find(conditions, null, options);
            const total = await BookCategoryModel.count(conditions);
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

    async list(req, res, params) {
        try {
            const keyword = params.keyword || false;
            const page = parseInt(params.page || appConfig.PAGINATION.PAGE);
            const limit = parseInt(params.limit || appConfig.PAGINATION.LIMIT);
            const subjectID = params.subject_id || null;
            const conditions = { deleted_at: null };

            const options = {
                skip: (page - 1) * limit,
                limit: limit,
                sort: { updated_at: -1 }
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

            if (subjectID)
                conditions['subject.id'] = subjectID;

            const records = await BookCategoryModel.find(conditions, null, options);
            const total = await BookCategoryModel.count(conditions);
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

    async detail(req, res, params) {
        try {
            const { id } = params;
            let conditions = { _id: id };
            const rs = await BookCategoryModel.findOne(conditions);

            return response(res, rs, 'Thành công', statusCode.OK);
        } catch (err) {
            logError(err);
            return response(res, null, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }

    async create(req, res, params) {
        try {
            const { name } = params;
            const status = params.status || false;
            const showOnCart = params.show_on_cart || false;

            if (!name)
                return response(res, null, language.CANNOT_EMPTY.replace('%s', language.NAME), statusCode.ERROR);

            const alias = BaseHelper.seoURL(name);
            const docCategory = {
                name,
                alias,
                show_on_cart: showOnCart,
                status
            };

            const category = await BookCategoryModel.create(docCategory);
            if (!category)
                return response(res, {}, language.ERROR, statusCode.ERROR);

            return response(res, category, 'Thành công', statusCode.OK);
        } catch (err) {
            logError(err);
            return response(res, {}, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }

    async update(req, res, params) {
        try {
            const { id, name } = params;
            const status = params.status || false;
            const showOnCart = params.show_on_cart || false;

            if (!id)
                return response(res, null, 'Request không hợp lệ!', statusCode.ERROR);

            const category = await BookCategoryModel.findOne({ _id: id });
            if (!category)
                return response(res, {}, language.ITEM_NOT_EXIST.replace('%s', language.CATEGORY), statusCode.ERROR);

            const alias = BaseHelper.seoURL(name);
            if (name) {
                category.name = name;
                category.alias = alias;
            }

            category.status = status;

            category.show_on_cart = showOnCart;

            const rs = await BookCategoryModel.updateOne({ _id: category.id }, category);
            await BookModel.updateMany({ "category.id": id }, { $set: { "category.name": name } });
            if (rs.nModified)
                return response(res, category, 'Thành công', statusCode.OK);
            return response(res, category, language.ERROR, statusCode.ERROR);
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

            const rs = await BookCategoryModel.softDelete({ _id: { $in: ids } }, true);
            if (rs)
                return response(res, {}, 'Thành công', statusCode.OK);
            return response(res, null, language.ERROR, statusCode.ERROR);
        } catch (err) {
            logError(err);
            return response(res, null, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }
}

module.exports = new BookCategoryController();
