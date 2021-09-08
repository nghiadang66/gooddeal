const express = require('express');
const router = express.Router();

//import validators
const userValidator = require('../validators/userValidator');
const { validateHandler } = require('../helpers/validateHandler');

//import controllers
const authController = require('../controllers/authController');
const userController = require('../controllers/userController');

//routes
router.get('/user/:userId', authController.isAuth, userController.userRead);
router.put('/update/user/:userId', authController.isAuth, userValidator.userUpdate(), validateHandler, userController.userUpdate);

//router params
router.param('userId', userController.userById);

module.exports = router;
