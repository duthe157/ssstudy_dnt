
const mongoose = require('mongoose');
const BaseModel = require('./BaseModel');

const { Schema } = mongoose;

class BookCategory extends BaseModel {
  constructor() {
    const _name = 'book_category';
    const attributes = {
      name: String,
      alias: String,
      is_show_home: Boolean,
      status: Boolean,
      deleted_at: Date
    };
    const options = {
      collection: 'book_categories',
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

module.exports = new BookCategory();
