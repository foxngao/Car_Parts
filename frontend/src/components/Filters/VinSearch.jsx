import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Hash, Search, AlertCircle, CheckCircle, Car, Calendar, Loader2 } from 'lucide-react';
import productApi from '../../api/productApi';
import toast from 'react-hot-toast';

const VinSearch = ({ onResults }) => {
  const [vin, setVin] = useState('');
  const [loading, setLoading] = useState(false);
  const [decodeResult, setDecodeResult] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const isValidVin = (v) => /^[A-HJ-NPR-Z0-9]{17}$/i.test(v);

  const handleDecode = async () => {
    const cleanVin = vin.trim().toUpperCase();
    if (!cleanVin) {
      setError('Vui lòng nhập số VIN');
      return;
    }
    if (!isValidVin(cleanVin)) {
      setError('VIN phải có đúng 17 ký tự (chữ và số, không chứa I, O, Q)');
      return;
    }

    setError('');
    setLoading(true);
    setDecodeResult(null);
    try {
      const res = await productApi.decodeVin(cleanVin);
      setDecodeResult(res.data.data);
    } catch (err) {
      const msg = err.response?.data?.message || 'Không thể giải mã VIN';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchParts = () => {
    if (decodeResult) {
      navigate(`/search?vin=${vin.trim().toUpperCase()}`);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleDecode();
  };

  return (
    <div className="space-y-4">
      {/* VIN Input */}
      <div className="bg-white rounded-[24px] p-4">
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="flex-1 relative">
            <Hash className="absolute left-4 top-3.5 text-blue-600" size={20} />
            <input
              type="text"
              value={vin}
              onChange={(e) => {
                const val = e.target.value.toUpperCase().replace(/\s/g, '');
                if (val.length <= 17) {
                  setVin(val);
                  setError('');
                  setDecodeResult(null);
                }
              }}
              onKeyDown={handleKeyDown}
              placeholder="Nhập số VIN (17 ký tự)..."
              maxLength={17}
              className="w-full pl-12 pr-16 py-3 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-mono text-lg tracking-widest uppercase"
            />
            <span className={`absolute right-4 top-3.5 text-sm font-bold tabular-nums ${vin.length === 17 ? 'text-green-500' : 'text-slate-400'}`}>
              {vin.length}/17
            </span>
          </div>
          <button
            onClick={handleDecode}
            disabled={vin.length !== 17 || loading}
            className="bg-blue-600 hover:bg-orange-500 text-white px-8 py-3 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : <Search size={20} />}
            TRA CỨU VIN
          </button>
        </div>

        {/* Progress dots */}
        {vin.length > 0 && vin.length < 17 && (
          <div className="mt-3 flex gap-1">
            {Array.from({ length: 17 }).map((_, i) => (
              <div
                key={i}
                className={`h-1 flex-1 rounded-full transition-all ${i < vin.length ? 'bg-blue-500' : 'bg-slate-200'}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 text-red-500 bg-red-50 p-3 rounded-xl text-sm">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {/* Decode Result */}
      {decodeResult && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-green-100">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle className="text-green-500" size={20} />
            <h3 className="font-bold text-green-700">Giải mã VIN thành công!</h3>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl">
              <Car className="text-blue-600" size={20} />
              <div>
                <p className="text-xs text-slate-400">Hãng xe</p>
                <p className="font-bold text-slate-800">{decodeResult.brand?.name || 'N/A'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-xl">
              <Calendar className="text-purple-600" size={20} />
              <div>
                <p className="text-xs text-slate-400">Năm sản xuất</p>
                <p className="font-bold text-slate-800">{decodeResult.year || 'Không xác định'}</p>
              </div>
            </div>
          </div>

          {decodeResult.matched_model_years?.length > 0 && (
            <div className="mb-4 p-3 bg-slate-50 rounded-xl">
              <p className="text-sm text-slate-500 mb-2">Dòng xe phù hợp:</p>
              <div className="flex flex-wrap gap-2">
                {decodeResult.matched_model_years.map(my => (
                  <span key={my.id} className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-sm font-medium">
                    {my.model_name} ({my.year})
                  </span>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={handleSearchParts}
            className="w-full bg-slate-900 hover:bg-blue-600 text-white py-3 rounded-2xl font-bold transition-colors flex items-center justify-center gap-2"
          >
            <Search size={18} />
            TÌM PHỤ TÙNG TƯƠNG THÍCH
          </button>
        </div>
      )}

      {/* Info */}
      <div className="text-xs text-slate-400 text-center">
        💡 Số VIN (Vehicle Identification Number) gồm 17 ký tự, thường nằm ở kính chắn gió hoặc tem khung xe
      </div>
    </div>
  );
};

export default VinSearch;
