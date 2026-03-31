const db = require('../src/config/db');

const findCartItemsByUserId = async (userId) => {
  const [rows] = await db.query(
    `SELECT ci.id, ci.quantity, p.id as part_id, p.name, p.price, p.stock_quantity, p.image_url,
            (ci.quantity * p.price) as subtotal
     FROM cart_items ci
     JOIN parts p ON ci.part_id = p.id
     WHERE ci.user_id = ?
     ORDER BY ci.created_at DESC`,
    [userId]
  );

  return rows;
};

const findPartStockById = async (partId) => {
  const [rows] = await db.query('SELECT stock_quantity, name FROM parts WHERE id = ?', [partId]);
  return rows;
};

const upsertCartItem = async (userId, partId, quantity) => {
  const [result] = await db.query(
    `INSERT INTO cart_items (user_id, part_id, quantity)
     VALUES (?, ?, ?)
     ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity)`,
    [userId, partId, quantity]
  );

  return result;
};

const findCartItemWithStockById = async (id, userId) => {
  const [rows] = await db.query(
    `SELECT ci.part_id, p.stock_quantity
     FROM cart_items ci JOIN parts p ON ci.part_id = p.id
     WHERE ci.id = ? AND ci.user_id = ?`,
    [id, userId]
  );

  return rows;
};

const updateCartItemQuantityById = async (quantity, id, userId) => {
  const [result] = await db.query(
    'UPDATE cart_items SET quantity = ? WHERE id = ? AND user_id = ?',
    [quantity, id, userId]
  );

  return result;
};

const deleteCartItemById = async (id, userId) => {
  const [result] = await db.query(
    'DELETE FROM cart_items WHERE id = ? AND user_id = ?',
    [id, userId]
  );

  return result;
};

module.exports = {
  findCartItemsByUserId,
  findPartStockById,
  upsertCartItem,
  findCartItemWithStockById,
  updateCartItemQuantityById,
  deleteCartItemById
};
