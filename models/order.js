const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema;

const orderSchema = new mongoose.Schema(
    {
        userId: {
            type: ObjectId,
            ref: 'User',
        },
        storeId: {
            type: ObjectId,
            ref: 'Store',
        },
        deliveryId: {
            type: ObjectId,
            ref: 'Delivery',
        },
        commissionId: {
            type: ObjectId,
            ref: 'Commission',
        },
        status: {
            type: String,
            default: 'Not processed',
            enum: [
                'Not processed',
                'Processing',
                'Shipped',
                'Delivered',
                'Cancelled',
            ],
        },
        address: {
            type: String,
            required: true,
        },
        phone: {
            type: String,
            required: true,
        },
        amountFromUser: {
            type: mongoose.Decimal128,
            required: true,
            min: 0,
        },
        amountFromStore: {
            type: mongoose.Decimal128,
            required: true,
            min: 0,
        },
        amountToStore: {
            type: mongoose.Decimal128,
            required: true,
            min: 0,
        },
        amountToGD: {
            type: mongoose.Decimal128,
            required: true,
            min: 0,
        },
        isPaidBefore: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true },
);

module.exports = mongoose.model('Order', orderSchema);
