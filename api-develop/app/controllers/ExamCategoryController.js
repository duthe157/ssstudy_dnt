const appConfig = require('../../config/app');
const BaseHelper = require('../helpers/BaseHelper');
const ExamCategoryModel = require('../models/ExamCategory');
const language = BaseHelper.fileToJSON(`${__dirname}/../languages/vi.json`);
const mongoose = require('mongoose');

class ExamCategoryController {
    async listPublic(req, res, params) {
        try {
            const keyword = params.keyword || false;
            const page = parseInt(params.page || appConfig.PAGINATION.PAGE);
            const paramslimit = parseInt(params.limit);
            const limitParse = paramslimit === -1 ? 0 : (paramslimit > 0 ? paramslimit : appConfig.PAGINATION.LIMIT);
            const conditions = { deleted_at: null, status: true };

            const options = {
                skip: (page - 1) * limitParse,
                limit: limitParse,
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

            const records = await ExamCategoryModel.find(conditions, null, options);
            const total = await ExamCategoryModel.count(conditions);
            const data = {
                records,
                totalRecord: total,
                limit: limitParse,
                perPage: limitParse
            };
            return response(res, data, 'Thành công', statusCode.OK);
        } catch (err) {
            logError(err);
            return response(res, null, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }

    async list(req, res, params) {
        try {
            const { sort_key, sort_value } = params;
            const sortField = sort_key || 'updated_at';

            const keyword = params.keyword || false;
            const page = parseInt(params.page || appConfig.PAGINATION.PAGE);
            const paramslimit = parseInt(params.limit);
            const limitParse = paramslimit === -1 ? 0 : (paramslimit > 0 ? paramslimit : appConfig.PAGINATION.LIMIT);
            const subjectID = params.subject_id || null;
            const conditions = { deleted_at: null, type: { $ne: 'WORD' } };

            const options = {
                skip: (page - 1) * limitParse,
                limit: limitParse,
                sort: { [sortField]: sort_value || -1 }
            };

            if (keyword) {
                const alias = BaseHelper.seoURL(keyword);
                conditions.alias = { $regex: alias, $options: 'i' };
            }

            if (subjectID)
                conditions['subject.id'] = subjectID;

            const records = await ExamCategoryModel.find(conditions, null, options);
            const total = await ExamCategoryModel.count(conditions);
            const data = {
                records,
                totalRecord: total,
                perPage: limitParse,
                limit: limitParse,
            };
            return response(res, data, 'Thành công', statusCode.OK);
        } catch (err) {
            logError(err);
            return response(res, null, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }
    async listWord(req, res, params) {
        try {
            const { sort_key, sort_value } = params;
            const sortField = sort_key || 'updated_at';

            const keyword = params.keyword || false;
            const page = parseInt(params.page || appConfig.PAGINATION.PAGE);
            const paramslimit = parseInt(params.limit);
            const limitParse = paramslimit === -1 ? 0 : (paramslimit > 0 ? paramslimit : appConfig.PAGINATION.LIMIT);
            const subjectID = params.subject_id || null;
            const conditions = { deleted_at: null, type: 'WORD' };

            const options = {
                skip: (page - 1) * limitParse,
                limit: limitParse,
                sort: { [sortField]: sort_value || -1 }
            };

            if (keyword) {
                const alias = BaseHelper.seoURL(keyword);
                conditions.alias = { $regex: alias, $options: 'i' };
            }

            if (subjectID)
                conditions['subject.id'] = subjectID;

            const records = await ExamCategoryModel.find(conditions, null, options);
            const total = await ExamCategoryModel.count(conditions);
            const data = {
                records,
                totalRecord: total,
                perPage: limitParse,
                limit: limitParse,
            };
            return response(res, data, 'Thành công', statusCode.OK);
        } catch (err) {
            logError(err);
            return response(res, null, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }
    async show(req, res, params) {
        try {
            const { id } = params;

            const conditions = { _id: id };
            const rs = await ExamCategoryModel.findOne(conditions);
            return response(res, rs, 'Thành công', statusCode.OK);
        } catch (err) {
            logError(err);
            return response(res, null, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }

    async detail(req, res, params) {
        try {
            const { id } = params;
            let conditions = { _id: id };
            const rs = await ExamCategoryModel.findOne(conditions);

            return response(res, rs, 'Thành công', statusCode.OK);
        } catch (err) {
            logError(err);
            return response(res, null, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }

    async create(req, res, params) {
        try {
            const { name, description, type } = params;
            const status = params.status || true;

            if (!name)
                return response(res, null, language.CANNOT_EMPTY.replace('%s', language.NAME), statusCode.ERROR);

            const alias = BaseHelper.seoURL(name);
            const docCategory = {
                name,
                alias,
                description,
                type: type || 'DEFAULT',
                status
            };

            const category = await ExamCategoryModel.create(docCategory);
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
            const { id, name, description} = params;
            const status = params.status || true;

            if (!id)
                return response(res, null, 'Request không hợp lệ!', statusCode.ERROR);

            if (appConfig.ID_EXAM_CATEGORY_FIXED.indexOf(id) >= 0)
                return response(res, null, 'Không được phép xoá 3 danh mục đề thi 15p, học kỳ/giữa kỳ và thi đại học', statusCode.ERROR);

            const category = await ExamCategoryModel.findOne({ _id: id });
            if (!category)
                return response(res, {}, language.ITEM_NOT_EXIST.replace('%s', language.CATEGORY), statusCode.ERROR);

            const alias = BaseHelper.seoURL(name);
            if (name) {
                category.name = name;
                category.alias = alias;
            }
            category.description = description;
            category.status = status;
            const rs = await ExamCategoryModel.updateOne({ _id: category.id }, category);
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
            const  ids  = params.ids || [];
            const id = params.id || null;   
            if (id) {
                ids.push(id);
            }
            if (ids.length == 0)
                return response(res, null, 'Request không hợp lệ!', statusCode.ERROR);
            for (let i = 0; i < appConfig.ID_EXAM_CATEGORY_FIXED.length; i++) {
                if (ids.indexOf(appConfig.ID_EXAM_CATEGORY_FIXED[i]) >= 0)
                    return response(res, null, 'Không được phép xoá 3 danh mục đề thi 15p, học kỳ/giữa kỳ và thi đại học', statusCode.ERROR);
            }
            const rs = await ExamCategoryModel.softDelete({ _id: { $in: ids } }, true);
            if (rs)
                return response(res, {}, 'Thành công', statusCode.OK);
            return response(res, null, language.ERROR, statusCode.ERROR);
        } catch (err) {
            logError(err);
            console.log(err);
            return response(res, null, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }

    // async delete(req, res, params) {
    //   try {
    //     const id  = params.id;
    //     if (!id) return response(res, null, 'Thiếu ID', statusCode.ERROR);
    //     if (!mongoose.Types.ObjectId.isValid(id)) {
    //       return response(res, null, 'ID không hợp lệ!', statusCode.ERROR);
    //     }
    //     // if (ids.length == 0)
    //     //     return response(res, null, 'Request không hợp lệ!', statusC ode.ERROR);
    //     // for (let i = 0; i < appConfig.ID_EXAM_CATEGORY_FIXED.length; i++) {
    //     //     if (ids.indexOf(appConfig.ID_EXAM_CATEGORY_FIXED[i]) >= 0)
    //     //         return response(res, null, 'Không được phép xoá 3 danh mục đề thi 15p, học kỳ/giữa kỳ và thi đại học', statusCode.ERROR);
    //     // }
    //     const result = await ExamCategoryModel.softDelete({ _id: id });
    //     if (!result || result.nModified === 0) {
    //       return response(res, null, 'Xóa thất bại!', statusCode.ERROR);
    //     }
    //     return response(res, id, 'Xóa thành công!', statusCode.OK);
    //
    //   } catch (err) {
    //     logError(err);
    //     return response(res, null, language.PROCESS_ERROR, statusCode.ERROR);
    //   }
    // }
}

module.exports = new ExamCategoryController();
