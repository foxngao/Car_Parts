import React, { useState, useEffect } from 'react';
import { favoriteApi } from '../api/favoriteApi';
import ProductCard from '../components/Common/ProductCard';
import { Heart, Loader } from 'lucide-react';
import { Link } from 'react-router-dom';

const FavoritesPage = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      const res = await favoriteApi.getFavorites();
      setFavorites(res.data.data);
    } catch (error) {
      console.error('Failed to fetch favorites', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-32 flex justify-center">
        <Loader className="animate-spin text-blue-600" size={40} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Heart size={32} className="text-red-500" fill="currentColor" />
          <h1 className="text-3xl font-black text-slate-900">Sản phẩm yêu thích</h1>
          <span className="bg-white px-3 py-1 rounded-full text-slate-500 font-bold border shadow-sm">
            {favorites.length}
          </span>
        </div>

        {favorites.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {favorites.map((part) => (
              <ProductCard key={part.id} part={part} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-12 text-center shadow-sm border border-slate-100 flex flex-col items-center">
            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-4">
              <Heart size={40} className="text-slate-300" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Chưa có sản phẩm yêu thích</h3>
            <p className="text-slate-500 mb-6 max-w-md mx-auto">
              Hãy thả tim những sản phẩm bạn thích để lưu lại và dễ dàng tìm kiếm sau này.
            </p>
            <Link
              to="/search"
              className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-slate-900 transition-colors"
            >
              KHÁM PHÁ SẢN PHẨM
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default FavoritesPage;
