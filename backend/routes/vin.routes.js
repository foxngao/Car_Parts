const express = require('express');
const router = express.Router();
const { decodeVin, searchByVin } = require('../controllers/vin.controller');

// GET /api/v1/vin/decode/:vin - Giải mã VIN
router.get('/decode/:vin', decodeVin);

// GET /api/v1/vin/search/:vin - Tìm phụ tùng theo VIN
router.get('/search/:vin', searchByVin);

module.exports = router;
