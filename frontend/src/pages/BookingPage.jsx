import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import bookingApi from '../api/bookingApi';
import toast from 'react-hot-toast';
import { Calendar, MapPin, Clock, MessageSquare } from 'lucide-react';

const BookingPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { orderId } = location.state || {}; // Nhận orderId từ trang Checkout hoặc OrderDetail

  const [garages, setGarages] = useState([]);
  const [formData, setFormData] = useState({
    garageId: '',
    bookingDate: '',
    notes: ''
  });

  useEffect(() => {
    if (!orderId) {
      toast.error('Không tìm thấy thông tin đơn hàng');
      navigate('/orders');
      return;
    }
    fetchGarages();
  }, [orderId]);

  const fetchGarages = async () => {
    try {
      const res = await bookingApi.getGarages();
      setGarages(res.data);
    } catch (error) {
      toast.error('Không thể tải danh sách Gara');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await bookingApi.createBooking({
        orderId,
        ...formData
      });
      toast.success('Đặt lịch thành công!');
      navigate('/orders');
    } catch (error) {
      toast.error('Đặt lịch thất bại, vui lòng thử lại');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <Calendar className="text-blue-600" /> Đặt lịch lắp đặt cho đơn hàng #{orderId}
      </h1>

      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-2xl p-8 space-y-6">
        {/* Chọn Gara */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
            <MapPin size={16} /> Chọn Gara đối tác
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {garages.map((garage) => (
              <div 
                key={garage.id}
                onClick={() => setFormData({...formData, garageId: garage.id})}
                className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                  formData.garageId === garage.id ? 'border-blue-600 bg-blue-50' : 'border-gray-100 hover:border-blue-200'
                }`}
              >
                <p className="font-bold text-slate-900">{garage.name}</p>
                <p className="text-sm text-slate-500">{garage.address}</p>
                <p className="text-sm text-blue-600 mt-1">{garage.phone}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Chọn thời gian */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
            <Clock size={16} /> Thời gian hẹn
          </label>
          <input
            type="datetime-local"
            required
            className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
            onChange={(e) => setFormData({...formData, bookingDate: e.target.value})}
          />
        </div>

        {/* Ghi chú */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
            <MessageSquare size={16} /> Ghi chú thêm
          </label>
          <textarea
            rows="3"
            className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="Ví dụ: Tôi muốn lắp vào buổi sáng..."
            onChange={(e) => setFormData({...formData, notes: e.target.value})}
          ></textarea>
        </div>

        <button
          type="submit"
          disabled={!formData.garageId || !formData.bookingDate}
          className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 disabled:bg-gray-300 transition-colors"
        >
          XÁC NHẬN ĐẶT LỊCH
        </button>
      </form>
    </div>
  );
};

export default BookingPage;