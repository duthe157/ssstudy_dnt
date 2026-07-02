
const mongoose = require('mongoose');
const BaseModel = require('./BaseModel');

const { Schema } = mongoose;
class Order extends BaseModel {
  constructor() {
    const _name = 'order';
    const attributes = {
      code: Number,
      payment_method: String, //COD, DIRECTLY, BANK_TRANSFER, BANK_PAYOS
      customer_id: String,
      customer_name: String,
      customer_phone: String,
      customer_address: String,
      customer_email: String,
      customer_code: String,
      discount_code: String,
      discount_type: String,
      discount_value: Number,
      discount_total: Number,
      subtotal: Number,
      total: Number,
      status: String,
      note: String,
      transaction_code: String,
      type: String,//QUICK_PAYMENT
      deleted_at: Date
    };
    const options = {
      collection: 'orders',
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

module.exports = new Order();
