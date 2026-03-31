const vinModel = require('../src/models/vin.model');

// ==================== VIN DECODE HELPERS ====================

// Bảng decode năm sản xuất từ ký tự thứ 10 của VIN (chuẩn quốc tế)
const YEAR_CODES = {
  'A': 2010, 'B': 2011, 'C': 2012, 'D': 2013, 'E': 2014,
  'F': 2015, 'G': 2016, 'H': 2017, 'J': 2018, 'K': 2019,
  'L': 2020, 'M': 2021, 'N': 2022, 'P': 2023, 'R': 2024,
  'S': 2025, 'T': 2026, 'V': 2027, 'W': 2028, 'X': 2029,
  'Y': 2030, '1': 2031, '2': 2032, '3': 2033, '4': 2034,
  '5': 2035, '6': 2036, '7': 2037, '8': 2038, '9': 2039,
};

// Validate VIN format (17 ký tự, không chứa I, O, Q)
const isValidVin = (vin) => {
  if (!vin || vin.length !== 17) return false;
  return /^[A-HJ-NPR-Z0-9]{17}$/i.test(vin);
};

// ==================== CONTROLLERS ====================

// GET /api/v1/vin/decode/:vin - Giải mã VIN
const decodeVin = async (req, res) => {
  try {
    const vin = req.params.vin.toUpperCase().trim();

    if (!isValidVin(vin)) {
      return res.status(400).json({
        success: false,
        message: 'VIN không hợp lệ. VIN phải có đúng 17 ký tự (không chứa I, O, Q).'
      });
    }

    const wmi = vin.substring(0, 3);
    const wmiResults = await vinModel.findWmiMapping(wmi);

    if (wmiResults.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Không tìm thấy thông tin hãng xe cho mã WMI "${wmi}".`,
        data: { vin, wmi }
      });
    }

    const wmiData = wmiResults[0];
    const yearChar = vin.charAt(9);
    const year = YEAR_CODES[yearChar.toUpperCase()] || null;

    const models = await vinModel.findModelsByBrandId(wmiData.brand_id);

    let matchedModelYears = [];
    if (year) {
      matchedModelYears = await vinModel.findModelYearsByBrandIdAndYear(wmiData.brand_id, year);
    }

    res.json({
      success: true,
      data: {
        vin, wmi,
        brand: { id: wmiData.brand_id, name: wmiData.brand_name, country: wmiData.brand_country },
        year, year_char: yearChar,
        manufacturing_country: wmiData.country,
        available_models: models,
        matched_model_years: matchedModelYears,
        vds: vin.substring(3, 9),
        vis: vin.substring(9, 17)
      }
    });
  } catch (error) {
    console.error('Decode VIN error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// GET /api/v1/vin/search/:vin - Tìm phụ tùng theo VIN 17 ký tự
const searchByVin = async (req, res) => {
  try {
    const vin = req.params.vin.toUpperCase().trim();
    const { page = 1, limit = 12 } = req.query;
    const offset = (page - 1) * limit;

    if (!isValidVin(vin)) {
      return res.status(400).json({
        success: false,
        message: 'VIN không hợp lệ. VIN phải có đúng 17 ký tự (không chứa I, O, Q).'
      });
    }

    const wmi = vin.substring(0, 3);
    const yearChar = vin.charAt(9);
    const year = YEAR_CODES[yearChar.toUpperCase()] || null;

    // Tìm brand từ WMI
    const [wmiResults] = await db.query(
      `SELECT vwm.brand_id, b.name as brand_name
       FROM vin_wmi_mappings vwm
       JOIN brands b ON vwm.brand_id = b.id
       WHERE vwm.wmi_code = ?`,
      [wmi]
    );

    if (wmiResults.length === 0) {
      return res.json({
        success: true,
        data: {
          vin, decoded: null, parts: [],
          pagination: { page: 1, limit: parseInt(limit), total: 0, totalPages: 0 }
        },
        message: 'Không tìm thấy hãng xe cho VIN này'
      });
    }

    const brand = wmiResults[0];
    const total = await vinModel.countCompatiblePartsByBrandAndYear(brand.brand_id, year);
    const parts = await vinModel.findCompatiblePartsByBrandAndYear(
      brand.brand_id,
      year,
      parseInt(limit),
      parseInt(offset)
    );

    res.json({
      success: true,
      data: {
        vin,
        decoded: {
          brand: brand.brand_name,
          brand_id: brand.brand_id,
          year,
          wmi
        },
        parts,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Search by VIN error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports = { decodeVin, searchByVin };
