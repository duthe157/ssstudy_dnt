const config = require('../../config/config');
const appConfig = require('../../config/app');
const BaseHelper = require('../helpers/BaseHelper');
const DocumentModel = require('../models/Document');
const CheckToken = require("../routes/CheckToken");
const ClassroomModel = require('../models/Classroom');
const UploadService = require('../services/UploadService');
const language = BaseHelper.fileToJSON(`${__dirname}/../languages/vi.json`);
const axios = require('axios');
const { PDFDocument } = require('pdf-lib');

class DocumentController {
    async list(req, res, params) {
        try {
            const keyword = params.keyword || false;
            const page = parseInt(params.page || appConfig.PAGINATION.PAGE);
            const limit = parseInt(params.limit || appConfig.PAGINATION.LIMIT);
            const main_category_id = params.main_category_id || null;
            const sub_category_id = params.sub_category_id || null;
            const document_type = params.document_type || null;
            const conditions = { deleted_at: null };
            const options = {
                skip: (page - 1) * limit,
                limit: limit,
                sort: { updated_at: -1 }
            };
            if (main_category_id) {
                conditions['main_category.id'] = main_category_id;
            }
            if (sub_category_id) {
                conditions['sub_category.id'] = sub_category_id;
            }
            if (document_type) {
                conditions['document_type'] = document_type;
            }
            const sortKey = params.sort_key || null;
            const sortValue = params.sort_value || null;
            if (sortKey && (sortValue == 1 || sortValue == -1)) {
                options.sort = {};
                options.sort[sortKey] = sortValue;
            }
            if (keyword) {
                const alias = BaseHelper.seoURL(keyword);
                conditions.alias = { $regex: alias, $options: 'i' };
            }
            const records = await DocumentModel.find(conditions, null, options);
            const total = await DocumentModel.count(conditions);
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
    async listRelated(req, res, params) {
        try {
            const document_id = params.document_id || null;
            const page = parseInt(params.page || appConfig.PAGINATION.PAGE);
            const limit = parseInt(params.limit || appConfig.PAGINATION.LIMIT);
            const main_category_id = params.main_category_id || null;
            const sub_category_id = params.sub_category_id || null;
            const conditions = { deleted_at: null };
            const options = {
                skip: (page - 1) * limit,
                limit: limit,
                sort: { updated_at: -1 }
            };
            if (main_category_id) {
                conditions['main_category.id'] = main_category_id;
            }
            if (sub_category_id) {
                conditions['sub_category.id'] = sub_category_id;
            }

            const sortKey = params.sort_key || null;
            const sortValue = params.sort_value || null;
            if (sortKey && (sortValue == 1 || sortValue == -1)) {
                options.sort = {};
                options.sort[sortKey] = sortValue;
            }
            if (document_id) {
                const currentDoc = await DocumentModel.findOne({ _id: document_id });
                if (currentDoc) {
                    if (!main_category_id && currentDoc.main_category) {
                        conditions['main_category.id'] = currentDoc.main_category.id;
                    }
                    if (!sub_category_id && currentDoc.sub_category) {
                        conditions['sub_category.id'] = currentDoc.sub_category.id;
                    }
                    conditions._id = { $ne: document_id };
                }
            }

            const records = await DocumentModel.find(conditions, null, options);
            const total = await DocumentModel.count(conditions);
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
            console.log(err);
            return response(res, null, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }

    async listPublic(req, res, params) {
        try {
            const keyword = params.keyword || false;
            const page = parseInt(params.page || appConfig.PAGINATION.PAGE);
            const limit = parseInt(params.limit || appConfig.PAGINATION.LIMIT);
            const main_category_id = params.main_category_id || null;
            const sub_category_id = params.sub_category_id || null;
            const document_type = params.document_type || null;
            const conditions = { deleted_at: null, status: true };
            const options = {
                skip: (page - 1) * limit,
                limit: limit,
                sort: { updated_at: -1 }
            };
            if (main_category_id) {
                conditions['main_category.id'] = main_category_id;
            }
            if (sub_category_id) {
                conditions['sub_category.id'] = sub_category_id;
            }
            if (document_type) {
                conditions['document_type'] = document_type;
            }
            const sortKey = params.sort_key || null;
            const sortValue = params.sort_value || null;
            if (sortKey && (sortValue == 1 || sortValue == -1)) {
                options.sort = {};
                options.sort[sortKey] = sortValue;
            }
            if (keyword) {
                const alias = BaseHelper.seoURL(keyword);
                conditions.alias = { $regex: alias, $options: 'i' };
            }
            const records = await DocumentModel.find(conditions, null, options);
            const total = await DocumentModel.count(conditions);
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
    async detail(req, res, params) {
        try {
            const { id } = params;

            const conditions = { _id: id };
            const rs = await DocumentModel.findOne(conditions);
            if (rs) {
                return response(res, rs, 'Thành công', statusCode.OK);
            }

            return response(res, null, 'Tài liệu này không tồn tại!', statusCode.ERROR);
        } catch (err) {
            logError(err);
            console.log(err);
            return response(res, null, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }

    async show(req, res, params) {
        try {
            const { id } = params;

            const conditions = { _id: id };

            const rs = await DocumentModel.db.findOne(conditions).lean();

            if (!rs) return;

            const isPro = rs.document_type === 'PRO';
            const isFree = rs.document_type === 'FREE';
            const isLogin = !!req.user;
            const isStudent = req.user?.user_group === appConfig.USER_GROUP.STUDENT;

            let inClass = true;
            let classroomId = rs.classroom?.id || null;

            if (isPro) {
                // if (!isLogin) {
                //     return response(
                //         res,
                //         null,
                //         'Bạn không có quyền truy cập tài liệu này!',
                //         statusCode.OK
                //     );
                // }

                if (!classroomId) {
                    return response(
                        res,
                        null,
                        'Tài liệu chưa phát hành!',
                        statusCode.ERROR
                    );
                }

                const classroom = await ClassroomModel.findOne({ id: classroomId });
                if (!classroom) {
                    return response(
                        res,
                        null,
                        'Tài liệu chưa phát hành!',
                        statusCode.ERROR
                    );
                }

                inClass =
                    Array.isArray(classroom.students) &&
                    classroom.students.includes(req.user.id);

                rs.in_class = inClass;
                rs.classroom_id = classroomId;
                
                if (!inClass) {
                    rs.doc_link = null;
                      return response(
                        res,
                        rs,
                        'Bạn không có quyền truy cập tài liệu này!',
                        statusCode.OK
                    );
                }
            }

            let needPreview = false;

            if (isFree && rs.lock_type === 'SIGN_IN' && !isLogin) {
                needPreview = true;
            }
            if (
                needPreview &&
                rs.doc_type === 'PDF' &&
                rs.doc_link
            ) {
                const responsePdf = await axios.get(rs.doc_link, { responseType: 'arraybuffer' });
                const pdfDoc = await PDFDocument.load(responsePdf.data);

                const totalPages = pdfDoc.getPageCount();
                const previewPdf = await PDFDocument.create();

                for (let i = 0; i < Math.min(3, totalPages); i++) {
                    const [page] = await previewPdf.copyPages(pdfDoc, [i]);
                    previewPdf.addPage(page);
                }

                rs.preview_pdf = Buffer.from(await previewPdf.save()).toString('base64');
                rs.number_of_pages = totalPages;
                rs.doc_link = null;
            }

            if (isLogin && (!isPro || inClass) || isStudent) {
                const viewed = (parseInt(rs.viewed) || 0) + 1;
                await DocumentModel.updateOne(
                    { _id: rs.id },
                    { $set: { viewed } }
                );
            }

            return response(res, rs, 'Thành công', statusCode.OK);
        } catch (err) {
            logError(err);
            console.log(err);
            return response(res, null, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }

    async create(req, res, params) {
        try {
            const { name } = params;
            const google_name = params.google_name || null;
            const google_description = params.google_description || null;
            const url = params.url || null;
            const description = params.description || null;
            const description_file = params.description_file || null;
            const status = params.status || false;
            const main_category = params.main_category || null;
            const sub_category = params.sub_category || null;
            const document_type = params.document_type || 'FREE';
            const classroomID = params.classroom_id || null;
            const docLink = params.doc_link || null;
            const docType = params.doc_type || 'PDF';
            const lock_type = params.lock_type || 'FREE';
            // const subjectID = params.subject_id || null;
            // const classroomID = params.classroom_id || null;
            // const docLink = params.doc_link || null;
            const teacher = params.teacher || null;
            // const docType = params.doc_type || 'PDF';

            if (!name)
                return response(res, null, language.CANNOT_EMPTY.replace('%s', language.NAME), statusCode.ERROR);
            let classroom = null;
            if (classroomID && classroomID != 'null' && classroomID != undefined)
                classroom = await ClassroomModel.findOne({ _id: classroomID });

            const alias = BaseHelper.seoURL(name);
            const docChapter = {
                name: name,
                alias: alias,
                google_name: google_name,
                google_description: google_description,
                url: url,
                description: description,
                document_type: document_type,
                status: status,
                teacher: teacher,
                lock_type: lock_type,
                doc_type: docType,
                viewed: 0,
                download: 0,
                classroom: { id: classroom?.id, name: classroom?.name }
            };
            if (main_category && main_category != 'null')
                if (typeof main_category === 'string') {
                    docChapter.main_category = JSON.parse(main_category);
                } else {
                    docChapter.main_category = main_category
                };
            if (sub_category && sub_category != 'null')
                if (typeof sub_category === 'string') {
                    docChapter.sub_category = JSON.parse(sub_category);
                } else {
                    docChapter.sub_category = sub_category
                };
            if (docLink && docLink != 'null' && docType == 'GOOGLE_DRIVE' && docLink && docLink.indexOf('google.com') < 0)
                return response(res, null, 'Link tài liệu không đúng định dạng Google Drive', statusCode.ERROR);
            if (docType === 'PDF') {
                const { files } = req;
                if (files) {
                    const docFiles = Array.isArray(files) ? files.filter(f => f.fieldname === "doc_link") : (files.fieldname === "doc_link" ? [files] : []);
                    if (docFiles.length > 0) {
                        try {
                            const fileData = await UploadService.upload(docFiles, 'binary', 'documents');
                            if (fileData && fileData.length > 0) {
                                docChapter.doc_link = config.FILE_DOMAIN + '/' + fileData[0];
                                docChapter.doc_link_name = docFiles[0].originalname;
                            }
                        } catch (err) {
                            console.log(err);
                            return response(res, {}, 'Không thể tải được FILE', statusCode.ERROR);
                        }
                    }
                }
            }
            const { files } = req;
            if (files) {
                const descFiles = Array.isArray(files) ? files.filter(f => f.fieldname === "description_file") : (files.fieldname === "description_file" ? [files] : []);
                if (descFiles.length > 0) {
                    try {
                        const fileData = await UploadService.upload(descFiles, 'binary', 'documents');
                        if (fileData && fileData.length > 0) {
                            docChapter.description_file = config.FILE_DOMAIN + '/' + fileData[0];
                            docChapter.des_file_name = descFiles[0].originalname;
                        }
                    } catch (err) {
                        logError(err);
                        return response(res, {}, 'Không thể tải được FILE', statusCode.ERROR);
                    }
                }
            }

            const doc = await DocumentModel.create(docChapter);
            if (!doc)
                return response(res, {}, language.ERROR, statusCode.ERROR);
            return response(res, doc, 'Thành công', statusCode.OK);
        } catch (err) {
            logError(err);
            console.log(err);
            return response(res, {}, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }

    async update(req, res, params) {
        try {
            const id = params.id;
            const name = params.name || null;
            // const subjectID = params.subject_id || null;
            const document_type = params.document_type || null;
            const lock_type = params.lock_type || null;
            const status = params.status || false;
            const main_category = params.main_category || null;
            const sub_category = params.sub_category || null;
            const google_name = params.google_name || null;
            const google_description = params.google_description || null;
            const url = params.url || null;
            const description = params.description || null;
            const classroomID = params.classroom_id || null;
            const docLink = params.doc_link || null;
            const teacher = params.teacher || null;
            const docType = params.doc_type || 'PDF';

            if (!id)
                return response(res, null, 'Request không hợp lệ!', statusCode.ERROR);
            const doc = await DocumentModel.findOne({ _id: id });
            if (!doc)
                return response(res, {}, 'Không tồn tại tài liệu này', statusCode.ERROR);

            let classroom = null;
            if (classroomID && classroomID != 'null' && classroomID != undefined)
                classroom = await ClassroomModel.findOne({ _id: classroomID });

            if (docLink && docLink != 'null') {
                doc.doc_link = docLink;
                if (docType == 'GOOGLE_DRIVE' && docLink && docLink.indexOf('google.com') < 0)
                    return response(res, null, 'Link tài liệu không đúng định dạng Google Drive', statusCode.ERROR);
            }

            const alias = BaseHelper.seoURL(name);
            if (name) {
                doc.name = name;
                doc.alias = alias;
            }

            doc.doc_type = docType ? docType : doc.doc_type;
            doc.lock_type = lock_type ? lock_type : doc.lock_type;
            if (docType === 'PDF') {
                const { files } = req;
                if (files) {
                    const docFiles = Array.isArray(files) ? files.filter(f => f.fieldname === "doc_link") : (files.fieldname === "doc_link" ? [files] : []);
                    if (docFiles.length > 0) {
                        try {
                            const fileData = await UploadService.upload(docFiles, 'binary', 'documents');
                            console.log('docFiles', docFiles);
                            if (fileData && fileData.length > 0) {
                                doc.doc_link = config.FILE_DOMAIN + '/' + fileData[0];
                                doc.doc_link_name = docFiles[0].originalname;
                            }
                            // if (!doc.preview_pdf) {
                            //     const pdfUrl = doc.doc_link;
                            //     const responsePdf = await axios.get(pdfUrl, { responseType: 'arraybuffer' });
                            //     const pdfBytes = responsePdf.data;
                            //     const pdfDoc = await PDFDocument.load(pdfBytes);
                            //     const numberOfPages = pdfDoc.getPageCount();
                            //     const previewPdf = await PDFDocument.create();
                            //     for (let i = 0; i < Math.min(3, numberOfPages); i++) {
                            //         const [copiedPage] = await previewPdf.copyPages(pdfDoc, [i]);
                            //         previewPdf.addPage(copiedPage);
                            //     }
                            //     const previewPdfBytes = await previewPdf.save();
                            //     const previewBase64 = await Buffer.from(previewPdfBytes).toString('base64');
                            //     doc.preview_pdf = previewBase64;
                            // }
                        } catch (err) {
                            logError(err);
                            console.log(err);
                            return response(res, {}, 'Không thể tải được FILE', statusCode.ERROR);
                        }
                    }
                }
            }
            const { files } = req;
            if (files) {
                const descFiles = Array.isArray(files) ? files.filter(f => f.fieldname === "description_file") : (files.fieldname === "description_file" ? [files] : []);
                if (descFiles.length > 0) {
                    try {
                        const fileData = await UploadService.upload(descFiles, 'binary', 'documents');
                        console.log('descFiles', descFiles);
                        if (fileData && fileData.length > 0) {
                            doc.description_file = config.FILE_DOMAIN + '/' + fileData[0];
                            doc.des_file_name = descFiles[0].originalname;
                        }
                    } catch (err) {
                        logError(err);
                        return response(res, {}, 'Không thể tải được FILE', statusCode.ERROR);
                    }
                }
            }

            if (google_name)
                doc.google_name = google_name;
            if (google_description)
                doc.google_description = google_description;
            if (url)
                doc.url = url;
            if (description)
                doc.description = description;
            if (document_type)
                doc.document_type = document_type;
            doc.status = status;
            if (main_category && main_category != 'null')
                if (typeof main_category === 'string') {
                    doc.main_category = JSON.parse(main_category);
                } else {
                    doc.main_category = main_category
                };
            if (sub_category && sub_category != 'null')
                if (typeof sub_category === 'string') {
                    doc.sub_category = JSON.parse(sub_category);
                } else {
                    doc.sub_category = sub_category
                };
            if (teacher)
                doc.teacher = teacher;

            if (classroomID)
                doc.classroom = { id: classroom.id, name: classroom.name };

            const rs = await DocumentModel.updateOne({ _id: id }, doc);
            if (rs.nModified)
                return response(res, doc, 'Thành công', statusCode.OK);
            return response(res, subject, language.ERROR, statusCode.ERROR);
        } catch (err) {
            logError(err);
            console.log(err);
            return response(res, {}, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }

    async delete(req, res, params) {
        try {
            const { ids } = params || [];
            if (ids.length == 0)
                return response(res, null, 'Request không hợp lệ!', statusCode.ERROR);

            const rs = await DocumentModel.softDelete({ _id: { $in: ids } }, true);
            if (rs)
                return response(res, {}, 'Thành công', statusCode.OK);
            return response(res, null, language.ERROR, statusCode.ERROR);
        } catch (err) {
            logError(err);
            console.log(err);
            return response(res, null, language.PROCESS_ERROR, statusCode.ERROR);
        }
    }
}

module.exports = new DocumentController();
