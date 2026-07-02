const mongoose = require('mongoose');
const BaseModel = require('./BaseModel');

const { Schema } = mongoose;

const StudentSchema = new Schema({
    id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    phone: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true },
    name: { type: String, trim: true }
}, { _id: false });

const CourseSchema = new Schema({
    id: { type: mongoose.Schema.Types.ObjectId }, // Assuming course id can be any ObjectId
    name: { type: String, trim: true },
    original_price: { type: Number, default: 0 },
    price: { type: Number, default: 0 },
    update_price: { type: Number, default: 0 }
}, { _id: false });

const Creator = new Schema({
    id: String,
    name: String,
    code: String
}, { _id: false })

class LinkPayments extends BaseModel {
    constructor() {
        const _name = 'link_payment'; // Collection name in plural snake_case
        const attributes = {
            student: StudentSchema,
            courses: [CourseSchema],
            total_money: { type: Number, default: 0 },
            status: {
                type: String,
                enum: ['PENDING', 'PAID', 'EXPIRED', 'CANCELLED'],
                default: 'PENDING'
            },
            payment_date: { type: Date, default: null },
            creator: Creator,
            deleted_at: { type: Date, default: null } // Added deleted_at for consistency with other models
        };

        const options = {
            collection: 'link_payments',
            timestamps: {
                createdAt: 'created_at',
                updatedAt: 'updated_at'
            },
            versionKey: false
        };

        super(_name, attributes, options);
    }
}

module.exports = new LinkPayments(); 