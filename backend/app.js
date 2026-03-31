require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const bookingRoutes = require('./routes/booking.routes');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

require('./config/db');

app.use('/api/v1/auth', require('./routes/auth.routes'));
app.use('/api/v1/user', require('./routes/user.routes'));
app.use('/api/v1/brands', require('./routes/brand.routes'));
app.use('/api/v1/models', require('./routes/model.routes'));
app.use('/api/v1/years', require('./routes/year.routes'));
app.use('/api/v1/categories', require('./routes/category.routes'));
app.use('/api/v1/parts', require('./routes/part.routes'));
app.use('/api/v1/cart', require('./routes/cart.routes'));
app.use('/api/v1/orders', require('./routes/order.routes'));
app.use('/api/v1/admin', require('./routes/admin.routes'));
app.use('/api/v1/notifications', require('./routes/notification.routes'));
app.use('/api/v1/vin', require('./routes/vin.routes'));
app.use('/api/v1/search', require('./routes/imageSearch.routes'));
app.use('/api/v1/search-history', require('./routes/searchHistory.routes'));
app.use('/api/v1/compare', require('./routes/compare.routes'));
app.use('/api/v1/favorites', require('./routes/favorite.routes'));
app.use('/api/v1/combos', require('./routes/combo.routes'));
app.use('/api/v1', require('./routes/review.routes'));
app.use('/api/v1/bookings', bookingRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Car Parts API is running 🚗' });
});

app.use((err, req, res, next) => {
  console.error('❌ Error:', err.message);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

module.exports = app;
