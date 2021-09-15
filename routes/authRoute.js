const express = require('express');
const router = express.Router();

//import validators
const authValidator = require('../validators/authValidator');
const { validateHandler } = require('../helpers/validateHandler');

//import controllers
const { signup, signin, isAuth } = require('../controllers/authController');
const { userById } = require('../controllers/userController');
const {
    sendConfirmationEmail,
    verifyEmail,
} = require('../controllers/emailController');
const {
    sendConfirmationSMS,
    verifySMS,
} = require('../controllers/smsController');

//routes
router.post('/signup', authValidator.signup(), validateHandler, signup);
router.post('/signin', authValidator.signin(), validateHandler, signin);

router.get('/confirm/email/:userId', isAuth, sendConfirmationEmail);
router.get('/verify/email/:userId/:emailCode', verifyEmail);

router.get('/confirm/phone/:userId', isAuth, sendConfirmationSMS);
router.get('/verify/phone/:userId/:phoneCode', verifySMS);

//router params
router.param('userId', userById);

module.exports = router;
