import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProviderBookings, updateBookingStatus, fetchNearbyBookings, acceptBooking } from '../redux/slices/bookingsSlice';
import Loader from '../components/common/Loader';
import { 
  Calendar, Clock, MapPin, CheckCircle, XCircle, 
  Package, TrendingUp, Users, Zap, Bell, 
  Navigation, Phone, MessageSquare, Check, ChevronRight,
  ShieldCheck, Power, Briefcase, Star, Settings, User as UserIcon,
  ArrowUpRight, IndianRupee, Award, X
} from 'lucide-react';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';
import { getCategoryThumbnail } from '../utils/serviceUtils';
import LiveTrackingMap from '../components/booking/LiveTrackingMap';
import api from '../services/api';
import { setUser } from '../redux/slices/authSlice';

const statusConfig = {
  pending:     { label:'New Request', cls:'badge-pending',     icon:'📩' },
  accepted:    { label:'Accepted',    cls:'badge-success',   icon:'✅' },
  on_the_way:  { label:'On The Way',  cls:'badge-success', icon:'🛵' },
  arrived:     { label:'Arrived',     cls:'badge-success', icon:'📍' },
  completed:   { label:'Completed',   cls:'badge-success',   icon:'🎉' },
  cancelled:   { label:'Cancelled',   cls:'badge-error',   icon:'❌' },
  rejected:    { label:'Rejected',    cls:'badge-error',    icon:'🚫' },
};

