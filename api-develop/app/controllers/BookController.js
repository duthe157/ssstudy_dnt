const appConfig = require('../../config/app');
const BaseHelper = require('../helpers/BaseHelper');
const BookModel = require('../models/Book');
const ClassroomGroupModel = require('../models/ClassroomGroup');
const SubjectModel = require('../models/Subject');
const BookReviewModel = require('../models/BookReview');
const ClassroomModel = require('../models/Classroom');
const UserModel = require('../models/User');
const UserBuyDataModel = require('../models/UserBuyData');
const UploadService = require('../services/UploadService');
const mongo = require('../../db/mongo');
const LabelModel = require('../models/Label');
const LabelItemModel = require('../models/LabelItem');
const language = BaseHelper.fileToJSON(`${__dirname}/../languages/vi.json`);

async function syncLabelNumItem(labelId) {
    const count = await LabelItemModel.count({ label_id: labelId });
    await LabelModel.updateOne({ _id: labelId }, { $set: { num_item: count } });
}

function removeSpacesAndSpecialChars(str) {
    console.log('first', str);
    str.replace(/[^a-zA-Z ]/g, "");
    str.replace(/[^\w\s]/gi, '');
    console.log('last', str);
    if (str == '')
        return "NOT_FOUND_999999";
    return str;
}

