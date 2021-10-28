const User = require('../models/user');
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

// Change tag a for front-end
const sendEmail = (email, name, title, text, code = null) => {
    return transport.sendMail({
        from: process.env.ADMIN_EMAIL,
        to: email,
        subject: `GoodDeal Ecommerce - ${title}`,
        html: `<div>
                    <h2>GOODDEAL!</h2>
                    <h1>${title}</h1>
                    <p>Hi ${name},</p>
                    <p>Thank you for choosing GoodDeal.</p>
                    <p>${text}</p>
                    ${code ? `<button style="background-color:#0d6efd; border:none; border-radius:4px; padding:0;">
                            <a 
                                style="color:#fff; text-decoration:none; font-size:16px; padding: 16px 32px; display: inline-block;"
                                href='http://localhost:${process.env.CLIENT_PORT_2}/verify/email/${code}'
                            >
                            Verify now!
                            </a>
                        </button>
                        ` : ''}
                </div>`,
    });
};

exports.sendNotificationEmail = (req, res, next) => {
    console.log('---SEND EMAIL---');
    const { email, phone, name, title, text, code } = req.msg;
    if (!email && phone) {
        next();
    } else if (!email && !phone) {
        console.log('---NO EMAIL PROVIDED---');
    } else {
        sendEmail(email, name, title, text, code)
            .then(() => {
                console.log('---SEND EMAIL SUCCESSFULLY---');
            })
            .catch((error) => {
                console.log('---SEND EMAIL FAILED---');
            });
    }
};

// Allow less secure apps to access account
exports.sendConfirmationEmail = (req, res) => {
    console.log('---SEND EMAIL---');
    if (req.user.email) {
        if (req.user.isEmailActive) {
            return res.status(400).json({
                error: 'Email Verified',
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
                else {
                    const title = 'Verify your email address';
                    const text =
                        'To get access to your account please verify your email address by clicking the link below.';
                    const name = user.firstname + ' ' + user.lastname;

                    sendEmail(user.email, name, title, text, user.email_code)
                        .then(() => {
                            console.log('---SEND EMAIL SUCCESSFULLY---');
                            return res.json({
                                success: 'Send email successfully',
                            });
                        })
                        .catch((error) => {
                            console.log('---SEND EMAIL FAILED---', error);
                            return res.status(500).json({
                                error: 'Send email failed',
                            });
                        });
                }
            })
            .catch((error) => {
                console.log('---SEND EMAIL FAILED---');
                return res.status(500).json({
                    error: 'Send email failed',
                });
            });
    } else {
        console.log('---NO EMAIL PROVIDED---');
        return res.status(400).json({
            error: 'No email provided!',
        });
    }
};

exports.verifyEmail = (req, res) => {
    User.findOneAndUpdate(
        { email_code: req.params.emailCode },
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
};