const ProviderDashboard = () => {
  const dispatch = useDispatch();
  const { user } = useSelector(s => s.auth);
  const { providerBookings: bookings, nearbyBookings, isLoading } = useSelector(s => s.bookings);
  const [tab, setTab] = useState('active'); 
  const [onlineLoading, setOnlineLoading] = useState(false);

  useEffect(() => {
    dispatch(fetchProviderBookings());
    dispatch(fetchNearbyBookings());

    const socketUrl = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5001';
    const socket = io(socketUrl);
    socket.emit('join_provider_room', user._id);

    socket.on('new_booking_broadcast', (data) => {
      toast.success(`Exclusive Invitation: ${data.service}`, { duration: 8000 });
      dispatch(fetchNearbyBookings());
    });

    return () => socket.disconnect();
  }, [dispatch, user._id]);

  const handleStatusUpdate = (id, status) => {
    dispatch(updateBookingStatus({ id, status })).then(() => {
       toast.success(`Job updated to ${status.replace('_', ' ')}`);
       dispatch(fetchProviderBookings());
    });
  };

  const handleAccept = (id) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const providerLocation = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          dispatch(acceptBooking({ id, providerLocation })).then(() => {
            toast.success('Exclusive Job Secured!');
            setTab('active');
            dispatch(fetchProviderBookings());
            dispatch(fetchNearbyBookings());
          });
        },
        (err) => {
          // If location fails, accept without it
          dispatch(acceptBooking({ id })).then(() => {
            toast.success('Job Secured (Location access denied)');
            setTab('active');
            dispatch(fetchProviderBookings());
            dispatch(fetchNearbyBookings());
          });
        }
      );
    } else {
      dispatch(acceptBooking({ id })).then(() => {
        setTab('active');
        dispatch(fetchProviderBookings());
        dispatch(fetchNearbyBookings());
      });
    }
  };
  
  const handleToggleOnline = async () => {
    setOnlineLoading(true);
    try {
      const { data } = await api.put('/bookings/toggle-availability');
      dispatch(setUser({ ...user, providerProfile: { ...user.providerProfile, isOnline: data.isOnline } }));
      toast.success(data.message);
    } catch (err) {
      toast.error('Failed to update status');
    } finally {
      setOnlineLoading(false);
    }
  };

  const availableSkills = [
    'Plumbing', 'Electrical', 'Cleaning', 'AC Repair', 'Painting', 
    'Salon at Home', 'Pest Control', 'Appliance Repair', 'Massage Therapy', 
    'Home Automation', 'Carpentry'
  ];

  const handleSkillToggle = async (skill) => {
    if (!skill || !skill.trim()) return;
    const current = user.providerProfile.skills || [];
    const newSkills = current.includes(skill) ? current.filter(s => s !== skill) : [...current, skill];
    
    try {
      const { data } = await api.put('/auth/profile', {
        providerProfile: { ...user.providerProfile, skills: newSkills }
      });
      dispatch(setUser(data.data));
      toast.success('Professional skills updated');
    } catch (err) {
      toast.error('Failed to update profile');
    }
  };

  const activeJobs = bookings.filter(b => ['accepted', 'on_the_way', 'arrived'].includes(b.status));
  const historyJobs = bookings.filter(b => ['completed', 'cancelled', 'rejected'].includes(b.status));

  return (
    <div className="fade-in" style={{ paddingBottom:120 }}>
      {/* ── HEADER ────────────────────────────────────────────── */}
      <section style={{ padding: '4rem 0', borderBottom: '1px solid var(--border-subtle)', marginBottom: '4rem' }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 32, flexWrap: 'wrap' }}>
            <div>
              <span style={{ color: 'var(--accent)', fontWeight: 800, fontSize: '0.8rem', letterSpacing: '0.2em' }}>EXPERT COMMAND CENTER</span>
              <h1 style={{ fontSize:'3.5rem', marginTop:'0.5rem' }}>Business Intelligence.</h1>
              <p style={{ color:'var(--text-dim)', fontSize:'1.1rem', marginTop:8 }}>Welcome back, <span style={{ color:'white', fontWeight:700 }}>{user?.name}</span>. Precision at your fingertips.</p>
            </div>
            
            <div style={{ display:'flex', gap:16, alignItems:'center' }}>
               <button 
                onClick={handleToggleOnline}
                disabled={onlineLoading}
                className="btn"
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '1rem 2rem', borderRadius: 16,
                  background: user?.providerProfile?.isOnline ? 'var(--accent)' : 'var(--bg-elevated)',
                  border: `1px solid ${user?.providerProfile?.isOnline ? 'transparent' : 'var(--border-rich)'}`,
                  color: user?.providerProfile?.isOnline ? 'var(--primary)' : 'var(--text-muted)',
                  fontWeight: 800, cursor: 'pointer', transition: 'all 0.4s ease'
                }}
               >
                 <Power size={20} strokeWidth={3} /> {user?.providerProfile?.isOnline ? 'ACTIVE' : 'OFFLINE'}
               </button>

               <div className="glass-card" style={{ padding:'1rem 2rem', display:'flex', alignItems:'center', gap:20 }}>
                  <div>
                    <p style={{ fontSize:'0.65rem', color:'var(--text-muted)', fontWeight:800, letterSpacing:'0.1em' }}>TOTAL REVENUE</p>
                    <p style={{ fontSize:'1.75rem', fontWeight:900, color:'white' }}>₹{user?.providerProfile?.totalEarnings?.toLocaleString() || 0}</p>
                  </div>
                  <div style={{ width:44, height:44, borderRadius:12, background:'var(--accent-soft)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                     <IndianRupee size={22} className="text-accent" />
                  </div>
               </div>

               <div className="glass-card" style={{ padding:'1rem 2rem', display:'flex', alignItems:'center', gap:20 }}>
                  <div>
                    <p style={{ fontSize:'0.65rem', color:'var(--text-muted)', fontWeight:800, letterSpacing:'0.1em' }}>REPUTATION</p>
                    <p style={{ fontSize:'1.75rem', fontWeight:900, color:'white' }}>{user?.providerProfile?.rating || '5.0'}</p>
                  </div>
                  <div style={{ width:44, height:44, borderRadius:12, background:'rgba(16,185,129,0.1)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                     <Award size={22} className="text-success" />
                  </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container">
        {/* ── TABS ───────────────────────────────────────────── */}
        <div style={{ display:'flex', gap:12, marginBottom:'3rem', background:'var(--bg-elevated)', padding:8, borderRadius:20, width:'fit-content', border:'1px solid var(--border-rich)' }}>
           {[
             { id:'active', label:'Active Engagements', count: activeJobs.length },
             { id:'pool', label:'Invitation Pool', count: nearbyBookings.length },
             { id:'history', label:'Archive', count: historyJobs.length },
             { id:'profile', label:'Business Profile', count: 0 }
           ].map(t => (
             <button 
                key={t.id} onClick={() => setTab(t.id)} 
                className="btn" 
                style={{ 
                    borderRadius:14, padding:'0.75rem 2rem', fontSize:'0.9rem', fontWeight: 800,
                    background: tab === t.id ? 'var(--accent)' : 'transparent',
                    color: tab === t.id ? 'var(--primary)' : 'var(--text-dim)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                }}>
                {t.label} {t.count > 0 && <span style={{ marginLeft:8, opacity:0.6 }}>[{t.count}]</span>}
             </button>
           ))}
        </div>

        {/* ── TAB CONTENT ─────────────────────────────────────── */}
        {isLoading ? <Loader /> : (
          <div className="reveal-up">
            {tab === 'pool' && (
              <div style={{ display:'grid', gap:24 }}>
                {nearbyBookings.length === 0 ? (
                  <div className="glass-card" style={{ textAlign:'center', padding:'8rem 2rem' }}>
                     <Bell size={64} style={{ opacity:0.1, marginBottom:24 }} />
                     <h4 style={{ fontSize:'1.5rem', color:'white', marginBottom:12 }}>No New Opportunities</h4>
                     <p style={{ color:'var(--text-muted)', maxWidth:400, margin:'0 auto' }}>Stay online to receive luxury job invitations in real-time.</p>
                  </div>
                ) : nearbyBookings.map(b => (
                  <div key={b._id} className="glass-card" style={{ padding:'2.5rem', display:'flex', gap:32, alignItems:'center' }}>
                     <div style={{ width:100, height:100, borderRadius:24, overflow:'hidden', border:'1px solid var(--border-rich)' }}>
                        <img src={getCategoryThumbnail(b.service?.category?.name)} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                     </div>
                     <div style={{ flex:1 }}>
                        <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:10 }}>
                           <span className="badge badge-pending">PRIVATE INVITATION</span>
                           <span style={{ color:'var(--text-muted)', fontSize:'0.8rem', fontWeight:700 }}>#{b._id?.slice(-8).toUpperCase()}</span>
                        </div>
                        <h4 style={{ fontWeight:800, fontSize:'1.75rem', color:'white' }}>{b.service?.title}</h4>
                        <div style={{ display:'flex', gap:12, alignItems:'center', marginTop:4 }}>
                           <p style={{ fontSize:'1rem', color:'var(--text-dim)' }}><MapPin size={16} className="text-accent" style={{ marginRight:8 }} /> {b.address?.street}, {b.address?.city}</p>
                           {b.userLocation && <span style={{ background:'rgba(34,197,94,0.1)', color:'#22c55e', padding:'0.25rem 0.75rem', borderRadius:99, fontSize:'0.7rem', fontWeight:800, display:'flex', alignItems:'center', gap:4 }}><div className="pulse" style={{ width:6, height:6, background:'#22c55e', borderRadius:99 }} /> LIVE GPS</span>}
                        </div>
                     </div>
                     <div style={{ textAlign:'right' }}>
                        <p style={{ fontWeight:900, fontSize:'2.25rem', color:'white' }}>₹{b.totalAmount}</p>
                        <button onClick={() => handleAccept(b._id)} className="btn btn-primary" style={{ marginTop:16, width:'100%', borderRadius:12 }}>Secure Job →</button>
                     </div>
                  </div>
                ))}
              </div>
            )}

            {tab === 'active' && (
              <div style={{ display:'grid', gap:32 }}>
                {activeJobs.length === 0 ? (
                   <p style={{ textAlign:'center', color:'var(--text-muted)', padding:'6rem', fontSize:'1.1rem' }}>No active engagements. Your pool is waiting.</p>
                ) : activeJobs.map(b => (
                  <div key={b._id} className="glass-card scale-in" style={{ border:'1px solid var(--border-accent)', overflow:'hidden' }}>
                     <div style={{ padding:'2rem', background:'rgba(250,204,21,0.03)', borderBottom:'1px solid var(--border-subtle)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                        <div style={{ display:'flex', alignItems:'center', gap:16 }}>
                           <div className="avatar" style={{ width:48, height:48, borderRadius:14, background:'var(--accent)', color:'var(--primary)', fontWeight:900 }}>{b.user?.name?.charAt(0)}</div>
                           <div>
                              <p style={{ fontWeight:800, fontSize:'1.1rem', color:'white' }}>{b.user?.name}</p>
                              <p style={{ fontSize:'0.75rem', color:'var(--text-muted)', textTransform:'uppercase', fontWeight:800 }}>Premium Client</p>
                           </div>
                        </div>
                        <div style={{ display:'flex', gap:12 }}>
                           <a href={`tel:${b.user?.phone}`} className="btn btn-outline" style={{ width:48, height:48, padding:0, borderRadius:12 }}><Phone size={20} /></a>
                           <button className="btn btn-outline" style={{ width:48, height:48, padding:0, borderRadius:12 }}><MessageSquare size={20} /></button>
                        </div>
                     </div>
                     
                     <div style={{ padding:'2.5rem', display:'grid', gridTemplateColumns:'1fr 1fr', gap:48 }} className="grid-mobile-stack">
                        <div>
                           <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:16 }}>
                              <span className={`badge ${statusConfig[b.status]?.cls}`}>{statusConfig[b.status]?.icon} {statusConfig[b.status]?.label.toUpperCase()}</span>
                           </div>
                           <h4 style={{ fontWeight:800, fontSize:'1.75rem', marginBottom:20, color:'white' }}>{b.service?.title}</h4>
                           
                           <div style={{ display:'grid', gap:16, marginBottom:40 }}>
                              <div style={{ display:'flex', alignItems:'center', gap:12, color:'var(--text-dim)' }}>
                                 <Calendar size={18} className="text-accent" />
                                 <span style={{ fontWeight:600 }}>{new Date(b.scheduledDate).toLocaleDateString(undefined, { dateStyle:'full' })}</span>
                              </div>
                              <div style={{ display:'flex', alignItems:'center', gap:12, color:'var(--text-dim)' }}>
                                 <Clock size={18} className="text-accent" />
                                 <span style={{ fontWeight:600 }}>{b.scheduledTime}</span>
                              </div>
                              <div style={{ display:'flex', alignItems:'center', gap:12, color:'var(--text-dim)' }}>
                                 <MapPin size={18} className="text-accent" />
                                 <span style={{ fontWeight:600 }}>{b.address?.street}, {b.address?.city}</span>
                              </div>
                           </div>
                           
                           <div style={{ background:'var(--bg-elevated)', padding:'1.5rem', borderRadius:20, border:'1px solid var(--border-rich)' }}>
                              <p style={{ fontSize:'0.7rem', fontWeight:800, color:'var(--text-muted)', marginBottom:16, letterSpacing:'0.1em' }}>EXECUTION CONTROL</p>
                              <div style={{ display:'flex', gap:12 }}>
                                 {b.status === 'accepted' && <button onClick={() => handleStatusUpdate(b._id, 'on_the_way')} className="btn btn-primary" style={{ flex:1, height:56 }}>Initiate Journey</button>}
                                 {b.status === 'on_the_way' && <button onClick={() => handleStatusUpdate(b._id, 'arrived')} className="btn btn-primary" style={{ flex:1, height:56 }}>Log Arrival</button>}
                                 {b.status === 'arrived' && <button onClick={() => handleStatusUpdate(b._id, 'completed')} className="btn btn-primary" style={{ flex:1, height:56, background:'var(--success)', color:'white' }}>Mark as Fulfilled</button>}
                              </div>
                           </div>
                        </div>
                        
                        <div style={{ borderRadius:24, overflow:'hidden', border:'1px solid var(--border-rich)', position:'relative' }}>
                           <div style={{ position:'absolute', top:20, left:20, zIndex:10, background:'rgba(10,10,10,0.8)', padding:'0.5rem 1rem', borderRadius:99, border:'1px solid var(--border-accent)', display:'flex', alignItems:'center', gap:8 }}>
                              <div className="pulse" style={{ width:10, height:10, borderRadius:99, background:'var(--accent)' }} />
                              <span style={{ fontSize:'0.7rem', fontWeight:900, color:'var(--accent)', letterSpacing:'0.05em' }}>LIVE NAV ACTIVE</span>
                           </div>
                           <LiveTrackingMap bookingId={b._id} userLocation={b.userLocation} isProvider={true} />
                        </div>
                     </div>
                  </div>
                ))}
              </div>
            )}

            {tab === 'history' && (
               <div style={{ display:'grid', gap:16 }}>
                  {historyJobs.map(b => (
                    <div key={b._id} className="glass-card" style={{ padding:'1.5rem 2.5rem', display:'flex', justifyContent:'space-between', alignItems:'center', opacity:0.8 }}>
                       <div style={{ display:'flex', alignItems:'center', gap:20 }}>
                          <div style={{ width:48, height:48, borderRadius:12, background:'rgba(16,185,129,0.1)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                             <CheckCircle size={24} className="text-success" />
                          </div>
                          <div>
                             <p style={{ fontWeight:800, fontSize:'1.1rem', color:'white' }}>{b.service?.title}</p>
                             <p style={{ fontSize:'0.8rem', color:'var(--text-muted)' }}>Fulfillment Date: {new Date(b.createdAt).toLocaleDateString()}</p>
                          </div>
                       </div>
                       <div style={{ textAlign:'right' }}>
                          <p style={{ fontWeight:900, fontSize:'1.4rem', color:'white' }}>₹{b.totalAmount}</p>
                          <span style={{ fontSize:'0.7rem', color:'var(--text-muted)', fontWeight:700 }}>PAID</span>
                       </div>
                    </div>
                  ))}
               </div>
            )}

            {tab === 'profile' && (
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:40 }} className="grid-mobile-stack">
                 <div className="glass-card" style={{ padding:'3rem' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:24, marginBottom:40 }}>
                       <div className="avatar" style={{ width:100, height:100, fontSize:'2.5rem', borderRadius:24, background:'var(--brand-grad)', color:'var(--primary)' }}>{user.name.charAt(0)}</div>
                       <div>
                          <h2 style={{ fontSize:'2rem', fontWeight:800, color:'white' }}>{user.name}</h2>
                          <p style={{ color:'var(--text-dim)', fontSize:'1.1rem' }}>{user.email}</p>
                          <div style={{ display:'flex', gap:10, marginTop:16 }}>
                             <span className="badge badge-pending">OFFICIAL EXPERT</span>
                             {user.providerProfile?.isVerified && <span className="badge badge-success">PLATINUM VERIFIED</span>}
                          </div>
                       </div>
                    </div>

                    <div style={{ display:'grid', gap:32 }}>
                       <div>
                          <label style={{ fontSize:'0.75rem', fontWeight:800, color:'var(--text-muted)', marginBottom:12, display:'block', letterSpacing:'0.1em' }}>PROFESSIONAL BIOGRAPHY</label>
                          <p style={{ fontSize:'1rem', color:'var(--text-dim)', lineHeight:1.8, background:'rgba(255,255,255,0.02)', padding:'1.5rem', borderRadius:20, border:'1px solid var(--border-subtle)' }}>
                             {user.providerProfile?.bio || "Excellence is not an act, but a habit. Share your professional story here."}
                          </p>
                       </div>
                       <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>
                          <div style={{ background:'rgba(255,255,255,0.02)', padding:'1.5rem', borderRadius:20, border:'1px solid var(--border-subtle)' }}>
                             <p style={{ fontSize:'0.65rem', fontWeight:800, color:'var(--text-muted)', letterSpacing:'0.1em' }}>TENURE</p>
                             <p style={{ fontSize:'1.5rem', fontWeight:900, color:'white' }}>{user.providerProfile?.experience || 0} Years</p>
                          </div>
                          <div style={{ background:'rgba(255,255,255,0.02)', padding:'1.5rem', borderRadius:20, border:'1px solid var(--border-subtle)' }}>
                             <p style={{ fontSize:'0.65rem', fontWeight:800, color:'var(--text-muted)', letterSpacing:'0.1em' }}>BASE OPERATIONS</p>
                             <p style={{ fontSize:'1.5rem', fontWeight:900, color:'white' }}>{user.address?.city || 'Not Set'}</p>
                          </div>
                       </div>
                    </div>
                 </div>

                 <div className="glass-card" style={{ padding:'3rem' }}>
                    <h3 style={{ fontSize:'1.5rem', fontWeight:800, marginBottom:24, display:'flex', alignItems:'center', gap:12 }}>
                       <Briefcase size={24} className="text-accent" /> Portfolio of Expertise
                    </h3>
                    <p style={{ fontSize:'1rem', color:'var(--text-dim)', marginBottom:32, lineHeight:1.6 }}>Define the specialized luxury services you are authorized to provide.</p>
                    <div style={{ display:'flex', gap:10, marginBottom:32 }}>
                       <input 
                         type="text" 
                         id="new-skill-input"
                         placeholder="Add custom skill (e.g. Masonry)" 
                         className="input-field" 
                         onKeyPress={(e) => {
                           if (e.key === 'Enter') {
                             handleSkillToggle(e.target.value);
                             e.target.value = '';
                           }
                         }}
                       />
                       <button 
                         onClick={() => {
                           const input = document.getElementById('new-skill-input');
                           handleSkillToggle(input.value);
                           input.value = '';
                         }} 
                         className="btn btn-primary" 
                         style={{ padding:'0 1.5rem' }}
                       >Add</button>
                    </div>

                    <div style={{ display:'flex', flexWrap:'wrap', gap:12 }}>
                       {user.providerProfile?.skills?.map(skill => (
                          <div
                            key={skill}
                            style={{
                              padding: '0.75rem 1.75rem', borderRadius: 14, fontSize: '0.85rem', fontWeight: 800,
                              background: 'var(--accent)',
                              border: '1px solid transparent',
                              color: 'var(--primary)',
                              display: 'flex', alignItems: 'center', gap: 10
                            }}
                          >
                             {skill}
                             <X 
                               size={14} 
                               style={{ cursor: 'pointer', opacity: 0.7 }} 
                               onClick={() => handleSkillToggle(skill)} 
                             />
                          </div>
                       ))}
                    </div>

                    <div style={{ marginTop:48, borderTop:'1px solid var(--border-subtle)', paddingTop:32 }}>
                       <p style={{ fontSize:'0.75rem', fontWeight:800, color:'var(--text-muted)', marginBottom:16 }}>AVAILABLE TEMPLATES</p>
                       <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
                          {availableSkills.filter(s => !user.providerProfile?.skills?.includes(s)).map(skill => (
                             <button
                               key={skill}
                               onClick={() => handleSkillToggle(skill)}
                               style={{
                                 padding: '0.5rem 1rem', borderRadius: 10, fontSize: '0.75rem', fontWeight: 700,
                                 background: 'rgba(255,255,255,0.02)',
                                 border: '1px solid var(--border-rich)',
                                 color: 'var(--text-dim)',
                                 cursor: 'pointer'
                               }}
                             >
                                + {skill}
                             </button>
                          ))}
                       </div>
                    </div>
                    <div style={{ marginTop:48, padding:'1.5rem', borderRadius:20, background:'rgba(250,204,21,0.05)', border:'1px dashed var(--border-accent)', display:'flex', alignItems:'center', gap:16 }}>
                       <ShieldCheck size={32} className="text-accent" />
                       <p style={{ fontSize:'0.85rem', color:'var(--text-dim)', fontWeight:600 }}>Your skills are visible to clients looking for top-tier expertise in your region.</p>
                    </div>
                 </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProviderDashboard;
