const User = require('../models/userModel');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const { errorHandler } = require('../helpers/errorHandler');

const transport = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: process.env.ADMIN_EMAIL,
        pass: process.env.ADMIN_EMAIL_PASSWORD,
    },
});

const sendEmail = (email, name, title, text, code = null) => {
    return transport.sendMail({
        from: process.env.ADMIN_EMAIL,
        to: email,
        subject: `GoodDeal Ecommerce - ${title}`,
        html: `<div>
                    <h2>GOODDEAL</h2>
                    <h1>${title}</h1>
                    <p>Hi ${name},</p>
                    <p>Thank you for choosing GoodDeal.</p>
                    <p>${text}</p>
                    ${code ? `<p>Your CODE: ${code}</p>` : ''}
                </div>`,
    });
};

exports.sendNotificationEmail = (req, res, next) => {
    const { email, phone, name, title, text, code } = req.msg;
    if (!email && phone) {
        next();
    } else if (!email && !phone) {
        return res.status(400).json({
            error: 'No email provided!',
        });
    } else {
        // console.log('---EMAIL---: ', email);
        sendEmail(email, name, title, text, code)
            .then(() => {
                return res.json({
                    success: 'Send email successfully',
                });
            })
            .catch((error) => {
                return res.status(500).json({
                    error: 'Send email failed',
                });
            });
    }
};

// Allow less secure apps to access account
// Change tag a for front-end
exports.sendConfirmationEmail = (req, res) => {
    if (req.user.email) {
        if (req.user.isEmailActive) {
            return res.status(400).json({
                error: 'User email is confirmed',
            });
        }

        const email_code = jwt.sign(
            { email: req.body.email },
            process.env.JWT_EMAIL_CONFIRM_SECRET,
        );

        User.findOneAndUpdate(
            { _id: req.user._id },
            { $set: { email_code: email_code } },
            { new: true },
        )
            .exec()
            .then((user) => {
                if (!user) {
                    return res.status(500).json({
                        error: 'User not found',
                    });
                }

                const title = 'Verify your email address';
                const text =
                    'To get access to your account please verify your email address by clicking the link below.';
                const name = user.firstname + ' ' + user.lastname;

                sendEmail(user.email, name, title, text, user.email_code);
            })
            .then(() => {
                return res.json({
                    success: 'Send email successfully',
                });
            })
            .catch((error) => {
                return res.status(500).json({
                    error: 'Send email failed',
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
                    return res.status(500).json({
                        error: 'User not found',
                    });
                }

                return res.json({
                    success: 'Confirm email successfully',
                });
            })
            .catch((error) => {
                return res.status(500).json({
                    error: errorHandler(error),
                });
            });
    } else {
        return res.status(400).json({
            error: 'Confirm email failed',
        });
    }
};
