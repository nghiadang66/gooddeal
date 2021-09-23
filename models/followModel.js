const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema;

const followSchema = new mongoose.Schema(
    {
        userId: {
            type: ObjectId,
            ref: 'User',
        },
        storeId: {
            type: ObjectId,
            ref: 'Store',
        },
    },
    { timestamps: true },
);

module.exports = mongoose.model('Follow', followSchema);
