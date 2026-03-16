const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const validate = require('../middlewares/validate');
const { verifyToken } = require('../middlewares/auth');
const { getReviews, createReview, updateReview, deleteReview } = require('../controllers/review.controller');

// GET /api/v1/parts/:id/reviews - Public
router.get('/parts/:id/reviews', getReviews);

// POST /api/v1/parts/:id/reviews - Authenticated
router.post('/parts/:id/reviews', verifyToken, [
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment').optional().trim().isLength({ max: 1000 }).withMessage('Comment max 1000 characters'),
  validate
], createReview);

// PUT /api/v1/reviews/:id - Authenticated (owner only)
router.put('/reviews/:id', verifyToken, [
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment').optional().trim().isLength({ max: 1000 }).withMessage('Comment max 1000 characters'),
  validate
], updateReview);

// DELETE /api/v1/reviews/:id - Authenticated (owner or admin)
router.delete('/reviews/:id', verifyToken, deleteReview);

module.exports = router;
