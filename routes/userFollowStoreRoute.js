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
    follow,
    unfollow,
    listFollowingStoresByUser,
} = require('../controllers/userFollowStoreController');

//routes
router.get('/follow/:storeId/:userId', isAuth, follow, updateNumberOfFollowers);
router.delete(
    '/unfollow/:storeId/:userId',
    isAuth,
    unfollow,
    updateNumberOfFollowers,
);
router.get('/following/stores/:userId', isAuth, listFollowingStoresByUser);

//params
router.param('userId', userById);
router.param('storeId', storeById);

module.exports = router;
