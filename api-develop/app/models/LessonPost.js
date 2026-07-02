
const mongoose = require('mongoose');
const BaseModel = require('./BaseModel');

const { Schema } = mongoose;

const Subject = new Schema({
    id: String,
    name: String
}, { _id: false });

class Document extends BaseModel {
    constructor() {
        const _name = 'document';
        const attributes = {
            name: String,
            alias: String,
            level: String,
            subject: Subject,
            viewed: Number,
            doc_link: String,
            doc_type: String,
            teacher: String,
            type: String,
            description: String,
            content: String,
            deleted_at: Date
        };
        const options = {
            collection: 'documents',
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

module.exports = new Document();
