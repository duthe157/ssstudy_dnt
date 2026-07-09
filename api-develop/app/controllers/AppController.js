const appConfig = require('../../config/app');
const BaseHelper = require('../helpers/BaseHelper');

const ClassroomGroupModel = require('../models/ClassroomGroup');
const ClassroomModel = require('../models/Classroom');
const UserModel = require('../models/User');
const BookModel = require('../models/Book');
const BookCategoryModel = require('../models/BookCategory');
const BlogPostModel = require('../models/BlogPost');
const AdultEvalutionModel = require('../models/AdultEvalution');
const ExamCategoryModel = require('../models/ExamCategory');
const ExamModel = require('../models/Exam');
const OrderItemModel = require('../models/OrderItem');
const OrderModel = require('../models/Order');
const TestingModel = require('../models/Testing');
const PageModel = require('../models/Page');
const AppService = require('../services/AppService');

const language = BaseHelper.fileToJSON(`${__dirname}/../languages/vi.json`);

function removeSpacesAndSpecialChars(str) {
    console.log('first', str);
    str.replace(/[^a-zA-Z ]/g, "");
    str.replace(/[^\w\s]/gi, '');
    console.log('last', str);
    if (str == '')
        return "NOT_FOUND_999999";
    return str;
}

class AppController {
    async dashboard(req, res, params) {
        const fromDate = params.from_date || null;
        const toDate = params.to_date || null;
        const conditions = { deleted_at: null };
        if (fromDate && toDate) {
            conditions.created_at = {
                $gte: new Date(fromDate),
                $lte: new Date(toDate)
            };
        }

        const totalBook = await OrderItemModel.aggregate([{ $match: { ...conditions, type: 'BOOK' } }, { $group: { _id: null, total_qty: { $sum: "$qty" } } }]);
        const totalClassroom = await OrderItemModel.aggregate([{ $match: { ...conditions, type: 'CLASSROOM' } }, { $group: { _id: null, total_qty: { $sum: "$qty" } } }]);
        const totalUser = await UserModel.count(conditions);
        const totalOrder = await OrderModel.count(conditions);
        const totalRevenue = await OrderModel.aggregate([{ $match: { ...conditions, status: { $in: ['SUCCESS', 'PAID'] } } }, { $group: { _id: null, total: { $sum: "$total" } } }]);

        const data = {
            total_book_qty: totalBook && totalBook.length > 0 ? totalBook[0].total_qty : 0,
            total_classroom_qty: totalClassroom && totalClassroom.length > 0 ? totalClassroom[0].total_qty : 0,
            total_user: totalUser,
            total_order: totalOrder,
            total_revenue: totalRevenue && totalRevenue.length > 0 ? totalRevenue[0].total : 0

        }
        return response(res, data, 'Thành công', statusCode.OK);
    }

