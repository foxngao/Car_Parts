const db = require('../src/config/db');

const findWmiMapping = async (wmi) => {
  const [rows] = await db.query(
    `SELECT vwm.*, b.name as brand_name, b.country as brand_country
     FROM vin_wmi_mappings vwm
     JOIN brands b ON vwm.brand_id = b.id
     WHERE vwm.wmi_code = ?`,
    [wmi]
  );
  return rows;
};

const findModelsByBrandId = async (brandId) => {
  const [rows] = await db.query(
    'SELECT id, name FROM car_models WHERE brand_id = ? ORDER BY name',
    [brandId]
  );
  return rows;
};

const findModelYearsByBrandIdAndYear = async (brandId, year) => {
  const [rows] = await db.query(
    `SELECT my.id, my.year, cm.name as model_name, cm.id as model_id
     FROM model_years my
     JOIN car_models cm ON my.model_id = cm.id
     WHERE cm.brand_id = ? AND my.year = ?
     ORDER BY cm.name`,
    [brandId, year]
  );
  return rows;
};

const countCompatiblePartsByBrandAndYear = async (brandId, year) => {
  const params = [brandId];
  let modelYearCondition = '';

  if (year) {
    modelYearCondition = 'AND my.year = ?';
    params.push(year);
  }

  const [rows] = await db.query(
    `SELECT COUNT(DISTINCT p.id) as total
     FROM parts p
     JOIN part_compatibility pc ON p.id = pc.part_id
     JOIN model_years my ON pc.model_year_id = my.id
     JOIN car_models cm ON my.model_id = cm.id
     WHERE cm.brand_id = ? ${modelYearCondition}`,
    params
  );

  return rows[0]?.total || 0;
};

const findCompatiblePartsByBrandAndYear = async (brandId, year, limit, offset) => {
  const params = [brandId];
  let modelYearCondition = '';

  if (year) {
    modelYearCondition = 'AND my.year = ?';
    params.push(year);
  }

  const [rows] = await db.query(
    `SELECT DISTINCT p.*, c.name as category_name
     FROM parts p
     JOIN categories c ON p.category_id = c.id
     JOIN part_compatibility pc ON p.id = pc.part_id
     JOIN model_years my ON pc.model_year_id = my.id
     JOIN car_models cm ON my.model_id = cm.id
     WHERE cm.brand_id = ? ${modelYearCondition}
     ORDER BY p.name
     LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );

  return rows;
};

module.exports = {
  findWmiMapping,
  findModelsByBrandId,
  findModelYearsByBrandIdAndYear,
  countCompatiblePartsByBrandAndYear,
  findCompatiblePartsByBrandAndYear
};
