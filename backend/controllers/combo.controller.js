const comboModel = require('../src/models/combo.model');

// Lấy danh sách tất cả combos
exports.getCombos = async (req, res) => {
  try {
    const combos = await comboModel.findAllCombos();
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
    const comboInfo = await comboModel.findComboById(id);

    if (comboInfo.length === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy combo' });
    }

    // Lấy các sản phẩm trong combo
    const items = await comboModel.findComboItemsByComboId(id);

    const combo = comboInfo[0];
    combo.items = items;

    res.json({ success: true, data: combo });
  } catch (error) {
    console.error('Lỗi lấy chi tiết combo:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};
