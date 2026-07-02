const mongoose = require('mongoose');
const BaseModel = require('./BaseModel');
const { Schema } = mongoose;

const CompetitionPartSchema = new Schema({
    id: String,
    name: String
}, { _id: false });

const CTASchema = new Schema({
    text: String,
    icon: String,
    icon_src: String
}, { _id: false });

const ScoreRuleSchema = new Schema({
    min_score: Number,
    max_score: Number,
    reward: String,
    image: String
}, { _id: false });

const TagSchema = new Schema({
    icon: String,
    icon_src: String,
    name: String

}, { _id: false });

class FastGift extends BaseModel {
    constructor() {
        const _name = 'fast_gift';
        const attributes = {
            name: String,
            competition_part: CompetitionPartSchema,
            status: { type: Boolean, default: true },
            url_redirect: String,
            call_to_action: CTASchema,
            showTag: { type: Boolean, default: false },
            tag: TagSchema,
            score_rule: [ScoreRuleSchema],
        };
        const options = {
            collection: 'fast_gifts',
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

module.exports = new FastGift();