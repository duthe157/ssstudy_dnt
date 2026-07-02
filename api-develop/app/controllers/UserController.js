const config = require('../../config/config');
const appConfig = require('../../config/app');
const MailService = require('../services/MailService');
const UserService = require('../services/UserService');
const UploadService = require('../services/UploadService');
const BaseHelper = require('../helpers/BaseHelper');
const UserModel = require('../models/User');
const TestingModel = require('../models/Testing');
const BillingModel = require('../models/Billing');
const BillingItemModel = require('../models/BillingItem');
const ClassroomModel = require('../models/Classroom');
const AttendanceModel = require('../models/Attendance');
const PointLogModel = require('../models/PointLog');
const StudentClassroomModel = require('../models/StudentClassroom');
const ExamClassroomModel = require('../models/ExamClassroom');
const ReviewModel = require('../models/Review');
const language = BaseHelper.fileToJSON(`${__dirname}/../languages/vi.json`);

class UserController {
    async listTeacher(req, res, params) {
        try {
            const keyword = params.keyword || false;
            const page = parseInt(params.page || appConfig.PAGINATION.PAGE);
            const limit = parseInt(params.limit || appConfig.PAGINATION.LIMIT);
            const type = params.type || null;

            const conditions = { deleted_at: null, status: 'ACTIVE' };

            conditions.user_group = appConfig.USER_GROUP.TEACHER;
            const options = {
                skip: (page - 1) * limit,
                limit: limit,
                sort: { created_at: -1 }
            };

            const sortKey = params.sort_key || null;
            const sortValue = params.sort_value || null;
            if (sortKey && (sortValue == 1 || sortValue == -1)) {
                options.sort = {};
                options.sort[sortKey] = sortValue;
            }

            if (keyword) {
                conditions.$or = [
                    { fullname: { $regex: keyword, $options: 'i' } },
                    { email: { $regex: keyword, $options: 'i' } },
                    { phone: { $regex: keyword, $options: 'i' } },
                    { code: { $regex: keyword, $options: 'i' } }
                ];
            }

            if (type)
                conditions.type = type;

            const records = await UserModel.find(conditions, null, options);
            const total = await UserModel.count(conditions);
            const data = {
                records,
                total,
                limit,
                totalRecord: total,
                perPage: limit,
                items: records
            };
            return response(res, data, 'Thành công', statusCode.OK);
        } catch (err) {
            logError(err);
            return response(res, null, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }

    async list(req, res, params) {
        try {
            const keyword = params.keyword || false;
            const page = parseInt(params.page || appConfig.PAGINATION.PAGE);
            const limit = parseInt(params.limit || appConfig.PAGINATION.LIMIT);
            const userGroup = params.user_group || false;
            const type = params.type || null;
            const status = params.status || null;

            const conditions = { deleted_at: null };
            conditions.user_group = appConfig.USER_GROUP.STUDENT;
            if (userGroup && userGroup == appConfig.USER_GROUP.TEACHER)
                conditions.user_group = appConfig.USER_GROUP.TEACHER;

            const options = {
                skip: (page - 1) * limit,
                limit: limit,
                sort: { created_at: -1 }
            };

            const sortKey = params.sort_key || null;
            const sortValue = params.sort_value || null;
            if (sortKey && (sortValue == 1 || sortValue == -1)) {
                options.sort = {};
                options.sort[sortKey] = sortValue;
            }

            if (keyword) {
                conditions.$or = [
                    { fullname: { $regex: keyword, $options: 'i' } },
                    { email: { $regex: keyword, $options: 'i' } },
                    { phone: { $regex: keyword, $options: 'i' } },
                    { code: { $regex: keyword, $options: 'i' } }
                ];
            }

            if (type)
                conditions.type = type;

            if (status)
                conditions.status = status;

            const records = await UserModel.find(conditions, null, options);
            const total = await UserModel.count(conditions);
            const data = {
                records,
                total,
                limit,
                totalRecord: total,
                perPage: limit,
                items: records
            };
            return response(res, data, 'Thành công', statusCode.OK);
        } catch (err) {
            logError(err);
            return response(res, null, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }

    async admins(req, res, params) {
        try {
            const keyword = params.keyword || false;
            const userGroup = params.user_group || false;
            const page = parseInt(params.page || appConfig.PAGINATION.PAGE);
            const limit = parseInt(params.limit || appConfig.PAGINATION.LIMIT);
            const status = params.status || null;

            const conditions = { deleted_at: null };

            conditions.user_group = { $ne: appConfig.USER_GROUP.STUDENT };
            if (userGroup)
                conditions.user_group = userGroup;

            const options = {
                skip: (page - 1) * limit,
                limit: limit,
                sort: { created_at: -1 }
            };

            const sortKey = params.sort_key || null;
            const sortValue = params.sort_value || null;
            if (sortKey && (sortValue == 1 || sortValue == -1)) {
                options.sort = {};
                options.sort[sortKey] = sortValue;
            }

            if (keyword) {
                conditions.$or = [
                    { fullname: { $regex: keyword, $options: 'i' } },
                    { email: { $regex: keyword, $options: 'i' } },
                    { phone: { $regex: keyword, $options: 'i' } },
                    { code: { $regex: keyword, $options: 'i' } }
                ];
            }

            if (status)
                conditions.status = status;

            const records = await UserModel.find(conditions, null, options);
            const total = await UserModel.count(conditions);
            const data = {
                records,
                total,
                limit,
                totalRecord: total,
                perPage: limit,
                items: records
            };
            return response(res, data, 'Thành công', statusCode.OK);
        } catch (err) {
            logError(err);
            return response(res, null, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }

    async accountants(req, res, params) {
        try {
            const keyword = params.keyword || false;
            const page = parseInt(params.page || appConfig.PAGINATION.PAGE);
            const limit = parseInt(params.limit || appConfig.PAGINATION.LIMIT);

            const conditions = { deleted_at: null };

            conditions.user_group = {
                $in: [appConfig.USER_GROUP.ACCOUNTANT, appConfig.USER_GROUP.ADMIN]
            }

            const options = {
                skip: (page - 1) * limit,
                limit: limit,
                sort: { created_at: -1 }
            };

            const sortKey = params.sort_key || null;
            const sortValue = params.sort_value || null;
            if (sortKey && (sortValue == 1 || sortValue == -1)) {
                options.sort = {};
                options.sort[sortKey] = sortValue;
            }

            if (keyword) {
                conditions.$or = [
                    { fullname: { $regex: keyword, $options: 'i' } },
                    { email: { $regex: keyword, $options: 'i' } },
                    { phone: { $regex: keyword, $options: 'i' } },
                    { code: { $regex: keyword, $options: 'i' } }
                ];
            }

            const records = await UserModel.find(conditions, null, options);
            const total = await UserModel.count(conditions);
            const data = {
                records,
                totalRecord: total,
                perPage: limit,
            };
            return response(res, data, 'Thành công', statusCode.OK);
        } catch (err) {
            logError(err);
            return response(res, null, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }

    async create(req, res, params) {
        try {
            const {
                fullname,
                email
            } = params;
            let code = params.code || null;
            let password = params.password || null;
            let phone = params.phone || null;
            const userGroup = params.user_group || 'EDITOR';
            const dob = params.dob || null;
            const createType = params.create_type || 'FROM_ADMIN';
            const isShow = params.is_show_profile || false;
            const linkFb = params.link_fb || '';
            const featuredTextBox = params.featured_text_box || null;
            const featuredStatsBox = params.featured_stats_box || null;
            const classroom = params.classroom || null;
            const level = params.level || null;
            const school = params.school || null;
            const gender = params.gender || null;
            const parentPhone = params.parent_phone || null;
            const parentName = params.parent_name || null;

            phone = BaseHelper.getPhone(phone);

            if (!fullname)
                return response(res, {}, 'Vui lòng nhập họ tên!', statusCode.ERROR);

            if (!password)
                password = '12345678';

            const passEncrypt = BaseHelper.encryptMD5(config.TOKEN.MD5_BEFORE, password, config.TOKEN.MD5_AFTER);

            if (createType === 'FROM_ADMIN') {
                if (!phone)
                    return response(res, {}, 'Số điện thoại không hợp lệ!', statusCode.ERROR);
                code = params.code ? params.code : phone;
            } else {
                if (!code)
                    return response(res, {}, 'Vui lòng nhập mã học sinh!', statusCode.ERROR);
            }

            let _check = await UserModel.findOne({ code: code, deleted_at: null });
            if (_check)
                return response(res, null, 'Mã này đã được sử dụng!', statusCode.ERROR);

            if (phone) {
                _check = await UserModel.findOne({ phone: phone, deleted_at: null });
                if (_check)
                    return response(res, null, 'Số điện thoại này đã được sử dụng!', statusCode.ERROR);
            }

            _check = await UserModel.findOne({ code: phone, deleted_at: null });
            if (_check)
                return response(res, null, 'Mã này đã được sử dụng!', statusCode.ERROR);

            let fileData;
            if (featuredStatsBox && featuredStatsBox.box1_img && featuredStatsBox.box1_img.indexOf('data:image') >= 0) {
                fileData = await UploadService.upload(featuredStatsBox.box1_img, 'base64', 'avatars');
                if (fileData && fileData[0])
                    featuredStatsBox.box1_img = fileData[0];
            }

            if (featuredStatsBox && featuredStatsBox.box2_img && featuredStatsBox.box2_img.indexOf('data:image') >= 0) {
                fileData = await UploadService.upload(featuredStatsBox.box2_img, 'base64', 'avatars');
                if (fileData && fileData[0])
                    featuredStatsBox.box2_img = fileData[0];
            }


            if (featuredStatsBox && featuredStatsBox.box3_img && featuredStatsBox.box3_img.indexOf('data:image') >= 0) {
                fileData = await UploadService.upload(featuredStatsBox.box3_img, 'base64', 'avatars');
                if (fileData && fileData[0])
                    featuredStatsBox.box3_img = fileData[0];
            }

            if (featuredStatsBox && featuredStatsBox.box4_img && featuredStatsBox.box4_img.indexOf('data:image') >= 0) {
                fileData = await UploadService.upload(featuredStatsBox.box4_img, 'base64', 'avatars');
                if (fileData && fileData[0])
                    featuredStatsBox.box4_img = fileData[0];
            }


            if (featuredTextBox && featuredTextBox.box1_img && featuredTextBox.box1_img.indexOf('data:image') >= 0) {
                fileData = await UploadService.upload(featuredTextBox.box1_img, 'base64', 'avatars');
                if (fileData && fileData[0])
                    featuredTextBox.box1_img = fileData[0];
            }

            if (featuredTextBox && featuredTextBox.box2_img && featuredTextBox.box2_img.indexOf('data:image') >= 0) {
                fileData = await UploadService.upload(featuredTextBox.box2_img, 'base64', 'avatars');
                if (fileData && fileData[0])
                    featuredTextBox.box2_img = fileData[0];
            }


            if (featuredTextBox && featuredTextBox.box3_img && featuredTextBox.box3_img.indexOf('data:image') >= 0) {
                fileData = await UploadService.upload(featuredTextBox.box3_img, 'base64', 'avatars');
                if (fileData && fileData[0])
                    featuredTextBox.box3_img = fileData[0];
            }

            const alias = BaseHelper.seoURL(fullname) + '-' + new Date().getTime();
            const userDoc = {
                email: email,
                alias,
                password: passEncrypt,
                fullname: fullname,
                avatar: null,
                phone: phone,
                parent_name: parentName,
                parent_phone: parentPhone,
                user_group: userGroup,
                code: code,
                dob: dob,
                gender,
                balance: 0,
                sub_balance: 0,
                school,
                classroom,
                level,
                status: 'ACTIVE',
                is_show_profile: isShow,
                featured_stats_box: featuredStatsBox,
                featured_text_box: featuredTextBox,
                link_fb: linkFb
            };

            const avatarBase64 = params.avatar_base64 || null;
            if (avatarBase64) {
                fileData = await UploadService.upload(avatarBase64, 'base64', 'avatars');
                if (fileData && fileData[0])
                    userDoc.avatar = fileData[0];
            }

            const profilePicBase64 = params.profile_pic_base64 || null;
            if (profilePicBase64) {
                fileData = await UploadService.upload(profilePicBase64, 'base64', 'avatars');
                if (fileData && fileData[0])
                    userDoc.profile_pic = fileData[0];
            }

            if (code) {
                _check = await UserModel.findOne({ code: code, deleted_at: null });
                if (_check)
                    return response(res, null, 'Mã hoặc số điện thoại đã được sử dụng!', statusCode.ERROR);
            }

            const user = await UserModel.create(userDoc);
            if (user)
                return response(res, {}, 'Thành công', statusCode.OK);
            return response(res, null, language.ERROR, statusCode.ERROR);
        } catch (err) {
            logError(err);
            console.log(err);
            return response(res, {}, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }

    async byCode(req, res, params) {
        try {
            const { code } = params;

            let conditions = { code: code };
            let rs = await UserModel.findOne(conditions);
            rs = rs.toObject();
            conditions = {
                'user.id': rs._id,
                deleted_at: null
            };
            const options = {
                skip: 0,
                limit: 2,
                sort: { created_at: -1 }
            };
            const other_bills = await BillingModel.find(conditions, null, options);
            if (other_bills)
                rs.other_bills = other_bills;

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
            const rs = await UserModel.findOne(conditions);
            return response(res, rs, 'Thành công', statusCode.OK);
        } catch (err) {
            logError(err);
            return response(res, null, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }

    async getStudentDetail(req, res, query) {
        try {
            const { email, phone } = query;
            const emailParse = email ? email.toLowerCase() : null;
            const phoneParse = phone ? BaseHelper.getPhone(phone) : null;
            const userByEmail = emailParse
                ? await UserModel.findOne({ email: emailParse, deleted_at: null })
                : null;
            const userByPhone = phoneParse
                ? await UserModel.findOne({ phone: phoneParse, deleted_at: null })
                : null;

            const formatUserLine = (user) => `${user.fullname || ''} - Mã học sinh: ${user.code || ''}.`.trim();

            if (userByPhone && !userByEmail) {
                const message = [
                    `SĐT: ${phone} đã có tài khoản. Email: ${email} chưa tồn tại. Vui lòng nhập đúng email hoặc tiếp tục bấm Tạo liên kết khoá học để gán khóa học vào tài khoản có SĐT: ${phone}`,
                    formatUserLine(userByPhone)
                ].join('\n');
                return response(res, userByPhone, message, statusCode.OK);
            }

            if (userByEmail && !userByPhone) {
                const message = [
                    `Email: ${email} đã có tài khoản. SĐT: ${phone} chưa tồn tại. Vui lòng nhập đúng SĐT hoặc bấm Tạo liên kết khoá học để gán khóa học vào tài khoản có Email: ${email}.`,
                    formatUserLine(userByEmail)
                ].join('\n');
                return response(res, userByEmail, message, statusCode.OK);
            }

            if (userByEmail && userByPhone) {
                const rs = userByEmail;
                return response(res, rs, formatUserLine(rs), statusCode.OK);
            }

            if (!userByEmail && !userByPhone) {
                return response(
                    res,
                    null,
                    'Tài khoản mới - Hệ thống sẽ tự động tạo tài khoản ở trạng thái chờ.',
                    statusCode.OK
                );
            }

            const rs = userByEmail || userByPhone;
            return response(res, rs, formatUserLine(rs), statusCode.OK);
        } catch (err) {
            logError(err);
            return response(res, null, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }

    async getAdminManager(req, res, query) {
        try {
            const condition = {
                deleted_at: null,
                 $or:  [
                    { 'user_group': 'ADMIN' },
                    { 'user_group': 'MANAGER' },
                ]
            };
            const rs = await UserModel.find(condition);
            return response(res, rs, 'Thành công', statusCode.OK);
        } catch (err) {
            logError(err);
            return response(res, null, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }

    async update(req, res, params) {
        try {
            const id = params.id || null;
            const fullname = params.fullname || '';
            const email = params.email || '';
            let phone = params.phone || '';
            const code = params.code || '';
            const gender = params.gender || null;
            let dob = params.dob || null;
            if (!BaseHelper.isValidDate(dob))
                dob = null;
            const parentPhone = params.parent_phone || null;
            const parentName = params.parent_name || null;
            const address = params.address || null;
            const classroom = params.classroom || null;
            const level = params.level || null;
            const school = params.school || null;
            const userGroup = params.user_group || null;
            const description = params.description || '';
            const content = params.content || '';
            const totalClassroom = params.total_classroom || 0;
            const totalStudent = params.total_student || 0;
            const isShowProfile = params.is_show_profile || false;
            const linkFb = params.link_fb || '';
            const featuredTextBox = params.featured_text_box || null;
            const featuredStatsBox = params.featured_stats_box || null;

            const _user = await UserModel.findOne({ _id: id });
            if (!_user)
                return response(res, null, 'Người dùng không tồn tại!', statusCode.ERROR);

            phone = BaseHelper.getPhone(phone);
            if (phone) {
                const _cond = {
                    phone: phone,
                    _id: {
                        $ne: id
                    },
                    deleted_at: null
                };
                const check = await UserModel.findOne(_cond);
                if (check)
                    return response(res, null, 'Số điện thoại này đã được sử dụng!', statusCode.ERROR);
            }

            const docUser = {};
            if (!_user.alias) {
                const alias = BaseHelper.seoURL(fullname) + '-' + new Date().getTime();
                docUser.alias = alias;
            }

            if (fullname)
                docUser.fullname = fullname;

            if (classroom)
                docUser.classroom = classroom;

            if (school)
                docUser.school = school;

            if (email)
                docUser.email = email;

            if (phone)
                docUser.phone = phone;

            if (parentPhone)
                docUser.parent_phone = parentPhone;

            if (parentName)
                docUser.parent_name = parentName;

            if (phone)
                docUser.phone = phone;

            if (code)
                docUser.code = code;

            if (dob)
                docUser.dob = new Date(dob);

            if (dob)
                docUser.dob_2 = new Date(dob);

            if (gender)
                docUser.gender = gender;

            if (userGroup)
                docUser.user_group = userGroup;

            docUser.description = description;
            docUser.address = address;
            docUser.content = content;
            docUser.level = level;
            docUser.is_show_profile = isShowProfile;
            docUser.total_classroom = totalClassroom;
            docUser.total_student = totalStudent;
            docUser.link_fb = linkFb;

            let fileData;
            if (featuredStatsBox && featuredStatsBox.box1_img && featuredStatsBox.box1_img.indexOf('data:image') >= 0) {
                fileData = await UploadService.upload(featuredStatsBox.box1_img, 'base64', 'avatars');
                if (fileData && fileData[0])
                    featuredStatsBox.box1_img = fileData[0];
            }

            if (featuredStatsBox && featuredStatsBox.box2_img && featuredStatsBox.box2_img.indexOf('data:image') >= 0) {
                fileData = await UploadService.upload(featuredStatsBox.box2_img, 'base64', 'avatars');
                if (fileData && fileData[0])
                    featuredStatsBox.box2_img = fileData[0];
            }


            if (featuredStatsBox && featuredStatsBox.box3_img && featuredStatsBox.box3_img.indexOf('data:image') >= 0) {
                fileData = await UploadService.upload(featuredStatsBox.box3_img, 'base64', 'avatars');
                if (fileData && fileData[0])
                    featuredStatsBox.box3_img = fileData[0];
            }

            if (featuredStatsBox && featuredStatsBox.box4_img && featuredStatsBox.box4_img.indexOf('data:image') >= 0) {
                fileData = await UploadService.upload(featuredStatsBox.box4_img, 'base64', 'avatars');
                if (fileData && fileData[0])
                    featuredStatsBox.box4_img = fileData[0];
            }


            if (featuredTextBox && featuredTextBox.box1_img && featuredTextBox.box1_img.indexOf('data:image') >= 0) {
                fileData = await UploadService.upload(featuredTextBox.box1_img, 'base64', 'avatars');
                if (fileData && fileData[0])
                    featuredTextBox.box1_img = fileData[0];
            }

            if (featuredTextBox && featuredTextBox.box2_img && featuredTextBox.box2_img.indexOf('data:image') >= 0) {
                fileData = await UploadService.upload(featuredTextBox.box2_img, 'base64', 'avatars');
                if (fileData && fileData[0])
                    featuredTextBox.box2_img = fileData[0];
            }


            if (featuredTextBox && featuredTextBox.box3_img && featuredTextBox.box3_img.indexOf('data:image') >= 0) {
                fileData = await UploadService.upload(featuredTextBox.box3_img, 'base64', 'avatars');
                if (fileData && fileData[0])
                    featuredTextBox.box3_img = fileData[0];
            }

            docUser.featured_stats_box = featuredStatsBox;
            docUser.featured_text_box = featuredTextBox;

            const avatarBase64 = params.avatar_base64 || null;
            if (avatarBase64) {
                const fileData = await UploadService.upload(avatarBase64, 'base64', 'avatars');
                if (fileData && fileData[0])
                    docUser.avatar = fileData[0];
            }

            const profilePicBase64 = params.profile_pic_base64 || null;
            if (profilePicBase64) {
                const fileData = await UploadService.upload(profilePicBase64, 'base64', 'avatars');
                if (fileData && fileData[0])
                    docUser.profile_pic = fileData[0];
            }

            // === Bổ sung xử lý cho category_type, subject, is_featured, homepage_image_base64, edu philosophy ===
            const categoryType = params.category_type || [];
            const subject = params.subject || [];
            const isFeatured = params.is_featured || false;
            const homepageImageBase64 = params.homepage_image_base64 || '';
            const education_philosophy_source = params.education_philosophy_source || '';
            const education_philosophy_url = params.education_philosophy_url || '';

            if (categoryType)
                docUser.category_type = Array.isArray(categoryType) ? categoryType : [];

            if (subject)
                docUser.subject = Array.isArray(subject) ? subject : [];

            if (education_philosophy_source)
                docUser.education_philosophy_source = education_philosophy_source;

            if (education_philosophy_url || education_philosophy_url === '' )
                docUser.education_philosophy_url = education_philosophy_url;

            docUser.is_featured = isFeatured;

            if (homepageImageBase64 && homepageImageBase64.indexOf('data:image') >= 0) {
                const fileData = await UploadService.upload(homepageImageBase64, 'base64', 'avatars');
                if (fileData && fileData[0])
                    docUser.homepage_image = fileData[0];
            }

            const { files } = req;
            if (files) {
                const fileData = await UploadService.upload(files, 'binary', 'avatars');
                if (fileData && fileData[0])
                    docUser.avatar = fileData[0];
            }

            const rs = await UserModel.updateOne({ _id: id }, { $set: docUser });
            if (rs.nModified) {
                return response(res, {}, 'Thành công', statusCode.OK);
            }
            return response(res, null, language.ERROR, statusCode.ERROR);
        } catch (err) {
            logError(err);
            return response(res, {}, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }

    async profile(req, res) {
        try {
            const user = await UserModel.findOne({ _id: req.user.user_id });
            if (!user)
                return response(res, null, language.USER_NOT_EXIST, statusCode.ERROR);

            return response(res, user, 'Thành công', statusCode.OK);
        } catch (err) {
            logError(err);
            return response(res, null, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }

    async updateTagDevice(req, res, params) {
        try {
            const tags = params.tags || [];
            if (tags && tags.length > 0) {
                const user = await UserModel.findOne({ _id: req.user.user_id });
                if (user) {
                    let _deviceTag = {};
                    if (user.device_tags) {
                        _deviceTag = JSON.parse(user.device_tags);
                    }

                    for (let i = 0; i < tags.length; i++) {
                        if (!_deviceTag[tags[i].name]) {
                            _deviceTag[tags[i].name] = tags[i].value;
                        }
                    }
                    const docUSer = { $set: { device_tags: JSON.stringify(_deviceTag) } };
                    await UserModel.updateOne({ _id: req.user.user_id }, docUSer);
                    if (rs.nModified)
                        return response(res, user, 'Thành công', statusCode.OK);
                }
            }
            return response(res, null, language.ERROR, statusCode.OK);
        } catch (err) {
            logError(err);
            return response(res, {}, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }

    async updateProfile(req, res, params) {
        try {
            const fullname = params.fullname || '';
            let phone = params.phone || '';
            const email = params.email || '';
            const gender = params.gender || null;
            const parentPhone = params.parent_phone || null;
            const parentName = params.parent_name || null;
            const classroom = params.classroom || null;
            const level = params.level || null;
            const school = params.school || null;
            const code = params.code || null;
            const dob = params.dob || null;
            const address = params.address || '';
            const user = await UserModel.findOne({ _id: req.user.user_id });
            if (!user)
                return response(res, {}, language.USER_NOT_EXIST, statusCode.ERROR);

            phone = BaseHelper.getPhone(phone);
            let _cond = {};
            let check = null;
            if (phone) {
                _cond = {
                    phone: phone,
                    _id: {
                        $ne: req.user.user_id
                    },
                    deleted_at: null
                };
                check = await UserModel.findOne(_cond);
                if (check)
                    return response(res, null, 'Số điện thoại này đã được sử dụng!', statusCode.ERROR);
            }

            if (email) {
                _cond = {
                    email: email,
                    _id: {
                        $ne: req.user.user_id
                    },
                    deleted_at: null
                };
                check = await UserModel.findOne(_cond);
                if (check)
                    return response(res, null, 'Email này đã được sử dụng!', statusCode.ERROR);
            }

            if (fullname)
                user.fullname = fullname;

            if (classroom)
                user.classroom = classroom;

            if (level)
                user.level = level;

            if (school)
                user.school = school;

            if (phone)
                user.phone = phone;

            if (email)
                user.email = email;

            if (gender)
                user.gender = gender;

            if (dob)
                user.dob = new Date(dob);

            if (parentPhone)
                user.parent_phone = parentPhone;

            if (parentName)
                user.parent_name = parentName;

            if (!user.code && code) {
                check = await UserModel.findOne({ code: code, deleted_at: null });
                if (!check)
                    user.code = code;
            }

            if (address)
                user.address = address;

            const { files } = req;
            if (files) {
                const fileData = await UploadService.upload(files, 'binary', 'avatars');
                if (fileData && fileData[0])
                    user.avatar = fileData[0];
            }

            const avatarBase64 = params.avatar_base64 || null;
            if (avatarBase64) {
                const fileData = await UploadService.upload(avatarBase64, 'base64', 'avatars');
                if (fileData && fileData[0])
                    user.avatar = fileData[0];
            }

            const docUSer = { $set: user };
            const rs = await UserModel.updateOne({ _id: req.user.user_id }, docUSer);
            if (rs.nModified)
                return response(res, user, 'Thành công', statusCode.OK);

            return response(res, null, language.ERROR, statusCode.ERROR);
        } catch (err) {
            logError(err);
            return response(res, {}, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }

    async forgottenPass(req, res, params) {
        try {
            let email = params.email || '';
            if (!email)
                return response(res, {}, 'Vui lòng nhập địa chỉ E-Mail!', statusCode.ERROR);

            email = email.toLocaleString();
            const conditions = {
                email,
                status: 'ACTIVE',
                deleted_at: null
            };
            const user = await UserModel.findOne(conditions);

            if (!user)
                return response(res, {}, language.EMAIL_NOT_EXISTS, statusCode.ERROR);

            const password = generatePassword();
            const result = await MailService.resetPassword(password, user.email, user.fullname, config.USER_RESET_PASS);

            if (result) {
                const passEncrypt = BaseHelper.encryptMD5(config.TOKEN.MD5_BEFORE, password, config.TOKEN.MD5_AFTER);
                const rs = await UserModel.updateOne({ _id: user.id }, { $set: { password: passEncrypt } });
                if (rs.nModified) {
                    await UserService.generateNewToken(user, true);
                    return response(res, result, language.USER_FORGOT_PASSWORD, statusCode.OK);
                }
            }

            return response(res, {}, 'Chưa gửi được Email. Vui lòng thử lại!', statusCode.ERROR);
        } catch (err) {
            logError(err);
            return response(res, null, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }

    async resetPassword(req, res, params) {
        try {
            const token = params.token || '';
            const password = params.password || '';

            const decoded = await UserService.decodeToken(token);
            if (!decoded)
                return response(res, {}, 'Request không hợp lệ!', statusCode.UNAUTHORIZED);

            const result = {};
            result.status = false;

            if (decoded.user_id) {
                const isExprired = (new Date().getTime() > decoded.exp);

                if (isExprired) {
                    return response(res, decoded, language.TOKEN_EXPRIRE_RESET_PASSWORD, statusCode.UNAUTHORIZED);
                }
            }

            if (!BaseHelper.passwordValidate(password))
                return response(res, null, language.PASS_INVALID, statusCode.ERROR);

            const passEncrypt = BaseHelper.encryptMD5(config.TOKEN.MD5_BEFORE, password, config.TOKEN.MD5_AFTER);
            const user = await UserModel.findOne({ _id: decoded.user_id });
            if (!user)
                return response(res, null, 'Tài khoản này không tồn tại', statusCode.ERROR);

            const doc = { $set: { password: passEncrypt } };
            let rs = await UserModel.updateOne({ _id: user.id }, doc);
            if (rs.nModified) {
                rs = await UserService.generateNewToken(user, true);
                return response(res, { token: rs.roken }, 'Thành công', statusCode.OK);
            }
        } catch (err) {
            logError(err);
            return response(res, {}, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }

    async changePassword(req, res, params) {
        try {
            const newPass = params.new_password || false;
            const oldPassword = params.password || false;
            const confirm = params.confirm || false;

            if (!oldPassword)
                return response(res, null, 'Vui lòng nhập mật khẫu cũ!', statusCode.ERROR);

            if (!newPass)
                return response(res, null, 'Vui lòng nhập mật khẫu mới!', statusCode.ERROR);

            if (!confirm)
                return response(res, null, 'Vui lòng xác nhận mật khẫu mới!', statusCode.ERROR);

            if (confirm !== newPass)
                return response(res, null, 'Mật khẩu xác nhận không chính xác!', statusCode.ERROR);

            if (!BaseHelper.passwordValidate(newPass))
                return response(res, '', language.PASS_INVALID, statusCode.ERROR);

            const oldPassEncrypt = BaseHelper.encryptMD5(config.TOKEN.MD5_BEFORE, oldPassword, config.TOKEN.MD5_AFTER);

            const conditions = {
                _id: req.user.user_id,
                status: 'ACTIVE',
                deleted_at: null
            };

            const user = await UserModel.findOne(conditions);
            if (!user)
                return response(res, null, 'Tài khoản không tồn tại!', statusCode.ERROR);

            if (user.password !== oldPassEncrypt)
                return response(res, null, 'Mật khẩu cũ không chính xác!', statusCode.ERROR);

            const passEncrypt = BaseHelper.encryptMd5(config.TOKEN.MD5_BEFORE, newPass, config.TOKEN.MD5_AFTER);

            const doc = { $set: { password: passEncrypt } };
            await UserModel.updateOne(conditions, doc);
            await UserService.deleteKey(req.user, null);

            const rs = await UserService.generateNewToken(user, true);
            if (rs && rs.token)
                return response(res, { token: rs.token }, 'Đổi mật khẩu thành công!', statusCode.OK);

            return response(res, null, 'Yêu cầu không hợp lệ!', statusCode.ERROR);
        } catch (err) {
            logError(err);
            return response(res, null, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }

    async delete(req, res, params) {
        try {
            const { ids } = params || [];
            if (ids.length == 0)
                return response(res, null, 'Request không hợp lệ!', statusCode.ERROR);

            const rs = await UserModel.softDelete({ _id: { $in: ids } }, true);
            if (rs)
                return response(res, {}, 'Thành công', statusCode.OK);
            return response(res, null, language.ERROR, statusCode.ERROR);
        } catch (err) {
            logError(err);
            return response(res, null, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }

    async removeAccount(req, res, params) {
        try {
            const { id } = params || [];
            const rs = await UserModel.softDelete({ _id: id }, true);
            if (rs)
                return response(res, {}, 'Tài khoản của bạn đã bị vô hiệu. Sau 10 ngày nếu bạn không có bất kỳ yêu cầu khôi phục nào tài khoản của bạn sẽ bị xoá vĩnh viễn.', statusCode.OK);
            return response(res, null, language.ERROR, statusCode.ERROR);
        } catch (err) {
            logError(err);
            return response(res, null, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }

    async rank(req, res) {
        try {
            const conditions = { deleted_at: null };

            const options = {
                skip: 0,
                limit: 100,
                sort: { point: -1 }
            };

            const projections = '_id fullname code point phone';

            const rs = await UserModel.find(conditions, projections, options);
            if (rs)
                return response(res, rs, 'Thành công', statusCode.OK);
            return response(res, null, language.ERROR, statusCode.ERROR);
        } catch (err) {
            logError(err);
            return response(res, null, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }

    async statistic(req, res) {
        try {
            const user = await UserModel.findOne({ _id: req.user.user_id });
            if (!user)
                return response(res, null, 'Tài khoản đã bị xóa hoặc bị vô hiệu!', statusCode.OK);

            const conditions = { 'user.id': req.user.user_id, deleted_at: null };
            const totalTesting = await TestingModel.count(conditions);
            const numClassroom = await StudentClassroomModel.count({ 'user.id': req.user.user_id, deleted_at: null });
            const data = {
                total_testing: totalTesting,
                num_classroom: numClassroom
            };

            return response(res, data, 'Thành công', statusCode.OK);
        } catch (err) {
            logError(err);
            return response(res, null, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }

    async bills(req, res, params) {
        try {
            const keyword = params.keyword || false;
            const page = parseInt(params.page || appConfig.PAGINATION.PAGE);
            const limit = parseInt(params.limit || appConfig.PAGINATION.LIMIT);
            let userID = '999999999999999999999999';
            if (req.user.user_id)
                userID = req.user.user_id;
            const conditions = { 'user.id': userID };

            const options = {
                skip: (page - 1) * limit,
                limit: limit,
                sort: { updated_at: -1 }
            };

            if (keyword) {
                conditions.$or = [
                    { fullname: { $regex: keyword, $options: 'i' } },
                    { email: { $regex: keyword, $options: 'i' } }
                ];
            }

            const rs = await BillingModel.find(conditions, null, options);
            const total = await BillingModel.count(conditions);
            const data = {
                total: total,
                limit: limit,
                items: rs
            };
            return response(res, data, 'Thành công', statusCode.OK);
        } catch (err) {
            logError(err);
            return response(res, null, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }

    async solienlac(req, res, params) {
        try {
            const { phone } = params;
            const date = new Date();
            const classroomID = params.classroom_id || null;
            const month = params.month || date.getMonth() + 1;
            const year = params.year || new Date().getFullYear();

            if (!phone)
                return response(res, null, 'Vui lòng nhập sdt hoặc mã học sinh!', statusCode.OK);

            const date1 = BaseHelper.startDateEndDate(month, year);
            if (!date1)
                return response(res, {}, 'Request không hợp lệ!', statusCode.ERROR);

            const projections = 'fullname email phone point avatar code parent_phone school user_group dob';
            let conditions = {
                $or: [{ phone: phone }, { code: phone }],
                deleted_at: null
            };

            const user = await UserModel.findOne(conditions, projections);
            if (!user)
                return response(res, null, 'Không tìm thấy học sinh này!', statusCode.OK);

            conditions = {
                'user.id': user.id,
                'classroom.id': classroomID,
                finished_at: {
                    $lte: date1.end_date,
                    $gte: date1.start_date
                },
                deleted_at: null
            };

            const _options = {
                sort: { created_at: -1 }
            };

            const testings = await TestingModel.find(conditions, null, _options);
            const userClassrooms = await StudentClassroomModel.find({ 'user.id': user.id, deleted_at: null });
            const arrayClassroomID = [];
            for (let i = 0; i < userClassrooms.length; i++) {
                arrayClassroomID.push(userClassrooms[i].classroom.id);
            }
            conditions._id = { $in: arrayClassroomID };

            let classrooms = [];
            if (arrayClassroomID.length != 0)
                classrooms = await ClassroomModel.find({ _id: { $in: arrayClassroomID } });

            conditions = {
                billed_at: {
                    $lte: date1.end_date,
                    $gte: date1.start_date
                },
                deleted_at: null,
            };
            conditions['user.id'] = user.id;
            const _bills = await BillingModel.find(conditions);
            const bills = [];
            for (let i = 0; i < _bills.length; i++) {
                if (Array.isArray(_bills[i].items)) {
                    for (let j = 0; j < _bills[i].items.length; j++) {
                        if (_bills[i].items[j].id == classroomID) {
                            bills.push(_bills[i]);
                            break;
                        }
                    }
                }
            }

            conditions['classroom.id'] = classroomID;
            const billItem = await BillingItemModel.findOne(conditions);

            conditions = {};
            conditions['user.id'] = user.id;
            conditions['classroom.id'] = classroomID;
            conditions.attended_date = {
                $lte: date1.end_date,
                $gte: date1.start_date
            };

            const attend = await AttendanceModel.count(conditions);
            const attendList = await AttendanceModel.find(conditions);

            let avgPoint = 0;
            let aggregate = [
                {
                    $match: {
                        'classroom.id': classroomID,
                        'user.id': user.id,
                        created_at: {
                            $lte: date1.end_date,
                            $gte: date1.start_date
                        }
                    }
                },
                { $group: { _id: null, avg_point: { $avg: '$point' } } }
            ];
            const avgPointLog = await PointLogModel.aggregate(aggregate);
            if (avgPointLog && avgPointLog[0])
                avgPoint = Math.round(avgPointLog[0].avg_point);

            aggregate = [
                {
                    $match: {
                        'classroom.id': classroomID,
                        created_at: {
                            $lte: date1.end_date,
                            $gte: date1.start_date
                        }
                    }
                },
                { $group: { _id: '$user', avg_point: { $avg: '$point' } } },
                { $sort: { avg_point: -1 } }
            ];

            const avgRankLog = await PointLogModel.aggregate(aggregate);
            let rank = null;
            for (let i = 0; i < avgRankLog.length; i++) {
                if (avgRankLog[i]._id.id == user.id) {
                    rank = i + 1;
                    break;
                }
            }

            let reviews = [];
            conditions = { deleted_at: null };
            conditions['user.id'] = user.id;
            conditions['classroom.id'] = classroomID;
            let _month = date.getMonth() + 1;
            if (parseInt(month) < 10) {
                _month = '0' + month;
            } else {
                _month = month;
            }
            if (_month)
                conditions.month = _month.toString();
            reviews = await ReviewModel.find(conditions);

            const data = {
                user,
                testings,
                avg_point: avgPoint,
                classrooms,
                bills,
                billItem,
                rank,
                chuyencan: attend,
                attendList,
                reviews
            };

            return response(res, data, 'Thành công', statusCode.OK);
        } catch (err) {
            logError(err);
            return response(res, null, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }

    async checkCode(req, res, params) {
        try {
            const code = params.code || null;
            const _classroomID = params.classroom_id || null;
            const user = await UserModel.findOne({ code });
            let msg = 'Không có phiếu thu';
            if (!user)
                return response(res, null, 'Không tồn tại học sinh này!', statusCode.ERROR);

            let arrClassroomID = [];

            if (Array.isArray(_classroomID)) {
                arrClassroomID = _classroomID;
            } else {
                arrClassroomID.push(_classroomID);
            }

            let classroomID = null;
            let sobuoihoc = 0;
            let classroomUser = null;
            // Tim hoc sinh co trong lop hop le
            const userClassrooms = await StudentClassroomModel.find({ 'user.id': user.id, deleted_at: null });
            if (!userClassrooms)
                return response(res, null, 'Không tìm thấy học sinh trong các lớp đã chọn!', statusCode.ERROR);

            for (let i = 0; i < userClassrooms.length; i++) {
                for (let j = 0; j < arrClassroomID.length; j++) {
                    if (userClassrooms[i].classroom.id == arrClassroomID[j]) {
                        classroomID = arrClassroomID[j];
                        classroomUser = userClassrooms[i];
                        if (classroomUser.sobuoihoc)
                            sobuoihoc = classroomUser.sobuoihoc;
                        break;
                    }
                }

                if (classroomUser)
                    break;
            }

            if (!classroomUser)
                return response(res, null, 'Không tìm thấy học sinh trong các lớp đã chọn!', statusCode.ERROR);

            const classroom = await ClassroomModel.findOne({ _id: classroomID });
            if (sobuoihoc <= 0 || classroomUser.buoidahoc >= sobuoihoc)
                return response(res, null, 'Bạn đã hết số buổi học. Vui lòng đóng học phí để tiếp tục!', statusCode.ERROR);

            const bill = await BillingItemModel.findOne({ 'user.id': user.id, 'classroom.id': classroomID, deleted_at: null });
            if (bill && classroomUser) {
                const docAtt = {
                    user: { id: user.id, code: user.code, name: user.fullname },
                    classroom: classroomUser.classroom,
                    attended_date: new Date(),
                    status: 'JOINED'
                };
                await AttendanceModel.create(docAtt);

                const sobuoidahoc = classroomUser.buoidahoc ? classroomUser.buoidahoc + 1 : 1;
                const _buoidahoc = { buoidahoc: sobuoidahoc };
                classroomUser.buoidahoc = _buoidahoc;
                classroomUser.sobuoihoc = sobuoihoc;
                await StudentClassroomModel.updateOne({ _id: classroomUser.id }, { $set: _buoidahoc });

                if (_buoidahoc > sobuoihoc)
                    return response(res, null, 'Bạn đã hết số buổi học. Vui lòng đóng học phí để tiếp tục!', statusCode.ERROR);

                msg = "Thảnh công!";
            }
            const attendance = await AttendanceModel.find({ 'user.id': user.id, 'classroom.id': classroomID });

            let options = {
                sort: { finished_at: -1 }
            };
            const lastExamClassroom = await ExamClassroomModel.findOne({ 'classroom.id': classroomID, deleted_at: null }, null, options);

            options = {
                sort: { finished_at: -1 }
            };
            const lastTesting = await TestingModel.findOne({ 'classroom.id': classroomID, 'user.id': user.id, deleted_at: null }, null, options);
            let isDoneHomeWork = false;
            if (lastExamClassroom && lastTesting && lastExamClassroom.exam_id === lastTesting.exam.id) {
                isDoneHomeWork = true;
            }

            const data = {
                user,
                bill,
                classroom,
                classroomUser,
                userClassrooms,
                attendance,
                isDoneHomeWork,
                lastTesting
            };
            return response(res, data, msg, statusCode.OK);
        } catch (err) {
            logError(err);
            return response(res, null, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }

    async hotResetPassword(req, res, params) {
        try {
            const userID = params.user_id || null;
            const user = await UserModel.findOne({ _id: userID });
            if (!user)
                return response(res, null, 'Không tìm thấy học sinh này!', statusCode.OK);
            const passEncrypt = BaseHelper.encryptMD5(config.TOKEN.MD5_BEFORE, '12345678', config.TOKEN.MD5_AFTER);
            const rs = await UserModel.updateOne({ _id: userID }, { $set: { password: passEncrypt } });
            if (rs.nModified) {
                await UserService.generateNewToken(user, true);
                return response(res, {}, 'Thành công', statusCode.OK);
            }

            return response(res, null, 'Lỗi!', statusCode.ERROR);
        } catch (err) {
            logError(err);
            return response(res, null, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }

    async forceActivate(req, res, params) {
        try {
            if (!req.user || req.user.user_group !== appConfig.USER_GROUP.ADMIN) {
                return response(res, null, 'Bạn không có quyền.', statusCode.FORBIDDEN);
            }

            const userID = params.user_id || null;
            if (!userID) {
                return response(res, null, 'Vui lòng truyền user_id!', statusCode.ERROR);
            }

            const user = await UserModel.findOne({ _id: userID });
            if (!user) {
                return response(res, null, 'Người dùng không tồn tại!', statusCode.ERROR);
            }

            const doc = {
                status: 'ACTIVE',
                deleted_at: null,
                updated_at: new Date()
            };

            const rs = await UserModel.updateOne({ _id: userID }, { $set: doc });
            if (rs.nModified || rs.modifiedCount) {
                return response(res, {}, 'Thành công', statusCode.OK);
            }

            return response(res, {}, 'Người dùng đã ở trạng thái ACTIVE.', statusCode.OK);
        } catch (err) {
            logError(err);
            return response(res, null, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }

    async view(req, res, params) {
        try {
            const { alias } = params;

            const conditions = { alias: alias };
            const projection = 'fullname phone email avatar description content alias featured_text_box featured_stats_box total_classroom total_student link_fb profile_pic';
            const user = await UserModel.findOne(conditions, projection);
            const teachers = await UserModel.find({ user_group: appConfig.USER_GROUP.TEACHER, deleted_at: null }, projection);
            const data = {
                user,
                teachers
            };
            return response(res, data, 'Thành công', statusCode.OK);
        } catch (err) {
            logError(err);
            return response(res, null, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }
}

function generatePassword() {
    const length = 8;
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let retVal = '';
    for (let i = 0, n = charset.length; i < length; ++i) {
        retVal += charset.charAt(Math.floor(Math.random() * n));
    }
    return retVal;
}

module.exports = new UserController();
