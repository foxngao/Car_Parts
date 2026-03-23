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
  PackageOpen
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    { path: '/admin/dashboard', icon: LayoutDashboard, label: 'Tổng quan', color: 'blue' },
    { path: '/admin/users', icon: Users, label: 'Quản lý người dùng', color: 'purple' },
    { path: '/admin/products', icon: Package, label: 'Quản lý sản phẩm', color: 'green' },
    { path: '/admin/combos', icon: PackageOpen, label: 'Quản lý Combo', color: 'blue' },
    { path: '/admin/brands', icon: Car, label: 'Quản lý hãng xe', color: 'orange' },
    { path: '/admin/categories', icon: Grid, label: 'Quản lý danh mục', color: 'pink' },
    { path: '/admin/orders', icon: ShoppingBag, label: 'Quản lý đơn hàng', color: 'red' },
    { path: '/admin/statistics', icon: BarChart3, label: 'Thống kê chi tiết', color: 'indigo' },
    { path: '/admin/settings', icon: Settings, label: 'Cài đặt', color: 'gray' },
  ];

  const getColorClasses = (color, isActive) => {
    const colors = {
      blue: isActive ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-blue-50 hover:text-blue-600',
      purple: isActive ? 'bg-purple-50 text-purple-600' : 'text-slate-600 hover:bg-purple-50 hover:text-purple-600',
      green: isActive ? 'bg-green-50 text-green-600' : 'text-slate-600 hover:bg-green-50 hover:text-green-600',
      orange: isActive ? 'bg-orange-50 text-orange-600' : 'text-slate-600 hover:bg-orange-50 hover:text-orange-600',
      pink: isActive ? 'bg-pink-50 text-pink-600' : 'text-slate-600 hover:bg-pink-50 hover:text-pink-600',
      red: isActive ? 'bg-red-50 text-red-600' : 'text-slate-600 hover:bg-red-50 hover:text-red-600',
      indigo: isActive ? 'bg-indigo-50 text-indigo-600' : 'text-slate-600 hover:bg-indigo-50 hover:text-indigo-600',
      gray: isActive ? 'bg-gray-50 text-gray-600' : 'text-slate-600 hover:bg-gray-50 hover:text-gray-600',
    };
    return colors[color] || colors.blue;
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-white border-b border-slate-200 z-30 px-4 h-16 flex items-center justify-between">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 hover:bg-slate-100 rounded-xl"
        >
          <Menu size={24} />
        </button>
        <h1 className="text-xl font-black text-slate-900">
          ADMIN<span className="text-blue-600">.</span>
        </h1>
        <div className="w-10"></div>
      </div>

      {/* Sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed top-0 left-0 bottom-0 w-72 bg-white border-r border-slate-200 z-50 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {/* Logo */}
        <div className="h-20 px-6 flex items-center border-b border-slate-200">
          <h1 className="text-2xl font-black text-slate-900">
            ADMIN<span className="text-blue-600">.</span>
          </h1>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden ml-auto p-2 hover:bg-slate-100 rounded-xl"
          >
            <X size={20} />
          </button>
        </div>

        {/* User info */}
        <div className="px-4 py-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-white font-bold text-lg">
              {user?.full_name?.charAt(0) || user?.username?.charAt(0) || 'A'}
            </div>
            <div className="flex-1">
              <p className="font-bold text-slate-800">{user?.full_name || user?.username}</p>
              <p className="text-xs text-slate-500">Quản trị viên</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="px-4 py-6 space-y-1 overflow-y-auto max-h-[calc(100vh-200px)]">
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
                  <div className={`w-1.5 h-1.5 rounded-full bg-${item.color}-600`} />
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
        <div className="pt-16 lg:pt-0">
          <div className="p-4 md:p-8 pt-20 lg:pt-8">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;