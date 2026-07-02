
const mongoose = require('mongoose');
const BaseModel = require('./BaseModel');

const { Schema } = mongoose;

const ClassroomSchema = new Schema({
    id: String,
    name: String,
    code: String
}, { _id: false });

class ClassroomRanking extends BaseModel {
    constructor() {
        const _name = 'classroom_ranking';
        const attributes = {
            classroom: ClassroomSchema,
            month: String,
            year: String,
            avg_point: Number
        };
        const options = {
            collection: 'classroom_ranking',
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

module.exports = new ClassroomRanking();
