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
router.put(
    '/update/user/:userId',
    authController.isAuth,
    userValidator.userUpdate(),
    validateHandler,
    userController.userUpdate,
);
router.get(
    '/address/:userId',
    authController.isAuth,
    userController.listAddress,
);
router.put(
    '/address/:userId',
    authController.isAuth,
    userController.addAddress,
);
router.delete(
    '/address/:userId/:addressIndex',
    authController.isAuth,
    userController.removeAddress,
);

//router params
router.param('userId', userController.userById);
router.param('addressIndex', userController.addressByIndex);

module.exports = router;
