const appConfig = require('../../config/app');
const BaseHelper = require('../helpers/BaseHelper');
const BookReviewModel = require('../models/BookReview');
const BookModel = require('../models/Book');
const UserModel = require('../models/User');
const UploadService = require('../services/UploadService');
const language = BaseHelper.fileToJSON(`${__dirname}/../languages/vi.json`);

class bookReviewController {
    async list(req, res, params) {
        try {
            const keyword = params.keyword || false;
            const page = parseInt(params.page || appConfig.PAGINATION.PAGE);
            const limit = parseInt(params.limit || appConfig.PAGINATION.LIMIT);
            const bookID = params.book_id || null;
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

            if (bookID)
                conditions['book_id'] = bookID;

            console.log("options", options)

            const records = await BookReviewModel.find(conditions, null, options);
            const total = await BookReviewModel.count(conditions);
            const data = {
                records,
                totalRecord: total,
                perPage: limit,
            };
            return response(res, data, 'Thành công', statusCode.OK);
        } catch (err) {
            logError(err);
            return response(res, null, 'Lỗi! Vui lòng liên hệ với đội ngũ SSStudy.', statusCode.ERROR);
        }
    }

    async reviews(req, res, params) {
        try {
            const { id } = params;

            const conditions = { _id: id };
            const rs = await BookReviewModel.findOne(conditions);
            return response(res, rs, 'Thành công', statusCode.OK);
        } catch (err) {
            logError(err);
            return response(res, null, 'Lỗi! Vui lòng liên hệ với đội ngũ SSStudy.', statusCode.ERROR);
        }
    }

    async listReview(req, res, params) {
        try {
            const { book_id } = params;

            const conditions = { book_id };
            const rs = await BookReviewModel.find(conditions);
            return response(res, rs, 'Thành công', statusCode.OK);
        } catch (err) {
            logError(err);
            return response(res, null, 'Lỗi! Vui lòng liên hệ với đội ngũ SSStudy.', statusCode.ERROR);
        }
    }

    async detail(req, res, params) {
        try {
            const { id } = params;

            const conditions = { _id: id };
            const rs = await BookReviewModel.findOne(conditions);
            return response(res, rs, 'Thành công', statusCode.OK);
        } catch (err) {
            logError(err);
            return response(res, null, 'Lỗi! Vui lòng liên hệ với đội ngũ SSStudy.', statusCode.ERROR);
        }
    }

    async create(req, res, params) {
        try {
            const { name, comment, avatar } = params;
            const bookID = params.book_id || null;
            const rating = params.rating || 0;
            const status = params.status || appConfig.STATUS.INACTIVE;

            if (!name)
                return response(res, null, language.CANNOT_EMPTY.replace('%s', language.NAME), statusCode.ERROR);

            if (!bookID)
                return response(res, null, language.CANNOT_EMPTY.replace('%s', 'Sách'), statusCode.ERROR);

            const book = await BookModel.findOne({ _id: bookID });
            if (!book)
                return response(res, null, 'Sách này không tồn tại!', statusCode.ERROR);
            const alias = BaseHelper.seoURL(comment);
            const _doc = {
                name,
                comment,
                alias,
                book_id: bookID,
                book: { id: bookID, name: book.name },
                rating,
                avatar,
                status
            };

            const avatarBase64 = params.avatar_base64 || null;
            if (avatarBase64) {
                const fileData = await UploadService.upload(avatarBase64, 'base64', 'book-reviews');
                if (fileData && fileData[0])
                    _doc.avatar = fileData[0];
            }

            const review = await BookReviewModel.create(_doc);
            if (!review)
                return response(res, {}, language.ERROR, statusCode.ERROR);

            return response(res, review, 'Thành công', statusCode.OK);
        } catch (err) {
            logError(err);
            return response(res, {}, 'Lỗi! Vui lòng liên hệ với đội ngũ SSStudy.', statusCode.ERROR);
        }
    }