class BookController {
    async list(req, res, params) {
        try {
            const keyword = params.keyword || false;
            const page = parseInt(params.page || appConfig.PAGINATION.PAGE);
            const limit = parseInt(params.limit || appConfig.PAGINATION.LIMIT);
            const subjectID = params.subject_id || null;
            const categoryID = params.category_id || null;
            const isFeatured = params.is_featured;
            const teacherID = params.teacher_id || null;
            const level = params.level || false;
            const conditions = { deleted_at: null };


            const options = {
                sort: { created_at: -1 }
            }

            if (limit != -1) {
                options.skip = (page - 1) * limit;
                options.limit = limit
            }

            const sortKey = params.sort_key || null;
            const sortValue = params.sort_value || null;
            if (sortKey && (sortValue == 1 || sortValue == -1)) {
                options.sort = {};
                options.sort[sortKey] = sortValue;
            }

            if (keyword) {
                const parserKeyword = keyword.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')
                conditions.name = { $regex: parserKeyword, $options: 'i' };
            }

            if (subjectID)
                conditions['subject.id'] = subjectID;

            if (level)
                conditions.level = level;

            if (isFeatured !== undefined)
                conditions.is_featured = isFeatured;

            if (teacherID)
                conditions.teacher_id = teacherID;

            if (req.user.user_group === appConfig.USER_GROUP.TEACHER || req.user.user_group === appConfig.USER_GROUP.SUPPORTER) {
                conditions['subject.id'] = { $in: req.user.subject_ids };
            }

            if (categoryID)
                if (Array.isArray(categoryID)) {
                    conditions.$or = [];
                    for (let i = 0; i < categoryID.length; i++) {
                        conditions.$or.push({ 'category.id': categoryID[i] });
                    }
                } else {
                    conditions['category.id'] = categoryID;
                }

            const labelId = params.label_id || null;
            if (labelId) {
                const childLabels = await LabelModel.find({ parent_id: labelId, deleted_at: null }, { _id: 1 });
                const labelIds = [labelId, ...childLabels.map(c => c._id.toString())];
                const assignedItemIds = await LabelItemModel.distinct('item_id', { label_id: { $in: labelIds }, item_type: 'BOOK' });
                conditions._id = { $in: assignedItemIds };
            }

            const records = await BookModel.find(conditions, null, options);
            const total = await BookModel.count(conditions);
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
    async listRelated(req, res, params) {
        try {
            const page = parseInt(params.page || appConfig.PAGINATION.PAGE);
            const limit = parseInt(params.limit || appConfig.PAGINATION.LIMIT);
            // const subjectID = params.subject_id || null;
            const bookID = params.book_id || null;
            const categoryID = params.category_id || null;
            const level = params.level || false;
            const conditions = { deleted_at: null };

            const options = {
                sort: { created_at: -1 }
            }

            if (limit != -1) {
                options.skip = (page - 1) * limit;
                options.limit = limit
            }

            if (level)
                conditions.level = level;

            if (categoryID)
                if (Array.isArray(categoryID)) {
                    conditions.$or = [];
                    for (let i = 0; i < categoryID.length; i++) {
                        conditions.$or.push({ 'category.id': categoryID[i] });
                    }
                } else {
                    conditions['category.id'] = categoryID;
                }
            if (bookID) {
                conditions._id = { $ne: bookID };
            }
            const records = await BookModel.db.find(conditions, null, options).lean();
            for (let i = 0; i < records.length; i++) {
                const book = records[i];
                let teacher = null;
                if (book.teacher_id)
                    teacher = await UserModel.db.findOne({ _id: book.teacher_id });
                book.teacher = teacher;
            }
            const total = await BookModel.count(conditions);
            const data = {
                records,
                totalRecord: total,
                perPage: limit,
            };
            return response(res, data, 'Thành công', statusCode.OK);
        } catch (err) {
            logError(err);
            console.log(err);
            return response(res, null, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }
    async detail(req, res, params) {
        try {
            const { id } = params;

            const conditions = { _id: id };
            let rs = await BookModel.db.findOne(conditions).lean();
            let isBought = false;
            if (req.user) {
                const num = await UserBuyDataModel.findOne({ user_id: req.user.user_id, item_id: id, type: 'BOOK' });
                if (num)
                    isBought = true;
            }
            if (rs.teacher_id) {
                const teacher = await UserModel.db.find({ _id: rs.teacher_id });
                rs.teacher = teacher;
            }
            let classroomAttached = [];
            if (rs.classroom_attached && rs.classroom_attached.length > 0)
                classroomAttached = await ClassroomModel.find({ _id: { $in: rs.classroom_attached }, deleted_at: null });

            let bookRelates = [];
            if (rs.book_relates && rs.book_relates.length > 0)
                bookRelates = await BookModel.find({ _id: { $in: rs.book_relates }, deleted_at: null });

            let classroomRelates = [];
            if (rs.classroom_relates && rs.classroom_relates.length > 0)
                classroomRelates = await ClassroomModel.find({ _id: { $in: rs.classroom_relates }, deleted_at: null });

            return response(res, { book: rs, classroomAttached, bookRelates, classroomRelates, is_bought: isBought }, 'Thành công', statusCode.OK);
        } catch (err) {
            logError(err);
            console.log(err);
            return response(res, null, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }

    async create(req, res, params) {
        try {
            const { name, content, files, description } = params;
            const subjectID = params.subject_id || null;
            const categoryID = params.category_id || null;
            const externalLink = params.external_link || null;
            const price = params.price || 0;
            const originPrice = params.origin_price || 0;
            const status = params.status || appConfig.STATUS.INACTIVE;
            const ordering = params.ordering || 1;
            const stockStatus = params.stock_status || 'IN_STOCK';
            const showOnCart = params.show_on_cart || false;
            const isFeatured = params.is_featured || false;
            const classroomRelates = params.classroom_relates || [];
            const bookRelates = params.book_relates || [];
            const classroomAttached = params.classroom_attached || [];
            const teacherID = params.teacher_id || null;
            const promotion = params.promotion || null;
            const level = params.level || null;
            const code = params.code || 'S' + new Date().getTime();
            const quantity = params.quantity || null
            const includes = params.includes || null;
            const highlightInformations = params.highlightInformations;
            const student_owned = params.student_owned || 0;
            if (!name)
                return response(res, null, language.CANNOT_EMPTY.replace('%s', language.NAME), statusCode.ERROR);

            if (!subjectID)
                return response(res, null, language.CANNOT_EMPTY.replace('%s', language.SUBJECT), statusCode.ERROR);

            const subject = await SubjectModel.findOne({ _id: subjectID });
            if (!subject)
                return response(res, null, language.ITEM_NOT_EXIST.replace('%s', language.SUBJECT), statusCode.ERROR);

            if (!categoryID)
                return response(res, null, language.CANNOT_EMPTY.replace('%s', 'Danh mục sách'), statusCode.ERROR);

            const category = await ClassroomGroupModel.findOne({ _id: categoryID });
            if (!category)
                return response(res, null, language.ITEM_NOT_EXIST.replace('%s', 'Danh mục sách'), statusCode.ERROR);

            if (!teacherID)
                return response(res, null, language.CANNOT_EMPTY.replace('%s', 'Giáo viên'), statusCode.ERROR);

            const alias = BaseHelper.seoURL(name.trim());
            const _doc = {
                name,
                code,
                alias,
                subject: { id: subject.id, name: subject.name },
                category: { id: category._id, name: category.name },
                external_link: externalLink,
                description,
                content,
                origin_price: parseFloat(originPrice),
                price: parseFloat(price),
                ordering,
                level,
                teacher_id: teacherID,
                stock_status: stockStatus,
                show_on_cart: showOnCart,
                is_featured: isFeatured,
                book_relates: bookRelates,
                classroom_attached: classroomAttached,
                classroom_relates: classroomRelates,
                promotion,
                status,
                quantity: quantity ? parseInt(quantity) : 0,
                includes: includes,
                highlightInformations: highlightInformations,
                student_owned: student_owned
            };

            if (files && files.length > 0) {
                const fileData = await UploadService.upload(files[0], 'base64', 'book');
                if (fileData) {
                    _doc.image = appConfig.FILE_DOMAIN + '/' + fileData[0];
                }
            }

            const book = await BookModel.create(_doc);
            if (!book)
                return response(res, {}, language.ERROR, statusCode.ERROR);

            return response(res, book, 'Thành công', statusCode.OK);
        } catch (err) {
            logError(err);
            return response(res, {}, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }

    async update(req, res, params) {
        try {
            const { id, name, content, files, description } = params;
            const subjectID = params.subject_id || null;
            const categoryID = params.category_id || null;
            const teacherID = params.teacher_id || null;
            const externalLink = params.external_link || null;
            const price = params.price;
            const originPrice = params.origin_price;
            const status = params.status || appConfig.STATUS.INACTIVE;
            const ordering = params.ordering || 999;
            const stockStatus = params.stock_status || 'IN_STOCK';
            const isFeatured = params.is_featured || false;
            const classroomRelates = params.classroom_relates || [];
            const bookRelates = params.book_relates || [];
            const classroomAttached = params.classroom_attached || [];
            const promotion = params.promotion || null;
            const code = params.code || 'S' + new Date().getTime();
            const level = params.level || null;
            const quantity = params.quantity || null;
            const includes = params.includes || null;
            const highlightInformations = params.highlightInformations || null;
            const student_owned = params.student_owned || 0;
            const labelIds = params.label_ids !== undefined
                ? (Array.isArray(params.label_ids) ? params.label_ids : [])
                : undefined;
            if (!id)
                return response(res, null, 'Request không hợp lệ!', statusCode.ERROR);

            const book = await BookModel.findOne({ _id: id });
            if (!book)
                return response(res, {}, language.ITEM_NOT_EXIST.replace('%s', 'SÁCH'), statusCode.ERROR);

            if (!subjectID)
                return response(res, null, language.CANNOT_EMPTY.replace('%s', language.SUBJECT), statusCode.ERROR);

            const subject = await SubjectModel.findOne({ _id: subjectID });

            if (!subject)
                return response(res, null, language.ITEM_NOT_EXIST.replace('%s', language.SUBJECT), statusCode.ERROR);

            if (!categoryID)
                return response(res, null, language.CANNOT_EMPTY.replace('%s', 'Danh mục sách'), statusCode.ERROR);

            const category = await ClassroomGroupModel.findOne({ _id: categoryID });
            if (!category)
                return response(res, null, language.ITEM_NOT_EXIST.replace('%s', 'Danh mục sách'), statusCode.ERROR);

            if (!teacherID)
                return response(res, null, language.CANNOT_EMPTY.replace('%s', 'Giáo viên'), statusCode.ERROR);

            if (name)
                book.name = name;

            book.code = code;

            if (subjectID)
                book.subject = { id: subject.id, name: subject.name };

            if (category)
                book.category = { id: category._id, name: category.name };

            if (price)
                book.price = parseFloat(price);

            if (originPrice)
                book.origin_price = parseFloat(originPrice);

            if (quantity) {
                book.quantity = parseInt(quantity);
            }
            if (includes)
                book.includes = includes;
            if (highlightInformations)
                book.highlightInformations = highlightInformations;
            const alias = BaseHelper.seoURL(name.trim());
            book.alias = alias;
            book.description = description;
            book.stock_status = stockStatus;
            book.status = status;
            book.is_featured = isFeatured;
            book.external_link = externalLink;
            book.ordering = ordering;
            book.content = content;
            book.teacher_id = teacherID;
            book.classroom_relates = classroomRelates;
            book.classroom_attached = classroomAttached;
            book.book_relates = bookRelates;
            book.promotion = promotion;
            book.level = level;
            if (student_owned !== null) {
                book.student_owned = student_owned;
            }

            if (files && files.length > 0) {
                const fileData = await UploadService.upload(files[0], 'base64', 'book');
                if (fileData) {
                    book.image = appConfig.FILE_DOMAIN + '/' + fileData[0];
                }
            }

            // Validate nhãn trước khi update
            if (labelIds !== undefined && labelIds.length > 0) {
                const validLabels = await LabelModel.find({ _id: { $in: labelIds }, deleted_at: null, status: 'ACTIVE' });
                if (validLabels.length !== labelIds.length)
                    return response(res, null, 'Một hoặc nhiều nhãn không hợp lệ hoặc đang ẩn', statusCode.ERROR);

                const parentIdSet = new Set(validLabels.filter(l => l.parent_id).map(l => l.parent_id));
                if (validLabels.filter(l => !l.parent_id).some(l => !l.is_primary))
                    return response(res, null, 'Một hoặc nhiều nhãn không thuộc nhãn cha đang được sử dụng', statusCode.ERROR);

                if (parentIdSet.size > 0) {
                    const primaryParents = await LabelModel.find({ _id: { $in: [...parentIdSet] }, is_primary: true, deleted_at: null }, { _id: 1 });
                    const validParentIds = new Set(primaryParents.map(p => p._id.toString()));
                    if ([...parentIdSet].some(pid => !validParentIds.has(pid)))
                        return response(res, null, 'Một hoặc nhiều nhãn không thuộc nhãn cha đang được sử dụng', statusCode.ERROR);
                }
            }

            const rs = await BookModel.updateOne({ _id: id }, book);

            // Đồng bộ nhãn nếu label_ids được truyền vào
            if (labelIds !== undefined) {
                const bookId = id.toString();
                const oldItems = await LabelItemModel.find({ item_id: bookId, item_type: 'BOOK' }, { label_id: 1 });
                const oldLabelIds = oldItems.map(i => i.label_id);

                await LabelItemModel.delete({ item_id: bookId, item_type: 'BOOK' }, true);

                if (labelIds.length > 0) {
                    await Promise.all(labelIds.map(lid => LabelItemModel.create({ label_id: lid, item_id: bookId, item_type: 'BOOK' })));
                }

                const affectedIds = [...new Set([...oldLabelIds, ...labelIds])];
                if (affectedIds.length > 0) {
                    await Promise.all(affectedIds.map(lid => syncLabelNumItem(lid)));
                }
            }

            if (rs.nModified || labelIds !== undefined)
                return response(res, book, 'Thành công', statusCode.OK);
            return response(res, book, language.ERROR, statusCode.ERROR);
        } catch (err) {
            logError(err);
            return response(res, {}, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }

    async updateMetaData(req, res, params) {
        try {
            const id = params.id || null;
            const ordering = params.ordering || 999;
            const status = params.status;
            const isFeatured = params.is_featured;

            if (!id)
                return response(res, null, 'Request không hợp lệ!', statusCode.ERROR);

            const docBook = {};
            docBook.ordering = parseInt(ordering);
            if (status !== undefined) docBook.status = status;
            if (isFeatured !== undefined) docBook.is_featured = isFeatured;

            let book = await BookModel.findOne({ _id: id });
            if (!book)
                return response(res, {}, language.ITEM_NOT_EXIST.replace('%s', language.BOOK), statusCode.ERROR);
            const rs = await BookModel.updateOne({ _id: id }, { $set: docBook });
            if (rs.nModified) {
                book = await BookModel.findOne({ _id: id });
                return response(res, book, 'Thành công', statusCode.OK);
            }
            return response(res, book, language.ERROR, statusCode.ERROR);
        } catch (err) {
            logError(err);
            return response(res, {}, 'Có lỗi xảy ra. Vui lòng thử lại!', statusCode.ERROR);
        }
    }

    async delete(req, res, params) {
        try {
            const { ids } = params || [];
            if (ids.length == 0)
                return response(res, null, 'Request không hợp lệ!', statusCode.ERROR);

            const rs = await BookModel.softDelete({ _id: { $in: ids } }, true);
            if (rs)
                return response(res, {}, 'Thành công', statusCode.OK);
            return response(res, null, language.ERROR, statusCode.ERROR);
        } catch (err) {
            logError(err);
            return response(res, null, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }

    async view(req, res, params) {
        try {
            const { alias } = params;
            let otherBooks = [];
            let reviews = [];
            let totalReview = 0;
            let conditions = { alias: alias };
            let isBought = false;
            const book = await BookModel.findOne(conditions);
            if (book) {
                if (book.category)
                    otherBooks = await BookModel.find({ 'category.id': book.category.id, deleted_at: null });
                conditions = {
                    book_id: book._id,
                    status: true,
                    deleted_at: null
                };
                const options = {
                    skip: 0,
                    limit: 20,
                    sort: { created_at: -1 }
                };
                reviews = await BookReviewModel.find(conditions, null, options);
                totalReview = await BookReviewModel.count(conditions);

                if (req.user) {
                    const num = await UserBuyDataModel.findOne({ user_id: req.user.user_id, item_id: book._id, type: 'BOOK' });
                    if (num)
                        isBought = true;
                }
            }
            let teacher = null;
            if (book.teacher_id)
                teacher = await UserModel.findOne({ _id: book.teacher_id });

            let classroomAttached = [];
            if (book.classroom_attached && book.classroom_attached.length > 0)
                classroomAttached = await ClassroomModel.find({ _id: { $in: book.classroom_attached }, deleted_at: null });

            let bookRelates = [];
            if (book.book_relates && book.book_relates.length > 0)
                bookRelates = await BookModel.find({ _id: { $in: book.book_relates }, deleted_at: null });

            let classroomRelates = [];
            if (book.classroom_relates && book.classroom_relates.length > 0)
                classroomRelates = await ClassroomModel.find({ _id: { $in: book.classroom_relates }, deleted_at: null });

            return response(res, { book, teacher, otherBooks, reviews, totalReview, classroomAttached, bookRelates, classroomRelates, is_bought: isBought }, 'Thành công', statusCode.OK);
        } catch (err) {
            logError(err);
            console.error(err);
            return response(res, null, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }

    async listBook(req, res, params) {
        try {
            let keyword = params.keyword || '';
            const page = parseInt(params.page || appConfig.PAGINATION.PAGE);
            const limit = parseInt(params.limit || appConfig.PAGINATION.LIMIT);
            const subjectID = params.subject_id || null;
            const teacherID = params.teacher_id || null;
            const categoryID = params.category_id || null;
            const categoryAlias = params.category_alias || null;
            const conditions = { deleted_at: null };
            const price = params.price || null;
            const level = params.level || null;
            const classroomID = params.classroom_id || null;
            const type = params.type || null;

            let rangePrice = null;
            let fromPrice = null;
            let toPrice = null;

            let orderingFillter = null;
            if (type) {
                switch (type) {
                    case 'sale':
                        orderingFillter = 1
                        break;
                    case 'hot':
                        orderingFillter = 3
                        break;
                }
            }

            if (orderingFillter)
                conditions.ordering = orderingFillter;

            if (price) {
                if (typeof price === 'object' && price.length > 0) {
                    // Lay gia lon nhat, gia nho nhat
                    const priceArray = [];
                    for (let i = 0; i < price.length; i++) {
                        const _price = price[i];
                        rangePrice = _price.split('-');
                        fromPrice = parseFloat(rangePrice[0]);
                        toPrice = parseFloat(rangePrice[1]);
                        priceArray.push(fromPrice);
                        priceArray.push(toPrice);
                    }
                    const minPrice = Math.min.apply(null, priceArray);
                    const maxPrice = Math.max.apply(null, priceArray);
                    conditions.price = {
                        $lte: maxPrice,
                        $gte: minPrice
                    };
                } else {
                    rangePrice = price.split('-');
                    fromPrice = parseFloat(rangePrice[0]);
                    toPrice = parseFloat(rangePrice[1]);
                    conditions.price = {
                        $lte: toPrice,
                        $gte: fromPrice
                    };
                }
            }

            if (level)
                conditions.level = level;

            if (classroomID) {
                const classroom = await ClassroomModel.findOne({ _id: classroomID });
                if (classroom && classroom.book_relates && classroom.book_relates.length > 0) {
                    conditions._id = { $in: classroom.book_relates };
                }
            }

            const options = {
                skip: (page - 1) * limit,
                limit: limit,
                sort: { updated_at: -1 }
            };

            if (keyword) {
                keyword = removeSpacesAndSpecialChars(keyword);
                const parserKeyword = keyword.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
                conditions['$or'] = [
                    { name: { $regex: `\\b${parserKeyword}\\b`, $options: 'i' } },
                    { code: { $regex: `\\b${parserKeyword}\\b`, $options: 'i' } }
                ]
            }

            if (subjectID)
                conditions['subject.id'] = subjectID;

            if (categoryID)
                if (Array.isArray(categoryID)) {
                    conditions.$or = [];
                    for (let i = 0; i < categoryID.length; i++) {
                        conditions.$or.push({ 'category.id': categoryID[i] });
                    }
                } else {
                    conditions['category.id'] = categoryID;
                }

            if (categoryAlias) {
                const _category = await ClassroomGroupModel.findOne({ alias: categoryAlias });
                if (_category) {
                    conditions['category.id'] = _category._id;
                }
            }

            if (teacherID)
                conditions.teacher_id = teacherID;

            conditions.deleted_at = null;
            conditions.status = true;

            // ===== LABEL FILTER =====
            const labelId = params.label_id || null;
            if (labelId) {
                const childLabels = await LabelModel.find({ parent_id: labelId, deleted_at: null }, { _id: 1 });
                const labelIds = [labelId, ...childLabels.map(c => c._id.toString())];
                const assignedItemIds = await LabelItemModel.distinct('item_id', { label_id: { $in: labelIds }, item_type: 'BOOK' });
                conditions._id = { $in: assignedItemIds };
            }

            const records = await BookModel.find(conditions, null, options);
            const total = await BookModel.count(conditions);
            const data = {
                records,
                totalRecord: total,
                perPage: limit,
            };

            // const teachers = await UserModel.find({ user_group: 'TEACHER', status: 'ACTIVE', deleted_at: null });
            // data.teachers = teachers;

            return response(res, data, 'Thành công', statusCode.OK);
        } catch (err) {
            logError(err);
            console.log(err);
            return response(res, null, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }

    async updateRelate(req, res, params) {
        try {
            const classroomAttached = params.classroom_attached;
            const bookRelates = params.book_relates;
            const classroomRelates = params.classroom_relates;
            const bookID = params.book_id || null;
            if (!bookID)
                return response(res, {}, 'Sách không tồn tại!', statusCode.OK);

            const data = {};
            if (classroomAttached)
                data.classroom_attached = classroomAttached;

            if (bookRelates)
                data.book_relates = bookRelates;

            if (classroomRelates)
                data.classroom_relates = classroomRelates;

            let rs = null;
            if (JSON.stringify(data) !== '{}')
                rs = await BookModel.updateOne({ _id: bookID }, { $set: data });

            if (rs && rs.nModified)
                return response(res, {}, 'Cập nhật thành công!', statusCode.OK);
            return response(res, null, 'Không cập nhật được dữ liệu', statusCode.ERROR);
        } catch (err) {
            logError(err);
            return response(res, null, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }
}

module.exports = new BookController();
