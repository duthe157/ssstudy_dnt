
const mongoose = require('mongoose');
const BaseModel = require('./BaseModel');

const { Schema } = mongoose;

const CategorySchema = new Schema({
    id: String,
    name: String
}, { _id: false });

class CategoryClassroom extends BaseModel {
    constructor() {
        const _name = 'category_classroom';
        const attributes = {
            classroom_id: String,
            category: CategorySchema,
            code: String,
            chapter_id: String,
            publish_at: Date,
            ordering: Number
        };
        const options = {
            collection: 'category_classrooms',
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

module.exports = new CategoryClassroom();
