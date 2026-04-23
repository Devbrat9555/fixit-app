import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchFeaturedServices } from '../redux/slices/servicesSlice';
import ServiceCard from '../components/services/ServiceCard';
import Loader from '../components/common/Loader';
import api from '../services/api';
import { Search, ArrowRight, Star, Shield, Clock, Zap, CheckCircle, Award, Users, Briefcase, TrendingUp, ChevronRight, Sparkles, MapPin } from 'lucide-react';

const HomePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { featuredServices, isLoading } = useSelector(s => s.services);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    dispatch(fetchFeaturedServices());
    api.get('/categories').then(r => setCategories(r.data.data)).catch(() => {});
  }, [dispatch]);

  const handleSearch = e => { e.preventDefault(); navigate(`/services?search=${search}`); };

  return (
    <div className="fade-in">
      {/* ── HERO SECTION ────────────────────────────────────────── */}
      <section style={{ 
        position: 'relative', 
        minHeight: '90vh', 
        display: 'flex', 
        alignItems: 'center', 
        overflow: 'hidden',
        background: 'radial-gradient(circle at 80% 20%, rgba(250, 204, 21, 0.05) 0%, transparent 40%)'
      }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '4rem', alignItems: 'center' }} className="grid-mobile-stack">
            <div className="reveal-up">
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '0.5rem 1.25rem', borderRadius: 99, background: 'var(--accent-soft)', border: '1px solid var(--border-accent)', marginBottom: '2rem' }}>
                <Sparkles size={16} className="text-accent" />
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--accent)', letterSpacing: '0.1em' }}>INDIA'S MOST TRUSTED PLATFORM</span>
              </div>
              
              <h1 style={{ fontSize: 'clamp(3rem, 7vw, 5.5rem)', marginBottom: '1.5rem' }}>
                Elevate Your <br />
                <span className="gradient-text">Living Space.</span>
              </h1>
              
              <p style={{ fontSize: '1.2rem', color: 'var(--text-dim)', marginBottom: '3rem', maxWidth: '600px', fontWeight: 500 }}>
                Experience luxury home services with verified professionals. From meticulous deep cleaning to expert repairs, we redefine excellence.
              </p>

              <form onSubmit={handleSearch} style={{ display: 'flex', gap: 12, marginBottom: '3rem', maxWidth: '540px' }}>
                <div style={{ position: 'relative', flex: 1 }}>
                  <Search size={20} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type="text"
                    placeholder="Search for 'Deep Cleaning', 'Electrician'..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="input-field"
                    style={{ paddingLeft: 52, height: 64, fontSize: '1rem', border: '1px solid var(--border-rich)', background: 'rgba(255,255,255,0.02)' }}
                  />
                </div>
                <button type="submit" className="btn btn-primary" style={{ padding: '0 2.5rem', height: 64 }}>Search</button>
              </form>

              <div style={{ display: 'flex', gap: '3rem', flexWrap: 'wrap' }}>
                <div>
                  <h3 style={{ fontSize: '2rem', color: 'white' }}>50k+</h3>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, marginTop: 4 }}>Happy Clients</p>
                </div>
                <div>
                  <h3 style={{ fontSize: '2rem', color: 'white' }}>5k+</h3>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, marginTop: 4 }}>Elite Experts</p>
                </div>
                <div>
                  <h3 style={{ fontSize: '2rem', color: 'white' }}>4.9★</h3>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, marginTop: 4 }}>Service Rating</p>
                </div>
              </div>
            </div>

            <div className="hide-mobile reveal-up" style={{ animationDelay: '0.2s' }}>
              <div style={{ position: 'relative' }}>
                <div style={{ 
                  borderRadius: '2rem', overflow: 'hidden', 
                  border: '1px solid var(--border-rich)',
                  boxShadow: '0 40px 80px -20px rgba(0,0,0,0.8)',
                  transform: 'perspective(1000px) rotateY(-8deg) rotateX(4deg)'
                }}>
                   <img src="/hero-main.png" style={{ width: '100%', height: 'auto', display: 'block' }} />
                </div>
                <div style={{ position: 'absolute', top: -40, right: -40, width: 200, height: 200, background: 'var(--accent)', filter: 'blur(120px)', opacity: 0.1 }} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CATEGORIES ────────────────────────────────────────── */}
      <section style={{ padding: '8rem 0', background: 'var(--bg-card)' }}>
        <div className="container">
          <div style={{ marginBottom: '4rem' }}>
            <span style={{ color: 'var(--accent)', fontWeight: 800, fontSize: '0.8rem', letterSpacing: '0.2em' }}>CATEGORIES</span>
            <h2 style={{ fontSize: '3rem', marginTop: '1rem' }}>What are you looking for today?</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '1.5rem' }}>
            {(categories.length > 0 ? categories : [
              { name: 'Electrical', icon: '⚡' }, { name: 'Plumbing', icon: '🔧' }, { name: 'Cleaning', icon: '🧹' },
              { name: 'Painting', icon: '🎨' }, { name: 'Carpentry', icon: '🪚' }, { name: 'Appliances', icon: '❄️' }
            ]).map(cat => (
              <div key={cat._id || cat.name} 
                onClick={() => navigate(`/providers?skill=${cat.name}`)}
                className="glass-card" 
                style={{ padding: '2.5rem 1.5rem', textAlign: 'center', cursor: 'pointer' }}
              >
                <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{cat.icon}</div>
                <h4 style={{ fontSize: '0.9rem', color: 'white' }}>{cat.name}</h4>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED SERVICES ─────────────────────────────────── */}
      <section style={{ padding: '8rem 0' }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '4rem' }}>
            <div>
              <span style={{ color: 'var(--accent)', fontWeight: 800, fontSize: '0.8rem', letterSpacing: '0.2em' }}>EXCLUSIVES</span>
              <h2 style={{ fontSize: '3rem', marginTop: '1rem' }}>Premium Services</h2>
            </div>
            <Link to="/services" className="btn btn-outline" style={{ borderRadius: 99 }}>View Catalogue <ArrowRight size={18} style={{ marginLeft: 8 }} /></Link>
          </div>

          {isLoading ? <Loader /> : (
            <div className="grid-auto">
              {featuredServices.map(s => <ServiceCard key={s._id} service={s} />)}
            </div>
          )}
        </div>
      </section>

      {/* ── WHY FIXIT ─────────────────────────────────────────── */}
      <section style={{ padding: '8rem 0', background: 'var(--bg-deep)', borderTop: '1px solid var(--border-subtle)' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '3rem' }} className="grid-mobile-stack">
            {[
              { icon: Shield, title: 'Verified Excellence', desc: 'Every professional undergoes a multi-step background and skill verification process.' },
              { icon: Zap, title: 'Instant Assignment', desc: 'Advanced algorithms ensure the right expert reaches your door in record time.' },
              { icon: Award, title: 'Premium Standard', desc: 'We only use high-grade materials and equipment for all our services.' }
            ].map((f, i) => (
              <div key={i} className="reveal-up" style={{ animationDelay: `${i * 0.1}s` }}>
                <div style={{ width: 64, height: 64, borderRadius: 16, background: 'var(--accent-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '2rem' }}>
                  <f.icon size={28} className="text-accent" />
                </div>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>{f.title}</h3>
                <p style={{ color: 'var(--text-dim)', fontSize: '1rem' }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA: EXPERT ONBOARDING ──────────────────────────── */}
      <section style={{ padding: '8rem 0' }}>
        <div className="container">
          <div className="glass-card" style={{ 
            padding: '6rem 3rem', 
            background: 'linear-gradient(135deg, rgba(20,20,20,1) 0%, rgba(30,30,30,1) 100%)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'var(--brand-grad)' }} />
            
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:64, alignItems:'center' }} className="grid-mobile-stack">
               <div>
                  <span style={{ color:'var(--accent)', fontWeight:800, fontSize:'0.8rem', letterSpacing:'0.2em' }}>PARTNERSHIP</span>
                  <h2 style={{ fontSize: '3.5rem', marginBottom: '1.5rem', marginTop:12 }}>Join the Elite Expert Network</h2>
                  <p style={{ color: 'var(--text-dim)', fontSize: '1.2rem', marginBottom: '3rem', lineHeight:1.7 }}>
                    Are you a master of your craft? Partner with Fixit to access high-value leads and join India's most prestigious home service network.
                  </p>
                  <div style={{ display: 'flex', gap: 16 }}>
                    <Link to="/register?role=provider" className="btn btn-primary" style={{ padding: '1.25rem 3rem', fontSize: '1.1rem' }}>Register as Expert</Link>
                    <Link to="/become-a-partner" className="btn btn-outline" style={{ padding: '1.25rem 3rem', fontSize: '1.1rem' }}>Learn More</Link>
                  </div>
               </div>

               <div style={{ display:'grid', gap:24 }}>
                  {[
                    { step: '01', title: 'Submit Application', desc: 'Fill out your professional profile and list your certified skills.' },
                    { step: '02', title: 'Get Verified', desc: 'Our team will audit your credentials to ensure elite standards.' },
                    { step: '03', title: 'Start Earning', desc: 'Receive high-paying luxury service requests instantly.' }
                  ].map((s, i) => (
                    <div key={i} style={{ display:'flex', gap:24, padding:24, background:'rgba(255,255,255,0.02)', borderRadius:20, border:'1px solid var(--border-subtle)' }}>
                       <div style={{ fontSize:'2rem', fontWeight:900, color:'var(--accent)', opacity:0.3 }}>{s.step}</div>
                       <div>
                          <h4 style={{ fontSize:'1.1rem', marginBottom:4, color:'white' }}>{s.title}</h4>
                          <p style={{ fontSize:'0.85rem', color:'var(--text-dim)' }}>{s.desc}</p>
                       </div>
                    </div>
                  ))}
               </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
