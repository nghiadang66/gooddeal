const express = require('express');
const router = express.Router();

//import controllers
const { upload } = require('../controllers/uploadController');

//routes
router.post('/test/:stored/:userId', upload);

module.exports = router;
