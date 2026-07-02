
const mongoose = require('mongoose');
const BaseModel = require('./BaseModel');

const { Schema } = mongoose;

class OrderItem extends BaseModel {
    constructor() {
        const _name = 'order_item';
        const attributes = {
            order_id: String,
            item_id: String,
            name: String,
            qty: Number,
            price: Number,
            type: String,
            discount_code: String,
            discount_type: String,
            discount_value: Number,
        };
        const options = {
            collection: 'order_items',
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

module.exports = new OrderItem();
