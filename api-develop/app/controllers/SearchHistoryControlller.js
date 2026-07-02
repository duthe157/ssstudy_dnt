const BaseHelper = require('../helpers/BaseHelper');
const SearchHistoryModel = require('../models/SearchHistory');
const language = BaseHelper.fileToJSON(`${__dirname}/../languages/vi.json`);

class SearchHistoryController {
    async addAndUpdate(req, res, params) {
        try {
            const { user_id, keyword } = params;
            if (!user_id || !keyword) {
                return response(res, null, language.INVALID_PARAMS, statusCode.INVALID_PARAMS);
            }
            let data
            const normalize = BaseHelper.seoURL(keyword);
            const existingRecord = await SearchHistoryModel.findOne({ user_id, normalize });
            if (existingRecord) {
                existingRecord.last_searched_at = new Date();
                await existingRecord.save();
                data = existingRecord;
                return response(res, existingRecord, "Thành công", statusCode.OK);
            } else {
                const searchHistory = await SearchHistoryModel.create({
                    user_id,
                    keyword,
                    normalize,
                    last_searched_at: new Date()
                });
                if (!searchHistory) {
                    return response(res, null, language.PROCESS_ERROR, statusCode.ERROR);
                }
                data = searchHistory;
            }
            return response(res, data, "Thành công", statusCode.OK);
        } catch (err) {
            console.error(err);
            return response(res, null, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }

    async list(req, res, params) {
        try {
            const { user_id } = params;
            if (!user_id) {
                return response(res, null, language.INVALID_PARAMS, statusCode.INVALID_PARAMS);
            }
            const searchHistories = await SearchHistoryModel.db.find({ user_id }).sort({ last_searched_at: -1 });
            if (!searchHistories) {
                return response(res, null, language.NOT_FOUND, statusCode.NOT_FOUND);
            }
            return response(res, searchHistories, "Thành công", statusCode.OK);
        } catch (err) {
            console.error(err);
            return response(res, null, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }

    async delete(req, res, params) {
        try {
            const { user_id, keyword } = params;
            if (!user_id || !keyword) {
                return response(res, null, language.INVALID_PARAMS, statusCode.INVALID_PARAMS);
            }
            const normalize = BaseHelper.seoURL(keyword);
            const existingRecord = await SearchHistoryModel.findOne({ user_id, normalize });
            if (!existingRecord) {
                return response(res, null, language.NOT_FOUND, statusCode.NOT_FOUND);
            }
            await SearchHistoryModel.db.deleteOne({ user_id, normalize });
            return response(res, null, "Xóa lịch sử tìm kiếm thành công", statusCode.OK);
        } catch (err) {
            console.error(err);
            return response(res, null, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }
}
module.exports = new SearchHistoryController();