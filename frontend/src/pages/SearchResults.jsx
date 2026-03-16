import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import ProductCard from '../components/common/ProductCard';
import VinSearch from '../components/Filters/VinSearch';
import ImageSearch from '../components/Filters/ImageSearch';
import productApi from '../api/productApi';
import searchHistoryApi from '../api/searchHistoryApi';
import { Search, Filter, X, SlidersHorizontal, Hash, Camera, Tag, Car, Calendar, DollarSign, ArrowUpDown, Clock } from 'lucide-react';

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [parts, setParts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('keyword');
  const [pagination, setPagination] = useState({
    page: 1, limit: 12, total: 0, totalPages: 0,
  });

  // Filters
  const [filters, setFilters] = useState({
    keyword: searchParams.get('keyword') || '',
    model_year_id: searchParams.get('model_year_id') || '',
    category_id: '',
    min_price: '',
    max_price: '',
    brand_id: '',
    year: '',
    sort_by: 'name',
    sort_order: 'asc',
    page: 1,
    limit: 12,
  });

  // VIN search
  const vinParam = searchParams.get('vin');
  const [vinParts, setVinParts] = useState([]);
  const [vinDecoded, setVinDecoded] = useState(null);
  const [vinLoading, setVinLoading] = useState(false);

  // Image search
  const [imageParts, setImageParts] = useState([]);
  const [imageLoading, setImageLoading] = useState(false);

  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Recent searches state
  const [recentSearches, setRecentSearches] = useState([]);
  const [showRecentSearches, setShowRecentSearches] = useState(false);
  const searchInputRef = useRef(null);

  // Outside click handler for recent searches dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchInputRef.current && !searchInputRef.current.contains(event.target)) {
        setShowRecentSearches(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchRecentSearches = async () => {
    if (!isAuthenticated) return;
    try {
      const res = await searchHistoryApi.getHistory({ search_type: 'keyword', limit: 5 });
      setRecentSearches(res.data.data);
    } catch (error) {
      console.error('Failed to fetch recent searches', error);
    }
  };

  const handleInputFocus = () => {
    setShowRecentSearches(true);
    fetchRecentSearches();
  };

  const handleRecentSearchSelect = (query) => {
    handleFilterChange('keyword', query);
    setShowRecentSearches(false);
  };

  useEffect(() => {
    fetchCategories();
    fetchBrands();
  }, []);

  useEffect(() => {
    if (vinParam) {
      setActiveTab('vin');
      searchVinParts(vinParam);
    }
  }, [vinParam]);

  useEffect(() => {
    if (activeTab === 'keyword') {
      fetchParts();
    }
  }, [filters, activeTab]);

  const fetchCategories = async () => {
    try {
      const res = await productApi.getCategories();
      setCategories(res.data.data);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const fetchBrands = async () => {
    try {
      const res = await productApi.getBrands();
      setBrands(res.data.data);
    } catch (error) {
      console.error('Failed to fetch brands:', error);
    }
  };

  const fetchParts = async () => {
    setLoading(true);
    try {
      const params = Object.fromEntries(
        Object.entries(filters).filter(([_, v]) => v !== '')
      );
      const res = await productApi.search(params);
      setParts(res.data.data);
      setPagination(res.data.pagination);

      if (isAuthenticated && filters.keyword) {
        try {
          await searchHistoryApi.save({
            search_type: 'keyword',
            query: filters.keyword,
            filters: { category_id: filters.category_id, min_price: filters.min_price, max_price: filters.max_price, brand_id: filters.brand_id, year: filters.year },
            results_count: res.data.pagination.total
          });
        } catch {}
      }
    } catch (error) {
      console.error('Failed to fetch parts:', error);
    } finally {
      setLoading(false);
    }
  };

  const searchVinParts = async (vin) => {
    setVinLoading(true);
    try {
      const res = await productApi.searchByVin(vin);
      setVinParts(res.data.data.parts || []);
      setVinDecoded(res.data.data.decoded);

      if (isAuthenticated) {
        try {
          await searchHistoryApi.save({
            search_type: 'vin',
            query: vin,
            results_count: res.data.data.parts?.length || 0
          });
        } catch {}
      }
    } catch (error) {
      console.error('VIN search error:', error);
    } finally {
      setVinLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const clearFilters = () => {
    setFilters({
      keyword: '', model_year_id: '', category_id: '',
      min_price: '', max_price: '', brand_id: '', year: '',
      sort_by: 'name', sort_order: 'asc', page: 1, limit: 12,
    });
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSortChange = (value) => {
    const [sort_by, sort_order] = value.split('_');
    setFilters(prev => ({ ...prev, sort_by: sort_by || 'name', sort_order: sort_order || 'asc', page: 1 }));
  };

  const hasActiveFilters = filters.keyword || filters.model_year_id || filters.category_id || filters.min_price || filters.max_price || filters.brand_id || filters.year;

  const currentParts = activeTab === 'vin' ? vinParts : activeTab === 'image' ? imageParts : parts;
  const currentLoading = activeTab === 'vin' ? vinLoading : activeTab === 'image' ? imageLoading : loading;

  const years = [];
  for (let y = 2030; y >= 2018; y--) years.push(y);

  const tabs = [
    { id: 'keyword', label: 'Từ khóa', icon: Search },
    { id: 'vin', label: 'Tra cứu VIN', icon: Hash },
    { id: 'image', label: 'Tìm bằng ảnh', icon: Camera },
  ];

  return (
    <div className="min-h-screen bg-slate-50 pt-32 pb-20 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-black text-slate-900 mb-2">TÌM KIẾM PHỤ TÙNG</h1>
          <p className="text-slate-500">
            Tìm kiếm theo từ khóa, mã VIN, hoặc hình ảnh phụ tùng
          </p>
        </div>

        {/* Search Tabs */}
        <div className="flex gap-2 mb-6">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                    : 'bg-white text-slate-600 border border-slate-200 hover:border-blue-300 hover:text-blue-600'
                }`}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        {activeTab === 'vin' && (
          <div className="mb-8">
            <VinSearch />
          </div>
        )}

        {activeTab === 'image' && (
          <div className="mb-8">
            <ImageSearch
              onSearchStart={() => setImageLoading(true)}
              onSearchResults={(results) => {
                setImageParts(results);
                setImageLoading(false);
              }}
            />
          </div>
        )}

        {activeTab === 'keyword' && (
          <>
            {/* Filters */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 mb-8">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <Filter size={20} className="text-blue-600" />
                  <h2 className="font-bold text-slate-800">Bộ lọc</h2>
                  {hasActiveFilters && (
                    <button onClick={clearFilters} className="text-sm text-red-500 flex items-center gap-1 hover:text-red-600">
                      <X size={16} /> Xóa bộ lọc
                    </button>
                  )}
                </div>
                <button
                  onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    showAdvancedFilters ? 'bg-blue-50 text-blue-600' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <SlidersHorizontal size={16} />
                  Bộ lọc nâng cao
                </button>
              </div>

              {/* Basic Filters */}
              <div className="grid md:grid-cols-3 gap-4">
                <div className="relative" ref={searchInputRef}>
                  <Search className="absolute left-4 top-3.5 text-slate-400" size={20} />
                  <input
                    type="text"
                    placeholder="Tìm kiếm sản phẩm..."
                    value={filters.keyword}
                    onChange={(e) => handleFilterChange('keyword', e.target.value)}
                    onFocus={handleInputFocus}
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {/* Recent Searches Dropdown */}
                  {showRecentSearches && recentSearches.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-100 shadow-xl rounded-xl z-50 overflow-hidden">
                      <div className="px-4 py-2 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
                        <span className="text-xs font-bold text-slate-500 uppercase">Tìm kiếm gần đây</span>
                      </div>
                      <div className="max-h-64 overflow-y-auto">
                        {recentSearches.map((item) => (
                          <button
                            key={item.id}
                            onClick={() => handleRecentSearchSelect(item.query)}
                            className="w-full text-left px-4 py-3 hover:bg-slate-50 flex items-center gap-3 transition-colors border-b border-slate-50 last:border-0"
                          >
                            <Clock size={16} className="text-slate-400" />
                            <span className="text-slate-700 font-medium truncate">{item.query}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="relative">
                  <Tag className="absolute left-4 top-3.5 text-slate-400" size={20} />
                  <select
                    value={filters.category_id}
                    onChange={(e) => handleFilterChange('category_id', e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                  >
                    <option value="">Tất cả danh mục</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div className="relative">
                  <ArrowUpDown className="absolute left-4 top-3.5 text-slate-400" size={20} />
                  <select
                    value={`${filters.sort_by}_${filters.sort_order}`}
                    onChange={(e) => handleSortChange(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                  >
                    <option value="name_asc">Tên: A → Z</option>
                    <option value="name_desc">Tên: Z → A</option>
                    <option value="price_asc">Giá: Thấp → Cao</option>
                    <option value="price_desc">Giá: Cao → Thấp</option>
                    <option value="created_at_desc">Mới nhất</option>
                  </select>
                </div>
              </div>

              {/* Advanced Filters */}
              {showAdvancedFilters && (
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <div className="grid md:grid-cols-4 gap-4">
                    <div className="relative">
                      <DollarSign className="absolute left-4 top-3.5 text-slate-400" size={20} />
                      <input type="number" placeholder="Giá từ..." value={filters.min_price}
                        onChange={(e) => handleFilterChange('min_price', e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" min="0" />
                    </div>
                    <div className="relative">
                      <DollarSign className="absolute left-4 top-3.5 text-slate-400" size={20} />
                      <input type="number" placeholder="Giá đến..." value={filters.max_price}
                        onChange={(e) => handleFilterChange('max_price', e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" min="0" />
                    </div>
                    <div className="relative">
                      <Car className="absolute left-4 top-3.5 text-slate-400" size={20} />
                      <select value={filters.brand_id} onChange={(e) => handleFilterChange('brand_id', e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 appearance-none">
                        <option value="">Tất cả hãng xe</option>
                        {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
                      </select>
                    </div>
                    <div className="relative">
                      <Calendar className="absolute left-4 top-3.5 text-slate-400" size={20} />
                      <select value={filters.year} onChange={(e) => handleFilterChange('year', e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 appearance-none">
                        <option value="">Tất cả năm</option>
                        {years.map(y => <option key={y} value={y}>{y}</option>)}
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Results Info */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-slate-500">
                {pagination.total > 0
                  ? `Tìm thấy ${pagination.total} sản phẩm phù hợp`
                  : 'Không tìm thấy sản phẩm nào'}
              </p>
            </div>
          </>
        )}

        {/* VIN Results Info */}
        {activeTab === 'vin' && vinDecoded && (
          <div className="bg-blue-50 p-4 rounded-2xl mb-6 flex items-center gap-4 flex-wrap">
            <span className="text-sm text-blue-700">
              <strong>{vinDecoded.brand}</strong> • Năm {vinDecoded.year || 'N/A'}
            </span>
            <span className="text-sm text-blue-600">
              Tìm thấy <strong>{vinParts.length}</strong> phụ tùng tương thích
            </span>
          </div>
        )}

        {/* Results Grid */}
        {currentLoading ? (
          <div className="flex justify-center py-20">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          </div>
        ) : currentParts.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {currentParts.map((part) => (
                <ProductCard key={part.id} part={part} />
              ))}
            </div>

            {/* Pagination (only for keyword tab) */}
            {activeTab === 'keyword' && pagination.totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-12">
                <button onClick={() => handlePageChange(pagination.page - 1)} disabled={pagination.page <= 1}
                  className="w-10 h-10 rounded-xl border border-slate-200 flex items-center justify-center hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-colors disabled:opacity-50">←</button>
                {[...Array(Math.min(pagination.totalPages, 7))].map((_, i) => {
                  let pageNum;
                  if (pagination.totalPages <= 7) pageNum = i + 1;
                  else if (pagination.page <= 4) pageNum = i + 1;
                  else if (pagination.page >= pagination.totalPages - 3) pageNum = pagination.totalPages - 6 + i;
                  else pageNum = pagination.page - 3 + i;
                  return (
                    <button key={pageNum} onClick={() => handlePageChange(pageNum)}
                      className={`w-10 h-10 rounded-xl border ${pagination.page === pageNum ? 'bg-blue-600 text-white border-blue-600' : 'border-slate-200 hover:bg-slate-100'} transition-colors`}>
                      {pageNum}
                    </button>
                  );
                })}
                <button onClick={() => handlePageChange(pagination.page + 1)} disabled={pagination.page >= pagination.totalPages}
                  className="w-10 h-10 rounded-xl border border-slate-200 flex items-center justify-center hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-colors disabled:opacity-50">→</button>
              </div>
            )}
          </>
        ) : (
          activeTab !== 'image' && (
            <div className="text-center py-20">
              <div className="text-slate-300 text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-bold text-slate-700 mb-2">Không tìm thấy sản phẩm</h3>
              <p className="text-slate-500">Thử tìm kiếm với từ khóa khác hoặc điều chỉnh bộ lọc</p>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default SearchResults;