
const mongoose = require('mongoose');
const BaseModel = require('./BaseModel');

const { Schema } = mongoose;

class PostCategory extends BaseModel {
    constructor() {
        const _name = 'post_category';
        const attributes = {
            name: String,
            alias: String,
            content: String,
            status: Boolean,
            ordering: Number,
            deleted_at: Date
        };
        const options = {
            collection: 'post_categories',
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

module.exports = new PostCategory();
