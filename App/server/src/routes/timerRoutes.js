const express = require('express');
const router = express.Router();
const timerController = require('../controllers/timerController.js');
const authMiddleware = require('../middleware/authMiddleware.js');

router.post('/saveTime', timerController.saveTime);
router.post('/createFolder', timerController.createFolder);

module.exports = router;

