const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema;

const userReviewStoreSchema = new mongoose.Schema(
    {
        userId: {
            type: ObjectId,
            ref: 'User',
        },
        storeId: {
            type: ObjectId,
            ref: 'Store',
        },
        content: {
            type: String,
            trim: true,
            required: true,
            maxLength: 1000,
        },
        rating: {
            type: Number,
            default: 0,
            min: 0,
            max: 5,
        },
    },
    { timestamps: true },
);

userReviewStoreSchema.index({ userId: 1, storeId: 1 }, { unique: true });

module.exports = mongoose.model('UserReviewStore', userReviewStoreSchema);
