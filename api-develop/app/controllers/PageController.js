const BaseHelper = require('../helpers/BaseHelper');
const PageModel = require('../models/Page');
const language = BaseHelper.fileToJSON(`${__dirname}/../languages/vi.json`);

class CategoryController {
    async detail(req, res, params) {
        try {
            const { key } = params;
            let conditions = { key: key };
            let rs = await PageModel.findOne(conditions);
            rs = rs.toObject();
            try {
                rs.content_configs = JSON.parse(rs.content_configs);
            } catch (err) {

            }
            return response(res, rs, 'Thành công', statusCode.OK);
        } catch (err) {
            logError(err);
            return response(res, null, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }

    async update(req, res, params) {
        try {
            const { name, content, key } = params;
            let contentConfigs = params.content_configs || null;
            if (contentConfigs)
                contentConfigs = JSON.stringify(contentConfigs);
            if (key != 'homepage' && key != 'about')
                return response(res, {}, 'Request không hợp lệ!', statusCode.ERROR);

            let page = await PageModel.findOne({ key: key });
            if (page) {
                page.content_configs = contentConfigs;
                page = await PageModel.updateOne({ key: key }, page);
            } else {
                let docPage = {
                    key,
                    name,
                    content,
                    content_configs: contentConfigs
                }
                page = await PageModel.create(docPage);
            }

            return response(res, page, 'Thành công', statusCode.OK);
        } catch (err) {
            logError(err);
            return response(res, {}, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }
}

module.exports = new CategoryController();
