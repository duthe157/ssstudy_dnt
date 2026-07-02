
const mongoose = require('mongoose');
const BaseModel = require('./BaseModel');

const { Schema } = mongoose;

class Cart extends BaseModel {
    constructor() {
        const _name = 'cart';
        const attributes = {
            discount_total: Number,
            discount_code: String,
            subtotal: Number,
            total: Number,
            user_id: String,
            note: String
        };
        const options = {
            collection: 'carts',
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

module.exports = new Cart();
