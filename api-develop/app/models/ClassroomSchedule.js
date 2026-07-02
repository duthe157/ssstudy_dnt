
const mongoose = require('mongoose');
const BaseModel = require('./BaseModel');

const { Schema } = mongoose;

const Subject = new Schema({
    id: String,
    name: String,
    code: String
}, { _id: false });

const Classroom = new Schema({
    id: String,
    name: String,
    code: String
}, { _id: false });

class ClassroomSchedule extends BaseModel {
    constructor() {
        const _name = 'classroom_schedule';
        const attributes = {
            subject: Subject,
            classroom: Classroom,
            num_day_of_week: Number,
            day_of_week: String,
            started_at: String, // 09:00
            finished_at: String,// 19:00
            support_teacher: String,
            note: String
        };
        const options = {
            collection: 'classroom_schedules',
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

module.exports = new ClassroomSchedule();
