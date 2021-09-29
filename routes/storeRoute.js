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
    openStore,
    // getAvatar,
    updateAvatar,
    // getCover,
    updateCover,
    listFeatureImages,
    addFeatureImage,
    updateFeatureImage,
    removeFeaturedImage,
    addStaffs,
    cancelStaff,
    listStaffs,
    // getOwner,
    removeStaff,
    listStoreCommissions,
    listStores,
} = require('../controllers/storeController');
const { createSlug } = require('../controllers/slugController');

//routes
router.get('/store/:storeId', getStore);
router.get('/store/by/user/:userId', isAuth, isVendor, getStoreByUser);
router.get(
    '/stores/:userId',
    isAuth,
    isAdmin,
    listStoreCommissions,
    listStores,
);
router.post(
    '/store/create/:userId',
    isAuth,
    isCustomer,
    storeValidator.createStore(),
    validateHandler,
    createStore,
    createSlug,
    changeRole,
);
router.put(
    '/store/:storeId/:userId',
    isAuth,
    isVendor,
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

router.put(
    '/store/open/:storeId/:userId',
    isAuth,
    isVendor,
    isManager,
    storeValidator.openStore(),
    validateHandler,
    openStore,
);

// router.get('/store/avatar/:storeId', getAvatar);
router.put(
    '/store/avatar/:storeId/:userId',
    isAuth,
    isVendor,
    isManager,
    upload,
    updateAvatar,
);

// router.get('/store/cover/:storeId', getCover);
router.put(
    '/store/cover/:storeId/:userId',
    isAuth,
    isVendor,
    isManager,
    upload,
    updateCover,
);

router.get('/store/featured/images/:storeId', listFeatureImages);
router.post(
    '/store/featured/image/:storeId/:userId',
    isAuth,
    isVendor,
    isManager,
    upload,
    addFeatureImage,
);
router.put(
    '/store/featured/image/:storeId/:userId',
    isAuth,
    isVendor,
    isManager,
    upload,
    updateFeatureImage,
);
router.delete(
    '/store/featured/image/:storeId/:userId',
    isAuth,
    isVendor,
    isManager,
    removeFeaturedImage,
);

// router.get('/store/owner/:storeId', getOwner);

router.get(
    '/store/staffs/:storeId/:userId',
    isAuth,
    isVendor,
    isManager,
    listStaffs,
);
router.post(
    '/store/staffs/:storeId/:userId',
    isAuth,
    isOwner,
    addStaffs,
    changeRole,
);
router.delete(
    '/store/staff/remove/:storeId/:userId',
    isAuth,
    isOwner,
    removeStaff,
    changeRole,
);
router.get(
    '/store/staff/cancel/:storeId/:userId',
    isAuth,
    isVendor,
    isManager,
    cancelStaff,
    changeRole,
);

//router params
router.param('userId', userById);
router.param('storeId', storeById);

module.exports = router;
