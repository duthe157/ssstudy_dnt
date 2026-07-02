const BaseHelper = require('../helpers/BaseHelper');
const SettingModel = require('../models/Setting');
const language = BaseHelper.fileToJSON(`${__dirname}/../languages/vi.json`);

class SettingController {
    async show(req, res, params) {
        try {
            const { id } = params;

            const conditions = { _id: id };
            const rs = await SettingModel.findOne(conditions);
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
            const rs = await SettingModel.findOne(conditions);
            return response(res, rs, 'Thành công', statusCode.OK);
        } catch (err) {
            logError(err);
            return response(res, null, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }

    async website(req, res, params) {
        try {
            const settingName = params.setting_name || '';

            const conditions = { group: 'WEBSITE' };
            if (settingName)
                conditions.setting_name = settingName;

            const rs = await SettingModel.find(conditions);
            const settings = {};
            for (let i = 0; i < rs.length; i++) {
                settings[rs[i].setting_name] = rs[i].setting_value;
            }

            return response(res, settings, 'Thành công', statusCode.OK);
        } catch (err) {
            logError(err);
            return response(res, null, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }

    async update(req, res, params) {
        try {
            const { setting } = params;
            if (!setting || setting.length === 0)
                return response(res, null, 'Dữ liệu không hợp lệ!', statusCode.OK);

            for (let i = 0; i < setting.length; i++) {
                const docSetting = {
                    name: setting[i].name,
                    description: setting[i].description,
                    setting_name: setting[i].setting_name,
                    setting_value: setting[i].setting_value,
                    group: 'WEBSITE'
                };

                const conditions = { setting_name: setting[i].setting_name };
                let item;
                item = await SettingModel.findOne(conditions);
                if (item) {
                    await SettingModel.updateOne(conditions, { $set: docSetting });
                    item.setting_value = setting[i].setting_value;
                } else {
                    item = await SettingModel.create(docSetting);
                }
            }

            return response(res, {}, 'Thành công', statusCode.OK);
        } catch (err) {
            logError(err);
            return response(res, {}, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }
}

module.exports = new SettingController();
