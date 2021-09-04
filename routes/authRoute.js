const express = require('express');
const router = express.Router();

//import controllers
const authController = require('../controllers/authController');

//routes
router.post('/signup', authController.signup);

module.exports = router;