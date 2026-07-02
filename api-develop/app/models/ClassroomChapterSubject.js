
const mongoose = require('mongoose');
const BaseModel = require('./BaseModel');

const { Schema } = mongoose;

class ClassroomChapterSubject extends BaseModel {
    constructor() {
        const _name = 'classroom_chapter_subject';
        const attributes = {
            classroom_id: String,
            chapter_id: String,
            subject_id: String,
        };
        const options = {
            collection: 'classroom_chapter_subject',
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

module.exports = new ClassroomChapterSubject();
