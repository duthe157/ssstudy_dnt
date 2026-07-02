const appConfig = require('../../config/app');
const UserService = require('../services/UserService');
const SubjectModel = require('../models/Subject');
const RedisService = require('../services/RedisService');

class CheckToken {
    constructor(req) {
        this.req = req;
    }

    async verify() {
        try {
            if (this.req.headers.authorization === undefined) {
                return false;
            }

            if (this.req.headers.authorization.startsWith('Bearer ')) {
                this.req.headers.authorization = this.req.headers.authorization.replace('Bearer ', '');
            }
            const currentTime = new Date().getTime();
            const decodedToken = UserService.decodeToken(this.req.headers.authorization);
            if (!decodedToken) {
                return false;
            }
            const isExprired = (currentTime > decodedToken.exp);
            const isValidKey = await UserService.verifyKey(decodedToken, decodedToken.key);

            // Get Info User
            let subjectID = [];
            if (decodedToken.user_group === appConfig.USER_GROUP.TEACHER) {
                const userRedisKey = 'USER_SUBJECT_' + decodedToken.user_id;
                const userInfo = await RedisService.getValueByKey(userRedisKey);
                if (!userInfo) {
                    const w = { 'teacher.id': decodedToken.user_id };
                    const subjects = await SubjectModel.find(w);
                    for (let i = 0; i < subjects.length; i++) {
                        subjectID.push(subjects[i].id);
                    }
                    RedisService.add(userRedisKey, JSON.stringify(subjectID));
                } else {
                    subjectID = JSON.parse(userInfo);
                }
            }

            if (decodedToken.user_group === appConfig.USER_GROUP.SUPPORTER) {
                const userRedisKey = 'USER_SUBJECT_' + decodedToken.user_id;
                const userInfo = await RedisService.getValueByKey(userRedisKey);
                if (!userInfo) {
                    const w = { 'supporter.id': decodedToken.user_id };
                    const subjects = await SubjectModel.find(w);
                    for (let i = 0; i < subjects.length; i++) {
                        subjectID.push(subjects[i].id);
                    }
                    RedisService.add(userRedisKey, JSON.stringify(subjectID));
                } else {
                    subjectID = JSON.parse(userInfo);
                }
            }
            
            decodedToken.subject_ids = subjectID;
            this.req.user = decodedToken;

            return (isValidKey && !isExprired);
        } catch (err) {
            logError(err);
            return false;
        }
    }
}

module.exports = CheckToken;
