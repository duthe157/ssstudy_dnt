const mongoose = require('mongoose');
const BaseModel = require('./BaseModel');

const { Schema } = mongoose;
const ConfigSchema = new Schema({
    send_type: String, // ALL, CLASSROOM, USER
    object_id: [String]
}, { _id: false });

const Button = new Schema({
    title: String,
    link: String
}, { _id: false });

class Message extends BaseModel {
    constructor() {
        const _name = 'message';
        const attributes = {
            name: String,
            content: String,
            group: String, // HOCPHI, BAITAP,...
            configs: ConfigSchema,
            platform: String, // ONESIGNAL, FIREBASE
            platform_msg_id: String,
            app_url: String,
            web_url: String,
            buttons: [Button],
            status: String, // SENT, PENDING
            deleted_at: Date
        };
        const options = {
            collection: 'messages',
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

module.exports = new Message();
