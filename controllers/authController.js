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
            user,
        });
    });
};

const signin = (req, res) => {
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
            // console.log(user);
            if (!user.authenticate(password)) {
                return res.status(401).json({
                    error: "Password doesn't match",
                });
            }

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

            const { _id, firstname, lastname, role, slug } = user;
            res.json({
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

module.exports = {
    signup,
    signin,
};
