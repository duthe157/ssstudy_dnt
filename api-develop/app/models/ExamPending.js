
const mongoose = require('mongoose');
const BaseModel = require('./BaseModel');

const { Schema } = mongoose;

const Exam = new Schema({
    id: String,
    code: String,
    name: String,
}, { _id: false });

const Subject = new Schema({
    id: String,
    code: String,
    name: String
}, { _id: false });

const Classroom = new Schema({
    id: String,
    code: String,
    name: String
}, { _id: false });

class ExamPending extends BaseModel {
    constructor() {
        const _name = 'exam_pending';
        const attributes = {
            type: String,
            is_fixed_time: Boolean,
            exam: Exam,
            classroom: Classroom,
            subject: Subject,
            started_at: Date,
            finished_at: Date,
            is_redo: Boolean,
            deleted_at: Date
        };
        const options = {
            collection: 'exam_pendings',
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

module.exports = new ExamPending();
