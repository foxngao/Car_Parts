import axiosClient from './axiosClient';

const adminApi = {
  // ========== DASHBOARD & THỐNG KÊ ==========
  getDashboardStats: (params) => axiosClient.get('/admin/dashboard/stats', { params }),
  getDetailedStatistics: (params) => axiosClient.get('/admin/statistics/detailed', { params }),
  getRevenueStats: (params) => axiosClient.get('/admin/stats/revenue', { params }),
  
  // ========== QUẢN LÝ NGƯỜI DÙNG (USERS) ==========
  getUsers: () => axiosClient.get('/admin/users'),
  createUser: (data) => axiosClient.post('/admin/users', data),
  updateUser: (id, data) => axiosClient.put(`/admin/users/${id}`, data),
  deleteUser: (id) => axiosClient.delete(`/admin/users/${id}`),
  toggleUserStatus: (id, data) => axiosClient.put(`/admin/users/${id}/status`, data),
  
  // ========== QUẢN LÝ THƯƠNG HIỆU (BRANDS) ==========
  getBrands: () => axiosClient.get('/brands'), // Lấy từ route public hoặc admin tùy cấu hình của bạn
  createBrand: (data) => axiosClient.post('/admin/brands', data),
  updateBrand: (id, data) => axiosClient.put(`/admin/brands/${id}`, data),
  deleteBrand: (id) => axiosClient.delete(`/admin/brands/${id}`),
  
  // ========== QUẢN LÝ DÒNG XE (MODELS) ==========
  createModel: (data) => axiosClient.post('/admin/models', data),
  updateModel: (id, data) => axiosClient.put(`/admin/models/${id}`, data),
  deleteModel: (id) => axiosClient.delete(`/admin/models/${id}`),
  
  // ========== QUẢN LÝ NĂM SẢN XUẤT (YEARS) ==========
  createModelYear: (data) => axiosClient.post('/admin/model-years', data),
  deleteModelYear: (id) => axiosClient.delete(`/admin/model-years/${id}`),
  
  // ========== QUẢN LÝ DANH MỤC (CATEGORIES) ==========
  createCategory: (data) => axiosClient.post('/admin/categories', data),
  updateCategory: (id, data) => axiosClient.put(`/admin/categories/${id}`, data),
  deleteCategory: (id) => axiosClient.delete(`/admin/categories/${id}`),
  
  // ========== QUẢN LÝ PHỤ TÙNG & COMBO (PARTS) ==========
  createPart: (data) => axiosClient.post('/admin/parts', data),
  updatePart: (id, data) => axiosClient.put(`/admin/parts/${id}`, data),
  deletePart: (id) => axiosClient.delete(`/admin/parts/${id}`),
  addCompatibility: (id, data) => axiosClient.post(`/admin/parts/${id}/compatibility`, data),
  
  // ========== QUẢN LÝ ĐƠN HÀNG (ORDERS) ==========
  getOrders: () => axiosClient.get('/admin/orders'),
  updateOrderStatus: (id, data) => axiosClient.put(`/admin/orders/${id}/status`, data),

  // ========== QUẢN LÝ GARA (GARAGES) - MỚI ==========
  getGarages: () => axiosClient.get('/admin/garages'),
  createGarage: (data) => axiosClient.post('/admin/garages', data),
  updateGarage: (id, data) => axiosClient.put(`/admin/garages/${id}`, data),
  deleteGarage: (id) => axiosClient.delete(`/admin/garages/${id}`),
  
  // ========== QUẢN LÝ LỊCH HẸN (BOOKINGS) - MỚI ==========
  getBookings: () => axiosClient.get('/admin/bookings'),
  updateBookingStatus: (id, status) => axiosClient.patch(`/admin/bookings/${id}/status`, { status }),

  // ========== CÀI ĐẶT HỆ THỐNG (SETTINGS) ==========
  getSettings: () => axiosClient.get('/admin/settings'),
  updateSettings: (data) => axiosClient.put('/admin/settings', data),
};

export default adminApi;