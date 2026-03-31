const express = require('express');
const router = express.Router();
const { upload, searchByImage } = require('../controllers/imageSearch.controller');

// POST /api/v1/search/image - Tìm kiếm bằng hình ảnh + mô tả
router.post('/image', (req, res, next) => {
  upload.single('image')(req, res, (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ success: false, message: 'File quá lớn. Tối đa 5MB.' });
      }
      return res.status(400).json({ success: false, message: err.message });
    }
    next();
  });
}, searchByImage);

module.exports = router;
