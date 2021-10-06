const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema;
const slug = require('mongoose-slug-generator');

mongoose.plugin(slug);

const categorySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            trim: true,
            required: true,
            unique: true,
            maxLength: 32,
        },
        slug: {
            type: String,
            slug: 'name',
            unique: true,
        },

        image: {
            type: String,
            trim: true,
            required: true,
            unique: true,
        },
        categoryID: {
            type: ObjectId,
            ref: 'Category',
            required: true,
            unique: true,
        },
    },
    { timestamps: true },
);

module.exports = mongoose.model('Category', categorySchema);
