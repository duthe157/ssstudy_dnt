const mongoose = require('mongoose');
const BaseModel = require('./BaseModel');

const { Schema } = mongoose;

class Question_v2 extends BaseModel {
  constructor() {
    const _name = 'question_v2';
    const attributes = {
      exam_id: String,
      exam_section_id: String,
      exam_section_group_id:String,
      subject_id: String,
      question_no: Number,
      code: Number,
      question: String,
      question_json: String,
      type: String,
      answer: Object,
      answer_content: String,
      doc_link: String,
      doc_type: String,
      video_link: String,
      status: Boolean,
      deleted_at: Date
    };
    const options = {
      collection: 'questions_v2',
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

module.exports = new Question_v2();
