import React, { useState, useEffect } from 'react';
import { comboApi } from '../api/comboApi';
import ProductCard from '../components/Common/ProductCard';
import { PackageOpen, Loader } from 'lucide-react';
import { Link } from 'react-router-dom';

const CombosPage = () => {
  const [combos, setCombos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCombos();
  }, []);

  const fetchCombos = async () => {
    try {
      const res = await comboApi.getCombos();
      setCombos(res.data.data);
    } catch (error) {
      console.error('Failed to fetch combos', error);
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
        <div className="flex flex-col gap-2 mb-8">
          <div className="flex items-center gap-3">
            <PackageOpen size={36} className="text-blue-600" />
            <h1 className="text-4xl font-black text-slate-900">Combo Siêu Ưu Đãi</h1>
          </div>
          <p className="text-slate-500 max-w-2xl">
            Các gói sản phẩm được kết hợp sẵn giúp bạn dễ dàng bảo dưỡng và nâng cấp xe mà không cần mất công tìm kiếm từng món rời rạc.
          </p>
        </div>

        {combos.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {combos.map((combo) => (
              <ProductCard key={combo.id} part={combo} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-12 text-center shadow-sm border border-slate-100 flex flex-col items-center">
            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-4">
              <PackageOpen size={40} className="text-slate-300" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Hiện chưa có Combo nào</h3>
            <p className="text-slate-500 mb-6 max-w-md mx-auto">
              Chúng tôi đang cập nhật thêm các gói Combo mới. Vui lòng quay lại sau!
            </p>
            <Link
              to="/search"
              className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-slate-900 transition-colors"
            >
              MUA GÌ ĐÓ KHÁC
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default CombosPage;
