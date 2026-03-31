const db = require('../src/config/db');

const findPartsByModelYearId = async (modelYearId) => {
  const [parts] = await db.query(
    `SELECT p.*, c.name as category_name
       FROM parts p
       JOIN part_compatibility pc ON p.id = pc.part_id
       JOIN categories c ON p.category_id = c.id
       WHERE pc.model_year_id = ?
       ORDER BY p.name`,
    [modelYearId]
  );

  return parts;
};

module.exports = { findPartsByModelYearId };
