
const mongoose = require('mongoose');
const BaseModel = require('./BaseModel');

const { Schema } = mongoose;

const UserSchema = new Schema({
    id: String,
    name: String,
    code: String
}, { _id: false });

const ClassroomSchema = new Schema({
    id: String,
    name: String,
    code: String
}, { _id: false });

class StudentClassroom extends BaseModel {
    constructor() {
        const _name = 'user_classroom';
        const attributes = {
            user: UserSchema,
            classroom: ClassroomSchema,
            rank: Number,
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
            deleted_at: Date
        };
        const options = {
            collection: 'user_classrooms',
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

module.exports = new StudentClassroom();
