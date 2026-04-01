const bookingModel = require('../models/booking.model');

const getAllGarages = async (req, res) => {
  try {
    const garages = await bookingModel.getAllGarages();
    res.json(garages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createBooking = async (req, res) => {
  try {
    const result = await bookingModel.createBooking({
      userId: req.user.id,
      ...req.body
    });
    res.status(201).json({ message: 'Đặt lịch thành công', id: result.insertId });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMyBookings = async (req, res) => {
  try {
    const userId = req.user.id;
    const bookings = await bookingModel.getUserBookings(userId);
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllGarages,
  createBooking,
  getMyBookings
};
