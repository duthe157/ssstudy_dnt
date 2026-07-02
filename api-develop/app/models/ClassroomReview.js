
const mongoose = require('mongoose');
const BaseModel = require('./BaseModel');

const { Schema } = mongoose;

const Classroom = new Schema({
    id: String,
    name: String
}, { _id: false });

class ClassromReview extends BaseModel {
    constructor() {
        const _name = 'classroom_review';
        const attributes = {
            name: String,
            avatar: String,
            comment: String,
            rating: Number,
            classroom: Classroom,
            status: Boolean,
            deleted_at: Date
        };
        const options = {
            collection: 'classroom_reviews',
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

module.exports = new ClassromReview();
