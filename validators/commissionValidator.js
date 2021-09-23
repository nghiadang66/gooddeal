const { check } = require('express-validator');

const commission = () => [
    check('business_type')
        .not()
        .isEmpty()
        .withMessage('business_type is required')
        .isLength({ max: 32 })
        .withMessage('business_type can contain up to 32 characters')
        .matches(/^(?=.*[a-zA-Z])[A-Za-z\d\s_'-]*$/)
        .withMessage(
            "business_type must contain at least one letter (can contain numbers, some special characters such as _, ', - and space)",
        ),

    check('cost')
        .not()
        .isEmpty()
        .withMessage('Commission cost is required')
        .isFloat({ min: 0 })
        .withMessage('Commission cost must be decimal and greater than zero'),
];

module.exports = {
    commission,
};