    async configs(req, res, params) {
        try {
            const data = {
                notify_app_id: appConfig.ONESIGNAL.APP_ID,
                notify_note: appConfig.NOTIFY_NOTE,
                notify_note_cookie_exp_day: appConfig.NOTIFY_NOTE_COOKIE_EXP_DAY,
                is_show_notify_popup: true
            };
            return response(res, data, 'Thành công', statusCode.OK);
        } catch (err) {
            logError(err);
            return response(res, null, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }

    async homePage(req, res, params) {
        try {
            let conditions = {};
            let options = { limit: 100, sort: { ordering: 1 } };

            conditions = {
                status: true,
                is_show_home: true,
                deleted_at: null
            };
            const classroomGroups = await ClassroomGroupModel.find(conditions, 'name banner image is_show_home status subject', { limit: 100, sort: { ordering: 1 } });

            const classroomGroupHomeBlocks = [];
            const megaMenuHome = [];

            options = { limit: 16, sort: { ordering: 1 } };
            conditions = {
                status: true,
                deleted_at: null,
                is_show_home: true
            };

            for (let i = 0; i < classroomGroups.length; i++) {
                const _record = classroomGroups[i].toObject();
                const _recordMenu = classroomGroups[i].toObject();;
                conditions = {
                    'group.id': _record._id,
                    deleted_at: null,
                    status: true,
                    is_featured: true,
                    is_online: true
                };
                const projection = 'name video_intro alias banner subject group level image teacher promotion teacher_id code rating price origin_price';
                const classrooms = await ClassroomModel.find(conditions, projection, options);
                _record.classrooms = classrooms;
                classroomGroupHomeBlocks.push(_record);

                const listSubjects = [];
                for (let j = 0; j < classrooms.length; j++) {
                    const index = listSubjects.findIndex(x => x.subject_id === classrooms[j].subject.id);
                    if (index < 0) {
                        listSubjects.push({
                            subject_id: classrooms[j].subject.id,
                            subject_name: classrooms[j].subject.name,
                            classrooms: [classrooms[j]]
                        });
                    } else {
                        listSubjects[index].classrooms.push(classrooms[j]);
                    }
                }
                _recordMenu.list_subjects = listSubjects;
                megaMenuHome.push(_recordMenu);
            }

            options = { limit: 8, sort: { ordering: 1 } };
            conditions = {
                status: true,
                deleted_at: null,
                is_featured: true,
                is_online: true
            };
            let  featuredClassrooms = [];
            // featuredClassrooms = await ClassroomModel.find(conditions, null, options);
            
            conditions = {
                status: true,
                deleted_at: null,
                is_show_home: true
            };
            const bookCategory = await BookCategoryModel.find(conditions, null, { limit: 5 });
            const bookBlocks = [];
            for (let i = 0; i < bookCategory.length; i++) {
                const _bookCategory = bookCategory[i].toObject();
                conditions = {
                    status: true,
                    deleted_at: null,
                    is_featured: true,
                    'category.id': bookCategory[i]._id
                };
                const projection = 'name alias subject category level image teacher promotion teacher_id code rating price origin_price';
                const featuredbooks = await BookModel.find(conditions, projection, { limit: 8 });
                const bookSubjects = [];
                for (let j = 0; j < featuredbooks.length; j++) {
                    const index = bookSubjects.findIndex(x => x.subject_id === featuredbooks[j].subject.id);
                    if (index < 0) {
                        bookSubjects.push({
                            subject_id: featuredbooks[j].subject.id,
                            subject_name: featuredbooks[j].subject.name
                        });
                    }
                }
                _bookCategory.books = featuredbooks;
                _bookCategory.list_subjects = bookSubjects;
                bookBlocks.push(_bookCategory);
            }

            conditions = {
                status: true,
                deleted_at: null,
                is_featured: true
            };
            let featuredbooks = [];
            // featuredbooks = await BookModel.find(conditions, null, { limit: 8 });
            const projection = 'fullname phone email avatar description content alias link_fb external_link profile_pic';
            const teachers = await UserModel.find({ user_group: 'TEACHER', is_show_profile: true, status: 'ACTIVE', deleted_at: null }, projection, { limit: 20 });
            const reviews = await AdultEvalutionModel.find({ status: true, deleted_at: null, type: 'DANHGIA_PHUHUYNH' }, null, { limit: 50 });
            const reviewStudent = await AdultEvalutionModel.find({ status: true, deleted_at: null, type: 'DANHGIA_HOCSINH' }, null, { limit: 50 });
            const topRanks = await AdultEvalutionModel.find({ status: true, deleted_at: null, type: 'TOP_RANKS'}, null, { limit: 50, sort: { created_at: -1 } });
            const examCategories = await ExamCategoryModel.find({ _id: { $in: appConfig.ID_EXAM_CATEGORY_FIXED } }, null, { sort: { created_at: 1 } });

            const mediaPosts = await BlogPostModel.find({ status: true, 'category.id': appConfig.HOME_POST.MEDIA, deleted_at: null }, null, { limit: 10 });
            const posts = await BlogPostModel.find({ status: true, 'category.id': appConfig.HOME_POST.POST, deleted_at: null }, null, { limit: 10 });

            const homeData = await PageModel.findOne({ key: 'homepage' });
            let contentConfig = null;
            try {
                if (homeData && homeData.content_configs) {
                    contentConfig = JSON.parse(homeData.content_configs);
                }
            } catch (err) {

            }
            let sliders = [];
            if (contentConfig && contentConfig.banners) {
                sliders = contentConfig.banners;
            }

            const sliders_2 = sliders;
            const data = {
                classroomGroups,
                megaMenuHome,
                classroomGroupHomeBlocks,
                bookBlocks,
                featuredClassrooms,
                featuredbooks,
                teachers,
                reviews,
                reviewStudent,
                examCategories,
                sliders,
                contentConfig,
                topRanks,
                sliders_2,
                posts,
                mediaPosts
            };
            return response(res, data, 'Thành công', statusCode.OK);
        } catch (err) {
            logError(err);
            console.log(err);
        }
    }

    async homePageMobile(req, res, params) {
        try {
            let conditions = {};
            let options = { limit: 100, sort: { ordering: 1 } };

            conditions = {
                status: true,
                is_show_home: true,
                deleted_at: null
            };
            const classroomGroups = await ClassroomGroupModel.find(conditions, 'name banner image is_show_home status subject', { limit: 100, sort: { ordering: 1 } });

            const classroomGroupHomeBlocks = [];
            const megaMenuHome = [];

            options = { limit: 16, sort: { ordering: 1 } };
            conditions = {
                status: true,
                deleted_at: null,
                is_show_home: true
            };

            for (let i = 0; i < classroomGroups.length; i++) {
                const _record = classroomGroups[i].toObject();
                const _recordMenu = classroomGroups[i].toObject();;
                conditions = {
                    'group.id': _record._id,
                    deleted_at: null,
                    status: true,
                    is_featured: true,
                    is_online: true
                };
                const projection = 'name video_intro alias banner subject group level image teacher promotion teacher_id code rating price origin_price';
                const classrooms = await ClassroomModel.find(conditions, projection, options);
                _record.classrooms = classrooms;
                classroomGroupHomeBlocks.push(_record);

                const listSubjects = [];
                for (let j = 0; j < classrooms.length; j++) {
                    const index = listSubjects.findIndex(x => x.subject_id === classrooms[j].subject.id);
                    if (index < 0) {
                        listSubjects.push({
                            subject_id: classrooms[j].subject.id,
                            subject_name: classrooms[j].subject.name,
                            classrooms: [classrooms[j]]
                        });
                    } else {
                        listSubjects[index].classrooms.push(classrooms[j]);
                    }
                }
                _recordMenu.list_subjects = listSubjects;
                megaMenuHome.push(_recordMenu);
            }

            options = { limit: 8, sort: { ordering: 1 } };
            conditions = {
                status: true,
                deleted_at: null,
                is_featured: true,
                is_online: true
            };
            let  featuredClassrooms = [];
            featuredClassrooms = await ClassroomModel.find(conditions, null, options);
            
            conditions = {
                status: true,
                deleted_at: null,
                is_show_home: true
            };
            const bookCategory = await BookCategoryModel.find(conditions, null, { limit: 5 });
            const bookBlocks = [];
            for (let i = 0; i < bookCategory.length; i++) {
                const _bookCategory = bookCategory[i].toObject();
                conditions = {
                    status: true,
                    deleted_at: null,
                    is_featured: true,
                    'category.id': bookCategory[i]._id
                };
                const projection = 'name alias subject category level image teacher promotion teacher_id code rating price origin_price';
                const featuredbooks = await BookModel.find(conditions, projection, { limit: 8 });
                const bookSubjects = [];
                for (let j = 0; j < featuredbooks.length; j++) {
                    const index = bookSubjects.findIndex(x => x.subject_id === featuredbooks[j].subject.id);
                    if (index < 0) {
                        bookSubjects.push({
                            subject_id: featuredbooks[j].subject.id,
                            subject_name: featuredbooks[j].subject.name
                        });
                    }
                }
                _bookCategory.books = featuredbooks;
                _bookCategory.list_subjects = bookSubjects;
                bookBlocks.push(_bookCategory);
            }

            conditions = {
                status: true,
                deleted_at: null,
                is_featured: true
            };
            let featuredbooks = [];
            featuredbooks = await BookModel.find(conditions, null, { limit: 8 });
            const projection = 'fullname phone email avatar description content alias link_fb external_link profile_pic';
            const teachers = await UserModel.find({ user_group: 'TEACHER', is_show_profile: true, status: 'ACTIVE', deleted_at: null }, projection, { limit: 20 });
            const reviews = await AdultEvalutionModel.find({ status: true, deleted_at: null, type: 'DANHGIA_PHUHUYNH' }, null, { limit: 50 });
            const topRanks = await AdultEvalutionModel.find({ status: true, deleted_at: null, type: 'TOP_RANKS'}, null, { limit: 50, sort: { created_at: -1 } });
            const examCategories = await ExamCategoryModel.find({ _id: { $in: appConfig.ID_EXAM_CATEGORY_FIXED } }, null, { sort: { created_at: 1 } });

            const mediaPosts = await BlogPostModel.find({ status: true, 'category.id': appConfig.HOME_POST.MEDIA, deleted_at: null }, null, { limit: 10 });
            const posts = await BlogPostModel.find({ status: true, 'category.id': appConfig.HOME_POST.POST, deleted_at: null }, null, { limit: 10 });

            const homeData = await PageModel.findOne({ key: 'homepage' });
            let contentConfig = null;
            try {
                if (homeData && homeData.content_configs) {
                    contentConfig = JSON.parse(homeData.content_configs);
                }
            } catch (err) {

            }
            let sliders = [];
            if (contentConfig && contentConfig.banners) {
                sliders = contentConfig.banners;
            }

            const sliders_2 = sliders;
            const data = {
                classroomGroups,
                megaMenuHome,
                classroomGroupHomeBlocks,
                bookBlocks,
                featuredClassrooms,
                featuredbooks,
                teachers,
                reviews,
                examCategories,
                sliders,
                contentConfig,
                topRanks,
                sliders_2,
                posts,
                mediaPosts
            };
            return response(res, data, 'Thành công', statusCode.OK);
        } catch (err) {
            logError(err);
            console.log(err);
        }
    }

    async about(req, res, params) {
        try {
            const projection = 'fullname phone email avatar description content alias link_fb external_link profile_pic';
            const teachers = await UserModel.find({ user_group: 'TEACHER', is_show_profile: true, status: 'ACTIVE', deleted_at: null }, projection, { limit: 50 });
            const reviews = await AdultEvalutionModel.find({ status: true, deleted_at: null }, null, { limit: 50 });
            const aboutData = await PageModel.findOne({ key: 'about' });
            let contentConfig = null;
            try {
                if (aboutData && aboutData.content_configs) {
                    contentConfig = JSON.parse(aboutData.content_configs);
                }
            } catch (err) {

            }

            const homeData = await PageModel.findOne({ key: 'homepage' });
            let contentConfigHome = null;
            try {
                if (homeData && homeData.content_configs) {
                    contentConfigHome = JSON.parse(homeData.content_configs);
                }
            } catch (err) {

            }
            let sliders = [];
            if (contentConfigHome && contentConfigHome.banners) {
                sliders = contentConfigHome.banners;
            }

            const data = {
                teachers,
                sliders,
                reviews,
                contentConfig
            };
            return response(res, data, 'Thành công', statusCode.OK);
        } catch (err) {
            logError(err);
        }
    }

    async homepage(req, res, params) {
        try {
            let conditions = {};
            const classroomGroups = [];

            const options = { limit: 8, sort: { ordering: 1 } };
            conditions = {
                status: true,
                deleted_at: null,
                is_show_home: true
            };
            let records = await ClassroomGroupModel.find(conditions, null, options);
            for (let i = 0; i < records.length; i++) {
                const _record = records[i].toObject();
                conditions = {
                    'group.id': _record._id,
                    deleted_at: null,
                    status: true,
                    is_online: true
                };

                const classrooms = await ClassroomModel.find(conditions, null, options);
                _record.classrooms = classrooms;
                classroomGroups.push(_record);
            }

            const books = await BookModel.find({ status: true, deleted_at: null }, null, { limit: 8 });
            const projection = 'fullname phone email avatar description content alias';
            const teachers = await UserModel.find({ user_group: 'TEACHER', is_show_profile: true }, projection, { limit: 8 });
            const reviews = await AdultEvalutionModel.find({ status: true }, null, { limit: 10 });

            const posts = await BlogPostModel.find({ status: true }, null, { limit: 10 });

            const banners = [
                {
                    _id: 1,
                    name: 'Banner 1',
                    link: '#',
                    src: 'https://cdn.luyenthitiendat.vn/2021620/20210620140720.png'
                },
                {
                    _id: 2,
                    name: 'Banner 2',
                    link: 'https://luyenthidaicoviet.vn',
                    src: 'https://cdn.luyenthitiendat.vn/2021620/20210620140720.png'
                }
            ];

            const examCategories = await ExamCategoryModel.find({ _id: { $in: appConfig.ID_EXAM_CATEGORY_FIXED } });
            const data = {
                classroomGroups,
                books,
                teachers,
                banners,
                reviews,
                posts,
                examCategories
            };
            return response(res, data, 'Thành công', statusCode.OK);
        } catch (err) {
            logError(err);
        }
    }

    async search(req, res, params) {
        try {
            const { type } = params;
            let keyword = params.keyword || false;
            const page = 1;
            const limit = 50;
            if (!keyword)
                return response(res, null, language.PROCESS_ERROR, statusCode.ERROR);

            let conditions = { deleted_at: null, status: true, is_online: true };
            if (keyword) {
                const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                const regex = new RegExp(escaped, 'i');
                conditions.name = { $regex: regex }
            }

            const options = {
                skip: (page - 1) * limit,
                limit: limit,
                sort: { created_at: -1 }
            };

            let items = [];
            let total = 0;
            if (type === 'CLASSROOM') {
                items = await ClassroomModel.find(conditions, null, options);
                total = await ClassroomModel.count(conditions);
            }

            if (type === 'BOOK') {
                delete conditions.is_online;
                items = await BookModel.find(conditions, null, options);
                total = await BookModel.count(conditions);
            }

            let testings = [];
            if (type === 'EXAM') {
                delete conditions.status;
                delete conditions.is_online;
                items = await ExamModel.find(conditions, null, options);
                total = await ExamModel.count(conditions);
                const examIds = [];
                for (let i = 0; i < items.length; i++) {
                    examIds.push(items[i]._id);
                }

                conditions = {
                    'exam.id': {
                        $in: examIds
                    },
                    deleted_at: null
                };

                if (req.user) {
                    conditions['user.id'] = req.user.user_id;
                    testings = await TestingModel.find(conditions);
                }
            }

            const data = {
                items,
                total,
                testings,
                perPage: limit
            };

            return response(res, data, 'Thành công', statusCode.OK);
        } catch (err) {
            logError(err);
            return response(res, data, language.ERROR, statusCode.ERROR);
        }
    }

    async addUserToClassroom(req, res, params) {
        try {
            const { classroom1, classroom2 } = params;
            if (!classroom1 || !classroom2)
                return response(res, null, language.CANNOT_EMPTY.replace('%s', 'classroom1, classroom2 '), statusCode.ERROR);
            AppService.addUserToClassroom(classroom1, classroom2);
            return response(res, {}, 'Thành công', statusCode.OK);
        } catch (err) {
            logError(err);
            return response(res, data, language.ERROR, statusCode.ERROR);
        }
    }
}

module.exports = new AppController();