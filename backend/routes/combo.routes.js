const express = require('express');
const router = express.Router();
const comboController = require('../controllers/combo.controller');

// Trả về danh sách Combos (công khai)
router.get('/', comboController.getCombos);

// Trả về chi tiết combo (công khai)
router.get('/:id', comboController.getComboDetails);

module.exports = router;
