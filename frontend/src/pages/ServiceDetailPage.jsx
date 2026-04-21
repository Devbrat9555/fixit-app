import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchServiceById } from '../redux/slices/servicesSlice';
import BookingWizard from '../components/booking/BookingWizard';
import Loader from '../components/common/Loader';
import { Star, Clock, MapPin, CheckCircle, Shield, Award, ArrowLeft, Zap, Users, Tag } from 'lucide-react';

const StarFull = ({ n }) => (
  <div style={{ display:'flex', gap:2 }}>
    {[1,2,3,4,5].map(i => (
      <Star key={i} size={14} style={{ fill: i<=n ? '#fbbf24' : 'transparent', color: i<=n ? '#fbbf24' : 'var(--text-muted)' }} />
    ))}
  </div>
);

const ServiceDetailPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentService: service, isLoading } = useSelector(s => s.services);
  const { user } = useSelector(s => s.auth);
  const [showWizard, setShowWizard] = useState(false);

  useEffect(() => { dispatch(fetchServiceById(id)); }, [id, dispatch]);

  if (isLoading) return <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', paddingTop:80 }}><Loader /></div>;
  if (!service)  return <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', paddingTop:80, color:'var(--text-muted)', textAlign:'center' }}>Service not found.<br /><Link to="/services" style={{ color:'var(--brand-400)', marginTop:12, display:'block' }}>← Back to services</Link></div>;

  const provider = service.provider;

  return (
    <div style={{ minHeight:'100vh', paddingTop:64 }}>
      {showWizard && <BookingWizard service={service} onClose={() => setShowWizard(false)} />}

      {/* Hero Image */}
      <div style={{ position:'relative', height:340, overflow:'hidden' }}>
        <img
          src={service.image || 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=1200'}
          alt={service.title}
          style={{ width:'100%', height:'100%', objectFit:'cover' }}
          onError={e => e.target.src='https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=1200'}
        />
        <div style={{ position:'absolute', inset:0, background:'linear-gradient(to bottom, rgba(7,11,20,0.4) 0%, rgba(7,11,20,0.9) 100%)' }} />
        <div className="container" style={{ position:'absolute', bottom:0, left:0, right:0, padding:'0 1.25rem 2rem' }}>
          <button onClick={() => navigate(-1)} style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'0.5rem 0.875rem', borderRadius:'0.625rem', background:'rgba(255,255,255,0.1)', border:'1px solid rgba(255,255,255,0.15)', color:'white', cursor:'pointer', marginBottom:16, fontSize:'0.85rem', backdropFilter:'blur(8px)' }}>
            <ArrowLeft size={15} /> Back
          </button>
          <div style={{ display:'flex', flexWrap:'wrap', gap:8, marginBottom:12 }}>
            {service.category && (
              <span style={{ padding:'0.25rem 0.75rem', borderRadius:999, fontSize:'0.75rem', fontWeight:600, background:'rgba(255,255,255,0.12)', backdropFilter:'blur(8px)', color:'white' }}>
                {service.category.icon} {service.category.name}
              </span>
            )}
            {service.isUrgent && (
              <span style={{ padding:'0.25rem 0.75rem', borderRadius:999, fontSize:'0.75rem', fontWeight:700, background:'rgba(244,63,94,0.8)', color:'white', display:'flex', alignItems:'center', gap:4 }}>
                <Zap size={11} fill="white" /> URGENT AVAILABLE
              </span>
            )}
          </div>
          <h1 style={{ fontSize:'clamp(1.5rem,4vw,2.25rem)', fontWeight:900, color:'white', letterSpacing:'-0.02em', lineHeight:1.2 }}>{service.title}</h1>
          <div style={{ display:'flex', alignItems:'center', flexWrap:'wrap', gap:16, marginTop:10 }}>
            <div style={{ display:'flex', alignItems:'center', gap:6 }}>
              <StarFull n={Math.round(service.rating)} />
              <span style={{ color:'white', fontWeight:700 }}>{service.rating?.toFixed(1)}</span>
              <span style={{ color:'rgba(255,255,255,0.6)', fontSize:'0.85rem' }}>({service.totalRatings} reviews)</span>
            </div>
            <span style={{ color:'rgba(255,255,255,0.6)', fontSize:'0.85rem', display:'flex', alignItems:'center', gap:4 }}>
              <Clock size={13} /> {service.duration} min
            </span>
            <span style={{ color:'rgba(255,255,255,0.6)', fontSize:'0.85rem', display:'flex', alignItems:'center', gap:4 }}>
              <Users size={13} /> {service.totalBookings}+ booked
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container" style={{ padding:'2rem 1.25rem', display:'grid', gridTemplateColumns:'1fr 340px', gap:32, alignItems:'start' }}>
        {/* Left */}
        <div style={{ minWidth:0 }}>
          {/* Description */}
          <div className="card" style={{ padding:'1.5rem', marginBottom:20 }}>
            <h2 style={{ fontSize:'1.05rem', fontWeight:700, marginBottom:'1rem', color:'var(--text-primary)' }}>About This Service</h2>
            <p style={{ color:'var(--text-secondary)', lineHeight:1.8, fontSize:'0.9rem' }}>{service.description}</p>
          </div>

          {/* Tags */}
          {service.tags?.length > 0 && (
            <div className="card" style={{ padding:'1.25rem', marginBottom:20 }}>
              <h3 style={{ fontSize:'0.9rem', fontWeight:700, marginBottom:'0.875rem', display:'flex', alignItems:'center', gap:6 }}>
                <Tag size={15} color="var(--brand-400)" /> Tags
              </h3>
              <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
                {service.tags.map(tag => (
                  <span key={tag} style={{ padding:'0.3rem 0.75rem', borderRadius:999, fontSize:'0.78rem', fontWeight:500, background:'rgba(99,102,241,0.1)', border:'1px solid rgba(99,102,241,0.2)', color:'var(--brand-400)' }}>
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Guarantees */}
          <div className="card" style={{ padding:'1.5rem', marginBottom:20 }}>
            <h3 style={{ fontSize:'0.9rem', fontWeight:700, marginBottom:'1rem' }}>What's Included</h3>
            <div style={{ display:'grid', gap:10 }}>
              {[
                { icon: Shield,    text: 'Verified & background-checked professional' },
                { icon: Award,     text: '100% satisfaction or free re-service' },
                { icon: CheckCircle, text: 'On-time arrival guaranteed' },
                { icon: Clock,     text: 'Transparent pricing — no hidden charges' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} style={{ display:'flex', alignItems:'center', gap:10, fontSize:'0.875rem', color:'var(--text-secondary)' }}>
                  <div style={{ width:28, height:28, borderRadius:8, background:'rgba(16,185,129,0.1)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    <Icon size={13} color="var(--accent-emerald)" />
                  </div>
                  {text}
                </div>
              ))}
            </div>
          </div>

          {/* Provider */}
          {provider && (
            <div className="card" style={{ padding:'1.5rem' }}>
              <h3 style={{ fontSize:'0.9rem', fontWeight:700, marginBottom:'1rem' }}>Your Service Provider</h3>
              <div style={{ display:'flex', alignItems:'flex-start', gap:12 }}>
                <div className="avatar" style={{ width:52, height:52, fontSize:'1.25rem', flexShrink:0 }}>{provider.name?.charAt(0)}</div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
                    <p style={{ fontWeight:700, fontSize:'1rem', color:'var(--text-primary)' }}>{provider.name}</p>
                    {provider.providerProfile?.isVerified && (
                      <span style={{ display:'flex', alignItems:'center', gap:3, fontSize:'0.72rem', fontWeight:600, color:'var(--accent-emerald)', background:'rgba(16,185,129,0.1)', padding:'0.15rem 0.5rem', borderRadius:999 }}>
                        <CheckCircle size={10} /> Verified
                      </span>
                    )}
                  </div>
                  {provider.providerProfile?.bio && (
                    <p style={{ fontSize:'0.82rem', color:'var(--text-secondary)', lineHeight:1.6, marginBottom:'0.75rem' }}>{provider.providerProfile.bio}</p>
                  )}
                  <div style={{ display:'flex', flexWrap:'wrap', gap:12 }}>
                    {[
                      { label: `${provider.providerProfile?.experience || 0}+ yrs exp`, icon: Award },
                      { label: `${provider.providerProfile?.rating?.toFixed(1) || '0.0'} rating`, icon: Star },
                      { label: `${provider.providerProfile?.completedJobs || 0} jobs done`, icon: CheckCircle },
                    ].map(({ label, icon: Icon }) => (
                      <div key={label} style={{ display:'flex', alignItems:'center', gap:5, fontSize:'0.8rem', color:'var(--text-secondary)' }}>
                        <Icon size={13} color="var(--brand-400)" /> {label}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right: Booking Card */}
        <div style={{ position:'sticky', top:80 }}>
          <div className="card" style={{ padding:'1.5rem', marginBottom:16 }}>
            {/* Price */}
            <div style={{ display:'flex', alignItems:'baseline', gap:6, marginBottom:4 }}>
              <span style={{ fontSize:'0.75rem', color:'var(--text-muted)' }}>
                {service.priceType === 'fixed' ? '' : service.priceType === 'hourly' ? '/hr • ' : 'Starting from '}
              </span>
              <span style={{ fontSize:'2rem', fontWeight:900, color:'var(--brand-400)', letterSpacing:'-0.02em' }}>
                ₹{service.price?.toLocaleString('en-IN')}
              </span>
            </div>
            <p style={{ fontSize:'0.78rem', color:'var(--text-muted)', marginBottom:'1.5rem' }}>Incl. all taxes. No hidden charges.</p>

            {/* Quick info */}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:'1.5rem' }}>
              {[
                { label:'Duration', value:`${service.duration} min`, icon: Clock },
                { label:'Rating', value:`${service.rating?.toFixed(1)} ⭐`, icon: Star },
              ].map(({ label, value, icon: Icon }) => (
                <div key={label} style={{ padding:'0.75rem', borderRadius:'0.625rem', background:'var(--bg-surface)', border:'1px solid var(--border-subtle)', textAlign:'center' }}>
                  <p style={{ fontSize:'0.7rem', color:'var(--text-muted)', marginBottom:2 }}>{label}</p>
                  <p style={{ fontSize:'0.9rem', fontWeight:700, color:'var(--text-primary)' }}>{value}</p>
                </div>
              ))}
            </div>

            {user ? (
              user.role === 'user' ? (
                <button onClick={() => setShowWizard(true)} className="btn btn-primary btn-full" style={{ padding:'0.875rem', fontSize:'1rem' }}>
                  📅 Book Now
                </button>
              ) : (
                <div style={{ padding:'0.875rem', borderRadius:'0.75rem', background:'rgba(99,102,241,0.08)', border:'1px solid rgba(99,102,241,0.2)', textAlign:'center', fontSize:'0.85rem', color:'var(--text-muted)' }}>
                  Bookings are only available for customers.
                </div>
              )
            ) : (
              <div>
                <Link to="/login" className="btn btn-primary btn-full" style={{ padding:'0.875rem', fontSize:'1rem', justifyContent:'center', display:'flex' }}>
                  Login to Book
                </Link>
                <p style={{ textAlign:'center', fontSize:'0.78rem', color:'var(--text-muted)', marginTop:8 }}>
                  New user? <Link to="/register" style={{ color:'var(--brand-400)' }}>Register free</Link>
                </p>
              </div>
            )}
          </div>

          {/* Trust indicators */}
          <div style={{ display:'grid', gap:8 }}>
            {[
              '✅ Verified professional',
              '🛡️ Insured & secure',
              '🔄 Free re-service if unsatisfied',
            ].map(t => (
              <div key={t} style={{ fontSize:'0.8rem', color:'var(--text-secondary)', display:'flex', alignItems:'center', gap:6 }}>
                {t}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile Book Button */}
      <div className="show-mobile" style={{ position:'fixed', bottom:0, left:0, right:0, padding:'1rem', background:'var(--bg-card)', borderTop:'1px solid var(--border-subtle)', zIndex:40 }}>
        {user?.role === 'user' ? (
          <button onClick={() => setShowWizard(true)} className="btn btn-primary btn-full btn-lg">
            📅 Book Now — ₹{service.price?.toLocaleString('en-IN')}
          </button>
        ) : !user ? (
          <Link to="/login" className="btn btn-primary btn-full btn-lg" style={{ justifyContent:'center', display:'flex' }}>
            Login to Book
          </Link>
        ) : null}
      </div>
    </div>
  );
};

export default ServiceDetailPage;
