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
        styleID:{
            type: ObjectId,
            ref: 'Style',
            required: true,
            unique: true,
        }
    },
    { timestamps: true },
);

module.exports = mongoose.model('StyleValue', styleValueSchema);
