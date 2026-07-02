
const mongoose = require('mongoose');
const BaseModel = require('./BaseModel');

const { Schema } = mongoose;

const Subject = new Schema({
    id: String,
    name: String
}, { _id: false });

class DownloadDoc extends BaseModel {
    constructor() {
        const _name = 'download_doc';
        const attributes = {
            name: String,
            alias: String,
            level: String,
            subject: Subject,
            viewed: Number,
            doc_link: String,
            doc_type: String,
            teacher: String,
            deleted_at: Date
        };
        const options = {
            collection: 'download_docs',
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

module.exports = new DownloadDoc();
