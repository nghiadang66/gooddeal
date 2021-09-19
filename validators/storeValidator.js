const { check, oneOf } = require('express-validator');

const createStore = () => [
    check('name')
        .not()
        .isEmpty()
        .withMessage('Store name is required')
        .isLength({ max: 100 })
        .withMessage('Store name can contain up to 100 characters')
        .matches(/^(?=.*[a-zA-Z])[A-Za-z\d\s_'-]*$/)
        .withMessage('Store name is invalid')
        .custom(checkStoreName),

    check('bio')
        .not()
        .isEmpty()
        .withMessage('Store bio is required')
        .isLength({ max: 1000 })
        .withMessage('Store bio can contain up to 1000 characters'),
];

const checkStoreName = (val) => {
    const regex = /g[o0][o0]d[^\w]*deal/i;

    let flag = true;
    if (regex.test(val)) {
        flag = false;
    }

    if (!flag) {
        return Promise.reject('Store name contains invalid characters');
    }

    return true;
};

module.exports = {
    createStore,
};
