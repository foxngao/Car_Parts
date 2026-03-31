const partModel = require('../models/part.model');

// GET /api/v1/parts/search?keyword=...&model_year_id=...&category_id=...&min_price=...&max_price=...&brand_id=...&year=...&sort_by=...&sort_order=...&page=1&limit=10
const searchParts = async (req, res) => {
  try {
    const { parts, total, page, limit } = await partModel.searchParts(req.query);

    res.json({
      success: true,
      data: parts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Search parts error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// GET /api/v1/parts/suggestions?q=... - Gợi ý tìm kiếm realtime
const getSuggestions = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.trim().length < 1) {
      return res.json({ success: true, data: [] });
    }

    const keyword = q.trim();

    const suggestions = await partModel.findSuggestions(keyword);

    res.json({
      success: true,
      data: suggestions
    });
  } catch (error) {
    console.error('Get suggestions error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// GET /api/v1/parts/:id
const getPartById = async (req, res) => {
  try {
    const parts = await partModel.findPartById(req.params.id);

    if (parts.length === 0) {
      return res.status(404).json({ success: false, message: 'Part not found' });
    }

    const compatibility = await partModel.findCompatibleVehiclesByPartId(req.params.id);

    res.json({
      success: true,
      data: { ...parts[0], compatible_vehicles: compatibility }
    });
  } catch (error) {
    console.error('Get part error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// POST /api/v1/admin/parts
const createPart = async (req, res) => {
  const connection = await partModel.getConnection();
  try {
    const { category_id, name, description, price, stock_quantity, image_url, is_combo = false, combo_items = [] } = req.body;

    await connection.beginTransaction();

    const result = await partModel.createPart(connection, {
      category_id,
      name,
      description,
      price,
      stock_quantity,
      image_url,
      is_combo
    });

    const partId = result.insertId;

    if (is_combo && combo_items.length > 0) {
      await partModel.insertComboItems(connection, partId, combo_items);
    }

    await connection.commit();
    res.status(201).json({
      success: true,
      message: 'Part created',
      data: { id: partId, name, price, stock_quantity, is_combo }
    });
  } catch (error) {
    await connection.rollback();
    console.error('Create part error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  } finally {
    connection.release();
  }
};

// PUT /api/v1/admin/parts/:id
const updatePart = async (req, res) => {
  const connection = await partModel.getConnection();
  try {
    const { category_id, name, description, price, stock_quantity, image_url, is_combo = false, combo_items = [] } = req.body;
    const partId = req.params.id;

    await connection.beginTransaction();

    const result = await partModel.updatePartById(connection, partId, {
      category_id,
      name,
      description,
      price,
      stock_quantity,
      image_url,
      is_combo
    });

    if (result.affectedRows === 0) {
      await connection.rollback();
      return res.status(404).json({ success: false, message: 'Part not found' });
    }

    if (is_combo) {
      // Clear old combo items
      await partModel.deleteComboItemsByComboId(connection, partId);
      if (combo_items.length > 0) {
        await partModel.insertComboItems(connection, partId, combo_items);
      }
    } else {
      await partModel.deleteComboItemsByComboId(connection, partId);
    }

    await connection.commit();
    res.json({ success: true, message: 'Part updated' });
  } catch (error) {
    await connection.rollback();
    console.error('Update part error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  } finally {
    connection.release();
  }
};

// DELETE /api/v1/admin/parts/:id
const deletePart = async (req, res) => {
  try {
    const result = await partModel.deletePartById(req.params.id);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Part not found' });
    }
    res.json({ success: true, message: 'Part deleted' });
  } catch (error) {
    console.error('Delete part error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// POST /api/v1/admin/parts/:id/compatibility
const addCompatibility = async (req, res) => {
  try {
    const partId = req.params.id;
    const { model_year_ids } = req.body; // Array of model_year_id

    if (!Array.isArray(model_year_ids) || model_year_ids.length === 0) {
      return res.status(400).json({ success: false, message: 'model_year_ids must be a non-empty array' });
    }

    await partModel.addCompatibilityMappings(partId, model_year_ids);

    res.status(201).json({
      success: true,
      message: 'Compatibility added',
      data: { part_id: partId, model_year_ids }
    });
  } catch (error) {
    console.error('Add compatibility error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports = { searchParts, getSuggestions, getPartById, createPart, updatePart, deletePart, addCompatibility };
