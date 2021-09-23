const { check, oneOf } = require('express-validator');

const storeProfile = () => [
    check('name')
        .not()
        .isEmpty()
        .withMessage('Store name is required')
        .isLength({ max: 100 })
        .withMessage('Store name can contain up to 100 characters')
        .matches(/^(?=.*[a-zA-Z])[A-Za-z\d\s_'-]*$/)
        .withMessage(
            "Store name must contain at least one letter, can contain numbers, some special characters such as _, ', - and space",
        )
        .custom(checkStoreName),

    check('bio')
        .not()
        .isEmpty()
        .withMessage('Store bio is required')
        .isLength({ max: 1000 })
        .withMessage('Store bio can contain up to 1000 characters'),

    check('commission').not().isEmpty().withMessage('Commission is required'),
];

const activeStore = () => [
    check('isActive')
        .not()
        .isEmpty()
        .withMessage('isActive is required')
        .isBoolean()
        .withMessage('isActive type is boolean'),
];

const updateStatus = () => [
    check('status')
        .not()
        .isEmpty()
        .withMessage('status is required')
        .custom(checkStatus),
];

//custom validator
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

const checkStatus = (val) => {
    const stt = ['open', 'close'];
    if (stt.indexOf(val) == -1) {
        return Promise.reject('Status is invalid, status type is enum value');
    }

    return true;
};

module.exports = {
    storeProfile,
    activeStore,
    updateStatus,
};
