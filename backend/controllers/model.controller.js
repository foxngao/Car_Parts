const modelModel = require('../models/model.model');

// GET /api/v1/models/:id/years
const getYearsByModel = async (req, res) => {
  try {
    const years = await modelModel.findByModelId(req.params.id);
    res.json({ success: true, data: years });
  } catch (error) {
    console.error('Get years error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// POST /api/v1/admin/models
const createModel = async (req, res) => {
  try {
    const { brand_id, name } = req.body;
    const result = await modelModel.createModel({ brand_id, name });
    res.status(201).json({
      success: true,
      message: 'Model created',
      data: { id: result.insertId, brand_id, name }
    });
  } catch (error) {
    console.error('Create model error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// PUT /api/v1/admin/models/:id
const updateModel = async (req, res) => {
  try {
    const { brand_id, name } = req.body;
    const result = await modelModel.updateModelById(req.params.id, { brand_id, name });
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Model not found' });
    }
    res.json({ success: true, message: 'Model updated' });
  } catch (error) {
    console.error('Update model error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// DELETE /api/v1/admin/models/:id
const deleteModel = async (req, res) => {
  try {
    const result = await modelModel.deleteModelById(req.params.id);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Model not found' });
    }
    res.json({ success: true, message: 'Model deleted' });
  } catch (error) {
    console.error('Delete model error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// POST /api/v1/admin/model-years
const createModelYear = async (req, res) => {
  try {
    const { model_id, year } = req.body;
    const result = await modelModel.createModelYear({ model_id, year });
    res.status(201).json({
      success: true,
      message: 'Model year created',
      data: { id: result.insertId, model_id, year }
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ success: false, message: 'This model year already exists' });
    }
    console.error('Create model year error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// DELETE /api/v1/admin/model-years/:id
const deleteModelYear = async (req, res) => {
  try {
    const result = await modelModel.deleteModelYearById(req.params.id);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Model year not found' });
    }
    res.json({ success: true, message: 'Model year deleted' });
  } catch (error) {
    console.error('Delete model year error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports = { getYearsByModel, createModel, updateModel, deleteModel, createModelYear, deleteModelYear };
