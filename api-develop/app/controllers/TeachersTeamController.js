const TeachersTeamModel = require('../models/TeachersTeam');

class TeachersTeamController {

    async detail(req, res, params) {
        try {
            const { _id } = params;

            let query = { deleted_at: null };

            // Nếu có _id, kiểm tra và thêm vào query
            if (_id) {
                if (!mongoose.Types.ObjectId.isValid(_id)) {
                    return response(res, {}, 'ID không đúng định dạng.', statusCode.BAD_REQUEST);
                }
                query._id = _id;
            }

            const data = await TeachersTeamModel.findOne(query);

            if (!data) {
                return response(res, {}, 'Không tìm thấy dữ liệu.', statusCode.NOT_FOUND);
            }

            return response(res, data, 'Lấy thông tin thành công.', statusCode.SUCCESS);
        } catch (error) {
            console.error('Error in detail:', error);
            return response(res, {}, error.message, statusCode.INTERNAL_SERVER_ERROR);
        }
    }

    async update(req, res, params) {
        try {
            console.log('Update params:', params);

            const { _id, title, content, images, highlights, status } = params;

            // Chuẩn bị dữ liệu
            const updateData = {};

            if (title !== undefined) updateData.title = title;
            if (content !== undefined) updateData.content = content;
            if (status !== undefined) updateData.status = status;

            // Xử lý images array
            if (images !== undefined && images !== null) {
                if (Array.isArray(images)) {
                    // Lọc bỏ các image không hợp lệ (không có url hoặc url rỗng)
                    updateData.images = images
                        .filter(img => img?.url && img.url.trim() !== '')
                        .map(img => ({
                            url: img.url
                        }));
                } else {
                    updateData.images = [];
                }
            }

            // Xử lý highlights array
            if (highlights !== undefined && highlights !== null) {
                if (Array.isArray(highlights)) {
                    updateData.highlights = highlights
                        .filter(highlight => {
                            const hasTitle = highlight?.title && highlight.title.trim() !== '';
                            const hasDescription = highlight?.description && highlight.description.trim() !== '';
                            return hasTitle || hasDescription;
                        })
                        .map(highlight => {
                            const mappedHighlight = {
                                title: highlight?.title || '',
                                description: highlight?.description || ''
                            };

                            // Chỉ thêm image nếu nó có giá trị hợp lệ
                            if (highlight?.image?.url && highlight.image.url.trim() !== '') {
                                mappedHighlight.image = { url: highlight.image.url };
                            }

                            return mappedHighlight;
                        });
                } else {
                    updateData.highlights = [];
                }
            }

            let result;

            // Nếu có _id, tìm và update
            if (_id) {
                const existingRecord = await TeachersTeamModel.findOne({
                    _id: _id,
                    deleted_at: null
                });

                if (existingRecord) {
                    // Update nếu tìm thấy
                    result = await TeachersTeamModel.findOneAndUpdate(
                        { _id: _id },
                        { $set: updateData },
                        { new: true, runValidators: true }
                    );
                } else {
                    // Tạo mới nếu không tìm thấy
                    result = await TeachersTeamModel.create(updateData);
                }
            } else {
                // Không có _id, tìm record đầu tiên để update hoặc tạo mới
                const firstRecord = await TeachersTeamModel.findOne({ deleted_at: null });

                if (firstRecord) {
                    // Update record đầu tiên
                    result = await TeachersTeamModel.findOneAndUpdate(
                        { _id: firstRecord._id },
                        { $set: updateData },
                        { new: true, runValidators: true }
                    );
                } else {
                    // Không có record nào, tạo mới
                    result = await TeachersTeamModel.create(updateData);
                }
            }

            return response(res, result, 'Lưu thành công.', statusCode.SUCCESS);
        } catch (error) {
            console.error('Error in update:', error);
            return response(res, {}, error.message, statusCode.INTERNAL_SERVER_ERROR);
        }
    }
}

module.exports = new TeachersTeamController();