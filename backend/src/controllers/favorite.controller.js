const db = require('../config/db');

// Lấy danh sách sản phẩm yêu thích của user
exports.getFavorites = async (req, res) => {
  try {
    const userId = req.user.id;
    const [rows] = await db.query(`
      SELECT p.*, c.name as category_name
      FROM favorite_parts fp
      JOIN parts p ON fp.part_id = p.id
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE fp.user_id = ?
      ORDER BY fp.created_at DESC
    `, [userId]);

    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Lỗi lấy danh sách yêu thích:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

// Thêm/Xóa sản phẩm yêu thích
exports.toggleFavorite = async (req, res) => {
  try {
    const userId = req.user.id;
    const { partId } = req.body;

    if (!partId) {
      return res.status(400).json({ success: false, message: 'Thiếu partId' });
    }

    // Kiểm tra xem đã yêu thích chưa
    const [existing] = await db.query(
      'SELECT * FROM favorite_parts WHERE user_id = ? AND part_id = ?',
      [userId, partId]
    );

    if (existing.length > 0) {
      // Đã có -> xoá
      await db.query('DELETE FROM favorite_parts WHERE user_id = ? AND part_id = ?', [userId, partId]);
      return res.json({ success: true, isFavorite: false, message: 'Đã bỏ yêu thích' });
    } else {
      // Chưa có -> thêm
      await db.query('INSERT INTO favorite_parts (user_id, part_id) VALUES (?, ?)', [userId, partId]);
      return res.json({ success: true, isFavorite: true, message: 'Đã thêm vào yêu thích' });
    }
  } catch (error) {
    console.error('Lỗi toggle yêu thích:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

// Kiểm tra trạng thái yêu thích của 1 sản phẩm
exports.checkFavorite = async (req, res) => {
  try {
    const userId = req.user.id;
    const { partId } = req.params;

    const [existing] = await db.query(
      'SELECT * FROM favorite_parts WHERE user_id = ? AND part_id = ?',
      [userId, partId]
    );

    res.json({ success: true, isFavorite: existing.length > 0 });
  } catch (error) {
    console.error('Lỗi kiểm tra yêu thích:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};
