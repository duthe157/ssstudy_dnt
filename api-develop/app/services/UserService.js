const cf = require('../../config/config');
const appConfig = require('../../config/app');
const BaseHelper = require('../helpers/BaseHelper');
const KeyModel = require('../models/Key');
const TokenModel = require('../models/Token');
const ClassroomModel = require('../models/Classroom');
const StudentClassroomModel = require('../models/StudentClassroom');
const UserModel = require('../models/User');
const AppConfigModel = require('../models/AppConfig');
const RedisService = require('./RedisService');
const OneSignalService = require('./OneSignalService');

class UserService {
    async generateNewToken(user, isNewKey) {
        try {
            let key = await KeyModel.findOne({ user_id: user.id });
            const newExp = await BaseHelper.addDay(new Date(), cf.TOKEN.EXPIRED_TOKEN + 1);
            newExp.setHours(0, 0, 0, 0);
            const exp = newExp.getTime();
            if (key) {
                if (isNewKey) {
                    await this.deleteKey(user, key);
                    key = null;
                }
            }
            if (!key) {
                const keyCode = await BaseHelper.generateText(cf.TOKEN.LENGTH_KEY);
                const keyDoc = {
                    user_id: user.id,
                    code: user.code,
                    key: keyCode,
                    user_group: user.user_group,
                    expired: await BaseHelper.addDay(new Date(), cf.TOKEN.EXPIRED_KEY).getTime()
                };

                key = await KeyModel.create(keyDoc);
            }
            const token = await this.genToken(user, key, user.language, exp);
            return {
                token,
                key
            };
        } catch (err) {
            logError(err);
            throw err;
        }
    }

    async generateTokenVerifyEmail(user) {
        try {
            let key = await KeyModel.findOne({ user_id: user.id });
            const newExp = await BaseHelper.addDay(new Date(), 1);
            const exp = newExp.getTime();
            if (key) {
                if (isNewKey) {
                    await this.deleteKey(user, key);
                    key = null;
                }
            }
            if (!key) {
                const keyCode = await BaseHelper.generateText(cf.TOKEN.LENGTH_KEY);
                const keyDoc = {
                    user_id: user.id,
                    code: user.code,
                    key: keyCode,
                    email: user.email,
                    user_group: user.user_group,
                    expired: await BaseHelper.addDay(new Date(), cf.TOKEN.EXPIRED_KEY).getTime()
                };

                key = await KeyModel.create(keyDoc);
            }
            const token = await this.genTokenVerifyEmail(user, key, user.language, exp);
            return {
                token,
                key
            };
        } catch (err) {
            logError(err);
            throw err;
        }
    }

    async resetPasswordToken(user) {
        try {
            const exp = await BaseHelper.addDay(new Date(), cf.TOKEN.EXPIRED_FORGOTTEN_PASS).getTime();
            const encode = {
                user_id: user.id,
                email: user.email,
                exp
            };

            const token = await BaseHelper.textEncrypt(JSON.stringify(encode), cf.TOKEN.SECRE_KEY);

            return token;
        } catch (err) {
            logError(err);
            throw err;
        }
    }

    decodeToken(token) {
        try {
            const decoded = BaseHelper.textDecrypt(token, cf.TOKEN.SECRE_KEY);
            const userObj = JSON.parse(decoded);
            return userObj;
        } catch (err) {
            logError(err);
            return false;
        }
    }

    decodeTokenVerifyEmail(token) {
        try {
            const decoded = BaseHelper.textDecrypt(token, cf.TOKEN.SECRET_KEY_EMAIL);
            const userObj = JSON.parse(decoded);
            return userObj;
        } catch (err) {
            logError(err);
            return false;
        }
    }

    async verifyKey(user, keyCode) {
        const userID = !user.user_id ? user.id : user.user_id;
        let value = null;
        let exp = null;
        const conditions = {};
        conditions.key = keyCode;
        const userKey = cf.USER_PREFIX + '_' + userID + '_' + keyCode;
        if (!userKey)
            return false;

        conditions.user_id = userID;
        value = await RedisService.getValueByKey(userKey);
        if (!value) {
            const key = await KeyModel.findOne(conditions);
            if (key) {
                exp = key.expired;
                RedisService.add(userKey, JSON.stringify(key));
            }
        } else {
            const key = JSON.parse(value);
            exp = key.expired;
        }

        const isValid = (new Date(parseInt(exp)) !== 'Invalid Date')
            && !isNaN(new Date(parseInt(exp)));
        return isValid;
    }

    async verifyResetPassToken(token) {
        const decoded = this.decodeToken(token);
        if (decoded) {
            const tokenSave = await TokenModel.findOne({ token });
            if (tokenSave) {
                const currentTime = new Date().getTime();
                if (currentTime < tokenSave.expired) {
                    decoded.tokenID = tokenSave.id;
                    return decoded;
                }
            }
        }
        return false;
    }

    async deleteKey(user, key = null) {
        try {
            const userID = (!user.user_id) ? user.id : user.user_id;
            let redisKey = null;
            if (!key) {
                key = await KeyModel.findOne({ user_id: userID });
                redisKey = key ? cf.USER_PREFIX + '_' + userID + '_' + key.key : false;
            } else {
                redisKey = cf.USER_PREFIX + '_' + userID + '_' + key.key;

                if (redisKey) {
                    await KeyModel.delete({ _id: key.id });
                    await RedisService.removeValue(redisKey);
                }
            }
        } catch (err) {
            logError(err);
        }
    }

