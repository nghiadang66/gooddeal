const express = require('express');
const router = express.Router();

//import validators
const levelValidator = require('../validators/levelValidator');
const { validateHandler } = require('../helpers/validateHandler');

//import controllers
const { isAuth, isAdmin } = require('../controllers/authController');
const { userById } = require('../controllers/userController');
const { storeById } = require('../controllers/storeController');
const {
    getUserLevel,
    listUserLevel,
    createUserLevel,
    updateUserLevel,
    removeUserLevel,
    getStoreLevel,
    listStoreLevel,
    createStoreLevel,
    updateStoreLevel,
    removeStoreLevel,
} = require('../controllers/levelController');

//routes
router.get('/user/level/:userId', getUserLevel);
router.get('/user/levels/:userId', isAuth, isAdmin, listUserLevel);
router.post(
    '/user/level/create/:userId',
    isAuth,
    isAdmin,
    levelValidator.level(),
    validateHandler,
    createUserLevel,
);
router.put(
    '/user/level/:userLevelId/:userId',
    isAuth,
    isAdmin,
    levelValidator.level(),
    validateHandler,
    updateUserLevel,
);
router.delete(
    '/user/level/:userLevelId/:userId',
    isAuth,
    isAdmin,
    removeUserLevel,
);

router.get('/store/level/:storeId', getStoreLevel);
router.get('/store/levels/:userId', isAuth, isAdmin, listStoreLevel);
router.post(
    '/store/level/create/:userId',
    isAuth,
    isAdmin,
    levelValidator.level(),
    validateHandler,
    createStoreLevel,
);
router.put(
    '/store/level/:storeLevelId/:userId',
    isAuth,
    isAdmin,
    levelValidator.level(),
    validateHandler,
    updateStoreLevel,
);
router.delete(
    '/store/level/:storeLevelId/:userId',
    isAuth,
    isAdmin,
    removeStoreLevel,
);

//router params
router.param('userId', userById);
router.param('storeId', storeById);

module.exports = router;
