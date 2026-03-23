import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import productApi from '../api/productApi';
import cartApi from '../api/cartApi';
import { favoriteApi } from '../api/favoriteApi';
import { comboApi } from '../api/comboApi';
import { useAuth } from '../contexts/AuthContext';
import { formatCurrency } from '../utils/formatters';
import { CheckCircle, ShoppingCart, Shield, Truck, Clock, ChevronLeft, Plus, Minus, Heart, PackageOpen } from 'lucide-react';
import toast from 'react-hot-toast';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [part, setPart] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const res = await productApi.getById(id);
      let partData = res.data.data;

      if (partData.is_combo) {
        try {
          const comboRes = await comboApi.getComboDetails(id);
          partData = comboRes.data.data;
        } catch (e) {
          console.error('Failed to fetch combo details', e);
        }
      }

      setPart(partData);
      if (isAuthenticated) {
        const favRes = await favoriteApi.checkFavorite(id);
        setIsFavorite(favRes.data.isFavorite);
      }
    } catch (error) {
      toast.error('Không tìm thấy sản phẩm');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = (delta) => {
    const newQuantity = quantity + delta;
    if (newQuantity >= 1 && newQuantity <= (part?.stock_quantity || 0)) {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập để thêm vào giỏ hàng');
      navigate('/login');
      return;
    }

    setAddingToCart(true);
    try {
      await cartApi.addToCart({ part_id: part.id, quantity });
      toast.success('Đã thêm vào giỏ hàng');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Thêm vào giỏ thất bại');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleToggleFavorite = async () => {
    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập để yêu thích sản phẩm');
      return;
    }
    try {
      const res = await favoriteApi.toggleFavorite(part.id);
      setIsFavorite(res.data.isFavorite);
      toast.success(res.data.message);
    } catch (error) {
      toast.error('Có lỗi xảy ra');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-32 flex justify-center">
        <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!part) return null;

  return (
    <div className="min-h-screen bg-white pt-32 pb-20 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors mb-8"
        >
          <ChevronLeft size={20} />
          Quay lại
        </button>

        <div className="grid lg:grid-cols-2 gap-16 items-start">
          {/* Product Image */}
          <div className="space-y-4">
            <div className="rounded-[40px] overflow-hidden bg-slate-100 aspect-square">
              <img
                src={part.image_url || 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&q=80&w=500'}
                className="w-full h-full object-cover"
                alt={part.name}
              />
            </div>
          </div>

          {/* Product Info */}
          <div>
            <span className="bg-blue-50 text-blue-600 px-4 py-1 rounded-full text-sm font-bold uppercase">
              {part.category_name}
            </span>
            
            <h1 className="text-4xl font-black text-slate-900 mt-4 mb-6 leading-tight">
              {part.name}
            </h1>
            
            <p className="text-slate-500 text-lg mb-8 leading-relaxed">
              {part.description}
            </p>

            <div className="flex items-center justify-between mb-10">
              <div className="text-5xl font-black text-orange-600">
                {formatCurrency(part.price)}
              </div>
              <button
                onClick={handleToggleFavorite}
                className={`p-4 rounded-2xl shadow-sm border transition-all ${
                  isFavorite ? 'bg-red-50 text-red-500 border-red-100' : 'bg-white text-slate-400 border-slate-200 hover:text-red-500'
                }`}
                title={isFavorite ? 'Bỏ yêu thích' : 'Yêu thích'}
              >
                <Heart size={32} fill={isFavorite ? 'currentColor' : 'none'} />
              </button>
            </div>

            {/* Stock status */}
            <div className="flex items-center gap-3 mb-8">
              <div className={`w-3 h-3 rounded-full ${part.stock_quantity > 0 ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="font-medium text-slate-600">
                {part.stock_quantity > 0 ? `Còn ${part.stock_quantity} sản phẩm` : 'Hết hàng'}
              </span>
            </div>

            {/* Compatibility */}
            {part.compatible_vehicles?.length > 0 && !part.is_combo && (
              <div className="bg-slate-50 p-8 rounded-3xl border border-dashed border-slate-300 mb-10">
                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <CheckCircle className="text-green-500" size={20} />
                  Xe tương thích:
                </h3>
                <div className="flex flex-wrap gap-2">
                  {part.compatible_vehicles.map((v, index) => (
                    <span
                      key={index}
                      className="bg-white px-3 py-1.5 rounded-xl border text-sm font-medium shadow-sm"
                    >
                      {v.brand_name} {v.model_name} ({v.year})
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Combo Items */}
            {part.is_combo && part.items && part.items.length > 0 && (
              <div className="bg-blue-50/50 p-6 rounded-3xl border border-dashed border-blue-200 mb-10">
                <h3 className="font-bold text-blue-900 mb-4 flex items-center gap-2">
                  <PackageOpen className="text-blue-500" size={20} />
                  Combo bao gồm:
                </h3>
                <div className="space-y-3">
                  {part.items.map((item, index) => (
                    <div key={index} className="flex items-center gap-4 bg-white p-3 rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-100">
                      <img src={item.image_url} alt={item.name} className="w-14 h-14 rounded-xl object-cover bg-slate-50" />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-slate-800 text-sm line-clamp-1">{item.name}</h4>
                        <p className="text-xs text-slate-500 mt-0.5">Số lượng: <span className="font-bold text-slate-700">{item.combo_quantity}</span></p>
                      </div>
                      <div className="text-sm font-bold text-slate-300 line-through">
                        {formatCurrency(item.price)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity selector */}
            <div className="flex items-center gap-4 mb-8">
              <span className="font-bold text-slate-700">Số lượng:</span>
              <div className="flex items-center border rounded-2xl overflow-hidden">
                <button
                  onClick={() => handleQuantityChange(-1)}
                  disabled={quantity <= 1}
                  className="w-12 h-12 flex items-center justify-center hover:bg-slate-100 transition-colors disabled:opacity-50"
                >
                  <Minus size={20} />
                </button>
                <span className="w-16 text-center font-bold text-lg">{quantity}</span>
                <button
                  onClick={() => handleQuantityChange(1)}
                  disabled={quantity >= part.stock_quantity}
                  className="w-12 h-12 flex items-center justify-center hover:bg-slate-100 transition-colors disabled:opacity-50"
                >
                  <Plus size={20} />
                </button>
              </div>
            </div>

            {/* Add to cart button */}
            <button
              onClick={handleAddToCart}
              disabled={part.stock_quantity <= 0 || addingToCart}
              className="w-full bg-slate-900 text-white py-6 rounded-2xl font-bold text-xl hover:bg-blue-600 transition-all shadow-xl flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ShoppingCart size={24} />
              {addingToCart ? 'ĐANG THÊM...' : 'THÊM VÀO GIỎ HÀNG'}
            </button>

            {/* Product features */}
            <div className="grid grid-cols-3 gap-4 mt-10">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-2">
                  <Shield className="text-blue-600" size={24} />
                </div>
                <p className="text-xs font-bold text-slate-600">Bảo hành 12 tháng</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center mx-auto mb-2">
                  <Truck className="text-orange-600" size={24} />
                </div>
                <p className="text-xs font-bold text-slate-600">Giao hàng nhanh</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-2">
                  <Clock className="text-green-600" size={24} />
                </div>
                <p className="text-xs font-bold text-slate-600">Đổi trả 30 ngày</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;