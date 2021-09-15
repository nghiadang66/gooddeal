const User = require('../models/userModel');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');

const transport = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: process.env.ADMIN_EMAIL,
        pass: process.env.ADMIN_EMAIL_PASSWORD,
    },
});

// Allow less secure apps to access account
// Change tag a for front-end
exports.sendConfirmationEmail = (req, res) => {
    if (req.user.email) {
        const email_code = jwt.sign(
            { email: req.body.email },
            process.env.JWT_EMAIL_CONFIRM_SECRET,
        );

        User.findOneAndUpdate(
            { _id: req.user._id },
            { $set: { email_code: email_code, isEmailActive: false } },
            { new: true },
        )
            .exec()
            .then((user) => {
                if (!user) {
                    return res.status(404).json({
                        error: 'User not found',
                    });
                }

                transport
                    .sendMail({
                        from: process.env.ADMIN_EMAIL,
                        to: user.email,
                        subject:
                            'GoodDeal Ecommerce - Verify your email address',
                        html: `<div>
                                <h2>GOODDEAL</h2>
                                <h1>Verify your email address</h1>
                                <p>Hi ${
                                    user.firstname + ' ' + user.lastname
                                },</p>
                                <p>Thank you for registration.</p>
                                <p>To get access to your account please verify your email address by clicking the link below.</p>
                                <p>Your REQUEST_CODE: ${user.email_code}</p>
                            </div>`,
                    })
                    .then(() => {
                        return res.json({
                            success: 'Send email successfully',
                        });
                    })
                    .catch((error) => {
                        return res.status(400).json({
                            error: 'Send email failed',
                        });
                    });
            });
    } else {
        return res.status(400).json({
            error: 'No email provided!',
        });
    }
};

exports.verifyEmail = (req, res) => {
    if (req.user.email_code == req.params.emailCode) {
        User.findOneAndUpdate(
            { _id: req.user._id },
            { $set: { isEmailActive: true }, $unset: { email_code: '' } },
        )
            .exec()
            .then((user) => {
                if (!user) {
                    return res.status(404).json({
                        error: 'User not found',
                    });
                }

                return res.json({
                    success: 'Confirm email successfully',
                });
            })
            .catch((error) => {
                return res.status(404).json({
                    error: 'User not found',
                });
            });
    } else {
        return res.status(400).json({
            error: 'Confirm email failed',
        });
    }
};
