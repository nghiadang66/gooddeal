const express = require('express');
const router = express.Router();

//import validators
const authValidator = require('../validators/authValidator');
const { validateHandler } = require('../helpers/validateHandler');

//import controllers
const { signup, signin } = require('../controllers/authController');

//routes
router.post('/signup', authValidator.signup(), validateHandler, signup);
router.post('/signin', authValidator.signin(), validateHandler, signin);

module.exports = router;
