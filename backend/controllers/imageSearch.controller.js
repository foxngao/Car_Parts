const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const imageSearchModel = require('../models/imageSearch.model');

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

    const queryData = imageSearchModel.buildImageSearchQueryData({
      description,
      category_id,
      file: req.file,
      protocol: req.protocol,
      host: req.get ? req.get('host') : undefined,
      page,
      limit
    });

    if (!queryData.countQuery || !queryData.searchQuery) {
      return res.json({
        success: true,
        data: {
          uploaded_image: queryData.imageUrl,
          description: queryData.description,
          parts: [],
          pagination: { page, limit, total: 0, totalPages: 0 }
        }
      });
    }

    const total = await imageSearchModel.countPartsByImageSearch(queryData.countQuery, queryData.countParams);
    const parts = await imageSearchModel.findPartsByImageSearch(queryData.searchQuery, queryData.searchParams);

    console.log('Top parts returned:', parts.slice(0, 3).map(p => ({ id: p.id, name: p.name, score: p.relevance_score, image: p.image_url })));

    return res.json({
      success: true,
      data: {
         uploaded_image: queryData.imageUrl,
         description: queryData.description,
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
