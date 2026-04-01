import axiosClient from './axiosClient';

const orderApi = {
  // Tạo đơn hàng
  createOrder: (payload) => axiosClient.post('/orders', payload),
  
  // Lấy danh sách đơn hàng
  getOrders: () => axiosClient.get('/orders'),
  
  // Chi tiết đơn hàng
  getOrderById: (id) => axiosClient.get(`/orders/${id}`),
};

export default orderApi;
