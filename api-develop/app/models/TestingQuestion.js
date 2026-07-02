
const mongoose = require('mongoose');
const BaseModel = require('./BaseModel');

const { Schema } = mongoose;

class TestingQuestion extends BaseModel {
    constructor() {
        const _name = 'testing_question';
        const attributes = {
            exam_id: String,
            question_id: String,
            question_code: String,
            classroom_id: String,
            total_right: Number,
            total_wrong: Number
        };
        const options = {
            collection: 'testing_questions',
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

module.exports = new TestingQuestion();
