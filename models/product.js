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
            maxLength: 3000,
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
        isActive: {
            type: Boolean,
        },
        isOpenStore: {
            type: Boolean,
        },
        isSelling: {
            type: Boolean,
            default: true,
        },
        list_images: {
            type: Array,
            Element: String,
            default: [],
        },
        video: {
            type: String,
            trim: true,
            required: true,
        },
        categoryId: {
            type: ObjectId,
            ref: 'Category',
            required: true,
        },
        brandId: {
            type: ObjectId,
            ref: 'Brand',
            required: true,
        },
        styleValueIds: {
            type: Array,
            Element: ObjectId,
            default: [],
            ref: 'StyleValue',
        },
        storeId: {
            required,
            type: ObjectId,
            ref: 'Store',
        },
        rating: {
            type: Number,
            default: 0,
            min: 0,
            max: 5,
        },
        number_of_reviews: {
            type: Number,
            default: 0,
        },
    },
    { timestamps: true },
);

module.exports = mongoose.model('Product', productSchema);
