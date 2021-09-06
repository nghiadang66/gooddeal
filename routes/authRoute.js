const express = require('express');
const router = express.Router();

//import validators
const authValidator = require('../validators/authValidator');
const { validateHandler } = require('../helpers/validateHandler');

//import controllers
const authController = require('../controllers/authController');

//routes
router.post(
    '/signup',
    authValidator.signup(),
    validateHandler,
    authController.signup,
);
router.post(
    '/signin',
    authValidator.signin(),
    validateHandler,
    authController.signin,
);

module.exports = router;
