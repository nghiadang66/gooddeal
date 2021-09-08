const User = require('../models/userModel');

const userById = (req, res, next, id) => {
    User.findById(id, (error, user) => {
        if (error || !user) {
            return res.status(400).json({
                error: 'User not found',
            });
        }

        req.user = user;
        next();
    });
};

const userRead = (req, res) => {
    req.user.hashed_password = undefined;
    req.user.salt = undefined;

    let user = req.user;
    res.json({
        success: 'Read user successfully',
        user,
    });
};

const userUpdate = (req, res) => {
    // console.log('---REQUEST BODY---: ', req.body);
    User.findOneAndUpdate(
        { _id: req.user._id },
        { $set: req.body },
        { new: true },
    )
        .exec()
        .then((user) => {
            if (req.body.password) {
                user.hashed_password = user.encryptPassword(
                    password,
                    user.salt,
                );
                user.save((e, u) => {
                    if (e) {
                        return res.status(400).json({
                            error: 'Update user successfully but password failed',
                        });
                    }

                    u.hashed_password = undefined;
                    u.salt = undefined;
                    return res.json({
                        success: 'Update user and password successfully',
                        user: u,
                    });
                });
            } else {
                user.hashed_password = undefined;
                user.salt = undefined;
                return res.json({
                    success: 'Update user successfully',
                    user,
                });
            }
        })
        .catch((error) => {
            return res.status(400).json({
                error: 'Update user failed, the cause may be because email, phone or id_card already exists',
            });
        });
};

const listAddress = (req, res) => {
    // console.log('---REQUEST USER---: ', req.user);
    const addresses = req.user.addresses;
    return res.json({
        success: 'load list address successfully',
        addresses: addresses,
    });
};

const addAddress = (req, res) => {
    let addresses = [];
    req.body.addresses.forEach((address) => {
        let index = req.user.addresses.indexOf(address.trim());
        if (index == -1) {
            addresses.push(address);
        }
    });

    User.findOneAndUpdate(
        { _id: req.user._id },
        { $push: { addresses: addresses } },
        { new: true },
    )
        .exec()
        .then((user) => {
            return res.json({
                success: 'Add address successfully',
                user,
            });
        })
        .catch((error) => {
            return res.status(400).json({
                error: 'Add address failed',
            });
        });
};

const addressByIndex = (req, res, next, id) => {
    req.addressIndex = id;
    next();
};

const removeAddress = (req, res) => {
    let addresses = req.user.addresses;
    addresses.splice(req.addressIndex, 1);

    User.findOneAndUpdate(
        { _id: req.user._id },
        { $set: { addresses: addresses } },
        { new: true },
    )
        .exec()
        .then((user) => {
            return res.json({
                success: 'Remove address successfully',
                user,
            });
        })
        .catch((error) => {
            return res.status(400).json({
                error: 'Remove address failed',
            });
        });
};

module.exports = {
    userById,
    userRead,
    userUpdate,
    addAddress,
    listAddress,
    removeAddress,
    addressByIndex,
};
