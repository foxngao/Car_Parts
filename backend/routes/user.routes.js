const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const validate = require('../middlewares/validate');
const { verifyToken } = require('../middlewares/auth');
const { getProfile, updateProfile, changePassword } = require('../controllers/user.controller');

// All routes require authentication
router.use(verifyToken);

// GET /api/v1/user/profile
router.get('/profile', getProfile);

// PUT /api/v1/user/profile
router.put('/profile', [
  body('full_name').optional().trim(),
  body('phone').optional().trim(),
  body('address').optional().trim(),
  validate
], updateProfile);

// PUT /api/v1/user/change-password
router.put('/change-password', [
  body('current_password').notEmpty().withMessage('Current password is required'),
  body('new_password')
    .isLength({ min: 8 }).withMessage('New password must be at least 8 characters')
    .matches(/[a-z]/).withMessage('Password must contain a lowercase letter')
    .matches(/[A-Z]/).withMessage('Password must contain an uppercase letter')
    .matches(/[0-9]/).withMessage('Password must contain a number')
    .matches(/[!@#$%^&*(),.?":{}|<>]/).withMessage('Password must contain a special character'),
  validate
], changePassword);

module.exports = router;
