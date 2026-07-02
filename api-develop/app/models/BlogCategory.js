
const mongoose = require('mongoose');
const BaseModel = require('./BaseModel');

const { Schema } = mongoose;

class BlogCategory extends BaseModel {
  constructor() {
    const _name = 'blog_category';
    const attributes = {
      name: String,
      alias: String,
      status: Boolean,
      is_featured: Boolean,
      deleted_at: Date
    };
    const options = {
      collection: 'blog_categories',
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

module.exports = new BlogCategory();
