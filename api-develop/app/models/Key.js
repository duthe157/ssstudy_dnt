const BaseModel = require('./BaseModel');

class Key extends BaseModel {
    constructor() {
        const _name = 'key';
        const attributes = {
            user_id: String,
            key: String, // user - key
            expired: Number,
            user_group: String
        };
        const options = {
            collection: 'keys',
            timestamps: {
                createdAt: 'created_at',
                updatedAt: 'updated_at'
            },
            versionKey: false
        };

        super(_name, attributes, options);
    }
}

module.exports = new Key();
