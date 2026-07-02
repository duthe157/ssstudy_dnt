const mongoose = require('mongoose');
const BaseModel = require('./BaseModel');

const { Schema } = mongoose;

const Teacher = new Schema({
    id: String,
    name: String
}, { _id: false });

const Supporter = new Schema({
    id: String,
    name: String
}, { _id: false });

class Subject extends BaseModel {
    constructor() {
        const _name = 'subject';
        const attributes = {
            name: String,
            alias: String,
            code: String,
            teacher: Teacher,
            supporter: Supporter,
            support_fb_link: String,
            classification: {
                type: String,
                enum: ["XA_HOI", "TU_NHIEN", "KHONG_XAC_DINH"],
                required: true,
            },
            ordering: Number,
            is_online: Boolean,
            icon: String,
            status: Boolean,
            deleted_at: Date
        };
        const options = {
            collection: 'subjects',
            timestamps: {
                createdAt: 'created_at',
                updatedAt: 'updated_at',
                deletedAt: 'deleted_at'
            },
            versionKey: false
        };

        super(_name, attributes, options);
    }
}

module.exports = new Subject();
