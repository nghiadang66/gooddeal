const express = require('express');
const router = express.Router();

//import validators
const levelValidator = require('../validators/level');
const { validateHandler } = require('../helpers/validateHandler');

//import controllers
const { isAuth, isAdmin } = require('../controllers/auth');
const { userById } = require('../controllers/user');
const { storeById } = require('../controllers/store');
const {
    getUserLevel,
    listUserLevel,
    listActiveUserLevel,
    createUserLevel,
    updateUserLevel,
    removeUserLevel,
    restoreUserLevel,
    getStoreLevel,
    listStoreLevel,
    listActiveStoreLevel,
    createStoreLevel,
    updateStoreLevel,
    removeStoreLevel,
    restoreStoreLevel,
} = require('../controllers/level');

//routes
router.get('/user/level/:userId', getUserLevel);
router.get('/user/active/levels', listActiveUserLevel);
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
router.get(
    '/user/level/restore/:userLevelId/:userId',
    isAuth,
    isAdmin,
    restoreUserLevel,
);

router.get('/store/level/:storeId', getStoreLevel);
router.get('/store/active/levels', listActiveStoreLevel);
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
router.get(
    '/store/level/restore/:storeLevelId/:userId',
    isAuth,
    isAdmin,
    restoreStoreLevel,
);

//router params
router.param('userId', userById);
router.param('storeId', storeById);

module.exports = router;
