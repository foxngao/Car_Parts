import React, { useState, useEffect } from 'react';
import bookingApi from '../api/bookingApi';
import { formatDate } from '../utils/formatters';
import { Calendar, MapPin, Clock, Package, Wrench, CheckCircle, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const res = await bookingApi.getMyBookings();
      setBookings(res.data);
    } catch (error) {
      toast.error('Không thể tải danh sách lịch hẹn');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      'PENDING': 'bg-yellow-100 text-yellow-700 border-yellow-200',
      'CONFIRMED': 'bg-blue-100 text-blue-700 border-blue-200',
      'COMPLETED': 'bg-green-100 text-green-700 border-green-200',
      'CANCELLED': 'bg-red-100 text-red-700 border-red-200',
    };
    return styles[status] || 'bg-gray-100';
  };

  if (loading) return <div className="pt-32 text-center text-slate-500">Đang tải lịch hẹn...</div>;

  return (
    <div className="min-h-screen bg-slate-50 pt-32 pb-20 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-black text-slate-900 mb-8 flex items-center gap-3">
          <Wrench className="text-blue-600" /> LỊCH HẸN CỦA TÔI
        </h1>

        <div className="space-y-4">
          {bookings.length > 0 ? (
            bookings.map((item) => (
              <div key={item.id} className="bg-white p-6 rounded-[24px] shadow-sm border border-gray-100 flex flex-col md:flex-row gap-6 hover:shadow-md transition-all">
                <div className="flex-1 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusBadge(item.status)}`}>
                      {item.status === 'PENDING' ? 'Chờ xác nhận' : 
                       item.status === 'CONFIRMED' ? 'Đã xác nhận' : 
                       item.status === 'COMPLETED' ? 'Đã hoàn thành' : 'Đã hủy'}
                    </span>
                    <span className="text-xs text-slate-400">Mã đơn: #{item.order_id}</span>
                  </div>
                  
                  <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
                    <MapPin size={18} className="text-blue-600" /> {item.garage_name}
                  </h3>
                  
                  <p className="text-sm text-slate-500">{item.garage_address}</p>
                  
                  <div className="flex flex-wrap gap-4 pt-2">
                    <div className="flex items-center gap-2 text-sm font-medium text-slate-700 bg-slate-50 px-3 py-2 rounded-xl">
                      <Calendar size={16} className="text-blue-500" />
                      {new Date(item.booking_date).toLocaleDateString('vi-VN')}
                    </div>
                    <div className="flex items-center gap-2 text-sm font-medium text-slate-700 bg-slate-50 px-3 py-2 rounded-xl">
                      <Clock size={16} className="text-blue-500" />
                      {new Date(item.booking_date).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
                
                <div className="md:w-48 border-t md:border-t-0 md:border-l pt-4 md:pt-0 md:pl-6 flex flex-col justify-center">
                   <p className="text-xs text-slate-400 mb-1">Ghi chú:</p>
                   <p className="text-sm italic text-slate-600">{item.notes || 'Không có ghi chú'}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center bg-white py-16 rounded-[32px] border-2 border-dashed">
              <Calendar size={48} className="mx-auto text-slate-200 mb-4" />
              <p className="text-slate-500 font-medium">Bạn chưa có lịch hẹn nào.</p>
              <a href="/orders" className="text-blue-600 font-bold hover:underline mt-2 inline-block">Xem đơn hàng để đặt lịch</a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyBookings;