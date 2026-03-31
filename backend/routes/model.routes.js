const express = require('express');
const router = express.Router();
const { getYearsByModel } = require('../controllers/model.controller');

// GET /api/v1/models/:id/years
router.get('/:id/years', getYearsByModel);

module.exports = router;
