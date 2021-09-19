const express = require('express');
const router = express.Router();

//import validators
const storeValidator = require('../validators/storeValidator');
const { validateHandler } = require('../helpers/validateHandler');

//import controllers
const {
    isAuth,
    isAdmin,
    isManager,
    isOwner,
    isVendor,
} = require('../controllers/authController');
const { userById } = require('../controllers/userController');
const {
    storeById,
    getStore,
    listStores,
    createStore,
    getStoreByUser,
} = require('../controllers/storeController');

//routes
router.get('/store/:storeId', getStore);
router.get('/store/by/user/:userId', isAuth, isVendor, getStoreByUser);
router.get('/stores/:userId', isAuth, isAdmin, listStores);
router.post(
    '/store/create/:userId',
    isAuth,
    storeValidator.createStore(),
    validateHandler,
    createStore,
);

//router params
router.param('userId', userById);
router.param('storeId', storeById);

module.exports = router;
