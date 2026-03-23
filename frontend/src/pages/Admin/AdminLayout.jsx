import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Package,
  Car,
  Grid,
  ShoppingBag,
  Settings,
  BarChart3,
  LogOut,
  Menu,
  X,
  PackageOpen,
  MapPin,    // Icon cho Quản lý Gara
  Calendar,  // Icon cho Quản lý Lịch hẹn
  Wrench     // Icon thay thế nếu muốn dùng cho kỹ thuật
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    { path: '/admin/dashboard', icon: LayoutDashboard, label: 'Tổng quan', color: 'blue' },
    { path: '/admin/users', icon: Users, label: 'Quản lý người dùng', color: 'purple' },
    { path: '/admin/products', icon: Package, label: 'Quản lý sản phẩm', color: 'green' },
    { path: '/admin/combos', icon: PackageOpen, label: 'Quản lý Combo', color: 'indigo' },
    { path: '/admin/brands', icon: Car, label: 'Quản lý hãng xe', color: 'orange' },
    { path: '/admin/categories', icon: Grid, label: 'Quản lý danh mục', color: 'pink' },
    { path: '/admin/orders', icon: ShoppingBag, label: 'Quản lý đơn hàng', color: 'cyan' },
    { path: '/admin/garages', icon: MapPin, label: 'Quản lý Gara', color: 'rose' }, // MỤC MỚI
    { path: '/admin/bookings', icon: Calendar, label: 'Quản lý lịch hẹn', color: 'amber' }, // MỤC MỚI
    { path: '/admin/statistics', icon: BarChart3, label: 'Báo cáo thống kê', color: 'blue' },
    { path: '/admin/settings', icon: Settings, label: 'Cài đặt hệ thống', color: 'slate' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
    toast.success('Đã đăng xuất khỏi hệ thống quản trị');
  };

  const getColorClasses = (color, isActive) => {
    if (isActive) {
      const activeColors = {
        blue: 'bg-blue-50 text-blue-600',
        purple: 'bg-purple-50 text-purple-600',
        green: 'bg-green-50 text-green-600',
        orange: 'bg-orange-50 text-orange-600',
        pink: 'bg-pink-50 text-pink-600',
        cyan: 'bg-cyan-50 text-cyan-600',
        indigo: 'bg-indigo-50 text-indigo-600',
        rose: 'bg-rose-50 text-rose-600',
        amber: 'bg-amber-50 text-amber-600',
        slate: 'bg-slate-50 text-slate-600',
      };
      return activeColors[color] || 'bg-blue-50 text-blue-600';
    }
    return 'text-slate-500 hover:bg-slate-50 hover:text-slate-700';
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 w-72 bg-white border-r border-slate-200 z-50 transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-20 flex items-center px-6 border-b border-slate-100">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center group-hover:bg-blue-600 transition-colors">
              <Settings className="text-white" size={24} />
            </div>
            <span className="text-2xl font-black text-slate-900 tracking-tighter">
              AUTO<span className="text-blue-600">ADMIN</span>
            </span>
          </Link>
          <button 
            className="ml-auto p-2 text-slate-400 hover:text-slate-600 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        <nav className="p-4 space-y-1 overflow-y-auto h-[calc(100vh-160px)]">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${getColorClasses(item.color, isActive)} ${isActive ? 'font-bold shadow-sm' : ''}`}
              >
                <Icon size={20} />
                <span className="flex-1">{item.label}</span>
                {isActive && (
                  <div className={`w-1.5 h-1.5 rounded-full bg-${item.color === 'indigo' ? 'indigo' : item.color === 'rose' ? 'rose' : item.color === 'amber' ? 'amber' : item.color}-600`} />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Logout button */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-200 bg-white">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full text-red-600 hover:bg-red-50 rounded-xl transition-colors"
          >
            <LogOut size={20} />
            <span className="font-medium">Đăng xuất</span>
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-72">
        {/* Header */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-30 px-6 flex items-center justify-between">
          <button 
            className="p-2 text-slate-600 hover:bg-slate-100 rounded-xl lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={24} />
          </button>

          <div className="flex items-center gap-4 ml-auto">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-slate-900">{user?.full_name || user?.username}</p>
              <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Quản trị viên hệ thống</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg shadow-blue-100">
              {user?.username?.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;