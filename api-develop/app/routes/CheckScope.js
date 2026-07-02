const appConfig = require('../../config/app');
const BaseHelper = require('../helpers/BaseHelper');

const userScopes = BaseHelper.fileToJSON(`${__dirname}/../../config/user_scopes.json`);

class CheckScope {
    constructor(req, res) {
        this.req = req;
        this.res = res;
    }

    async handle() {
        try {
            return this.checkUserScope();
        } catch (err) {
            return false;
        }
    }

    checkUserScope() {
        let role = appConfig.USER_GROUP.STUDENT;
        if (this.req.user.user_group)
            role = this.req.user.user_group;

        if (role == appConfig.USER_GROUP.ADMIN)
            return true;

        const avaiableScopes = userScopes[role];
        let originalUrl = this.req.originalUrl;
        originalUrl = originalUrl.replace('/1.0/', '/');
        originalUrl = originalUrl.replace('/v2/', '/');
        const path = originalUrl.split('/');
        let [, controller, action] = path;
        if (action && action.includes('?')) {
            action = action.split('?')[0];
        }
        action = action.replace(/-/g, '_');
        controller = controller.replace(/-/g, '_');
        const avaiableActions = avaiableScopes[controller];
        if (avaiableActions) {
            if (avaiableActions == true) {
                return true;
            }

            if (_.includes(avaiableActions, action)) {
                return true;
            }

        }

        return false;
    }
}

module.exports = CheckScope;
