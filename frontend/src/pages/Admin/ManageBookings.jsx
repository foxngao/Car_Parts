import React, { useState, useEffect } from 'react';
import adminApi from '../../api/adminApi';
import { Check, X, Clock, Wrench, User } from 'lucide-react'; // Thêm icon User
import toast from 'react-hot-toast';

const ManageBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true); // Thêm trạng thái loading

  useEffect(() => { fetchBookings(); }, []);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getBookings();
      // Đảm bảo lấy đúng mảng dữ liệu tùy theo cấu trúc response của bạn
      setBookings(res.data.data || res.data); 
    } catch (e) {
      toast.error('Không thể tải danh sách lịch hẹn');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await adminApi.updateBookingStatus(id, newStatus);
      toast.success('Đã cập nhật trạng thái');
      fetchBookings();
    } catch (e) { toast.error('Lỗi cập nhật'); }
  };

  if (loading) return <div className="p-10 text-center text-slate-500">Đang tải lịch hẹn...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">QUẢN LÝ LỊCH HẸN LẮP ĐẶT</h1>
      <div className="bg-white rounded-2xl shadow overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-slate-600 uppercase text-xs">
            <tr>
              <th className="p-4">Khách hàng</th>
              <th className="p-4">Gara / Đơn hàng</th>
              <th className="p-4">Thời gian</th>
              <th className="p-4">Trạng thái</th>
              <th className="p-4 text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {bookings.length > 0 ? bookings.map(b => (
              <tr key={b.id} className="hover:bg-slate-50 transition-colors">
                {/* HIỂN THỊ TÊN VÀ MÃ KHÁCH HÀNG Ở ĐÂY */}
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-500">
                      <User size={16} />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">{b.user_name || 'Khách lẻ'}</p>
                      <p className="text-[10px] text-blue-600 font-medium uppercase tracking-tighter">
                        Mã KH: #{b.user_id || 'N/A'}
                      </p>
                      <p className="text-xs text-slate-500">{b.user_phone}</p>
                    </div>
                  </div>
                </td>
                
                <td className="p-4">
                  <p className="font-medium text-slate-800">{b.garage_name}</p>
                  <p className="text-xs text-slate-400">Mã đơn: #{b.order_id}</p>
                </td>
                
                <td className="p-4 text-sm font-medium text-slate-700">
                  {new Date(b.booking_date).toLocaleString('vi-VN', {
                    hour: '2-digit',
                    minute: '2-digit',
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                  })}
                </td>
                
                <td className="p-4">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                    b.status === 'PENDING' ? 'bg-yellow-100 text-yellow-600' : 
                    b.status === 'CONFIRMED' ? 'bg-blue-100 text-blue-600' : 
                    b.status === 'COMPLETED' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                  }`}>
                    {b.status === 'PENDING' ? 'Chờ duyệt' : 
                     b.status === 'CONFIRMED' ? 'Đã xác nhận' : 
                     b.status === 'COMPLETED' ? 'Hoàn thành' : 'Đã hủy'}
                  </span>
                </td>
                
                <td className="p-4">
                  <div className="flex justify-center gap-2">
                    {b.status === 'PENDING' && (
                      <button 
                        onClick={() => handleStatusChange(b.id, 'CONFIRMED')} 
                        className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        title="Xác nhận"
                      >
                        <Check size={16}/>
                      </button>
                    )}
                    {b.status === 'CONFIRMED' && (
                      <button 
                        onClick={() => handleStatusChange(b.id, 'COMPLETED')} 
                        className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        title="Hoàn thành"
                      >
                        <Wrench size={16}/>
                      </button>
                    )}
                    {(b.status === 'PENDING' || b.status === 'CONFIRMED') && (
                      <button 
                        onClick={() => handleStatusChange(b.id, 'CANCELLED')} 
                        className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-colors"
                        title="Hủy lịch"
                      >
                        <X size={16}/>
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="5" className="p-10 text-center text-slate-400 italic">
                  Chưa có lịch hẹn nào được đăng ký.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManageBookings;