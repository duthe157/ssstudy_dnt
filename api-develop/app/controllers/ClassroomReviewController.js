const appConfig = require('../../config/app');
const BaseHelper = require('../helpers/BaseHelper');
const ClassroomReviewModel = require('../models/ClassroomReview');
const ClassroomModel = require('../models/Classroom');
const UserModel = require('../models/User');
const UploadService = require('../services/UploadService');
const language = BaseHelper.fileToJSON(`${__dirname}/../languages/vi.json`);

class ClassroomReviewController {
    async list(req, res, params) {
        try {
            const keyword = params.keyword || '';
            const classroomID = params.classroom_id || null;
            const page = parseInt(params.page || appConfig.PAGINATION.PAGE);
            const limit = parseInt(params.limit || appConfig.PAGINATION.LIMIT);

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
            const parserKeyword = keyword.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
            const conditions = {
                deleted_at: null,
                $or: [
                    { name: { $regex: parserKeyword, $options: 'i' } },
                    { "classroom.name": { $regex: parserKeyword, $options: 'i' } }
                ]
            };

            if (classroomID)
                conditions['classroom.id'] = classroomID;

            const [records, total] = await Promise.all([
                ClassroomReviewModel.find(conditions, null, options),
                ClassroomReviewModel.count(conditions)
            ]);
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

    async reviews(req, res, params) {
        try {
            const { id } = params;

            const conditions = { _id: id };
            const rs = await ClassroomReviewModel.findOne(conditions);
            return response(res, rs, 'Thành công', statusCode.OK);
        } catch (err) {
            logError(err);
            return response(res, null, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }

    async detail(req, res, params) {
        try {
            const { id } = params;

            const conditions = { _id: id };
            const rs = await ClassroomReviewModel.findOne(conditions);
            return response(res, rs, 'Thành công', statusCode.OK);
        } catch (err) {
            logError(err);
            return response(res, null, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }

    async create(req, res, params) {
        try {
            const { name, comment, avatar } = params;
            const classroomID = params.classroom_id || null;
            const rating = params.rating || 0;
            const status = params.status || appConfig.STATUS.INACTIVE;

            if (!name)
                return response(res, null, language.CANNOT_EMPTY.replace('%s', language.NAME), statusCode.ERROR);

            if (!classroomID)
                return response(res, null, language.CANNOT_EMPTY.replace('%s', language.CLASSROOM), statusCode.ERROR);

            let classroom = null;
            if (classroomID)
                classroom = await ClassroomModel.findOne({ _id: classroomID });

            if (!classroom)
                return response(res, null, language.ITEM_NOT_EXIST.replace('%s', language.CLASSROOM), statusCode.ERROR);

            const _doc = {
                name,
                comment,
                classroom: { id: classroom.id, name: classroom.name },
                rating,
                avatar,
                status
            };

            const avatarBase64 = params.avatar_base64 || null;
            if (avatarBase64) {
                const fileData = await UploadService.upload(avatarBase64, 'base64', 'avatars');
                if (fileData && fileData[0])
                    _doc.avatar = fileData[0];
            }

            const review = await ClassroomReviewModel.create(_doc);
            if (!review)
                return response(res, {}, language.ERROR, statusCode.ERROR);

            return response(res, review, 'Thành công', statusCode.OK);
        } catch (err) {
            logError(err);
            return response(res, {}, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }

    async sendReview(req, res, params) {
        try {
            const { comment } = params;
            const classroomID = params.classroom_id || null;
            const rating = params.rating || 0;
            const status = params.status || appConfig.STATUS.INACTIVE;

            const user = await UserModel.findOne({ _id: req.user.user_id });
            if (!user)
                return response(res, null, language.CANNOT_EMPTY.replace('%s', 'Vui lòng đăng nhập để bình luận!'), statusCode.ERROR);

            if (!classroomID)
                return response(res, null, language.CANNOT_EMPTY.replace('%s', language.CLASSROOM), statusCode.ERROR);

            let classroom = null;
            if (classroomID)
                classroom = await ClassroomModel.findOne({ _id: classroomID });

            if (!classroom)
                return response(res, null, language.ITEM_NOT_EXIST.replace('%s', language.CLASSROOM), statusCode.ERROR);

            const _doc = {
                name: user.fullname,
                comment,
                classroom: { id: classroom.id, name: classroom.name },
                rating,
                avatar: user.avatar,
                status
            };

            const review = await ClassroomReviewModel.create(_doc);
            if (!review)
                return response(res, {}, language.ERROR, statusCode.ERROR);

            return response(res, review, 'Gửi đánh giá thành công. Cảm ơn bạn đã gửi đánh giá cho SSStudy!', statusCode.OK);
        } catch (err) {
            logError(err);
            return response(res, {}, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }

    async update(req, res, params) {
        try {
            const { id, name, comment, avatar } = params;
            const classroomID = params.classroom_id || null;
            const rating = params.rating || 0;
            const status = params.status || appConfig.STATUS.INACTIVE;
            if (!id)
                return response(res, null, 'Request không hợp lệ!', statusCode.ERROR);

            const review = await ClassroomReviewModel.findOne({ _id: id });
            if (!review)
                return response(res, null, 'Đánh giá không tồn tại.', statusCode.ERROR);

            if (!classroomID)``
                return response(res, null, language.CANNOT_EMPTY.replace('%s', language.CLASSROOM), statusCode.ERROR);

            let classroom = null;
            if (classroomID)
                classroom = await ClassroomModel.findOne({ _id: classroomID });

            if (!classroom)
                return response(res, null, language.ITEM_NOT_EXIST.replace('%s', language.CLASSROOM), statusCode.ERROR);

            if (name) {
                review.name = name;
            }

            if (classroom) {
                review.classroom = { id: classroom.id, name: classroom.name };
            }

            review.rating = rating;

            review.comment = comment;
            review.status = status;
            // Sum all review status = true 
            try {
                const aggregate = [
                    { $match: { 'classroom.id': classroom.id, status: true, deleted_at: null } },
                    { $group: { _id: null, total_rating: { $sum: '$rating' } } }
                ];
                const ratingObj = await ClassroomReviewModel.aggregate(aggregate);
                const totalCountUser = await ClassroomReviewModel.count({ 'classroom.id': classroom.id, status: true, deleted_at: null });
                if (ratingObj) {
                    const totalRating = ratingObj[0] && ratingObj[0].total_rating ? ratingObj[0].total_rating : 0;
                    let classroomRating = 0;
                    if (totalRating > 0 && totalCountUser > 0) {
                        classroomRating = Math.round(totalRating / totalCountUser);
                        ClassroomModel.updateOne({ _id: classroom.id }, { $set: { rating: classroomRating } });
                    }
                }
            } catch (err) {
                logError(err);
            }

            const avatarBase64 = params.avatar_base64 || null;
            if (avatarBase64) {
                const fileData = await UploadService.upload(avatarBase64, 'base64', 'avatars');
                if (fileData && fileData[0])
                    review.avatar = fileData[0];
            }

            const rs = await ClassroomReviewModel.updateOne({ _id: review.id }, review);
            if (rs.nModified)
                return response(res, review, 'Thành công', statusCode.OK);
            return response(res, review, language.ERROR, statusCode.ERROR);
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

            const rs = await ClassroomReviewModel.softDelete({ _id: { $in: ids } }, true);
            if (rs)
                return response(res, {}, 'Thành công', statusCode.OK);
            return response(res, null, language.ERROR, statusCode.ERROR);
        } catch (err) {
            logError(err);
            return response(res, null, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }
}

module.exports = new ClassroomReviewController();
