
const mongoose = require('mongoose');
const BaseModel = require('./BaseModel');

const { Schema } = mongoose;

const ClassroomSchema = new Schema({
    id: String,
    name: String,
    code: String
}, { _id: false });

class VideoClassroom extends BaseModel {
    constructor() {
        const _name = 'video_classroom';
        const attributes = {
            video_id: String,
            classroom: ClassroomSchema,
            deleted_at: Date
        };
        const options = {
            collection: 'video_classrooms',
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

module.exports = new VideoClassroom();
