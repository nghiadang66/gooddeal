const User = require('../models/userModel');

const userById = (req, res, next, id) => {
    User.findById(id)
        .exec()
        .then((user) => {
            req.user = user;
            next();
        })
        .catch((error) => {
            return res.status(400).json({
                error: 'User not found',
            });
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
        { new: true })
        .exec()
        .then(user => {
            if (req.body.password) {
                user.hashed_password = user.encryptPassword(password, user.salt);
                user.save((e, u) => {
                    if (e) {
                        return res.status(400).json({
                            error: 'Update user successfully but password failed',
                        });
                    };
                    
                    u.hashed_password = undefined;
                    u.salt = undefined;
                    return res.json({
                        success: 'Update user and password successfully',
                        user: u,
                    });
                });
            }
            else {
                user.hashed_password = undefined;
                user.salt = undefined;
                return res.json({
                    success: 'Update user successfully',
                    user,
                });
            };
        })
        .catch(error => {
            return res.status(400).json({
                error: 'Update user failed, the cause may be because email, phone or id_card already exists',
            });
        });

};

module.exports = {
    userById,
    userRead,
    userUpdate,
};
