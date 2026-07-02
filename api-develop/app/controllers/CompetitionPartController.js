const CompetitionPart = require('../models/CompetitionPart');
const BaseHelper = require('../helpers/BaseHelper');
const language = BaseHelper.fileToJSON(`${__dirname}/../languages/vi.json`);
const mongoose = require('mongoose');
class CompetitionPartController {
    async list(req, res, params) {
        try {
            const page = parseInt(params.page) > 0 ? parseInt(params.page) : 1;
            const limit = parseInt(params.limit) > 0 ? parseInt(params.limit) : 4;
            const skip = (page - 1) * limit;
            const sortField = params.sort_key || 'updated_at';
            const conditions = { deleted_at: null };
            if (params.keyword && params.keyword.trim() !== '') {
                conditions.name = { $regex: params.keyword.trim(), $options: 'i' };
            }
            if (params.hidden !== undefined) {
                conditions.hidden = params.hidden;
            }
            if (params.deleted && params.deleted !== false) {
                conditions.deleted_at = { $ne: null };
            }

            // Xác định thứ tự sắp xếp
            const sortOrder = params.sort_order || -1;

            const allowedSortFields = {
                name: 'name',
                code: 'code',
                subject: 'subject.name',
                updated_at: 'updated_at',
                created_at: 'created_at'
            };

            let sortOptions = { updated_at: -1 }; // mặc định sort theo updated_at desc
            if (allowedSortFields[sortField]) {
                sortOptions = {
                    [allowedSortFields[sortField]]: (String(sortOrder).toLowerCase() === 'asc' || sortOrder === 1) ? 1 : -1
                };
            }
            const records = await CompetitionPart.db.find(conditions)
                .sort(sortOptions)
                .skip(skip)
                .limit(limit);

            const total = await CompetitionPart.db.countDocuments(conditions);
            if (!records || records.length === 0) {
                return response(res, null, 'Không có dữ liệu', statusCode.OK);
            }
            return response(res, {
                records,
                totalRecord: total,
                perPage: limit,
                currentPage: page,
                totalPage: Math.ceil(total / limit),
                sortOrder: sortOrder === 1 ? 'asc' : 'desc'
            }, 'Thành công', statusCode.OK);

        } catch (err) {
            console.error(err);
            return response(res, null, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }


    async detail(req, res, params) {
        try {
            const { id } = params;
            if (!id) return response(res, null, 'Thiếu ID', statusCode.ERROR);
            if (!mongoose.Types.ObjectId.isValid(id)) {
                return response(res, null, 'ID không hợp lệ!', statusCode.ERROR);
            }
            const part = await CompetitionPart.findOne({ _id: id, deleted_at: null });
            if (!part) return response(res, null, 'Kỳ thi không tồn tại', statusCode.ERROR);

            return response(res, part, 'Thành công', statusCode.OK);
        } catch (err) {
            console.log(err);
            return response(res, null, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }

    async create(req, res, params) {
        try {
            const { name, config, parts, point_true_false } = params;

            // Validate input
            if (!name || typeof name !== 'string' || name.trim() === '') {
                return response(res, null, 'Tên kỳ thi là bắt buộc và phải là chuỗi.', statusCode.ERROR);
            }
            const _doc = {
                name,
                config: config || [],
                parts: parts || [],
                point_true_false: point_true_false || {},
            };

            const competitionPart = await CompetitionPart.create(_doc);
            if (!competitionPart) {
                return response(res, null, 'Tạo kỳ thi thất bại!', statusCode.ERROR);
            }
            return response(res, competitionPart._id, 'Tạo kỳ thi thành công.', statusCode.OK);
        } catch (err) {
            console.log(err);
            return response(res, null, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }

    async update(req, res, params) {
        try {
            const { id, name, config, hidden, deleted, parts, point_true_false } = params;

            // ===== Validate ID =====
            if (!id) return response(res, null, 'Thiếu ID', statusCode.ERROR);
            if (!mongoose.Types.ObjectId.isValid(id)) {
                return response(res, null, 'ID không hợp lệ!', statusCode.ERROR);
            }

            // ===== Validate input =====
            if (name !== undefined && (typeof name !== 'string' || name.trim() === '')) {
                return response(res, null, 'Tên kỳ thi nếu có phải là chuỗi không rỗng.', statusCode.ERROR);
            }
            if (config !== undefined && !Array.isArray(config)) {
                return response(res, null, 'Config phải là mảng.', statusCode.ERROR);
            }

            // ===== Chuẩn hóa parts =====
            let normalizedParts;
            if (Array.isArray(parts)) {
                normalizedParts = parts.map(part => {
                    return {
                        id: part.id
                            ? part.id
                            : part.name.trim().toUpperCase().replace(/\s+/g, '_'),
                        name: part.name || '',
                        hidden: part.hidden ?? false,
                        deleted: part.delete ?? part.deleted ?? false, // đổi delete -> deleted
                    };
                });
            }
            let delete_ad = null
            // ===== Tìm exam =====
            const competitionPart = await CompetitionPart.findOne({ _id: id });
            if (!competitionPart) {
                return response(res, null, 'Kỳ thi không tồn tại', statusCode.ERROR);
            }
            if (deleted) {
                delete_ad = new Date()
            }
            // ===== Chuẩn bị dữ liệu update =====
            const updateDoc = {
                ...(name !== undefined && { name }),
                ...(hidden !== undefined && { hidden }),
                ...(config !== undefined && { config }),
                ...(normalizedParts !== undefined && { parts: normalizedParts }),
                ...(point_true_false !== undefined && { point_true_false }),
                updated_at: new Date(),
                deleted_at: delete_ad
            };

            const updatedCompetition = await CompetitionPart.db.findByIdAndUpdate(
                id,
                { $set: updateDoc },
                { new: true } // Trả về document sau khi update
            );

            return response(res, updatedCompetition, 'Cập nhật kỳ thi thành công.', statusCode.OK);

        } catch (err) {
            console.error(err);
            return response(res, null, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }


    async delete(req, res, params) {
        try {
            const id = params.id;
            if (!id) return response(res, null, 'Thiếu ID', statusCode.ERROR);
            if (!mongoose.Types.ObjectId.isValid(id)) {
                return response(res, null, 'ID không hợp lệ!', statusCode.ERROR);
            }
            const existingPart = await CompetitionPart.findOne({ _id: id });
            if (!existingPart) {
                return response(res, null, 'Kỳ thi không tồn tại!', statusCode.ERROR);
            }
            const result = await CompetitionPart.delete({ _id: id });
            if (!result || result.nModified === 0) {
                return response(res, null, 'Xóa Kỳ thi thất bại!', statusCode.ERROR);
            }
            return response(res, id, 'Xóa Kỳ thi thành công!', statusCode.OK);

        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }
}

module.exports = new CompetitionPartController();
