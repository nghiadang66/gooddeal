const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const { sendConfirmationEmail } = require('../sendEmail/sendConfirmationEmail');
const { errorHandler } = require('../helpers/errorHandler');

exports.signup = (req, res) => {
    // console.log('---REQUEST BODY---: ', req.body);
    const user = new User(req.body);
    if (req.body.email) {
        const token = jwt.sign(
            { email: req.body.email },
            process.env.JWT_EMAIL_CONFIRM_SECRET,
        );
        user.email_code = token;
    } else {
        //send SMS
    }

    user.save((error, user) => {
        if (error) {
            return res.status(500).json({
                error: errorHandler(error),
            });
        }

        if (user.email_code) {
            sendConfirmationEmail(
                user.firstname + ' ' + user.lastname,
                user.email,
                user.email_code,
            );
        }

        // user.salt = undefined;
        // user.hashed_password = undefined;
        res.status(200).json({
            success: 'Sign up successfully',
            // user,
        });
    });
};

exports.verifyUser = (req, res, next) => {
    User.findOne({
        email_code: req.params.emailCode,
    })
        .then((user) => {
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            user.status = 'Active';
            user.email_code = '';
            user.save((err, user) => {
                if (err) {
                    res.status(500).json({ error: err });
                    return;
                }

                // user.salt = undefined;
                // user.hashed_password = undefined;
                res.status(200).json({
                    success: 'Confirm email successfully',
                    // user,
                });
            });
        })
        .catch((e) => console.log('error', e));
};

exports.signin = (req, res) => {
    //authentication
    // console.log('---REQUEST BODY---: ', req.body);
    const { email, phone, password } = req.body;

    User.findOne({
        $or: [
            { email: { $exists: true, $ne: null, $eq: email } },
            { phone: { $exists: true, $ne: null, $eq: phone } },
        ],
    })
        .exec()
        .then((user) => {
            // console.log('---USER---: ', user);
            if (!user.authenticate(password)) {
                return res.status(401).json({
                    error: "Password doesn't match",
                });
            }

            //authorization
            const token = jwt.sign(
                {
                    _id: user._id,
                    role: user.role,
                },
                process.env.JWT_SECRET,
                {
                    expiresIn: '42h',
                },
            );

            // user.salt = undefined;
            // user.hashed_password = undefined;
            const { _id } = user;
            res.json({
                success: 'Sign in successfully',
                token,
                user_id: _id,
            });
        })
        .catch((error) => {
            res.status(404).json({
                error: 'User with that email or that phone does not exist.',
            });
        });
};

exports.isAuth = (req, res, next) => {
    // console.log('---REQUEST HEADERS---: ', req.headers);
    if (
        req.headers &&
        req.headers.authorization &&
        req.headers.authorization.split(' ')[1]
    ) {
        const token = req.headers.authorization.split(' ')[1];
        // console.log('---TOKEN---: ', token);
        jwt.verify(token, process.env.JWT_SECRET, (error, decoded) => {
            if (error) {
                return res.status(401).json({
                    error: 'Unauthorized!',
                });
            }

            // console.log('---DECODED---: ', decoded);
            // console.log('---REQUEST USER---: ', req.user);
            if (req.user._id == decoded._id) {
                next();
            } else {
                return res.status(403).json({
                    error: 'Access denied',
                });
            }
        });
    } else {
        return res.status(401).json({
            error: 'No token provided!',
        });
    }
};

exports.isVendor = (req, res, next) => {
    if (req.user.role === 'customer') {
        return res.status(403).json({
            error: 'Vendor resource! Access denied',
        });
    }
    next();
};

exports.isManager = (req, res, next) => {
    if (req.user._id != req.store.managerId) {
        return res.status(403).json({
            error: 'Manager resource! Access denied',
        });
    }
    next();
};

exports.isAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({
            error: 'Admin resource! Access denied',
        });
    }
    next();
};
