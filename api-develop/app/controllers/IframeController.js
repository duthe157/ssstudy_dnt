const appConfig = require('../../config/app');
const mongoose = require('mongoose')

const IframeModel = require('../models/Iframe');
const ClassRoomModel = require('../models/Classroom');
const BaseHelper = require('../helpers/BaseHelper');
const language = BaseHelper.fileToJSON(`${__dirname}/../languages/vi.json`);

class IframeController {
    async list(req, res, params) {
        try {
            const conditions = { deleted_at: null };


            const keyword = params.keyword || false;
            const level = params.level || false;
            const subjectId = params.subject_id || false;
            const teacherId = params.teacher_id || false;
            const page = parseInt(params.page || appConfig.PAGINATION.PAGE);
            let limit = parseInt(params.limit || appConfig.PAGINATION.LIMIT);
            if (limit === 100)
                limit = 200;

            const sortKey = params.sort_key || null;
            const sortValue = params.sort_value || null;
            const options = {
                skip: (page - 1) * limit,
                limit: limit,
                sort: { ordering: 1 }
            };

            const sortKeys = [
                'btn_content',
                'width',
                'height',
                'is_show_phone',
                'is_show_school',
                'iframe',
                'updated_at'
            ];

            if (sortKey && sortKeys.indexOf(sortKey) >= 0 && (sortValue == 1 || sortValue == -1)) {
                options.sort[sortKey] = sortValue;
            }

            if (keyword) {
                conditions.btn_content = { $regex: keyword, $options: 'i' };
            }

            if (subjectId) {
                conditions['subject.id'] = subjectId;
                if (typeof subjectID === 'array' && subjectID.length > 0) {
                    conditions['subject.id'] = {
                        $in: subjectId
                    };
                }
            }
            if (level.length > 0)
                conditions.level = { $in: level };

            if (teacherId)
                conditions.teacher_id = teacherId;

            const records = await IframeModel.find(conditions, null, options);
            const total = await IframeModel.count(conditions);

            const data = {
                records,
                limit,
                totalRecord: total,
                perPage: limit
            };

            return response(res, data, 'Thành công', statusCode.OK);
        } catch (err) {
            logError(err);
            return response(res, null, 'Có lỗi xảy ra. Vui lòng thử lại!', statusCode.ERROR);
        }

    }

    async delete(req, res, params) {
        try {
            const { ids } = params || [];
            if (ids.length == 0)
                return response(res, null, 'Request không hợp lệ!', statusCode.ERROR);

            const rs = await IframeModel.softDelete({ _id: { $in: ids } }, true);
            if (rs)
                return response(res, {}, 'Thành công', statusCode.OK);
            return response(res, null, language.ERROR, statusCode.ERROR);
        } catch (err) {
            logError(err);
            return response(res, null, 'Có lỗi xảy ra. Vui lòng thử lại!', statusCode.ERROR);
        }
    }

    async detail(req, res, params) {
        try {
            const { id } = params;

            const conditions = { _id: id };
            const rs = await IframeModel.findOne(conditions);
            rs.toObject();

            return response(res, { iframe: rs}, 'Thành công', statusCode.OK);

        } catch (err) {
            logError(err);
            return response(res, null, 'Có lỗi xảy ra. Vui lòng thử lại!', statusCode.ERROR);
        }

    }

    async create(req, res, params) {
        try {
            const {
                btn_content,
                width,
                height,
                is_show_phone,
                is_show_school,
                classroom_id,
                iframe
            } = params;

            let class_id = params.classroom_id;
            const classroom = await ClassRoomModel.findOne({ _id: class_id });
            if (!classroom)
                return response(res, null, 'Khóa học này không tồn tại!', statusCode.ERROR);

            const docIframe = {
                btn_content,
                width,
                height,
                is_show_phone,
                is_show_school,
                classroom_id,
                iframe,
                teacher_id: classroom.teacher_id,
                teacher: classroom.teacher,
                subject: classroom.subject,
                level: classroom.level,
                classroom_name: classroom.name,
                classroom_alias: classroom.alias,
            };

            const iframe_rs = await IframeModel.create(docIframe);
            if (!iframe_rs)
                return response(res, {}, language.ERROR, statusCode.ERROR);

            const iframeUpdate = iframe.replace("OBJECTID", iframe_rs._id)
            const docIframeUpdate = {
                iframe: iframeUpdate
            }
            iframe_rs.iframe = iframeUpdate
            await IframeModel.updateOne({ _id: iframe_rs._id }, docIframeUpdate);

            return response(res, iframe_rs, 'Thành công', statusCode.OK);
        } catch (err) {
            logError(err);
            return response(res, null, 'Có lỗi xảy ra. Vui lòng thử lại!', statusCode.ERROR);
        }
    }

    async update(req, res, params) {
        try {
            const {
                btn_content,
                width,
                height,
                is_show_phone,
                is_show_school,
                classroom_id,
                iframe,
                id
            } = params;

            if (!id)
                return response(res, null, 'Request không hợp lệ!', statusCode.ERROR);

            let class_id = params.classroom_id;
            const classroom = await ClassRoomModel.findOne({ _id: class_id });
            if (!classroom)
                return response(res, {}, language.ITEM_NOT_EXIST.replace('%s', language.CLASSROOM), statusCode.ERROR);

            const i_check = await IframeModel.findOne({ _id: id });
            if (!i_check)
                return response(res, {}, language.ITEM_NOT_EXIST.replace('%s', 'Iframe'), statusCode.ERROR);

            const docIframe = {
                btn_content,
                width,
                height,
                is_show_phone,
                is_show_school,
                classroom_id,
                iframe,
                teacher_id: classroom.teacher_id,
                teacher: classroom.teacher,
                subject: classroom.subject,
                classroom_name: classroom.name,
                classroom_alias: classroom.alias
            };
            const rs = await IframeModel.updateOne({ _id: id }, docIframe);

            if (rs.nModified) {
                const iframe_rs = await IframeModel.findOne({ _id: id });
                return response(res, iframe_rs, 'Thành công', statusCode.OK);
            }
            return response(res, iframe_rs, language.ERROR, statusCode.ERROR);
        } catch (err) {
            logError(err);
            return response(res, null, 'Có lỗi xảy ra. Vui lòng thử lại!', statusCode.ERROR);
        }
    }

}

module.exports = new IframeController();