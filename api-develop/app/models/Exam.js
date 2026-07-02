
const mongoose = require('mongoose');
const BaseModel = require('./BaseModel');

const { Schema } = mongoose;

const SubjectSchema = new Schema({
  id: String,
  name: String,
  code: String
}, { _id: false });

const Category = new Schema({
  id: String,
  name: String
}, { _id: false });

const ConfigSchema = new Schema({
  category_id: String,
  NHAN_BIET: Number,
  THONG_HIEU: Number,
  VAN_DUNG: Number,
  VAN_DUNG_CAO: Number
}, { _id: false });

class Exam extends BaseModel {
  constructor() {
    const _name = 'exam';
    const attributes = {
      name: String,
      alias: String,
      code: Number,
      type: String, // TEST
      level: String,
      creating_type: String,
      subject: SubjectSchema,
      category: Category,
      chapters: [String],
      time: Number,
      configs: [ConfigSchema],
      questions: [String],
      doc_link: String,
      doc_type: String,
      exam_doc_link: String,
      video_link: String,
      status: Boolean,
      tp: Number, // TargetPoint
      month: Number,
      is_redo: Boolean,// Cho lam lai hay khong, lam lai thi ghi de du lieu,
      group: String,// THI_THU, MAC_DINH
      point_true_false: Object,
      answer_doc_link: String,
      deleted_at: Date
    };
    const options = {
      collection: 'exams',
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

module.exports = new Exam();
