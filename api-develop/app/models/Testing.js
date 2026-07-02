
const mongoose = require('mongoose');
const BaseModel = require('./BaseModel');

const { Schema } = mongoose;

const TesingItemSchema = new Schema({
  question_id: String,
  value: String
}, { _id: false });

const UserSchema = new Schema({
  id: String,
  code: String,
  name: String
}, { _id: false });

const ExamSchema = new Schema({
  id: String,
  code: String,
  name: String,
}, { _id: false });

const SubjectSchema = new Schema({
  id: String,
  code: String,
  name: String
}, { _id: false });

const ClassroomSchema = new Schema({
  id: String,
  code: String,
  name: String
}, { _id: false });

class Testing extends BaseModel {
  constructor() {
    const _name = 'testing';
    const attributes = {
      code: Number,
      type: String,
      group: String, // THI_THU, MAC_DINH
      exam: ExamSchema,
      classroom: ClassroomSchema,
      user: UserSchema,
      subject: SubjectSchema,
      questions: [String],
      answers: [TesingItemSchema],
      answer_files: [String],
      num_right: Number,
      num_wrong: Number,
      point: Number,
      comment:String,
      status: String,
      started_at: Date,
      finished_at: Date,
      user_started_at: Date,
      user_time: Number,
      deleted_at: Date
    };
    const options = {
      collection: 'testings',
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

module.exports = new Testing();
