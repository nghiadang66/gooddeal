const express = require('express');
const router = express.Router();

//import validators
const userValidator = require('../validators/userValidator');
const { validateHandler } = require('../helpers/validateHandler');

//import controllers
const { isAuth } = require('../controllers/authController');
const {
    userById,
    userRead,
    userUpdate,
    addressByIndex,
    listAddress,
    addAddress,
    updateAddress,
    removeAddress,
    getAvatar,
    updateAvatar,
} = require('../controllers/userController');

//routes
router.get('/user/:userId', isAuth, userRead);
router.put(
    '/update/user/:userId',
    isAuth,
    userValidator.userUpdate(),
    validateHandler,
    userUpdate,
);
router.get('/address/:userId', isAuth, listAddress);
router.put('/address/:userId', isAuth, addAddress);
router.put('/address/:userId/:addressIndex', isAuth, updateAddress);
router.delete('/address/:userId/:addressIndex', isAuth, removeAddress);
router.get('/avatar/:userId', isAuth, getAvatar);
router.put('/avatar/:userId', isAuth, updateAvatar);

//router params
router.param('userId', userById);
router.param('addressIndex', addressByIndex);

module.exports = router;
