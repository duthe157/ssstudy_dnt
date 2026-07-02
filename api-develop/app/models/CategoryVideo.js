
const mongoose = require('mongoose');
const BaseModel = require('./BaseModel');

const { Schema } = mongoose;

class CategoryVideo extends BaseModel {
  constructor() {
    const _name = 'category_video';
    const attributes = {
      name: String,
      alias: String,
      link: String,
      type: String, // YOUTUBE, SERVER, DRIVER
      category_id: String,
      duration: Number,
      ordering: Number,
      deleted_at: Date
    };
    const options = {
      collection: 'category_videos',
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

module.exports = new CategoryVideo();
