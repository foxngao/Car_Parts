import React, { useState, useEffect } from 'react';
import adminApi from '../../api/adminApi';
import { formatCurrency } from '../../utils/formatters';
import {
  DollarSign,
  ShoppingBag,
  Users,
  Package,
  TrendingUp,
  TrendingDown,
  Calendar,
  Download,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock,
  Truck,
  Box,
  Eye,
  Wrench // Thêm icon cho dịch vụ lắp đặt
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('month');

  useEffect(() => {
    fetchDashboardStats();
  }, [period]);

  const fetchDashboardStats = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getDashboardStats({ period });
      const dashboardData = res.data.data;
      setStats(dashboardData);

      // --- CHỨC NĂNG: CẢNH BÁO TỒN KHO NÂNG CAO ---
      if (dashboardData.overview.out_of_stock > 0) {
        toast.error(`Cảnh báo: Có ${dashboardData.overview.out_of_stock} sản phẩm đã hết hàng!`, {
          icon: '⚠️',
          duration: 4000
        });
      } else if (dashboardData.overview.total_stock < 50) { // Ví dụ ngưỡng cảnh báo tổng kho thấp
        toast('Lượng hàng trong kho đang ở mức thấp', {
          icon: '📦',
        });
      }
      // ------------------------------------------

    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      toast.error('Không thể tải dữ liệu thống kê');
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#3b82f6', '#f97316', '#10b981', '#8b5cf6', '#ef4444', '#06b6d4'];

  const getStatusColor = (status) => {
    const colors = {
      'PENDING': 'bg-yellow-100 text-yellow-800',
      'PAID': 'bg-blue-100 text-blue-800',
      'SHIPPING': 'bg-purple-100 text-purple-800',
      'COMPLETED': 'bg-green-100 text-green-800',
      'CANCELLED': 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-slate-100 text-slate-800';
  };

  const getStatusText = (status) => {
    const texts = {
      'PENDING': 'Chờ xác nhận',
      'PAID': 'Đã thanh toán',
      'SHIPPING': 'Đang giao',
      'COMPLETED': 'Hoàn thành',
      'CANCELLED': 'Đã hủy',
    };
    return texts[status] || status;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-500">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const { overview, revenue_by_date, order_status, best_selling_products, recent_orders } = stats;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Tổng quan hệ thống</h1>
          <p className="text-slate-500 mt-1">Quản lý hoạt động kinh doanh và dịch vụ lắp đặt</p>
        </div>
        
        <div className="flex items-center gap-3">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="week">7 ngày qua</option>
            <option value="month">30 ngày qua</option>
            <option value="quarter">3 tháng qua</option>
            <option value="year">1 năm qua</option>
          </select>

          <button
            onClick={fetchDashboardStats}
            className="p-3 bg-white border border-gray-200 rounded-xl hover:bg-slate-50 transition-colors"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </button>

          <button className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors">
            <Download size={18} />
            Xuất báo cáo
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Doanh thu */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-2xl text-white shadow-lg shadow-blue-200">
          <div className="flex items-center justify-between mb-4">
            <DollarSign size={32} />
            <span className={`text-sm bg-white/20 px-3 py-1 rounded-full flex items-center gap-1 ${
              overview.revenue_change >= 0 ? 'text-green-300' : 'text-red-300'
            }`}>
              {overview.revenue_change >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              {Math.abs(overview.revenue_change)}%
            </span>
          </div>
          <p className="text-sm opacity-90 mb-1">Tổng doanh thu</p>
          <p className="text-3xl font-bold mb-1">{formatCurrency(overview.total_revenue)}</p>
          <p className="text-xs opacity-75">Kỳ này: {formatCurrency(overview.revenue_this_period)}</p>
        </div>

        {/* Đơn hàng */}
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-6 rounded-2xl text-white shadow-lg shadow-orange-200">
          <div className="flex items-center justify-between mb-4">
            <ShoppingBag size={32} />
            <span className="text-sm bg-white/20 px-3 py-1 rounded-full">
              {overview.total_orders} đơn
            </span>
          </div>
          <p className="text-sm opacity-90 mb-1">Đơn hàng mới</p>
          <p className="text-3xl font-bold mb-1">{overview.new_orders}</p>
          <p className="text-xs opacity-75">Cần xử lý: {order_status.find(s => s.status === 'PENDING')?.count || 0}</p>
        </div>

        {/* Người dùng */}
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-2xl text-white shadow-lg shadow-purple-200">
          <div className="flex items-center justify-between mb-4">
            <Users size={32} />
            <span className="text-sm bg-white/20 px-3 py-1 rounded-full">
              {overview.total_users} tổng
            </span>
          </div>
          <p className="text-sm opacity-90 mb-1">Người dùng mới</p>
          <p className="text-3xl font-bold mb-1">{overview.new_users}</p>
          <p className="text-xs opacity-75">Tăng trưởng so với kỳ trước</p>
        </div>

        {/* Sản phẩm/Kho hàng */}
        <div className={`bg-gradient-to-br p-6 rounded-2xl text-white shadow-lg ${
          overview.out_of_stock > 0 ? 'from-red-500 to-red-600 shadow-red-200' : 'from-green-500 to-green-600 shadow-green-200'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <Package size={32} />
            {overview.out_of_stock > 0 && (
              <span className="text-sm bg-white/30 px-3 py-1 rounded-full flex items-center gap-1">
                <AlertCircle size={14} /> {overview.out_of_stock} hết hàng
              </span>
            )}
          </div>
          <p className="text-sm opacity-90 mb-1">Tổng sản phẩm</p>
          <p className="text-3xl font-bold mb-1">{overview.total_products}</p>
          <p className="text-xs opacity-75">Số lượng trong kho: {overview.total_stock}</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <TrendingUp size={20} className="text-blue-600" />
              Biểu đồ doanh thu
            </h2>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenue_by_date}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(date) => new Date(date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}
                  stroke="#94a3b8"
                />
                <YAxis 
                  tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
                  stroke="#94a3b8"
                />
                <Tooltip 
                  formatter={(value) => formatCurrency(value)}
                  labelFormatter={(label) => new Date(label).toLocaleDateString('vi-VN')}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  fill="url(#revenueGradient)"
                  name="Doanh thu"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold mb-6">Trạng thái đơn hàng</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={order_status}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="count"
                  label={({ name, percent }) => `${getStatusText(name)}: ${(percent * 100).toFixed(0)}%`}
                >
                  {order_status.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value, name, props) => [value, getStatusText(props.payload.status)]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-3 gap-3 mt-6">
            {order_status.map((status, index) => (
              <div key={status.status} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                <span className="text-sm text-slate-600 truncate">
                  {getStatusText(status.status)}: {status.count}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold">Giao dịch mới nhất</h2>
            <Link to="/admin/orders" className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
              Xem tất cả <Eye size={14} />
            </Link>
          </div>
          <div className="space-y-4">
            {recent_orders && recent_orders.length > 0 ? (
              recent_orders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition-colors border border-transparent hover:border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                      <ShoppingBag size={18} className="text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">Đơn hàng #{order.id}</p>
                      <p className="text-xs text-slate-500">{order.full_name || order.username}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-slate-900">{formatCurrency(order.total_amount)}</p>
                    <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full ${getStatusColor(order.status)}`}>
                      {getStatusText(order.status)}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <ShoppingBag size={40} className="mx-auto text-slate-200 mb-2" />
                <p className="text-slate-500">Chưa có đơn hàng nào</p>
              </div>
            )}
          </div>
        </div>

        {/* Best Sellers */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold">Sản phẩm bán chạy</h2>
            <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-lg font-bold uppercase">Top 5</span>
          </div>
          <div className="space-y-4">
            {best_selling_products && best_selling_products.length > 0 ? (
              best_selling_products.slice(0, 5).map((product, index) => (
                <div key={product.id} className="flex items-center gap-4 p-3 hover:bg-slate-50 rounded-xl transition-colors">
                  <span className={`text-lg font-black w-8 ${index === 0 ? 'text-orange-500' : 'text-slate-300'}`}>
                    0{index + 1}
                  </span>
                  <img 
                    src={product.image_url || 'https://via.placeholder.com/50'} 
                    className="w-12 h-12 rounded-xl object-cover shadow-sm"
                    alt={product.name}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900 truncate">{product.name}</p>
                    <p className="text-xs text-slate-500">{product.category_name}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-blue-600">{product.total_sold}</p>
                    <p className="text-[10px] text-slate-400 uppercase font-bold">Đã bán</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Package size={40} className="mx-auto text-slate-200 mb-2" />
                <p className="text-slate-500">Dữ liệu đang được cập nhật</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 hover:shadow-md transition-shadow">
          <Box size={24} className="text-blue-500 mb-3" />
          <p className="text-2xl font-bold text-slate-900">{overview.total_products}</p>
          <p className="text-sm font-medium text-slate-500">Mã linh kiện</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-100 hover:shadow-md transition-shadow">
          <Package size={24} className="text-emerald-500 mb-3" />
          <p className="text-2xl font-bold text-slate-900">{overview.total_stock}</p>
          <p className="text-sm font-medium text-slate-500">Tổng tồn kho</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-100 hover:shadow-md transition-shadow">
          <AlertCircle size={24} className="text-rose-500 mb-3" />
          <p className="text-2xl font-bold text-slate-900">{overview.out_of_stock}</p>
          <p className="text-sm font-medium text-slate-500">Cần nhập hàng</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-100 hover:shadow-md transition-shadow">
          <Wrench size={24} className="text-amber-500 mb-3" />
          <p className="text-2xl font-bold text-slate-900">{overview.total_orders}</p>
          <p className="text-sm font-medium text-slate-500">Lượt dịch vụ</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;