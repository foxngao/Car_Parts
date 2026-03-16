import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Upload, X, Search, ImageIcon, Loader2, FileImage } from 'lucide-react';
import productApi from '../../api/productApi';
import toast from 'react-hot-toast';

const ImageSearch = ({ onSearchStart, onSearchResults }) => {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleFile = (file) => {
    if (!file) return;
    
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      toast.error('Chỉ chấp nhận file ảnh (JPEG, PNG, WebP, GIF)');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File quá lớn. Tối đa 5MB');
      return;
    }

    setImage(file);
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target.result);
    reader.readAsDataURL(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer?.files[0];
    if (file) handleFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const clearImage = () => {
    setImage(null);
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSearch = async () => {
    if (!image) {
      toast.error('Vui lòng upload ảnh');
      return;
    }

    setLoading(true);
    if (onSearchStart) onSearchStart();
    try {
      const formData = new FormData();
      if (image) formData.append('image', image);

      const res = await productApi.searchByImage(formData);
      const parts = res.data.data.parts || [];
      
      if (parts.length === 0) {
        toast('Không tìm thấy sản phẩm phù hợp\nThử mô tả chi tiết hơn', { icon: '🔍' });
      } else {
        toast.success(`Tìm thấy ${parts.length} sản phẩm theo ảnh`);
      }
      
      if (onSearchResults) onSearchResults(parts);
    } catch (err) {
      const msg = err.response?.data?.message || 'Lỗi tìm kiếm';
      toast.error(msg);
      if (onSearchResults) onSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-[24px] p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Upload Area */}
          <div className="flex-1">
            {!preview ? (
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                  isDragging 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-slate-200 hover:border-blue-400 hover:bg-blue-50/50'
                }`}
              >
                <div className="flex flex-col items-center gap-2">
                  <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center">
                    <Camera className="text-blue-600" size={28} />
                  </div>
                  <p className="font-bold text-slate-700">Kéo thả ảnh hoặc click để chọn</p>
                  <p className="text-xs text-slate-400">JPEG, PNG, WebP, GIF • Tối đa 5MB</p>
                </div>
              </div>
            ) : (
              <div className="relative rounded-2xl overflow-hidden bg-slate-100">
                <img src={preview} alt="Preview" className="w-full h-40 object-contain" />
                <button
                  onClick={clearImage}
                  className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  <X size={16} />
                </button>
                <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/60 text-white text-xs rounded-lg flex items-center gap-1">
                  <FileImage size={12} />
                  {image?.name}
                </div>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => handleFile(e.target.files[0])}
              className="hidden"
            />
          </div>

          {/* Search Button */}
          <div className="flex-1 flex flex-col justify-center">
            <button
              onClick={handleSearch}
              disabled={loading || !image}
              className="bg-blue-600 hover:bg-orange-500 text-white w-full h-full min-h-[160px] rounded-[24px] font-bold transition-all flex flex-col items-center justify-center gap-4 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-xl hover:-translate-y-1"
            >
              <div className="bg-white/20 p-4 rounded-full backdrop-blur-sm">
                {loading ? <Loader2 className="animate-spin text-white" size={32} /> : <Search className="text-white" size={32} />}
              </div>
              <span className="text-xl tracking-wide">TÌM KIẾM BẰNG HÌNH ẢNH</span>
            </button>
          </div>
        </div>
      </div>

      {/* Quick tips */}
      <div className="text-xs text-slate-400 text-center">
        ✨ Mẹo: Phân tích ảnh bằng AI đang được kích hoạt. Không cần nhập mô tả nếu hình ảnh rõ ràng.
      </div>
    </div>
  );
};

export default ImageSearch;
