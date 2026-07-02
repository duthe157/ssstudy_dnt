
const mongoose = require('mongoose');
const BaseModel = require('./BaseModel');

const { Schema } = mongoose;

class LessonUserCompleted extends BaseModel {
    constructor() {
        const _name = 'lesson_user_completed';
        const attributes = {
            lesson_id: String,
            user_id: String
        };
        const options = {
            collection: 'lesson_user_completed',
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

module.exports = new LessonUserCompleted();
