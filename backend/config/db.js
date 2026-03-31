const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'car_parts_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    charset: 'utf8mb4'
});

const testConnection = async () => {
    try {
        const connection = await pool.getConnection();
        console.log('✅ Kết nối cơ sở dữ liệu thành công!');
        await connection.query("SET NAMES utf8mb4");
        connection.release();
    } catch (err) {
        console.error('❌ Lỗi kết nối cơ sở dữ liệu:', err.message);
    }
};

testConnection();

module.exports = pool;
