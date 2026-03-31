const db = require('../src/config/db');

const findAll = async () => {
  const [brands] = await db.query('SELECT * FROM brands ORDER BY name');
  return brands;
};

const createBrand = async ({ name, country }) => {
  const [result] = await db.query(
    'INSERT INTO brands (name, country) VALUES (?, ?)',
    [name, country]
  );

  return result;
};

const updateBrandById = async (id, { name, country }) => {
  const [result] = await db.query(
    'UPDATE brands SET name = ?, country = ? WHERE id = ?',
    [name, country, id]
  );

  return result;
};

const deleteBrandById = async (id) => {
  const [result] = await db.query('DELETE FROM brands WHERE id = ?', [id]);
  return result;
};

module.exports = { findAll, createBrand, updateBrandById, deleteBrandById };
