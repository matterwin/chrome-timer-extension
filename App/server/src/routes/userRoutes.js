const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController.js');
const authMiddleware = require('../middleware/authMiddleware.js');

router.post('/register', userController.registerUser);

module.exports = router;
