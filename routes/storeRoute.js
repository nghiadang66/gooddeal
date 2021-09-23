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
const { userById, changeRole } = require('../controllers/userController');
const { upload } = require('../controllers/uploadController');
const {
    storeById,
    getStore,
    createStore,
    getStoreByUser,
    updateStore,
    activeStore,
    updateCommission,
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
    storeValidator.createStore(),
    validateHandler,
    createStore,
    changeRole,
);
router.put(
    '/store/:storeId/:userId',
    isAuth,
    isManager,
    storeValidator.updateStore(),
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

router.put(
    '/store/commission/:storeId/:userId',
    isAuth,
    isAdmin,
    storeValidator.updateCommission(),
    validateHandler,
    updateCommission,
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

router.get('/store/owner/:storeId', getOwner);

router.get('/store/staffs/:storeId', listStaffs);
router.post(
    '/store/staffs/:storeId/:userId',
    isAuth,
    isOwner,
    addStaffs,
    changeRole,
);
router.get(
    '/store/staff/cancel/:storeId/:userId',
    isAuth,
    isManager,
    cancelStaff,
    changeRole,
);
router.delete(
    '/store/staff/remove/:storeId/:userId',
    isAuth,
    isOwner,
    removeStaff,
    changeRole,
);

//router params
router.param('userId', userById);
router.param('storeId', storeById);

module.exports = router;
