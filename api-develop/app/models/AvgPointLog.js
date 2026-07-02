
const mongoose = require('mongoose');
const BaseModel = require('./BaseModel');

const { Schema } = mongoose;

class AvgPointLog extends BaseModel {
    constructor() {
        const _name = 'avg_point_log';
        const attributes = {
            log: String,
            key: String,
            last_updated_at: Date,
        };
        const options = {
            collection: 'avg_point_logs',
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

module.exports = new AvgPointLog();
