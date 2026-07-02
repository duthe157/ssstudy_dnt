
const mongoose = require('mongoose');
const BaseModel = require('./BaseModel');

const { Schema } = mongoose;

const UserSchema = new Schema({
    id: String,
    name: String,
    code: String
}, { _id: false });

const BookIdSchema = new Schema({
    id: String,
    name: String,
    code: String
}, { _id: false });

class BookIdCode extends BaseModel {
    constructor() {
        const _name = 'book_id_code';
        const attributes = {
            user: UserSchema,
            bookIdCourse: BookIdSchema,
            code: String,
            activation_date: Date,
            exprired_date: Date,
            created_by: UserSchema,
            is_used: Boolean
        };
        const options = {
            collection: 'book_id_codes',
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

module.exports = new BookIdCode();
