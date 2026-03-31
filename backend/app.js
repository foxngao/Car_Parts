require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const bookingRoutes = require('./src/routes/booking.routes');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

require('./src/config/db');

app.use('/api/v1/auth', require('./src/routes/auth.routes'));
app.use('/api/v1/user', require('./src/routes/user.routes'));
app.use('/api/v1/brands', require('./src/routes/brand.routes'));
app.use('/api/v1/models', require('./src/routes/model.routes'));
app.use('/api/v1/years', require('./src/routes/year.routes'));
app.use('/api/v1/categories', require('./src/routes/category.routes'));
app.use('/api/v1/parts', require('./src/routes/part.routes'));
app.use('/api/v1/cart', require('./src/routes/cart.routes'));
app.use('/api/v1/orders', require('./src/routes/order.routes'));
app.use('/api/v1/admin', require('./src/routes/admin.routes'));
app.use('/api/v1/notifications', require('./src/routes/notification.routes'));
app.use('/api/v1/vin', require('./src/routes/vin.routes'));
app.use('/api/v1/search', require('./src/routes/imageSearch.routes'));
app.use('/api/v1/search-history', require('./src/routes/searchHistory.routes'));
app.use('/api/v1/compare', require('./src/routes/compare.routes'));
app.use('/api/v1/favorites', require('./src/routes/favorite.routes'));
app.use('/api/v1/combos', require('./src/routes/combo.routes'));
app.use('/api/v1', require('./src/routes/review.routes'));
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
