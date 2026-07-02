
const mongoose = require('mongoose');
const BaseModel = require('./BaseModel');

const { Schema } = mongoose;

const ChapterSchema = new Schema({
    id: String,
    name: String
}, { _id: false });

const SubjectSchema = new Schema({
    id: String,
    name: String
}, { _id: false });

const Examchema = new Schema({
    id: String,
    name: String,
    type: String,
    code: String
}, { _id: false });

class Category extends BaseModel {
    constructor() {
        const _name = 'category';
        const attributes = {
            code: String,
            name: String,
            alias: String,
            subject: SubjectSchema,
            chapter: ChapterSchema,
            exam: [Examchema],
            classroom_ids: [String],
            content: String,
            video_link: String,
            total_video_time: Number,
            is_free: Boolean,
            free_started_ad: Date,
            free_finished_at: Date,
            doc_link: String,
            exam_doc_link_1: String,
            exam_doc_link_2: String,
            show_doc_btn: Boolean,
            show_exam_btn: Boolean,
            show_video_btn: Boolean,
            publish_at: Date,
            ordering: Number,
            deleted_at: Date,
            livestream_btn: Boolean,
            start_date_time_live: Date,
            livestreams: [Object],
            exam_id: String
        };
        const options = {
            collection: 'categories',
            timestamps: {
                createdAt: 'created_at',
                updatedAt: 'updated_at'
            },
            versionKey: false
        };
        const schema = Schema(attributes, options);
        super(_name, attributes, options, schema);
    }
}

module.exports = new Category();
