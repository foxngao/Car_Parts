import React, { useState, useEffect } from 'react';
import adminApi from '../../api/adminApi';
import productApi from '../../api/productApi';
import { comboApi } from '../../api/comboApi';
import { formatCurrency } from '../../utils/formatters';
import {
  PackageOpen,
  Search,
  Plus,
  Edit,
  Trash2,
  X,
  Check,
  Loader,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Eye,
  Search as SearchIcon,
  Filter // Thêm icon Filter
} from 'lucide-react';
import toast from 'react-hot-toast';

const Combos = () => {
  const [combos, setCombos] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCombo, setEditingCombo] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1, limit: 10, total: 0, totalPages: 0
  });

  // State hỗ trợ chọn part khi thêm vào combo
  const [searchPartQuery, setSearchPartQuery] = useState('');
  const [selectedPartCategoryId, setSelectedPartCategoryId] = useState(''); // State lọc theo danh mục cho part
  const [searchPartResults, setSearchPartResults] = useState([]);
  const [isSearchingPart, setIsSearchingPart] = useState(false);

  const [formData, setFormData] = useState({
    category_id: '',
    name: '',
    description: '',
    price: '',
    stock_quantity: '',
    image_url: '',
    combo_items: [] // { part_id, quantity, name, price, stock_quantity, image_url }
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchCombos();
  }, [pagination.page, searchTerm]);

  // Tự động tìm kiếm part khi admin chọn danh mục hoặc nhập từ khóa trong Modal
  useEffect(() => {
    if (showModal && (selectedPartCategoryId || searchPartQuery)) {
      handleSearchPartsForCombo();
    }
  }, [selectedPartCategoryId, searchPartQuery]);

  const fetchCategories = async () => {
    try {
      const res = await productApi.getCategories();
      setCategories(res.data.data || []);
    } catch (error) {
      console.error('Lỗi lấy danh mục', error);
    }
  };

  const fetchCombos = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        keyword: searchTerm || undefined,
        is_combo: true
      };
      const res = await productApi.search(params);
      setCombos(res.data.data || []);
      setPagination(res.data.pagination || { page: 1, limit: 10, total: 0, totalPages: 0 });
    } catch (error) {
      toast.error('Không thể tải danh sách Combo');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchPartsForCombo = async () => {
    setIsSearchingPart(true);
    try {
      const res = await productApi.search({ 
        keyword: searchPartQuery || undefined, 
        category_id: selectedPartCategoryId || undefined,
        limit: 20, // Tăng limit để admin dễ chọn
        is_combo: false 
      });
      setSearchPartResults(res.data.data || []);
    } catch (error) {
      console.error('Lỗi tìm sản phẩm', error);
    } finally {
      setIsSearchingPart(false);
    }
  };

  const addPartToCombo = (part) => {
    if (formData.combo_items.find(item => item.part_id === part.id)) {
      toast.error('Sản phẩm này đã có trong Combo');
      return;
    }
    setFormData({
      ...formData,
      combo_items: [
        ...formData.combo_items,
        {
          part_id: part.id,
          name: part.name,
          price: part.price,
          stock_quantity: part.stock_quantity,
          image_url: part.image_url,
          quantity: 1
        }
      ]
    });
    // Không reset search để admin có thể chọn tiếp món khác trong cùng danh mục
  };

  const removePartFromCombo = (partId) => {
    setFormData({
      ...formData,
      combo_items: formData.combo_items.filter(item => item.part_id !== partId)
    });
  };

  const updateItemQuantity = (partId, newQuantity) => {
    if (newQuantity < 1) return;
    setFormData({
      ...formData,
      combo_items: formData.combo_items.map(item =>
        item.part_id === partId ? { ...item, quantity: newQuantity } : item
      )
    });
  };

  const calcSuggestedPrice = () => {
    return formData.combo_items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.category_id || !formData.name || !formData.price || !formData.stock_quantity) {
      toast.error('Vui lòng điền đủ thông tin');
      return;
    }
    if (formData.combo_items.length === 0) {
      toast.error('Combo phải có ít nhất 1 sản phẩm');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...formData,
        price: parseFloat(formData.price),
        stock_quantity: parseInt(formData.stock_quantity),
        is_combo: true,
        combo_items: formData.combo_items.map(i => ({ part_id: i.part_id, quantity: i.quantity }))
      };

      if (editingCombo) {
        await adminApi.updatePart(editingCombo.id, payload);
        toast.success('Cập nhật Combo thành công');
      } else {
        await adminApi.createPart(payload);
        toast.success('Thêm Combo thành công');
      }
      setShowModal(false);
      resetForm();
      fetchCombos();
    } catch (error) {
      toast.error('Thất bại: ' + (error.response?.data?.message || 'Có lỗi xảy ra'));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Bạn có chắc muốn xóa Combo này?')) return;
    try {
      await adminApi.deletePart(id);
      toast.success('Xóa Combo thành công');
      fetchCombos();
    } catch (error) {
      toast.error('Xóa thất bại');
    }
  };

  const handleEditCombo = async (combo) => {
    setEditingCombo(combo);
    setFormData({
      category_id: combo.category_id,
      name: combo.name,
      description: combo.description || '',
      price: combo.price,
      stock_quantity: combo.stock_quantity,
      image_url: combo.image_url || '',
      combo_items: []
    });
    setShowModal(true);

    try {
      const res = await comboApi.getComboDetails(combo.id);
      const detail = res.data.data;
      if (detail && detail.items) {
        setFormData(prev => ({
          ...prev,
          combo_items: detail.items.map(i => ({
            part_id: i.part_id,
            name: i.name,
            price: i.price,
            stock_quantity: i.stock_quantity,
            image_url: i.image_url,
            quantity: i.combo_quantity
          }))
        }));
      }
    } catch (e) {
      toast.error('Không tải được danh sách món của Combo này');
    }
  };

  const resetForm = () => {
    setFormData({ category_id: '', name: '', description: '', price: '', stock_quantity: '', image_url: '', combo_items: [] });
    setEditingCombo(null);
    setSearchPartResults([]);
    setSearchPartQuery('');
    setSelectedPartCategoryId('');
  };

  if (loading && combos.length === 0) {
    return <div className="flex justify-center h-64 items-center"><Loader className="animate-spin text-blue-600" /></div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-slate-900 uppercase tracking-wider flex items-center gap-3">
          <PackageOpen className="text-blue-600" />
          QUẢN LÝ COMBO ƯU ĐÃI
        </h1>
      </div>

      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-3.5 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Tìm kiếm Combo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && fetchCombos()}
            className="w-full pl-12 pr-4 py-3 bg-slate-50 rounded-xl outline-none"
          />
        </div>
        <button
          onClick={() => { resetForm(); setShowModal(true); }}
          className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold flex flex-shrink-0 items-center justify-center gap-2 hover:bg-slate-900"
        >
          <Plus size={20} />
          THÊM COMBO
        </button>
      </div>

      <div className="bg-white rounded-[32px] shadow-sm border overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50 text-left text-slate-600">
            <tr>
              <th className="px-6 py-4">Tên Combo</th>
              <th className="px-6 py-4">Giá bán</th>
              <th className="px-6 py-4">Tồn kho</th>
              <th className="px-6 py-4 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {combos.map(combo => (
              <tr key={combo.id} className="border-b hover:bg-slate-50">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <img src={combo.image_url || 'https://images.unsplash.com/photo-1632823469850-1d71013f9f4d'} className="w-12 h-12 rounded-xl object-cover" alt="" />
                    <span className="font-bold">{combo.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 font-black text-orange-600">{formatCurrency(combo.price)}</td>
                <td className="px-6 py-4 font-bold">{combo.stock_quantity}</td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => handleEditCombo(combo)} className="p-2 text-green-600 hover:bg-green-50 rounded-xl"><Edit size={18} /></button>
                  <button onClick={() => handleDelete(combo.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-xl"><Trash2 size={18} /></button>
                </td>
              </tr>
            ))}
            {combos.length === 0 && <tr><td colSpan="4" className="text-center py-8">Chưa có Combo nào</td></tr>}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex flex-col items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[32px] max-w-6xl w-full h-[90vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-2xl font-bold">{editingCombo ? 'Sửa Combo' : 'Tạo Combo mới'}</h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-100 rounded-xl"><X size={20} /></button>
            </div>
            <div className="p-6 overflow-y-auto flex-1 bg-slate-50/50">
              <form id="combo-form" onSubmit={handleSubmit} className="grid grid-cols-12 gap-8">
                
                {/* Cột trái: Thông tin cơ bản */}
                <div className="col-span-12 lg:col-span-4 space-y-4">
                  <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <AlertCircle size={18} className="text-blue-600"/> Thông tin chung
                  </h3>
                  <div>
                    <label className="block text-sm font-medium mb-1">Tên Combo *</label>
                    <input name="name" value={formData.name} onChange={handleInputChange} required className="w-full p-3 border rounded-xl" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Danh mục Combo *</label>
                    <select name="category_id" value={formData.category_id} onChange={handleInputChange} required className="w-full p-3 border rounded-xl">
                      <option value="">Chọn danh mục</option>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Mô tả</label>
                    <textarea name="description" value={formData.description} onChange={handleInputChange} rows="3" className="w-full p-3 border rounded-xl" />
                  </div>
                  <div className="p-4 bg-orange-50 rounded-2xl border border-orange-100">
                    <label className="block text-sm font-bold text-orange-800 mb-1">Giá bán Combo *</label>
                    <input type="number" name="price" value={formData.price} onChange={handleInputChange} required className="w-full p-3 border rounded-xl text-orange-600 font-black text-xl" />
                    {formData.combo_items.length > 0 && (
                      <div className="flex items-center gap-2 mt-2 text-xs font-bold text-green-700">
                        <Check size={14}/> Gợi ý giá gốc: {formatCurrency(calcSuggestedPrice())}
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Tồn kho chung *</label>
                    <input type="number" name="stock_quantity" value={formData.stock_quantity} onChange={handleInputChange} required className="w-full p-3 border rounded-xl" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Hình ảnh URL</label>
                    <input type="url" name="image_url" value={formData.image_url} onChange={handleInputChange} className="w-full p-3 border rounded-xl" />
                  </div>
                </div>

                {/* Cột phải: Thêm sản phẩm thành phần */}
                <div className="col-span-12 lg:col-span-8 bg-white p-6 rounded-[24px] border shadow-sm flex flex-col space-y-6">
                  <h3 className="font-bold text-lg flex items-center gap-2">
                    <Plus size={20} className="text-blue-600" /> Thành phần trong Combo
                  </h3>
                  
                  {/* Bộ lọc và Tìm kiếm thành phần */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="relative">
                       <Filter className="absolute left-3 top-3.5 text-slate-400" size={18} />
                       <select 
                         value={selectedPartCategoryId}
                         onChange={(e) => setSelectedPartCategoryId(e.target.value)}
                         className="w-full pl-10 pr-4 py-3 bg-slate-50 border-none rounded-xl outline-none text-sm font-medium"
                       >
                         <option value="">Lọc theo Danh mục sản phẩm</option>
                         {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                       </select>
                    </div>

                    <div className="relative">
                      <SearchIcon className="absolute left-3 top-3.5 text-slate-400" size={18} />
                      <input 
                        type="text" 
                        placeholder="Tìm theo tên sản phẩm..." 
                        value={searchPartQuery} 
                        onChange={e => setSearchPartQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border-none rounded-xl outline-none text-sm"
                      />
                    </div>
                  </div>

                  {/* Vùng chọn sản phẩm nhanh (Grid/List) */}
                  <div className="bg-slate-50 rounded-2xl p-4 border-2 border-dashed border-slate-200">
                    <p className="text-xs font-black text-slate-400 uppercase mb-3 tracking-widest">Sản phẩm khả dụng</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-48 overflow-y-auto pr-2">
                       {isSearchingPart ? (
                         <div className="col-span-2 text-center py-4"><Loader className="animate-spin mx-auto text-blue-600"/></div>
                       ) : searchPartResults.length > 0 ? (
                         searchPartResults.map(p => (
                            <div 
                              key={p.id} 
                              onClick={() => addPartToCombo(p)}
                              className="flex items-center justify-between p-2 bg-white border rounded-xl hover:border-blue-500 hover:bg-blue-50 cursor-pointer transition-all group"
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <img src={p.image_url || 'https://via.placeholder.com/40'} className="w-8 h-8 object-cover rounded-lg shadow-sm" alt=""/>
                                <div className="min-w-0">
                                  <p className="font-bold text-[13px] truncate">{p.name}</p>
                                  <p className="text-[11px] text-orange-600 font-bold">{formatCurrency(p.price)}</p>
                                </div>
                              </div>
                              <Plus size={16} className="text-blue-500 group-hover:scale-125 transition-transform mr-1"/>
                            </div>
                         ))
                       ) : (
                         <p className="col-span-2 text-center py-4 text-sm text-slate-400 italic">
                            {selectedPartCategoryId || searchPartQuery ? 'Không tìm thấy sản phẩm' : 'Chọn danh mục hoặc tìm tên sản phẩm để bắt đầu'}
                         </p>
                       )}
                    </div>
                  </div>

                  {/* Danh sách thành phần đã chọn */}
                  <div className="flex-1 space-y-3">
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Đã chọn ({formData.combo_items.length})</p>
                    <div className="max-h-60 overflow-y-auto pr-2 space-y-3">
                      {formData.combo_items.map((item, index) => (
                        <div key={index} className="flex items-center gap-4 bg-white p-4 rounded-2xl border shadow-sm">
                          <img src={item.image_url || 'https://via.placeholder.com/50'} className="w-12 h-12 object-cover rounded-xl shadow-sm" alt=""/>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-sm truncate">{item.name}</p>
                            <p className="text-xs text-orange-600 font-bold">{formatCurrency(item.price)}</p>
                          </div>
                          <div className="flex items-center bg-slate-50 border rounded-xl overflow-hidden">
                            <button type="button" onClick={() => updateItemQuantity(item.part_id, item.quantity - 1)} className="px-3 py-1 hover:bg-slate-200 transition-colors">-</button>
                            <span className="w-8 text-center text-sm font-black">{item.quantity}</span>
                            <button type="button" onClick={() => updateItemQuantity(item.part_id, item.quantity + 1)} className="px-3 py-1 hover:bg-slate-200 transition-colors">+</button>
                          </div>
                          <button type="button" onClick={() => removePartFromCombo(item.part_id)} className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors"><Trash2 size={18}/></button>
                        </div>
                      ))}
                      {formData.combo_items.length === 0 && (
                        <div className="text-center py-10 border-2 border-dashed rounded-3xl">
                           <PackageOpen size={48} className="mx-auto text-slate-200 mb-2"/>
                           <p className="text-sm text-slate-400">Chưa có thành phần nào.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </form>
            </div>
            <div className="p-6 border-t flex justify-end gap-3 bg-white">
              <button type="button" onClick={() => setShowModal(false)} className="px-6 py-3 bg-slate-100 font-bold rounded-xl hover:bg-slate-200 transition-colors">Hủy</button>
              <button type="submit" form="combo-form" disabled={loading} className="px-8 py-3 bg-blue-600 text-white font-black rounded-xl hover:bg-slate-900 shadow-lg shadow-blue-100 transition-all">
                {editingCombo ? 'LƯU THAY ĐỔI' : 'TẠO COMBO MỚI'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Combos;