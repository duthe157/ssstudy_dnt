
const mongoose = require('mongoose');
const BaseModel = require('./BaseModel');

const { Schema } = mongoose;

const FeaturedStatsBox = new Schema({
  box1_num: Number,
  box1_text: String,
  box1_img: String,
  box2_num: Number,
  box2_text: String,
  box2_img: String,
  box3_num: Number,
  box3_text: String,
  box3_img: String,
  box4_num: Number,
  box4_text: String,
  box4_img: String
}, { _id: false });

const FeaturedTextBox = new Schema({
  box1_text: String,
  box1_img: String,
  box2_text: String,
  box2_img: String,
  box3_text: String,
  box3_img: String
}, { _id: false });

class User extends BaseModel {
  constructor() {
    const _name = 'user';
    const attributes = {
      fullname: String,
      alias: String,
      code: String,
      phone: String, // Unique, dùng để Login
      password: String,
      email: String,
      avatar: String,
      profile_pic: String,
      description: String,
      content: String,
      dob: Date,
      gender: String, // Male, Female
      user_group: String, // STUDENT, TEACHER, ADMIN
      parent_phone: String,
      parent_name: String,
      school: String,
      classroom: String,
      level: String,
      address: String,
      last_login: Date,
      total_classroom: Number,
      total_student: Number,
      status: String,
      device_tags: String,
      is_os_external_user_id: Boolean,
      balance: Number,
      sub_balance: Number,
      type: String, //LEAD, USER
      is_show_profile: Boolean,
      link_fb: String,
      category_type: Array,
      subject: Array,
      is_featured: String,
      homepage_image: String,
      education_philosophy_source: String,
      education_philosophy_url: String,
      external_link: String,
      featured_text_box: FeaturedTextBox,
      featured_stats_box: FeaturedStatsBox,
      deleted_at: Date,
    };
    const options = {
      collection: 'users',
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

module.exports = new User();
