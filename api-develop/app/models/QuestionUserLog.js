
const mongoose = require('mongoose');
const BaseModel = require('./BaseModel');

const { Schema } = mongoose;

const UserSchema = new Schema({
  id: String,
  code: String
}, { _id: false });

const QuestionSchema = new Schema({
  id: String,
  code: String
}, { _id: false });

class QuestionUserLog extends BaseModel {
  constructor() {
    const _name = 'question_user_log';
    const attributes = {
      user: UserSchema,
      question: QuestionSchema,
      total_view: Number
    };
    const options = {
      collection: 'question_user_logs',
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

module.exports = new QuestionUserLog();
