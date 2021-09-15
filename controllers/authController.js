const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const { errorHandler } = require('../helpers/errorHandler');

exports.signup = (req, res) => {
    // console.log('---REQUEST BODY---: ', req.body);
    const { firstname, lastname, email, phone, password } = req.body;
    const user = new User({ firstname, lastname, email, phone, password });
    user.save((error, user) => {
        if (error) {
            return res.status(500).json({
                error: errorHandler(error),
            });
        }

        // user.salt = undefined;
        // user.hashed_password = undefined;
        return res.json({
            success: 'Sign up successfully',
            // user,
        });
    });
};

exports.signin = (req, res) => {
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
            if (!user) {
                res.status(404).json({
                    error: 'User not found',
                });
            }

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

            const { _id, firstname, lastname, role } = user;
            return res.json({
                success: 'Sign in successfully',
                token,
                user: { _id, firstname, lastname, role },
            });
        })
        .catch((error) => {
            res.status(404).json({
                error: 'User not found',
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
