
const mongoose = require('mongoose');
const BaseModel = require('./BaseModel');

const { Schema } = mongoose;

class LessonVideoUserLimit extends BaseModel {
    constructor() {
        const _name = 'lesson_video_user_limit';
        const attributes = {
            lesson_video_id: String,
            user_id: String,
            total_view: Number
        };
        const options = {
            collection: 'lesson_video_user_limits',
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

module.exports = new LessonVideoUserLimit();
