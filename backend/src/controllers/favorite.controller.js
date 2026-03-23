const favoriteModel = require('../models/favorite.model');

// Lấy danh sách sản phẩm yêu thích của user
exports.getFavorites = async (req, res) => {
  try {
    const userId = req.user.id;
    const rows = await favoriteModel.findFavoritesByUserId(userId);

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
    const existing = await favoriteModel.findFavoriteByUserAndPart(userId, partId);

    if (existing.length > 0) {
      // Đã có -> xoá
      await favoriteModel.deleteFavoriteByUserAndPart(userId, partId);
      return res.json({ success: true, isFavorite: false, message: 'Đã bỏ yêu thích' });
    } else {
      // Chưa có -> thêm
      await favoriteModel.insertFavorite(userId, partId);
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

    const existing = await favoriteModel.findFavoriteByUserAndPart(userId, partId);

    res.json({ success: true, isFavorite: existing.length > 0 });
  } catch (error) {
    console.error('Lỗi kiểm tra yêu thích:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};
