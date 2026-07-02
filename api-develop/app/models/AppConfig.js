const mongoose = require('mongoose');

const BaseModel = require('./BaseModel');

const { Schema } = mongoose;

class AppConfig extends BaseModel {
    constructor() {
        const _name = 'app_config';
        const attributes = {
            key: String,
            value: String,
        };
        const options = {
            collection: 'app_configs',
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

module.exports = new AppConfig();
