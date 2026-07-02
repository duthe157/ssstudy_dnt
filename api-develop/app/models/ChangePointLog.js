
const mongoose = require('mongoose');
const BaseModel = require('./BaseModel');

const { Schema } = mongoose;


class ChangePointLog extends BaseModel {
    constructor() {
        const _name = 'change_point_log';
        const attributes = {
            question_id: String,
            question_code: String,
            old_answer: String,
            new_answer: String,
            num: Number
        };
        const options = {
            collection: 'change_point_logs',
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

module.exports = new ChangePointLog();
