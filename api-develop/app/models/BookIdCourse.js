const mongoose = require('mongoose');
const BaseModel = require('./BaseModel');

const { Schema } = mongoose;

const Subject = new Schema({
    id: String,
    name: String
}, { _id: false });

const Promotion = new Schema({
    type: String,
    from_date: Date,
    to_date: Date,
    hour: Number,
    note: String
}, { _id: false });

class BookIdCourse extends BaseModel {
    constructor() {
        const _name = 'book_id_course';
        const attributes = {
            name: String,
            alias: String,
            code: String,
            subject: Subject,
            level: String,
            video_intro: String,
            image: String,
            group_id: String,   
            content: String,
            teacher_id: String,
            num_student: Number,
            classroom_avg_point: Number,
            student_avg_point: Number,
            student_num_testing: Number,
            note: String,
            description: String,
            extra_number_student: Number,
            enable_stats: Boolean,
            cart_category_id: String,
            promotion: Promotion,
            highlightInformations: Object,
            includes: Object,
            deleted_at: Date,
            group_chapter: Object

        };
        const options = {
            collection: 'book_id_courses',
            timestamps: {
                createdAt: 'created_at',
                updatedAt: 'updated_at'
            },
            versionKey: false
        };

        super(_name, attributes, options);
    }
}

module.exports = new BookIdCourse();

