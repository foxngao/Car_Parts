const db = require('../config/db');

const findUserIdByUsernameOrEmail = async (username, email) => {
  const [rows] = await db.query(
    'SELECT id FROM users WHERE username = ? OR email = ?',
    [username, email]
  );

  return rows;
};

const createUser = async ({ username, password, email }) => {
  const [result] = await db.query(
    'INSERT INTO users (username, password, email) VALUES (?, ?, ?)',
    [username, password, email]
  );

  return result;
};

const assignDefaultUserRole = async (userId) => {
  const [result] = await db.query(
    'INSERT INTO user_roles (user_id, role_id) VALUES (?, 2)',
    [userId]
  );

  return result;
};

const createOtpVerification = async (userId, otpCode, expiresAt) => {
  const [result] = await db.query(
    'INSERT INTO otp_verifications (user_id, otp_code, expires_at) VALUES (?, ?, ?)',
    [userId, otpCode, expiresAt]
  );

  return result;
};

const findUserIdByEmail = async (email) => {
  const [rows] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
  return rows;
};

const findValidOtpByUserId = async (userId, otpCode) => {
  const [rows] = await db.query(
    'SELECT id FROM otp_verifications WHERE user_id = ? AND otp_code = ? AND expires_at > NOW() ORDER BY created_at DESC LIMIT 1',
    [userId, otpCode]
  );

  return rows;
};

const activateUserById = async (userId) => {
  const [result] = await db.query('UPDATE users SET is_active = TRUE WHERE id = ?', [userId]);
  return result;
};

const deleteOtpsByUserId = async (userId) => {
  const [result] = await db.query('DELETE FROM otp_verifications WHERE user_id = ?', [userId]);
  return result;
};

const findLoginUserByUsername = async (username) => {
  const [rows] = await db.query(
    `SELECT u.id, u.username, u.password, u.email, u.full_name, u.is_active,
            GROUP_CONCAT(r.name) as roles
     FROM users u
     LEFT JOIN user_roles ur ON u.id = ur.user_id
     LEFT JOIN roles r ON ur.role_id = r.id
     WHERE u.username = ?
     GROUP BY u.id`,
    [username]
  );

  return rows;
};

module.exports = {
  findUserIdByUsernameOrEmail,
  createUser,
  assignDefaultUserRole,
  createOtpVerification,
  findUserIdByEmail,
  findValidOtpByUserId,
  activateUserById,
  deleteOtpsByUserId,
  findLoginUserByUsername
};
