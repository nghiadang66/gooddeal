const express = require('express');
const router = express.Router();

//import validators
const userValidator = require('../validators/userValidator');
const { validateHandler } = require('../helpers/validateHandler');

//import controllers
const { isAuth } = require('../controllers/authController');
const {
    userById,
    getUser,
    updateUser,
    addressByIndex,
    listAddress,
    addAddress,
    updateAddress,
    removeAddress,
    getAvatar,
    updateAvatar,
    getRole,
} = require('../controllers/userController');

//routes
router.get('/user/:userId', isAuth, getUser);
router.put(
    '/update/user/:userId',
    isAuth,
    userValidator.updateUser(),
    validateHandler,
    updateUser,
);

router.get('/address/:userId', isAuth, listAddress);
router.put(
    '/address/:userId',
    isAuth,
    userValidator.userAddress(),
    validateHandler,
    addAddress,
);
router.put(
    '/address/:userId/:addressIndex',
    isAuth,
    userValidator.userAddress(),
    validateHandler,
    updateAddress,
);
router.delete('/address/:userId/:addressIndex', isAuth, removeAddress);

router.get('/avatar/:userId', isAuth, getAvatar);
router.put('/avatar/:userId', isAuth, updateAvatar);

router.get('/role/:userId', isAuth, getRole);

//router params
router.param('userId', userById);

module.exports = router;
