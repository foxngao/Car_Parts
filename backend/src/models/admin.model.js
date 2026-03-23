const db = require('../config/db');

const getDashboardOverview = async (startDateStr) => {
  const [rows] = await db.query(
    `SELECT 
      (SELECT COUNT(*) FROM users) as total_users,
      (SELECT COUNT(*) FROM users WHERE created_at >= ?) as new_users,
      (SELECT COUNT(*) FROM orders) as total_orders,
      (SELECT COUNT(*) FROM orders WHERE order_date >= ?) as new_orders,
      (SELECT COUNT(*) FROM parts) as total_products,
      (SELECT SUM(stock_quantity) FROM parts) as total_stock,
      (SELECT COUNT(*) FROM parts WHERE stock_quantity = 0) as out_of_stock,
      (SELECT COALESCE(SUM(total_amount), 0) FROM orders WHERE status IN ('PAID', 'COMPLETED')) as total_revenue,
      (SELECT COALESCE(SUM(total_amount), 0) FROM orders WHERE status IN ('PAID', 'COMPLETED') AND order_date >= ?) as revenue_this_period,
      (SELECT COALESCE(SUM(total_amount), 0) FROM orders WHERE status IN ('PAID', 'COMPLETED') AND order_date < ? AND order_date >= DATE_SUB(?, INTERVAL 1 DAY)) as revenue_previous_period`,
    [startDateStr, startDateStr, startDateStr, startDateStr, startDateStr]
  );

  return rows;
};

const getDashboardRevenueByDate = async (startDateStr) => {
  const [rows] = await db.query(
    `SELECT 
      DATE(order_date) as date,
      COUNT(*) as order_count,
      COALESCE(SUM(total_amount), 0) as revenue
     FROM orders
     WHERE status IN ('PAID', 'COMPLETED')
       AND order_date >= ?
     GROUP BY DATE(order_date)
     ORDER BY date DESC`,
    [startDateStr]
  );

  return rows;
};

const getDashboardOrderStatus = async () => {
  const [rows] = await db.query(
    `SELECT 
      status,
      COUNT(*) as count,
      COALESCE(SUM(total_amount), 0) as total
     FROM orders
     GROUP BY status`
  );

  return rows;
};

const getDashboardBestSelling = async () => {
  const [rows] = await db.query(
    `SELECT 
      p.id,
      p.name,
      p.price,
      p.image_url,
      c.name as category_name,
      COUNT(oi.id) as order_count,
      SUM(oi.quantity) as total_sold,
      COALESCE(SUM(oi.quantity * oi.price_at_purchase), 0) as total_revenue
     FROM order_items oi
     JOIN parts p ON oi.part_id = p.id
     JOIN categories c ON p.category_id = c.id
     JOIN orders o ON oi.order_id = o.id
     WHERE o.status IN ('PAID', 'COMPLETED')
     GROUP BY p.id
     ORDER BY total_sold DESC
     LIMIT 10`
  );

  return rows;
};

const getDashboardNewUsersByDate = async (startDateStr) => {
  const [rows] = await db.query(
    `SELECT 
      DATE(created_at) as date,
      COUNT(*) as count
     FROM users
     WHERE created_at >= ?
     GROUP BY DATE(created_at)
     ORDER BY date DESC`,
    [startDateStr]
  );

  return rows;
};

const getDashboardCategoryStats = async () => {
  const [rows] = await db.query(
    `SELECT 
      c.id,
      c.name,
      COUNT(DISTINCT p.id) as product_count,
      COALESCE(SUM(oi.quantity), 0) as items_sold,
      COALESCE(SUM(oi.quantity * oi.price_at_purchase), 0) as revenue
     FROM categories c
     LEFT JOIN parts p ON c.id = p.category_id
     LEFT JOIN order_items oi ON p.id = oi.part_id
     LEFT JOIN orders o ON oi.order_id = o.id AND o.status IN ('PAID', 'COMPLETED')
     GROUP BY c.id`
  );

  return rows;
};

const getDashboardRecentOrders = async () => {
  const [rows] = await db.query(
    `SELECT 
      o.id,
      o.total_amount,
      o.status,
      o.order_date,
      u.username,
      u.full_name,
      u.email
     FROM orders o
     JOIN users u ON o.user_id = u.id
     ORDER BY o.order_date DESC
     LIMIT 10`
  );

  return rows;
};

const getDetailedRevenueSummary = async (startStr, endStr) => {
  const [rows] = await db.query(
    `SELECT 
      COUNT(*) as total_orders,
      COALESCE(SUM(total_amount), 0) as total_revenue,
      COALESCE(AVG(total_amount), 0) as avg_order_value,
      MAX(total_amount) as max_order,
      MIN(total_amount) as min_order
     FROM orders
     WHERE status IN ('PAID', 'COMPLETED')
       AND order_date BETWEEN ? AND ?`,
    [startStr, endStr]
  );

  return rows;
};

