const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema;
const slug = require('mongoose-slug-generator');

mongoose.plugin(slug);
const productSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            trim: true,
            required: true,
            unique: true,
            maxLength: 100,
        },
        slug: {
            type: String,
            slug: 'name',
            unique: true,
        },
        descripton: {
            type: String,
            trim: true,
            required: true,
            maxLength: 1000,
        },
        price: {
            type: mongoose.Decimal128,
            required: true,
            min: 0,
        },
        promotional_price: {
            type: mongoose.Decimal128,
            required: true,
            min: 0,
        },
        quantity: {
            type: Number,
            required: true,
            min: 0,
        },
        sold: {
            type: Number,
            required: true,
            default: 0,
        },
        isStored: {
            type: Boolean,
            default: true,
        },
        listImage: {
            type: Array,
            Element: String,
            default: [],
        },
        video: {
            type: String,
            trim: true,
            required: true,
        },
        categoryID: {
            type: ObjectId,
            ref: 'Category',
            required: true,
        },
        brandID: {
            type: ObjectId,
            ref: 'Brand',
            required: true,
        },
        styleValueIDs: {
            type: Array,
            Element: ObjectId,
            default: [],
            ref: 'StyleValue',
        },
        storeID: {
            required,
            type: ObjectId,
            ref: 'Store',
        },
        point: {
            type: Number,
            default: 0,
        },
        number_of_review: {
            type: Number,
            default: 0,
        },
        number_of_star: {
            type: Number,
            default: 0,
        },
    },
    { timestamps: true },
);

module.exports = mongoose.model('Product', productSchema);
