const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema;

const styleSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            trim: true,
            required: true,
            unique: true,
            maxLength: 32,
        },
        categoryId: {
            type: ObjectId,
            ref: 'Category',
            required: true,
        },
        brandId: {
            type: ObjectId,
            ref: 'Brand',
            required: true,
        },
        isDeleted: {
            type: Boolean,
            required: true,
            default: false,
        },
    },
    { timestamps: true },
);

module.exports = mongoose.model('Style', styleSchema);
