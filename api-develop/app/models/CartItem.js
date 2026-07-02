
const mongoose = require('mongoose');
const BaseModel = require('./BaseModel');

const { Schema } = mongoose;

const Promotion = new Schema({
    from_date: Date,
    to_date: Date
}, { _id: false });

class CartItem extends BaseModel {
    constructor() {
        const _name = 'cart_item';
        const attributes = {
            item_id: String,
            name: String,
            type: String,
            qty: Number,
            price: Number,
            origin_price: Number,
            is_selected: Boolean,
            user_id: String,
            cart_id: String,
            cart_parent_id: String,
            origin_object_id: String,
            image: String,
            promotion: Promotion,
            note: String,
        };
        const options = {
            collection: 'cart_items',
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

module.exports = new CartItem();
