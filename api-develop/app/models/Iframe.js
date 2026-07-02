
const mongoose = require('mongoose');
const BaseModel = require('./BaseModel');

const { Schema } = mongoose;

const Subject = new Schema({
    id: String,
    name: String
}, { _id: false });


class Iframe extends BaseModel {
    constructor() {
        const _name = 'iframe';
        const attributes = {
            btn_content: String,
            width: Number,
            height: Number,
            is_show_phone: Boolean,
            is_show_school: Boolean,
            iframe: String,
            subject: Subject,
            teacher_id: String,
            teacher: String,
            classroom_id: String,
            classroom_name: String,
            level: String,
            deleted_at: Date,
            classroom_alias: String,
        };
        const options = {
            collection: 'iframes',
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

module.exports = new Iframe();
