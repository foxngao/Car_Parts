const notificationModel = require('../models/notification.model');

const parseNotificationData = (notif) => {
  let parsedData = {};
  try {
    if (notif.data) {
      if (typeof notif.data === 'string') {
        parsedData = JSON.parse(notif.data);
      } else if (typeof notif.data === 'object') {
        parsedData = notif.data;
      }
    }
  } catch (e) {
    console.warn(`Failed to parse JSON for notification ${notif.id}:`, e.message);
    parsedData = {};
  }

  return {
    id: notif.id,
    user_id: notif.user_id,
    type: notif.type,
    title: notif.title,
    message: notif.message,
    data: parsedData,
    is_read: notif.is_read,
    created_at: notif.created_at
  };
};

// GET /api/v1/notifications - Lấy tất cả thông báo của user
const getNotifications = async (req, res) => {
  try {
    console.log('Fetching notifications for user ID:', req.user.id);
    
    const notifications = await notificationModel.findNotificationsByUserId(req.user.id);
    
    console.log(`Found ${notifications.length} notifications`);
    
    // Parse JSON data với xử lý lỗi
    const formattedNotifications = notifications.map(parseNotificationData);
    
    res.json({ success: true, data: formattedNotifications });
  } catch (error) {
    console.error('❌ Get notifications error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// GET /api/v1/notifications/unread - Lấy thông báo chưa đọc
const getUnreadNotifications = async (req, res) => {
  try {
    const notifications = await notificationModel.findUnreadNotificationsByUserId(req.user.id);
    const formattedNotifications = notifications.map(parseNotificationData);
    
    res.json({ success: true, data: formattedNotifications });
  } catch (error) {
    console.error('Get unread notifications error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// GET /api/v1/notifications/unread/count - Đếm số thông báo chưa đọc
const getUnreadCount = async (req, res) => {
  try {
    const result = await notificationModel.countUnreadByUserId(req.user.id);
    res.json({ success: true, data: { count: result[0].count } });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// PUT /api/v1/notifications/:id/read - Đánh dấu đã đọc 1 thông báo
const markAsRead = async (req, res) => {
  try {
    console.log('📝 Mark as read - Notification ID:', req.params.id);
    console.log('📝 Mark as read - User ID:', req.user.id);
    
    const result = await notificationModel.markAsReadById(req.params.id, req.user.id);
    
    console.log('📝 Update result:', result);
    
    if (result.affectedRows === 0) {
      console.log('❌ Notification not found or not owned by user');
      return res.status(404).json({ 
        success: false, 
        message: 'Notification not found' 
      });
    }
    
    console.log('✅ Marked as read successfully');
    res.json({ success: true, message: 'Marked as read' });
  } catch (error) {
    console.error('❌ Mark as read error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// PUT /api/v1/notifications/read-all - Đánh dấu tất cả đã đọc
const markAllAsRead = async (req, res) => {
  try {
    await notificationModel.markAllAsReadByUserId(req.user.id);
    res.json({ success: true, message: 'All marked as read' });
  } catch (error) {
    console.error('Mark all as read error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// DELETE /api/v1/notifications/:id - Xóa 1 thông báo
const deleteNotification = async (req, res) => {
  try {
    const result = await notificationModel.deleteNotificationById(req.params.id, req.user.id);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Notification not found' 
      });
    }
    
    res.json({ success: true, message: 'Notification deleted' });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// DELETE /api/v1/notifications - Xóa tất cả thông báo
const deleteAllNotifications = async (req, res) => {
  try {
    await notificationModel.deleteAllNotificationsByUserId(req.user.id);
    res.json({ success: true, message: 'All notifications deleted' });
  } catch (error) {
    console.error('Delete all notifications error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports = {
  getNotifications,
  getUnreadNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllNotifications
};
