import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchServices } from '../redux/slices/servicesSlice';
import ServiceCard from '../components/services/ServiceCard';
import Loader from '../components/common/Loader';
import api from '../services/api';
import { Search, Filter, X, ChevronLeft, ChevronRight, SlidersHorizontal, Sparkles, LayoutGrid, MapPin, Grid } from 'lucide-react';

const sortOptions = [
  { value: '', label: 'Featured Ranking' },
  { value: 'rating', label: 'Client Satisfaction' },
  { value: 'popular', label: 'Trending Services' },
  { value: 'price_asc', label: 'Investment: Low to High' },
  { value: 'price_desc', label: 'Investment: High to Low' },
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
    <div className="fade-in" style={{ minHeight: '100vh', paddingBottom: '8rem' }}>
      {/* ── SEARCH HERO ────────────────────────────────────────── */}
      <section style={{ 
        background: 'var(--bg-card)', 
        padding: '6rem 0', 
        borderBottom: '1px solid var(--border-subtle)',
        marginBottom: '4rem',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ position:'absolute', top:0, left:0, right:0, height:1, background:'var(--brand-grad)', opacity:0.3 }} />
        
        <div className="container">
          <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
            <div style={{ display:'inline-flex', padding:'0.5rem 1.25rem', borderRadius:99, background:'var(--accent-soft)', color:'var(--accent)', fontSize:'0.75rem', fontWeight:800, marginBottom:24, border:'1px solid var(--border-accent)', letterSpacing:'0.1em' }}>
              <Sparkles size={16} style={{ marginRight:8 }} /> CURATED CATALOGUE
            </div>
            <h1 style={{ fontSize: 'clamp(2.5rem, 6vw, 4rem)', marginBottom: '2rem' }}>
              Discover <span className="gradient-text">Elite Services.</span>
            </h1>
            
            {/* Search Input */}
            <div style={{ position: 'relative', maxWidth: 700, margin: '0 auto' }}>
              <Search size={24} style={{ position:'absolute', left:24, top:'50%', transform:'translateY(-50%)', color:'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="What masterpiece can we create for your home today?"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="input-field"
                style={{ 
                   height: 72, paddingLeft: 64, fontSize: '1.1rem', borderRadius: 24,
                   background: 'var(--bg-deep)', border: '1px solid var(--border-rich)',
                   boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
                }}
              />
            </div>

            {/* Quick Categories */}
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 12, marginTop: '3rem' }}>
              <button
                onClick={() => handleFilterChange('category', '')}
                style={{ 
                  padding: '0.75rem 1.75rem', borderRadius: 14, fontSize: '0.85rem', fontWeight: 800, cursor: 'pointer',
                  background: !filters.category ? 'var(--accent)' : 'var(--bg-elevated)',
                  color: !filters.category ? 'var(--primary)' : 'var(--text-dim)',
                  border: !filters.category ? 'none' : '1px solid var(--border-rich)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
              >
                All Expertise
              </button>
              {categories.map(cat => (
                <button
                  key={cat._id}
                  onClick={() => handleFilterChange('category', cat._id)}
                  style={{ 
                    padding: '0.75rem 1.75rem', borderRadius: 14, fontSize: '0.85rem', fontWeight: 800, cursor: 'pointer',
                    background: filters.category === cat._id ? 'var(--accent)' : 'var(--bg-elevated)',
                    color: filters.category === cat._id ? 'var(--primary)' : 'var(--text-dim)',
                    border: filters.category === cat._id ? 'none' : '1px solid var(--border-rich)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                  }}
                >
                  <span style={{ marginRight:8 }}>{cat.icon}</span> {cat.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="container">
        {/* ── TOOLBAR ────────────────────────────────────────── */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', marginBottom: '3rem', gap: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width:56, height:56, borderRadius:16, background: 'var(--accent-soft)', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <Grid size={24} className="text-accent" />
            </div>
            <div>
              <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', letterSpacing:'0.1em' }}>SERVICE REPOSITORY</p>
              <h3 style={{ fontSize: '1.75rem', fontWeight: 800 }}>{total} Available</h3>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ position:'relative' }}>
               <select
                 value={filters.sort}
                 onChange={(e) => handleFilterChange('sort', e.target.value)}
                 className="input-field"
                 style={{ width: 240, height: 56, fontSize: '0.9rem', paddingRight:40, background:'var(--bg-card)', border:'1px solid var(--border-rich)', fontWeight:700 }}
               >
                 {sortOptions.map(o => (
                   <option key={o.value} value={o.value}>{o.label}</option>
                 ))}
               </select>
            </div>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="btn btn-outline"
              style={{ 
                height: 56, padding: '0 2rem', borderRadius: 16, 
                borderColor: showFilters ? 'var(--accent)' : 'var(--border-rich)',
                color: showFilters ? 'var(--accent)' : 'white',
                background: showFilters ? 'var(--accent-soft)' : 'transparent',
                gap: 10
              }}
            >
              <SlidersHorizontal size={18} /> Filters
              {hasActiveFilters && <div style={{ width:6, height:6, borderRadius:999, background:'var(--accent)' }} />}
            </button>
          </div>
        </div>

        {/* ── FILTERS PANEL ───────────────────────────────────── */}
        {showFilters && (
          <div className="glass-card reveal-up" style={{ 
            padding: '3rem', marginBottom: '4rem',
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 32
          }}>
             <div>
                <label style={{ fontSize:'0.7rem', fontWeight:800, color:'var(--text-muted)', marginBottom:12, display:'block', letterSpacing:'0.1em' }}>MINIMUM INVESTMENT</label>
                <div style={{ position:'relative' }}>
                   <span style={{ position:'absolute', left:16, top:'50%', transform:'translateY(-50%)', color:'var(--text-muted)', fontWeight:800 }}>₹</span>
                   <input
                     type="number" placeholder="0"
                     value={filters.minPrice}
                     onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                     className="input-field"
                     style={{ paddingLeft:32 }}
                   />
                </div>
              </div>
              <div>
                <label style={{ fontSize:'0.7rem', fontWeight:800, color:'var(--text-muted)', marginBottom:12, display:'block', letterSpacing:'0.1em' }}>MAXIMUM INVESTMENT</label>
                <div style={{ position:'relative' }}>
                   <span style={{ position:'absolute', left:16, top:'50%', transform:'translateY(-50%)', color:'var(--text-muted)', fontWeight:800 }}>₹</span>
                   <input
                     type="number" placeholder="50,000"
                     value={filters.maxPrice}
                     onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                     className="input-field"
                     style={{ paddingLeft:32 }}
                   />
                </div>
              </div>
              <div style={{ display:'flex', alignItems:'flex-end' }}>
                <button 
                  onClick={clearFilters}
                  className="btn btn-outline"
                  style={{ 
                    height: 56, width: '100%', borderRadius: 16, 
                    color: 'var(--error)', border:'1px solid rgba(239,68,68,0.2)',
                    background: 'rgba(239,68,68,0.05)'
                  }}
                >
                  Clear Selection
                </button>
              </div>
          </div>
        )}

        {/* ── RESULTS ────────────────────────────────────────── */}
        {isLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '10rem 0' }}>
            <Loader />
          </div>
        ) : services.length > 0 ? (
          <>
            <div className="grid-auto">
              {services.map((service, index) => (
                <div key={service._id} className="reveal-up" style={{ animationDelay: `${index * 0.05}s` }}>
                  <ServiceCard service={service} />
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 16, marginTop: '6rem' }}>
                <button
                  onClick={() => handleFilterChange('page', filters.page - 1)}
                  disabled={filters.page === 1}
                  className="btn btn-outline"
                  style={{ 
                    width: 56, height: 56, borderRadius: 16, padding:0,
                    opacity: filters.page === 1 ? 0.2 : 1,
                    cursor: filters.page === 1 ? 'not-allowed' : 'pointer'
                  }}
                >
                  <ChevronLeft size={24} />
                </button>
                
                <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-muted)', letterSpacing:'0.1em' }}>
                  PAGE <span style={{ color: 'white' }}>{filters.page}</span> / {totalPages}
                </span>

                <button
                  onClick={() => handleFilterChange('page', filters.page + 1)}
                  disabled={filters.page === totalPages}
                  className="btn btn-outline"
                  style={{ 
                    width: 56, height: 56, borderRadius: 16, padding:0,
                    opacity: filters.page === totalPages ? 0.2 : 1,
                    cursor: filters.page === totalPages ? 'not-allowed' : 'pointer'
                  }}
                >
                  <ChevronRight size={24} />
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="glass-card" style={{ textAlign: 'center', padding: '10rem 2rem' }}>
            <Search size={64} color="var(--text-muted)" style={{ marginBottom: 24, opacity:0.2 }} />
            <h2 style={{ fontSize: '2rem', marginBottom: 12 }}>No Matching Services</h2>
            <p style={{ color: 'var(--text-muted)', maxWidth: 450, margin: '0 auto 40px' }}>We couldn't find any results for your current criteria. Try adjusting your search or clearing filters.</p>
            <button onClick={clearFilters} className="btn btn-primary" style={{ padding: '1rem 3rem' }}>
              Reset All Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ServicesPage;
