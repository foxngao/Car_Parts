const db = require('../src/config/db');

const getConnection = async () => db.getConnection();

const searchParts = async ({
  keyword,
  model_year_id,
  category_id,
  min_price,
  max_price,
  brand_id,
  year,
  is_combo,
  sort_by = 'name',
  sort_order = 'asc',
  page = 1,
  limit = 10
}) => {
  const offset = (page - 1) * limit;
  const where = [];
  const params = [];
  let needCompatibilityJoin = false;

  if (keyword) {
    where.push('(p.name LIKE ? OR p.description LIKE ?)');
    params.push(`%${keyword}%`, `%${keyword}%`);
  }

  if (model_year_id) {
    where.push('pc.model_year_id = ?');
    params.push(model_year_id);
    needCompatibilityJoin = true;
  }

  if (category_id) {
    where.push('p.category_id = ?');
    params.push(category_id);
  }

  if (min_price) {
    where.push('p.price >= ?');
    params.push(parseFloat(min_price));
  }

  if (max_price) {
    where.push('p.price <= ?');
    params.push(parseFloat(max_price));
  }

  if (brand_id) {
    where.push('cm.brand_id = ?');
    params.push(parseInt(brand_id));
    needCompatibilityJoin = true;
  }

  if (year) {
    where.push('my.year = ?');
    params.push(parseInt(year));
    needCompatibilityJoin = true;
  }

  if (category_id) {
    where.push('p.category_id = ?');
    params.push(category_id);
  }

  if (is_combo !== undefined) {
    where.push('p.is_combo = ?');
    params.push(is_combo === 'true' || is_combo === '1');
  }

  const whereClause = where.length > 0 ? `WHERE ${where.join(' AND ')}` : '';

  const joinClause = needCompatibilityJoin
    ? `JOIN part_compatibility pc ON p.id = pc.part_id
       JOIN model_years my ON pc.model_year_id = my.id
       JOIN car_models cm ON my.model_id = cm.id`
    : 'LEFT JOIN part_compatibility pc ON p.id = pc.part_id';

  const validSortFields = {
    name: 'p.name',
    price: 'p.price',
    created_at: 'p.created_at',
    stock: 'p.stock_quantity'
  };
  const sortField = validSortFields[sort_by] || 'p.name';
  const sortDir = String(sort_order).toLowerCase() === 'desc' ? 'DESC' : 'ASC';

  const [countResult] = await db.query(
    `SELECT COUNT(DISTINCT p.id) as total FROM parts p ${joinClause} ${whereClause}`,
    params
  );

  const [parts] = await db.query(
    `SELECT DISTINCT p.*, c.name as category_name
     FROM parts p
     JOIN categories c ON p.category_id = c.id
     ${joinClause}
     ${whereClause}
     ORDER BY ${sortField} ${sortDir}
     LIMIT ? OFFSET ?`,
    [...params, parseInt(limit), parseInt(offset)]
  );

  return {
    parts,
    total: countResult[0].total,
    page: parseInt(page),
    limit: parseInt(limit)
  };
};

const findSuggestions = async (keyword) => {
  const [partSuggestions] = await db.query(
    `SELECT DISTINCT p.id, p.name, p.price, p.image_url, c.name as category_name, 'part' as type
     FROM parts p
     JOIN categories c ON p.category_id = c.id
     WHERE p.name LIKE ? OR p.description LIKE ?
     ORDER BY 
       CASE WHEN p.name LIKE ? THEN 0 ELSE 1 END,
       p.name
     LIMIT 6`,
    [`%${keyword}%`, `%${keyword}%`, `${keyword}%`]
  );

  const [categorySuggestions] = await db.query(
    `SELECT id, name, 'category' as type
     FROM categories
     WHERE name LIKE ?
     ORDER BY name
     LIMIT 3`,
    [`%${keyword}%`]
  );

  const [brandSuggestions] = await db.query(
    `SELECT id, name, country, 'brand' as type
     FROM brands
     WHERE name LIKE ?
     ORDER BY name
     LIMIT 3`,
    [`%${keyword}%`]
  );

  return {
    parts: partSuggestions,
    categories: categorySuggestions,
    brands: brandSuggestions
  };
};

const findPartById = async (id) => {
  const [parts] = await db.query(
    `SELECT p.*, c.name as category_name
     FROM parts p
     JOIN categories c ON p.category_id = c.id
     WHERE p.id = ?`,
    [id]
  );
  return parts;
};

const findCompatibleVehiclesByPartId = async (id) => {
  const [compatibility] = await db.query(
    `SELECT my.id as model_year_id, my.year, cm.name as model_name, b.name as brand_name
     FROM part_compatibility pc
     JOIN model_years my ON pc.model_year_id = my.id
     JOIN car_models cm ON my.model_id = cm.id
     JOIN brands b ON cm.brand_id = b.id
     WHERE pc.part_id = ?
     ORDER BY b.name, cm.name, my.year`,
    [id]
  );
  return compatibility;
};

const createPart = async (connection, { category_id, name, description, price, stock_quantity, image_url, is_combo }) => {
  const [result] = await connection.query(
    'INSERT INTO parts (category_id, name, description, price, stock_quantity, image_url, is_combo) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [category_id, name, description, price, stock_quantity, image_url, is_combo]
  );
  return result;
};

const insertComboItems = async (connection, comboId, comboItems) => {
  const values = comboItems.map(item => [comboId, item.part_id, item.quantity]);
  const [result] = await connection.query(
    'INSERT INTO combo_items (combo_id, part_id, quantity) VALUES ?',
    [values]
  );
  return result;
};

const updatePartById = async (connection, id, { category_id, name, description, price, stock_quantity, image_url, is_combo }) => {
  const [result] = await connection.query(
    'UPDATE parts SET category_id = ?, name = ?, description = ?, price = ?, stock_quantity = ?, image_url = ?, is_combo = ? WHERE id = ?',
    [category_id, name, description, price, stock_quantity, image_url, is_combo, id]
  );
  return result;
};

const deleteComboItemsByComboId = async (connection, comboId) => {
  const [result] = await connection.query('DELETE FROM combo_items WHERE combo_id = ?', [comboId]);
  return result;
};

const deletePartById = async (id) => {
  const [result] = await db.query('DELETE FROM parts WHERE id = ?', [id]);
  return result;
};

const addCompatibilityMappings = async (partId, modelYearIds) => {
  const values = modelYearIds.map(modelYearId => [partId, modelYearId]);
  const [result] = await db.query(
    'INSERT IGNORE INTO part_compatibility (part_id, model_year_id) VALUES ?',
    [values]
  );
  return result;
};

module.exports = {
  getConnection,
  searchParts,
  findSuggestions,
  findPartById,
  findCompatibleVehiclesByPartId,
  createPart,
  insertComboItems,
  updatePartById,
  deleteComboItemsByComboId,
  deletePartById,
  addCompatibilityMappings
};
