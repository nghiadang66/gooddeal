const mongoose = require('mongoose');

const commissionSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            trim: true,
            required: true,
            unique: true,
            maxLength: 32,
        },
        cost: {
            type: mongoose.Decimal128,
            required: true,
            min: 0,
        },
        isDeleted: {
            type: Boolean,
            required: true,
            default: false,
        },
    },
    { timestamps: true },
);

module.exports = mongoose.model('Commission', commissionSchema);
