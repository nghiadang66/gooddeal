const User = require('../models/userModel');
const RefreshToken = require('../models/refreshTokenModel');
const jwt = require('jsonwebtoken');
const { errorHandler } = require('../helpers/errorHandler');

exports.signup = (req, res, next) => {
    const { firstname, lastname, email, phone, password } = req.body;
    const user = new User({ firstname, lastname, email, phone, password });
    user.save((error, user) => {
        if (error) {
            return res.status(400).json({
                error: errorHandler(error),
            });
        }

        req.createSlug = {
            slug: user.slug,
            id: user._id,
            ref: 'user',
        };
        next();

        return res.json({
            success: 'Sign up successfully',
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
            if (!user) {
                return res.status(404).json({
                    error: 'User not found',
                });
            }

            if (!user.authenticate(password)) {
                return res.status(401).json({
                    error: "Password doesn't match",
                });
            }

            const accessToken = jwt.sign({ _id: user._id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '42h' });
            const refreshToken = jwt.sign({ _id: user._id }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '9999 days' });

            const token = new RefreshToken({ jwt: refreshToken });
            token.save((error, t) => {
                if (error || !t) {
                    return res.status(500).json({
                        error: 'Create JWT failed, please try sign in again',
                    });
                }

                const { _id, role } = user;
                return res.json({
                    success: 'Sign in successfully',
                    accessToken,
                    refreshToken,
                    user: { _id, role },
                });
            });
        })
        .catch((error) => {
            res.status(404).json({
                error: 'User not found',
            });
        });
};

exports.refreshToken = (req, res) => {
    const refreshToken = req.body.refreshToken;
    if (refreshToken == null) return res.status(401).json({ error: 'refreshToken is required' });

    RefreshToken.findOne({ jwt: refreshToken })
        .exec()
        .then(token => {
            if (!token) {
                return res.status(404).json({
                    error: 'refreshToken is invalid',
                });
            }

            jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (error, decoded) => {
                if (error) {
                    return res.status(403).json({
                        error: 'refreshToken is invalid',
                    });
                }
                else {
                    const accessToken = jwt.sign({ _id: decoded._id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '42h' });
                    const newRefreshToken = jwt.sign({ _id: decoded._id }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '9999 days' });

                    RefreshToken.findOneAndUpdate({ jwt: refreshToken }, { $set: { jwt: newRefreshToken } })
                        .exec()
                        .then(t => {
                            if (!t) {
                                return res.status(500).json({
                                    error: 'Create JWT failed, please try refresh token again',
                                });
                            }

                            return res.json({
                                success: 'Refresh token successfully',
                                accessToken,
                                refreshToken: newRefreshToken,
                            });
                        })
                        .catch(error => {
                            return res.status(500).json({
                                error: 'Create JWT failed, please try refresh token again',
                            });
                        });
                }
            });
        })
        .catch(error => {
            return res.status(401).json({
                error: 'refreshToken is invalid',
            });
        })
};

exports.forgotPassword = (req, res, next) => {
    const { email, phone } = req.body;

    const forgot_password_code = jwt.sign(
        { email, phone },
        process.env.JWT_FORGOT_PASSWORD_SECRET,
    );

    User.findOneAndUpdate(
        {
            $or: [
                { email: { $exists: true, $ne: null, $eq: email } },
                { phone: { $exists: true, $ne: null, $eq: phone } },
            ],
        },
        { $set: { forgot_password_code } },
        { new: true },
    )
        .exec()
        .then((user) => {
            if (!user) {
                return res.status(404).json({
                    error: 'User not found',
                });
            }

            //send email or phone
            const msg = {
                email: email ? email : '',
                phone: phone ? phone : '',
                name: user.firstname + ' ' + user.lastname,
                title: 'Request to change password',
                text: 'Please click on the following link to change your password.',
                code: forgot_password_code,
            };
            req.msg = msg;
            next();

            return res.json({
                success: 'Request successfully, waiting for email or sms',
            });
        })
        .catch((error) => {
            return res.status(404).json({
                error: 'User not found',
            });
        });
};

exports.changePassword = (req, res) => {
    const forgot_password_code = req.params.forgotPasswordCode;
    const { password } = req.body;

    User.findOneAndUpdate(
        { forgot_password_code: forgot_password_code },
        { $unset: { forgot_password_code: '' } },
    )
        .then((user) => {
            if (!user) {
                return res.status(404).json({
                    error: 'User not found',
                });
            }

            user.hashed_password = user.encryptPassword(password, user.salt);
            user.save((e, u) => {
                if (e) {
                    return res.status(500).json({
                        error: 'Update password failed, Please request to resend mail/sms',
                    });
                }
                return res.json({
                    success: 'Update password successfully',
                });
            });
        })
        .catch((error) => {
            return res.status(404).json({
                error: 'User not found',
            });
        });
};

exports.verifyPassword = (req, res, next) => {
    const { currentPassword } = req.body;
    User.findById(req.user._id, (error, user) => {
        if (error || !user) {
            return res.status(404).json({
                error: 'User not found',
            });
        }

        if (!user.authenticate(currentPassword)) {
            return res.status(401).json({
                error: "Password doesn't match",
            });
        }

        next();
    });
};

exports.isAuth = (req, res, next) => {
    if (
        req.headers &&
        req.headers.authorization &&
        req.headers.authorization.split(' ')[1]
    ) {
        const token = req.headers.authorization.split(' ')[1];
        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (error, decoded) => {
            if (error) {
                return res.status(401).json({
                    error: 'Unauthorized! Please sign in again',
                });
            }

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
            error: 'No token provided! Please sign in again',
        });
    }
};

exports.isCustomer = (req, res, next) => {
    if (req.user.role != 'customer') {
        return res.status(403).json({
            error: 'This action is only for Customer',
        });
    }
    next();
};

exports.isVendor = (req, res, next) => {
    if (req.user.role == 'customer') {
        return res.status(403).json({
            error: 'Vendor resource! Access denied',
        });
    }
    next();
};

//owner and staff of store
exports.isManager = (req, res, next) => {
    if (
        !req.user._id.equals(req.store.ownerId) &&
        req.store.staffIds.indexOf(req.user._id) == -1
    ) {
        return res.status(403).json({
            error: 'Store Manager resource! Access denied',
        });
    }
    next();
};

exports.isOwner = (req, res, next) => {
    if (!req.user._id.equals(req.store.ownerId)) {
        return res.status(403).json({
            error: 'Store Owner resource! Access denied',
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
