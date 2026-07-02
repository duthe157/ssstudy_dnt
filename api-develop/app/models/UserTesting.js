
const mongoose = require('mongoose');
const BaseModel = require('./BaseModel');

const { Schema } = mongoose;

class UserTesting extends BaseModel {
    constructor() {
        const _name = 'user_testing';
        const attributes = {
            user_id: String,
            exam_ids: [String]
        };
        const options = {
            collection: 'user_testings',
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

module.exports = new UserTesting();
