
const mongoose = require('mongoose');
const BaseModel = require('./BaseModel');

const { Schema } = mongoose;

class CategoryLivestream extends BaseModel {
  constructor() {
    const _name = 'category_livestream';
    const attributes = {
      name: String,
      alias: String,
      room_link: String,
      category_id: String,
      ordering: Number,
      users: [String],
      deleted_at: Date
    };
    const options = {
      collection: 'category_livestreams',
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

module.exports = new CategoryLivestream();
