const mongoose = require('mongoose');
const BaseModel = require('./BaseModel');

const { Schema } = mongoose;


class ScoreWordHistory extends BaseModel {
    constructor() {
        const _name = 'score_word_history';
        const attributes = {
            user_id: String,
            user_code: String,
            user_name: String,
            exam_id: String,       // ID bài thi
            exam_name: String,     // Tên bài thi
            total_question: Number,
            ques_answer_doing: Number,
            total_score_achieve: Number,
            total_exam_point: Number,
            time_doing: Number,
            class_name: String,// Tên lớp
            subject: String,
            type: String,
            exam_section: [Object], // chi tiết từng phần nếu cần
            question_logs: [Object]
        };

        const options = {
            collection: 'score_word_history',
            timestamps: {
                createdAt: 'created_at',
                updatedAt: 'updated_at'
            },
            versionKey: false
        };

        const schema = new Schema(attributes, options);
        super(_name, attributes, options, schema);
    }
}

module.exports = new ScoreWordHistory();
