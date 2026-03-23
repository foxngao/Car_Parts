const db = require('../config/db');

// Lấy danh sách tất cả combos
exports.getCombos = async (req, res) => {
  try {
    const [combos] = await db.query(`
      SELECT p.*, c.name as category_name
      FROM parts p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.is_combo = TRUE
      ORDER BY p.created_at DESC
    `);
    res.json({ success: true, data: combos });
  } catch (error) {
    console.error('Lỗi lấy danh sách combo:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

// Lấy chi tiết combo và các sản phẩm bên trong
exports.getComboDetails = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Lấy thông tin combo
    const [comboInfo] = await db.query(`
      SELECT p.*, c.name as category_name
      FROM parts p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.id = ? AND p.is_combo = TRUE
    `, [id]);

    if (comboInfo.length === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy combo' });
    }

    // Lấy các sản phẩm trong combo
    const [items] = await db.query(`
      SELECT p.*, ci.quantity as combo_quantity, c.name as category_name
      FROM combo_items ci
      JOIN parts p ON ci.part_id = p.id
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE ci.combo_id = ?
    `, [id]);

    const combo = comboInfo[0];
    combo.items = items;

    res.json({ success: true, data: combo });
  } catch (error) {
    console.error('Lỗi lấy chi tiết combo:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};
