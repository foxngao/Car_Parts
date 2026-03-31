const db = require('../config/db');

const findRecentSearchByUser = async (userId, query, searchType) => {
  const [recent] = await db.query(
    `SELECT id FROM search_history 
     WHERE user_id = ? AND query = ? AND search_type = ? 
     AND created_at > DATE_SUB(NOW(), INTERVAL 5 MINUTE)
     LIMIT 1`,
    [userId, query, searchType]
  );
  return recent;
};

const updateSearchHistoryResult = async (id, resultsCount) => {
  const [result] = await db.query(
    'UPDATE search_history SET results_count = ?, created_at = NOW() WHERE id = ?',
    [resultsCount, id]
  );
  return result;
};

const createSearchHistory = async (userId, searchType, query, filtersJson, resultsCount) => {
  const [result] = await db.query(
    `INSERT INTO search_history (user_id, search_type, query, filters, results_count) 
     VALUES (?, ?, ?, ?, ?)`,
    [userId, searchType, query, filtersJson, resultsCount]
  );
  return result;
};

const trimSearchHistoryByUser = async (userId) => {
  const [result] = await db.query(
    `DELETE FROM search_history 
     WHERE user_id = ? AND id NOT IN (
       SELECT id FROM (
         SELECT id FROM search_history WHERE user_id = ? ORDER BY created_at DESC LIMIT 100
       ) as recent
     )`,
    [userId, userId]
  );
  return result;
};

const findSearchHistoryByUser = async (userId, searchType, limit) => {
  let where = 'WHERE user_id = ?';
  const params = [userId];

  if (searchType) {
    where += ' AND search_type = ?';
    params.push(searchType);
  }

  const [history] = await db.query(
    `SELECT * FROM search_history 
     ${where}
     ORDER BY created_at DESC 
     LIMIT ?`,
    [...params, limit]
  );

  return history;
};

const deleteSearchHistoryItem = async (id, userId) => {
  const [result] = await db.query(
    'DELETE FROM search_history WHERE id = ? AND user_id = ?',
    [id, userId]
  );
  return result;
};

const deleteAllSearchHistoryByUser = async (userId) => {
  const [result] = await db.query('DELETE FROM search_history WHERE user_id = ?', [userId]);
  return result;
};

module.exports = {
  findRecentSearchByUser,
  updateSearchHistoryResult,
  createSearchHistory,
  trimSearchHistoryByUser,
  findSearchHistoryByUser,
  deleteSearchHistoryItem,
  deleteAllSearchHistoryByUser
};
