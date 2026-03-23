import axiosClient from './axiosClient';

export const favoriteApi = {
  getFavorites: () => {
    return axiosClient.get('/favorites');
  },
  toggleFavorite: (partId) => {
    return axiosClient.post('/favorites/toggle', { partId });
  },
  checkFavorite: (partId) => {
    return axiosClient.get(`/favorites/check/${partId}`);
  }
};
