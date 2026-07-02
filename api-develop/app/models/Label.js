const mongoose = require('mongoose');
const BaseModel = require('./BaseModel');

const { Schema } = mongoose;

class Label extends BaseModel {
  constructor() {
    const _name = 'label';
    const attributes = {
      name: { type: String, required: true },
      alias: String,
      parent_id: { type: String, default: null },
      status: {
        type: String,
        enum: ['ACTIVE', 'HIDDEN', 'DELETED'],
        default: 'ACTIVE'
      },
      is_primary: { type: Boolean, default: false },
      ordering: { type: Number, default: 0 },
      num_item: { type: Number, default: 0 },
      deleted_at: { type: Date, default: null }
    };
    const options = {
      collection: 'labels',
      timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
      },
      versionKey: false
    };
    const schema = new Schema(attributes, options);

    super(_name, attributes, options, schema);
  }
}

module.exports = new Label();
