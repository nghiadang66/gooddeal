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
            validate: [nameAvailable, 'Name is invalid'],
        },
        slug: {
            type: String,
            slug: 'name',
            unique: true,
        },
        bio: {
            type: String,
            required: true,
            maxLength: 1000,
        },
        managerId: {
            type: ObjectId,
            ref: 'User',
            required: true,
            unique: true,
        },
        staffId: {
            type: [
                {
                    type: ObjectId,
                    ref: 'User',
                },
            ],
            default: [],
        },
        status: {
            type: String,
            default: 'pending',
            enum: ['pending', 'open', 'close', 'banned'],
        },
        avatar: {
            type: String,
            default: '/uploads/store/default.jpg',
        },
        cover: {
            type: String,
            default: '/uploads/store/default.jpg',
        },
        featured_images: {
            type: [String],
            validate: [featured_imagesLimit, 'The limit is 10 images'],
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
    },
    { timestamps: true },
);

//validators
function featured_imagesLimit(val) {
    return val.length <= 10;
}

function nameAvailable(val) {
    const defaultName = ['gooddeal', 'good deal', 'good-deal'];
    let flag = true;
    defaultName.forEach((name) => {
        if (val.toLowerCase().includes(name)) {
            flag = false;
        }
    });
    return flag;
}

module.exports = mongoose.model('Store', storeSchema);
