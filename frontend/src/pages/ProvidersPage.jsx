import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Search, MapPin, Star, Briefcase, ChevronRight, SlidersHorizontal, User, Sparkles, Award } from 'lucide-react';
import api from '../services/api';
import Loader from '../components/common/Loader';

const ProvidersPage = () => {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ skill: '', city: '' });
  const { user } = useSelector(state => state.auth);

  useEffect(() => {
    fetchProviders();
  }, [filter]);

  const fetchProviders = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/auth/providers', { params: filter });
      setProviders(data.data);
    } catch (error) {
      console.error('Error fetching providers:', error);
    } finally {
      setLoading(false);
    }
  };

  const skills = [
    'Plumbing', 'Electrical', 'Cleaning', 'AC Repair', 'Painting', 
    'Salon at Home', 'Pest Control', 'Appliance Repair', 'Massage Therapy', 
    'Home Automation', 'Carpentry'
  ];

  return (
    <div className="fade-in" style={{ paddingBottom: 120 }}>
      {/* ── HEADER HERO ────────────────────────────────────────── */}
      <section style={{ 
        background: 'var(--bg-card)', 
        padding: '6rem 0 4rem', 
        borderBottom: '1px solid var(--border-subtle)',
        marginBottom: '4rem',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ position:'absolute', top:0, left:0, right:0, height:1, background:'var(--brand-grad)', opacity:0.3 }} />
        
        <div className="container">
          <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
            <div style={{ display:'inline-flex', padding:'0.5rem 1.25rem', borderRadius:99, background:'var(--accent-soft)', color:'var(--accent)', fontSize:'0.75rem', fontWeight:800, marginBottom:24, border:'1px solid var(--border-accent)', letterSpacing:'0.1em' }}>
              <Sparkles size={16} style={{ marginRight:8 }} /> ELITE NETWORK
            </div>
            <h1 style={{ fontSize: 'clamp(2.5rem, 6vw, 4rem)', marginBottom: '1.5rem' }}>
              Our Expert <span className="gradient-text">Artisans.</span>
            </h1>
            <p style={{ color:'var(--text-dim)', fontSize:'1.1rem', maxWidth:600, margin:'0 auto 4rem', lineHeight:1.7 }}>
              Connect with India's most highly-rated service professionals, background-verified for your peace of mind.
            </p>

            {/* Filter Toolbar */}
            <div className="glass-card" style={{ padding:'2rem', display:'grid', gridTemplateColumns:'1.5fr 1fr', gap:24, alignItems:'center' }} className="grid-mobile-stack">
              <div style={{ display:'flex', flexWrap:'wrap', gap:10, justifyContent:'center' }}>
                <button 
                  onClick={() => setFilter({ ...filter, skill: '' })}
                  className="btn"
                  style={{ 
                    padding: '0.6rem 1.5rem', borderRadius: 12, fontSize: '0.8rem', fontWeight: 800,
                    background: !filter.skill ? 'var(--accent)' : 'var(--bg-elevated)',
                    color: !filter.skill ? 'var(--primary)' : 'var(--text-dim)',
                    border: '1px solid ' + (!filter.skill ? 'transparent' : 'var(--border-rich)'),
                  }}
                >
                  All Skills
                </button>
                {skills.map(skill => (
                  <button 
                    key={skill}
                    onClick={() => setFilter({ ...filter, skill })}
                    className="btn"
                    style={{ 
                      padding: '0.6rem 1.5rem', borderRadius: 12, fontSize: '0.8rem', fontWeight: 800,
                      background: filter.skill === skill ? 'var(--accent)' : 'var(--bg-elevated)',
                      color: filter.skill === skill ? 'var(--primary)' : 'var(--text-dim)',
                      border: '1px solid ' + (filter.skill === skill ? 'transparent' : 'var(--border-rich)'),
                    }}
                  >
                    {skill}
                  </button>
                ))}
              </div>
              <div style={{ position:'relative' }}>
                 <MapPin size={20} style={{ position:'absolute', left:16, top:'50%', transform:'translateY(-50%)', color:'var(--text-muted)' }} />
                 <input 
                  type="text" 
                  placeholder="Filter by city..." 
                  className="input-field"
                  style={{ paddingLeft:48, height:56, marginBottom:0, background:'var(--bg-deep)' }}
                  value={filter.city}
                  onChange={e => setFilter({ ...filter, city: e.target.value })}
                 />
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container">
        {/* Results Grid */}
        {loading ? <div style={{ padding:'10rem 0' }}><Loader /></div> : (
          <div className="grid-auto">
            {providers.length === 0 ? (
              <div className="glass-card" style={{ gridColumn:'1/-1', padding:'10rem 2rem', textAlign:'center' }}>
                <Search size={64} style={{ opacity:0.1, marginBottom:24 }} />
                <h3 style={{ fontSize:'1.5rem', color:'white' }}>No experts found</h3>
                <p style={{ color:'var(--text-muted)' }}>Try adjusting your filters or checking a different city.</p>
              </div>
            ) : providers.map(p => (
              <div key={p._id} className="glass-card reveal-up" style={{ padding:'2.5rem', display:'flex', flexDirection:'column', height:'100%' }}>
                <div style={{ display:'flex', alignItems:'center', gap:20, marginBottom:24 }}>
                  <div style={{ width:80, height:80, borderRadius:20, background:'var(--bg-elevated)', border:'1px solid var(--border-rich)', display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden', flexShrink:0 }}>
                    {p.avatar ? <img src={p.avatar} alt={p.name} style={{ width:'100%', height:'100%', objectFit:'cover' }} /> : <User size={36} className="text-dim" />}
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
                      <h3 style={{ fontSize:'1.25rem', fontWeight:800, color:'white' }}>{p.name}</h3>
                      {p.providerProfile?.isVerified && <Award size={16} className="text-accent" />}
                    </div>
                    <div style={{ display:'flex', alignItems:'center', gap:6, color:'var(--accent)', fontWeight:800, fontSize:'0.85rem' }}>
                      <Star size={14} fill="var(--accent)" color="var(--accent)" /> {p.providerProfile?.rating || '5.0'} 
                      <span style={{ color:'var(--text-muted)', fontWeight:600, marginLeft:4 }}>({p.providerProfile?.completedJobs || 0} jobs)</span>
                    </div>
                  </div>
                </div>

                {p.providerProfile?.isOnline && (
                   <div style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'0.4rem 0.8rem', borderRadius:8, background:'rgba(16,185,129,0.1)', color:'var(--success)', fontSize:'0.65rem', fontWeight:900, marginBottom:24, width:'fit-content', border:'1px solid rgba(16,185,129,0.2)' }}>
                      <div className="pulse" style={{ width:8, height:8, borderRadius:99, background:'var(--success)' }} />
                      ACTIVE NOW
                   </div>
                )}

                <div style={{ display:'grid', gap:12, marginBottom:32 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:12, color:'var(--text-dim)', fontSize:'0.9rem' }}>
                    <Briefcase size={16} className="text-accent" />
                    <span>{p.providerProfile?.experience || 0} Years Experience</span>
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:12, color:'var(--text-dim)', fontSize:'0.9rem' }}>
                    <MapPin size={16} className="text-accent" />
                    <span>{p.address?.city || 'Pan India Operations'}</span>
                  </div>
                </div>

                <div style={{ display:'flex', flexWrap:'wrap', gap:8, marginBottom:'auto', paddingBottom:32 }}>
                  {(p.providerProfile?.skills || []).slice(0, 3).map(skill => (
                    <span key={skill} style={{ padding:'0.4rem 0.8rem', borderRadius:8, background:'var(--bg-elevated)', border:'1px solid var(--border-rich)', fontSize:'0.7rem', color:'var(--text-dim)', fontWeight:700 }}>
                      {skill}
                    </span>
                  ))}
                  {p.providerProfile?.skills?.length > 3 && (
                    <span style={{ fontSize:'0.7rem', color:'var(--text-muted)', alignSelf:'center', fontWeight:700 }}>+{p.providerProfile.skills.length - 3} more</span>
                  )}
                </div>

                <Link 
                  to={`/providers/${p._id}`}
                  className="btn btn-outline"
                  style={{ width:'100%', borderRadius:14, justifyContent:'center', gap:8 }}
                >
                  View Profile <ChevronRight size={18} />
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProvidersPage;
