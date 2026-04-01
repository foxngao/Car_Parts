const express = require('express');
const router = express.Router();
const { getAllGarages, createBooking, getMyBookings } = require('../controllers/booking.controller');
const { verifyToken } = require('../middlewares/auth');

router.get('/garages', getAllGarages);

router.post('/', verifyToken, createBooking);
router.get('/my-bookings', verifyToken, getMyBookings);

module.exports = router;
