import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, ChevronRight, GitCompareArrows } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';
import cartApi from '../../api/cartApi';
import toast from 'react-hot-toast';

const ProductCard = ({ part, onAddToCart }) => {
  const [isCompared, setIsCompared] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('compareIds');
    if (saved) {
      try {
        const ids = JSON.parse(saved);
        setIsCompared(ids.includes(part.id));
      } catch (e) {}
    }
  }, [part.id]);

  const handleAddToCart = async (e) => {
    e.preventDefault();
    try {
      await cartApi.addToCart({ part_id: part.id, quantity: 1 });
      toast.success('Đã thêm vào giỏ hàng');
      if (onAddToCart) onAddToCart();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Thêm vào giỏ thất bại');
    }
  };

  const toggleCompare = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const saved = localStorage.getItem('compareIds');
    let ids = [];
    try { ids = saved ? JSON.parse(saved) : []; } catch (e) {}
    
    if (isCompared) {
      ids = ids.filter(id => id !== part.id);
      if (ids.length === 0) {
        localStorage.removeItem('compareCategoryId');
      }
      toast.success('Đã bỏ khỏi so sánh');
    } else {
      if (ids.length >= 4) {
        toast.error('Tối đa 4 sản phẩm so sánh');
        return;
      }

      const compareCategoryId = localStorage.getItem('compareCategoryId');
      if (ids.length > 0 && compareCategoryId && Number(compareCategoryId) !== part.category_id) {
        toast.error('Chỉ có thể so sánh các sản phẩm cùng danh mục');
        return;
      }

      if (ids.length === 0) {
        localStorage.setItem('compareCategoryId', part.category_id.toString());
      }

      ids.push(part.id);
      toast.success('Đã thêm vào so sánh');
    }
    
    localStorage.setItem('compareIds', JSON.stringify(ids));
    setIsCompared(!isCompared);
    // Dispatch event để Header cập nhật badge
    window.dispatchEvent(new Event('compareUpdate'));
  };

  return (
    <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-500 group">
      <Link to={`/product/${part.id}`}>
        <div className="relative h-56 bg-gray-50 overflow-hidden">
          <img
            src={part.image_url || 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&q=80&w=500'}
            alt={part.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          />
          <div className="absolute top-4 left-4">
            <span className="bg-white/90 backdrop-blur-sm text-blue-600 text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">
              {part.category_name}
            </span>
          </div>
          {/* Compare toggle */}
          <button
            onClick={toggleCompare}
            className={`absolute top-4 right-4 p-2 rounded-xl shadow-sm transition-all ${
              isCompared 
                ? 'bg-blue-600 text-white' 
                : 'bg-white/90 backdrop-blur-sm text-slate-500 hover:text-blue-600'
            }`}
            title={isCompared ? 'Bỏ so sánh' : 'Thêm so sánh'}
          >
            <GitCompareArrows size={16} />
          </button>
          {part.stock_quantity <= 0 && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="bg-red-500 text-white px-4 py-2 rounded-xl font-bold">HẾT HÀNG</span>
            </div>
          )}
        </div>
      </Link>

      <div className="p-6">
        <Link to={`/product/${part.id}`}>
          <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1 group-hover:text-blue-600 transition-colors">
            {part.name}
          </h3>
          <p className="text-gray-500 text-sm mb-4 line-clamp-2 h-10 italic">
            {part.description}
          </p>
        </Link>

        <div className="flex items-end justify-between">
          <div>
            <span className="text-2xl font-black text-orange-600">{formatCurrency(part.price)}</span>
            <p className="text-[10px] text-green-600 font-bold uppercase mt-1">
              Sẵn có: {part.stock_quantity}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleAddToCart}
              disabled={part.stock_quantity <= 0}
              className="bg-slate-100 text-slate-600 p-3 rounded-2xl hover:bg-blue-600 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ShoppingCart size={20} />
            </button>
            <Link
              to={`/product/${part.id}`}
              className="bg-blue-600 text-white p-3 rounded-2xl hover:bg-slate-900 transition-all shadow-lg shadow-blue-100"
            >
              <ChevronRight size={20} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;