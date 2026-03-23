import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Components
import Header from './components/Common/Header';
import Footer from './components/Common/Footer';

// Public pages
import Home from './pages/Home';
import SearchResults from './pages/SearchResults';
import ProductDetail from './pages/ProductDetail';
import CombosPage from './pages/CombosPage';
import About from './pages/About';
import Contact from './pages/Contact';
import Compare from './pages/Compare';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import BookingPage from './pages/BookingPage';
import MyBookings from './pages/MyBookings';

// Protected pages
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import OrderDetail from './pages/OrderDetail';
import Profile from './pages/Profile';
import SearchHistory from './pages/SearchHistory';
import FavoritesPage from './pages/FavoritesPage';
import Notifications from './pages/Notifications';

// Admin pages
import AdminLayout from './pages/Admin/AdminLayout';
import Dashboard from './pages/Admin/Dashboard';
import Users from './pages/Admin/Users';
import Products from './pages/Admin/Products';
import Combos from './pages/Admin/Combos';
import Brands from './pages/Admin/Brands';
import Models from './pages/Admin/Models';
import Categories from './pages/Admin/Categories';
import AdminOrders from './pages/Admin/Orders';
import Statistics from './pages/Admin/Statistics';
import Settings from './pages/Admin/Settings'; 
import ManageGarages from './pages/Admin/ManageGarages';
import ManageBookings from './pages/Admin/ManageBookings';

// Protected route wrapper
const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function AppContent() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow pt-20">
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<SearchResults />} />
          <Route path="/combos" element={<CombosPage />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/compare" element={<Compare />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* User Protected routes */}
          <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
          <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
          <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
          <Route path="/orders/:id" element={<ProtectedRoute><OrderDetail /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/search-history" element={<ProtectedRoute><SearchHistory /></ProtectedRoute>} />
          <Route path="/favorites" element={<ProtectedRoute><FavoritesPage /></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
          <Route path="/my-bookings" element={<ProtectedRoute><MyBookings /></ProtectedRoute>} />
          <Route path="/booking" element={<ProtectedRoute><BookingPage /></ProtectedRoute>} />

          {/* Admin routes - Fixed path nesting */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute requireAdmin={true}>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            {/* Note: Đường dẫn con không bắt đầu bằng dấu gạch chéo '/' */}
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="users" element={<Users />} />
            <Route path="products" element={<Products />} />
            <Route path="combos" element={<Combos />} />
            <Route path="brands" element={<Brands />} />
            <Route path="models" element={<Models />} />
            <Route path="categories" element={<Categories />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="statistics" element={<Statistics />} />
            <Route path="garages" element={<ManageGarages />} />
            <Route path="bookings" element={<ManageBookings />} />
            <Route path="settings" element={<Settings />} />
          </Route>

          {/* 404 Not Found */}
          <Route path="*" element={
            <div className="min-h-screen flex items-center justify-center">
              <div className="text-center">
                <h1 className="text-9xl font-black text-slate-200">404</h1>
                <div className="relative -mt-20">
                  <h2 className="text-2xl font-bold text-slate-900 mb-2">Không tìm thấy trang</h2>
                  <p className="text-slate-500 mb-8">Đường dẫn bạn truy cập không tồn tại hoặc đã bị dời đi.</p>
                  <Link to="/" className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-slate-900 transition-all shadow-lg shadow-blue-200">
                    VỀ TRANG CHỦ
                  </Link>
                </div>
              </div>
            </div>
          } />
        </Routes>
      </main>
      <Footer />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#fff',
            color: '#363636',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            borderRadius: '12px',
          },
        }}
      />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;