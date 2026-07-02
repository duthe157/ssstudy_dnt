const mongoose = require('mongoose');
const BaseModel = require('./BaseModel');

const { Schema } = mongoose;

const Subject = new Schema({
  id: String,
  name: String
}, { _id: false });

const Category = new Schema({
  id: String,
  name: String
}, { _id: false });

const Promotion = new Schema({
  type: String,
  from_date: Date,
  to_date: Date,
  hour: Number,
  note: String
}, { _id: false });
class Book extends BaseModel {
  constructor() {
    const _name = 'book';
    const attributes = {
      name: String,
      alias: String,
      type: String,
      code: String,
      category: Category,
      subject: Subject,
      classroom_relates: [String],
      book_relates: [String],
      classroom_attached: [String],
      level: String,
      teacher_id: String,
      teacher: String,
      image: String,
      external_link: String,
      ordering: Number,
      origin_price: Number,
      price: Number,
      stock_status: String,
      description: String,
      content: String,
      status: Boolean,
      rating: Number,
      promotion: Promotion,
      is_featured: Boolean,
      deleted_at: Date,
      student_owned: Number,
      quantity: Number,
      highlightInformations: Object,
      includes: Object
    };
    const options = {
      collection: 'books',
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

module.exports = new Book();
