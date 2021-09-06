const User = require('../models/userModel');
var jwt = require('jsonwebtoken');
const { errorHandler } = require('../helpers/errorHandler');

const signup = (req, res) => {
    // console.log('---REQUEST BODY---: ', req.body);
    const user = new User(req.body);
    user.save((error, user) => {
        if (error) {
            return res.status(400).json({
                error: errorHandler(error),
            });
        }

        user.salt = undefined;
        user.hashed_password = undefined;
        res.status(200).json({
            success: 'Sign up successfully',
            user,
        });
    });
};

const signin = (req, res) => {
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
                    expiresIn: '1h',
                },
            );

            const { _id, firstname, lastname, role, slug } = user;
            res.json({
                success: 'Sign in successfully',
                token,
                user: { _id, firstname, lastname, role, slug },
            });
        })
        .catch((error) => {
            res.status(400).json({
                error: 'User with that email or that phone does not exist.',
            });
        });
};

const isAuth = (req, res, next) => {
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

const isVendor = (req, res, next) => {
    if (req.user.role === 'customer') {
        return res.status(403).json({
            error: 'Vendor resource! Access denied',
        });
    }
    next();
};

const isAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({
            error: 'Admin resource! Access denied',
        });
    }
    next();
};

module.exports = {
    signup,
    signin,
    isAuth,
    isVendor,
    isAdmin,
};
