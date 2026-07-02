
const mongoose = require('mongoose');
const BaseModel = require('./BaseModel');

const { Schema } = mongoose;

const Subject = new Schema({
    id: String,
    name: String,
    code: String
}, { _id: false });

const User = new Schema({
    id: String,
    name: String,
    code: String
}, { _id: false });

const Classroom = new Schema({
    id: String,
    name: String,
    code: String
}, { _id: false });

const Creator = new Schema({
    id: String,
    name: String,
    code: String
}, { _id: false });

class BillingItem extends BaseModel {
    constructor() {
        const _name = 'billing_item';
        const attributes = {
            billing_id: String,
            user: User,
            creator: Creator,
            subject: Subject,
            classroom: Classroom,
            qty: Number,
            price: Number,
            payment_method: String,
            type: String,
            subtotal: Number,
            discount_type: String,
            discount_value: Number,
            discount: Number,
            total: Number,
            billed_at: Date,
            deleted_at: Date
        };
        const options = {
            collection: 'billing_items',
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

module.exports = new BillingItem();
