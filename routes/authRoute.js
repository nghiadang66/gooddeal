const express = require('express');
const router = express.Router();

//import validators
const authValidator = require('../validators/authValidator');
const { validateHandler } = require('../helpers/validateHandler');

//import controllers
const {
    signup,
    signin,
    forgotPassword,
    changePassword,
    isAuth,
} = require('../controllers/authController');
const { userById } = require('../controllers/userController');
const {
    sendNotificationEmail,
    sendConfirmationEmail,
    verifyEmail,
} = require('../controllers/emailController');
const {
    sendNotificationSMS,
    sendConfirmationSMS,
    verifySMS,
} = require('../controllers/smsController');

//routes
router.post('/signup', authValidator.signup(), validateHandler, signup);
router.post('/signin', authValidator.signin(), validateHandler, signin);
router.post(
    '/forgot/password',
    authValidator.forgotPassword(),
    validateHandler,
    forgotPassword,
    sendNotificationEmail,
    sendNotificationSMS,
);
router.put(
    '/change/password/:forgotPasswordCode',
    authValidator.changePassword(),
    validateHandler,
    changePassword,
);

router.get('/confirm/email/:userId', isAuth, sendConfirmationEmail);
router.get('/verify/email/:userId/:emailCode', verifyEmail);

router.get('/confirm/phone/:userId', isAuth, sendConfirmationSMS);
router.get('/verify/phone/:userId/:phoneCode', verifySMS);

//router params
router.param('userId', userById);

module.exports = router;
