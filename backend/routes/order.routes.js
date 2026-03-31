const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/auth');
const { createOrder, getOrders, getOrderById } = require('../controllers/order.controller');

// All order routes require authentication
router.use(verifyToken);

// POST /api/v1/orders
router.post('/', createOrder);

// GET /api/v1/orders
router.get('/', getOrders);

// GET /api/v1/orders/:id
router.get('/:id', getOrderById);

module.exports = router;
