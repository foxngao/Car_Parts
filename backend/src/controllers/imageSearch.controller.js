const db = require('../config/db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// ==================== MULTER CONFIG ====================

// Tạo thư mục uploads nếu chưa có
const uploadsDir = path.join(__dirname, '../../uploads');
try {
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
} catch (err) {
  console.warn('Warning: Could not create uploads directory:', err.message);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'search-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Chỉ chấp nhận file ảnh (JPEG, PNG, WebP, GIF)'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

// ==================== CONTROLLERS ====================

// POST /api/v1/search/image - Tìm kiếm bằng hình ảnh
const searchByImage = async (req, res) => {
  try {
    let { description = '', category_id } = req.body;
    const page = parseInt(req.body.page) || 1;
    const limit = parseInt(req.body.limit) || 12;
    const offset = (page - 1) * limit;

    // Kiểm tra có file upload hoặc description
    if (!req.file && !description.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng upload ảnh hoặc nhập mô tả phụ tùng cần tìm.'
      });
    }

    let imageUrl = null;
    let aiKeywords = '';

    if (req.file) {
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      imageUrl = `${baseUrl}/uploads/${req.file.filename}`;

      // Gọi Google Gemini API để nhận diện phụ tùng
      if (process.env.GEMINI_API_KEY) {
        try {
          const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
          const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

          const imageParts = [
            {
              inlineData: {
                data: Buffer.from(fs.readFileSync(req.file.path)).toString("base64"),
                mimeType: req.file.mimetype
              }
            }
          ];

          const prompt = `Bạn là một chuyên gia về phụ tùng ô tô. 
Nhiệm vụ: Nhận dạng phụ tùng ô tô trong ảnh và trả về một vài từ khóa tiếng Việt ngắn gọn, cách nhau bằng dấu phẩy mô tả loại phụ tùng hoặc thương hiệu trong ảnh.(ví dụ: lốp xe, đèn pha, gương chiếu hậu, mâm đúc, tay nắm cửa, Toyota, Michelin...).
Luôn trả về kết quả dưới dạng JSON (không dùng block \`\`\`json) theo đúng định dạng sau (chỉ bao gồm các từ khóa bạn nhận diện được):
{"keywords": "từ khóa 1, từ khóa 2"}`;

          const result = await model.generateContent([prompt, ...imageParts]);
          const responseText = await result.response.text();

          try {
            // Cố gắng parse JSON từ chuỗi kết quả
            const cleanJsonText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
            const aiData = JSON.parse(cleanJsonText);

            aiKeywords = aiData.keywords || '';
          } catch (parseError) {
            console.error('Failed to parse Gemini JSON output:', parseError);
            console.log('Raw output was:', responseText);
            // Fallback nếu không parse được JSON
            aiKeywords = responseText.trim().replace(/[.,\n]/g, ' ');
          }

          console.log('AI detected keywords:', aiKeywords);

          // Gộp từ khóa AI nhận diện được vào mô tả của user
          description = `${description} ${aiKeywords}`.trim();
        } catch (aiError) {
          console.error('Gemini AI Error:', aiError.message);
        }
      }
    }

    // Tìm kiếm dựa trên description (keyword matching) và original image name
    let searchConditions = [];
    let whereParams = [];
    let relevanceCases = [];
    let scoreParams = [];

    // 1. Image name matching (high priority)
    let originalNameBase = '';
    let nameKeywords = [];
    if (req.file && req.file.originalname) {
      originalNameBase = path.parse(req.file.originalname).name;
      // Tách tên file thành các từ khóa (loại bỏ số, dấu gạch ngang, gạch dưới)
      nameKeywords = originalNameBase.split(/[-_\s]+/).filter(k => k.length >= 3);

      console.log('Original image name:', originalNameBase);
      console.log('Image name keywords:', nameKeywords);

      if (nameKeywords.length > 0) {
        nameKeywords.forEach(kw => {
          searchConditions.push('(p.image_url LIKE ?)');
          whereParams.push(`%${kw}%`);

          relevanceCases.push('(CASE WHEN p.image_url LIKE ? THEN 50 ELSE 0 END)');
          scoreParams.push(`%${kw}%`);
        });
      } else if (originalNameBase.length >= 3) {
        searchConditions.push('(p.image_url LIKE ?)');
        whereParams.push(`%${originalNameBase}%`);

        relevanceCases.push('(CASE WHEN p.image_url LIKE ? THEN 100 ELSE 0 END)');
        scoreParams.push(`%${originalNameBase}%`);
      }
    }

    // 2. AI keywords matching
    // Giữ nguyên các cụm từ cách nhau bằng dấu phẩy thay vì split theo từng chữ
    if (description.trim()) {
      // Split by comma to keep phrases intact (e.g., "Động cơ", "hộp số")
      const phrases = description.split(',').map(p => p.trim()).filter(p => p.length >= 2);

      if (phrases.length > 0) {
        phrases.forEach(() => {
          searchConditions.push('(p.name LIKE ? OR p.description LIKE ?)');
        });

        phrases.forEach(phrase => {
          whereParams.push(`%${phrase}%`, `%${phrase}%`);

          // Increased relevance score for exact phrase match
          relevanceCases.push('(CASE WHEN p.name LIKE ? THEN 10 ELSE 0 END) + (CASE WHEN p.description LIKE ? THEN 3 ELSE 0 END)');
          scoreParams.push(`%${phrase}%`, `%${phrase}%`);
        });
      }

      // Khai thác thêm cách cắt chữ rời rạc để tăng độ phủ (nếu không tìm thấy phrase)
      const words = description.replace(/[.,;:]/g, ' ').split(/\s+/).filter(w => w.length >= 2);
      if (words.length > 0) {
        words.forEach(() => {
          searchConditions.push('(p.name LIKE ? OR p.description LIKE ?)');
        });

        words.forEach(word => {
          whereParams.push(`%${word}%`, `%${word}%`);

          // Lower relevance score for partial word match
          relevanceCases.push('(CASE WHEN p.name LIKE ? THEN 2 ELSE 0 END) + (CASE WHEN p.description LIKE ? THEN 1 ELSE 0 END)');
          scoreParams.push(`%${word}%`, `%${word}%`);
        });
      }
    }

    // Đã bỏ logic AI Exact Matched IDs

    // Nếu cả ảnh lẫn AI đều ko lấy được thông tin gì 
    if (searchConditions.length === 0) {
      return res.json({
        success: true,
        data: {
          uploaded_image: imageUrl,
          description: description.trim(),
          parts: [],
          pagination: { page, limit, total: 0, totalPages: 0 }
        }
      });
    }

    let finalWhere = [];
    let finalWhereParams = [];

    // Gom nhóm tất cả keyword/image name vào 1 khối OR
    finalWhere.push(`(${searchConditions.join(' OR ')})`);
    finalWhereParams.push(...whereParams);

    // Lọc theo danh mục bộ lọc (phải là AND)
    if (category_id) {
      finalWhere.push('p.category_id = ?');
      finalWhereParams.push(category_id);
    }

    const finalWhereClause = `WHERE ${finalWhere.join(' AND ')}`;

    // Tăng điểm chuẩn để lọc kết quả rác.
    // VD: cụm từ chính xác (10đ), từ đơn lẻ (2đ).
    // Nếu chỉ có kết quả từ đơn (score <= 5) -> có khả năng là kết quả rác (VD: chỉ chung chữ "Toyota").
    // Ta đặt threshold = 5 để loại bỏ các kết quả chỉ trùng 1-2 từ đơn lẻ vụn vặt.
    // Ngoại lệ: Nếu mảng parts chỉ có 2-3 phần tử, tìm bằng file name được 100/50 điểm -> OK
    const relevanceSelect = relevanceCases.length > 0
      ? `(${relevanceCases.join(' + ')}) as relevance_score`
      : '0 as relevance_score';

    // Count
    let countQuery = `SELECT COUNT(DISTINCT p.id) as total FROM parts p ${finalWhereClause}`;
    let countParams = [...finalWhereParams];

    // Lọc cực kỳ nghiêm ngặt: Phải đạt ít nhất 5 điểm (trùng 1 cụm từ chính xác, hoặc trùng rất nhiều từ đơn) mới được hiển thị
    const havingClause = relevanceCases.length > 0 ? `HAVING relevance_score >= 5` : '';

    if (havingClause) {
      // Để dùng HAVING với COUNT, ta phải bọc vào subquery
      countQuery = `
        SELECT COUNT(*) as total FROM (
          SELECT p.id, ${relevanceSelect}
          FROM parts p
          ${finalWhereClause}
          ${havingClause}
        ) as subquery
      `;
      // Score params need to be before finalWhereParams in the subquery
      countParams = [...scoreParams, ...finalWhereParams];
    }

    const [countResult] = await db.query(countQuery, countParams);
    const total = countResult[0].total;

    // Lấy parts
    console.log('Final Where Clause:', finalWhereClause);
    console.log('Final Where Params:', finalWhereParams);
    console.log('Relevance Select:', relevanceSelect);
    console.log('Score Params:', scoreParams);

    const [parts] = await db.query(
      `SELECT DISTINCT p.*, c.name as category_name, ${relevanceSelect}
       FROM parts p
       JOIN categories c ON p.category_id = c.id
       ${finalWhereClause}
       ${havingClause}
       ORDER BY relevance_score DESC, p.name ASC
       LIMIT ? OFFSET ?`,
      [...scoreParams, ...finalWhereParams, limit, offset]
    );

    console.log('Top parts returned:', parts.slice(0, 3).map(p => ({ id: p.id, name: p.name, score: p.relevance_score, image: p.image_url })));

    return res.json({
      success: true,
      data: {
        uploaded_image: imageUrl,
        description: description.trim(),
        parts,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
      }
    });
  } catch (error) {
    console.error('Image search error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports = { upload, searchByImage };
