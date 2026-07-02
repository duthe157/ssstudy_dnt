const mongoose = require('mongoose');
const BaseModel = require('./BaseModel');

const { Schema } = mongoose;

const ClassroomSchema = new Schema({
  id: String,
  name: String,
  code: String
}, { _id: false });

const UserSchema = new Schema({
  id: String,
  name: String,
  code: String
}, { _id: false });

class Attendance extends BaseModel {
  constructor() {
    const _name = 'attendance';
    const attributes = {
      classroom: ClassroomSchema,
      user: UserSchema,
      attended_date: Date, // Date Time
      status: String,
      is_new_member: Boolean,
      teacher_review: String
    };
    const options = {
      collection: 'attendances',
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

module.exports = new Attendance();
