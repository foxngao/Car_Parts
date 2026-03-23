const brandModel = require('../models/brand.model');
const modelModel = require('../models/model.model');

// GET /api/v1/brands
const getAllBrands = async (req, res) => {
  try {
    const brands = await brandModel.findAll();
    res.json({ success: true, data: brands });
  } catch (error) {
    console.error('Get brands error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// GET /api/v1/brands/:id/models
const getModelsByBrand = async (req, res) => {
  try {
    const models = await modelModel.findByBrandId(req.params.id);
    res.json({ success: true, data: models });
  } catch (error) {
    console.error('Get models by brand error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// POST /api/v1/admin/brands (admin)
const createBrand = async (req, res) => {
  try {
    const { name, country } = req.body;
    const result = await brandModel.createBrand({ name, country });
    res.status(201).json({
      success: true,
      message: 'Brand created',
      data: { id: result.insertId, name, country }
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ success: false, message: 'Brand already exists' });
    }
    console.error('Create brand error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// PUT /api/v1/admin/brands/:id
const updateBrand = async (req, res) => {
  try {
    const { name, country } = req.body;
    const result = await brandModel.updateBrandById(req.params.id, { name, country });
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Brand not found' });
    }
    res.json({ success: true, message: 'Brand updated' });
  } catch (error) {
    console.error('Update brand error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// DELETE /api/v1/admin/brands/:id
const deleteBrand = async (req, res) => {
  try {
    const result = await brandModel.deleteBrandById(req.params.id);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Brand not found' });
    }
    res.json({ success: true, message: 'Brand deleted' });
  } catch (error) {
    console.error('Delete brand error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports = { getAllBrands, getModelsByBrand, createBrand, updateBrand, deleteBrand };
