import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchServiceById } from '../redux/slices/servicesSlice';
import BookingWizard from '../components/booking/BookingWizard';
import Loader from '../components/common/Loader';
import { Star, Clock, MapPin, CheckCircle, Shield, Award, ArrowLeft, Zap, Users, Tag, Phone, ShieldCheck, Sparkles, MessageSquare, ArrowRight, Info } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

const ServiceDetailPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentService: service, isLoading } = useSelector(s => s.services);
  const { user } = useSelector(s => s.auth);
  
  const [showWizard, setShowWizard] = useState(false);
  const [experts, setExperts] = useState([]);
  const [isFetchingExperts, setIsFetchingExperts] = useState(false);
  const [selectedExpert, setSelectedExpert] = useState(null);

  useEffect(() => { 
    dispatch(fetchServiceById(id)); 
  }, [id, dispatch]);

  useEffect(() => {
    if (service?.category?.name) {
      fetchExperts();
    }
  }, [service]);

  const fetchExperts = async () => {
    setIsFetchingExperts(true);
    try {
      const { data } = await api.get('/auth/providers', {
        params: { skill: service.category.name }
      });
      setExperts(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsFetchingExperts(false);
    }
  };

  const handleBookNow = (expert = null) => {
    if (!user) {
      toast.error('Authentication required to book luxury services.');
      navigate('/login');
      return;
    }
    
    if (user.role === 'provider') {
      toast.error('Expert accounts cannot book services. Please use a customer account.');
      return;
    }

    setSelectedExpert(expert);
    setShowWizard(true);
  };

  if (isLoading) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Loader /></div>;
  if (!service) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Service portfolio not found.</div>;

  return (
    <div className="fade-in" style={{ paddingBottom: 120 }}>
      {showWizard && <BookingWizard service={service} onClose={() => setShowWizard(false)} initialExpertId={selectedExpert?._id} />}

      {/* ── HEADER HERO ────────────────────────────────────────── */}
      <section style={{ 
        background: 'var(--bg-card)', 
        padding: '5rem 0 4rem', 
        borderBottom: '1px solid var(--border-subtle)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ position:'absolute', top:0, left:0, right:0, height:1, background:'var(--brand-grad)', opacity:0.3 }} />
        
        <div className="container">
          <button onClick={() => navigate(-1)} className="btn" style={{ background:'none', border:'none', color:'var(--text-muted)', display:'flex', alignItems:'center', gap:10, marginBottom:32, fontWeight:700, padding:0 }}>
            <ArrowLeft size={20} /> BACK TO CATALOGUE
          </button>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '5rem', alignItems: 'center' }} className="grid-mobile-stack">
            <div className="reveal-up">
              <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
                <span className="badge badge-pending" style={{ padding:'0.5rem 1.25rem' }}>{service.category?.name?.toUpperCase()}</span>
                {service.isUrgent && <span className="badge badge-success" style={{ padding:'0.5rem 1.25rem' }}><Zap size={12} fill="currentColor" /> PRIORITY</span>}
              </div>
              <h1 style={{ fontSize: '4.5rem', marginBottom: '1.5rem' }}>{service.title}</h1>
              <p style={{ fontSize: '1.2rem', color: 'var(--text-dim)', lineHeight: 1.8, marginBottom: 40, maxWidth: 650 }}>{service.description}</p>
              
              <div style={{ display: 'flex', gap: '3rem', flexWrap: 'wrap' }}>
                 <div style={{ display:'flex', alignItems:'center', gap:16 }}>
                    <div style={{ width:56, height:56, borderRadius:16, background:'var(--accent-soft)', display:'flex', alignItems:'center', justifyContent:'center' }}><Star size={24} className="text-accent" fill="var(--accent)" /></div>
                    <div><p style={{ fontWeight:900, fontSize:'1.4rem', color:'white' }}>{service.rating || '5.0'}</p><p style={{ fontSize:'0.75rem', color:'var(--text-muted)', fontWeight:700, textTransform:'uppercase' }}>Service Score</p></div>
                 </div>
                 <div style={{ display:'flex', alignItems:'center', gap:16 }}>
                    <div style={{ width:56, height:56, borderRadius:16, background:'rgba(255,255,255,0.05)', display:'flex', alignItems:'center', justifyContent:'center' }}><Clock size={24} className="text-dim" /></div>
                    <div><p style={{ fontWeight:900, fontSize:'1.4rem', color:'white' }}>{service.duration || 60}m</p><p style={{ fontSize:'0.75rem', color:'var(--text-muted)', fontWeight:700, textTransform:'uppercase' }}>Avg Duration</p></div>
                 </div>
              </div>
            </div>
            
            <div className="glass-card reveal-up" style={{ padding: '3.5rem', textAlign: 'center', border: '1px solid var(--border-accent)', background:'linear-gradient(135deg, rgba(20,20,20,1) 0%, rgba(30,30,30,1) 100%)' }}>
               <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 800, letterSpacing:'0.15em' }}>EXECUTIVE SERVICE PACKAGE</span>
               <h2 style={{ fontSize: '4rem', fontWeight: 900, color: 'white', margin: '1rem 0' }}>₹{service.price?.toLocaleString()}</h2>
               <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, color:'var(--text-muted)', marginBottom:40 }}>
                  <ShieldCheck size={16} /> <span style={{ fontSize:'0.85rem', fontWeight:600 }}>Comprehensive Insurance Included</span>
               </div>
               <button onClick={() => handleBookNow()} className="btn btn-primary" style={{ width: '100%', height: 72, fontSize: '1.2rem', borderRadius:20 }}>Secure Your Slot <ArrowRight size={20} style={{ marginLeft:12 }} /></button>
               <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 24, fontWeight:600 }}>Satisfaction Guaranteed or Full Re-service</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── CONTENT BODY ──────────────────────────────────────── */}
      <div className="container" style={{ marginTop: '8rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1.2fr', gap: '6rem' }} className="grid-mobile-stack">
          
          {/* Left: Experts Portfolio */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 48 }}>
               <div style={{ width:64, height:64, borderRadius:20, background: 'var(--bg-elevated)', display:'flex', alignItems:'center', justifyContent:'center', border:'1px solid var(--border-rich)' }}><Users size={28} className="text-accent" /></div>
               <div>
                  <span style={{ color:'var(--accent)', fontWeight:800, fontSize:'0.7rem', letterSpacing:'0.15em' }}>CERTIFIED PROFESSIONALS</span>
                  <h3 style={{ fontSize: '2.25rem', fontWeight: 800, color:'white', marginTop:4 }}>Available Experts</h3>
               </div>
            </div>

            {isFetchingExperts ? <div style={{ padding: '6rem', textAlign: 'center' }}><Loader /></div> : (
              <div style={{ display: 'grid', gap: 24 }}>
                {experts.length === 0 ? (
                  <div className="glass-card" style={{ padding: '4rem', textAlign: 'center' }}>
                     <Info size={48} className="text-dim" style={{ marginBottom:20, opacity:0.3 }} />
                     <p style={{ color: 'var(--text-dim)', fontSize:'1.1rem', maxWidth:450, margin:'0 auto' }}>No category-specific experts are currently available. You may proceed with an Instant Booking, and we will assign our top-tier professional within 15 minutes.</p>
                  </div>
                ) : (
                  experts.map(expert => (
                    <div key={expert._id} className="glass-card reveal-up" style={{ padding: '2rem', display: 'flex', gap: 32, alignItems: 'center', flexWrap: 'wrap' }}>
                      <div className="avatar" style={{ width: 100, height: 100, fontSize: '2rem', borderRadius:24, background:'var(--bg-elevated)', border:'1px solid var(--border-rich)', color:'var(--accent)' }}>{expert.name.charAt(0)}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                          <h4 style={{ fontSize: '1.5rem', fontWeight: 800, color:'white' }}>{expert.name}</h4>
                          {expert.providerProfile?.isVerified && <div style={{ background:'var(--accent-soft)', padding:'0.2rem 0.6rem', borderRadius:6, display:'flex', alignItems:'center', gap:6 }}><ShieldCheck size={14} className="text-accent" /><span style={{ fontSize:'0.65rem', fontWeight:800, color:'var(--accent)' }}>VERIFIED</span></div>}
                        </div>
                        <div style={{ display: 'flex', gap: 24, color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: 16 }}>
                           <span style={{ display: 'flex', alignItems:'center', gap:8 }}><Star size={16} fill="var(--accent)" color="var(--accent)" /> <span style={{ color:'white', fontWeight:700 }}>{expert.providerProfile?.rating}</span></span>
                           <span style={{ display: 'flex', alignItems:'center', gap:8 }}><Award size={16} /> {expert.providerProfile?.experience} Yrs Tenure</span>
                           <span style={{ display: 'flex', alignItems:'center', gap:8 }}><CheckCircle size={16} /> {expert.providerProfile?.completedJobs} Deliveries</span>
                        </div>
                        <p style={{ fontSize: '0.95rem', color: 'var(--text-dim)', lineHeight: 1.6, marginBottom: 20 }} className="line-clamp-2">{expert.providerProfile?.bio}</p>
                        
                        <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
                           {expert.providerProfile?.skills?.slice(0, 3).map(skill => (
                              <span key={skill} style={{ fontSize:'0.65rem', fontWeight:800, color:'var(--text-muted)', background:'rgba(255,255,255,0.03)', padding:'0.3rem 0.6rem', borderRadius:6, border:'1px solid var(--border-subtle)' }}>{skill.toUpperCase()}</span>
                           ))}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right', display:'flex', flexDirection:'column', gap:12 }}>
                         <button onClick={() => handleBookNow(expert)} className="btn btn-primary" style={{ borderRadius:14, padding:'1rem 2rem', fontWeight:800 }}>Instant Book</button>
                         <Link to={`/providers/${expert._id}`} className="btn btn-outline" style={{ borderRadius:14, padding:'0.8rem 1.5rem', fontSize:'0.75rem', fontWeight:800, border:'1px solid var(--border-rich)' }}>View Profile</Link>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Right: Guarantees Column */}
          <div>
             <div className="glass-card" style={{ padding:'3rem', position:'sticky', top:'calc(var(--nav-h) + 2rem)' }}>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 32, color:'white' }}>Fixit Gold Standard</h3>
                <div style={{ display: 'grid', gap: 32 }}>
                   {[
                     { icon: ShieldCheck, title: 'Background Verified', desc: 'Rigorous 3-step authentication for every expert on our platform.', color: 'var(--accent)' },
                     { icon: Award, title: 'Quality Guarantee', desc: 'If you are not satisfied, we will provide a full re-service at no cost.', color: 'var(--success)' },
                     { icon: MessageSquare, title: 'Concierge Support', desc: 'Dedicated service managers available for every luxury booking.', color: 'var(--info)' },
                     { icon: Sparkles, title: 'Transparent Pricing', desc: 'No hidden surcharges. What you see is the final professional investment.', color: '#a855f7' },
                   ].map((item, i) => (
                     <div key={i} style={{ display: 'flex', gap: 20 }}>
                       <div style={{ width: 56, height: 56, borderRadius: 16, background: 'rgba(255,255,255,0.03)', border:'1px solid var(--border-rich)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <item.icon size={24} color={item.color} />
                       </div>
                       <div>
                          <p style={{ fontWeight: 800, fontSize: '1.1rem', marginBottom: 4, color:'white' }}>{item.title}</p>
                          <p style={{ fontSize: '0.9rem', color: 'var(--text-dim)', lineHeight: 1.6 }}>{item.desc}</p>
                       </div>
                     </div>
                   ))}
                </div>
                
                <div style={{ marginTop:48, padding:'2rem', borderRadius:20, background:'var(--bg-elevated)', border:'1px solid var(--border-subtle)', textAlign:'center' }}>
                   <p style={{ fontSize:'0.85rem', color:'var(--text-muted)', fontWeight:600 }}>Questions about this service?</p>
                   <p style={{ fontSize:'1.1rem', fontWeight:800, color:'white', marginTop:8 }}>Call 1800-FIX-IT-NOW</p>
                </div>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ServiceDetailPage;
