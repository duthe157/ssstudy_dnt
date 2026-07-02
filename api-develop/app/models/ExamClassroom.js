
const mongoose = require('mongoose');
const BaseModel = require('./BaseModel');

const { Schema } = mongoose;

const Classroom = new Schema({
    id: String,
    name: String,
    code: String
}, { _id: false });

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

class ExamClassroom extends BaseModel {
    constructor() {
        const _name = 'exam_classroom';
        const attributes = {
            type: String,
            exam_id: String,
            exam: Exam,
            subject: Subject,
            classroom: Classroom,
            status: String, // SENT, PENDING, DONE
            is_fixed_time: Boolean,
            started_at: Date,
            finished_at: Date,
            deleted_at: Date
        };
        const options = {
            collection: 'exam_classrooms',
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

module.exports = new ExamClassroom();
