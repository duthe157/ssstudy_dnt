const mongoose = require('mongoose');
const BaseModel = require('./BaseModel');

const { Schema } = mongoose;

class ExamSection extends BaseModel {
  constructor() {
    const _name = 'exam_section';
    const attributes = {
      exam_id: String,
      exam_section_name: String,
      exam_section_type: String,
      exam_section_order: Number,
      exam_section_time: Number,
      total_score: Number,
      calculate_score_type: String,
      exam_link: String,
      point_per_question: Number,
      deleted_at: Date
    };
    const options = {
      collection: 'exam_sections',
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

module.exports = new ExamSection();
