const FastGiftModel = require('../models/FastGift');
const CompetitionPartModel = require('../models/CompetitionPart');
const BaseHelper = require("../helpers/BaseHelper");
const language = BaseHelper.fileToJSON(`${__dirname}/../languages/vi.json`);
const UploadService = require("../services/UploadService")
const config = require('../../config/config');
class FastGiftController {
    async create(req, res, params) {
        try {
            const data = params;
            if (data.competition_part?.id) {
                const competition_part = await CompetitionPartModel.findOne({
                    _id: data.competition_part.id
                });
                if (!competition_part) {
                    return response(res, null, 'Lớp học không tồn tại', statusCode.ERROR);
                }
            }
            if (Array.isArray(data.score_rule)) {
                for (const rule of data.score_rule) {
                    if (
                        rule.image &&
                        typeof rule.image === 'string' &&
                        rule.image.startsWith('data:image')
                    ) {
                        const fileData = await UploadService.upload(
                            rule.image,    
                            'base64',
                            'documents'
                        );

                        if (fileData && fileData.length > 0) {
                            rule.image = config.FILE_DOMAIN + '/' + fileData[0];
                        }
                    }
                }
            }

            const fastGift = await FastGiftModel.create(data);

            return response(res, fastGift, 'Tạo quà tặng thành công!', statusCode.OK);

        } catch (err) {
            console.error(err);
            return response(res, null, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }
    async list(req, res, params) {
        try {
            const keyword = params.keyword || false;
            const page = parseInt(params.page || 1);
            const limit = parseInt(params.limit || 10);
            const competition_part_id = params.competition_part_id || false;
            const status = params.status !== "" ? params.status : null;
            const conditions = { deleted_at: null };
            const options = {
                sort: { created_at: -1 }
            }
            if (limit != -1) {
                options.skip = (page - 1) * limit;
                options.limit = limit
            }

            const sortKey = params.sort_key || null;
            const sortValue = params.sort_value || null;
            if (sortKey && (sortValue == 1 || sortValue == -1)) {
                options.sort = {};
                options.sort[sortKey] = sortValue;
            }

            if (competition_part_id) {
                conditions['competition_part.id'] = competition_part_id;
            }
            if (keyword) {
                conditions.name = { $regex: keyword, $options: 'i' };
            }
            if (status !== null) {
                conditions.status = status;
            }

            const records = await FastGiftModel.find(conditions, null, options);
            const total = await FastGiftModel.count(conditions);
            const data = {
                records,
                totalRecord: total,
                perPage: limit,
            };
            return response(res, data, 'Lấy danh sách quà tặng thành công', statusCode.OK);

        } catch (err) {
            console.error(err);
            return response(res, null, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }

    async detail(req, res, params) {
        try {
            const { id } = params;

            const fastGift = await FastGiftModel.db.findById(id);
            if (!fastGift) {
                return response(res, null, 'Không tìm thấy quà tặng', statusCode.NOT_FOUND);
            }

            return response(res, fastGift, 'Lấy chi tiết quà tặng thành công', statusCode.OK);
        } catch (err) {
            console.error(err);
            return response(res, null, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }

    async update(req, res, params) {
        try {
            const { id, ...data } = params;
            if (Array.isArray(data.score_rule)) {
                for (const rule of data.score_rule) {
                    if (
                        rule.image &&
                        typeof rule.image === 'string' &&
                        rule.image.startsWith('data:image')
                    ) {
                        const fileData = await UploadService.upload(
                            rule.image,     
                            'base64',
                            'documents'
                        );

                        if (fileData && fileData.length > 0) {
                            rule.image = config.FILE_DOMAIN + '/' + fileData[0];
                        }
                    }
                }
            }
            const fastGift = await FastGiftModel.db.findByIdAndUpdate(
                id,
                data,
                { new: true }
            );

            if (!fastGift) {
                return response(res, null, 'Không tìm thấy quà tặng', statusCode.NOT_FOUND);
            }

            return response(res, fastGift, 'Cập nhật quà tặng thành công', statusCode.OK);
        } catch (err) {
            console.error(err);
            return response(res, null, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }
    async status(req, res, params) {
        try {
            const { id, status } = params;
            const fastGift = await FastGiftModel.db.findByIdAndUpdate(
                id,
                { status: status },
                { new: true }
            );
            if (!fastGift) {
                return response(res, null, 'Không tìm thấy quà tặng', statusCode.NOT_FOUND);
            }

            return response(res, fastGift, 'Cập nhật trạng thái quà tặng thành công', statusCode.OK);
        } catch (err) {
            console.error(err);
            return response(res, null, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }
    async delete(req, res, params) {
        try {
            const { id } = params;

            const fastGift = await FastGiftModel.db.findOneAndDelete(
                { _id: id, }
            );

            if (!fastGift) {
                return response(res, null, 'Không tìm thấy quà tặng', statusCode.NOT_FOUND);
            }

            return response(res, null, 'Xóa quà tặng thành công', statusCode.OK);

        } catch (err) {
            console.error(err);
            return response(res, null, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }
}

module.exports = new FastGiftController();
