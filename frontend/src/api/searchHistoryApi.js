import axiosClient from './axiosClient';

const searchHistoryApi = {
  // Lưu lịch sử tìm kiếm
  save: (data) => axiosClient.post('/search-history', data),
  
  // Lấy lịch sử tìm kiếm
  getHistory: (params = {}) => axiosClient.get('/search-history', { params }),
  
  // Xóa 1 mục
  deleteItem: (id) => axiosClient.delete(`/search-history/${id}`),
  
  // Xóa tất cả
  deleteAll: () => axiosClient.delete('/search-history/all'),
};

export default searchHistoryApi;
