import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import searchHistoryApi from '../api/searchHistoryApi';
import { History, Search, Trash2, Clock, Hash, Camera, Filter, Tag, X, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const SearchHistory = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      fetchHistory();
    }
  }, [isAuthenticated, activeFilter]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const params = {};
      if (activeFilter) params.search_type = activeFilter;
      const res = await searchHistoryApi.getHistory(params);
      setHistory(res.data.data);
    } catch (error) {
      console.error('Failed to fetch search history:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReSearch = (item) => {
    switch (item.search_type) {
      case 'vin':
        navigate(`/search?vin=${encodeURIComponent(item.query)}`);
        break;
      case 'keyword':
      default:
        navigate(`/search?keyword=${encodeURIComponent(item.query)}`);
        break;
    }
  };

  const handleDelete = async (id) => {
    try {
      await searchHistoryApi.deleteItem(id);
      setHistory(prev => prev.filter(h => h.id !== id));
      toast.success('Đã xóa');
    } catch (error) {
      toast.error('Không thể xóa');
    }
  };

  const handleDeleteAll = async () => {
    if (!confirm('Bạn có chắc muốn xóa toàn bộ lịch sử tìm kiếm?')) return;
    try {
      await searchHistoryApi.deleteAll();
      setHistory([]);
      toast.success('Đã xóa toàn bộ lịch sử');
    } catch (error) {
      toast.error('Không thể xóa');
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'vin': return <Hash size={16} className="text-purple-500" />;
      case 'image': return <Camera size={16} className="text-green-500" />;
      case 'filter': return <Filter size={16} className="text-orange-500" />;
      default: return <Search size={16} className="text-blue-500" />;
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case 'vin': return 'VIN';
      case 'image': return 'Ảnh';
      case 'filter': return 'Bộ lọc';
      default: return 'Từ khóa';
    }
  };

  const getTypeBadgeColor = (type) => {
    switch (type) {
      case 'vin': return 'bg-purple-50 text-purple-600 border-purple-200';
      case 'image': return 'bg-green-50 text-green-600 border-green-200';
      case 'filter': return 'bg-orange-50 text-orange-600 border-orange-200';
      default: return 'bg-blue-50 text-blue-600 border-blue-200';
    }
  };

  const formatTime = (timestamp) => {
    const now = new Date();
    const date = new Date(timestamp);
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Vừa xong';
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays < 7) return `${diffDays} ngày trước`;
    return date.toLocaleDateString('vi-VN');
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 pt-32 pb-20 px-4">
        <div className="max-w-2xl mx-auto text-center py-20">
          <AlertCircle size={48} className="mx-auto text-slate-300 mb-4" />
          <h2 className="text-xl font-bold text-slate-700 mb-2">Cần đăng nhập</h2>
          <p className="text-slate-500 mb-6">Vui lòng đăng nhập để xem lịch sử tìm kiếm</p>
          <button onClick={() => navigate('/login')} className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors">
            Đăng nhập
          </button>
        </div>
      </div>
    );
  }

  const filters = [
    { value: '', label: 'Tất cả' },
    { value: 'keyword', label: 'Từ khóa' },
    { value: 'vin', label: 'VIN' },
    { value: 'image', label: 'Ảnh' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 pt-32 pb-20 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
              <History className="text-blue-600" size={32} />
              LỊCH SỬ TÌM KIẾM
            </h1>
            <p className="text-slate-500 mt-1">Các tìm kiếm gần đây của bạn</p>
          </div>
          {history.length > 0 && (
            <button
              onClick={handleDeleteAll}
              className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors font-medium text-sm"
            >
              <Trash2 size={16} />
              Xóa tất cả
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6">
          {filters.map(f => (
            <button
              key={f.value}
              onClick={() => setActiveFilter(f.value)}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                activeFilter === f.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-slate-600 border border-slate-200 hover:border-blue-300'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* History List */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          </div>
        ) : history.length > 0 ? (
          <div className="space-y-3">
            {history.map(item => (
              <div
                key={item.id}
                className="bg-white rounded-2xl p-4 border border-slate-100 hover:border-blue-200 hover:shadow-sm transition-all group"
              >
                <div className="flex items-center gap-4">
                  {/* Icon */}
                  <div className="flex-shrink-0 w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center">
                    {getTypeIcon(item.search_type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-bold text-slate-800 truncate">{item.query}</p>
                      <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md border ${getTypeBadgeColor(item.search_type)}`}>
                        {getTypeLabel(item.search_type)}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <Clock size={12} />
                        {formatTime(item.created_at)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Tag size={12} />
                        {item.results_count} kết quả
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleReSearch(item)}
                      className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors"
                    >
                      <Search size={14} />
                      Tìm lại
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <History size={48} className="mx-auto text-slate-300 mb-4" />
            <h3 className="text-xl font-bold text-slate-700 mb-2">Chưa có lịch sử tìm kiếm</h3>
            <p className="text-slate-500 mb-6">Các tìm kiếm của bạn sẽ được lưu lại ở đây</p>
            <button
              onClick={() => navigate('/search')}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors"
            >
              Bắt đầu tìm kiếm
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchHistory;
