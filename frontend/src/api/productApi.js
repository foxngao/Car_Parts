import axiosClient from './axiosClient';

const productApi = {
  // Tìm kiếm phụ tùng (nâng cao)
  search: (params) => axiosClient.get('/parts/search', { params }),

  // Chi tiết phụ tùng
  getById: (id) => axiosClient.get(`/parts/${id}`),

  // Gợi ý tìm kiếm realtime
  getSuggestions: (q) => axiosClient.get('/parts/suggestions', { params: { q } }),

  // Danh sách hãng xe
  getBrands: () => axiosClient.get('/brands'),

  // Danh sách dòng xe theo hãng
  getModels: (brandId) => axiosClient.get(`/brands/${brandId}/models`),

  // Danh sách năm theo dòng xe
  getYears: (modelId) => axiosClient.get(`/models/${modelId}/years`),

  // Phụ tùng tương thích với năm xe
  getCompatibleParts: (yearId) => axiosClient.get(`/years/${yearId}/compatibility`),

  // Danh sách danh mục
  getCategories: () => axiosClient.get('/categories'),

  // ==================== VIN ====================
  // Giải mã VIN
  decodeVin: (vin) => axiosClient.get(`/vin/decode/${vin}`),

  // Tìm phụ tùng theo VIN
  searchByVin: (vin, params = {}) => axiosClient.get(`/vin/search/${vin}`, { params }),

  // ==================== Image Search ====================
  // Tìm kiếm bằng hình ảnh
  searchByImage: (formData) => axiosClient.post('/search/image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
};

export default productApi;