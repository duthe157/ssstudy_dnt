
const mongoose = require('mongoose');
const BaseModel = require('./BaseModel');

const { Schema } = mongoose;

class Billing extends BaseModel {
    constructor() {
        const _name = 'billing';
        const attributes = {
            user_id: String,
            creator_id: String,
            item_type: String,
            item_id: String,
            payment_method: String,
            subtotal: Number,
            discount: Number,
            total: Number,
            type: String,
            reason: String,
            pay_type: String,
            payment_method: String,
            billed_at: Date,
            note: String,
            billing_id: String,
            billing_item_id: String,
            status: String
        };
        const options = {
            collection: 'billings',
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

module.exports = new Billing();
