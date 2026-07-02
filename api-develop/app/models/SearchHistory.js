const mongoose = require('mongoose');
const BaseModel = require('./BaseModel');

const { Schema } = mongoose;

class SearchHistory extends BaseModel {
    constructor() {
        const _name = 'search_history';
        const attributes = {
            user_id: String,
            keyword: String,
            normalize:String,
            last_searched_at: Date,
        };
        const options = {
            collection: 'search_history',
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

module.exports = new SearchHistory();
