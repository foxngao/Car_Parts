import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import compareApi from '../api/compareApi';
import productApi from '../api/productApi';
import cartApi from '../api/cartApi';
import { useAuth } from '../contexts/AuthContext';
import { formatCurrency } from '../utils/formatters';
import {
  X, Plus, Search, ShoppingCart, Star, CheckCircle, XCircle,
  Layers, DollarSign, MessageSquare, Car, ChevronLeft, Trash2
} from 'lucide-react';
import toast from 'react-hot-toast';

const Compare = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [compareIds, setCompareIds] = useState([]);
  const [compareData, setCompareData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('specs');

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('compareIds');
    if (saved) {
      try {
        const ids = JSON.parse(saved);
        if (Array.isArray(ids) && ids.length >= 2) {
          setCompareIds(ids);
        }
      } catch (e) { }
    }
  }, []);

  // Fetch compare data khi ids thay đổi
  useEffect(() => {
    if (compareIds.length >= 2) {
      fetchCompareData();
    } else {
      setCompareData(null);
    }
  }, [compareIds]);

  const fetchCompareData = async () => {
    setLoading(true);
    try {
      const res = await compareApi.getCompareData(compareIds);
      setCompareData(res.data.data);
    } catch (error) {
      console.error('Compare error:', error);
      toast.error('Không thể tải dữ liệu so sánh');
    } finally {
      setLoading(false);
    }
  };

  const removeFromCompare = (partId) => {
    const newIds = compareIds.filter(id => id !== partId);
    setCompareIds(newIds);
    localStorage.setItem('compareIds', JSON.stringify(newIds));
    if (newIds.length === 0) {
      localStorage.removeItem('compareCategoryId');
    }
  };

  const clearAll = () => {
    setCompareIds([]);
    localStorage.removeItem('compareIds');
    localStorage.removeItem('compareCategoryId');
    setCompareData(null);
  };

  const handleAddToCart = async (partId) => {
    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập');
      navigate('/login');
      return;
    }
    try {
      await cartApi.addToCart({ part_id: partId, quantity: 1 });
      toast.success('Đã thêm vào giỏ hàng');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Thêm vào giỏ thất bại');
    }
  };

  const tabs = [
    { id: 'specs', label: 'Thông số kỹ thuật', icon: Layers },
    { id: 'price', label: 'Giá cả', icon: DollarSign },
    { id: 'reviews', label: 'Đánh giá', icon: MessageSquare },
    { id: 'compatibility', label: 'Tương thích', icon: Car },
  ];

  const renderStars = (rating) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map(star => (
          <Star
            key={star}
            size={16}
            className={star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}
          />
        ))}
      </div>
    );
  };

  // ==================== RENDER EMPTY STATE ====================
  if (compareIds.length < 2 && !compareData) {
    return (
      <div className="min-h-screen bg-slate-50 pt-32 pb-20 px-4">
        <div className="max-w-4xl mx-auto">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors mb-8">
            <ChevronLeft size={20} /> Quay lại
          </button>

          <div className="text-center mb-12">
            <div className="w-20 h-20 bg-blue-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <Layers className="text-blue-600" size={40} />
            </div>
            <h1 className="text-3xl font-black text-slate-900 mb-3">SO SÁNH SẢN PHẨM</h1>
            <p className="text-slate-500 text-lg">Chọn từ 2 đến 4 sản phẩm để so sánh chi tiết</p>
          </div>

          {/* Selected items */}
          {compareIds.length > 0 && (
            <div className="mb-8">
              <h3 className="font-bold text-slate-700 mb-3">Đã chọn ({compareIds.length}/4):</h3>
              <div className="flex gap-3 flex-wrap">
                {compareIds.map(id => (
                  <span key={id} className="bg-blue-100 text-blue-700 px-4 py-2 rounded-xl font-medium flex items-center gap-2">
                    Sản phẩm #{id}
                    <button onClick={() => removeFromCompare(id)} className="hover:text-red-600">
                      <X size={16} />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Action button to add */}
          <div className="flex justify-center mt-8">
            <button
              onClick={() => navigate('/search')}
              className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 flex items-center gap-2 hover:scale-105 active:scale-95 duration-300"
            >
              <Search size={22} />
              Đến trang Sản phẩm để chọn
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ==================== RENDER COMPARISON ====================
  return (
    <div className="min-h-screen bg-slate-50 pt-32 pb-20 px-4">
      <div className="max-w-7xl mx-auto">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors mb-8">
          <ChevronLeft size={20} /> Quay lại
        </button>

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black text-slate-900">SO SÁNH SẢN PHẨM</h1>
            <p className="text-slate-500 mt-1">{compareIds.length} sản phẩm đang so sánh</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/search')}
              disabled={compareIds.length >= 4}
              className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              <Plus size={18} /> Thêm SP
            </button>
            <button
              onClick={clearAll}
              className="bg-red-50 text-red-600 px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-red-100 transition-colors flex items-center gap-2"
            >
              <Trash2 size={18} /> Xóa tất cả
            </button>
          </div>
        </div>


        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          </div>
        ) : compareData ? (
          <>
            {/* Product cards header row */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 mb-6">
              <div className={`grid gap-6`} style={{ gridTemplateColumns: `repeat(${compareData.parts.length}, minmax(0, 1fr))` }}>
                {compareData.parts.map(part => (
                  <div key={part.id} className="text-center relative group">
                    <button
                      onClick={() => removeFromCompare(part.id)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white w-7 h-7 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10 hover:bg-red-600"
                    >
                      <X size={14} />
                    </button>
                    <Link to={`/product/${part.id}`}>
                      <img
                        src={part.image_url || 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&q=80&w=300'}
                        alt={part.name}
                        className="w-full h-40 object-cover rounded-2xl mb-3 hover:scale-105 transition-transform"
                      />
                    </Link>
                    <Link to={`/product/${part.id}`} className="text-sm font-bold text-slate-900 hover:text-blue-600 transition-colors line-clamp-2 block mb-1">
                      {part.name}
                    </Link>
                    <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">{part.category_name}</span>
                    <div className="text-xl font-black text-orange-600 mt-2">{formatCurrency(part.price)}</div>
                    <button
                      onClick={() => handleAddToCart(part.id)}
                      disabled={part.stock_quantity <= 0}
                      className="mt-3 bg-slate-900 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-blue-600 transition-colors disabled:opacity-50 inline-flex items-center gap-1"
                    >
                      <ShoppingCart size={14} /> Thêm vào giỏ
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
              {tabs.map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm whitespace-nowrap transition-all ${activeTab === tab.id
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                      }`}
                  >
                    <Icon size={18} />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Tab content */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
              {activeTab === 'specs' && <SpecsTab data={compareData} />}
              {activeTab === 'price' && <PriceTab data={compareData} />}
              {activeTab === 'reviews' && <ReviewsTab data={compareData} renderStars={renderStars} />}
              {activeTab === 'compatibility' && <CompatibilityTab data={compareData} />}
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
};

// ==================== SPECS TAB ====================
const SpecsTab = ({ data }) => {
  const { parts, all_spec_names } = data;

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="bg-slate-50">
            <th className="text-left px-6 py-4 font-bold text-slate-700 border-b min-w-[180px]">Thông số</th>
            {parts.map(part => (
              <th key={part.id} className="text-center px-6 py-4 font-bold text-slate-700 border-b border-l">
                {part.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {all_spec_names.map((specName, idx) => {
            const values = parts.map(part => {
              const spec = part.specifications.find(s => s.spec_name === specName);
              return spec ? `${spec.spec_value}${spec.spec_unit ? ' ' + spec.spec_unit : ''}` : '—';
            });
            const allSame = values.every(v => v === values[0]);

            return (
              <tr key={specName} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                <td className="px-6 py-3.5 font-semibold text-slate-700 border-b">{specName}</td>
                {values.map((val, i) => (
                  <td
                    key={i}
                    className={`px-6 py-3.5 text-center border-b border-l ${val === '—' ? 'text-slate-300' :
                      !allSame ? 'text-blue-700 font-bold bg-blue-50/50' : 'text-slate-600'
                      }`}
                  >
                    {val}
                  </td>
                ))}
              </tr>
            );
          })}
          {all_spec_names.length === 0 && (
            <tr>
              <td colSpan={parts.length + 1} className="text-center py-12 text-slate-400">
                Chưa có thông số kỹ thuật
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

// ==================== PRICE TAB ====================
const PriceTab = ({ data }) => {
  const { parts } = data;
  const minPrice = Math.min(...parts.map(p => parseFloat(p.price)));
  const maxPrice = Math.max(...parts.map(p => parseFloat(p.price)));

  return (
    <div className="p-8">
      <h3 className="text-lg font-bold text-slate-800 mb-6">So sánh giá cả</h3>

      {/* Bar chart */}
      <div className="space-y-6 mb-10">
        {parts.map(part => {
          const price = parseFloat(part.price);
          const percentage = maxPrice > 0 ? (price / maxPrice) * 100 : 0;
          const isCheapest = price === minPrice;

          return (
            <div key={part.id}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-slate-700 text-sm truncate max-w-[200px]">{part.name}</span>
                <div className="flex items-center gap-2">
                  <span className={`text-lg font-black ${isCheapest ? 'text-green-600' : 'text-orange-600'}`}>
                    {formatCurrency(price)}
                  </span>
                  {isCheapest && parts.length > 1 && (
                    <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-0.5 rounded-full">
                      Rẻ nhất
                    </span>
                  )}
                </div>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-6 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${isCheapest ? 'bg-gradient-to-r from-green-400 to-green-600' : 'bg-gradient-to-r from-blue-400 to-blue-600'}`}
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Price comparison table */}
      <div className="bg-slate-50 rounded-2xl p-6">
        <h4 className="font-bold text-slate-700 mb-4">Chi tiết so sánh</h4>
        <div className={`grid gap-4`} style={{ gridTemplateColumns: `repeat(${parts.length}, minmax(0, 1fr))` }}>
          {parts.map(part => {
            const price = parseFloat(part.price);
            const isCheapest = price === minPrice;
            const diff = price - minPrice;

            return (
              <div key={part.id} className={`p-4 rounded-2xl text-center ${isCheapest ? 'bg-green-50 border-2 border-green-200' : 'bg-white border border-slate-200'}`}>
                <h5 className="font-bold text-sm text-slate-800 mb-2 line-clamp-2">{part.name}</h5>
                <div className={`text-2xl font-black mb-1 ${isCheapest ? 'text-green-600' : 'text-slate-800'}`}>
                  {formatCurrency(price)}
                </div>
                {!isCheapest && diff > 0 && (
                  <p className="text-xs text-red-500 font-medium">+{formatCurrency(diff)} so với rẻ nhất</p>
                )}
                {isCheapest && <p className="text-xs text-green-600 font-bold">✓ Giá tốt nhất</p>}
                <p className="text-xs text-slate-400 mt-2">
                  Kho: {part.stock_quantity > 0 ? `Còn ${part.stock_quantity}` : 'Hết hàng'}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ==================== REVIEWS TAB ====================
const ReviewsTab = ({ data, renderStars }) => {
  const { parts } = data;

  return (
    <div className="p-8">
      <h3 className="text-lg font-bold text-slate-800 mb-6">So sánh đánh giá</h3>

      {/* Rating overview */}
      <div className={`grid gap-6 mb-10`} style={{ gridTemplateColumns: `repeat(${parts.length}, minmax(0, 1fr))` }}>
        {parts.map(part => {
          const { rating_summary } = part;
          const avgRating = parseFloat(rating_summary.avg_rating) || 0;

          return (
            <div key={part.id} className="bg-slate-50 rounded-2xl p-6 text-center">
              <h4 className="font-bold text-sm text-slate-800 mb-3 line-clamp-2">{part.name}</h4>
              <div className="text-4xl font-black text-slate-900 mb-2">{avgRating || '—'}</div>
              <div className="flex justify-center mb-2">
                {renderStars(Math.round(avgRating))}
              </div>
              <p className="text-sm text-slate-500">{rating_summary.review_count} đánh giá</p>

              {/* Star distribution */}
              <div className="mt-4 space-y-1">
                {[5, 4, 3, 2, 1].map(star => {
                  const count = rating_summary[`star_${star}`] || 0;
                  const pct = rating_summary.review_count > 0 ? (count / rating_summary.review_count) * 100 : 0;
                  return (
                    <div key={star} className="flex items-center gap-2 text-xs">
                      <span className="text-slate-500 w-3">{star}</span>
                      <Star size={10} className="text-yellow-400 fill-yellow-400" />
                      <div className="flex-1 bg-slate-200 rounded-full h-1.5">
                        <div className="bg-yellow-400 rounded-full h-1.5 transition-all" style={{ width: `${pct}%` }}></div>
                      </div>
                      <span className="text-slate-400 w-5 text-right">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent reviews */}
      <h4 className="font-bold text-slate-700 mb-4">Đánh giá gần đây</h4>
      <div className={`grid gap-6`} style={{ gridTemplateColumns: `repeat(${parts.length}, minmax(0, 1fr))` }}>
        {parts.map(part => (
          <div key={part.id} className="space-y-3">
            <h5 className="font-bold text-xs text-slate-500 uppercase">{part.name}</h5>
            {part.reviews.length > 0 ? (
              part.reviews.slice(0, 3).map(review => (
                <div key={review.id} className="bg-slate-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                      {(review.full_name || review.username).charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-medium text-slate-700">{review.full_name || review.username}</span>
                  </div>
                  {renderStars(review.rating)}
                  {review.comment && (
                    <p className="text-sm text-slate-600 mt-2 line-clamp-3">{review.comment}</p>
                  )}
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-400 italic">Chưa có đánh giá</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// ==================== COMPATIBILITY TAB ====================
const CompatibilityTab = ({ data }) => {
  const { parts, all_vehicles } = data;

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="bg-slate-50">
            <th className="text-left px-6 py-4 font-bold text-slate-700 border-b min-w-[220px]">Xe tương thích</th>
            {parts.map(part => (
              <th key={part.id} className="text-center px-6 py-4 font-bold text-slate-700 border-b border-l text-sm">
                {part.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {all_vehicles.map((vehicle, idx) => {
            const vehicleKey = `${vehicle.brand_name}-${vehicle.model_name}-${vehicle.year}`;

            return (
              <tr key={vehicleKey} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                <td className="px-6 py-3 border-b">
                  <span className="font-semibold text-slate-700">
                    {vehicle.brand_name} {vehicle.model_name}
                  </span>
                  <span className="text-slate-400 ml-2 text-sm">({vehicle.year})</span>
                </td>
                {parts.map(part => {
                  const isCompatible = part.compatible_vehicles.some(
                    cv => cv.brand_name === vehicle.brand_name &&
                      cv.model_name === vehicle.model_name &&
                      cv.year === vehicle.year
                  );
                  return (
                    <td key={part.id} className="text-center px-6 py-3 border-b border-l">
                      {isCompatible ? (
                        <CheckCircle className="inline-block text-green-500" size={22} />
                      ) : (
                        <XCircle className="inline-block text-slate-300" size={22} />
                      )}
                    </td>
                  );
                })}
              </tr>
            );
          })}
          {all_vehicles.length === 0 && (
            <tr>
              <td colSpan={parts.length + 1} className="text-center py-12 text-slate-400">
                Chưa có dữ liệu tương thích
              </td>
            </tr>
          )}
        </tbody>
        {/* Summary row */}
        {all_vehicles.length > 0 && (
          <tfoot>
            <tr className="bg-blue-50">
              <td className="px-6 py-4 font-bold text-blue-700 border-t-2 border-blue-200">Tổng xe tương thích</td>
              {parts.map(part => (
                <td key={part.id} className="text-center px-6 py-4 font-black text-blue-700 border-t-2 border-blue-200 border-l text-lg">
                  {part.compatible_vehicles.length}
                </td>
              ))}
            </tr>
          </tfoot>
        )}
      </table>
    </div>
  );
};

export default Compare;
