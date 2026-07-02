const BaseHelper = require('../helpers/BaseHelper');
const PageModel = require('../models/Page');
const language = BaseHelper.fileToJSON(`${__dirname}/../languages/vi.json`);

// About page uses PageModel with key 'about' and content_configs JSON string
// Structure:
// {
//   banner: { image_url: String, title: String, description: String },
//   introductions: [ { order: Number, image_url: String, title: String, description: String } ],
//   histories: [ { order: Number, image_url: String, year: String, description: String } ]
// }

class AboutController {
    async detail(req, res, params) {
        try {
            let page = await PageModel.findOne({ key: 'about' });
            if (!page) {
                const emptyConfigs = { banner: null, introductions: [], histories: [] };
                await PageModel.create({ key: 'about', name: 'Giới thiệu', content: '', content_configs: JSON.stringify(emptyConfigs) });
                return response(res, emptyConfigs, 'Thành công', statusCode.OK);
            }

            let contentConfigs = {};
            try { contentConfigs = JSON.parse(page.content_configs || '{}'); } catch (e) { contentConfigs = {}; }
            contentConfigs.banner = contentConfigs.banner || null;
            contentConfigs.introductions = Array.isArray(contentConfigs.introductions) ? contentConfigs.introductions : [];
            contentConfigs.histories = Array.isArray(contentConfigs.histories) ? contentConfigs.histories : [];

            return response(res, contentConfigs, 'Thành công', statusCode.OK);
        } catch (err) {
            logError(err);
            return response(res, null, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }

    async update(req, res, params) {
        try {
            const introductions = Array.isArray(params.introductions) ? params.introductions : undefined;
            const histories = Array.isArray(params.histories) ? params.histories : undefined;
            const banner = params.banner || undefined;

            let page = await PageModel.findOne({ key: 'about' });
            let contentConfigs = {};
            if (page) {
                try { contentConfigs = JSON.parse(page.content_configs || '{}'); } catch (e) { contentConfigs = {}; }
            }

            if (introductions !== undefined) {
                // coerce order to numbers and sort
                const mapped = introductions.map(it => ({
                    order: parseInt(it.order, 10),
                    image_url: it.image_url || '',
                    title: it.title || '',
                    description: it.description || ''
                })).filter(it => !isNaN(it.order));
                mapped.sort((a, b) => a.order - b.order);
                contentConfigs.introductions = mapped;
            }

            if (histories !== undefined) {
                const mapped = histories.map(it => ({
                    order: parseInt(it.order, 10),
                    image_url: it.image_url || '',
                    year: it.year || '',
                    description: it.description || ''
                })).filter(it => !isNaN(it.order));
                mapped.sort((a, b) => a.order - b.order);
                contentConfigs.histories = mapped;
            }

            if (banner !== undefined) {
                contentConfigs.banner = banner;
            }

            const contentConfigsStr = JSON.stringify(contentConfigs || {});
            if (page) {
                await PageModel.updateOne({ key: 'about' }, { $set: { content_configs: contentConfigsStr } });
            } else {
                await PageModel.create({ key: 'about', name: 'Giới thiệu', content: '', content_configs: contentConfigsStr });
            }

            return response(res, contentConfigs, 'Thành công', statusCode.OK);
        } catch (err) {
            logError(err);
            return response(res, null, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }

    async updateBanner(req, res, params) {
        try {
            const banner = params.banner || null; // { image_url, title, description }
            let page = await PageModel.findOne({ key: 'about' });
            let contentConfigs = {};
            if (page) {
                try { contentConfigs = JSON.parse(page.content_configs || '{}'); } catch (e) { contentConfigs = {}; }
            }

            contentConfigs.banner = banner;
            const contentConfigsStr = JSON.stringify(contentConfigs || {});

            if (page) {
                await PageModel.updateOne({ key: 'about' }, { $set: { content_configs: contentConfigsStr } });
            } else {
                await PageModel.create({ key: 'about', name: 'Giới thiệu', content: '', content_configs: contentConfigsStr });
            }

            return response(res, contentConfigs.banner, 'Thành công', statusCode.OK);
        } catch (err) {
            logError(err);
            return response(res, null, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }

    async listIntroductions(req, res, params) {
        try {
            const page = await PageModel.findOne({ key: 'about' });
            let contentConfigs = {};
            if (page) {
                try { contentConfigs = JSON.parse(page.content_configs || '{}'); } catch (e) { contentConfigs = {}; }
            }
            const introductions = Array.isArray(contentConfigs.introductions) ? contentConfigs.introductions : [];
            return response(res, { records: introductions }, 'Thành công', statusCode.OK);
        } catch (err) {
            logError(err);
            return response(res, null, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }

    async upsertIntroduction(req, res, params) {
        try {
            // item: { order, image_url, title, description }
            const item = params.item;
            if (!item || item.order === undefined)
                return response(res, null, 'Dữ liệu không hợp lệ!', statusCode.ERROR);

            const orderNum = parseInt(item.order, 10);
            if (isNaN(orderNum))
                return response(res, null, 'Thứ tự phải là số!', statusCode.ERROR);
            item.order = orderNum;

            let page = await PageModel.findOne({ key: 'about' });
            let contentConfigs = {};
            if (page) {
                try { contentConfigs = JSON.parse(page.content_configs || '{}'); } catch (e) { contentConfigs = {}; }
            }
            const list = Array.isArray(contentConfigs.introductions) ? contentConfigs.introductions : [];

            const index = list.findIndex(x => parseInt(x.order, 10) === orderNum);
            if (index >= 0) list[index] = item; else list.push(item);
            // sort by order asc
            list.sort((a, b) => parseInt(a.order, 10) - parseInt(b.order, 10));

            contentConfigs.introductions = list;
            const contentConfigsStr = JSON.stringify(contentConfigs || {});

            if (page) {
                await PageModel.updateOne({ key: 'about' }, { $set: { content_configs: contentConfigsStr } });
            } else {
                await PageModel.create({ key: 'about', name: 'Giới thiệu', content: '', content_configs: contentConfigsStr });
            }

            return response(res, item, 'Thành công', statusCode.OK);
        } catch (err) {
            logError(err);
            return response(res, null, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }

    async deleteIntroduction(req, res, params) {
        try {
            const order = params.order;
            if (order === undefined)
                return response(res, null, 'Dữ liệu không hợp lệ!', statusCode.ERROR);

            const orderNum = parseInt(order, 10);
            if (isNaN(orderNum))
                return response(res, null, 'Thứ tự phải là số!', statusCode.ERROR);

            let page = await PageModel.findOne({ key: 'about' });
            if (!page)
                return response(res, {}, 'Thành công', statusCode.OK);

            let contentConfigs = {};
            try { contentConfigs = JSON.parse(page.content_configs || '{}'); } catch (e) { contentConfigs = {}; }
            const list = Array.isArray(contentConfigs.introductions) ? contentConfigs.introductions : [];
            const newList = list.filter(x => parseInt(x.order, 10) !== orderNum);
            contentConfigs.introductions = newList;
            const contentConfigsStr = JSON.stringify(contentConfigs || {});
            await PageModel.updateOne({ _id: page._id }, { $set: { content_configs: contentConfigsStr } });

            return response(res, {}, 'Thành công', statusCode.OK);
        } catch (err) {
            logError(err);
            return response(res, null, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }

    async listHistories(req, res, params) {
        try {
            const page = await PageModel.findOne({ key: 'about' });
            let contentConfigs = {};
            if (page) {
                try { contentConfigs = JSON.parse(page.content_configs || '{}'); } catch (e) { contentConfigs = {}; }
            }
            const histories = Array.isArray(contentConfigs.histories) ? contentConfigs.histories : [];
            return response(res, { records: histories }, 'Thành công', statusCode.OK);
        } catch (err) {
            logError(err);
            return response(res, null, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }

    async upsertHistory(req, res, params) {
        try {
            // item: { order, image_url, year, description }
            const item = params.item;
            if (!item || item.order === undefined)
                return response(res, null, 'Dữ liệu không hợp lệ!', statusCode.ERROR);

            const orderNum = parseInt(item.order, 10);
            if (isNaN(orderNum))
                return response(res, null, 'Thứ tự phải là số!', statusCode.ERROR);
            item.order = orderNum;

            let page = await PageModel.findOne({ key: 'about' });
            let contentConfigs = {};
            if (page) {
                try { contentConfigs = JSON.parse(page.content_configs || '{}'); } catch (e) { contentConfigs = {}; }
            }
            const list = Array.isArray(contentConfigs.histories) ? contentConfigs.histories : [];

            const index = list.findIndex(x => parseInt(x.order, 10) === orderNum);
            if (index >= 0) list[index] = item; else list.push(item);
            // sort by order asc
            list.sort((a, b) => parseInt(a.order, 10) - parseInt(b.order, 10));

            contentConfigs.histories = list;
            const contentConfigsStr = JSON.stringify(contentConfigs || {});

            if (page) {
                await PageModel.updateOne({ key: 'about' }, { $set: { content_configs: contentConfigsStr } });
            } else {
                await PageModel.create({ key: 'about', name: 'Giới thiệu', content: '', content_configs: contentConfigsStr });
            }

            return response(res, item, 'Thành công', statusCode.OK);
        } catch (err) {
            logError(err);
            return response(res, null, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }

    async deleteHistory(req, res, params) {
        try {
            const order = params.order;
            if (order === undefined)
                return response(res, null, 'Dữ liệu không hợp lệ!', statusCode.ERROR);

            const orderNum = parseInt(order, 10);
            if (isNaN(orderNum))
                return response(res, null, 'Thứ tự phải là số!', statusCode.ERROR);

            let page = await PageModel.findOne({ key: 'about' });
            if (!page)
                return response(res, {}, 'Thành công', statusCode.OK);

            let contentConfigs = {};
            try { contentConfigs = JSON.parse(page.content_configs || '{}'); } catch (e) { contentConfigs = {}; }
            const list = Array.isArray(contentConfigs.histories) ? contentConfigs.histories : [];
            const newList = list.filter(x => parseInt(x.order, 10) !== orderNum);
            contentConfigs.histories = newList;
            const contentConfigsStr = JSON.stringify(contentConfigs || {});
            await PageModel.updateOne({ key: 'about' }, { $set: { content_configs: contentConfigsStr } });

            return response(res, {}, 'Thành công', statusCode.OK);
        } catch (err) {
            logError(err);
            return response(res, null, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }
}

module.exports = new AboutController();


