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

const RenewedBookId = new Schema({
  expired_time: Number,
  number_of_renewal: Number,
  price_renewal: Number,
  can_renewal_after: Number
}, { _id: false });

class BookId extends BaseModel {
  constructor() {
    const _name = 'book_id';
    const attributes = {

      combo_mode: Boolean,
      book_id: String,

      name: String,
      alias: String,

      code: String,
      category: Category,
      subject: Subject,

      classroom_attached: [String],
      bookId_attached: [String],

      renewed_bookId: RenewedBookId,
      publish_mode: Boolean,
      publish_end_date: Date,

      level: String,
      teacher_id: String,
      teacher: String,
      image: String,
      demo_link: String,
      ordering: Number,
      origin_price: Number,
      price: Number,
      stock_status: String,
      description: String,
      content: String,
      status: Boolean,
      promotion: Promotion,
      is_featured: Boolean,
      deleted_at: Date,
      suspension_date: Date,
      student_owned: Number,
      quantity: Number,
      highlightInformations: Object,
      includes: Object
    };
    const options = {
      collection: 'book_ids',
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

module.exports = new BookId();
