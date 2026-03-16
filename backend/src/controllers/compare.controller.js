const db = require('../config/db');

// GET /api/v1/compare?ids=1,2,3
const getCompareData = async (req, res) => {
  try {
    const { ids } = req.query;

    if (!ids) {
      return res.status(400).json({ success: false, message: 'ids parameter is required (e.g., ?ids=1,2,3)' });
    }

    const partIds = ids.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));

    if (partIds.length < 2) {
      return res.status(400).json({ success: false, message: 'At least 2 product IDs are required for comparison' });
    }
    if (partIds.length > 4) {
      return res.status(400).json({ success: false, message: 'Maximum 4 products can be compared at once' });
    }

    const placeholders = partIds.map(() => '?').join(',');

    // 1. Lấy thông tin cơ bản sản phẩm
    const [parts] = await db.query(
      `SELECT p.*, c.name as category_name
       FROM parts p
       JOIN categories c ON p.category_id = c.id
       WHERE p.id IN (${placeholders})`,
      partIds
    );

    if (parts.length === 0) {
      return res.status(404).json({ success: false, message: 'No products found' });
    }

    // 2. Lấy thông số kỹ thuật
    const [specs] = await db.query(
      `SELECT part_id, spec_name, spec_value, spec_unit
       FROM part_specifications
       WHERE part_id IN (${placeholders})
       ORDER BY spec_name`,
      partIds
    );

    // 3. Lấy đánh giá trung bình + chi tiết
    const [avgRatings] = await db.query(
      `SELECT part_id,
              COUNT(*) as review_count,
              ROUND(AVG(rating), 1) as avg_rating,
              SUM(CASE WHEN rating = 5 THEN 1 ELSE 0 END) as star_5,
              SUM(CASE WHEN rating = 4 THEN 1 ELSE 0 END) as star_4,
              SUM(CASE WHEN rating = 3 THEN 1 ELSE 0 END) as star_3,
              SUM(CASE WHEN rating = 2 THEN 1 ELSE 0 END) as star_2,
              SUM(CASE WHEN rating = 1 THEN 1 ELSE 0 END) as star_1
       FROM part_reviews
       WHERE part_id IN (${placeholders})
       GROUP BY part_id`,
      partIds
    );

    const [reviews] = await db.query(
      `SELECT pr.*, u.username, u.full_name
       FROM part_reviews pr
       JOIN users u ON pr.user_id = u.id
       WHERE pr.part_id IN (${placeholders})
       ORDER BY pr.created_at DESC`,
      partIds
    );

    // 4. Lấy xe tương thích
    const [compatibility] = await db.query(
      `SELECT pc.part_id, my.id as model_year_id, my.year, 
              cm.name as model_name, b.name as brand_name
       FROM part_compatibility pc
       JOIN model_years my ON pc.model_year_id = my.id
       JOIN car_models cm ON my.model_id = cm.id
       JOIN brands b ON cm.brand_id = b.id
       WHERE pc.part_id IN (${placeholders})
       ORDER BY b.name, cm.name, my.year`,
      partIds
    );

    // Nhóm dữ liệu theo part_id
    const result = parts.map(part => {
      const partSpecs = specs.filter(s => s.part_id === part.id);
      const partRating = avgRatings.find(r => r.part_id === part.id) || {
        review_count: 0, avg_rating: 0,
        star_5: 0, star_4: 0, star_3: 0, star_2: 0, star_1: 0
      };
      const partReviews = reviews.filter(r => r.part_id === part.id);
      const partCompatibility = compatibility.filter(c => c.part_id === part.id);

      return {
        ...part,
        specifications: partSpecs,
        rating_summary: partRating,
        reviews: partReviews,
        compatible_vehicles: partCompatibility
      };
    });

    // Lấy tất cả spec names duy nhất để tạo bảng so sánh
    const allSpecNames = [...new Set(specs.map(s => s.spec_name))].sort();

    // Lấy tất cả xe duy nhất
    const allVehicles = [...new Map(
      compatibility.map(c => [
        `${c.brand_name}-${c.model_name}-${c.year}`,
        { brand_name: c.brand_name, model_name: c.model_name, year: c.year }
      ])
    ).values()].sort((a, b) => 
      a.brand_name.localeCompare(b.brand_name) || 
      a.model_name.localeCompare(b.model_name) || 
      a.year - b.year
    );

    res.json({
      success: true,
      data: {
        parts: result,
        all_spec_names: allSpecNames,
        all_vehicles: allVehicles
      }
    });
  } catch (error) {
    console.error('Compare error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports = { getCompareData };
