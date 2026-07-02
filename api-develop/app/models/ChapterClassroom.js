
const mongoose = require('mongoose');
const BaseModel = require('./BaseModel');

const { Schema } = mongoose;

const ChapterSchema = new Schema({
    id: String,
    name: String
}, { _id: false });

class ChapterClassroom extends BaseModel {
    constructor() {
        const _name = 'chapter_classroom';
        const attributes = {
            classroom_id: String,
            chapter: ChapterSchema,
            code:String,
            category: [Object],
            ordering: Number,
            selected_subject_id: String,
            group_id: Number
        };
        const options = {
            collection: 'chapter_classrooms',
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

module.exports = new ChapterClassroom();
