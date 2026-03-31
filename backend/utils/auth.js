const jwt = require('jsonwebtoken');
const db = require('../config/db');

const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    console.log('🔐 Verifying token...');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ No token provided');
      return res.status(401).json({ success: false, message: 'Access token required' });
    }

    const token = authHeader.split(' ')[1];
    console.log('Token received (first 20 chars):', token.substring(0, 20) + '...');

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('✅ Token verified. Decoded:', decoded);
    } catch (jwtError) {
      if (jwtError.name === 'TokenExpiredError') {
        console.log('❌ Token expired');
        return res.status(401).json({ success: false, message: 'Token expired' });
      }
      if (jwtError.name === 'JsonWebTokenError') {
        console.log('❌ Invalid token signature');
        return res.status(401).json({ success: false, message: 'Invalid token' });
      }
      throw jwtError;
    }

    const [users] = await db.query(
      `SELECT u.id, u.username, u.email, u.full_name, u.is_active,
              GROUP_CONCAT(r.name) as roles
       FROM users u
       LEFT JOIN user_roles ur ON u.id = ur.user_id
       LEFT JOIN roles r ON ur.role_id = r.id
       WHERE u.id = ?
       GROUP BY u.id`,
      [decoded.userId]
    );

    if (users.length === 0) {
      console.log('❌ User not found in database');
      return res.status(401).json({ success: false, message: 'User not found' });
    }

    const user = users[0];

    let role = 'user';
    if (user.roles) {
      const rolesList = user.roles.split(',');
      role = rolesList.includes('admin') ? 'admin' : rolesList[0] || 'user';
    }

    console.log('User found from DB:', {
      id: user.id,
      username: user.username,
      role: role,
      roles: user.roles,
      is_active: user.is_active
    });

    if (!user.is_active) {
      console.log('❌ Account is locked');
      return res.status(403).json({ success: false, message: 'Account is locked' });
    }

    req.user = {
      id: user.id,
      username: user.username,
      email: user.email,
      full_name: user.full_name,
      role: role,
      is_active: user.is_active === 1 || user.is_active === true
    };

    console.log('✅ Token verification successful. Final user:', req.user);
    next();
  } catch (error) {
    console.error('❌ Token verification error:', error);
    return res.status(401).json({ success: false, message: 'Authentication failed' });
  }
};

const isAdmin = (req, res, next) => {
  console.log('🔐 Checking admin role...');
  console.log('User from request:', req.user);

  if (!req.user) {
    console.log('❌ No user in request');
    return res.status(401).json({ success: false, message: 'Authentication required' });
  }

  if (req.user.role !== 'admin') {
    console.log('❌ Admin access denied. User role:', req.user.role);
    return res.status(403).json({ success: false, message: 'Admin access required' });
  }

  console.log('✅ Admin access granted');
  next();
};

module.exports = { verifyToken, isAdmin };
