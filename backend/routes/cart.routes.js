const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const validate = require('../middlewares/validate');
const { verifyToken } = require('../middlewares/auth');
const { getCartItems, addToCart, updateCartItem, removeCartItem } = require('../controllers/cart.controller');

// All cart routes require authentication
router.use(verifyToken);

// GET /api/v1/cart/items
router.get('/items', getCartItems);

// POST /api/v1/cart/items
router.post('/items', [
  body('part_id').isInt({ min: 1 }).withMessage('Valid part_id is required'),
  body('quantity').optional().isInt({ min: 1 }).withMessage('Quantity must be a positive integer'),
  validate
], addToCart);

// PUT /api/v1/cart/items/:id
router.put('/items/:id', [
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be a positive integer'),
  validate
], updateCartItem);

// DELETE /api/v1/cart/items/:id
router.delete('/items/:id', removeCartItem);

module.exports = router;
