const reviewModel = require('../models/review.model');

// GET /api/v1/parts/:id/reviews
const getReviews = async (req, res) => {
  try {
    const partId = req.params.id;

    // Lấy rating summary
    const summary = await reviewModel.findReviewSummaryByPartId(partId);

    // Lấy danh sách reviews
    const reviews = await reviewModel.findReviewsByPartId(partId);

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
    const parts = await reviewModel.findPartById(partId);
    if (parts.length === 0) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Kiểm tra đã review chưa
    const existing = await reviewModel.findExistingReview(partId, req.user.id);
    if (existing.length > 0) {
      return res.status(409).json({ success: false, message: 'Bạn đã đánh giá sản phẩm này rồi' });
    }

    const result = await reviewModel.createReview(partId, req.user.id, rating, comment);

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

    const reviews = await reviewModel.findReviewById(req.params.id);

    if (reviews.length === 0) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    if (reviews[0].user_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Bạn chỉ có thể sửa đánh giá của mình' });
    }

    await reviewModel.updateReviewById(req.params.id, rating, comment);

    res.json({ success: true, message: 'Cập nhật đánh giá thành công' });
  } catch (error) {
    console.error('Update review error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// DELETE /api/v1/reviews/:id
const deleteReview = async (req, res) => {
  try {
    const reviews = await reviewModel.findReviewById(req.params.id);

    if (reviews.length === 0) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    // Chỉ owner hoặc admin mới được xóa
    if (reviews[0].user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Không có quyền xóa đánh giá này' });
    }

    await reviewModel.deleteReviewById(req.params.id);

    res.json({ success: true, message: 'Xóa đánh giá thành công' });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports = { getReviews, createReview, updateReview, deleteReview };
