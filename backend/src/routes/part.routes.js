const express = require('express');
const router = express.Router();
const { searchParts, getSuggestions, getPartById } = require('../controllers/part.controller');

// GET /api/v1/parts/suggestions?q=... (phải đặt trước /:id)
router.get('/suggestions', getSuggestions);

// GET /api/v1/parts/search
router.get('/search', searchParts);

// GET /api/v1/parts/:id
router.get('/:id', getPartById);

module.exports = router;
