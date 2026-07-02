
const mongoose = require('mongoose');
const BaseModel = require('./BaseModel');

const { Schema } = mongoose;

const Category = new Schema({
    id: String,
    name: String
}, { _id: false });

class BlogPost extends BaseModel {
    constructor() {
        const _name = 'blog_post';
        const attributes = {
            name: String,
            alias: String,
            description: String,
            content:String,
            image: String,
            category: Category,
            external_link: String,
            status: Boolean,
            level: String,
            subject_id: String,
            view_count: String,
            is_featured: Boolean,
            deleted_at: Date
        };
        const options = {
            collection: 'blog_posts',
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

module.exports = new BlogPost();
