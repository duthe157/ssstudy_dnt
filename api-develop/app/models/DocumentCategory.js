
const mongoose = require('mongoose');
const BaseModel = require('./BaseModel');

const { Schema } = mongoose;

const SubCategorySchema = new Schema({
  id: String,
  status: Boolean,
  name: String,
  deleted_at: Date
}, { _id: false });

class DocumentCategory extends BaseModel {
  constructor() {
    const _name = 'document_category';
    const attributes = {
      name: String,
      alias: String,
      google_name: String,
      google_description: String,
      url: String,
      ordering: String,
      status: Boolean,
      sub_categories: [SubCategorySchema],
      deleted_at: Date
    };
    const options = {
      collection: 'document_categories',
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

module.exports = new DocumentCategory();
