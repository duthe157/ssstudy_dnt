const mongoose = require('mongoose');
const BaseModel = require('./BaseModel');

const { Schema } = mongoose;

class QuestionV2Report extends BaseModel {
    constructor() {
        const _name = 'question_v2_report';
        const attributes = {
            exam_id: String,
            question_id: String,
            question_code: String,
            classroom_id: String,
            total_right: Number,
            total_wrong: Number
        };
        const options = {
            collection: 'question_v2_reports',
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

module.exports = new QuestionV2Report();
