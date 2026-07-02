const mongoose = require('mongoose');
const BaseModel = require('./BaseModel');

const { Schema } = mongoose;

class TeachersTeam extends BaseModel {
    constructor() {
        const _name = 'teachers_team';
        const attributes = {
            title: String,
            content: String,
            images: [
                {
                    url: String, // Base64 string
                    _id: false
                }
            ],
            highlights: [
                {
                    image: {
                        url: String, // Base64 string
                    },
                    title: String,
                    description: String
                }
            ]
        };
        const options = {
            collection: 'teachers_teams',
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

module.exports = new TeachersTeam();