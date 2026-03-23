const db = require('../config/db');

const createPlaceholders = (ids) => ids.map(() => '?').join(',');

const findPartsByIds = async (partIds) => {
  const placeholders = createPlaceholders(partIds);
  const [parts] = await db.query(
    `SELECT p.*, c.name as category_name
     FROM parts p
     JOIN categories c ON p.category_id = c.id
     WHERE p.id IN (${placeholders})`,
    partIds
  );
  return parts;
};

const findSpecificationsByPartIds = async (partIds) => {
  const placeholders = createPlaceholders(partIds);
  const [specs] = await db.query(
    `SELECT part_id, spec_name, spec_value, spec_unit
     FROM part_specifications
     WHERE part_id IN (${placeholders})
     ORDER BY spec_name`,
    partIds
  );
  return specs;
};

const findAverageRatingsByPartIds = async (partIds) => {
  const placeholders = createPlaceholders(partIds);
  const [avgRatings] = await db.query(
    `SELECT part_id,
            COUNT(*) as review_count,
            ROUND(AVG(rating), 1) as avg_rating,
            SUM(CASE WHEN rating = 5 THEN 1 ELSE 0 END) as star_5,
            SUM(CASE WHEN rating = 4 THEN 1 ELSE 0 END) as star_4,
            SUM(CASE WHEN rating = 3 THEN 1 ELSE 0 END) as star_3,
            SUM(CASE WHEN rating = 2 THEN 1 ELSE 0 END) as star_2,
            SUM(CASE WHEN rating = 1 THEN 1 ELSE 0 END) as star_1
     FROM part_reviews
     WHERE part_id IN (${placeholders})
     GROUP BY part_id`,
    partIds
  );
  return avgRatings;
};

const findReviewsByPartIds = async (partIds) => {
  const placeholders = createPlaceholders(partIds);
  const [reviews] = await db.query(
    `SELECT pr.*, u.username, u.full_name
     FROM part_reviews pr
     JOIN users u ON pr.user_id = u.id
     WHERE pr.part_id IN (${placeholders})
     ORDER BY pr.created_at DESC`,
    partIds
  );
  return reviews;
};

const findCompatibilityByPartIds = async (partIds) => {
  const placeholders = createPlaceholders(partIds);
  const [compatibility] = await db.query(
    `SELECT pc.part_id, my.id as model_year_id, my.year, 
            cm.name as model_name, b.name as brand_name
     FROM part_compatibility pc
     JOIN model_years my ON pc.model_year_id = my.id
     JOIN car_models cm ON my.model_id = cm.id
     JOIN brands b ON cm.brand_id = b.id
     WHERE pc.part_id IN (${placeholders})
     ORDER BY b.name, cm.name, my.year`,
    partIds
  );
  return compatibility;
};

module.exports = {
  findPartsByIds,
  findSpecificationsByPartIds,
  findAverageRatingsByPartIds,
  findReviewsByPartIds,
  findCompatibilityByPartIds
};
