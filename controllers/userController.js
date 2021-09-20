const User = require('../models/userModel');
const fs = require('fs');
const { errorHandler } = require('../helpers/errorHandler');

/*------
  USER
  ------*/
exports.userById = (req, res, next, id) => {
    User.findById(id, (error, user) => {
        if (error || !user) {
            return res.status(404).json({
                error: 'User not found',
            });
        }

        req.user = user;
        next();
    });
};

exports.getUser = (req, res) => {
    req.user.hashed_password = undefined;
    req.user.salt = undefined;

    let user = req.user;
    res.json({
        success: 'Get user successfully',
        user,
    });
};

exports.updateUser = (req, res) => {
    // console.log('---REQUEST BODY---: ', req.body);
    const { firstname, lastname, email, phone, id_card, password } = req.body;

    const isEmailActive =
        email && req.user.email != email ? false : req.user.isEmailActive;
    const isPhoneActive =
        phone && req.user.phone != phone ? false : req.user.isPhoneActive;

    User.findOneAndUpdate(
        { _id: req.user._id },
        {
            $set: {
                firstname,
                lastname,
                email,
                phone,
                id_card,
                isEmailActive,
                isPhoneActive,
            },
        },
        { new: true },
    )
        .exec()
        .then((user) => {
            if (!user) {
                return res.status(500).json({
                    error: 'User not found',
                });
            }

            if (password) {
                user.hashed_password = user.encryptPassword(
                    password,
                    user.salt,
                );

                user.save((e, u) => {
                    if (e) {
                        return res.status(500).json({
                            error: 'Update user successfully but password failed',
                        });
                    }

                    // u.hashed_password = undefined;
                    // u.salt = undefined;
                    return res.json({
                        success: 'Update user and password successfully',
                        // user: u,
                    });
                });
            } else {
                // user.hashed_password = undefined;
                // user.salt = undefined;
                return res.json({
                    success: 'Update user without password successfully',
                    // user,
                });
            }
        })
        .catch((error) => {
            return res.status(400).json({
                error: errorHandler(error),
            });
        });
};

/*------
  ADDRESS
  ------*/
exports.listAddress = (req, res) => {
    // console.log('---REQUEST USER---: ', req.user);
    const addresses = req.user.addresses;
    return res.json({
        success: 'load list address successfully',
        addresses: addresses,
    });
};

exports.addAddress = (req, res) => {
    let addresses = req.user.addresses;
    if (addresses.length >= 6) {
        return res.status(400).json({
            error: 'The limit is 6 addresses',
        });
    }

    addresses.push(req.body.address.trim());
    addresses = [...new Set(addresses)];

    User.findOneAndUpdate(
        { _id: req.user._id },
        { $set: { addresses: addresses } },
        { new: true },
    )
        .exec()
        .then((user) => {
            if (!user) {
                return res.status(500).json({
                    error: 'User not found',
                });
            }

            // user.hashed_password = undefined;
            // user.salt = undefined;
            return res.json({
                success: 'Add address successfully',
                // user,
            });
        })
        .catch((error) => {
            return res.status(400).json({
                error: errorHandler(error),
            });
        });
};

exports.updateAddress = (req, res) => {
    let addressIndex;
    if (!req.query.index) {
        return res.status(400).json({
            error: 'index not found',
        });
    } else {
        addressIndex = req.query.index;
    }

    let addresses = req.user.addresses;
    if (addresses.length <= addressIndex) {
        return res.status(404).json({
            error: 'Address not found',
        });
    }

    const index = addresses.indexOf(req.body.address.trim());
    if (index != -1 && index != addressIndex) {
        return res.status(400).json({
            error: 'Address already exists',
        });
    }

    addresses.splice(addressIndex, 1, req.body.address.trim());
    User.findOneAndUpdate(
        { _id: req.user._id },
        { $set: { addresses: addresses } },
        { new: true },
    )
        .exec()
        .then((user) => {
            if (!user) {
                return res.status(500).json({
                    error: 'User not found',
                });
            }

            // user.hashed_password = undefined;
            // user.salt = undefined;
            return res.json({
                success: 'Update address successfully',
                // user,
            });
        })
        .catch((error) => {
            return res.status(400).json({
                error: errorHandler(error),
            });
        });
};

exports.removeAddress = (req, res) => {
    let addressIndex;
    if (!req.query.index) {
        return res.status(400).json({
            error: 'index not found',
        });
    } else {
        addressIndex = req.query.index;
    }

    let addresses = req.user.addresses;
    if (addresses.length <= addressIndex) {
        return res.status(404).json({
            error: 'Address not found',
        });
    }

    addresses.splice(addressIndex, 1);
    User.findOneAndUpdate(
        { _id: req.user._id },
        { $set: { addresses: addresses } },
        { new: true },
    )
        .exec()
        .then((user) => {
            if (!user) {
                return res.status(500).json({
                    error: 'User not found',
                });
            }

            // user.hashed_password = undefined;
            // user.salt = undefined;
            return res.json({
                success: 'Remove address successfully',
                // user,
            });
        })
        .catch((error) => {
            return res.status(400).json({
                error: errorHandler(error),
            });
        });
};

/*------
  AVATAR
  ------*/
exports.getAvatar = (req, res) => {
    let avatar = req.user.avatar;
    return res.json({
        success: 'load avatar successfully',
        avatar,
    });
};

exports.updateAvatar = (req, res) => {
    const oldpath = req.user.avatar;

    User.findOneAndUpdate(
        { _id: req.user._id },
        { $set: { avatar: req.filepath } },
        { new: true },
    )
        .exec()
        .then((user) => {
            if (!user) {
                try {
                    fs.unlinkSync('public' + req.filepath);
                } catch {}

                return res.status(500).json({
                    error: 'User not found',
                });
            }

            if (oldpath != '/uploads/default.jpg') {
                try {
                    fs.unlinkSync('public' + oldpath);
                } catch {}
            }

            // user.hashed_password = undefined;
            // user.salt = undefined;
            return res.json({
                success: 'Update avatar successfully',
                // user,
            });
        })
        .catch((error) => {
            try {
                fs.unlinkSync('public' + req.filepath);
            } catch {}

            return res.status(500).json({
                error: errorHandler(error),
            });
        });
};

/*------
  ROLE
  ------*/
exports.getRole = (req, res) => {
    let role = req.user.role;
    return res.json({
        success: 'Get role successfully',
        role,
    });
};

/*------
  LIST SEARCH
  ------*/
// listsearch = /users/search?q=...&r=...&l=...
exports.listSearch = (req, res) => {
    const query = req.query.q ? req.query.q : '';
    if (req.query.r == 'admin') {
        req.query.r = '';
    }
    const role = req.query.r ? [req.query.r] : ['customer', 'vendor'];
    const limit = req.query.l ? parseInt(req.query.l) : 6;

    User.find({
        $or: [
            { firstname: { $regex: query, $options: 'i' } },
            { lastname: { $regex: query, $options: 'i' } },
            { email: { $regex: query, $options: 'i' } },
            { phone: { $regex: query, $options: 'i' } },
        ],
        $ne: { role: 'admin' },
        role: { $in: role },
    })
        .select('_id firstname lastname email phone')
        .limit(limit)
        .exec()
        .then((users) => {
            return res.json({
                success: 'Search users successfully',
                users,
            });
        })
        .catch((error) => {
            return res.status(500).json({
                error: 'Search users failed',
            });
        });
};
