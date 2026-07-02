const mongoose = require('mongoose');
const BaseModel = require('./BaseModel');


const { Schema } = mongoose;

const User = new Schema({
  id: String,
  name: String
}, { _id: false });

const Classroom = new Schema({
  id: String,
  name: String
}, { _id: false });

const Subject = new Schema({
  id: String,
  name: String
}, { _id: false });

const Classroom_group = new Schema({
  id: String,
  name: String
}, { _id: false });

const Parents = new Schema({
  id: String,
  name: String,
  description: String,
  address: String,
  images: String,
  thumnailImg: String,
  source: String,
  links: String
}, { _id: false });

const Students = new Schema({
  // user: User,
  id: String,
  name: String,
  description: String,
  links: String,
  images: String,
  avatar: String
}, { _id: false });

const Honors = new Schema({
  name: String,
  school: String,
  classroom :String,
  image_popup: String,
  avatar: String
}, { _id: false });

class Review extends BaseModel {
  constructor() {
    const _name = "user_review";
    const attributes = {
      month: String,
      year: String,
      comment: String,
      alias: String,
      subject: Subject,
      classroom: Classroom,
      classroom_group: Classroom_group,
      parents: Parents,
      students: Students,
      honors: Honors,
      score: String,
      type: { type: String, enum: ["HOC_SINH", "PHU_HUYNH", "VINH_DANH"], default: "HOC_SINH"  },
      teacher: String,
      deleted_at: Date,
      hiden: { type: Boolean, default: false },
      user: User,
    };
    const options = {
      collection: "user_reviews",
      timestamps: {
        createdAt: "created_at",
        updatedAt: "updated_at",
      },
      versionKey: false,
    };

    super(_name, attributes, options);
  }
}

module.exports = new Review();
