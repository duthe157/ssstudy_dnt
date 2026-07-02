const mongoose = require('mongoose');
const BaseModel = require('./BaseModel');
const { Schema } = mongoose;

const SubjectSchema = new Schema({
  id: String,
  name: String,
  code: String
}, { _id: false });

const ChildrenPartsSchema = new Schema({
  time: { type: Number, default: 60 },
  score: { type: Number, default: 10 },
  name: String,
  subject_id: String,
  questions: [{
    question: { type: Schema.Types.ObjectId, ref: "QuestionWord" },
    isTestQuestion: { type: Boolean, default: false },
    number: Number
  }]
});

const SubPartSchema = new Schema({
  isMain: { type: Boolean, default: false },
  maxSubject: { type: Number, default: 1 },
  name: String,
  children: [ChildrenPartsSchema],
});

const CategoryExamSchema = new Schema({
  populate_id: { type: Schema.Types.ObjectId, ref: 'CompetitionPart' },
  type_exam: String,
}, { _id: false });

const categoryAssessmentSchema = new Schema({
  id: { type: Schema.Types.ObjectId, ref: 'ExamCategory' },
  name: String,
}, { _id: false });

const PartsSchema = new Schema({
  name: { type: String, default: "Phần Thi" },
  time: { type: Number, default: 60 },
  score: { type: Number, default: 10 },
  questions_score: { type: Number, default: 0.2 },
  maxGroup: { type: Number, default: 1 },
  type: {
    type: String,
    enum: ['MAC_DINH', 'NHOM_CHU_DE', 'SACH_ID'],
    default: 'MAC_DINH'
  },
  totalquestions: { type: Number, default: 50 },
  subpart: [SubPartSchema],
});

const PracticeConfigSchema = new Schema({
  status: Boolean,
  startDate: Date,
  endDate: Date,
  result_display: { type: String, enum: ['IMMEDIATELY', 'LATER'] },
  answer_display: { type: String, enum: ['IMMEDIATELY', 'LATER'] },
  required_passwword: Boolean,
  password: String

}, { _id: false });

const FastGiftSchema = new Schema({
  status: Boolean,
  id: { type: Schema.Types.ObjectId, ref: 'fast_gift' },
}, { _id: false });

class ExamWord extends BaseModel {
  constructor() {
    const _name = 'exam_word';
    const attributes = {
      name: { type: String, required: true },
      search_id: String,
      e_cheating: { type: Boolean, default: false },
      alias: String,
      score: { type: Number, required: true },
      subject: SubjectSchema,
      categoryExam: CategoryExamSchema,
      categoryAssessment: categoryAssessmentSchema,
      time: Number,
      classes: String,
      group: { type: String, default: "MAC_DINH" },
      parts: [PartsSchema],
      status: Boolean,
      tp: String,
      month: Number,
      is_redo: Boolean,
      exam_doc_link: String,
      exam_doc_link2: String,
      deleted_at: Date,
      practiceConfig: PracticeConfigSchema,
      fast_gift: FastGiftSchema
    };
    const options = {
      collection: 'exam_words',
      timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
      },
      versionKey: false
    };
    const schema = new Schema(attributes, options);

    super(_name, attributes, options, schema);
  }
}

module.exports = new ExamWord();