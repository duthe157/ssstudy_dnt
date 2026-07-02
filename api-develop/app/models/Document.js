
const mongoose = require('mongoose');
const BaseModel = require('./BaseModel');

const { Schema } = mongoose;

const CategorySchema = new Schema({
    id: String,
    name: String
}, { _id: false });

const ClassroomSchema = new Schema({
    id: String,
    name: String
}, { _id: false });


class Document extends BaseModel {
    constructor() {
        const _name = 'document';
        const attributes = {
            name: String,
            alias: String,
            google_name: String,
            google_description: String,
            url: String,
            description: String,
            description_file: String,
            des_file_name: String,
            status: Boolean,
            doc_link: String,
            lock_type: { type: String, enum: ['FREE', 'SIGN_IN'] },
            doc_link_name: String,
            doc_type: { type: String, enum: ['PDF', 'GOOGLE_DRIVE'] },
            main_category: CategorySchema,
            sub_category: CategorySchema,
            document_type: { type: String, enum: ['FREE', 'PRO'] },
            classroom: ClassroomSchema,
            viewed: Number,
            download: Number,
            teacher: String,
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
