const express = require('express');
const router = express.Router();

//import controllers
const testController = require('../controllers/testController');

//routes
router.get('/', testController.sayHi);

module.exports = router;