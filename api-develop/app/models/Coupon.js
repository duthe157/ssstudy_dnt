const mongoose = require('mongoose');
const BaseModel = require('./BaseModel');

const { Schema } = mongoose;

class Coupon extends BaseModel {
    constructor() {
        const _name = 'coupon';
        const attributes = {
            code: String,
            discount_type: String, // AMOUNT_FIXED, PERCENT
            discount_value: Number,
            discount_method: String, //ORDER, PRODUCT, CUSTOMER,
            discount_configs: String, // MIN_VALUE:50000, MIN_QTY:50, PRODUCT:1,2,3
            min_requirements: String,
            started_at: Date,
            finished_at: Date,
            status: Boolean,
            deleted_at: Date
        };
        const options = {
            collection: 'coupons',
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

module.exports = new Coupon();