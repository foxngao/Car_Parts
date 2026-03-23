const db = require('../config/db');

const findByBrandId = async (brandId) => {
  const [models] = await db.query(
    'SELECT * FROM car_models WHERE brand_id = ? ORDER BY name',
    [brandId]
  );

  return models;
};

const createModel = async ({ brand_id, name }) => {
  const [result] = await db.query(
    'INSERT INTO car_models (brand_id, name) VALUES (?, ?)',
    [brand_id, name]
  );

  return result;
};

const updateModelById = async (id, { brand_id, name }) => {
  const [result] = await db.query(
    'UPDATE car_models SET brand_id = ?, name = ? WHERE id = ?',
    [brand_id, name, id]
  );

  return result;
};

const deleteModelById = async (id) => {
  const [result] = await db.query('DELETE FROM car_models WHERE id = ?', [id]);
  return result;
};

module.exports = { findByBrandId, createModel, updateModelById, deleteModelById };
