const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema;

const slugSchema = new mongoose.Schema(
    {
        slug: {
            type: String,
            trim: true,
            required: true,
        },
        id: {
            type: ObjectId,
            required: true,
        },
        ref: {
            type: String,
            required: true,
            enum: ['user', 'store', 'product'],
        },
    },
    { timestamps: true },
);

slugSchema.index({ slug: 1, id: 1, ref: 1 }, { unique: true });

module.exports = mongoose.model('Slug', slugSchema);
