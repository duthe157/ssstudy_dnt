const mongoose = require('mongoose');
const BaseModel = require('./BaseModel');

const { Schema } = mongoose;

const PartSchema = new Schema({
  name: String,
  hidden: { type: Boolean, default: false },
  deleted: { type: Boolean, default: false },
}, { _id: false });

const ConfigSchema = new Schema({
  viewExamPerPart: { type: Boolean, default: true },
  timePerPart: { type: Boolean, default: true },
  viewOneQuestion: { type: Boolean, default: true },
  e_hidden_answer: { type: Boolean, default: false },
}, { _id: false });

class CompetitionPart extends BaseModel {
  constructor() {
    const _name = 'CompetitionPart';
    const attributes = {
      name: { type: String, required: true },
      hidden: { type: Boolean, default: false },
      config: [ConfigSchema],
      parts: [PartSchema],
      point_true_false: Object,
      deleted_at: Date
    };

    const options = {
      collection: 'competition_parts',  
      timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at',
      },
      versionKey: false
    };

    const schema = new Schema(attributes, options);

    schema.pre('save', function (next) {
      this.updatedAt = Date.now();
      next();
    });
    schema.pre('save', function (next) {
      if (!this.config || this.config.length === 0) {
        this.config = [{
          viewExamPerPart: true,
          timePerPart: true,
          viewOneQuestion: true
        }];
      }
      next();
    });

    mongoose.model(_name, schema);

    super(_name, attributes, options, schema);
  }
}

module.exports = new CompetitionPart();
