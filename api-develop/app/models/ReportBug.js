const mongoose = require('mongoose');
const BaseModel = require('./BaseModel');

const { Schema } = mongoose;

const User = new Schema({
    id: String,
    name: String
}, { _id: false });

const Classroom = new Schema({
    id: String,
    name: String
}, { _id: false });

const Subject = new Schema({
    id: String,
    name: String
}, { _id: false });

class ReportBug extends BaseModel {
    constructor() {
        const _name = 'report_bug';
        const attributes = {
            code: String,
            content: String,
            user: User,
            subject: Subject,
            classroom: Classroom,
            status: String,
            object_type: String,// CATEGORY_VIDEO, QUESTION
            object_id: String,
            deleted_at: Date
        };
        const options = {
            collection: 'report_bugs',
            timestamps: {
                createdAt: 'created_at',
                updatedAt: 'updated_at'
            },
            versionKey: false
        };

        super(_name, attributes, options);
    }
}

module.exports = new ReportBug();
