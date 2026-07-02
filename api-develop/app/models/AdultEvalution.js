
const mongoose = require('mongoose');
const BaseModel = require('./BaseModel');
const Schema = mongoose.Schema;

const Classroom = new Schema({
    id: String,
    name: String
}, { _id: false });

const Subject = new Schema({
    id: String,
    name: String
}, { _id: false });

const Classroom_group = new Schema({
    id: String,
    name: String
}, { _id: false });

class AdultEvalution extends BaseModel {
    constructor() {
        const _name = 'adult_evalution';
        const attributes = {
            name: String,
            alias: String,
            description: String,
            content: String,
            image: String,
            status: Boolean,
            type: String,
            deleted_at: Date,
            score: Number,
            subject: Subject,
            classroom: Classroom,
            classroom_group: Classroom_group,
            data_json: Object,
        };
        const options = {
            collection: 'adult_evalutions',
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

module.exports = new AdultEvalution();
