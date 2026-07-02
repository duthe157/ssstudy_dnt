const mongoose = require('mongoose');
const BaseModel = require('./BaseModel');

const { Schema } = mongoose;

class LabelItem extends BaseModel {
  constructor() {
    const _name = 'label_item';
    const attributes = {
      label_id: { type: String, required: true },
      item_id: { type: String, required: true },
      item_type: {
        type: String,
        enum: ['BOOK', 'BOOK_ID', 'CLASSROOM'],
        required: true
      }
    };
    const options = {
      collection: 'label_items',
      timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
      },
      versionKey: false
    };
    const schema = new Schema(attributes, options);

    // Index để tăng tốc truy vấn 2 chiều
    schema.index({ label_id: 1, item_type: 1 });
    schema.index({ item_id: 1, item_type: 1 });
    // Đảm bảo mỗi cặp (label_id, item_id, item_type) là duy nhất
    schema.index({ label_id: 1, item_id: 1, item_type: 1 }, { unique: true });

    super(_name, attributes, options, schema);
  }
}

module.exports = new LabelItem();
