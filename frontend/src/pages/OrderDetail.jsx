import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import orderApi from '../api/orderApi';
import { formatCurrency, formatDate } from '../utils/formatters';
import { 
  Package, 
  ChevronLeft, 
  MapPin, 
  Phone, 
  User, 
  Calendar, 
  CreditCard,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  Printer,
  Download,
  Loader,
  Wrench,
  Check // Import thêm icon Check
} from 'lucide-react';
import toast from 'react-hot-toast';

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchOrder();
  }, [id, isAuthenticated]);

  const fetchOrder = async () => {
    try {
      const res = await orderApi.getOrderById(id);
      setOrder(res.data.data);
    } catch (error) {
      toast.error('Không tìm thấy đơn hàng');
      navigate('/orders');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'PENDING': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'PAID': 'bg-blue-100 text-blue-800 border-blue-200',
      'SHIPPING': 'bg-purple-100 text-purple-800 border-purple-200',
      'COMPLETED': 'bg-green-100 text-green-800 border-green-200',
      'CANCELLED': 'bg-red-100 text-red-800 border-red-200',
    };
    return colors[status] || 'bg-slate-100 text-slate-800 border-slate-200';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'PENDING':
        return <Clock size={20} />;
      case 'PAID':
        return <CreditCard size={20} />;
      case 'SHIPPING':
        return <Truck size={20} />;
      case 'COMPLETED':
        return <CheckCircle size={20} />;
      case 'CANCELLED':
        return <XCircle size={20} />;
      default:
        return <Package size={20} />;
    }
  };

  const getStatusText = (status) => {
    const texts = {
      'PENDING': 'Chờ xác nhận',
      'PAID': 'Đã thanh toán',
      'SHIPPING': 'Đang giao hàng',
      'COMPLETED': 'Hoàn thành',
      'CANCELLED': 'Đã hủy',
    };
    return texts[status] || status;
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    const content = `
      HÓA ĐƠN ĐƠN HÀNG #${order.id}
      Ngày đặt: ${formatDate(order.order_date)}
      
      THÔNG TIN KHÁCH HÀNG
      Tên: ${order.full_name || 'N/A'}
      Email: ${order.email}
      Điện thoại: ${order.phone || 'N/A'}
      Địa chỉ: ${order.address || 'N/A'}
      
      SẢN PHẨM
      ${order.items?.map(item => 
        `${item.part_name} - SL: ${item.quantity} - ĐG: ${formatCurrency(item.price_at_purchase)} - TT: ${formatCurrency(item.quantity * item.price_at_purchase)}`
      ).join('\n')}
      
      Tổng cộng: ${formatCurrency(order.total_amount)}
      Trạng thái: ${getStatusText(order.status)}
    `;
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `order-${order.id}.txt`;
    a.click();
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-32 flex justify-center">
        <Loader className="w-12 h-12 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!order) return null;

  return (
    <div className="min-h-screen bg-slate-50 pt-32 pb-20 px-4 print:pt-4">
      <div className="max-w-5xl mx-auto">
        <button
          onClick={() => navigate('/orders')}
          className="flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors mb-8 print:hidden"
        >
          <ChevronLeft size={20} />
          Quay lại lịch sử đơn hàng
        </button>

        <div className="bg-white rounded-[32px] shadow-xl border border-gray-100 overflow-hidden print:shadow-none print:border-none">
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-8 print:bg-white print:text-black print:border-b print:border-gray-200">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <Package size={32} className="print:text-slate-900" />
                <div>
                  <h1 className="text-2xl font-bold">ĐƠN HÀNG #{order.id}</h1>
                  <p className="text-slate-300 print:text-slate-500 flex items-center gap-2 mt-1">
                    <Calendar size={16} />
                    {formatDate(order.order_date)}
                  </p>
                </div>
              </div>
              <span className={`flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold border-2 ${getStatusColor(order.status)} print:bg-white`}>
                {getStatusIcon(order.status)}
                {getStatusText(order.status)}
              </span>
            </div>
          </div>

          <div className="p-8">
            {/* Action buttons */}
            <div className="flex items-center justify-end gap-3 mb-8 print:hidden">
              <button
                onClick={handlePrint}
                className="px-4 py-2 border border-slate-200 rounded-xl font-medium hover:bg-slate-50 transition-colors flex items-center gap-2"
              >
                <Printer size={18} />
                In hóa đơn
              </button>
              <button
                onClick={handleDownload}
                className="px-4 py-2 border border-slate-200 rounded-xl font-medium hover:bg-slate-50 transition-colors flex items-center gap-2"
              >
                <Download size={18} />
                Tải xuống
              </button>
            </div>

            {/* --- PHẦN SỬA ĐỔI: CHỨC NĂNG ĐẶT LỊCH DỊCH VỤ LẮP ĐẶT --- */}
            {/* 1. Chỉ hiện nút đặt lịch nếu CHƯA có booking_id */}
            {(order.status === 'PAID' || order.status === 'COMPLETED' || order.status === 'SHIPPING') && !order.booking_id && (
              <div className="mb-8 p-6 bg-blue-50 border border-blue-100 rounded-[24px] flex flex-col md:flex-row justify-between items-center gap-4 print:hidden">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white shrink-0">
                    <Wrench size={24} />
                  </div>
                  <div>
                    <p className="font-bold text-blue-900 text-lg">Bạn cần hỗ trợ lắp đặt phụ tùng?</p>
                    <p className="text-sm text-blue-700">Hãy đặt lịch hẹn với các gara đối tác chuyên nghiệp của chúng tôi ngay hôm nay.</p>
                  </div>
                </div>
                <button 
                  onClick={() => navigate('/booking', { state: { orderId: order.id } })}
                  className="w-full md:w-auto px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 flex items-center justify-center gap-2"
                >
                  <Calendar size={18} />
                  ĐẶT LỊCH NGAY
                </button>
              </div>
            )}

            {/* 2. Hiển thị thông báo nếu ĐÃ có booking_id */}
            {order.booking_id && (
              <div className="mb-8 p-6 bg-green-50 border border-green-100 rounded-[24px] flex items-center gap-4 print:hidden">
                <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center text-white shrink-0">
                  <Check size={24} />
                </div>
                <div>
                  <p className="font-bold text-green-900 text-lg">Đã đặt lịch lắp đặt</p>
                  <p className="text-sm text-green-700">Đơn hàng này đã được đăng ký dịch vụ lắp đặt thành công. Vui lòng kiểm tra lịch hẹn trong hồ sơ của bạn.</p>
                </div>
              </div>
            )}
            {/* ------------------------------------------------------ */}

            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div className="space-y-4">
                <h2 className="font-bold text-lg flex items-center gap-2">
                  <User size={20} className="text-blue-600" />
                  Thông tin khách hàng
                </h2>
                <div className="bg-slate-50 p-6 rounded-2xl space-y-3">
                  <p className="flex items-center gap-3">
                    <User size={18} className="text-slate-400" />
                    <span className="font-medium">{order.full_name || 'Chưa cập nhật'}</span>
                  </p>
                  <p className="flex items-center gap-3">
                    <Phone size={18} className="text-slate-400" />
                    <span className="font-medium">{order.phone || 'Chưa cập nhật'}</span>
                  </p>
                  <p className="flex items-center gap-3">
                    <MapPin size={18} className="text-slate-400" />
                    <span className="font-medium">{order.address || 'Chưa cập nhật'}</span>
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <h2 className="font-bold text-lg flex items-center gap-2">
                  <Package size={20} className="text-blue-600" />
                  Thông tin đơn hàng
                </h2>
                <div className="bg-slate-50 p-6 rounded-2xl space-y-3">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Phương thức thanh toán:</span>
                    <span className="font-medium">Thanh toán khi nhận hàng (COD)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Trạng thái thanh toán:</span>
                    <span className={`font-medium ${
                      order.status === 'PAID' || order.status === 'COMPLETED' || order.status === 'SHIPPING'
                        ? 'text-green-600' 
                        : 'text-yellow-600'
                    }`}>
                      {order.status === 'PAID' || order.status === 'COMPLETED' || order.status === 'SHIPPING'
                        ? 'Đã thanh toán' 
                        : 'Chưa thanh toán'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Ngày cập nhật:</span>
                    <span className="font-medium">{formatDate(order.updated_at || order.order_date)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-8">
              <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
                <Package size={20} className="text-blue-600" />
                Sản phẩm đã đặt
              </h2>
              <div className="space-y-4">
                {order.items?.map((item, index) => (
                  <div key={item.id || index} className="flex gap-4 p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200">
                    <img
                      src={item.image_url || 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&q=80&w=100'}
                      className="w-20 h-20 rounded-xl object-cover shadow-sm"
                      alt={item.part_name}
                    />
                    <div className="flex-1">
                      <Link 
                        to={`/product/${item.part_id}`} 
                        className="font-bold hover:text-blue-600 transition-colors"
                      >
                        {item.part_name}
                      </Link>
                      <p className="text-sm text-slate-500 mt-1">
                        Số lượng: {item.quantity} x {formatCurrency(item.price_at_purchase)}
                      </p>
                    </div>
                    <p className="font-black text-orange-600">
                      {formatCurrency(item.price_at_purchase * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t pt-6">
              <div className="max-w-md ml-auto">
                <div className="space-y-3">
                  <div className="flex justify-between text-lg">
                    <span className="text-slate-600">Tạm tính:</span>
                    <span className="font-medium">{formatCurrency(order.total_amount)}</span>
                  </div>
                  <div className="flex justify-between text-lg">
                    <span className="text-slate-600">Phí vận chuyển:</span>
                    <span className="font-medium text-green-600">Miễn phí</span>
                  </div>
                  <div className="h-px bg-slate-200 my-2"></div>
                  <div className="flex justify-between text-xl">
                    <span className="font-bold">Tổng cộng:</span>
                    <span className="font-black text-orange-600 text-2xl">{formatCurrency(order.total_amount)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-8 border-t print:hidden">
              <h2 className="font-bold text-lg mb-6">Lịch trình đơn hàng</h2>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <CheckCircle size={16} className="text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium">Đơn hàng đã được đặt</p>
                    <p className="text-sm text-slate-500">{formatDate(order.order_date)}</p>
                  </div>
                </div>
                
                {order.status !== 'PENDING' && (
                  <div className="flex items-start gap-4">
                    <div className={`w-8 h-8 ${
                      ['PAID', 'SHIPPING', 'COMPLETED'].includes(order.status)
                        ? 'bg-green-100'
                        : 'bg-slate-100'
                    } rounded-full flex items-center justify-center flex-shrink-0`}>
                      <CreditCard size={16} className={
                        ['PAID', 'SHIPPING', 'COMPLETED'].includes(order.status)
                          ? 'text-green-600'
                          : 'text-slate-400'
                      } />
                    </div>
                    <div>
                      <p className="font-medium">Đã xác nhận thanh toán</p>
                      <p className="text-sm text-slate-500">
                        {['PAID', 'SHIPPING', 'COMPLETED'].includes(order.status)
                          ? formatDate(order.updated_at || order.order_date)
                          : 'Đang chờ xử lý'}
                      </p>
                    </div>
                  </div>
                )}
                
                {['SHIPPING', 'COMPLETED'].includes(order.status) && (
                  <div className="flex items-start gap-4">
                    <div className={`w-8 h-8 ${
                      order.status === 'COMPLETED' ? 'bg-green-100' : 'bg-blue-100'
                    } rounded-full flex items-center justify-center flex-shrink-0`}>
                      <Truck size={16} className={
                        order.status === 'COMPLETED' ? 'text-green-600' : 'text-blue-600'
                      } />
                    </div>
                    <div>
                      <p className="font-medium">
                        {order.status === 'COMPLETED' ? 'Đã giao hàng' : 'Đang giao hàng'}
                      </p>
                      <p className="text-sm text-slate-500">
                        {order.status === 'COMPLETED'
                          ? formatDate(order.updated_at || order.order_date)
                          : 'Dự kiến 3-5 ngày'}
                      </p>
                    </div>
                  </div>
                )}
                
                {order.status === 'COMPLETED' && (
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <CheckCircle size={16} className="text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium">Hoàn thành</p>
                      <p className="text-sm text-slate-500">{formatDate(order.updated_at || order.order_date)}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;