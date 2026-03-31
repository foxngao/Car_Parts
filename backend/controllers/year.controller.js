const yearModel = require('../src/models/year.model');

// GET /api/v1/years/:id/compatibility
const getCompatibleParts = async (req, res) => {
  try {
    const parts = await yearModel.findPartsByModelYearId(req.params.id);
    res.json({ success: true, data: parts });
  } catch (error) {
    console.error('Get compatible parts error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports = { getCompatibleParts };
