const express = require('express');
const router = express.Router();

//import validators
const userValidator = require('../validators/userValidator');
const { validateHandler } = require('../helpers/validateHandler');

//import controllers
const { isAuth } = require('../controllers/authController');
const { upload } = require('../controllers/uploadController');
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
    listSearch,
} = require('../controllers/userController');

//routes
router.get('/user/:userId', isAuth, getUser);
router.put(
    '/user/:userId',
    isAuth,
    userValidator.updateUser(),
    validateHandler,
    updateUser,
);

router.get('/addresses/:userId', isAuth, listAddress);
router.post(
    '/address/:userId',
    isAuth,
    userValidator.userAddress(),
    validateHandler,
    addAddress,
);
router.put(
    '/address/:userId',
    isAuth,
    userValidator.userAddress(),
    validateHandler,
    updateAddress,
);
router.delete('/address/:userId', isAuth, removeAddress);

router.get('/avatar/:userId', getAvatar);
router.put('/avatar/:userId', isAuth, upload, updateAvatar);

router.get('/role/:userId', getRole);

router.get('/users/search', listSearch);

//router params
router.param('userId', userById);

module.exports = router;
