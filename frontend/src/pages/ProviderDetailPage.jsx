import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { 
  Star, MapPin, Briefcase, CheckCircle, Clock, ShieldCheck, 
  MessageSquare, Phone, Calendar, ArrowLeft, User, Sparkles 
} from 'lucide-react';
import api from '../services/api';
import Loader from '../components/common/Loader';
import toast from 'react-hot-toast';

const ProviderDetailPage = () => {
  const { id } = useParams();
  const [provider, setProvider] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useSelector(s => s.auth);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProvider();
  }, [id]);

  const handleHire = () => {
    if (!user) {
      toast.error('Authentication required to hire experts.');
      navigate('/login');
      return;
    }
    if (user.role === 'provider') {
      toast.error('Expert accounts cannot book other experts. Please use a customer account.');
      return;
    }
    navigate(`/services?category=${provider.providerProfile.skills[0]}`);
  };

  const fetchProvider = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/auth/providers/${id}`);
      setProvider(data.data);
    } catch (error) {
      console.error('Error fetching provider:', error);
      toast.error('Failed to load expert details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div style={{ height:'100vh', display:'flex', alignItems:'center', justifyContent:'center' }}><Loader /></div>;
  if (!provider) return <div className="pt-32 text-center text-slate-500">Expert not found</div>;

  return (
    <div className="fade-in" style={{ paddingBottom: 120 }}>
      {/* ── LUXURY PROFILE HEADER ───────────────────────────────── */}
      <section style={{ 
        position: 'relative', padding: '8rem 0 4rem', 
        background: 'linear-gradient(to bottom, #111 0%, var(--bg-deep) 100%)',
        borderBottom: '1px solid var(--border-subtle)',
        overflow:'hidden'
      }}>
        <div style={{ position:'absolute', top:0, left:0, right:0, height:300, background:'radial-gradient(circle at 50% 0%, var(--accent-soft) 0%, transparent 70%)', opacity:0.5 }} />
        
        <div className="container">
          <Link to="/providers" className="btn btn-outline" style={{ marginBottom: 48, borderRadius: 12, padding: '0.6rem 1.2rem', fontSize: '0.75rem', gap: 8 }}>
            <ArrowLeft size={16} /> ALL EXPERTS
          </Link>

          <div style={{ display: 'flex', alignItems: 'center', gap: 48, flexWrap: 'wrap' }} className="grid-mobile-stack">
            <div style={{ 
              width: 180, height: 180, borderRadius: 48, 
              background: 'var(--bg-elevated)', border: '2px solid var(--border-accent)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '4rem', color: 'var(--accent)',
              boxShadow: '0 20px 40px rgba(0,0,0,0.4)', position: 'relative'
            }}>
              {provider.avatar ? <img src={provider.avatar} style={{ width:'100%', height:'100%', objectFit:'cover', borderRadius:46 }} /> : provider.name.charAt(0)}
              {provider.providerProfile?.isOnline && <div style={{ position:'absolute', bottom:10, right:10, width:24, height:24, borderRadius:99, background:'var(--success)', border:'4px solid var(--bg-deep)' }} className="pulse" />}
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ display:'flex', alignItems:'center', gap:16, marginBottom:12 }}>
                 <h1 style={{ fontSize: '3.5rem', margin: 0 }}>{provider.name}</h1>
                 {provider.providerProfile?.isVerified && (
                    <div style={{ background:'var(--accent-soft)', padding:'0.4rem 1rem', borderRadius:12, display:'flex', alignItems:'center', gap:8, border:'1px solid var(--border-accent)' }}>
                       <ShieldCheck size={16} className="text-accent" />
                       <span style={{ fontSize:'0.7rem', fontWeight:800, color:'var(--accent)', letterSpacing:'0.1em' }}>GOLD VERIFIED</span>
                    </div>
                 )}
              </div>
              
              <div style={{ display:'flex', gap:32, flexWrap:'wrap' }}>
                 <div style={{ display:'flex', alignItems:'center', gap:8, color:'var(--accent)', fontWeight:800, fontSize:'1.1rem' }}>
                    <Star size={20} fill="var(--accent)" color="var(--accent)" /> {provider.providerProfile?.rating || '5.0'}
                    <span style={{ color:'var(--text-muted)', fontSize:'0.9rem', fontWeight:600 }}>({provider.providerProfile?.completedJobs || 0} Deliveries)</span>
                 </div>
                 <div style={{ display:'flex', alignItems:'center', gap:8, color:'var(--text-dim)', fontWeight:600 }}>
                    <MapPin size={20} className="text-accent" /> {provider.address?.city || 'Lucknow, India'}
                 </div>
                 <div style={{ display:'flex', alignItems:'center', gap:8, color:'var(--text-dim)', fontWeight:600 }}>
                    <Briefcase size={20} className="text-accent" /> {provider.providerProfile?.experience || 0} Years Experience
                 </div>
              </div>
            </div>

            <div style={{ display:'flex', gap:12 }}>
               <button className="btn btn-outline" style={{ width:64, height:64, borderRadius:16 }}><MessageSquare size={24} /></button>
               <button className="btn btn-outline" style={{ width:64, height:64, borderRadius:16 }}><Phone size={24} /></button>
               <button onClick={handleHire} className="btn btn-primary" style={{ padding:'0 3rem', height:64, borderRadius:16, fontSize:'1rem' }}>HIRE NOW</button>
            </div>
          </div>
        </div>
      </section>

      <div className="container" style={{ marginTop: 64 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1.2fr', gap: 64 }} className="grid-mobile-stack">
          
          {/* ── LEFT COLUMN: CONTENT ────────────────────────────── */}
          <div>
            <div className="glass-card" style={{ padding: '3rem', marginBottom: 48 }}>
              <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:24 }}>
                 <Sparkles size={24} className="text-accent" />
                 <h2 style={{ fontSize:'1.75rem', margin:0 }}>Professional Biography</h2>
              </div>
              <p style={{ fontSize: '1.1rem', color: 'var(--text-dim)', lineHeight: 1.8, marginBottom: 48 }}>
                {provider.providerProfile?.bio || `${provider.name} is a top-tier service professional specializing in luxury home maintenance and precision engineering. With over ${provider.providerProfile?.experience || 0} years of field experience, they have established a reputation for excellence, punctuality, and high-quality results.`}
              </p>

              <h3 style={{ fontSize:'0.8rem', fontWeight:800, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.2em', marginBottom:24 }}>Specialized Portfolio</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                {provider.providerProfile?.skills?.map(skill => (
                  <div key={skill} style={{ 
                    padding: '0.75rem 1.5rem', borderRadius: 14, 
                    background: 'var(--bg-elevated)', border: '1px solid var(--border-rich)',
                    color: 'white', fontSize: '0.85rem', fontWeight: 700,
                    display: 'flex', alignItems: 'center', gap: 8
                  }}>
                    <CheckCircle size={14} className="text-success" /> {skill}
                  </div>
                ))}
              </div>
            </div>

            <h2 style={{ fontSize:'2rem', marginBottom:32 }}>Services by {provider.name.split(' ')[0]}</h2>
            <div style={{ display:'grid', gap:24 }}>
               {/* Show actual services if any, or professional placeholders */}
               <div className="glass-card" style={{ padding: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderLeft: '4px solid var(--accent)' }}>
                  <div>
                    <h4 style={{ fontSize: '1.25rem', marginBottom: 8 }}>Professional Inspection & Repair</h4>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Comprehensive diagnosis and resolution of all technical issues.</p>
                  </div>
                  <div style={{ textAlign:'right' }}>
                     <div style={{ fontSize:'1.5rem', fontWeight:900, color:'white', marginBottom:8 }}>₹499</div>
                     <Link to="/services" className="btn btn-primary" style={{ padding:'0.6rem 1.5rem', fontSize:'0.8rem' }}>Book Now</Link>
                  </div>
               </div>
               <div className="glass-card" style={{ padding: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderLeft: '4px solid var(--success)' }}>
                  <div>
                    <h4 style={{ fontSize: '1.25rem', marginBottom: 8 }}>Ultra Maintenance Package</h4>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Deep preventative cleaning and optimization for long-term reliability.</p>
                  </div>
                  <div style={{ textAlign:'right' }}>
                     <div style={{ fontSize:'1.5rem', fontWeight:900, color:'white', marginBottom:8 }}>₹899</div>
                     <Link to="/services" className="btn btn-primary" style={{ padding:'0.6rem 1.5rem', fontSize:'0.8rem' }}>Book Now</Link>
                  </div>
               </div>
            </div>
          </div>

          {/* ── RIGHT COLUMN: SIDEBAR ───────────────────────────── */}
          <div>
            <div className="glass-card" style={{ padding: '2.5rem', marginBottom: 32, position: 'sticky', top: 120 }}>
               <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:24 }}>
                  <Clock size={24} className="text-accent" />
                  <h3 style={{ fontSize:'1.5rem', margin:0 }}>Availability</h3>
               </div>
               <div style={{ display:'grid', gap:12 }}>
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                    <div key={day} style={{ display:'flex', justifyContent:'space-between', padding:'1rem', background:'rgba(255,255,255,0.02)', borderRadius:12, border:'1px solid var(--border-subtle)' }}>
                       <span style={{ fontWeight:800, fontSize:'0.8rem', color:day === 'Sun' ? 'var(--error)' : 'white' }}>{day.toUpperCase()}</span>
                       <span style={{ color:'var(--text-dim)', fontSize:'0.85rem', fontWeight:600 }}>{day === 'Sun' ? 'Off Duty' : '09:00 AM - 08:00 PM'}</span>
                    </div>
                  ))}
               </div>

               <div style={{ marginTop:40, padding:24, background:'var(--accent-soft)', borderRadius:16, border:'1px solid var(--border-accent)' }}>
                  <p style={{ fontSize:'0.85rem', color:'var(--accent)', fontWeight:800, textAlign:'center' }}>
                     Average Response Time: 15 Minutes
                  </p>
               </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ProviderDetailPage;
