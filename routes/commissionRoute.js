const express = require('express');
const router = express.Router();

//import validators
const commissionValidator = require('../validators/commissionValidator');
const { validateHandler } = require('../helpers/validateHandler');

//import controllers
const { isAuth, isAdmin } = require('../controllers/authController');
const { userById } = require('../controllers/userController');
const {
    listCommissions,
    listActiveCommissions,
    createCommission,
    updateCommission,
    removeCommission,
    restoreCommission,
} = require('../controllers/commissionController');

//routes
router.get('/commissions/:userId', isAuth, isAdmin, listCommissions);
router.get('/active/commissions', listActiveCommissions);
router.post(
    '/commission/create/:userId',
    isAuth,
    isAdmin,
    commissionValidator.commission(),
    validateHandler,
    createCommission,
);
router.put(
    '/commission/:commissionId/:userId',
    isAuth,
    isAdmin,
    commissionValidator.commission(),
    validateHandler,
    updateCommission,
);
router.delete(
    '/commission/:commissionId/:userId',
    isAuth,
    isAdmin,
    removeCommission,
);
router.get(
    '/commission/restore/:commissionId/:userId',
    isAuth,
    isAdmin,
    restoreCommission,
);

//router params
router.param('userId', userById);

module.exports = router;
