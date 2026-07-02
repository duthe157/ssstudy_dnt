
const mongoose = require('mongoose');
const BaseModel = require('./BaseModel');

const { Schema } = mongoose;

const UserSchema = new Schema({
    id: String,
    name: String,
    code: String
}, { _id: false });
const BookIdSchema = new Schema({
    id: String,
    name: String,
    code: String
}, { _id: false });

class StudentBookId extends BaseModel {
    constructor() {
        const _name = 'user_book_id';
        const attributes = {
            user: UserSchema,
            bookIdCourse: BookIdSchema,
            rank: Number,
            status: Boolean,
            total_testing: Number,
            total_testing_sent: Number, 
            avg_point: Number,
            sobuoihoc: Number,
            buoidahoc: Number,
            last_sbh: Number,
            lesson_view_dates: String,
            last_billing_id: String,
            last_card_updated_at: Date,
            joined_at: Date,
            exprired_date: Date,
            activation_date: Date,
            exprired_time: Number,
            total_extended_months: Number,
            extend_times : Number,
            deleted_at: Date
        };
        const options = {
            collection: 'user_book_ids',
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

module.exports = new StudentBookId();
