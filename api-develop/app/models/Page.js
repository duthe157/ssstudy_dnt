const BaseModel = require('./BaseModel');

class Page extends BaseModel {
    constructor() {
        const _name = 'page';
        const attributes = {
            name: String,
            key: String,
            content: String,
            content_configs: String
        };
        const options = {
            collection: 'pages',
            timestamps: {
                createdAt: 'created_at',
                updatedAt: 'updated_at'
            },
            versionKey: false
        };

        super(_name, attributes, options);
    }
}

module.exports = new Page();
