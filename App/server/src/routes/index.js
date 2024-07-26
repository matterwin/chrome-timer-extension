const express = require('express');
const router = express.Router();
const userRoutes = require('./userRoutes.js');
const timerRoutes = require('./timerRoutes.js');

// User routes
router.use('/user', userRoutes);
router.use('/timer', timerRoutes);

module.exports = router;