const getDetailedRevenueByTime = async (groupByClause, startStr, endStr) => {
  const [rows] = await db.query(
    `SELECT 
      ${groupByClause} as period,
      COUNT(*) as order_count,
      COALESCE(SUM(total_amount), 0) as revenue
     FROM orders
     WHERE status IN ('PAID', 'COMPLETED')
       AND order_date BETWEEN ? AND ?
     GROUP BY ${groupByClause}
     ORDER BY period DESC`,
    [startStr, endStr]
  );

  return rows;
};

const getDetailedProductStats = async (startStr, endStr) => {
  const [rows] = await db.query(
    `SELECT 
      p.id,
      p.name,
      p.price,
      c.name as category_name,
      COUNT(DISTINCT o.id) as order_count,
      SUM(oi.quantity) as total_quantity,
      COALESCE(SUM(oi.quantity * oi.price_at_purchase), 0) as total_revenue
     FROM parts p
     JOIN categories c ON p.category_id = c.id
     LEFT JOIN order_items oi ON p.id = oi.part_id
     LEFT JOIN orders o ON oi.order_id = o.id AND o.status IN ('PAID', 'COMPLETED') AND o.order_date BETWEEN ? AND ?
     GROUP BY p.id
     ORDER BY total_revenue DESC`,
    [startStr, endStr]
  );

  return rows;
};

const getDetailedCategoryStats = async (startStr, endStr) => {
  const [rows] = await db.query(
    `SELECT 
      c.id,
      c.name,
      COUNT(DISTINCT p.id) as product_count,
      COUNT(DISTINCT o.id) as order_count,
      SUM(oi.quantity) as items_sold,
      COALESCE(SUM(oi.quantity * oi.price_at_purchase), 0) as revenue
     FROM categories c
     LEFT JOIN parts p ON c.id = p.category_id
     LEFT JOIN order_items oi ON p.id = oi.part_id
     LEFT JOIN orders o ON oi.order_id = o.id AND o.status IN ('PAID', 'COMPLETED') AND o.order_date BETWEEN ? AND ?
     GROUP BY c.id
     ORDER BY revenue DESC`,
    [startStr, endStr]
  );

  return rows;
};

const getDetailedCustomerStats = async (startStr, endStr) => {
  const [rows] = await db.query(
    `SELECT 
      u.id,
      u.username,
      u.full_name,
      u.email,
      COUNT(DISTINCT o.id) as order_count,
      COALESCE(SUM(o.total_amount), 0) as total_spent,
      COALESCE(AVG(o.total_amount), 0) as avg_order_value,
      MAX(o.order_date) as last_order_date
     FROM users u
     LEFT JOIN orders o ON u.id = o.user_id AND o.status IN ('PAID', 'COMPLETED') AND o.order_date BETWEEN ? AND ?
     GROUP BY u.id
     HAVING order_count > 0
     ORDER BY total_spent DESC
     LIMIT 20`,
    [startStr, endStr]
  );

  return rows;
};

const getDetailedHourlyStats = async (startStr, endStr) => {
  const [rows] = await db.query(
    `SELECT 
      HOUR(order_date) as hour,
      COUNT(*) as order_count,
      COALESCE(SUM(total_amount), 0) as revenue
     FROM orders
     WHERE status IN ('PAID', 'COMPLETED')
       AND order_date BETWEEN ? AND ?
     GROUP BY HOUR(order_date)
     ORDER BY hour`,
    [startStr, endStr]
  );

  return rows;
};

const getDetailedWeekdayStats = async (startStr, endStr) => {
  const [rows] = await db.query(
    `SELECT 
      DAYOFWEEK(order_date) as weekday,
      COUNT(*) as order_count,
      COALESCE(SUM(total_amount), 0) as revenue
     FROM orders
     WHERE status IN ('PAID', 'COMPLETED')
       AND order_date BETWEEN ? AND ?
     GROUP BY DAYOFWEEK(order_date)
     ORDER BY weekday`,
    [startStr, endStr]
  );

  return rows;
};

const getDetailedTopProducts = async (startStr, endStr) => {
  const [rows] = await db.query(
    `SELECT 
      p.id,
      p.name,
      p.price,
      c.name as category_name,
      SUM(oi.quantity) as total_sold,
      COALESCE(SUM(oi.quantity * oi.price_at_purchase), 0) as total_revenue
     FROM order_items oi
     JOIN parts p ON oi.part_id = p.id
     JOIN categories c ON p.category_id = c.id
     JOIN orders o ON oi.order_id = o.id
     WHERE o.status IN ('PAID', 'COMPLETED')
       AND o.order_date BETWEEN ? AND ?
     GROUP BY p.id
     ORDER BY total_sold DESC
     LIMIT 10`,
    [startStr, endStr]
  );

  return rows;
};

const getDetailedNewCustomers = async (startStr, endStr) => {
  const [rows] = await db.query(
    `SELECT 
      COUNT(*) as total,
      DATE(created_at) as date
     FROM users
     WHERE created_at BETWEEN ? AND ?
     GROUP BY DATE(created_at)
     ORDER BY date DESC`,
    [startStr, endStr]
  );

  return rows;
};

