
const mongoose = require('mongoose');
const BaseModel = require('./BaseModel');

const { Schema } = mongoose;

const UserSchema = new Schema({
  id: String,
  code: String
}, { _id: false });

const VideoSchema = new Schema({
  id: String,
  code: String
}, { _id: false });

class VideoUserLog extends BaseModel {
  constructor() {
    const _name = 'video_user_log';
    const attributes = {
      user: UserSchema,
      video: VideoSchema,
      total_view: Number
    };
    const options = {
      collection: 'video_user_logs',
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

module.exports = new VideoUserLog();
