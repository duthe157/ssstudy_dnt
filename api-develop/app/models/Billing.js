
const mongoose = require('mongoose');
const BaseModel = require('./BaseModel');

const { Schema } = mongoose;

const Item = new Schema({
    id: String,
    name: String,
    subject_name: String,
    code: String,
    qty: Number,
    price: Number,
    discount_type: String,
    discount_value: Number,
    discount: Number,
}, { _id: false });

const User = new Schema({
    id: String,
    name: String,
    code: String
}, { _id: false });

const Creator = new Schema({
    id: String,
    name: String,
    code: String
}, { _id: false });

const Order = new Schema({
    id: String,
    code: String,
    type: String
}, { _id: false });

class Billing extends BaseModel {
    constructor() {
        const _name = 'billing';
        const attributes = {
            code: Number,
            user: User,
            creator: Creator,
            items: [Item],
            subtotal: Number,
            discount: Number,
            total: Number,
            type: String, // PT, PC
            reason: String, // HOAN_HUY, NOP_HP
            pay_type: String, // DAY, MONTH, YEAR // DEFAULT
            payment_method: String,
            order: Order,
            billed_at: Date,
            note: String,
            status: String,
            deleted_at: Date
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
