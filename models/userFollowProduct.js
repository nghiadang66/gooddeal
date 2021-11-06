const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema;

const userFollowStoreSchema = new mongoose.Schema(
    {
        userId: {
            type: ObjectId,
            ref: 'User',
        },
        productId: {
            type: ObjectId,
            ref: 'Product',
        },
    },
    { timestamps: true },
);

userFollowStoreSchema.index({ userId: 1, productId: 1 }, { unique: true });

module.exports = mongoose.model('UserFollowStore', userFollowStoreSchema);
