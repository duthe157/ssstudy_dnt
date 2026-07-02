const appConfig = require('../../config/app');
const BaseHelper = require('../helpers/BaseHelper');
const CouponModel = require('../models/Coupon');
const language = BaseHelper.fileToJSON(`${__dirname}/../languages/vi.json`);
class CouponController {
    async listPublic(req, res, params) {
        try {
            const limit = parseInt(params.limit || appConfig.PAGINATION.LIMIT);
            const conditions = { deleted_at: null };
            const fromDate = params.from_date || new Date();
            const toDate = params.to_date || new Date();
            conditions.started_at = {
                $lte: new Date(fromDate)
            };

            conditions.finished_at = {
                $gte: new Date(toDate)
            };

            const options = {
                limit: limit
            };

            const sortKey = params.sort_key || null;
            const sortValue = params.sort_value || null;
            if (sortKey && (sortValue == 1 || sortValue == -1)) {
                options.sort = {};
                options.sort[sortKey] = sortValue;
            }
            
            const records = await CouponModel.find(conditions, null, options);
            const total = await CouponModel.count(conditions);
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
            const fromDate = params.from_date || null;
            const toDate = params.to_date || null;
            if (fromDate && toDate) {
                conditions.created_at = {
                    $gte: new Date(fromDate),
                    $lte: new Date(toDate)
                };
            }

            const options = {
                skip: (page - 1) * limit,
                limit: limit,
                sort: { created_at: -1 }
            };

            const records = await CouponModel.find(conditions, null, options);
            const total = await CouponModel.count(conditions);
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
            const rs = await CouponModel.findOne(conditions);
            return response(res, rs, 'Thành công', statusCode.OK);
        } catch (err) {
            logError(err);
            return response(res, null, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }

    async create(req, res, params) {
        try {
            const { code } = params;
            const discountType = params.discount_type || 'PERCENT';
            const discountValue = params.discount_value || 0;
            const discountMethod = params.discount_method || 'ORDER';
            const discountConfigs = params.discount_configs || null;
            const minRequirements = params.min_requirements || 'NONE';
            const startedAt = params.started_at || null;
            const finishedAt = params.finished_at || null;
            const status = params.status || false;

            if (!code)
                return response(res, null, 'Vui lòng nhập mã khuyến mại.', statusCode.ERROR);

            if (!discountType)
                return response(res, null, 'Vui lòng chọn loại khuyến mại.', statusCode.ERROR);

            if (!discountMethod)
                return response(res, null, 'Vui lòng chọn hình thức khuyến mại.', statusCode.ERROR);

            const _doc = {
                code,
                discount_type: discountType,
                discount_value: discountValue,
                discount_method: discountMethod,
                discount_configs: discountConfigs,
                min_requirements: minRequirements,
                started_at: startedAt,
                finished_at: finishedAt,
                status
            };
            let coupon = await CouponModel.findOne({ code });
            if (coupon)
                return response(res, null, "Mã khuyến mại này đã tồn tại hoặc trong thùng rác.", statusCode.ERROR);

            coupon = await CouponModel.create(_doc);

            if (!coupon)
                return response(res, null, "Không tạo được Mã khuyến mại.", statusCode.ERROR);

            return response(res, coupon, 'Tạo Mã khuyến mại thành công.', statusCode.OK);
        } catch (err) {
            logError(err);
            return response(res, {}, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }

    async update(req, res, params) {
        try {
            const { id, code } = params;
            const discountType = params.discount_type || 'PERCENT';
            const discountValue = params.discount_value || 0;
            const discountMethod = params.discount_method || 'ORDER';
            const discountConfigs = params.discount_configs || null;
            const minRequirements = params.min_requirements || 'NONE';
            const startedAt = params.started_at || null;
            const finishedAt = params.finished_at || null;
            const status = params.status || false;

            if (!code)
                return response(res, null, 'Vui lòng nhập mã khuyến mại.', statusCode.ERROR);

            if (!discountType)
                return response(res, null, 'Vui lòng chọn loại khuyến mại.', statusCode.ERROR);

            if (!discountMethod)
                return response(res, null, 'Vui lòng chọn hình thức khuyến mại.', statusCode.ERROR);

            const coupon = await CouponModel.findOne({ _id: id });
            if (!coupon)
                return response(res, null, "Mã khuyến mại này không tồn tại.", statusCode.ERROR);

            coupon.code = code;
            coupon.discount_type = discountType;
            coupon.discount_value = discountValue;
            coupon.discount_method = discountMethod;
            coupon.discount_configs = discountConfigs;
            coupon.min_requirements = minRequirements;
            coupon.started_at = startedAt;
            coupon.finished_at = finishedAt;
            coupon.status = status;

            const rs = await CouponModel.updateOne({ _id: id }, coupon);

            if (rs.nModified)
                return response(res, coupon, 'Cập nhật Mã khuyến mại thành công.', statusCode.OK);
            return response(res, null, "Không cập nhật được Mã khuyến mại.", statusCode.ERROR);
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

            const rs = await CouponModel.softDelete({ _id: { $in: ids } }, true);
            if (rs)
                return response(res, {}, 'Thành công', statusCode.OK);
            return response(res, null, language.ERROR, statusCode.ERROR);
        } catch (err) {
            logError(err);
            return response(res, null, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }
}

module.exports = new CouponController();