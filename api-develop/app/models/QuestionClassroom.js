
const mongoose = require('mongoose');
const BaseModel = require('./BaseModel');

const { Schema } = mongoose;

const ClassroomSchema = new Schema({
    id: String,
    name: String,
    code: String
}, { _id: false });

class QuestionClassroom extends BaseModel {
    constructor() {
        const _name = 'question_classroom';
        const attributes = {
            question_id: String,
            classroom: ClassroomSchema,
            deleted_at: Date
        };
        const options = {
            collection: 'question_classrooms',
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

module.exports = new QuestionClassroom();
