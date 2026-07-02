
const mongoose = require('mongoose');
const BaseModel = require('./BaseModel');

const { Schema } = mongoose;

class ExamQuestion extends BaseModel {
    constructor() {
        const _name = 'exam_question';
        const attributes = {
            exam_id: String,
            question_id: String,
            deleted_at: Date
        };
        const options = {
            collection: 'exam_questions',
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

module.exports = new ExamQuestion();
