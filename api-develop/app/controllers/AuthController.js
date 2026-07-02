
const mongoose = require('mongoose');
const cf = require('../../config/config');
const appConfig = require('../../config/app');
const UserService = require('../services/UserService');
const MailService = require('../services/MailService');
const AppService = require('../services/AppService');
const ValidateHelper = require('../helpers/ValidateHelper');
const BaseHelper = require('../helpers/BaseHelper');
const UserModel = require('../models/User');
const language = BaseHelper.fileToJSON(`${__dirname}/../languages/vi.json`);
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client();

class AuthController {
    async signup(req, res, params) {
        try {
            let email = params.email || '';
            let password = params.password || '';
            const fullname = params.fullname || '';
            const dob = params.dob || null;
            let phone = params.phone || null;
            const address = params.address || null;
            const classroom = params.classroom || null;
            const school = params.school || null;
            const type = params.type || 'LEAD';
            let check = false;
            if (!phone)
                return response(res, null, 'Số điện thoại là bắt buộc!', statusCode.ERROR);

            if (!email)
                return response(res, null, 'Vui lòng nhập Email!', statusCode.ERROR);

            email = email.toLocaleString();
            email = email.toLowerCase();
            let flag = await ValidateHelper.isEmail(email);
            if (!flag)
                return response(res, null, language.EMAIL_INVALID, statusCode.ERROR);

            password = password.trim();
            if (!BaseHelper.passwordValidate(password))
                return response(res, {}, language.PASS_INVALID, statusCode.ERROR);
            flag = true;

            phone = BaseHelper.getPhone(phone);
            if (!phone)
                return response(res, null, language.PHONE_INVALID, statusCode.ERROR);

            let code = '';

            if (phone) {
                code = phone;
                check = await UserModel.findOne({ phone: phone, deleted_at: null });
                if (check)
                    return response(res, null, 'Số điện thoại này đã được sử dụng!', statusCode.ERROR);
            }

            if (fullname.trim() == '')
                return response(res, null, language.FULLNAME_INVALID, statusCode.ERROR);

            let user = await UserModel.findOne({ email: email, deleted_at: null });

            if (user)
                return response(res, null, 'Email này đã được sử dụng!', statusCode.ERROR);

            const passEncrypt = BaseHelper.encryptMD5(cf.TOKEN.MD5_BEFORE, password, cf.TOKEN.MD5_AFTER);

            const alias = BaseHelper.seoURL(fullname) + '-' + new Date().getTime();
            const docUser = {
                email,
                password: passEncrypt,
                fullname,
                alias,
                phone,
                address,
                classroom,
                school,
                avatar: null,
                type,
                code,
                dob,
                balance: 0,
                sub_balance: 0,
                user_group: appConfig.USER_GROUP.STUDENT,
                status: 'ACTIVE'
            };

            if (code) {
                check = await UserModel.findOne({ code: code, deleted_at: null });
                if (check)
                    return response(res, null, 'Mã hoặc số điện thoại đã được sử dụng!', statusCode.ERROR);
            }

            if (dob)
                docUser.dob_2 = new Date(dob);

            user = await UserModel.create(docUser);
            if (!user)
                return response(res, null, language.ERROR, statusCode.ERROR);


            try {
                // UserService.addMemberToClassroom(appConfig.FIRST_CLASSROOM_ID, user);
                const userTagDevice = { user_code: user.code };
                userTagDevice[user.id] = 1;
                AppService.editTagDeviceWithID(user.id, userTagDevice);
            } catch (err) {
                // logError(err);
            }

            const rs = await UserService.generateNewToken(user, false);
            docUser.token = rs.token;
            docUser.user_id = user.id;
            return response(res, docUser, language.PROCESS_SUCCESS, statusCode.OK);
        } catch (err) {
            logError(err);
            return response(res, null, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }

    //signup for iframe
    async signup_2(req, res, params) {
        try {
            let email = params.email || '';
            let password = params.password || '';
            let phone = params.phone || '';
            const description = params.description || '';
            const level = params.level || '';

            const fullname = params.fullname || '';
            const dob = params.dob || null;
            const address = params.address || null;
            const classroom = params.classroom || null;
            const school = params.school || null;
            const type = params.type || 'LEAD';
            let check = false;

            if (!email)
                return response(res, null, 'Vui lòng nhập Email!', statusCode.ERROR);

            if (!fullname)
                return response(res, null, 'Vui lòng nhập Tên!', statusCode.ERROR);

            if (!password)
                return response(res, null, 'Vui lòng nhập mật khẩu!', statusCode.ERROR);


            email = email.toLocaleString();
            email = email.toLowerCase();
            let flag = await ValidateHelper.isEmail(email);
            if (!flag)
                return response(res, null, language.EMAIL_INVALID, statusCode.ERROR);

            password = password.trim();
            if (!BaseHelper.passwordValidate(password))
                return response(res, {}, language.PASS_INVALID, statusCode.ERROR);
            flag = true;

            let is_phone = BaseHelper.getPhone(phone);
            if (phone.length > 1 && !is_phone)
                return response(res, null, language.PHONE_INVALID, statusCode.ERROR);

            let code = Date.now().toString();

            if (phone.length > 1) {
                code = phone;
                check = await UserModel.findOne({ phone: phone, deleted_at: null });
                if (check)
                    return response(res, null, 'Số điện thoại này đã được sử dụng!', statusCode.ERROR);
            }

            if (fullname.trim() == '')
                return response(res, null, language.FULLNAME_INVALID, statusCode.ERROR);

            let user = await UserModel.findOne({ email: email, deleted_at: null });

            if (user)
                return response(res, null, 'Email này đã được sử dụng!', statusCode.ERROR);

            const passEncrypt = BaseHelper.encryptMD5(cf.TOKEN.MD5_BEFORE, password, cf.TOKEN.MD5_AFTER);

            const alias = BaseHelper.seoURL(fullname) + '-' + new Date().getTime();
            const docUser = {
                email,
                password: passEncrypt,
                fullname,
                alias,
                phone,
                address,
                classroom,
                school,
                avatar: null,
                type,
                code,
                dob,
                balance: 0,
                sub_balance: 0,
                user_group: appConfig.USER_GROUP.STUDENT,
                level,
                description,
                status: 'ACTIVE'
            };

            if (code) {
                check = await UserModel.findOne({ code: code, deleted_at: null });
                if (check)
                    return response(res, null, 'Mã học sinh đã được sử dụng, Xin thử đăng ký lại!', statusCode.ERROR);
            }

            if (dob)
                docUser.dob_2 = new Date(dob);

            user = await UserModel.create(docUser);
            if (!user)
                return response(res, null, language.ERROR, statusCode.ERROR);


            try {
                // UserService.addMemberToClassroom(appConfig.FIRST_CLASSROOM_ID, user);
                const userTagDevice = { user_code: user.code };
                userTagDevice[user.id] = 1;
                AppService.editTagDeviceWithID(user.id, userTagDevice);
            } catch (err) {
                // logError(err);
            }

            const rs = await UserService.generateNewToken(user, false);
            docUser.token = rs.token;
            docUser.user_id = user.id;
            return response(res, docUser, language.PROCESS_SUCCESS, statusCode.OK);
        } catch (err) {
            console.log(err)
            logError(err);
            return response(res, null, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }

    async sendVerifyEmail(req, res, params) {
        try {
            const urlRedirect = params.urlRedirect;
            const domain = params.domain;
            let email = params.email || '';
            let password = params.password || '';
            let phone = params.phone || '';
            const description = params.description || '';
            const level = params.level || '';

            const fullname = params.fullname || email.split("@")[0];
            const dob = params.dob || null;
            const address = params.address || null;
            const classroom = params.classroom || null;
            const school = params.school || null;
            const type = params.type || 'LEAD';

            if (!email)
                return response(res, null, 'Vui lòng nhập Email!', statusCode.ERROR);

            if (!password)
                return response(res, null, 'Vui lòng nhập mật khẩu!', statusCode.ERROR);

            email = email.toLocaleString();
            email = email.toLowerCase();
            let flag = await ValidateHelper.isEmail(email);
            if (!flag)
                return response(res, null, language.EMAIL_INVALID, statusCode.ERROR);

            password = password.trim();
            if (!BaseHelper.passwordValidate(password))
                return response(res, {}, language.PASS_INVALID, statusCode.ERROR);

            let code = Date.now().toString();

            let checkCode = await UserModel.findOne({ code: code, deleted_at: null });

            if (checkCode)
                return response(res, null, 'Mã học sinh đã được sử dụng, Xin thử đăng ký lại!', statusCode.ERROR);

            let user = await UserModel.findOne({ email: email, deleted_at: null });

            if (user && user.status === 'ACTIVE')
                return response(res, null, 'Email này đã được sử dụng!', statusCode.ERROR);

            if (user && user.status === 'VERIFY-EMAIL')
                return response(res, null, 'Xin vui lòng kiểm tra email xác minh đăng ký!', statusCode.ERROR);

            const passEncrypt = BaseHelper.encryptMD5(cf.TOKEN.MD5_BEFORE, password, cf.TOKEN.MD5_AFTER);

            const alias = BaseHelper.seoURL(fullname) + '-' + new Date().getTime();
            const docUser = {
                email,
                password: passEncrypt,
                fullname,
                alias,
                phone,
                address,
                classroom,
                school,
                avatar: null,
                type,
                code,
                dob,
                balance: 0,
                sub_balance: 0,
                user_group: appConfig.USER_GROUP.STUDENT,
                level,
                description,
                status: 'VERIFY-EMAIL'
            };

            if (dob)
                docUser.dob_2 = new Date(dob);

            user = await UserModel.create(docUser);
            if (!user)
                return response(res, null, language.ERROR, statusCode.ERROR);

            try {
                const userTagDevice = { user_code: user.code };
                userTagDevice[user.id] = 1;
                await AppService.editTagDeviceWithID(user.id, userTagDevice);
            } catch (err) {
                // logError(err);
            }

            const rs = await UserService.generateTokenVerifyEmail(user, false);
            docUser.token = rs.token;
            docUser.user_id = user.id;

            let url = domain + '/verify-email?token=' + rs.token + '&urlRedirect=' + urlRedirect;
            await MailService.sendLinkVerifyRegistration(email, url)
            return response(res, docUser, 'Xin vui lòng kiểm tra email xác minh của bạn hoặc đăng nhập bằng google!', statusCode.OK);
        } catch (err) {
            console.log(err)
            logError(err);
            return response(res, null, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }

    async verifyTokenEmail(req, res, params) {
        try {
            const token = params.token;
            const decodedToken = UserService.decodeTokenVerifyEmail(token);
            if (!decodedToken) {
                return false;
            }
            const currentTime = new Date().getTime();
            const isExprired = (currentTime > decodedToken.exp);
            console.log(decodedToken)
            const isValidKey = await UserService.verifyKey(decodedToken, decodedToken.key);
            if (isExprired)
                return response(res, {}, 'Token hết thời hạn!', statusCode.ERROR);

            if (!isValidKey)
                return response(res, {}, 'Token không tồn tại!', statusCode.ERROR);

            const conditions = {};
            conditions.$or = [
                {code: decodedToken.email},
                {email: decodedToken.email}
            ];

            const user = await UserModel.findOne(conditions);
            if (user) {
                if (user.deleted_at)
                    return response(res, {}, 'Tài khoản của bạn đã bị xóa khỏi hệ thống!', statusCode.ERROR);

                const rs = await UserService.generateNewToken(user, true);
                const result = {
                    token: rs.token,
                    user_id: user.id,
                    code: user.code,
                    fullname: user.fullname,
                    email: user.email,
                    level: user.level,
                    time_login: new Date().getTime(),
                    phone: user.phone,
                    avatar: user.avatar,
                    user_group: user.user_group
                };

                await UserModel.updateOne({_id: user.id}, {last_login: new Date(), status: 'ACTIVE'});
                await UserService.setExternalUserId();
                // await MailService.sendEmailNotifyNewUserForSale(user);
                return response(res, result, 'Đăng nhập thành công!', statusCode.OK);
            }
            return response(res, {}, language.LOGIN_INFO_ERROR, statusCode.ERROR);
        } catch (err) {
            console.log(err)
            logError(err);
            return response(res, null, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }

    async signin(req, res, params) {
        try {
            let email = params.email || '';
            const password = params.password || '';

            const site = params.site || ''

            let permissions = ['STUDENT', 'ADMIN', 'TEACHER'];
            if (site && site === 'admin') {
                permissions = ['ADMIN', 'TEACHER', 'MANAGER', 'SUPPORTER', 'ACCOUNTANT', 'EDITOR', 'SALE_MANAGER', 'SALE_STAFF', 'MEDIA', 'TRAINING_STAFF'];
            }

            const passEncrypt = BaseHelper.encryptMD5(cf.TOKEN.MD5_BEFORE, password, cf.TOKEN.MD5_AFTER);
            const conditions = {};
            email = email.toLocaleString();
            conditions.$or = [
                { code: email.toUpperCase() },
                { phone: email.toLowerCase() },
                { email: email.toLowerCase() }
            ];

            conditions.password = passEncrypt;
            conditions.deleted_at = null;

            const user = await UserModel.findOne(conditions);

            if (user) {
                if (user.deleted_at)
                    return response(res, {}, 'Tài khoản của bạn đã bị xóa khỏi hệ thống!', statusCode.ERROR);

                if (user.status == 'BLOCKED_ON_VIDEO' || user.status == 'BLOCKED' || user.status == 'DEACTIVE')
                    return response(res, {}, 'Tài khoản của bạn đã bị vô hiệu!', statusCode.ERROR);

                if (!permissions.includes(user.user_group)) {
                    return response(res, {}, 'Tài khoản của bạn không có quyền truy cập', statusCode.ERROR)
                }

                if (user.status === 'VERIFY-EMAIL')
                    return response(res, {}, 'Tài khoản của bạn chưa đuợc xác minh email!', statusCode.ERROR);

                const rs = await UserService.generateNewToken(user, false);
                const result = {
                    token: rs.token,
                    user_id: user.id,
                    code: user.code,
                    fullname: user.fullname,
                    email: user.email,
                    level: user.level,
                    time_login: new Date().getTime(),
                    phone: user.phone,
                    avatar: user.avatar,
                    user_group: user.user_group
                };

                await UserModel.updateOne({ _id: user.id }, { last_login: new Date() });
                UserService.setExternalUserId();
                return response(res, result, 'Đăng nhập thành công!', statusCode.OK);
            }

            return response(res, {}, language.LOGIN_INFO_ERROR, statusCode.ERROR);
        } catch (err) {
            logError(err);
            return response(res, {}, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }

    async userinfo(req, res) {
        try {
            const conditions = {
                _id: mongoose.Types.ObjectId(req.user.user_id),
                status: cf.COMMON_STATUS.ACTIVE
            };
            const projections = 'email fullname phone packages created_at last_login point language avatar';

            const user = await UserModel.findOne(conditions, projections);

            if (!user) {
                return response(res, {}, 'Token invalid', statusCode.UNAUTHORIZED);
            }

            const currentDate = new Date();
            if (user) {
                const result = {
                    user_id: user.id,
                    code: user.code,
                    fullname: user.fullname || '',
                    email: user.email,
                    time_login: currentDate.getTime(),
                    phone: user.phone,
                    avatar: user.avatar,
                    user_group: user.user_group
                };
                return response(res, result, language.PROCESS_SUCCESS, statusCode.OK);
            }

            return response(res, {}, language.LOGIN_INFO_ERROR, statusCode.ERROR);
        } catch (err) {
            logError(err);
            return response(res, {}, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }

    async signInGoogle(req, res, params) {
        const { credential, client_id } = params;

        try {
            const ticket = await client.verifyIdToken({
                idToken: credential,
                audience: client_id,
            });
            const payload = ticket.getPayload();
            const userid = payload['sub'];
            let email = payload['email'];
            const given_name = payload['given_name'];
            const family_name = payload['family_name'];
            const name = payload['name'];
            const picture = payload['picture'];
            const conditions = {};
            email = email.toLocaleString();
            const dob = '';
            conditions.$or = [
                { code: email.toUpperCase() },
                { phone: email.toLowerCase() },
                { email: email.toLowerCase() }
            ];

            const user = await UserModel.findOne(conditions);

            if (user) {
                if (user.deleted_at)
                    return response(res, {}, 'Tài khoản của bạn đã bị xóa khỏi hệ thống!', statusCode.ERROR);

                if (user.status == 'BLOCKED_ON_VIDEO' || user.status == 'BLOCKED' || user.status == 'DEACTIVE')
                    return response(res, {}, 'Tài khoản của bạn đã bị vô hiệu!', statusCode.ERROR);

                const rs = await UserService.generateNewToken(user, false);
                const result = {
                    token: rs.token,
                    user_id: user.id,
                    code: user.code,
                    fullname: user.fullname,
                    email: user.email,
                    level: user.level,
                    time_login: new Date().getTime(),
                    phone: user.phone,
                    avatar: user.avatar,
                    user_group: user.user_group
                };
                await UserModel.updateOne({_id: user.id}, {last_login: new Date(), status: 'ACTIVE'});
                UserService.setExternalUserId();
                return response(res, result, 'Đăng nhập thành công!', statusCode.OK);
            } else {
                let check = false;
                let code = Date.now().toString();
                const alias = BaseHelper.seoURL(name) + '-' + new Date().getTime();
                const docUser = {
                    email,
                    fullname: name,
                    alias,
                    avatar: null,
                    type: 'GOOGLE',
                    code,
                    dob,
                    balance: 0,
                    sub_balance: 0,
                    user_group: appConfig.USER_GROUP.STUDENT,
                    status: 'ACTIVE'
                };
                if (code) {
                    check = await UserModel.findOne({ code: code, deleted_at: null });
                    if (check)
                        return response(res, null, 'Mã học sinh đã được sử dụng, Xin thử đăng ký lại!', statusCode.ERROR);
                }

                if (dob)
                    docUser.dob_2 = new Date(dob);

                let new_user = await UserModel.create(docUser);
                if (!new_user)
                    return response(res, null, language.ERROR, statusCode.ERROR);

                try {
                    // UserService.addMemberToClassroom(appConfig.FIRST_CLASSROOM_ID, user);
                    const userTagDevice = { user_code: new_user.code };
                    userTagDevice[new_user.id] = 1;
                    AppService.editTagDeviceWithID(new_user.id, userTagDevice);
                } catch (err) {
                    // logError(err);
                }

                const rs = await UserService.generateNewToken(new_user, false);
                docUser.token = rs.token;
                docUser.user_id = new_user.id;
                return response(res, docUser, language.PROCESS_SUCCESS, statusCode.OK);
            }

            return response(res, {}, language.LOGIN_INFO_ERROR, statusCode.ERROR);

        } catch (err) {
            console.log(err)
            logError(err);
            return response(res, {}, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }
}

module.exports = new AuthController();
