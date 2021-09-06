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

module.exports = {
    userById,
    userRead,
};
