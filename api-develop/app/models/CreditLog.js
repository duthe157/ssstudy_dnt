
const mongoose = require('mongoose');
const BaseModel = require('./BaseModel');

const { Schema } = mongoose;

const User = new Schema({
    id: String,
    code: String,
    name: String
  }, { _id: false });

class Credit extends BaseModel {
  constructor() {
    const _name = 'credit';
    const attributes = {
      code: Number,
      payment_method: String, //COD, DIRECTLY, BANK_TRANSFER, BANK_PAYOS
      user: User,
      total: Number,
      type: String, // ADD, SUB
      status: String,
      note: String,
      deleted_at: Date
    };
    const options = {
      collection: 'credits',
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

module.exports = new Credit();
