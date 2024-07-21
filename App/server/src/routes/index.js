const express = require('express');
const router = express.Router();
const userRoutes = require('./userRoutes.js');

// Use user routes
router.use('/user', userRoutes);

module.exports = router;

