const express = require('express');
const router = express.Router();

//import validators

//import controllers
const authController = require('../controllers/authController');
const userController = require('../controllers/userController');

//routes
router.get('/user/:userId', authController.isAuth, userController.userRead);

//router params
router.param('userId', userController.userById);

module.exports = router;