const getDetailedConversionRate = async (startStr, endStr) => {
  const [rows] = await db.query(
    `SELECT 
      (SELECT COUNT(DISTINCT user_id) FROM orders WHERE order_date BETWEEN ? AND ?) as buyers,
      (SELECT COUNT(*) FROM users WHERE created_at <= ?) as total_users`,
    [startStr, endStr, endStr]
  );

  return rows;
};

const findAllUsers = async () => {
  const [rows] = await db.query(
    `SELECT u.id, u.username, u.email, u.full_name, u.phone, u.address,
            u.is_active, u.created_at, GROUP_CONCAT(r.name) as roles
     FROM users u
     LEFT JOIN user_roles ur ON u.id = ur.user_id
     LEFT JOIN roles r ON ur.role_id = r.id
     GROUP BY u.id
     ORDER BY u.created_at DESC`
  );

  return rows;
};

const findExistingUserByUsernameOrEmail = async (username, email) => {
  const [rows] = await db.query(
    'SELECT id FROM users WHERE username = ? OR email = ?',
    [username, email]
  );

  return rows;
};

const createUser = async ({ username, password, email, full_name, phone, address }) => {
  const [result] = await db.query(
    `INSERT INTO users (username, password, email, full_name, phone, address, is_active) 
     VALUES (?, ?, ?, ?, ?, ?, 1)`,
    [username, password, email, full_name || null, phone || null, address || null]
  );

  return result;
};

const assignUserRole = async (userId, roleId) => {
  const [result] = await db.query(
    'INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)',
    [userId, roleId]
  );

  return result;
};

const updateUserById = async (id, { full_name, phone, address, is_active }) => {
  const [result] = await db.query(
    'UPDATE users SET full_name = ?, phone = ?, address = ?, is_active = ? WHERE id = ?',
    [full_name || null, phone || null, address || null, is_active, id]
  );

  return result;
};

const deleteUserRolesByUserId = async (id) => {
  const [result] = await db.query('DELETE FROM user_roles WHERE user_id = ?', [id]);
  return result;
};

const findOrdersByUserId = async (id) => {
  const [rows] = await db.query('SELECT id FROM orders WHERE user_id = ?', [id]);
  return rows;
};

const deleteUserById = async (id) => {
  const [result] = await db.query('DELETE FROM users WHERE id = ?', [id]);
  return result;
};

const updateUserStatusById = async (id, is_active) => {
  const [result] = await db.query(
    'UPDATE users SET is_active = ? WHERE id = ?',
    [is_active, id]
  );

  return result;
};

const getRevenueSummary = async (dateFilter, params) => {
  const [rows] = await db.query(
    `SELECT COALESCE(SUM(total_amount), 0) as total_revenue,
            COUNT(*) as total_orders
     FROM orders o
     WHERE o.status IN ('PAID', 'COMPLETED') ${dateFilter}`,
    params
  );

  return rows;
};

const getRevenueByDate = async (dateFilter, params) => {
  const [rows] = await db.query(
    `SELECT DATE(o.order_date) as date,
            SUM(o.total_amount) as revenue,
            COUNT(*) as order_count
     FROM orders o
     WHERE o.status IN ('PAID', 'COMPLETED') ${dateFilter}
     GROUP BY DATE(o.order_date)
     ORDER BY date DESC`,
    params
  );

  return rows;
};

const getRevenueBestSellingParts = async (dateFilter, params) => {
  const [rows] = await db.query(
    `SELECT p.id, p.name, p.price,
            SUM(oi.quantity) as total_sold,
            SUM(oi.quantity * oi.price_at_purchase) as total_revenue
     FROM order_items oi
     JOIN parts p ON oi.part_id = p.id
     JOIN orders o ON oi.order_id = o.id
     WHERE o.status IN ('PAID', 'COMPLETED') ${dateFilter}
     GROUP BY p.id, p.name, p.price
     ORDER BY total_sold DESC
     LIMIT 10`,
    params
  );

  return rows;
};

const getRevenueStatusBreakdown = async (dateFilter, params) => {
  const [rows] = await db.query(
    `SELECT status, COUNT(*) as count
     FROM orders ${dateFilter ? 'WHERE order_date BETWEEN ? AND ?' : ''}
     GROUP BY status`,
    params
  );

  return rows;
};

module.exports = {
  getDashboardOverview,
  getDashboardRevenueByDate,
  getDashboardOrderStatus,
  getDashboardBestSelling,
  getDashboardNewUsersByDate,
  getDashboardCategoryStats,
  getDashboardRecentOrders,
  getDetailedRevenueSummary,
  getDetailedRevenueByTime,
  getDetailedProductStats,
  getDetailedCategoryStats,
  getDetailedCustomerStats,
  getDetailedHourlyStats,
  getDetailedWeekdayStats,
  getDetailedTopProducts,
  getDetailedNewCustomers,
  getDetailedConversionRate,
  findAllUsers,
  findExistingUserByUsernameOrEmail,
  createUser,
  assignUserRole,
  updateUserById,
  deleteUserRolesByUserId,
  findOrdersByUserId,
  deleteUserById,
  updateUserStatusById,
  getRevenueSummary,
  getRevenueByDate,
  getRevenueBestSellingParts,
  getRevenueStatusBreakdown
};
