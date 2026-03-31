const db = require('../src/config/db');

const findByBrandId = async (brandId) => {
  const [models] = await db.query(
    'SELECT * FROM car_models WHERE brand_id = ? ORDER BY name',
    [brandId]
  );

  return models;
};

const findByModelId = async (modelId) => {
  const [years] = await db.query(
    'SELECT * FROM model_years WHERE model_id = ? ORDER BY year DESC',
    [modelId]
  );

  return years;
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

const createModelYear = async ({ model_id, year }) => {
  const [result] = await db.query(
    'INSERT INTO model_years (model_id, year) VALUES (?, ?)',
    [model_id, year]
  );

  return result;
};

const deleteModelYearById = async (id) => {
  const [result] = await db.query('DELETE FROM model_years WHERE id = ?', [id]);
  return result;
};

module.exports = {
  findByBrandId,
  findByModelId,
  createModel,
  updateModelById,
  deleteModelById,
  createModelYear,
  deleteModelYearById
};
