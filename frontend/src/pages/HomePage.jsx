import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchFeaturedServices } from '../redux/slices/servicesSlice';
import ServiceCard from '../components/services/ServiceCard';
import Loader from '../components/common/Loader';
import api from '../services/api';
import { Search, ArrowRight, Star, Shield, Clock, Zap, CheckCircle, Award, Users, Briefcase, TrendingUp, ChevronRight, MapPin, Phone, Sparkles } from 'lucide-react';

const STATS = [
  { icon: Users,      value: '50K+',  label: 'Happy Customers',    color: '#6366f1' },
  { icon: Briefcase,  value: '5K+',   label: 'Expert Providers',   color: '#a855f7' },
  { icon: CheckCircle,value: '200K+', label: 'Jobs Completed',     color: '#10b981' },
  { icon: Award,      value: '4.8★',  label: 'Average Rating',     color: '#f59e0b' },
];

const FEATURES = [
  { icon: Shield,       title: 'Verified Pros',     desc: 'Background-checked & ID-verified professionals only.', color: '#6366f1' },
  { icon: Clock,        title: 'On-Time Promise',   desc: 'Punctuality guaranteed — your time is precious.',     color: '#a855f7' },
  { icon: Zap,          title: 'Instant Booking',   desc: 'Book any service in under 60 seconds, 24/7.',         color: '#10b981' },
  { icon: Star,         title: 'Quality Assurance', desc: '100% satisfaction guarantee on every service.',       color: '#f59e0b' },
];

const HOW_IT_WORKS = [
  { step: '01', title: 'Choose a Service', desc: 'Browse 50+ home services across 8 categories.' },
  { step: '02', title: 'Pick a Slot',      desc: 'Select a date, time, and enter your address.' },
  { step: '03', title: 'Expert Arrives',   desc: 'Verified professional reaches your door on time.' },
  { step: '04', title: 'Pay & Review',     desc: 'Pay securely and share your honest feedback.' },
];

const TESTIMONIALS = [
  { name: 'Sneha Gupta', role: 'Homeowner, Mumbai', rating: 5, text: 'The electrician fixed our entire wiring issue in 2 hours. Professional, punctual, and clean work!', avatar: 'S' },
  { name: 'Raj Mehta',   role: 'Apartment Owner, Pune', rating: 5, text: 'Booked a deep clean for my 3BHK. The team was thorough and the results were spotless. Highly recommend!', avatar: 'R' },
  { name: 'Anita Das',   role: 'Homemaker, Bangalore', rating: 5, text: 'My AC was fixed within an hour of booking. The app is super easy and service was top-notch.', avatar: 'A' },
];

const StarRating = ({ n }) => (
  <div className="stars">
    {[1,2,3,4,5].map(i => (
      <Star key={i} size={14} style={{ fill: i<=n ? '#fbbf24' : 'transparent', color: i<=n ? '#fbbf24' : 'var(--text-muted)' }} />
    ))}
  </div>
);

const HomePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { featuredServices, isLoading } = useSelector(s => s.services);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [heroVisible, setHeroVisible] = useState(false);

  useEffect(() => {
    dispatch(fetchFeaturedServices());
    api.get('/categories').then(r => setCategories(r.data.data)).catch(() => {});
    const t = setTimeout(() => setHeroVisible(true), 100);
    return () => clearTimeout(t);
  }, [dispatch]);

  const handleSearch = e => { e.preventDefault(); navigate(`/services?search=${search}`); };

  return (
    <div style={{ minHeight: '100vh' }}>
      {/* ── HERO ─────────────────────────────────────────────── */}
      <section className="hero-bg" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', paddingTop: 80, paddingBottom: 60, position: 'relative', overflow: 'hidden' }}>
        {/* Decorative orbs */}
        <div style={{ position:'absolute', top:'15%', left:'5%', width:400, height:400, borderRadius:'50%', background:'rgba(99,102,241,0.06)', filter:'blur(80px)', pointerEvents:'none' }} />
        <div style={{ position:'absolute', bottom:'20%', right:'5%', width:350, height:350, borderRadius:'50%', background:'rgba(168,85,247,0.06)', filter:'blur(80px)', pointerEvents:'none' }} />
        <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', width:800, height:400, borderRadius:'50%', background:'rgba(99,102,241,0.03)', filter:'blur(100px)', pointerEvents:'none' }} />

        <div className="container" style={{ position:'relative', zIndex:1, width:'100%' }}>
          <div style={{ maxWidth:720, margin:'0 auto', textAlign:'center' }}>
            {/* Badge */}
            <div className={heroVisible ? 'fade-in-up' : ''} style={{ animationDelay:'0.1s', display:'inline-flex', alignItems:'center', gap:8, padding:'0.375rem 1rem', borderRadius:999, marginBottom:'1.5rem', background:'rgba(99,102,241,0.1)', border:'1px solid rgba(99,102,241,0.25)' }}>
              <Sparkles size={13} color="var(--brand-400)" />
              <span style={{ fontSize:'0.8rem', fontWeight:600, color:'var(--brand-400)' }}>India's #1 Home Service Platform</span>
            </div>

            {/* Headline */}
            <h1 className={heroVisible ? 'fade-in-up' : ''} style={{
              fontSize: 'clamp(2.5rem, 7vw, 4.5rem)',
              fontWeight: 900,
              lineHeight: 1.1,
              letterSpacing: '-0.03em',
              marginBottom: '1.25rem',
              animationDelay: '0.15s',
            }}>
              Your Home, Our{' '}
              <span className="gradient-text">Expertise.</span>
            </h1>

            <p className={heroVisible ? 'fade-in-up' : ''} style={{ fontSize:'1.1rem', color:'var(--text-secondary)', lineHeight:1.7, marginBottom:'2.5rem', maxWidth:560, margin:'0 auto 2.5rem', animationDelay:'0.2s' }}>
              Book trusted electricians, plumbers, cleaners & 50+ more home services. Verified pros, transparent pricing, hassle-free.
            </p>

            {/* Search */}
            <form className={heroVisible ? 'fade-in-up' : ''} onSubmit={handleSearch} style={{ display:'flex', gap:12, maxWidth:580, margin:'0 auto 2rem', animationDelay:'0.25s' }}>
              <div style={{ position:'relative', flex:1 }}>
                <Search size={17} style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', color:'var(--text-muted)' }} />
                <input
                  type="text"
                  placeholder="What do you need help with?"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="input-field"
                  style={{ paddingLeft:44, paddingTop:'0.9rem', paddingBottom:'0.9rem', fontSize:'0.95rem', borderRadius:'0.75rem' }}
                />
              </div>
              <button type="submit" className="btn btn-primary" style={{ borderRadius:'0.75rem', padding:'0 1.75rem', fontSize:'0.95rem', flexShrink:0 }}>
                Search
              </button>
            </form>

            {/* Quick links */}
            <div className={heroVisible ? 'fade-in-up' : ''} style={{ display:'flex', flexWrap:'wrap', gap:8, justifyContent:'center', animationDelay:'0.3s' }}>
              {['Electrician', 'Plumber', 'Deep Cleaning', 'AC Repair', 'Painter'].map(q => (
                <button key={q} onClick={() => navigate(`/services?search=${q}`)} style={{
                  padding:'0.4rem 1rem', borderRadius:999, fontSize:'0.8rem', fontWeight:500,
                  background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.1)',
                  color:'var(--text-secondary)', cursor:'pointer', transition:'all 0.2s',
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(99,102,241,0.5)'; e.currentTarget.style.color = 'var(--brand-400)'; e.currentTarget.style.background = 'rgba(99,102,241,0.08)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* Stats row */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, maxWidth:800, margin:'4rem auto 0' }}>
            {STATS.map(({ icon: Icon, value, label, color }, i) => (
              <div key={label} className={`glass fade-in-up`} style={{ borderRadius:'1rem', padding:'1.25rem', textAlign:'center', animationDelay:`${0.35 + i*0.08}s` }}>
                <div style={{ width:40, height:40, borderRadius:10, background:`${color}18`, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 0.75rem' }}>
                  <Icon size={19} color={color} />
                </div>
                <div style={{ fontSize:'1.6rem', fontWeight:900, color:'white', lineHeight:1 }}>{value}</div>
                <div style={{ fontSize:'0.75rem', color:'var(--text-muted)', marginTop:4 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CATEGORIES ────────────────────────────────────────── */}
      <section className="section" style={{ background:'var(--bg-surface)' }}>
        <div className="container">
          <div style={{ textAlign:'center', marginBottom:'3rem' }}>
            <p style={{ color:'var(--brand-400)', fontWeight:600, fontSize:'0.85rem', letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:8 }}>WHAT WE OFFER</p>
            <h2 style={{ fontSize:'clamp(1.75rem,4vw,2.5rem)', fontWeight:800, letterSpacing:'-0.02em', marginBottom:12 }}>
              Browse by <span className="gradient-text">Category</span>
            </h2>
            <p style={{ color:'var(--text-secondary)', maxWidth:500, margin:'0 auto' }}>From wiring to deep cleaning — we've got your home covered.</p>
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(140px, 1fr))', gap:16 }}>
            {(categories.length > 0 ? categories : [
              { name:'Electrical', icon:'⚡' }, { name:'Plumbing', icon:'🔧' }, { name:'Cleaning', icon:'🧹' },
              { name:'Painting', icon:'🎨' }, { name:'Carpentry', icon:'🪚' }, { name:'AC & Appliances', icon:'❄️' },
              { name:'Pest Control', icon:'🐛' }, { name:'Gardening', icon:'🌿' },
            ]).map(cat => (
              <button key={cat._id || cat.name}
                onClick={() => navigate(cat._id ? `/services?category=${cat._id}` : `/services?search=${cat.name}`)}
                style={{
                  padding:'1.5rem 1rem', borderRadius:'1rem', textAlign:'center',
                  background:'var(--bg-card)', border:'1px solid var(--border-subtle)',
                  cursor:'pointer', transition:'all 0.25s ease',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(99,102,241,0.4)'; e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.3)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
              >
                <div style={{ fontSize:'2.25rem', marginBottom:'0.625rem' }}>{cat.icon}</div>
                <div style={{ fontSize:'0.82rem', fontWeight:600, color:'var(--text-primary)' }}>{cat.name}</div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED SERVICES ─────────────────────────────────── */}
      <section className="section">
        <div className="container">
          <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', marginBottom:'2.5rem', flexWrap:'wrap', gap:16 }}>
            <div>
              <p style={{ color:'var(--brand-400)', fontWeight:600, fontSize:'0.85rem', letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:8 }}>TOP PICKS</p>
              <h2 style={{ fontSize:'clamp(1.75rem,4vw,2.5rem)', fontWeight:800, letterSpacing:'-0.02em' }}>
                Featured <span className="gradient-text">Services</span>
              </h2>
            </div>
            <Link to="/services" className="btn btn-secondary" style={{ gap:8 }}>
              View All <ArrowRight size={16} />
            </Link>
          </div>

          {isLoading ? <Loader /> : featuredServices.length > 0 ? (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(260px, 1fr))', gap:20 }}>
              {featuredServices.slice(0, 8).map(s => <ServiceCard key={s._id} service={s} />)}
            </div>
          ) : (
            <div style={{ textAlign:'center', padding:'4rem 0' }}>
              <div style={{ fontSize:'4rem', marginBottom:'1rem' }}>🔧</div>
              <p style={{ color:'var(--text-muted)' }}>Start the backend & seed the database to see services!</p>
            </div>
          )}
        </div>
      </section>

      {/* ── HOW IT WORKS ──────────────────────────────────────── */}
      <section className="section" style={{ background:'var(--bg-surface)' }}>
        <div className="container">
          <div style={{ textAlign:'center', marginBottom:'3rem' }}>
            <p style={{ color:'var(--brand-400)', fontWeight:600, fontSize:'0.85rem', letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:8 }}>SIMPLE PROCESS</p>
            <h2 style={{ fontSize:'clamp(1.75rem,4vw,2.5rem)', fontWeight:800, letterSpacing:'-0.02em' }}>
              How <span className="gradient-text">Fixit Works</span>
            </h2>
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(220px, 1fr))', gap:20 }}>
            {HOW_IT_WORKS.map(({ step, title, desc }, i) => (
              <div key={step} className="card" style={{ padding:'1.75rem', position:'relative', overflow:'hidden' }}>
                <div style={{
                  position:'absolute', top:-12, right:-8,
                  fontSize:'4.5rem', fontWeight:900, lineHeight:1,
                  color:'rgba(99,102,241,0.06)',
                }}>{step}</div>
                <div style={{ position:'relative', zIndex:1 }}>
                  <div style={{
                    width:44, height:44, borderRadius:12,
                    background:'var(--grad-brand)',
                    display:'flex', alignItems:'center', justifyContent:'center',
                    marginBottom:'1.25rem',
                    fontSize:'1rem', fontWeight:800, color:'white',
                  }}>{i+1}</div>
                  <h3 style={{ fontSize:'1rem', fontWeight:700, marginBottom:'0.5rem', color:'var(--text-primary)' }}>{title}</h3>
                  <p style={{ fontSize:'0.85rem', color:'var(--text-secondary)', lineHeight:1.6 }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHY CHOOSE US ─────────────────────────────────────── */}
      <section className="section">
        <div className="container">
          <div style={{ textAlign:'center', marginBottom:'3rem' }}>
            <h2 style={{ fontSize:'clamp(1.75rem,4vw,2.5rem)', fontWeight:800, letterSpacing:'-0.02em' }}>
              Why Thousands Trust <span className="gradient-text">Fixit</span>
            </h2>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(240px, 1fr))', gap:20 }}>
            {FEATURES.map(({ icon: Icon, title, desc, color }) => (
              <div key={title} className="card" style={{ padding:'1.75rem', textAlign:'center' }}>
                <div style={{ width:56, height:56, borderRadius:14, background:`${color}18`, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 1.25rem' }}>
                  <Icon size={24} color={color} />
                </div>
                <h3 style={{ fontSize:'1.05rem', fontWeight:700, marginBottom:'0.5rem' }}>{title}</h3>
                <p style={{ fontSize:'0.85rem', color:'var(--text-secondary)', lineHeight:1.6 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ─────────────────────────────────────── */}
      <section className="section" style={{ background:'var(--bg-surface)' }}>
        <div className="container">
          <div style={{ textAlign:'center', marginBottom:'3rem' }}>
            <h2 style={{ fontSize:'clamp(1.75rem,4vw,2.5rem)', fontWeight:800, letterSpacing:'-0.02em' }}>
              What Our <span className="gradient-text">Customers Say</span>
            </h2>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(280px, 1fr))', gap:20 }}>
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="card" style={{ padding:'1.75rem' }}>
                <StarRating n={t.rating} />
                <p style={{ color:'var(--text-secondary)', fontSize:'0.9rem', lineHeight:1.7, margin:'1rem 0 1.25rem', fontStyle:'italic' }}>
                  "{t.text}"
                </p>
                <div style={{ display:'flex', alignItems:'center', gap:'0.75rem' }}>
                  <div className="avatar" style={{ width:38, height:38, fontSize:'0.9rem' }}>{t.avatar}</div>
                  <div>
                    <p style={{ fontWeight:700, fontSize:'0.875rem' }}>{t.name}</p>
                    <p style={{ fontSize:'0.75rem', color:'var(--text-muted)' }}>{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────── */}
      <section className="section">
        <div className="container">
          <div style={{
            borderRadius:'1.5rem', padding:'4rem 2rem', textAlign:'center', position:'relative', overflow:'hidden',
            background:'linear-gradient(135deg, rgba(99,102,241,0.1) 0%, rgba(168,85,247,0.08) 100%)',
            border:'1px solid rgba(99,102,241,0.2)',
          }}>
            <div style={{ position:'absolute', inset:0, background:'radial-gradient(ellipse at center, rgba(99,102,241,0.08) 0%, transparent 70%)', pointerEvents:'none' }} />
            <div style={{ position:'relative', zIndex:1 }}>
              <h2 style={{ fontSize:'clamp(1.75rem,4vw,2.5rem)', fontWeight:800, letterSpacing:'-0.02em', marginBottom:'1rem' }}>
                Earn on Your Own Terms 🔧
              </h2>
              <p style={{ color:'var(--text-secondary)', maxWidth:520, margin:'0 auto 2rem', lineHeight:1.7 }}>
                Join 5,000+ skilled professionals already earning ₹50K–₹1.5L/month on Fixit. Get jobs delivered to your doorstep.
              </p>
              <div style={{ display:'flex', gap:16, justifyContent:'center', flexWrap:'wrap' }}>
                <Link to="/register?role=provider" className="btn btn-primary btn-lg">
                  Become a Provider <ArrowRight size={18} />
                </Link>
                <Link to="/services" className="btn btn-ghost btn-lg">
                  Explore Services
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
