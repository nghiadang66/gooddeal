const mongoose = require('mongoose');

const businessSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            trim: true,
            required: true,
            unique: true,
            maxLength: 32,
        },
        commission: {
            type: mongoose.Decimal128,
            required: true,
            min: 0,
        },
    },
    { timestamps: true },
);

module.exports = mongoose.model('Business', businessSchema);
