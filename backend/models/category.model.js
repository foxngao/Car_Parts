const db = require('../src/config/db');

const findAllCategories = async () => {
  const [categories] = await db.query('SELECT * FROM categories ORDER BY name');
  return categories;
};

const createCategory = async (name) => {
  const [result] = await db.query('INSERT INTO categories (name) VALUES (?)', [name]);
  return result;
};

const updateCategoryById = async (id, name) => {
  const [result] = await db.query('UPDATE categories SET name = ? WHERE id = ?', [name, id]);
  return result;
};

const deleteCategoryById = async (id) => {
  const [result] = await db.query('DELETE FROM categories WHERE id = ?', [id]);
  return result;
};

module.exports = {
  findAllCategories,
  createCategory,
  updateCategoryById,
  deleteCategoryById
};
