import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchServices } from '../redux/slices/servicesSlice';
import ServiceCard from '../components/services/ServiceCard';
import Loader from '../components/common/Loader';
import api from '../services/api';
import { Search, Filter, X, ChevronLeft, ChevronRight, SlidersHorizontal } from 'lucide-react';

const sortOptions = [
  { value: '', label: 'Default' },
  { value: 'rating', label: 'Top Rated' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
];

const ServicesPage = () => {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const { services, isLoading, total, totalPages } = useSelector((state) => state.services);
  const [categories, setCategories] = useState([]);
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    sort: searchParams.get('sort') || '',
    page: Number(searchParams.get('page')) || 1,
  });

  useEffect(() => {
    api.get('/categories').then(res => setCategories(res.data.data)).catch(() => {});
  }, []);

  useEffect(() => {
    const params = {};
    Object.entries(filters).forEach(([k, v]) => { if (v) params[k] = v; });
    dispatch(fetchServices(params));
    setSearchParams(params);
  }, [filters, dispatch]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const clearFilters = () => {
    setFilters({ search: '', category: '', minPrice: '', maxPrice: '', sort: '', page: 1 });
  };

  const hasActiveFilters = filters.search || filters.category || filters.minPrice || filters.maxPrice || filters.sort;

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="container">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            All <span className="gradient-text">Services</span>
          </h1>
          <p className="text-slate-400">{total} services available</p>
        </div>

        {/* Search + Filter Bar */}
        <div className="glass rounded-2xl p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search services..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="input-field pl-9"
              />
            </div>

            {/* Sort */}
            <select
              value={filters.sort}
              onChange={(e) => handleFilterChange('sort', e.target.value)}
              className="input-field md:w-48"
            >
              {sortOptions.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border transition-all ${
                showFilters ? 'border-indigo-500 bg-indigo-500/10 text-indigo-400' : 'border-white/10 text-slate-400 hover:border-indigo-500/50'
              }`}
            >
              <SlidersHorizontal size={16} />
              Filters
              {hasActiveFilters && (
                <span className="w-5 h-5 rounded-full bg-indigo-500 text-white text-xs flex items-center justify-center">!</span>
              )}
            </button>

            {hasActiveFilters && (
              <button onClick={clearFilters} className="flex items-center gap-1 text-sm text-slate-400 hover:text-red-400 transition-colors px-3">
                <X size={14} /> Clear
              </button>
            )}
          </div>

          {/* Expanded Filters */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-white/10 grid grid-cols-1 md:grid-cols-3 gap-4 fade-in">
              {/* Category */}
              <div>
                <label className="text-xs text-slate-400 uppercase tracking-wider mb-2 block">Category</label>
                <select
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="input-field"
                >
                  <option value="">All Categories</option>
                  {categories.map(cat => (
                    <option key={cat._id} value={cat._id}>{cat.icon} {cat.name}</option>
                  ))}
                </select>
              </div>

              {/* Min Price */}
              <div>
                <label className="text-xs text-slate-400 uppercase tracking-wider mb-2 block">Min Price (₹)</label>
                <input
                  type="number"
                  placeholder="0"
                  value={filters.minPrice}
                  onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                  className="input-field"
                />
              </div>

              {/* Max Price */}
              <div>
                <label className="text-xs text-slate-400 uppercase tracking-wider mb-2 block">Max Price (₹)</label>
                <input
                  type="number"
                  placeholder="50000"
                  value={filters.maxPrice}
                  onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                  className="input-field"
                />
              </div>
            </div>
          )}

          {/* Category Pills */}
          {categories.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-white/10">
              <button
                onClick={() => handleFilterChange('category', '')}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  !filters.category ? 'bg-indigo-500 text-white' : 'glass-light text-slate-400 hover:text-white'
                }`}
              >
                All
              </button>
              {categories.map(cat => (
                <button
                  key={cat._id}
                  onClick={() => handleFilterChange('category', cat._id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    filters.category === cat._id ? 'bg-indigo-500 text-white' : 'glass-light text-slate-400 hover:text-white'
                  }`}
                >
                  {cat.icon} {cat.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Services Grid */}
        {isLoading ? (
          <Loader />
        ) : services.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {services.map(service => (
                <ServiceCard key={service._id} service={service} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-3 mt-12">
                <button
                  onClick={() => handleFilterChange('page', filters.page - 1)}
                  disabled={filters.page === 1}
                  className="p-2 rounded-lg glass-light disabled:opacity-30 hover:bg-indigo-500/10 transition-colors"
                >
                  <ChevronLeft size={18} />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => handleFilterChange('page', page)}
                    className={`w-9 h-9 rounded-lg text-sm font-semibold transition-all ${
                      page === filters.page ? 'bg-indigo-500 text-white' : 'glass-light text-slate-400 hover:text-white'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => handleFilterChange('page', filters.page + 1)}
                  disabled={filters.page === totalPages}
                  className="p-2 rounded-lg glass-light disabled:opacity-30 hover:bg-indigo-500/10 transition-colors"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-white mb-2">No services found</h3>
            <p className="text-slate-400 mb-6">Try adjusting your search or filters</p>
            <button onClick={clearFilters} className="btn-primary">
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ServicesPage;
