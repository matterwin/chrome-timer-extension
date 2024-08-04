const express = require('express');
const router = express.Router();
const timerController = require('../controllers/timerController.js');
const authMiddleware = require('../middleware/authMiddleware.js');
const verifyToken = require('../middleware/authMiddleware');

router.post('/saveTime', verifyToken, timerController.saveTime);
router.post('/createFolder', verifyToken, timerController.createFolder);

module.exports = router;

