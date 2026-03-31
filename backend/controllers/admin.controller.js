const bcrypt = require('bcryptjs');
const adminModel = require('../src/models/admin.model');

// ==================== DASHBOARD STATISTICS ====================

// GET /api/v1/admin/dashboard/stats - Lấy tất cả thống kê cho dashboard
const getDashboardStats = async (req, res) => {
  try {
    const { period = 'month' } = req.query;
    
    // Tính khoảng thời gian
    const endDate = new Date();
    const startDate = new Date();
    
    switch(period) {
      case 'week':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case 'quarter':
        startDate.setMonth(startDate.getMonth() - 3);
        break;
      case 'year':
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      default:
        startDate.setMonth(startDate.getMonth() - 1);
    }
    
    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];
    
    // 1. Thống kê tổng quan
    const overview = await adminModel.getDashboardOverview(startDateStr);

    // 2. Doanh thu theo ngày
    const revenueByDate = await adminModel.getDashboardRevenueByDate(startDateStr);

    // 3. Phân bố trạng thái đơn hàng
    const orderStatus = await adminModel.getDashboardOrderStatus();

    // 4. Sản phẩm bán chạy
    const bestSelling = await adminModel.getDashboardBestSelling();

    // 5. Thống kê người dùng mới theo ngày
    const newUsersByDate = await adminModel.getDashboardNewUsersByDate(startDateStr);

    // 6. Thống kê theo danh mục
    const categoryStats = await adminModel.getDashboardCategoryStats();

    // 7. Đơn hàng gần đây
    const recentOrders = await adminModel.getDashboardRecentOrders();

    // Tính phần trăm thay đổi
    const currentRevenue = parseFloat(overview[0].revenue_this_period) || 0;
    const previousRevenue = parseFloat(overview[0].revenue_previous_period) || 0;
    const revenueChange = previousRevenue > 0 
      ? ((currentRevenue - previousRevenue) / previousRevenue * 100).toFixed(1)
      : currentRevenue > 0 ? 100 : 0;

    res.json({
      success: true,
      data: {
        overview: {
          total_users: overview[0].total_users,
          new_users: overview[0].new_users,
          total_orders: overview[0].total_orders,
          new_orders: overview[0].new_orders,
          total_products: overview[0].total_products,
          total_stock: overview[0].total_stock,
          out_of_stock: overview[0].out_of_stock,
          total_revenue: overview[0].total_revenue,
          revenue_this_period: currentRevenue,
          revenue_change: revenueChange
        },
        revenue_by_date: revenueByDate,
        order_status: orderStatus,
        best_selling_products: bestSelling,
        new_users_by_date: newUsersByDate,
        category_stats: categoryStats,
        recent_orders: recentOrders
      }
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// ==================== DETAILED STATISTICS ====================

// GET /api/v1/admin/statistics/detailed - Lấy thống kê chi tiết
const getDetailedStatistics = async (req, res) => {
  try {
    const { start_date, end_date, group_by = 'day' } = req.query;

    // Mặc định lấy 30 ngày gần nhất nếu không có ngày
    const end = end_date ? new Date(end_date) : new Date();
    const start = start_date ? new Date(start_date) : new Date();
    if (!start_date) {
      start.setDate(start.getDate() - 30);
    }

    const startStr = start.toISOString().split('T')[0];
    const endStr = end.toISOString().split('T')[0];

    // 1. Tổng quan doanh thu
    const revenueSummary = await adminModel.getDetailedRevenueSummary(startStr, endStr);

    // 2. Doanh thu theo ngày/tuần/tháng
    let groupByClause = '';
    switch(group_by) {
      case 'day':
        groupByClause = 'DATE(order_date)';
        break;
      case 'week':
        groupByClause = 'YEARWEEK(order_date)';
        break;
      case 'month':
        groupByClause = 'DATE_FORMAT(order_date, "%Y-%m")';
        break;
      default:
        groupByClause = 'DATE(order_date)';
    }

    const revenueByTime = await adminModel.getDetailedRevenueByTime(groupByClause, startStr, endStr);

    // 3. Thống kê theo sản phẩm
    const productStats = await adminModel.getDetailedProductStats(startStr, endStr);

    // 4. Thống kê theo danh mục
    const categoryStats = await adminModel.getDetailedCategoryStats(startStr, endStr);

    // 5. Thống kê theo khách hàng
    const customerStats = await adminModel.getDetailedCustomerStats(startStr, endStr);

    // 6. Thống kê theo thời gian trong ngày
    const hourlyStats = await adminModel.getDetailedHourlyStats(startStr, endStr);

    // 7. Thống kê theo ngày trong tuần
    const weekdayStats = await adminModel.getDetailedWeekdayStats(startStr, endStr);

    // 8. Top sản phẩm bán chạy nhất
    const topProducts = await adminModel.getDetailedTopProducts(startStr, endStr);

    // 9. Khách hàng mới trong kỳ
    const newCustomers = await adminModel.getDetailedNewCustomers(startStr, endStr);

    // 10. Tỷ lệ chuyển đổi (số người đặt hàng / tổng số người)
    const conversionRate = await adminModel.getDetailedConversionRate(startStr, endStr);

    res.json({
      success: true,
      data: {
        period: {
          start_date: startStr,
          end_date: endStr,
          group_by
        },
        summary: {
          total_orders: revenueSummary[0].total_orders,
          total_revenue: revenueSummary[0].total_revenue,
          avg_order_value: revenueSummary[0].avg_order_value,
          max_order: revenueSummary[0].max_order,
          min_order: revenueSummary[0].min_order
        },
        revenue_by_time: revenueByTime,
        product_stats: productStats,
        category_stats: categoryStats,
        customer_stats: customerStats,
        hourly_stats: hourlyStats,
        weekday_stats: weekdayStats,
        top_products: topProducts,
        new_customers: newCustomers,
        conversion_rate: {
          buyers: conversionRate[0].buyers || 0,
          total_users: conversionRate[0].total_users || 0,
          rate: conversionRate[0].total_users > 0 
            ? ((conversionRate[0].buyers || 0) / conversionRate[0].total_users * 100).toFixed(2)
            : 0
        }
      }
    });
  } catch (error) {
    console.error('Get detailed statistics error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// ==================== USER MANAGEMENT ====================

// GET /api/v1/admin/users - Lấy danh sách users
const getAllUsers = async (req, res) => {
  try {
    const users = await adminModel.findAllUsers();
    
    // Xử lý role cho mỗi user
    const formattedUsers = users.map(user => {
      let role = 'user';
      if (user.roles) {
        const rolesList = user.roles.split(',');
        role = rolesList.includes('admin') ? 'admin' : rolesList[0] || 'user';
      }
      return {
        id: user.id,
        username: user.username,
        email: user.email,
        full_name: user.full_name,
        phone: user.phone,
        address: user.address,
        is_active: user.is_active === 1 || user.is_active === true,
        created_at: user.created_at,
        role: role
      };
    });
    
    res.json({ success: true, data: formattedUsers });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// POST /api/v1/admin/users - Thêm user mới
const createUser = async (req, res) => {
  try {
    const { username, email, password, full_name, phone, address, role } = req.body;
    
    // Kiểm tra username/email đã tồn tại chưa
    const existing = await adminModel.findExistingUserByUsernameOrEmail(username, email);
    
    if (existing.length > 0) {
      return res.status(409).json({ 
        success: false, 
        message: 'Tên đăng nhập hoặc email đã tồn tại' 
      });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Thêm user
    const result = await adminModel.createUser({
      username,
      password: hashedPassword,
      email,
      full_name,
      phone,
      address
    });
    
    const userId = result.insertId;
    
    // Thêm role
    const roleId = role === 'admin' ? 1 : 2;
    await adminModel.assignUserRole(userId, roleId);
    
    res.status(201).json({
      success: true,
      message: 'Thêm người dùng thành công',
      data: { id: userId, username, email, role }
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// PUT /api/v1/admin/users/:id - Cập nhật user
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { full_name, phone, address, role, is_active } = req.body;
    
    // Cập nhật thông tin user
    await adminModel.updateUserById(id, { full_name, phone, address, is_active });
    
    // Cập nhật role nếu có
    if (role) {
      // Xóa role cũ
      await adminModel.deleteUserRolesByUserId(id);
      
      // Thêm role mới
      const roleId = role === 'admin' ? 1 : 2;
      await adminModel.assignUserRole(id, roleId);
    }
    
    res.json({ success: true, message: 'Cập nhật người dùng thành công' });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// DELETE /api/v1/admin/users/:id - Xóa user
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Kiểm tra user có đơn hàng không?
    const orders = await adminModel.findOrdersByUserId(id);
    
    if (orders.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Không thể xóa người dùng đã có đơn hàng' 
      });
    }
    
    // Xóa user (các bảng liên quan sẽ tự động xóa nhờ ON DELETE CASCADE)
    await adminModel.deleteUserById(id);
    
    res.json({ success: true, message: 'Xóa người dùng thành công' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// PUT /api/v1/admin/users/:id/status - Khóa/Mở khóa user
const toggleUserStatus = async (req, res) => {
  try {
    const { is_active } = req.body;
    const result = await adminModel.updateUserStatusById(req.params.id, is_active);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({
      success: true,
      message: is_active ? 'Đã mở khóa tài khoản' : 'Đã khóa tài khoản'
    });
  } catch (error) {
    console.error('Toggle user status error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// GET /api/v1/admin/stats/revenue?start_date=...&end_date=...
const getRevenueStats = async (req, res) => {
  try {
    const { start_date, end_date } = req.query;

    let dateFilter = '';
    let params = [];

    if (start_date && end_date) {
      dateFilter = 'AND o.order_date BETWEEN ? AND ?';
      params = [start_date, end_date];
    }

    // Total revenue
    const totalRevenue = await adminModel.getRevenueSummary(dateFilter, params);

    // Revenue by date
    const revenueByDate = await adminModel.getRevenueByDate(dateFilter, params);

    // Best-selling parts
    const bestSelling = await adminModel.getRevenueBestSellingParts(dateFilter, params);

    // Order status breakdown
    const statusBreakdown = await adminModel.getRevenueStatusBreakdown(dateFilter, params);

    res.json({
      success: true,
      data: {
        summary: totalRevenue[0],
        revenue_by_date: revenueByDate,
        best_selling_parts: bestSelling,
        order_status_breakdown: statusBreakdown
      }
    });
  } catch (error) {
    console.error('Get revenue stats error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports = { 
  getDashboardStats,
  getDetailedStatistics,
  getAllUsers, 
  createUser,
  updateUser,
  deleteUser,
  toggleUserStatus, 
  getRevenueStats 
};
