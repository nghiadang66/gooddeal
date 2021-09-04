const { check, oneOf } = require('express-validator');

const signup = () => [
    check('firstname')
        .not().isEmpty()
        .withMessage('Firstname is required')
        .matches(/^(?=.*[a-zA-Z])[A-Za-z\d\s@$!%*?&_'-]{1,32}$/)
        .withMessage('Invalid character'),

    check('lastname')
        .not().isEmpty()
        .withMessage('Lastname is required')
        .matches(/^(?=.*[a-zA-Z])[A-Za-z\d\s@$!%*?&_'-]{1,32}$/)
        .withMessage('Invalid character'),

    oneOf([
        [
            check('email')
                .not().isEmpty()
                .withMessage('Email is required')
                .matches(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/)
                .withMessage('Email must contain @'),
            
            check('phone')
                .not().isEmpty()
                .withMessage('Phone is required')
                .matches(/(^\d{10,11}$)/)
                .withMessage('Phone must be 10 or 11 numbers'),
        ],
        [
            check('email')
                .not().exists(),

            check('phone')
                .not().isEmpty()
                .withMessage('Phone is required')
                .matches(/(^\d{10,11}$)/)
                .withMessage('Phone must be 10 or 11 numbers'),
        ],
        [
            check('phone')
                .not().exists(),

            check('email')
                .not().isEmpty()
                .withMessage('Email is required')
                .matches(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/)
                .withMessage('Email must contain @'),
        ]
        
    ], 'Email or phone number must be provided at least one, email must contain @ and phone number must contain 10 or 11 numbers'),

    check('password')
        .not().isEmpty()
        .withMessage('Password is required')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/)
        .withMessage('Password must contain at least 6 characters, at least 1 uppercase letter, 1 lowercase letter, 1 number and 1 special character as @, $, !, %, *, ?, &'),
];

module.exports = {
    signup,
};