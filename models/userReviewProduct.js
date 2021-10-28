const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema;

const userReviewProductSchema = new mongoose.Schema(
    {
        userId: {
            type: ObjectId,
            ref: 'User',
        },
        productId: {
            type: ObjectId,
            ref: 'Product',
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

userReviewProductSchema.index({ userId: 1, productId: 1 }, { unique: true });

module.exports = mongoose.model('UserReviewProduct', userReviewProductSchema);
