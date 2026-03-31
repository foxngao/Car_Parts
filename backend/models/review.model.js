const db = require('../src/config/db');

const findReviewSummaryByPartId = async (partId) => {
  const [rows] = await db.query(
    `SELECT 
      COUNT(*) as review_count,
      ROUND(AVG(rating), 1) as avg_rating,
      SUM(CASE WHEN rating = 5 THEN 1 ELSE 0 END) as star_5,
      SUM(CASE WHEN rating = 4 THEN 1 ELSE 0 END) as star_4,
      SUM(CASE WHEN rating = 3 THEN 1 ELSE 0 END) as star_3,
      SUM(CASE WHEN rating = 2 THEN 1 ELSE 0 END) as star_2,
      SUM(CASE WHEN rating = 1 THEN 1 ELSE 0 END) as star_1
     FROM part_reviews WHERE part_id = ?`,
    [partId]
  );

  return rows;
};

const findReviewsByPartId = async (partId) => {
  const [rows] = await db.query(
    `SELECT pr.*, u.username, u.full_name
     FROM part_reviews pr
     JOIN users u ON pr.user_id = u.id
     WHERE pr.part_id = ?
     ORDER BY pr.created_at DESC`,
    [partId]
  );

  return rows;
};

const findPartById = async (partId) => {
  const [rows] = await db.query('SELECT id FROM parts WHERE id = ?', [partId]);
  return rows;
};

const findExistingReview = async (partId, userId) => {
  const [rows] = await db.query(
    'SELECT id FROM part_reviews WHERE part_id = ? AND user_id = ?',
    [partId, userId]
  );

  return rows;
};

const createReview = async (partId, userId, rating, comment) => {
  const [result] = await db.query(
    'INSERT INTO part_reviews (part_id, user_id, rating, comment) VALUES (?, ?, ?, ?)',
    [partId, userId, rating, comment || null]
  );

  return result;
};

const findReviewById = async (id) => {
  const [rows] = await db.query('SELECT * FROM part_reviews WHERE id = ?', [id]);
  return rows;
};

const updateReviewById = async (id, rating, comment) => {
  const [result] = await db.query(
    'UPDATE part_reviews SET rating = ?, comment = ? WHERE id = ?',
    [rating, comment || null, id]
  );

  return result;
};

const deleteReviewById = async (id) => {
  const [result] = await db.query('DELETE FROM part_reviews WHERE id = ?', [id]);
  return result;
};

module.exports = {
  findReviewSummaryByPartId,
  findReviewsByPartId,
  findPartById,
  findExistingReview,
  createReview,
  findReviewById,
  updateReviewById,
  deleteReviewById
};
