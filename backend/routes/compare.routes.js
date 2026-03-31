const express = require('express');
const router = express.Router();
const { getCompareData } = require('../controllers/compare.controller');

// GET /api/v1/compare?ids=1,2,3 - Public route
router.get('/', getCompareData);

module.exports = router;
