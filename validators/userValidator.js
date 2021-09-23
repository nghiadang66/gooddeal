const { check, oneOf } = require('express-validator');

const updateUser = () => [
    check('firstname')
        .not()
        .isEmpty()
        .withMessage('Firstname is required')
        .isLength({ max: 32 })
        .withMessage('Firstname can contain up to 32 characters')
        .matches(/^(?=.*[a-zA-Z])[A-Za-z\d\s_'-]*$/)
        .withMessage(
            "Firstname must contain at least one letter, can contain numbers, some special characters such as _, ', - and space",
        )
        .custom(checkStoreName),

    check('lastname')
        .not()
        .isEmpty()
        .withMessage('Lastname is required')
        .isLength({ max: 32 })
        .withMessage('Lastname can contain up to 32 characters')
        .matches(/^(?=.*[a-zA-Z])[A-Za-z\d\s_'-]*$/)
        .withMessage(
            "Lastname must contain at least one letter, can contain numbers, some special characters such as _, ', - and space",
        )
        .custom(checkStoreName),

    oneOf(
        [
            check('password')
                .not()
                .isEmpty()
                .matches(
                    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/,
                ),

            check('password').not().exists(),
        ],
        'Password is required, Password must contain at least 6 characters, at least 1 uppercase letter, 1 lowercase letter, 1 number and 1 special character such as @, $, !, %, *, ?, &',
    ),

    oneOf(
        [
            check('email')
                .not()
                .isEmpty()
                .matches(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/),

            check('email').not().exists(),
        ],
        'Email is required, Email must contain @',
    ),

    oneOf(
        [
            check('phone')
                .not()
                .isEmpty()
                .matches(/^\d{10,11}$/),

            check('phone').not().exists(),
        ],
        'Phone is required, Phone must contain 10 or 11 numbers',
    ),

    oneOf(
        [
            check('id_card')
                .not()
                .isEmpty()
                .matches(/(^\d{9}$|^\d{12}$)/),

            check('id_card').not().exists(),
        ],
        'Id_card is required, Id_card must contain 9 or 12 numbers',
    ),
];

const userAddress = () => [
    check('address')
        .not()
        .isEmpty()
        .withMessage('Address is required')
        .isLength({ max: 200 })
        .withMessage('Address can contain up to 200 characters'),
];

//custom validator
const checkStoreName = (val) => {
    const regexes = [/g[o0][o0]d[^\w]*deal/i, /admin/i];

    let flag = true;
    regexes.forEacg(regex => {
        if (regex.test(val)) {
            flag = false;
        }
    });

    if (!flag) {
        return Promise.reject('Name contains invalid characters');
    }

    return true;
};

module.exports = {
    updateUser,
    userAddress,
};
