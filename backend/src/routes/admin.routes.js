const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const validate = require('../middlewares/validate');
const { verifyToken, isAdmin } = require('../middlewares/auth');
const bookingModel = require('../models/booking.model');

// Controllers
const { createBrand, updateBrand, deleteBrand } = require('../controllers/brand.controller');
const { createModel, updateModel, deleteModel, createModelYear, deleteModelYear } = require('../controllers/model.controller');
const { createCategory, updateCategory, deleteCategory } = require('../controllers/category.controller');
const { createPart, updatePart, deletePart, addCompatibility } = require('../controllers/part.controller');

const { 
  getDashboardStats,
  getDetailedStatistics,
  getAllUsers, 
  createUser,
  updateUser,
  deleteUser,
  toggleUserStatus, 
  getRevenueStats 
} = require('../controllers/admin.controller');
const { getAllOrders, updateOrderStatus } = require('../controllers/order.controller');

// All admin routes require auth + admin role
router.use(verifyToken, isAdmin);

// ========== DASHBOARD & STATISTICS ==========
router.get('/dashboard/stats', getDashboardStats);
router.get('/statistics/detailed', getDetailedStatistics);
router.get('/stats/revenue', getRevenueStats);

// ========== USER MANAGEMENT ==========
router.get('/users', getAllUsers);

router.post('/users', [
  body('username').trim().notEmpty().withMessage('Username is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').isIn(['admin', 'user']).withMessage('Role must be admin or user'),
  body('full_name').optional().trim(),
  body('phone').optional().trim(),
  body('address').optional().trim(),
  validate
], createUser);

router.put('/users/:id', [
  body('full_name').optional().trim(),
  body('phone').optional().trim(),
  body('address').optional().trim(),
  body('role').optional().isIn(['admin', 'user']),
  body('is_active').optional().isBoolean(),
  validate
], updateUser);

router.delete('/users/:id', deleteUser);

router.put('/users/:id/status', [
  body('is_active').isBoolean().withMessage('is_active must be boolean'),
  validate
], toggleUserStatus);

// ========== BRANDS ==========
router.post('/brands', [
  body('name').trim().notEmpty().withMessage('Brand name is required'),
  body('country').optional().trim(),
  validate
], createBrand);

router.put('/brands/:id', [
  body('name').trim().notEmpty().withMessage('Brand name is required'),
  body('country').optional().trim(),
  validate
], updateBrand);

router.delete('/brands/:id', deleteBrand);

// ========== MODELS ==========
router.post('/models', [
  body('brand_id').isInt({ min: 1 }).withMessage('Valid brand_id is required'),
  body('name').trim().notEmpty().withMessage('Model name is required'),
  validate
], createModel);

router.put('/models/:id', [
  body('brand_id').isInt({ min: 1 }).withMessage('Valid brand_id is required'),
  body('name').trim().notEmpty().withMessage('Model name is required'),
  validate
], updateModel);

router.delete('/models/:id', deleteModel);

// ========== MODEL YEARS ==========
router.post('/model-years', [
  body('model_id').isInt({ min: 1 }).withMessage('Valid model_id is required'),
  body('year').isInt({ min: 1900, max: 2100 }).withMessage('Valid year is required'),
  validate
], createModelYear);

router.delete('/model-years/:id', deleteModelYear);

// ========== CATEGORIES ==========
router.post('/categories', [
  body('name').trim().notEmpty().withMessage('Category name is required'),
  validate
], createCategory);

router.put('/categories/:id', [
  body('name').trim().notEmpty().withMessage('Category name is required'),
  validate
], updateCategory);

router.delete('/categories/:id', deleteCategory);

// ========== PARTS ==========
router.post('/parts', [
  body('category_id').isInt({ min: 1 }).withMessage('Valid category_id is required'),
  body('name').trim().notEmpty().withMessage('Part name is required'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a non-negative number'),
  body('stock_quantity').isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
  body('is_combo').optional().isBoolean(),
  body('combo_items').optional().isArray(),
  validate
], createPart);

router.put('/parts/:id', [
  body('category_id').isInt({ min: 1 }).withMessage('Valid category_id is required'),
  body('name').trim().notEmpty().withMessage('Part name is required'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a non-negative number'),
  body('stock_quantity').isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
  body('is_combo').optional().isBoolean(),
  body('combo_items').optional().isArray(),
  validate
], updatePart);

router.delete('/parts/:id', deletePart);

// POST /api/v1/admin/parts/:id/compatibility
router.post('/parts/:id/compatibility', [
  body('model_year_ids').isArray({ min: 1 }).withMessage('model_year_ids must be a non-empty array'),
  validate
], addCompatibility);

// ========== ORDER MANAGEMENT ==========
router.get('/orders', getAllOrders);
router.put('/orders/:id/status', [
  body('status').isIn(['PENDING', 'PAID', 'SHIPPING', 'COMPLETED', 'CANCELLED'])
    .withMessage('Trạng thái không hợp lệ'),
  validate
], updateOrderStatus);

// Quản lý Gara
router.get('/garages', verifyToken, isAdmin, async (req, res) => {
    const garages = await bookingModel.getAllGarages(); // Tận dụng hàm cũ
    res.json(garages);
});
router.post('/garages', verifyToken, isAdmin, async (req, res) => {
    await bookingModel.createGarage(req.body);
    res.json({ message: 'Thêm gara thành công' });
});
router.put('/garages/:id', verifyToken, isAdmin, async (req, res) => {
    await bookingModel.updateGarage(req.params.id, req.body);
    res.json({ message: 'Cập nhật thành công' });
});

// Quản lý Lịch hẹn
router.get('/bookings', verifyToken, isAdmin, async (req, res) => {
    const bookings = await bookingModel.getAllBookings();
    res.json(bookings);
});
router.patch('/bookings/:id/status', verifyToken, isAdmin, async (req, res) => {
    await bookingModel.updateBookingStatus(req.params.id, req.body.status);
    res.json({ message: 'Cập nhật trạng thái thành công' });
});
module.exports = router;