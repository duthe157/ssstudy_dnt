
const mongoose = require('mongoose');
const BaseModel = require('./BaseModel');

const { Schema } = mongoose;

const Exam = new Schema({
    id: String,
    name: String
}, { _id: false });

class CategoryExam extends BaseModel {
    constructor() {
        const _name = 'category_exam';
        const attributes = {
            classroom_id: String,
            category_id: String,
            exam: Exam,
            publish_at: Date,
            ordering: Number
        };
        const options = {
            collection: 'category_exams',
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

module.exports = new CategoryExam();
