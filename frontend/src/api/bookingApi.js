import axiosClient from './axiosClient';

const bookingApi = {
  getGarages: () => axiosClient.get('/bookings/garages'), 
  createBooking: (data) => axiosClient.post('/bookings', data),
  getMyBookings: () => axiosClient.get('/bookings/my-bookings'),
};

export default bookingApi;