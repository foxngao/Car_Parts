import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ProductCard from '../components/common/ProductCard';
import VehicleFilter from '../components/filters/VehicleFilter';
import VinSearch from '../components/Filters/VinSearch';
import productApi from '../api/productApi';
import { ChevronRight, Shield, Truck, RefreshCw, Award, Car, Hash } from 'lucide-react';

const Home = () => {
  const [featuredParts, setFeaturedParts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTab, setSearchTab] = useState('vehicle');
  const navigate = useNavigate();

  useEffect(() => {
    fetchFeaturedParts();
  }, []);

  const fetchFeaturedParts = async () => {
    try {
      const res = await productApi.search({ limit: 8 });
      setFeaturedParts(res.data.data);
    } catch (error) {
      console.error('Failed to fetch featured parts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (params) => {
    navigate(`/search?model_year_id=${params.model_year_id}`);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <section className="relative bg-slate-900 pt-32 pb-20 px-4 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 -left-4 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
          <div className="absolute top-0 -right-4 w-72 h-72 bg-orange-500 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
        </div>

        <div className="max-w-7xl mx-auto text-center relative z-10">
          <h1 className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tight">
            NÂNG CẤP <span className="text-blue-500">CHIẾN MÃ</span> CỦA BẠN
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto mb-10">
            Hệ thống tìm kiếm phụ tùng thông minh theo từng đời xe.
            Cam kết chính hãng 100% với hơn 10,000+ sản phẩm.
          </p>

          {/* Search Tab Switcher */}
          <div className="flex justify-center gap-2 mb-6">
            <button
              onClick={() => setSearchTab('vehicle')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${
                searchTab === 'vehicle'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white/10 text-white/70 hover:bg-white/20'
              }`}
            >
              <Car size={16} />
              Chọn xe
            </button>
            <button
              onClick={() => setSearchTab('vin')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${
                searchTab === 'vin'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white/10 text-white/70 hover:bg-white/20'
              }`}
            >
              <Hash size={16} />
              Tra cứu VIN
            </button>
          </div>

          {/* Smart Filter / VIN Search */}
          {searchTab === 'vehicle' ? (
            <VehicleFilter onSearch={handleSearch} />
          ) : (
            <div className="max-w-3xl mx-auto">
              <VinSearch />
            </div>
          )}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto py-16 px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-gray-100 flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center">
              <Shield className="text-blue-600" size={24} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800">Chính hãng 100%</h3>
              <p className="text-sm text-slate-400">Cam kết chất lượng</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-gray-100 flex items-center gap-4">
            <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center">
              <Truck className="text-orange-600" size={24} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800">Giao hàng toàn quốc</h3>
              <p className="text-sm text-slate-400">Nhận hàng trong 3-5 ngày</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-gray-100 flex items-center gap-4">
            <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center">
              <RefreshCw className="text-green-600" size={24} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800">Đổi trả dễ dàng</h3>
              <p className="text-sm text-slate-400">30 ngày đổi trả miễn phí</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-gray-100 flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center">
              <Award className="text-purple-600" size={24} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800">Bảo hành dài hạn</h3>
              <p className="text-sm text-slate-400">12-24 tháng bảo hành</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto py-16 px-4">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">
              Sản phẩm nổi bật
            </h2>
            <p className="text-slate-500 mt-2">Những phụ tùng được tìm kiếm nhiều nhất</p>
          </div>
          <div className="h-1 flex-1 bg-slate-200 mx-8 hidden md:block"></div>
          <button
            onClick={() => navigate('/search')}
            className="text-blue-600 font-bold flex items-center gap-2 hover:gap-3 transition-all"
          >
            Xem tất cả <ChevronRight size={20} />
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredParts.map((part) => (
              <ProductCard key={part.id} part={part} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;