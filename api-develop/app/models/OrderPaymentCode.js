
const mongoose = require('mongoose');
const BaseModel = require('./BaseModel');

const { Schema } = mongoose;

class OrderPaymentCode extends BaseModel {
  constructor() {
    const _name = 'transaction_payment_code';
    const attributes = {
      code: String,
      order_id: String,
      credit_id: String,
      type: String, // ORDER, CREDIT
      deleted_at: Date,
    };
    const options = {
      collection: 'transaction_payment_codes',
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

module.exports = new OrderPaymentCode();
