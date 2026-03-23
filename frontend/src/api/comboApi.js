import axiosClient from './axiosClient';

export const comboApi = {
  getCombos: () => {
    return axiosClient.get('/combos');
  },
  getComboDetails: (id) => {
    return axiosClient.get(`/combos/${id}`);
  }
};
