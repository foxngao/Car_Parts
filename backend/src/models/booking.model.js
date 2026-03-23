const db = require('../config/db');

const bookingModel = {
  getAllGarages: async () => {
    const [rows] = await db.query('SELECT * FROM garage_partners WHERE is_active = TRUE');
    return rows;
  },
  createBooking: async (data) => {
    const { userId, orderId, garageId, bookingDate, notes } = data;
    const [result] = await db.query(
      'INSERT INTO service_bookings (user_id, order_id, garage_id, booking_date, notes) VALUES (?, ?, ?, ?, ?)',
      [userId, orderId, garageId, bookingDate, notes]
    );
    return result;
  },
  getUserBookings: async (userId) => {
    const [rows] = await db.query(
      `SELECT sb.*, gp.name as garage_name, gp.address as garage_address 
       FROM service_bookings sb
       JOIN garage_partners gp ON sb.garage_id = gp.id
       WHERE sb.user_id = ? ORDER BY sb.created_at DESC`,
      [userId]
    );
    return rows;
  },
  createGarage: async (data) => {
    const { name, address, phone } = data;
    const [result] = await db.query(
      'INSERT INTO garage_partners (name, address, phone) VALUES (?, ?, ?)',
      [name, address, phone]
    );
    return result;
  },
  updateGarage: async (id, data) => {
    const { name, address, phone, is_active } = data;
    await db.query(
      'UPDATE garage_partners SET name=?, address=?, phone=?, is_active=? WHERE id=?',
      [name, address, phone, is_active, id]
    );
  },
  deleteGarage: async (id) => {
    await db.query('DELETE FROM garage_partners WHERE id = ?', [id]);
  },

  // Quản lý Lịch hẹn (Admin)
  getAllBookings: async () => {
    const [rows] = await db.query(
      `SELECT 
        sb.*, 
        gp.name as garage_name, 
        u.full_name as user_name, 
        u.id as user_id,
        u.phone as user_phone
       FROM service_bookings sb
       JOIN garage_partners gp ON sb.garage_id = gp.id
       JOIN users u ON sb.user_id = u.id
       ORDER BY sb.created_at DESC`
    );
    return rows;
  },
  updateBookingStatus: async (id, status) => {
    await db.query('UPDATE service_bookings SET status = ? WHERE id = ?', [status, id]);
  }
};

module.exports = bookingModel;