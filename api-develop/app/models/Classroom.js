const mongoose = require('mongoose');
const BaseModel = require('./BaseModel');
const { description } = require('joi/lib/types/lazy');

const { Schema } = mongoose;

const Subject = new Schema({
    id: String,
    name: String
}, { _id: false });

const Group = new Schema({
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

const TimeCourse = new Schema({
    opening_date: Date,
    closing_date: Date,
}, { _id: false })

class Classroom extends BaseModel {
    constructor() {
        const _name = 'classroom';
        const attributes = {
            name: String,
            alias: String,
            code: String,
            subject: Subject,
            group: Group,
            classroom_relates: [String],
            classroom_attached: [String],
            book_relates: [String],
            book_attached: [String],
            level: String,
            video_intro: String,
            banner: String,
            image: String,
            content: String,
            room: String,
            teacher: String,
            teacher_alias: String,
            teacher_id: String,
            status: Boolean,
            tuition_per_day: Number,
            hp_day: Number, //HP/ngay va phai dong theo thang
            hp_1month_day: Number,
            hp_3month_day: Number,
            hp_6month_day: Number,
            hp_12month_day: Number,
            is_cadup: Boolean,
            is_auto_diff_day: Boolean,
            num_student: Number,
            classroom_avg_point: Number,
            student_avg_point: Number,
            student_num_testing: Number,
            note: String,
            description: String,
            price: Number,
            origin_price: Number,
            extra_number_student: Number,
            is_online: Boolean,
            link_fb_page: String,
            link_fb_group: String,
            enable_stats: Boolean,
            cart_category_id: String,
            is_featured: Boolean,
            is_public_exam: Boolean,
            promotion: Promotion,
            highlightInformations: Object,
            includes: Object,
            ordering: Number,
            student_owned: Number,
            rating: Number,
            deleted_at: Date,
            time_course: TimeCourse,
            group_chapter: Object

        };
        const options = {
            collection: 'classrooms',
            timestamps: {
                createdAt: 'created_at',
                updatedAt: 'updated_at'
            },
            versionKey: false
        };

        super(_name, attributes, options);
    }
}

module.exports = new Classroom();

