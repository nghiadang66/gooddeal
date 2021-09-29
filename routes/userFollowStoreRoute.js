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
} = require('../controllers/userFollowStoreController');

//routes
router.get(
    '/follow/:storeId/:userId',
    isAuth,
    followStore,
    updateNumberOfFollowers,
);
router.delete(
    '/unfollow/:storeId/:userId',
    isAuth,
    unfollowStore,
    updateNumberOfFollowers,
);
router.get('/following/stores/:userId', isAuth, listFollowingStoresByUser);

//params
router.param('userId', userById);
router.param('storeId', storeById);

module.exports = router;
