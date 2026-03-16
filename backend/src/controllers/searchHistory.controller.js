const db = require('../config/db');

// POST /api/v1/search-history - Lưu lịch sử tìm kiếm
const saveSearch = async (req, res) => {
  try {
    const { search_type = 'keyword', query, filters = null, results_count = 0 } = req.body;

    if (!query || !query.trim()) {
      return res.status(400).json({ success: false, message: 'Query is required' });
    }

    // Kiểm tra trùng lặp gần đây (trong 5 phút) để tránh spam
    const [recent] = await db.query(
      `SELECT id FROM search_history 
       WHERE user_id = ? AND query = ? AND search_type = ? 
       AND created_at > DATE_SUB(NOW(), INTERVAL 5 MINUTE)
       LIMIT 1`,
      [req.user.id, query.trim(), search_type]
    );

    if (recent.length > 0) {
      // Cập nhật results_count thay vì tạo mới
      await db.query(
        'UPDATE search_history SET results_count = ?, created_at = NOW() WHERE id = ?',
        [results_count, recent[0].id]
      );
      return res.json({ success: true, message: 'Search history updated' });
    }

    const filtersJson = filters ? JSON.stringify(filters) : null;

    await db.query(
      `INSERT INTO search_history (user_id, search_type, query, filters, results_count) 
       VALUES (?, ?, ?, ?, ?)`,
      [req.user.id, search_type, query.trim(), filtersJson, results_count]
    );

    // Giữ tối đa 100 mục lịch sử cho mỗi user
    await db.query(
      `DELETE FROM search_history 
       WHERE user_id = ? AND id NOT IN (
         SELECT id FROM (
           SELECT id FROM search_history WHERE user_id = ? ORDER BY created_at DESC LIMIT 100
         ) as recent
       )`,
      [req.user.id, req.user.id]
    );

    res.status(201).json({ success: true, message: 'Search history saved' });
  } catch (error) {
    console.error('Save search history error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// GET /api/v1/search-history - Lấy lịch sử tìm kiếm
const getSearchHistory = async (req, res) => {
  try {
    const { limit = 50, search_type } = req.query;

    let where = 'WHERE user_id = ?';
    let params = [req.user.id];

    if (search_type) {
      where += ' AND search_type = ?';
      params.push(search_type);
    }

    const [history] = await db.query(
      `SELECT * FROM search_history 
       ${where}
       ORDER BY created_at DESC 
       LIMIT ?`,
      [...params, parseInt(limit)]
    );

    // Parse JSON filters
    const formattedHistory = history.map(item => {
      let parsedFilters = null;
      try {
        if (item.filters) {
          parsedFilters = typeof item.filters === 'string' ? JSON.parse(item.filters) : item.filters;
        }
      } catch { parsedFilters = null; }
      return { ...item, filters: parsedFilters };
    });

    res.json({ success: true, data: formattedHistory });
  } catch (error) {
    console.error('Get search history error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// DELETE /api/v1/search-history/:id - Xóa 1 mục
const deleteSearchItem = async (req, res) => {
  try {
    const [result] = await db.query(
      'DELETE FROM search_history WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Not found' });
    }
    res.json({ success: true, message: 'Deleted' });
  } catch (error) {
    console.error('Delete search item error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// DELETE /api/v1/search-history/all - Xóa tất cả
const deleteAllSearchHistory = async (req, res) => {
  try {
    await db.query('DELETE FROM search_history WHERE user_id = ?', [req.user.id]);
    res.json({ success: true, message: 'All search history deleted' });
  } catch (error) {
    console.error('Delete all search history error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports = { saveSearch, getSearchHistory, deleteSearchItem, deleteAllSearchHistory };
