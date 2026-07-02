
const mongoose = require('mongoose');
const BaseModel = require('./BaseModel');

const { Schema } = mongoose;

const UserInfoSchema = new Schema({
    id: String,
    fullname: String,
    email: String,
    user_group: String,
    code: String
}, { _id: false });

class ActionLog extends BaseModel {
    constructor() {
        const _name = 'action_log';
        const attributes = {
            user_id: String,
            user_info: UserInfoSchema,
            action_time: { type: Date, default: Date.now },
            url: String,
            method: String,
            ip_address: String,
            user_agent: String,
            request_body: Schema.Types.Mixed,
            response_status: Number,
            note: String,
        };
        const options = {
            collection: 'action_logs',
            timestamps: {
                createdAt: 'created_at',
                updatedAt: 'updated_at'
            },
            versionKey: false
        };
        const schema = Schema(attributes, options);

        // Create indexes for better query performance
        schema.index({ user_id: 1, action_time: -1 });
        schema.index({ action_time: -1 });
        schema.index({ url: 1 });
        schema.index({ 'user_info.user_group': 1 });

        super(_name, attributes, options, schema);
    }
}

module.exports = new ActionLog();