    async sendReview(req, res, params) {
        try {
            const { comment } = params;
            const bookID = params.book_id || null;
            const rating = params.rating || 0;
            const status = params.status || appConfig.STATUS.INACTIVE;

            const user = await UserModel.findOne({ _id: req.user.user_id });
            if (!user)
                return response(res, null, language.CANNOT_EMPTY.replace('%s', 'Vui lòng đăng nhập để bình luận!'), statusCode.ERROR);

            if (!bookID)
                return response(res, null, language.CANNOT_EMPTY.replace('%s', 'Sách'), statusCode.ERROR);

            const book = await BookModel.findOne({ _id: bookID });
            if (!book)
                return response(res, null, 'Sách này không tồn tại!', statusCode.ERROR);

            const alias = BaseHelper.seoURL(comment);
            const _doc = {
                name: user.fullname,
                comment,
                alias,
                book_id: bookID,
                book: { id: bookID, name: book.name },
                rating,
                avatar: user.avatar,
                status,
                deleted_at: null
            };

            const review = await BookReviewModel.create(_doc);
            if (!review)
                return response(res, {}, language.ERROR, statusCode.ERROR);

            return response(res, review, 'Gửi đánh giá thành công. Cảm ơn bạn đã gửi đánh giá cho SSStudy!', statusCode.OK);
        } catch (err) {
            logError(err);
            return response(res, {}, 'Lỗi! Vui lòng liên hệ với đội ngũ SSStudy.', statusCode.ERROR);
        }
    }

    async update(req, res, params) {
        try {
            const { id, name, comment } = params;
            const rating = params.rating || 0;
            const status = params.status || appConfig.STATUS.INACTIVE;
            if (!id)
                return response(res, null, 'Request không hợp lệ!', statusCode.ERROR);

            const review = await BookReviewModel.findOne({ _id: id });
            if (!review)
                return response(res, null, 'Đánh giá không tồn tại.', statusCode.ERROR);

            const alias = BaseHelper.seoURL(comment);
            if (name)
                review.name = name;

            review.rating = rating;

            review.comment = comment;
            review.alias = alias;
            review.status = status;

            const avatarBase64 = params.avatar_base64 || null;
            if (avatarBase64) {
                const fileData = await UploadService.upload(avatarBase64, 'base64', 'book-reviews');
                if (fileData && fileData[0])
                    review.avatar = fileData[0];
            }

            const rs = await BookReviewModel.updateOne({ _id: review.id }, review);
            if (rs.nModified) {
                // Sum all review status = true 
                try {
                    const aggregate = [
                        { $match: { 'book_id': review.book_id, status: true, deleted_at: null } },
                        { $group: { _id: null, total_rating: { $sum: '$rating' } } }
                    ];
                    const ratingObj = await BookReviewModel.aggregate(aggregate);
                    const totalCountUser = await BookReviewModel.count({ 'book_id': review.book_id, status: true, deleted_at: null });
                    if (ratingObj) {
                        const totalRating = ratingObj[0] && ratingObj[0].total_rating ? ratingObj[0].total_rating : 0;
                        let bookRating = 0;
                        if (totalRating > 0 && totalCountUser > 0) {
                            bookRating = Math.round(totalRating / totalCountUser);
                            const _rs = await BookModel.updateOne({ _id: review.book_id }, { $set: { rating: bookRating } });
                        }
                    }
                } catch (err) {
                    logError(err);
                }
                return response(res, review, 'Thành công', statusCode.OK);
            }

            return response(res, review, language.ERROR, statusCode.ERROR);
        } catch (err) {
            logError(err);
            return response(res, {}, 'Lỗi! Vui lòng liên hệ với đội ngũ SSStudy.', statusCode.ERROR);
        }
    }

    async delete(req, res, params) {
        try {
            const { ids } = params || [];
            if (ids.length == 0)
                return response(res, null, 'Request không hợp lệ!', statusCode.ERROR);

            const rs = await BookReviewModel.softDelete({ _id: { $in: ids } }, true);
            if (rs)
                return response(res, {}, 'Thành công', statusCode.OK);
            return response(res, null, language.ERROR, statusCode.ERROR);
        } catch (err) {
            logError(err);
            return response(res, null, 'Lỗi! Vui lòng liên hệ với đội ngũ SSStudy.', statusCode.ERROR);
        }
    }
}

module.exports = new bookReviewController();
