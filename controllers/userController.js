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
    let {
        firstname,
        lastname,
        slug,
        avatar,
        cover,
        point,
        email,
        phone,
        id_card,
        role,
    } = req.user;

    if (role == 'admin') {
        return res.status(403).json({
            error: 'Admin resource! Access denied',
        });
    }

    if (email) email = email.slice(0, 6) + '******';
    if (phone) phone = '*******' + phone.slice(-3);
    if (id_card) id_card = id_card.slice(0, 3) + '******';

    return res.json({
        success: 'Get user successfully',
        user: {
            firstname,
            lastname,
            slug,
            avatar,
            cover,
            point,
            email,
            phone,
            id_card,
        },
    });
};

exports.getUserProfile = (req, res) => {
    req.user.hashed_password = undefined;
    req.user.salt = undefined;
    req.user.email_code = undefined;
    req.user.phone_code = undefined;
    req.user.forgot_password_code = undefined;

    return res.json({
        success: 'Get user profile successfully',
        user: req.user,
    });
};

exports.updateProfile = (req, res) => {
    // console.log('---REQUEST BODY---: ', req.body);
    const { firstname, lastname, id_card } = req.body;

    User.findOneAndUpdate(
        { _id: req.user._id },
        { $set: { firstname, lastname, id_card } },
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
                success: 'Update user successfully',
                // user,
            });
        })
        .catch((error) => {
            return res.status(400).json({
                error: errorHandler(error),
            });
        });
};

exports.updateAccount = (req, res) => {
    const { email, phone, newPassword } = req.body;

    const isEmailActive =
        email && req.user.email != email ? false : req.user.isEmailActive;
    const isPhoneActive =
        phone && req.user.phone != phone ? false : req.user.isPhoneActive;

    User.findOneAndUpdate(
        { _id: req.user._id },
        { $set: { email, phone, isEmailActive, isPhoneActive } },
    )
        .exec()
        .then((user) => {
            if (!user) {
                return res.status(500).json({
                    error: 'User not found',
                });
            }

            if (newPassword) {
                user.hashed_password = user.encryptPassword(
                    newPassword,
                    this.salt,
                );

                User.findOneAndUpdate(
                    { _id: user._id },
                    { $set: { hashed_password: user.hashed_password } },
                )
                    .exec()
                    .then((user) => {
                        if (!user) {
                            return res.status(500).json({
                                error: 'Update account successfully (but password failed)',
                            });
                        }

                        return res.json({
                            success:
                                'Update account (and password) successfully',
                        });
                    })
                    .catch((error) => {
                        return res.status(500).json({
                            error: 'Update account successfully (but password failed)',
                        });
                    });
            } else {
                return res.json({
                    success: 'Update account (without password) successfully',
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
        success: 'Load list address successfully',
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

            return res.status(400).json({
                error: errorHandler(error),
            });
        });
};

/*------
  COVER
  ------*/
exports.getCover = (req, res) => {
    let cover = req.user.cover;
    return res.json({
        success: 'load cover successfully',
        cover,
    });
};

exports.updateCover = (req, res) => {
    const oldpath = req.user.cover;

    User.findOneAndUpdate(
        { _id: req.user._id },
        { $set: { cover: req.filepath } },
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
                success: 'Update cover successfully',
                // user,
            });
        })
        .catch((error) => {
            try {
                fs.unlinkSync('public' + req.filepath);
            } catch {}

            return res.status(400).json({
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

exports.changeRole = (req, res) => {
    const userIds = req.changeRole.users;
    const role = req.changeRole.isUpgraded ? 'vendor' : 'customer';
    // console.log('---CHANGE ROLE---: ', userIds, role);

    User.updateMany({ _id: { $in: userIds } }, { $set: { role } })
        .exec()
        .then(() => {
            return res.json({
                success: 'Change user role successfully',
            });
        })
        .catch((error) => {
            return res.status(500).json({
                success: 'Change user role failed',
            });
        });
};

/*------
  LIST USERS
  ------*/
// users?search=...&role=...&sortBy=...&order=...&limit=...&page=...
exports.listUser = (req, res) => {
    const search = req.query.search ? req.query.search : '';
    const role =
        req.query.role && req.query.role != 'admin'
            ? [req.query.role]
            : ['customer', 'vendor'];
    const sortBy = req.query.sortBy ? req.query.sortBy : '_id';
    const order = req.query.order ? req.query.order : 'asc'; //desc
    const limit = req.query.limit ? parseInt(req.query.limit) : 6;
    const page =
        req.query.page && req.query.page > 0 ? parseInt(req.query.page) : 1;
    const skip = (page - 1) * limit;

    const filter = {
        search,
        role,
        sortBy,
        order,
        limit,
        pageCurrent: page,
    };

    const filterArgs = {
        $or: [
            { firstname: { $regex: search, $options: 'i' } },
            { lastname: { $regex: search, $options: 'i' } },
            { email: { $regex: '^' + search.slice(0, 6), $options: 'i' } },
            { phone: { $regex: search.slice(0, 3) + '$', $options: 'i' } },
        ],
        role: { $ne: 'admin' },
        role: { $in: role },
    };

    User.countDocuments(filterArgs, (error, count) => {
        if (error) {
            return res.status(404).json({
                error: 'Products not found',
            });
        }

        const size = count;
        const pageCount = Math.ceil(size / limit);
        filter.pageCount = pageCount;
        filter.note =
            'Note: for search by email and phone number, email can only search with first 6 characters and phone number can only search with last 3 digits';

        User.find(filterArgs)
            .select(
                '_id firstname lastname email phone id_card point avatar cover role creatAt',
            )
            .sort([[sortBy, order]])
            .skip(skip)
            .limit(limit)
            .exec()
            .then((users) => {
                users.forEach((u) => {
                    if (u.email) u.email = u.email.slice(0, 6) + '******';
                    if (u.phone) u.phone = '*******' + u.phone.slice(-3);
                    if (u.id_card) u.id_card = u.id_card.slice(0, 3) + '******';
                });

                return res.json({
                    success: 'Load list users successfully',
                    filter,
                    size,
                    users,
                });
            })
            .catch((error) => {
                return res.status(500).json({
                    error: 'Load list users failed',
                });
            });
    });
};
