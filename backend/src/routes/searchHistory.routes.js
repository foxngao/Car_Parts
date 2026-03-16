const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/auth');
const { saveSearch, getSearchHistory, deleteSearchItem, deleteAllSearchHistory } = require('../controllers/searchHistory.controller');

// All routes require authentication
router.use(verifyToken);

// POST /api/v1/search-history
router.post('/', saveSearch);

// GET /api/v1/search-history
router.get('/', getSearchHistory);

// DELETE /api/v1/search-history/all (phải đặt trước /:id)
router.delete('/all', deleteAllSearchHistory);

// DELETE /api/v1/search-history/:id
router.delete('/:id', deleteSearchItem);

module.exports = router;
