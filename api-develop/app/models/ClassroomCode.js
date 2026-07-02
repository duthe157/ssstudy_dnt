
const mongoose = require('mongoose');
const BaseModel = require('./BaseModel');

const { Schema } = mongoose;

const UserSchema = new Schema({
    id: String,
    name: String,
    code: String
}, { _id: false });

const ClassroomSchema = new Schema({
    id: String,
    name: String,
    code: String
}, { _id: false });

class ClassroomCode extends BaseModel {
    constructor() {
        const _name = 'classroom_code';
        const attributes = {
            user: UserSchema,
            classroom: ClassroomSchema,
            code: String,
            is_used: Boolean,
            is_shared: {
                type: Boolean,
                default: false
            }
        };
        const options = {
            collection: 'classroom_codes',
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

module.exports = new ClassroomCode();
