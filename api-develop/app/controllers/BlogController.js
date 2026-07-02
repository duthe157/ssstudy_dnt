const appConfig = require('../../config/app');
const BaseHelper = require('../helpers/BaseHelper');
const BlogPostModel = require('../models/BlogPost');
const BlogCategoryModel = require('../models/BlogCategory');
const UploadService = require('../services/UploadService');
const language = BaseHelper.fileToJSON(`${__dirname}/../languages/vi.json`);

class BlogController {
    async topCategoriesPosts(req, res, params) {
        try {

            const status = params.status || true;
            const limit = params.limit || 10;

            const conditions = { status: true, deleted_at: null };

            // Prefer status=true, then newest created_at, and fill up to limit
            const leftData = await BlogPostModel.find(
                conditions,
                null,
                { sort: { is_featured: -1, created_at: -1 }, limit: limit }
            );
            const leftIds = new Set(leftData.map(p => String(p._id || p.id)));

            // 1) Pick up to 3 categories: prefer status=true, then newest created/updated
            const categories = await BlogCategoryModel.find(
                { status: true, deleted_at: null },
                null,
                { sort: { is_featured: -1, created_at: -1, updated_at: -1 }, limit: 3 }
            );

            if (!categories || categories.length === 0)
                return response(res, { groups: [] }, 'Thành công', statusCode.OK);

            const groups = [];
            for (let i = 0; i < categories.length; i++) {
                const cat = categories[i];
                const posts = await BlogPostModel.find(
                    { 'category.id': cat._id, status: true, deleted_at: null },
                    null,
                    { sort: { created_at: -1 } }
                );
                const filteredPosts = posts.filter(p => !leftIds.has(String(p._id || p.id)));
                groups.push({ category: { id: cat._id, name: cat.name }, posts: filteredPosts });
            }

            return response(res, { leftData: leftData, rightData: groups }, 'Thành công', statusCode.OK);
        } catch (err) {
            logError(err);
            return response(res, null, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }

    async listFilter(req, res, params) {
        try {

            const data = { records };
            return response(res, data, 'Thành công', statusCode.OK);
        } catch (err) {
            logError(err);
            return response(res, null, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }

    async latestByCategory(req, res, params) {
        try {
            const categoryID = params.category_id;
            if (!categoryID)
                return response(res, null, 'Request không hợp lệ!', statusCode.ERROR);

            const records = await BlogPostModel.find(
                { deleted_at: null, 'category.id': categoryID },
                null,
                { sort: { created_at: -1 }, limit: 4 }
            );
            return response(res, { records }, 'Thành công', statusCode.OK);
        } catch (err) {
            logError(err);
            return response(res, null, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }

    async featuredByCategory(req, res, params) {
        try {
            const categoryID = params.category_id;
            if (!categoryID)
                return response(res, null, 'Request không hợp lệ!', statusCode.ERROR);

            const records = await BlogPostModel.find(
                { deleted_at: null, 'category.id': categoryID, is_featured: true },
                null,
                { sort: { created_at: -1 }, limit: 3 }
            );
            return response(res, { records }, 'Thành công', statusCode.OK);
        } catch (err) {
            logError(err);
            return response(res, null, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }

    async randomByCategoryExclude(req, res, params) {
        try {
            const categoryID = params.category_id;
            const excludeIds = Array.isArray(params.exclude_ids) ? params.exclude_ids : [];
            if (!categoryID)
                return response(res, null, 'Request không hợp lệ!', statusCode.ERROR);

            const match = { deleted_at: null, 'category.id': categoryID };
            if (excludeIds.length > 0) {
                match._id = { $nin: excludeIds };
            }

            const records = await BlogPostModel.aggregate([
                { $match: match },
                { $sample: { size: 4 } }
            ]);

            return response(res, { records }, 'Thành công', statusCode.OK);
        } catch (err) {
            logError(err);
            return response(res, null, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }
    async listStudentStory(req, res, params) {
        try {
            const conditions = { deleted_at: null };
            const page = parseInt(params.page || appConfig.PAGINATION.PAGE);
            const limit = parseInt(params.limit || appConfig.PAGINATION.LIMIT);
            const categoryName = "Câu Chuyện Học Viên";
            const categoryId = params.category_id;
            const sortBy = 'updated_at';
            const sortOrder =
                params.sort_order === 'asc' ? 1 : -1;
            const options = {
                skip: (page - 1) * limit,
                limit: limit,
                sort: { [sortBy]: sortOrder }
            };
            if (categoryName) {
                conditions['category.name'] = categoryName;
            }
            if (categoryId) {
                conditions['category.id'] = categoryId
            }
            const records = await BlogPostModel.find(conditions, null, options);
            const total = await BlogPostModel.count(conditions);
            let totalPages = Math.ceil(total / limit )
            const data = {
                records,
                totalPages,
                totalRecord: total,
            };
            return response(res, data, 'Thành công', statusCode.OK);
        } catch (err) {
            logError(err);
            console.log(err)
            return response(res, null, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }
    async listPublic(req, res, params) {
        try {
            const keyword = params.keyword || false;
            const page = parseInt(params.page || appConfig.PAGINATION.PAGE);
            const limit = parseInt(params.limit || appConfig.PAGINATION.LIMIT);
            const conditions = { deleted_at: null };
            const categoryID = params.category_id || null;
            const level = params.level || null;
            const subjectId = params.subject_id || null;

            const allowedSortFields = ['created_at', 'updated_at'];
            const sortBy = allowedSortFields.includes(params.sort_by)
                ? params.sort_by
                : 'created_at';
            const sortOrder =
                params.sort_order === 'asc' ? 1 : -1;
            const options = {
                skip: (page - 1) * limit,
                limit: limit,
                sort: { [sortBy]: sortOrder }
            };

            if (categoryID)
                conditions['category.id'] = categoryID;

            const categoryName = params.category_name;
            if (categoryName) {
                if (Array.isArray(categoryName)) {
                    conditions['category.name'] = { $in: categoryName };
                } else if (typeof categoryName === 'string') {
                    const names = categoryName
                        .split(',')
                        .map((s) => s.trim())
                        .filter((s) => s.length > 0);
                    conditions['category.name'] = names.length > 1 ? { $in: names } : names[0];
                }
            }

            if (keyword) {
                const alias = BaseHelper.seoURL(keyword);
                conditions.alias = { $regex: alias, $options: 'i' };
            }

            if (level)
                conditions.level = level;

            if (subjectId)
                conditions.subject_id = subjectId;

            const records = await BlogPostModel.find(conditions, null, options);
            const total = await BlogPostModel.count(conditions);
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
            const categoryID = params.category_id || null;
            const categoryName = params.category_name || null;
            const options = {
                skip: (page - 1) * limit,
                limit: limit,
                sort: { created_at: -1 }
            };

            if (categoryID)
                conditions['category.id'] = categoryID;
            if (categoryName)
                conditions['category.name'] = categoryName;
            if (keyword) {
                const alias = BaseHelper.seoURL(keyword);
                conditions.alias = { $regex: alias, $options: 'i' };
            }

            const records = await BlogPostModel.find(conditions, null, options);
            const total = await BlogPostModel.count(conditions);
            const data = {
                records,
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

    async detail(req, res, params) {
        try {
            const { id, web_user } = params;

            const conditions = { _id: id };
            const rs = await BlogPostModel.findOne(conditions);

            // Xử lý tăng lượt xem nếu có web_user
            if (web_user) {
                const viewCount = parseInt(rs.view_count || 0) + 1;
                await BlogPostModel.updateOne(
                    { _id: id },
                    {
                        $set: { view_count: viewCount },
                    }
                );
                rs.view_count = viewCount;
            }

            return response(res, rs, 'Thành công', statusCode.OK);
        } catch (err) {
            logError(err);
            return response(res, null, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }

    async view(req, res, params) {
        try {
            const { alias } = params;

            let conditions = { alias: alias };
            const post = await BlogPostModel.findOne(conditions);
            conditions = {
                status: true,
                _id: {
                    $ne: post.id
                },
                'category.id': appConfig.HOME_POST.POST
            }
            const options = {
                limit: 10
            };
            const otherPosts = await BlogPostModel.find(conditions, null, options);
            return response(res, { post, otherPosts }, 'Thành công', statusCode.OK);
        } catch (err) {
            logError(err);
            return response(res, null, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }

    async create(req, res, params) {

        try {
            const { name, external_link, content, description, files, level, subject_id } = params;
            const categoryID = params.category_id || null;
            const status = params.status || appConfig.STATUS.INACTIVE;
            const is_featured = params.is_featured || appConfig.STATUS.INACTIVE;

            if (!name)
                return response(res, null, language.CANNOT_EMPTY.replace('%s', language.NAME), statusCode.ERROR);

            const alias = BaseHelper.seoURL(name.trim()) + '-' + new Date().getTime();

            const _doc = {
                name,
                alias,
                external_link,
                description,
                content,
                status,
                is_featured,
                level,
                subject_id
            };

            if (categoryID) {
                const category = await BlogCategoryModel.findOne({ _id: categoryID });
                if (category)
                    _doc.category = { id: category._id, name: category.name };
            }

            if (files && files.length > 0) {
                const fileData = await UploadService.upload(files[0], 'base64', 'blog');
                if (fileData) {
                    _doc.image = appConfig.FILE_DOMAIN + '/' + fileData[0];
                }
            }

            if (_doc.level || _doc.subject_id) {
                if (_doc.category.name !== 'Lịch Livestream') {
                    return response(res, {}, language.ERROR, statusCode.ERROR);
                }
            }

            const item = await BlogPostModel.create(_doc);
            if (!item)
                return response(res, {}, language.ERROR, statusCode.ERROR);

            return response(res, item, 'Thành công', statusCode.OK);
        } catch (err) {
            logError(err);
            console.log(err)
            return response(res, {}, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }

    async update(req, res, params) {
        try {
            console.log("debug ", params)
            const { id, name, external_link, description, content, files, level, subject_id } = params;
            const status = params.status || appConfig.STATUS.INACTIVE;
            const categoryID = params.category_id || null;
            const is_featured = params.is_featured || appConfig.STATUS.INACTIVE;

            if (!id)
                return response(res, null, 'Request không hợp lệ!', statusCode.ERROR);

            const item = await BlogPostModel.findOne({ _id: id });
            if (!item)
                return response(res, {}, language.ITEM_NOT_EXIST.replace('%s', 'Bài viết'), statusCode.ERROR);

            if (name) {
                item.name = name;
            }

            item.status = status;
            item.description = description;
            item.content = content;
            item.external_link = external_link;
            if (categoryID) {
                const category = await BlogCategoryModel.findOne({ _id: categoryID });
                if (category)
                    item.category = { id: category._id, name: category.name };
            }

            if (files && files.length > 0) {
                const fileData = await UploadService.upload(files[0], 'base64', 'blogs');
                if (fileData) {
                    item.image = appConfig.FILE_DOMAIN + '/' + fileData[0];
                }
            }
            item.is_featured = is_featured;

            if (params?.level && params?.subject_id) {
                if (item.category.name !== 'Lịch Livestream') {
                    return response(res, {}, language.ERROR, statusCode.ERROR);
                }
                item.level = level;
                item.subject_id = subject_id;
            }

            const rs = await BlogPostModel.updateOne({ _id: id }, item);
            if (rs.nModified)
                return response(res, item, 'Thành công', statusCode.OK);
            return response(res, item, language.ERROR, statusCode.ERROR);
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

            const rs = await BlogPostModel.softDelete({ _id: { $in: ids } }, true);
            if (rs)
                return response(res, {}, 'Thành công', statusCode.OK);
            return response(res, null, language.ERROR, statusCode.ERROR);
        } catch (err) {
            logError(err);
            return response(res, null, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }
}

module.exports = new BlogController();
