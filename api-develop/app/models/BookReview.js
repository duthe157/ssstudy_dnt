
const mongoose = require('mongoose');
const BaseModel = require('./BaseModel');

const { Schema } = mongoose;

const Book = new Schema({
    id: String,
    name: String
  }, { _id: false });

class BookReview extends BaseModel {
    constructor() {
        const _name = 'book_review';
        const attributes = {
            name: String,
            avatar: String,
            comment: String,
            alias: String,
            rating: Number,
            book_id: String,// ssstudyv3 -  Xử lý tên sách,
            book: Book,
            status: Boolean,
            deleted_at: Date
        };
        const options = {
            collection: 'book_reviews',
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

module.exports = new BookReview();
