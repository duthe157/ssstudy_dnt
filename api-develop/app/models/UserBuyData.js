
const mongoose = require('mongoose');
const BaseModel = require('./BaseModel');

const { Schema } = mongoose;

class UserBuyData extends BaseModel {
  constructor() {
    const _name = 'user_buy_data';
    const attributes = {
      user_id: String,
      item_id: String,
      type: String,
      num: Number
    };
    const options = {
      collection: 'user_buy_data',
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

module.exports = new UserBuyData();
