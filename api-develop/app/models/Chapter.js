
const mongoose = require('mongoose');
const BaseModel = require('./BaseModel');

const { Schema } = mongoose;

const SubjectSchema = new Schema({
    id: String,
    name: String
}, { _id: false });

class Chapter extends BaseModel {
    constructor() {
        const _name = 'chapter';
        const attributes = {
            code: String,
            name: String,
            alias: String,
            level: String,
            subject: SubjectSchema,
            classroom_ids: [String],
            status: Boolean,
            ordering: Number,
            deleted_at: Date
        };
        const options = {
            collection: 'chapters',
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

module.exports = new Chapter();
