
const mongoose = require('mongoose');
const BaseModel = require('./BaseModel');

const { Schema } = mongoose;

class Tag extends BaseModel {
  constructor() {
    const _name = 'tag';
    const attributes = {
      name: String,
      alias: String,
      num_item: Number,
      position: Number,
      type: String // VIDEO, QUESTION
    };
    const options = {
      collection: 'tags',
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

module.exports = new Tag();
