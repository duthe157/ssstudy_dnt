const mongoose = require('mongoose');

const BaseModel = require('./BaseModel');

const { Schema } = mongoose;

const UserSchema = new Schema({
    id: String,
    code: String
}, { _id: false });

const ExamSchema = new Schema({
    id: String,
    code: String,
    fullname: String
}, { _id: false });

const ClassroomSchema = new Schema({
    id: String,
    code: String
}, { _id: false });

const SubjectSchema = new Schema({
    id: String,
    code: String
}, { _id: false });

const TestingSchema = new Schema({
    id: String,
    code: Number
}, { _id: false });

class PointLog extends BaseModel {
    constructor() {
        const _name = 'point_log';
        const attributes = {
            testing: TestingSchema,
            user: UserSchema,
            exam: ExamSchema,
            subject: SubjectSchema,
            classroom: ClassroomSchema,
            point: Number,
            action: String, // PLUS, MINUS
            type: String, // EXAM_ONLINE, HOME_EXAM
        };
        const options = {
            collection: 'point_logs',
            timestamps: {
                createdAt: 'created_at',
                updatedAt: 'updated_at'
            },
            versionKey: false
        };

        super(_name, attributes, options);
    }
}

module.exports = new PointLog();
