
const mongoose = require('mongoose');
const BaseModel = require('./BaseModel');

const { Schema } = mongoose;

class CategoryVideoViewer extends BaseModel {
    constructor() {
        const _name = 'category_video_viewer';
        const attributes = {
            category_video_id: String,
            user_id: String,
            num_view: Number,
            type: String
        };
        const options = {
            collection: 'category_video_viewers',
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

module.exports = new CategoryVideoViewer();
