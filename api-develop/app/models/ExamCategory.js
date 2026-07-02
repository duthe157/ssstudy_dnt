
const mongoose = require('mongoose');
const BaseModel = require('./BaseModel');

const { Schema } = mongoose;

class ExamCategory extends BaseModel {
  constructor() {
    const _name = 'exam_category';
    const attributes = {
      name: String,
      alias: String,
      type: {
        type: String,
        enum: ['DEFAULT', 'WORD'],
        default: 'DEFAULT'
      },
      status: Boolean,
      deleted_at: Date
    };
    const options = {
      collection: 'exam_categories',
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

module.exports = new ExamCategory();
