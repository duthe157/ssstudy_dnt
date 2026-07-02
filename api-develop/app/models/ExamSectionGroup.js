
const mongoose = require('mongoose');
const BaseModel = require('./BaseModel');

const { Schema } = mongoose;

const SubjectSchema = new Schema({
  subject_id: String,
  subject_name: String,
  exam_link: String
}, { _id: false });

class ExamSectionGroup extends BaseModel {
  constructor() {
    const _name = 'exam_section_group';
    const attributes = {
      exam_id: String,
      exam_section_id: String,
      exam_section_group_name: String,
      number_subject_require: Number,
      exam_section_group_order: Number,
      subjects: [SubjectSchema], //list id mon hoc
      deleted_at: Date
    };
    const options = {
      collection: 'exam_section_groups',
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

module.exports = new ExamSectionGroup();
