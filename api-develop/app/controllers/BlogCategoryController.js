const appConfig = require('../../config/app');
const BaseHelper = require('../helpers/BaseHelper');
const BlogCategoryModel = require('../models/BlogCategory');
const BlogPostModel = require('../models/BlogPost');
const language = BaseHelper.fileToJSON(`${__dirname}/../languages/vi.json`);

class BlogCategoryController {
    async listWithCountPublic(req, res, params) {
        try {
            const conditions = { deleted_at: null, status: true };
            const options = { sort: { updated_at: -1 } };

            const categories = await BlogCategoryModel.find(conditions, null, options);
            const categoryIds = categories.map(c => c._id);

            let countsMap = {};
            if (categoryIds.length > 0) {
                const counts = await BlogPostModel.aggregate([
                    { $match: { deleted_at: null } },
                    { $group: { _id: '$category.id', count: { $sum: 1 } } }
                ]);

                countsMap = counts.reduce((acc, cur) => {
                    acc[String(cur._id)] = cur.count;
                    return acc;
                }, {});
            }

            for (let i = 0; i < categories.length; i++) {
                const cat = categories[i];
                cat._doc.post_count = countsMap[String(cat._id)] || 0;
            }

            const data = { records: categories };
            return response(res, data, 'Thành công', statusCode.OK);
        } catch (err) {
            logError(err);
            return response(res, null, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }
    async listPublic(req, res, params) {
        try {
            const conditions = { deleted_at: null, status: true };
            const options = { sort: { updated_at: -1 } };

            const records = await BlogCategoryModel.find(conditions, null, options);
            const data = { records };
            return response(res, data, 'Thành công', statusCode.OK);
        } catch (err) {
            logError(err);
            return response(res, null, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }
    async listCategory(req, res, params) {
        try {
            const keyword = params.keyword || false;
            const page = parseInt(params.page || appConfig.PAGINATION.PAGE);
            const limit = parseInt(params.limit || appConfig.PAGINATION.LIMIT);
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

            const records = await BlogCategoryModel.find(conditions, null, options);
            const total = await BlogCategoryModel.count(conditions);
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

            const records = await BlogCategoryModel.find(conditions, null, options);
            const total = await BlogCategoryModel.count(conditions);
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
    async listStudent(req, res, params) {
        try {
            const keyword = params.keyword || false;
            const page = parseInt(params.page || appConfig.PAGINATION.PAGE);
            const limit = parseInt(params.limit || appConfig.PAGINATION.LIMIT);
            const conditions = { deleted_at: null };
            conditions["category.name"]= "Câu chuyện học viên";
            const options = {
                skip: (page - 1) * limit,
                limit: limit,
                sort: { updated_at: -1 }
            };

            if (keyword) {
                const alias = BaseHelper.seoURL(keyword);
                conditions.alias = { $regex: alias, $options: 'i' };
            }

            const records = await BlogCategoryModel.find(conditions, null, options);
            const total = await BlogCategoryModel.count(conditions);
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
            const rs = await BlogCategoryModel.findOne(conditions);

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
            const isFeatured = params.is_featured || false;

            if (!name)
                return response(res, null, language.CANNOT_EMPTY.replace('%s', language.NAME), statusCode.ERROR);

            // Guard: allow max 3 featured categories
            if (isFeatured && status) {
                const featuredCount = await BlogCategoryModel.count({ deleted_at: null, is_featured: true, status: true });
                if (featuredCount >= 3) {
                    return response(
                        res,
                        null,
                        'Danh mục nổi bật trang chủ đã đủ tối đa 3 lựa chọn, để chọn nổi bật cho danh mục này, vui lòng tắt nổi bật của danh mục khác',
                        statusCode.ERROR
                    );
                }
            }

            const alias = BaseHelper.seoURL(name);
            const docCategory = {
                name,
                alias,
                status,
                is_featured: isFeatured
            };

            const category = await BlogCategoryModel.create(docCategory);
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
            const status = (typeof params.status !== 'undefined') ? params.status : null;
            const isFeatured = (typeof params.is_featured !== 'undefined') ? params.is_featured : null;

            if (!id)
                return response(res, null, 'Request không hợp lệ!', statusCode.ERROR);

            const category = await BlogCategoryModel.findOne({ _id: id });
            if (!category)
                return response(res, {}, language.ITEM_NOT_EXIST.replace('%s', language.CATEGORY), statusCode.ERROR);

            if (name) {
                const alias = BaseHelper.seoURL(name);
                category.name = name;
                category.alias = alias;
            }

            // Enforce "max 3 active featured" only if next state will be active and featured
            const nextStatus = (status !== null) ? status : category.status;
            const nextFeatured = (isFeatured !== null) ? isFeatured : category.is_featured;
            if (nextStatus === true && nextFeatured === true) {
                const featuredCount = await BlogCategoryModel.count({ deleted_at: null, is_featured: true, status: true, _id: { $ne: category._id } });
                if (featuredCount >= 3) {
                    return response(
                        res,
                        null,
                        'Danh mục nổi bật trang chủ đã đủ tối đa 3 lựa chọn, để chọn nổi bật cho danh mục này, vui lòng tắt nổi bật của danh mục khác',
                        statusCode.ERROR
                    );
                }
            }

            if (status !== null) {
                category.status = status;
            }
            if (isFeatured !== null) {
                category.is_featured = isFeatured;
            }


            const rs = await BlogCategoryModel.updateOne({ _id: category._id }, category);
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

            const rs = await BlogCategoryModel.softDelete({ _id: { $in: ids } }, true);
            if (rs)
                return response(res, {}, 'Thành công', statusCode.OK);
            return response(res, null, language.ERROR, statusCode.ERROR);
        } catch (err) {
            logError(err);
            return response(res, null, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }
}

module.exports = new BlogCategoryController();
