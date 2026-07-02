
const mongoose = require('mongoose');
const BaseModel = require('./BaseModel');

const { Schema } = mongoose;

const Subject = new Schema({
    _id: false,
    id: String,
    name: String
});

class ClassroomGroup extends BaseModel {
    constructor() {
        const _name = 'classroom_group';
        const attributes = {
            name: String,
            alias: String,
            subject: Subject,
            image: String,
            banner: String,
            content: String,
            ordering: Number,
            status: Boolean,
            is_show_home: Boolean,
            is_show_menu: Boolean,
            show_on_cart: Boolean,
            deleted_at: Date
        };
        const options = {
            collection: 'classroom_groups',
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

module.exports = new ClassroomGroup();
