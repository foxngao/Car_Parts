import axiosClient from './axiosClient';

const compareApi = {
  // So sánh sản phẩm - GET /compare?ids=1,2,3
  getCompareData: (ids) => axiosClient.get('/compare', { params: { ids: ids.join(',') } }),
};

export default compareApi;
