const express = require('express');
const router = express.Router();
const favoriteController = require('../controllers/favorite.controller');
const { verifyToken } = require('../middlewares/auth');

// Các API này cần đăng nhập
router.use(verifyToken);

router.get('/', favoriteController.getFavorites);
router.post('/toggle', favoriteController.toggleFavorite);
router.get('/check/:partId', favoriteController.checkFavorite);

module.exports = router;
