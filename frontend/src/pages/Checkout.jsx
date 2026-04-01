import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import cartApi from '../api/cartApi';
import orderApi from '../api/orderApi';
import { formatCurrency } from '../utils/formatters';
import { CreditCard, MapPin, Phone, User, Package, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

const Checkout = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [cart, setCart] = useState({ items: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: user?.full_name || '',
    phone: user?.phone || '',
    address: user?.address || '',
    notes: '',
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchCart();
  }, [isAuthenticated]);

  const fetchCart = async () => {
    try {
      const res = await cartApi.getCart();
      if (res.data.data.items.length === 0) {
        navigate('/cart');
        return;
      }
      setCart(res.data.data);
    } catch (error) {
      toast.error('Không thể tải giỏ hàng');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.full_name || !formData.phone || !formData.address) {
      toast.error('Vui lòng điền đầy đủ thông tin giao hàng');
      return;
    }

    setProcessing(true);
    try {
      const res = await orderApi.createOrder(formData);
      toast.success('Đặt hàng thành công!');
      navigate(`/orders/${res.data.data.order_id}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Đặt hàng thất bại');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-32 flex justify-center">
        <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-32 pb-20 px-4">
      <div className="max-w-7xl mx-auto">
        <button
          onClick={() => navigate('/cart')}
          className="flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors mb-8"
        >
          <ArrowLeft size={20} />
          Quay lại giỏ hàng
        </button>

        <h1 className="text-3xl font-black text-slate-900 mb-10 flex items-center gap-3">
          <Package className="text-blue-600" />
          THANH TOÁN ĐƠN HÀNG
        </h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Checkout form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Shipping information */}
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <MapPin className="text-blue-600" size={20} />
                  Thông tin giao hàng
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Họ và tên người nhận *
                    </label>
                    <div className="relative">
                      <User className="absolute left-4 top-3.5 text-slate-400" size={20} />
                      <input
                        type="text"
                        name="full_name"
                        value={formData.full_name}
                        onChange={handleInputChange}
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Nhập họ tên"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Số điện thoại *
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-3.5 text-slate-400" size={20} />
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Nhập số điện thoại"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Địa chỉ giao hàng *
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-3.5 text-slate-400" size={20} />
                      <textarea
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        rows="3"
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Nhập địa chỉ chi tiết"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Ghi chú (tùy chọn)
                    </label>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      rows="2"
                      className="w-full px-4 py-3 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Ghi chú về thời gian giao hàng, v.v..."
                    />
                  </div>
                </div>
              </div>

              {/* Payment method */}
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <CreditCard className="text-blue-600" size={20} />
                  Phương thức thanh toán
                </h2>

                <div className="space-y-3">
                  <label className="flex items-center p-4 border rounded-xl cursor-pointer hover:bg-slate-50 transition-colors">
                    <input
                      type="radio"
                      name="payment"
                      value="cod"
                      defaultChecked
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="ml-3">
                      <span className="font-bold block">Thanh toán khi nhận hàng (COD)</span>
                      <span className="text-sm text-slate-500">Chỉ thanh toán khi nhận được hàng</span>
                    </span>
                  </label>
                </div>
              </div>
            </form>
          </div>

          {/* Order summary */}
          <div className="lg:col-span-1">
            <div className="bg-white p-8 rounded-[32px] shadow-xl border border-gray-100 sticky top-28">
              <h2 className="text-xl font-bold mb-6">Đơn hàng của bạn</h2>

              <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
                {cart.items.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <img
                      src={item.image_url || 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&q=80&w=50'}
                      className="w-16 h-16 rounded-xl object-cover"
                      alt={item.name}
                    />
                    <div className="flex-1">
                      <p className="font-medium text-sm line-clamp-2">{item.name}</p>
                      <p className="text-xs text-slate-500 mt-1">SL: {item.quantity}</p>
                    </div>
                    <p className="font-bold text-sm">{formatCurrency(item.subtotal)}</p>
                  </div>
                ))}
              </div>

              <div className="space-y-3 pt-4 border-t">
                <div className="flex justify-between">
                  <span className="text-slate-600">Tạm tính</span>
                  <span className="font-medium">{formatCurrency(cart.total)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Phí vận chuyển</span>
                  <span className="font-medium text-green-600">Miễn phí</span>
                </div>
              </div>

              <div className="h-px bg-slate-100 my-6"></div>

              <div className="flex justify-between mb-8 text-xl">
                <span className="font-black">Tổng cộng</span>
                <span className="font-black text-orange-600">{formatCurrency(cart.total)}</span>
              </div>

              <button
                onClick={handleSubmit}
                disabled={processing}
                className="w-full bg-slate-900 text-white py-5 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <CreditCard size={20} />
                {processing ? 'ĐANG XỬ LÝ...' : 'ĐẶT HÀNG'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
