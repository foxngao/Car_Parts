const express = require('express');
const router = express.Router();
const { getCompatibleParts } = require('../controllers/year.controller');

// GET /api/v1/years/:id/compatibility
router.get('/:id/compatibility', getCompatibleParts);

module.exports = router;
