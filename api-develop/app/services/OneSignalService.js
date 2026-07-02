const OneSignal = require('onesignal-node');
const appConfig = require('../../config/app');

class OneSignalService {
    async addDevice(data) {
        try {
            const client = new OneSignal.Client(appConfig.ONESIGNAL.APP_ID, appConfig.ONESIGNAL.API_KEY);
            const response = await client.addDevice(data);
            return response.body;
        } catch (err) {
            logError(err);
        }
    }

    async editDevice(id, data) {
        try {
            const client = new OneSignal.Client(appConfig.ONESIGNAL.APP_ID, appConfig.ONESIGNAL.API_KEY);
            const response = await client.editDevice(id, data);
            return response.body;
        } catch (err) {
            logError(err);
        }
    }

    async editTagDevice(externalUserID, _tags) {
        try {
            const client = new OneSignal.Client(appConfig.ONESIGNAL.APP_ID, appConfig.ONESIGNAL.API_KEY);
            const response = await client.editTagsWithExternalUserIdDevice(externalUserID, { tags: _tags });
            return response.body;
        } catch (err) {
            const text = JSON.stringify(err);
            if (text.indexOf('No users with this external_id found') < 0)
                logError(err);
        }
    }

    async showDevice(id) {
        try {
            const client = new OneSignal.Client(appConfig.ONESIGNAL.APP_ID, appConfig.ONESIGNAL.API_KEY);
            const response = await client.viewDevice(id);
        } catch (err) {
            logError(err);
        }
    }

    async sendNotification(heading, contents, segments = null, filters = null, webURL = null, appURL = null, osn) {
        try {
            let client = null;
            if (osn === 1)
                client = new OneSignal.Client(appConfig.ONESIGNAL.APP_ID, appConfig.ONESIGNAL.API_KEY);
            else
                client = new OneSignal.Client(appConfig.ONESIGNAL_2.APP_ID, appConfig.ONESIGNAL_2.API_KEY);
            const notification = {
                headings: { en: heading },
                contents: { en: contents },
                included_segments: segments,
                filters: filters
            };

            if (webURL)
                notification.web_url = webURL;

            if (appURL)
                notification.app_url = appURL;

            // using async/await
            try {
                const response = await client.createNotification(notification);
                if (response.body.id)
                    return response.body.id;
                return null;
            } catch (e) {
                if (e instanceof OneSignal.HTTPError) {
                    logError(e);
                }
            }
        } catch (err) {
            logError(err);
        }
    }
}

module.exports = new OneSignalService();

