
const mongoose = require('mongoose');
const BaseModel = require('./BaseModel');

const { Schema } = mongoose;

class Setting extends BaseModel {
    constructor() {
        const _name = 'settings';
        const attributes = {
            name: String,
            description: String,
            setting_name: String,
            setting_value: String,
            group: String
        };
        const options = {
            collection: 'settings',
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

module.exports = new Setting();
