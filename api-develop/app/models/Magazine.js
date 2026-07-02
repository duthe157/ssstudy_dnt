
const mongoose = require('mongoose');
const BaseModel = require('./BaseModel');

const { Schema } = mongoose;

class Magazine extends BaseModel {
    constructor() {
        const _name = 'magazine';
        const attributes = {
            name: String,
            alias: String,
            description: String,
            content:String,
            image: String,
            external_link: String,
            status: Boolean,
            deleted_at: Date
        };
        const options = {
            collection: 'magazines',
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

module.exports = new Magazine();
