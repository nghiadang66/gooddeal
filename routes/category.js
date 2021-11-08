const express = require('express');
const router = express.Router();

//import controllers
const { isAuth, isAdmin } = require('../controllers/auth');
const { userById } = require('../controllers/user');
const { storeById } = require('../controllers/store');
const { upload } = require('../controllers/upload');
const {
    categoryById,
    checkCategory,
    createCategory,
    updateCategory,
    removeCategory,
    restoreCategory,
    listActiveCategories,
    listCategories,
    listCategoriesByStore,
} = require('../controllers/category');
const { listProductCategoriesByStore } = require('../controllers/product');

//routes
router.get('/active/categories', listActiveCategories);
router.get(
    '/categories/by/store/:storeId',
    listProductCategoriesByStore,
    listCategoriesByStore,
);
router.get('/categories/:userId', isAuth, isAdmin, listCategories);
router.post(
    '/category/create/:userId',
    isAuth,
    isAdmin,
    upload,
    checkCategory,
    createCategory,
);
router.put(
    '/category/:categoryId/:userId',
    isAuth,
    isAdmin,
    upload,
    updateCategory,
);
router.delete('/category/:categoryId/:userId', isAuth, isAdmin, removeCategory);
router.get(
    '/category/restore/:categoryId/:userId',
    isAuth,
    isAdmin,
    restoreCategory,
);

//router params
router.param('categoryId', categoryById);
router.param('userId', userById);
router.param('storeId', storeById);

module.exports = router;