    async genToken(user, key, expToken) {
        const keyCode = key.key;
        const today = new Date();

        const encode = {
            user_id: user.id,
            code: user.code,
            fullname: user.fullname,
            user_group: user.user_group,
            exp: expToken,
            key: keyCode,
            time: today.getTime()
        };
        return BaseHelper.textEncrypt(JSON.stringify(encode), cf.TOKEN.SECRE_KEY);
    }

    async genTokenVerifyEmail(user, key, expToken) {
        const keyCode = key.key;
        const today = new Date();

        const encode = {
            user_id: user.id,
            code: user.code,
            fullname: user.fullname,
            user_group: user.user_group,
            exp: expToken,
            key: keyCode,
            email: user.email,
            time: today.getTime()
        };
        return BaseHelper.textEncrypt(JSON.stringify(encode), cf.TOKEN.SECRET_KEY_EMAIL);
    }

    addDeviceOnesignal(endPoint, data) {
        const headers = {
            'Content-Type': 'application/json; charset=utf-8',
            Authorization: 'Basic ' + appConfig.ONESIGNAL.API_KEY
        };

        const options = {
            host: 'onesignal.com',
            port: 443,
            path: endPoint,
            method: 'POST',
            headers: headers
        };

        const https = require('https');
        const req = https.request(options, (res) => {
            res.on('data', (data) => {

            });
        });

        req.on('error', (e) => {

        });

        req.write(JSON.stringify(data));
        req.end();
    }

    async addMemberToClassroom(classroomID, user) {
        try {
            const classroom = await ClassroomModel.findOne({ _id: classroomID });
            if (classroom) {
                const classroomUser = await StudentClassroomModel.findOne({ 'user.id': user.id, 'classroom.id': classroomID, deleted_at: null });
                if (!classroomUser) {
                    const docUser = {
                        classroom: { id: classroomID, name: classroom.name, code: classroom.code },
                        user: { id: user.id, name: user.fullname, code: user.code },
                        rank: 0,
                        total_testing: 0,
                        total_testing_sent: 0,
                        avg_point: 0,
                        sobuoihoc: 0,
                        buoidahoc: 0,
                        last_sbh: 0,
                        joined_at: new Date()
                    };
                    const rs = await StudentClassroomModel.create(docUser);
                    if (rs)
                        return rs;
                    return false;
                }
            }
        } catch (err) {
            logError(err);
            return false;
        }
    }

    async setExternalUserId() {
        try {
            const limit = 20;
            const _key = 'onesignal_user_offset';
            let offset = await RedisService.getValueByKey(_key);
            offset = parseInt(offset);
            if (!offset || offset <= 0) {
                const offsetData = await AppConfigModel.findOne({ key: _key });
                if (!offsetData)
                    return false;

                offset = parseInt(offsetData.value);
                if (!offset || offset <= 0)
                    return false;
            }

            const url = 'https://onesignal.com/api/v1/players?app_id=' + appConfig.ONESIGNAL.APP_ID + '&limit=' + limit + '&offset=' + offset;
            const options = {
                method: 'GET',
                url: url,
                headers: { 'Authorization': 'Basic ' + appConfig.ONESIGNAL.API_KEY },
            };
            const data = await BaseHelper.sendRequest(options);
            if (data.players.length <= 0)
                return false;

            const players = data.players;
            const userID = [];
            for (let i = 0; i < players.length; i++) {
                const playerID = players[i].id;
                const playerTags = players[i].tags;
                const _bodyData = {};
                _bodyData.tags = {};
                if (!players[i].external_user_id && playerTags.user_code) {
                    const conditions = {
                        code: playerTags.user_code,
                        deleted_at: null
                    }
                    const _user = await UserModel.findOne(conditions);
                    if (_user) {
                        _bodyData.external_user_id = _user.id;
                        const tags = await this.getTagByClassroom(playerTags.user_code);
                        _bodyData.tags = tags;
                        OneSignalService.editDevice(playerID, _bodyData);
                        userID.push(_user.id);                        
                    }
                }
            }

            offset += data.players.length;
            // RedisService.add(_key, offset);
            // AppConfigModel.updateOne({ key: _key }, { $set: { value: offset } });
            UserModel.updateMany({ _id: { $in: userID } }, { $set: { is_os_external_user_id: true } });
        } catch (err) {
            logError(err);
        }
    }

    async getTagByClassroom(userCode) {
        try {
            const deviceTags = {};
            deviceTags.user_code = userCode;
            const classrooms = await StudentClassroomModel.find({ 'user.code': userCode, deleted_at: null });
            if (classrooms) {
                for (let i = 0; i < classrooms.length; i++) {
                    const _tagKey = classrooms[i].classroom.id;
                    deviceTags[_tagKey] = 1;
                }
            }
            await UserModel.updateOne({ code: userCode }, { $set: { device_tags: deviceTags } });
            return deviceTags;
        } catch (err) {
            logError(err);
            return null;
        }
    }
}

module.exports = new UserService();

