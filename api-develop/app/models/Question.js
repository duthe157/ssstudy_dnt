
const mongoose = require('mongoose');
const BaseModel = require('./BaseModel');

const { Schema } = mongoose;

const ChapterSchema = new Schema({
  id: String,
  name: String
}, { _id: false });

const CategorySchema = new Schema({
  id: String,
  name: String
}, { _id: false });

const SubjectSchema = new Schema({
  id: String,
  name: String
}, { _id: false });

const ClassroomSchema = new Schema({
  id: String,
  name: String,
  code: String
}, { _id: false });

const QuestionOption = new Schema({
  A: String,
  B: String,
  C: String,
  D: String
}, { _id: false });

class Question extends BaseModel {
  constructor() {
    const _name = 'question';
    const attributes = {
      code: Number,
      question: String,
      question_json: String,
      options: QuestionOption,
      type: String, //DEFAULT, AUTO
      answer: String,
      answer_content: String,
      level: String, // NHAN_BIET, THONG_HIEU, VAN_DUNG, VAN_DUNG_CAO
      chapter: ChapterSchema,
      category: CategorySchema, // Chuyen de
      subject: SubjectSchema,
      doc_link: String,
      doc_type: String,
      video_link: String,
      classrooms: [ClassroomSchema],
      status: Boolean,
      deleted_at: Date
    };
    const options = {
      collection: 'questions',
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

module.exports = new Question();
