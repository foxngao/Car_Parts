const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/auth');
const {
  getNotifications,
  getUnreadNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllNotifications
} = require('../controllers/notification.controller');

// All notification routes require authentication
router.use(verifyToken);

// GET routes
router.get('/', getNotifications);
router.get('/unread', getUnreadNotifications);
router.get('/unread/count', getUnreadCount);

// PUT routes
router.put('/:id/read', markAsRead);
router.put('/read-all', markAllAsRead);

// DELETE routes
router.delete('/:id', deleteNotification);
router.delete('/', deleteAllNotifications);

module.exports = router;
