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
    refreshToken,
    signout,
    authSocial,
    authToken,
    authUpdate,
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
router.post(
    '/signin',
    authValidator.signin(),
    validateHandler,
    signin,
    authToken,
);
router.post('/signout', signout);
router.post(
    '/auth/social',
    authValidator.authSocial(),
    validateHandler,
    authSocial,
    authUpdate,
    authToken,
);

router.post('/refresh/token', refreshToken);

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
router.get('/verify/email/:emailCode', verifyEmail);

// router.get('/confirm/phone/:userId', isAuth, sendConfirmationSMS);
// router.get('/verify/phone/:userId/:phoneCode', verifySMS);

//router params
router.param('userId', userById);

module.exports = router;
