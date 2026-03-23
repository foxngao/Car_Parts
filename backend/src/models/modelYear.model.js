const db = require('../config/db');

const findByModelId = async (modelId) => {
  const [years] = await db.query(
    'SELECT * FROM model_years WHERE model_id = ? ORDER BY year DESC',
    [modelId]
  );

  return years;
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

module.exports = { findByModelId, createModelYear, deleteModelYearById };
