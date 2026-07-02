const mongoose = require('mongoose');
const BaseModel = require('./BaseModel');

const { Schema } = mongoose;

const UserSchema = new Schema({
    id: String,
    code: String,
    name: String
}, { _id: false });

class ScoreHistory extends BaseModel {
    constructor() {
        const _name = 'score_history';
        const attributes = {
            user_id: String,
            user: UserSchema,
            exam_id: String,
            classroom_id: String,
            exam_key: String,
            exam_name: String,
            total_question: Number,
            ques_answer_doing: Number,
            total_score_achieve: Number,
            total_exam_point: Number,
            time_doing: Number,
            type: String,
            exam_section: [Object]
        };
        const options = {
            collection: 'score_history',
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

module.exports = new ScoreHistory();
