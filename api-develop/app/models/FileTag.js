
const BaseModel = require('./BaseModel');

class FileTag extends BaseModel {
    constructor() {
        const _name = 'file_tag';
        const attributes = {
            creator_id: String,
            name: String,
            alias: String,
            num_file: Number,
            position: Number
        };
        const options = {
            collection: 'file_tags',
            timestamps: {
                createdAt: 'created_at',
                updatedAt: 'updated_at'
            },
            versionKey: false
        };

        super(_name, attributes, options);
    }
}

module.exports = new FileTag();
