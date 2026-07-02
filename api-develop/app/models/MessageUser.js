
const mongoose = require('mongoose');
const BaseModel = require('./BaseModel');

const { Schema } = mongoose;

const MessageSchema = new Schema({
    id: String,
    name: String
}, { _id: false });

const ReceiverSchema = new Schema({
    id: String,
    name: String,
    code: String
}, { _id: false });

const ClassroomSchema = new Schema({
    id: String,
    name: String,
    code: String
}, { _id: false });

class MessageUser extends BaseModel {
    constructor() {
        const _name = 'message_user';
        const attributes = {
            message: MessageSchema,
            receiver: ReceiverSchema,
            classroom: ClassroomSchema,
            is_read: Boolean,
            deleted_at: Date
        };
        const options = {
            collection: 'message_users',
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

module.exports = new MessageUser();
