
const mongoose = require('mongoose');
const BaseModel = require('./BaseModel');

const { Schema } = mongoose;

const Creator = new Schema({
    id: String,
    name: String,
    code: String
}, { _id: false });

class BillingHistory extends BaseModel {
    constructor() {
        const _name = 'billing_history';
        const attributes = {
            billing_id: String,            
            creator: Creator,
            note: String
        };
        const options = {
            collection: 'billing_histories',
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

module.exports = new BillingHistory();
