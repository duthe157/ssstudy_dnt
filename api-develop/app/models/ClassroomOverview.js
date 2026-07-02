const mongoose = require('mongoose');
const BaseModel = require('./BaseModel');

const { Schema } = mongoose;

const TopStudent = new Schema({
    id: String,
    code: String,
    name: String,
    avg_point: Number
}, { _id: false });

class ClassroomOverview extends BaseModel {
    constructor() {
        const _name = 'classroom_overview';
        const attributes = {
            num_student: Number,
            classroom_avg_point: Number,
            student_avg_point: Number,
            month: Number,
            year: Number,
            top_students: [TopStudent]
        };
        const options = {
            collection: 'classroom_overview',
            timestamps: {
                createdAt: 'created_at',
                updatedAt: 'updated_at'
            },
            versionKey: false
        };

        super(_name, attributes, options);
    }
}

module.exports = new ClassroomOverview();
