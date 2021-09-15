const { check, oneOf } = require('express-validator');

const signup = () => [
    check('firstname')
        .not()
        .isEmpty()
        .withMessage('Firstname is required')
        .isLength({ max: 32 })
        .withMessage('Firstname can contain up to 32 characters')
        .matches(/^(?=.*[a-zA-Z])[A-Za-z\d\s_'-]*$/)
        .withMessage(
            "Firstname must contain at least one letter, can contain numbers, some special characters such as _, ', - and space",
        ),

    check('lastname')
        .not()
        .isEmpty()
        .withMessage('Lastname is required')
        .isLength({ max: 32 })
        .withMessage('Lastname can contain up to 32 characters')
        .matches(/^(?=.*[a-zA-Z])[A-Za-z\d\s_'-]*$/)
        .withMessage(
            "Lastname must contain at least one letter, can contain numbers, some special characters such as _, ', - and space",
        ),

    oneOf(
        [
            [
                check('email').not().exists(),

                check('phone')
                    .not()
                    .isEmpty()
                    .matches(/^\d{10,11}$/),
            ],
            [
                check('phone').not().exists(),

                check('email')
                    .not()
                    .isEmpty()
                    .matches(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/),
            ],
        ],
        'Email or phone number must be provided at least one, email must contain @ and phone number must contain 10 or 11 numbers',
    ),

    check('password')
        .not()
        .isEmpty()
        .withMessage('Password is required')
        .matches(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/,
        )
        .withMessage(
            'Password must contain at least 6 characters, at least 1 uppercase letter, 1 lowercase letter, 1 number and 1 special character such as @, $, !, %, *, ?, &',
        ),
];

const signin = () => [
    oneOf(
        [
            [
                check('email').not().exists(),

                check('phone')
                    .not()
                    .isEmpty()
                    .matches(/^\d{10,11}$/),
            ],
            [
                check('phone').not().exists(),

                check('email')
                    .not()
                    .isEmpty()
                    .matches(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/),
            ],
        ],
        'Email or phone number must be provided at least one, email must contain @ and phone number must contain 10 or 11 numbers',
    ),

    check('password')
        .not()
        .isEmpty()
        .withMessage('Password is required')
        .matches(/^[A-Za-z\d@$!%*?&]+$/)
        .withMessage('Password contains some invalid characters'),
];

module.exports = {
    signup,
    signin,
};
