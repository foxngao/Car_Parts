const db = require('../config/db');

const getConnection = async () => db.getConnection();
const { createNotification } = require('./notification.model');


const findCartItemsForCheckout = async (connection, userId) => {
  const [rows] = await connection.query(
    `SELECT ci.id, ci.part_id, ci.quantity, p.price, p.stock_quantity, p.name
     FROM cart_items ci
     JOIN parts p ON ci.part_id = p.id
     WHERE ci.user_id = ?`,
    [userId]
  );

  return rows;
};

const createOrderRecord = async (connection, userId, totalAmount, status) => {
  const [result] = await connection.query(
    'INSERT INTO orders (user_id, total_amount, status) VALUES (?, ?, ?)',
    [userId, totalAmount, status]
  );

  return result;
};

const createOrderItem = async (connection, orderId, partId, quantity, price) => {
  const [result] = await connection.query(
    'INSERT INTO order_items (order_id, part_id, quantity, price_at_purchase) VALUES (?, ?, ?, ?)',
    [orderId, partId, quantity, price]
  );

  return result;
};

const decrementPartStock = async (connection, quantity, partId) => {
  // 1. Trừ kho
  await connection.query(
    'UPDATE parts SET stock_quantity = stock_quantity - ? WHERE id = ?',
    [quantity, partId]
  );

  // 2. Kiểm tra lượng tồn kho còn lại
  const [rows] = await connection.query(
    'SELECT name, stock_quantity FROM parts WHERE id = ?',
    [partId]
  );
  
  const part = rows[0];
  const LOW_STOCK_THRESHOLD = 5; // Ngưỡng cảnh báo

  if (part.stock_quantity <= LOW_STOCK_THRESHOLD) {
    // 3. Tìm các tài khoản Admin để gửi thông báo
    const [admins] = await connection.query(
      `SELECT u.id FROM users u 
       JOIN user_roles ur ON u.id = ur.user_id 
       JOIN roles r ON ur.role_id = r.id 
       WHERE r.name = 'ADMIN'`
    );

    for (const admin of admins) {
      await createNotification(
        connection,
        admin.id,
        'SYSTEM_ALERT',
        'Cảnh báo hết hàng!',
        `Sản phẩm "${part.name}" chỉ còn ${part.stock_quantity} cái trong kho.`,
        { partId: partId, currentStock: part.stock_quantity }
      );
    }
  }
};

const clearCartByUserId = async (connection, userId) => {
  const [result] = await connection.query('DELETE FROM cart_items WHERE user_id = ?', [userId]);
  return result;
};

const findOrdersByUserId = async (userId) => {
  const [rows] = await db.query(
    `SELECT id, total_amount, status, order_date
     FROM orders WHERE user_id = ?
     ORDER BY order_date DESC`,
    [userId]
  );

  return rows;
};

const findOrderItemsByOrderId = async (orderId) => {
  const [rows] = await db.query(
    `SELECT oi.*, p.name as part_name, p.image_url
     FROM order_items oi
     JOIN parts p ON oi.part_id = p.id
     WHERE oi.order_id = ?`,
    [orderId]
  );

  return rows;
};

// --- PHẦN SỬA ĐỔI CHÍNH Ở ĐÂY ---
const findOrderByIdForUser = async (id, userId) => {
  const [rows] = await db.query(
    `SELECT o.*, u.username, u.email, u.full_name, u.phone, u.address,
            sb.id as booking_id
     FROM orders o
     JOIN users u ON o.user_id = u.id
     LEFT JOIN service_bookings sb ON o.id = sb.order_id
     WHERE o.id = ? AND o.user_id = ?`,
    [id, userId]
  );

  return rows;
};
// -------------------------------

const findAllOrders = async () => {
  const [rows] = await db.query(
    `SELECT o.*, u.username, u.email, u.full_name, u.phone, u.address
     FROM orders o
     JOIN users u ON o.user_id = u.id
     ORDER BY o.order_date DESC`
  );

  return rows;
};

const findOrderById = async (connection, id) => {
  const [rows] = await connection.query('SELECT * FROM orders WHERE id = ?', [id]);
  return rows;
};

const updateOrderStatusById = async (connection, status, id) => {
  const [result] = await connection.query(
    'UPDATE orders SET status = ?, updated_at = NOW() WHERE id = ?',
    [status, id]
  );

  return result;
};

module.exports = {
  getConnection,
  findCartItemsForCheckout,
  createOrderRecord,
  createOrderItem,
  decrementPartStock,
  clearCartByUserId,
  findOrdersByUserId,
  findOrderItemsByOrderId,
  findOrderByIdForUser,
  findAllOrders,
  findOrderById,
  updateOrderStatusById
};
