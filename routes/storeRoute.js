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
    isCustomer,
} = require('../controllers/authController');
const {
    userById,
    upgradeRole,
    downgradeRole,
} = require('../controllers/userController');
const { upload } = require('../controllers/uploadController');
const {
    storeById,
    getStore,
    createStore,
    getStoreByUser,
    updateStore,
    activeStore,
    updateStatus,
    getStatusEnum,
    getAvatar,
    updateAvatar,
    getCover,
    updateCover,
    getFeatureImages,
    addFeatureImage,
    updateFeatureImage,
    removeFeaturedImage,
    addStaffs,
    cancelStaff,
    listStaffs,
    getOwner,
    removeStaff,
} = require('../controllers/storeController');

//routes
router.get('/store/:storeId', getStore);
router.get('/store/by/user/:userId', isAuth, isVendor, getStoreByUser);
router.post(
    '/store/create/:userId',
    isAuth,
    isCustomer,
    storeValidator.storeProfile(),
    validateHandler,
    createStore,
    upgradeRole,
);
router.put(
    '/store/:storeId/:userId',
    isAuth,
    isManager,
    storeValidator.storeProfile(),
    validateHandler,
    updateStore,
);

router.put(
    '/store/active/:storeId/:userId',
    isAuth,
    isAdmin,
    storeValidator.activeStore(),
    validateHandler,
    activeStore,
);

router.get('/store/status/enum', getStatusEnum);
router.put(
    '/store/status/:storeId/:userId',
    isAuth,
    isManager,
    storeValidator.updateStatus(),
    validateHandler,
    updateStatus,
);

router.get('/store/avatar/:storeId', getAvatar);
router.put(
    '/store/avatar/:storeId/:userId',
    isAuth,
    isManager,
    upload,
    updateAvatar,
);

router.get('/store/cover/:storeId', getCover);
router.put(
    '/store/cover/:storeId/:userId',
    isAuth,
    isManager,
    upload,
    updateCover,
);

router.get('/store/featured/images/:storeId', getFeatureImages);
router.post(
    '/store/featured/image/:storeId/:userId',
    isAuth,
    isManager,
    upload,
    addFeatureImage,
);
router.put(
    '/store/featured/image/:storeId/:userId',
    isAuth,
    isManager,
    upload,
    updateFeatureImage,
);
router.delete(
    '/store/featured/image/:storeId/:userId',
    isAuth,
    isManager,
    removeFeaturedImage,
);

router.get('/store/owner/:storeId/:userId', isAuth, isManager, getOwner);

router.get('/store/staffs/:storeId/:userId', isAuth, isManager, listStaffs);
router.post(
    '/store/staffs/:storeId/:userId',
    isAuth,
    isOwner,
    addStaffs,
    upgradeRole,
);
router.get(
    '/store/staff/cancel/:storeId/:userId',
    isAuth,
    isManager,
    cancelStaff,
    downgradeRole,
);
router.put(
    '/store/staff/remove/:storeId/:userId',
    isAuth,
    isOwner,
    removeStaff,
    downgradeRole,
);

//router params
router.param('userId', userById);
router.param('storeId', storeById);

module.exports = router;
