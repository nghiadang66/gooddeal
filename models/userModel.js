const mongoose = require('mongoose');
const crypto = require('crypto');
const { v4: uuid_v4 } = require('uuid');
const slug = require('mongoose-slug-generator');

mongoose.plugin(slug);

const userSchema = new mongoose.Schema(
    {
        firstname: {
            type: String,
            trim: true,
            required: true,
            maxLength: 32,
        },
        lastname: {
            type: String,
            trim: true,
            required: true,
            maxLength: 32,
        },
        slug: {
            type: String,
            slug: ['firstname', 'lastname'],
            unique: true,
        },
        email: {
            type: String,
            trim: true,
            unique: true,
            sparse: true,
        },
        phone: {
            type: String,
            trim: true,
            unique: true,
            sparse: true,
        },
        id_card: {
            type: String,
            trim: true,
            unique: true,
            sparse: true,
        },
        salt: String,
        hashed_password: {
            type: String,
            required: true,
        },
        role: {
            type: String,
            default: 'customer',
            enum: ['customer', 'vendor', 'admin'],
        },
    },
    { timestamps: true },
);

//virtual field
userSchema
    .virtual('password')
    .set(function (password) {
        this._password = password;
        this.salt = uuid_v4();
        this.hashed_password = this.encryptPassword(password);
    })
    .get(function () {
        return this._password;
    });

//methods
userSchema.methods = {
    encryptPassword: function (password, salt = this.salt) {
        if (!password) return '';

        try {
            return crypto
                .createHmac('sha1', salt)
                .update(password)
                .digest('hex');
        } catch (err) {
            return '';
        }
    },
    authenticate: function (plaintext) {
        return this.encryptPassword(plaintext) === this.hashed_password;
    },
};

module.exports = mongoose.model('User', userSchema);
