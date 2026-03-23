const bcrypt = require('bcryptjs');
const userModel = require('../models/user.model');

// GET /api/v1/user/profile - Lấy thông tin profile kèm role
const getProfile = async (req, res) => {
  try {
    console.log('Fetching profile for user ID:', req.user.id);
    
    // Query lấy thông tin user kèm role từ database
    const users = await userModel.findProfileById(req.user.id);

    if (users.length === 0) {
      console.log('User not found in database');
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const user = users[0];
    console.log('User data from DB:', user);
    
    // Xác định role - ưu tiên admin nếu có
    let role = 'user';
    if (user.roles) {
      const rolesList = user.roles.split(',');
      role = rolesList.includes('admin') ? 'admin' : rolesList[0] || 'user';
    }

    console.log('Determined role:', role);

    // Trả về thông tin kèm role
    res.json({ 
      success: true, 
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        full_name: user.full_name,
        phone: user.phone,
        address: user.address,
        created_at: user.created_at,
        is_active: user.is_active === 1 || user.is_active === true,
        role: role // QUAN TRỌNG: role từ database
      } 
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// PUT /api/v1/user/profile - Cập nhật profile
const updateProfile = async (req, res) => {
  try {
    const { full_name, phone, address } = req.body;

    await userModel.updateProfileById(req.user.id, { full_name, phone, address });

    res.json({ success: true, message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// PUT /api/v1/user/change-password - Đổi mật khẩu
const changePassword = async (req, res) => {
  try {
    const { current_password, new_password } = req.body;

    // Get current password hash
    const users = await userModel.findPasswordByUserId(req.user.id);
    
    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(current_password, users[0].password);

    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    }

    const hashedPassword = await bcrypt.hash(new_password, 10);
    await userModel.updatePasswordByUserId(req.user.id, hashedPassword);

    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports = { getProfile, updateProfile, changePassword };
