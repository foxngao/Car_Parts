import React, { useState, useEffect } from 'react';
import adminApi from '../../api/adminApi'; // Bỏ dấu ngoặc nhọn
import { Plus, Edit, Trash2, MapPin, Phone, X, Save } from 'lucide-react';
import toast from 'react-hot-toast';

const ManageGarages = () => {
  const [garages, setGarages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingGarage, setEditingGarage] = useState(null);
  const [formData, setFormData] = useState({ name: '', address: '', phone: '', is_active: 1 });

  useEffect(() => { fetchGarages(); }, []);

  const fetchGarages = async () => {
    try {
      const res = await adminApi.getGarages();
      setGarages(res.data);
    } catch (error) {
      toast.error('Không thể tải danh sách gara');
    } finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingGarage) {
        await adminApi.updateGarage(editingGarage.id, formData);
        toast.success('Cập nhật thành công');
      } else {
        await adminApi.createGarage(formData);
        toast.success('Thêm gara thành công');
      }
      setShowModal(false);
      resetForm();
      fetchGarages();
    } catch (error) { toast.error('Thao tác thất bại'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa gara này?')) return;
    try {
      await adminApi.deleteGarage(id);
      toast.success('Đã xóa gara');
      fetchGarages();
    } catch (error) { toast.error('Không thể xóa gara này'); }
  };

  const resetForm = () => {
    setFormData({ name: '', address: '', phone: '', is_active: 1 });
    setEditingGarage(null);
  };

  if (loading) return <div className="p-10 text-center font-bold">Đang tải dữ liệu...</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-black text-slate-900 uppercase">Quản lý Gara đối tác</h1>
        <button 
          onClick={() => { resetForm(); setShowModal(true); }}
          className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-slate-900 transition-all"
        >
          <Plus size={20} /> THÊM GARA
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {garages.map(garage => (
          <div key={garage.id} className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm hover:shadow-md transition-all">
            <div className="flex justify-between items-start mb-4">
              <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${garage.is_active ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                {garage.is_active ? 'Đang hoạt động' : 'Tạm dừng'}
              </div>
              <div className="flex gap-2">
                <button onClick={() => { setEditingGarage(garage); setFormData(garage); setShowModal(true); }} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit size={16}/></button>
                <button onClick={() => handleDelete(garage.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={16}/></button>
              </div>
            </div>
            <h3 className="font-bold text-lg mb-2">{garage.name}</h3>
            <p className="text-sm text-slate-500 flex items-start gap-2 mb-2"><MapPin size={16} className="shrink-0"/> {garage.address}</p>
            <p className="text-sm text-slate-500 flex items-center gap-2"><Phone size={16}/> {garage.phone}</p>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
          <form onSubmit={handleSubmit} className="bg-white rounded-[32px] w-full max-w-md p-8 space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">{editingGarage ? 'Sửa thông tin Gara' : 'Thêm Gara mới'}</h2>
              <button type="button" onClick={() => setShowModal(false)}><X/></button>
            </div>
            <div className="space-y-4">
              <input placeholder="Tên Gara" className="w-full p-3 border rounded-xl" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
              <input placeholder="Địa chỉ" className="w-full p-3 border rounded-xl" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} required />
              <input placeholder="Số điện thoại" className="w-full p-3 border rounded-xl" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} required />
              <div className="flex items-center gap-2 p-2">
                <input type="checkbox" id="is_active" checked={!!formData.is_active} onChange={e => setFormData({...formData, is_active: e.target.checked ? 1 : 0})} />
                <label htmlFor="is_active" className="text-sm font-medium">Kích hoạt hoạt động</label>
              </div>
            </div>
            <button className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 uppercase tracking-widest">
              <Save size={20}/> {editingGarage ? 'Lưu thay đổi' : 'Tạo Gara'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default ManageGarages;