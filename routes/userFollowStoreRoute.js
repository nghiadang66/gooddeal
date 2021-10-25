const express = require('express');
const router = express.Router();

//import controllers
const { isAuth } = require('../controllers/authController');
const { userById } = require('../controllers/userController');
const {
    storeById,
    updateNumberOfFollowers,
} = require('../controllers/storeController');
const {
    followStore,
    unfollowStore,
    listFollowingStoresByUser,
    checkFollowingStore,
} = require('../controllers/userFollowStoreController');

//routes
router.get(
    '/follow/store/:storeId/:userId',
    isAuth,
    followStore,
    updateNumberOfFollowers,
);
router.delete(
    '/unfollow/store/:storeId/:userId',
    isAuth,
    unfollowStore,
    updateNumberOfFollowers,
);
router.get('/following/stores/:userId', isAuth, listFollowingStoresByUser);
router.get('/check/following/stores/:storeId/:userId', isAuth, checkFollowingStore);

//params
router.param('userId', userById);
router.param('storeId', storeById);

module.exports = router;
