const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema;

const styleValueSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            trim: true,
            required: true,
            unique: true,
            maxLength: 32,
        },
        styleId: {
            type: ObjectId,
            ref: 'Style',
            required: true,
            unique: true,
        },
        isDeleted: {
            type: Boolean,
            required: true,
            default: false,
        },
    },
    { timestamps: true },
);

module.exports = mongoose.model('StyleValue', styleValueSchema);
