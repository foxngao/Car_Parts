const db = require('../src/config/db');
const path = require('path');

const buildImageSearchQueryData = ({ description = '', category_id, file, protocol, host, page, limit }) => {
  const offset = (page - 1) * limit;

  let imageUrl = null;
  let searchConditions = [];
  let whereParams = [];
  let relevanceCases = [];
  let scoreParams = [];

  if (file) {
    imageUrl = `${protocol}://${host}/uploads/${file.filename}`;

    const originalNameBase = path.parse(file.originalname).name;
    const nameKeywords = originalNameBase.split(/[-_\s]+/).filter(k => k.length >= 3);

    if (nameKeywords.length > 0) {
      nameKeywords.forEach(kw => {
        searchConditions.push('(p.image_url LIKE ?)');
        whereParams.push(`%${kw}%`);
        relevanceCases.push('(CASE WHEN p.image_url LIKE ? THEN 50 ELSE 0 END)');
        scoreParams.push(`%${kw}%`);
      });
    } else if (originalNameBase.length >= 3) {
      searchConditions.push('(p.image_url LIKE ?)');
      whereParams.push(`%${originalNameBase}%`);
      relevanceCases.push('(CASE WHEN p.image_url LIKE ? THEN 100 ELSE 0 END)');
      scoreParams.push(`%${originalNameBase}%`);
    }
  }

  if (description.trim()) {
    const phrases = description.split(',').map(p => p.trim()).filter(p => p.length >= 2);

    if (phrases.length > 0) {
      phrases.forEach(() => {
        searchConditions.push('(p.name LIKE ? OR p.description LIKE ?)');
      });

      phrases.forEach(phrase => {
        whereParams.push(`%${phrase}%`, `%${phrase}%`);
        relevanceCases.push('(CASE WHEN p.name LIKE ? THEN 10 ELSE 0 END) + (CASE WHEN p.description LIKE ? THEN 3 ELSE 0 END)');
        scoreParams.push(`%${phrase}%`, `%${phrase}%`);
      });
    }

    const words = description.replace(/[.,;:]/g, ' ').split(/\s+/).filter(w => w.length >= 2);
    if (words.length > 0) {
      words.forEach(() => {
        searchConditions.push('(p.name LIKE ? OR p.description LIKE ?)');
      });

      words.forEach(word => {
        whereParams.push(`%${word}%`, `%${word}%`);
        relevanceCases.push('(CASE WHEN p.name LIKE ? THEN 2 ELSE 0 END) + (CASE WHEN p.description LIKE ? THEN 1 ELSE 0 END)');
        scoreParams.push(`%${word}%`, `%${word}%`);
      });
    }
  }

  if (searchConditions.length === 0) {
    return {
      imageUrl,
      description: description.trim(),
      countQuery: null,
      countParams: [],
      searchQuery: null,
      searchParams: []
    };
  }

  const finalWhere = [`(${searchConditions.join(' OR ')})`];
  const finalWhereParams = [...whereParams];

  if (category_id) {
    finalWhere.push('p.category_id = ?');
    finalWhereParams.push(category_id);
  }

  const finalWhereClause = `WHERE ${finalWhere.join(' AND ')}`;
  const relevanceSelect = relevanceCases.length > 0
    ? `(${relevanceCases.join(' + ')}) as relevance_score`
    : '0 as relevance_score';
  const havingClause = relevanceCases.length > 0 ? 'HAVING relevance_score >= 5' : '';

  const countQuery = havingClause
    ? `
      SELECT COUNT(*) as total FROM (
        SELECT p.id, ${relevanceSelect}
        FROM parts p
        ${finalWhereClause}
        ${havingClause}
      ) as subquery
    `
    : `SELECT COUNT(DISTINCT p.id) as total FROM parts p ${finalWhereClause}`;

  const countParams = havingClause
    ? [...scoreParams, ...finalWhereParams]
    : [...finalWhereParams];

  const searchQuery = `SELECT DISTINCT p.*, c.name as category_name, ${relevanceSelect}
     FROM parts p
     JOIN categories c ON p.category_id = c.id
     ${finalWhereClause}
     ${havingClause}
     ORDER BY relevance_score DESC, p.name ASC
     LIMIT ? OFFSET ?`;

  const searchParams = [...scoreParams, ...finalWhereParams, limit, offset];

  return {
    imageUrl,
    description: description.trim(),
    countQuery,
    countParams,
    searchQuery,
    searchParams
  };
};

const countPartsByImageSearch = async (query, params) => {
  const [rows] = await db.query(query, params);
  return rows[0]?.total || 0;
};

const findPartsByImageSearch = async (query, params) => {
  const [rows] = await db.query(query, params);
  return rows;
};

module.exports = {
  buildImageSearchQueryData,
  countPartsByImageSearch,
  findPartsByImageSearch
};
