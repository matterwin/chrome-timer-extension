const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController.js');
const authMiddleware = require('../middleware/authMiddleware.js');
const verifyToken = require('../middleware/authMiddleware');

router.post('/register', verifyToken, userController.registerUser);
router.post('/verifyToken', verifyToken);

module.exports = router;
