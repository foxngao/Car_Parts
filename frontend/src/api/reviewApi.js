import axiosClient from './axiosClient';

const reviewApi = {
  // Lấy đánh giá theo sản phẩm
  getReviews: (partId) => axiosClient.get(`/parts/${partId}/reviews`),

  // Tạo đánh giá mới
  createReview: (partId, data) => axiosClient.post(`/parts/${partId}/reviews`, data),

  // Cập nhật đánh giá
  updateReview: (id, data) => axiosClient.put(`/reviews/${id}`, data),

  // Xóa đánh giá
  deleteReview: (id) => axiosClient.delete(`/reviews/${id}`),
};

export default reviewApi;
