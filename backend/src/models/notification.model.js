const db = require('../config/db');

const findNotificationsByUserId = async (userId) => {
  const [rows] = await db.query(
    `SELECT * FROM notifications 
     WHERE user_id = ? 
     ORDER BY created_at DESC 
     LIMIT 50`,
    [userId]
  );

  return rows;
};

const findUnreadNotificationsByUserId = async (userId) => {
  const [rows] = await db.query(
    `SELECT * FROM notifications 
     WHERE user_id = ? AND is_read = FALSE
     ORDER BY created_at DESC`,
    [userId]
  );

  return rows;
};

const countUnreadByUserId = async (userId) => {
  const [rows] = await db.query(
    'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = FALSE',
    [userId]
  );

  return rows;
};

const markAsReadById = async (id, userId) => {
  const [result] = await db.query(
    'UPDATE notifications SET is_read = TRUE WHERE id = ? AND user_id = ?',
    [id, userId]
  );

  return result;
};

const markAllAsReadByUserId = async (userId) => {
  const [result] = await db.query(
    'UPDATE notifications SET is_read = TRUE WHERE user_id = ? AND is_read = FALSE',
    [userId]
  );

  return result;
};

const deleteNotificationById = async (id, userId) => {
  const [result] = await db.query(
    'DELETE FROM notifications WHERE id = ? AND user_id = ?',
    [id, userId]
  );

  return result;
};

const deleteAllNotificationsByUserId = async (userId) => {
  const [result] = await db.query('DELETE FROM notifications WHERE user_id = ?', [userId]);
  return result;
};

const createNotification = async (connection, userId, type, title, message, data = {}) => {
  const safeData = data || {};
  const jsonData = JSON.stringify(safeData);

  const [result] = await connection.query(
    `INSERT INTO notifications (user_id, type, title, message, data, is_read, created_at) 
     VALUES (?, ?, ?, ?, ?, FALSE, NOW())`,
    [userId, type, title, message, jsonData]
  );

  return result;
};

module.exports = {
  findNotificationsByUserId,
  findUnreadNotificationsByUserId,
  countUnreadByUserId,
  markAsReadById,
  markAllAsReadByUserId,
  deleteNotificationById,
  deleteAllNotificationsByUserId,
  createNotification
};
