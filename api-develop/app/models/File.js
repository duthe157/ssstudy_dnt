const BaseModel = require('./BaseModel');

class File extends BaseModel {
    constructor() {
        const _name = 'file';
        const attributes = {
            creator_id: String,
            name: String,
            alias: String,
            path: String,
            origin_name: String,
            size: Number,
            type: String,
            object: String,
            tags: [String]
        };
        const options = {
            collection: 'files',
            timestamps: {
                createdAt: 'created_at',
                updatedAt: 'updated_at'
            },
            versionKey: false
        };

        super(_name, attributes, options);
    }
}

module.exports = new File();
