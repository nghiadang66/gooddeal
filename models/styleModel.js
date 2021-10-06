const mongoose = require('mongoose');

const styleSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            trim: true,
            required: true,
            unique: true,
            maxLength: 32,
        },
    },
    { timestamps: true },
);

module.exports = mongoose.model('Style', styleSchema);
