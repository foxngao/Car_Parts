const db = require('../config/db');

// GET /api/v1/parts/:id/reviews
const getReviews = async (req, res) => {
  try {
    const partId = req.params.id;

    // Lấy rating summary
    const [summary] = await db.query(
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

    // Lấy danh sách reviews
    const [reviews] = await db.query(
      `SELECT pr.*, u.username, u.full_name
       FROM part_reviews pr
       JOIN users u ON pr.user_id = u.id
       WHERE pr.part_id = ?
       ORDER BY pr.created_at DESC`,
      [partId]
    );

    res.json({
      success: true,
      data: {
        summary: summary[0],
        reviews
      }
    });
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// POST /api/v1/parts/:id/reviews
const createReview = async (req, res) => {
  try {
    const partId = req.params.id;
    const { rating, comment } = req.body;

    // Kiểm tra part tồn tại
    const [parts] = await db.query('SELECT id FROM parts WHERE id = ?', [partId]);
    if (parts.length === 0) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Kiểm tra đã review chưa
    const [existing] = await db.query(
      'SELECT id FROM part_reviews WHERE part_id = ? AND user_id = ?',
      [partId, req.user.id]
    );
    if (existing.length > 0) {
      return res.status(409).json({ success: false, message: 'Bạn đã đánh giá sản phẩm này rồi' });
    }

    const [result] = await db.query(
      'INSERT INTO part_reviews (part_id, user_id, rating, comment) VALUES (?, ?, ?, ?)',
      [partId, req.user.id, rating, comment || null]
    );

    res.status(201).json({
      success: true,
      message: 'Đánh giá thành công',
      data: { id: result.insertId, part_id: partId, rating, comment }
    });
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// PUT /api/v1/reviews/:id
const updateReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;

    const [reviews] = await db.query(
      'SELECT * FROM part_reviews WHERE id = ?',
      [req.params.id]
    );

    if (reviews.length === 0) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    if (reviews[0].user_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Bạn chỉ có thể sửa đánh giá của mình' });
    }

    await db.query(
      'UPDATE part_reviews SET rating = ?, comment = ? WHERE id = ?',
      [rating, comment || null, req.params.id]
    );

    res.json({ success: true, message: 'Cập nhật đánh giá thành công' });
  } catch (error) {
    console.error('Update review error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// DELETE /api/v1/reviews/:id
const deleteReview = async (req, res) => {
  try {
    const [reviews] = await db.query(
      'SELECT * FROM part_reviews WHERE id = ?',
      [req.params.id]
    );

    if (reviews.length === 0) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    // Chỉ owner hoặc admin mới được xóa
    if (reviews[0].user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Không có quyền xóa đánh giá này' });
    }

    await db.query('DELETE FROM part_reviews WHERE id = ?', [req.params.id]);

    res.json({ success: true, message: 'Xóa đánh giá thành công' });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports = { getReviews, createReview, updateReview, deleteReview };
