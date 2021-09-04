const User = require('../models/userModel');
const  { errorHandler } = require('../helpers/errorHandler');

const signup = (req, res) => {
    const { 
        email,
        phone,
    } = req.body;

    if (!email && !phone) {
        return res.status(400).json({
            error: 'Email or phone must be provided!',
        });
    };

    const user = new User(req.body);
    user.save((error, user) => {
        if (error) {
            return res.status(400).json({
                error: error,
            });
        };

        user.salt = undefined;
        user.hashed_password = undefined;
        res.status(200).json({
            user,
        });
    });
};

module.exports = {
    signup,
};