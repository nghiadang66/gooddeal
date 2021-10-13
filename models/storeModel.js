const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema;
const slug = require('mongoose-slug-generator');

mongoose.plugin(slug);

const storeSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            trim: true,
            required: true,
            unique: true,
            maxLength: 100,
            validate: [nameAvailable, 'Store name is invalid'],
        },
        slug: {
            type: String,
            slug: 'name',
            unique: true,
        },
        bio: {
            type: String,
            trim: true,
            required: true,
            maxLength: 1000,
        },
        ownerId: {
            type: ObjectId,
            ref: 'User',
            required: true,
        },
        staffIds: {
            type: [
                {
                    type: ObjectId,
                    ref: 'User',
                },
            ],
            default: [],
        },
        isActive: {
            type: Boolean,
            default: false,
        },
        isOpen: {
            type: Boolean,
            default: false,
        },
        avatar: {
            type: String,
            default: '/uploads/default.jpg',
            required: true,
        },
        cover: {
            type: String,
            default: '/uploads/default.jpg',
            required: true,
        },
        featured_images: {
            type: [String],
            validate: [featured_imagesLimit, 'The limit is 6 images'],
        },
        commissionId: {
            type: ObjectId,
            ref: 'Commission',
            required: true,
        },
        e_wallet: {
            type: mongoose.Decimal128,
            min: 0,
            default: 0,
        },
        point: {
            type: Number,
            default: 0,
        },
        number_of_successful_orders: {
            type: Number,
            default: 0,
            min: 0,
        },
        number_of_failed_orders: {
            type: Number,
            default: 0,
            min: 0,
        },
        proceeds: {
            type: mongoose.Decimal128,
            default: 0,
            min: 0,
        },
        number_of_followers: {
            type: Number,
            min: 0,
            default: 0,
        },
    },
    { timestamps: true },
);

//validators
function featured_imagesLimit(val) {
    return val.length <= 6;
}

function nameAvailable(val) {
    const regexes = [/g[o0][o0]d[^\w]*deal/i, /admin/i];

    let flag = true;
    regexes.forEach((regex) => {
        if (regex.test(val)) {
            flag = false;
        }
    });

    return flag;
}

module.exports = mongoose.model('Store', storeSchema);
