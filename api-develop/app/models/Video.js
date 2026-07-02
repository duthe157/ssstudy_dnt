
const mongoose = require('mongoose');
const BaseModel = require('./BaseModel');

const { Schema } = mongoose;
const ClassroomSchema = new Schema({
  id: String,
  code: String,
  name: String
}, { _id: false });

class Video extends BaseModel {
  constructor() {
    const _name = 'video';
    const attributes = {
      name: String,
      code: String,
      alias: String,
      link: String,
      type: String, // YOUTUBE, SERVER, DRIVER
      tags: [String],
      classrooms: [ClassroomSchema],
      status: Boolean,
      deleted_at: Date
    };
    const options = {
      collection: 'videos',
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

module.exports = new Video();
