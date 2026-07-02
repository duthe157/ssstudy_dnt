
const mongoose = require('mongoose');
const BaseModel = require('./BaseModel');

const { Schema } = mongoose;

class Registration extends BaseModel {
  constructor() {
    const _name = 'registration';
    const attributes = {
      fullname: String,
      phone: String,
      email: String,
      address: String,
      target_point: Number,
      tested_point: Number,
      subject: String, // TOAN,LY, HOA
      school: String,
      school_2: String, // Nguyen vong
      classroom: String, // LOP1, LOP12
      classroom_group: String, // LOP1, LOP12
      is_called: Boolean,
      is_student: Boolean,
      note: String,
      hocluc: String,
      exam_category_id: String,
      deleted_at: Date
    };
    const options = {
      collection: 'registrations',
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

module.exports = new Registration();
