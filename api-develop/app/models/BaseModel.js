const mongoose = require('mongoose');

const { Schema } = mongoose;

class BaseModel {
    constructor(_name, attributes, options, _schema = false) {
        let schema = _schema;
        if (!_schema) {
            schema = new Schema(attributes, options);
        }

        try {
            this.db = mongoose.model(_name, schema);
            this.db.init().then((err) => {
            });
            this.db.createIndexes((err) => {
            });
            this.db.on('index', (err) => {
            });
        } catch (err) {
            logError(err);
        }
    }

    async create(docs, options = null) {
        const rs = await this.db.create(docs, options).then((rs, err) => {
            if (err)
                throw err;
            return rs;
        });
        return rs;
    }

    async updateOne(conditions, doc, options = null) {
        const rs = await this.db.updateOne(conditions, doc, options).then((rs) => {
            return rs;
        });
        return rs;

    }

    async updateMany(conditions, doc, options = null) {
        const rs = await this.db.updateMany(conditions, doc, options).then((rs) => {
            return rs;
        });
        return rs;
    }

    async findOneAndUpdate(conditions, doc, options = null) {
        const rs = await this.db.findOneAndUpdate(conditions, doc, options).then((rs) => {
            return rs;
        });
        return rs;
    }

    async findOne(conditions, projection = null, options = null) {
        const rs = await this.db.findOne(conditions, projection, options).then((rows) => {
            return rows;
        });
        return rs;
    }

    async findOnePopulate(conditions, projection = null, populateOptions = null, options = null) {
        let query = this.db.findOne(conditions, projection, options);

        if (populateOptions) {
            if (Array.isArray(populateOptions)) {
                // Nếu truyền vào nhiều populate
                populateOptions.forEach(pop => {
                    query = query.populate(pop);
                });
            } else {
                // Nếu chỉ có 1 populate
                query = query.populate(populateOptions);
            }
        }

        return query;
    }


    async find(conditions, projection = null, options = null) {
        const rs = await this.db.find(conditions, projection, options).then((rs) => {
            return rs;
        });
        return rs;
    }

    async softDelete(conditions, multiple = false) {
        let rs = false;
        if (multiple) {
            rs = await this.db.updateMany(conditions, { $set: { deleted_at: new Date() } }).then((rs) => {
                return rs;
            });
        } else {
            rs = await this.db.updateOne(conditions, { $set: { deleted_at: new Date() } }).then((rs) => {
                return rs;
            });
        }
        return rs;
    }

    async count(conditions) {
        let rs = null;
        if (Object.keys(conditions).length == 0) {
            rs = await this.db.estimatedDocumentCount(conditions).then((rs) => {
                return rs;
            });
        } else {
            rs = await this.db.count(conditions).then((rs) => {
                return rs;
            });
        }
        return rs;
    }

    async distinct(field, conditions) {
        const rs = await this.db.distinct(field, conditions).then((rs) => {
            return rs;
        });
        return rs;
    }

    async delete(conditions, multiple = false) {
        let rs = false;
        if (multiple) {
            rs = await this.db.deleteMany(conditions).then((rs) => {
                return rs;
            });
        } else {
            rs = await this.db.deleteOne(conditions).then((rs) => {
                return rs;
            });
        }
        return rs;
    }

    async aggregate(conditions) {
        const rs = await this.db.aggregate(conditions).then((rs) => {
            return rs;
        });
        return rs;
    }
}

module.exports = BaseModel;
