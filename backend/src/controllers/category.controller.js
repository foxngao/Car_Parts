const categoryModel = require('../models/category.model');

// GET /api/v1/categories
const getAllCategories = async (req, res) => {
  try {
    const categories = await categoryModel.findAllCategories();
    res.json({ success: true, data: categories });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// POST /api/v1/admin/categories
const createCategory = async (req, res) => {
  try {
    const { name } = req.body;
    const result = await categoryModel.createCategory(name);
    res.status(201).json({
      success: true,
      message: 'Category created',
      data: { id: result.insertId, name }
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ success: false, message: 'Category already exists' });
    }
    console.error('Create category error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// PUT /api/v1/admin/categories/:id
const updateCategory = async (req, res) => {
  try {
    const { name } = req.body;
    const result = await categoryModel.updateCategoryById(req.params.id, name);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }
    res.json({ success: true, message: 'Category updated' });
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// DELETE /api/v1/admin/categories/:id
const deleteCategory = async (req, res) => {
  try {
    const result = await categoryModel.deleteCategoryById(req.params.id);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }
    res.json({ success: true, message: 'Category deleted' });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports = { getAllCategories, createCategory, updateCategory, deleteCategory };
