import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMyBookings, cancelBooking, addReview } from '../redux/slices/bookingsSlice';
import { Link } from 'react-router-dom';
import Loader from '../components/common/Loader';
import LiveTrackingMap from '../components/booking/LiveTrackingMap';
import ChatWindow from '../components/booking/ChatWindow';
import { 
  Calendar, Clock, MapPin, Star, X, CheckCircle, XCircle, 
  Package, AlertCircle, Navigation, Sparkles, LayoutGrid, 
  ChevronRight, Phone, MessageSquare, Info, Zap, User, ArrowRight,
  Settings, Briefcase, ShieldCheck, Search, Sliders
} from 'lucide-react';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';
import { getCategoryThumbnail } from '../utils/serviceUtils';
import api from '../services/api';

const statusConfig = {
  pending:     { label:'Requested',   cls:'badge-pending',     icon:'⏳', desc: 'Finding the best expert for you...' },
  accepted:    { label:'Accepted',    cls:'badge-success',   icon:'✅', desc: 'Expert assigned! Waiting for start.' },
  on_the_way:  { label:'On The Way',  cls:'badge-success', icon:'🛵', desc: 'Professional is heading your way.' },
  arrived:     { label:'Arrived',     cls:'badge-success', icon:'📍', desc: 'Professional has arrived!' },
  completed:   { label:'Completed',   cls:'badge-success',   icon:'🎉', desc: 'Job finished successfully.' },
  cancelled:   { label:'Cancelled',   cls:'badge-error',   icon:'❌', desc: 'Booking was cancelled.' },
  rejected:    { label:'Rejected',    cls:'badge-error',    icon:'🚫', desc: 'Request was declined.' },
};

const ReviewModal = ({ bookingId, onClose, onSubmit }) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    await onSubmit({ id: bookingId, rating, comment });
    setSubmitting(false);
    onClose();
  };

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.85)', backdropFilter:'blur(10px)', zIndex:3000, display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
       <div className="glass-card fade-in" style={{ width:'100%', maxWidth:500, padding:'3rem', border:'1px solid var(--border-accent)' }}>
          <div style={{ textAlign:'center', marginBottom:32 }}>
             <div style={{ width:64, height:64, borderRadius:20, background:'var(--accent-soft)', display:'inline-flex', alignItems:'center', justifyContent:'center', marginBottom:20 }}>
                <Star size={32} className="text-accent" fill="var(--accent)" />
             </div>
             <h3 style={{ fontSize:'2rem', fontWeight:800 }}>How was your experience?</h3>
             <p style={{ color:'var(--text-muted)', marginTop:8 }}>Your feedback helps us maintain the gold standard.</p>
          </div>

          <form onSubmit={handleSubmit} style={{ display:'grid', gap:24 }}>
             <div style={{ display:'flex', justifyContent:'center', gap:12 }}>
                {[1,2,3,4,5].map(s => (
                  <button 
                    key={s} type="button" 
                    onClick={() => setRating(s)}
                    style={{ background:'none', border:'none', cursor:'pointer', transition:'transform 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.2)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                  >
                    <Star size={32} fill={s <= rating ? 'var(--accent)' : 'none'} color={s <= rating ? 'var(--accent)' : 'var(--text-muted)'} />
                  </button>
                ))}
             </div>

             <textarea 
               placeholder="Share your thoughts on the professional's work..."
               value={comment}
               onChange={e => setComment(e.target.value)}
               required
               style={{ width:'100%', minHeight:120, padding:'1.25rem', borderRadius:16, background:'rgba(255,255,255,0.03)', border:'1px solid var(--border-rich)', color:'white', resize:'none', fontSize:'1rem' }}
             />

             <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
                <button type="button" onClick={onClose} className="btn btn-outline" style={{ borderRadius:14 }}>Not Now</button>
                <button type="submit" disabled={submitting} className="btn btn-primary" style={{ borderRadius:14 }}>{submitting ? 'Submitting...' : 'Submit Review'}</button>
             </div>
          </form>
       </div>
    </div>
  );
};

const StatusStepper = ({ status }) => {
  const steps = ['pending', 'accepted', 'on_the_way', 'arrived', 'completed'];
  const currentIndex = steps.indexOf(status);

  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginTop:48, position:'relative', padding:'0 20px' }}>
       {/* Progress Line */}
       <div style={{ position:'absolute', top:20, left:40, right:40, height:2, background:'var(--border-rich)', zIndex:0 }} />
       <div style={{ position:'absolute', top:20, left:40, width: `${(currentIndex / (steps.length - 1)) * 100}%`, height:2, background:'var(--accent)', transition:'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)', zIndex:1 }} />

       {steps.map((s, i) => {
          const isActive = i <= currentIndex;
          const isCurrent = i === currentIndex;
          return (
            <div key={s} style={{ position:'relative', zIndex:2, textAlign:'center', flex:1 }}>
               <div style={{ 
                  width:40, height:40, borderRadius:12, margin:'0 auto',
                  background: isActive ? 'var(--accent)' : 'var(--bg-elevated)',
                  border: `1.5px solid ${isActive ? 'var(--accent)' : 'var(--border-rich)'}`,
                  display:'flex', alignItems:'center', justifyContent:'center',
                  boxShadow: isCurrent ? 'var(--brand-glow)' : 'none',
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  transform: isCurrent ? 'scale(1.1)' : 'scale(1)'
               }}>
                  {isActive ? <CheckCircle size={18} color="var(--primary)" /> : <div style={{ width:6, height:6, borderRadius:99, background:'var(--text-muted)' }} />}
               </div>
               <p style={{ fontSize:'0.6rem', fontWeight:800, marginTop:12, color: isActive ? 'white' : 'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.1em' }}>{s.replace('_', ' ')}</p>
            </div>
          );
       })}
    </div>
  );
};

const ActiveTracker = ({ booking, currentUser }) => {
  const [showChat, setShowChat] = useState(false);
  const cfg = statusConfig[booking.status] || {};
  const isPending = booking.status === 'pending';
  const showMap = ['on_the_way', 'arrived'].includes(booking.status);

  return (
    <div className="glass-card reveal-up" style={{ 
      background:'linear-gradient(135deg, rgba(20,20,20,0.9) 0%, rgba(30,30,30,0.9) 100%)', 
      padding:'3rem', marginBottom:'4rem', border:'1px solid var(--border-accent)'
    }}>
      <div style={{ display:'flex', gap:32, flexWrap:'wrap', alignItems:'center' }}>
        <div style={{ width:100, height:100, borderRadius:24, background:'var(--brand-grad)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, boxShadow:'0 15px 30px rgba(250,204,21,0.2)' }}>
           {isPending ? <Zap size={48} className="pulse" color="var(--primary)" /> : <Navigation size={48} className="pulse" color="var(--primary)" />}
        </div>
        <div style={{ flex:1 }}>
           <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:12 }}>
              <span className={`badge ${cfg.cls}`}>{cfg.icon} {cfg.label}</span>
              <span style={{ fontSize:'0.8rem', color:'var(--text-muted)', fontWeight:700, letterSpacing:'0.05em' }}>ID: #{booking._id?.slice(-8).toUpperCase()}</span>
           </div>
           <h2 style={{ fontSize:'2.5rem', fontWeight:800, marginBottom:8 }}>{cfg.desc}</h2>
           <p style={{ color:'var(--text-dim)', fontSize:'1.1rem' }}>
              {isPending ? "Our AI is matching you with elite professionals..." : 
               `Assigned Expert: ${booking.providerName || booking.provider?.name || 'Fixit Pro'}`}
           </p>
        </div>
        {booking.status !== 'pending' && (
           <div style={{ display:'flex', gap:16 }}>
              <button onClick={() => setShowChat(true)} className="btn btn-outline" style={{ width:60, height:60, borderRadius:16, padding:0, position:'relative' }}>
                 <MessageSquare size={24} />
                 <span style={{ position:'absolute', top:15, right:15, width:10, height:10, background:'var(--accent)', borderRadius:99, border:'2px solid var(--bg-card)' }} />
              </button>
              <a href={`tel:${booking.provider?.phone || '9555977917'}`} className="btn btn-primary" style={{ width:60, height:60, borderRadius:16, padding:0 }}>
                 <Phone size={24} />
              </a>
           </div>
        )}
      </div>

      <StatusStepper status={booking.status} />
      
      {showMap && (
         <div style={{ marginTop:'4rem', borderTop:'1px solid var(--border-subtle)', paddingTop:'4rem' }}>
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:24 }}>
               <div className="pulse" style={{ width:12, height:12, borderRadius:99, background:'var(--accent)' }} />
               <span style={{ fontSize:'0.85rem', fontWeight:800, color:'var(--accent)', letterSpacing:'0.1em' }}>LIVE GPS TRACKING ACTIVE</span>
            </div>
            <div style={{ borderRadius:24, overflow:'hidden', border:'1px solid var(--border-rich)' }}>
               <LiveTrackingMap bookingId={booking._id} userLocation={booking.userLocation} isProvider={false} />
            </div>
         </div>
      )}

      {showChat && (
        <ChatWindow 
          bookingId={booking._id} 
          currentUser={currentUser} 
          recipientName={booking.providerName || booking.provider?.name || 'Professional'} 
          onClose={() => setShowChat(false)} 
        />
      )}
    </div>
  );
};

const UserDashboard = () => {
  const dispatch = useDispatch();
  const { user } = useSelector(s => s.auth);
  const { bookings, isLoading } = useSelector(s => s.bookings);
  const [filter, setFilter] = useState('');
  
  const [activeCategory, setActiveCategory] = useState('Cleaning');
  const [experts, setExperts] = useState([]);
  const [isExpertsLoading, setIsExpertsLoading] = useState(false);
  const [reviewingBookingId, setReviewingBookingId] = useState(null);
  
  const categories = [
    { name: 'Cleaning', icon: <Package size={20} /> },
    { name: 'AC Repair', icon: <Zap size={20} /> },
    { name: 'Electrical', icon: <LayoutGrid size={20} /> },
    { name: 'Plumbing', icon: <MapPin size={20} /> },
    { name: 'Painting', icon: <Sparkles size={20} /> },
    { name: 'Appliance Repair', icon: <Settings size={20} /> },
    { name: 'Carpentry', icon: <Briefcase size={20} /> }
  ];

  useEffect(() => { 
    dispatch(fetchMyBookings(filter ? { status: filter } : {})); 
    
    // Fetch real experts for active category
    setIsExpertsLoading(true);
    api.get('/auth/providers', { params: { skill: activeCategory } }).then(res => {
      setExperts(res.data.data);
      setIsExpertsLoading(false);
    }).catch(() => setIsExpertsLoading(false));

    const socketUrl = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5001';
    const socket = io(socketUrl);
    bookings.forEach(b => socket.emit('join_booking', b._id));
    
    socket.on('booking_accepted', (data) => {
      toast.success(`${data.provider} is assigned to your request!`, { duration: 6000 });
      dispatch(fetchMyBookings({}));
    });

    socket.on('status_updated', (data) => {
      toast.success(`Update: ${statusConfig[data.status]?.label}`);
      dispatch(fetchMyBookings({}));
    });

    return () => socket.disconnect();
  }, [dispatch, filter, activeCategory]);

  const handleReviewSubmit = async (data) => {
    await dispatch(addReview(data));
    dispatch(fetchMyBookings({}));
  };

  const activeBooking = bookings.find(b => ['pending', 'accepted', 'on_the_way', 'arrived'].includes(b.status));

  return (
    <div className="fade-in" style={{ paddingBottom:120 }}>
      {reviewingBookingId && (
        <ReviewModal 
          bookingId={reviewingBookingId} 
          onClose={() => setReviewingBookingId(null)} 
          onSubmit={handleReviewSubmit}
        />
      )}
      {/* ── HEADER ────────────────────────────────────────────── */}
      <section style={{ padding: '4rem 0', borderBottom: '1px solid var(--border-subtle)', marginBottom: '4rem' }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 32, flexWrap: 'wrap' }}>
            <div>
              <span style={{ color: 'var(--accent)', fontWeight: 800, fontSize: '0.8rem', letterSpacing: '0.2em' }}>CLIENT COMMAND CENTER</span>
              <h1 style={{ fontSize:'3.5rem', marginTop:'0.5rem' }}>Luxury Home Concierge.</h1>
              <p style={{ color:'var(--text-dim)', fontSize:'1.1rem', marginTop:8 }}>Welcome back, <span style={{ color:'white', fontWeight:700 }}>{user?.name}</span>. Your comfort is our priority.</p>
            </div>
            <Link to="/services" className="btn btn-primary" style={{ padding:'1rem 2.5rem', borderRadius:16, fontSize:'1rem' }}>+ Browse Full Catalogue</Link>
          </div>
        </div>
      </section>

      <div className="container">
        {activeBooking && <ActiveTracker booking={activeBooking} currentUser={user} />}

        {/* ── MARKETPLACE EXPLORER ────────────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 48, marginBottom: '8rem' }} className="grid-mobile-stack">
          {/* Sidebar */}
          <aside>
            <h4 style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: 24, letterSpacing: '0.15em' }}>SELECT SERVICE</h4>
            <div style={{ display: 'grid', gap: 10 }}>
              {categories.map(cat => (
                <button
                  key={cat.name}
                  onClick={() => setActiveCategory(cat.name)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 16, padding: '1.25rem 1.5rem', borderRadius: 16,
                    background: activeCategory === cat.name ? 'var(--brand-grad)' : 'var(--bg-elevated)',
                    border: '1px solid ' + (activeCategory === cat.name ? 'transparent' : 'var(--border-rich)'),
                    color: activeCategory === cat.name ? 'var(--primary)' : 'white',
                    fontWeight: 800, cursor: 'pointer', transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    boxShadow: activeCategory === cat.name ? 'var(--brand-glow)' : 'none'
                  }}
                >
                  {cat.icon} {cat.name}
                </button>
              ))}
            </div>
          </aside>

          {/* Expert List */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
               <div>
                 <h3 style={{ fontSize: '2rem', fontWeight: 800 }}>{activeCategory} Professionals</h3>
                 <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Verified experts with the {activeCategory} skill.</p>
               </div>
               <span style={{ background:'var(--accent-soft)', color:'var(--accent)', padding:'0.5rem 1rem', borderRadius:99, fontSize:'0.75rem', fontWeight:800 }}>{experts.length} MATCHES FOUND</span>
            </div>

            {isExpertsLoading ? <Loader /> : (
              <div style={{ display: 'grid', gap: 20 }}>
                {experts.length === 0 ? (
                  <div className="glass-card" style={{ padding: '6rem', textAlign: 'center' }}>
                    <Info size={48} className="text-dim" style={{ marginBottom: 20, opacity: 0.2 }} />
                    <p style={{ color: 'var(--text-dim)', fontSize: '1.1rem' }}>No professionals currently have the <strong>{activeCategory}</strong> skill.</p>
                  </div>
                ) : (
                  experts.map(expert => (
                    <div key={expert._id} className="glass-card reveal-up" style={{ padding: '2rem', display: 'flex', gap: 32, alignItems: 'center' }}>
                      <div className="avatar" style={{ width: 80, height: 80, fontSize: '1.75rem', borderRadius: 20, background: 'var(--bg-elevated)', border: '1px solid var(--border-rich)', color: 'var(--accent)' }}>{expert.name.charAt(0)}</div>
                      <div style={{ flex: 1 }}>
                        <h5 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'white', marginBottom: 4 }}>{expert.name}</h5>
                        <p style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>{expert.email}</p>
                        <div style={{ display: 'flex', gap: 16, marginTop: 12 }}>
                           <span style={{ display:'flex', alignItems:'center', gap:6, fontSize:'0.8rem', color:'var(--text-muted)' }}><Star size={14} fill="var(--accent)" color="var(--accent)" /> {expert.providerProfile?.rating || '5.0'}</span>
                           <span style={{ display:'flex', alignItems:'center', gap:6, fontSize:'0.8rem', color:'var(--text-muted)' }}><ShieldCheck size={14} className="text-success" /> Verified Expert</span>
                        </div>
                      </div>
                      <Link to={`/providers/${expert._id}`} className="btn btn-outline" style={{ padding: '0.8rem 1.5rem', borderRadius: 12 }}>Book Now</Link>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── HISTORY ───────────────────────────────────────────── */}
        <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', marginBottom:'3rem', gap:24, flexWrap:'wrap' }}>
           <div>
              <span style={{ color: 'var(--accent)', fontWeight: 800, fontSize: '0.7rem', letterSpacing: '0.15em' }}>SERVICE ARCHIVES</span>
              <h3 style={{ fontSize:'2rem', marginTop:8 }}>Booking History</h3>
           </div>
           <div style={{ display:'flex', gap:10, overflowX:'auto', paddingBottom:10 }} className="hide-scrollbar">
              {['','pending','accepted','on_the_way','completed','cancelled'].map(s => (
                <button 
                  key={s} onClick={() => setFilter(s)} 
                  className="btn"
                  style={{ 
                    padding:'0.6rem 1.5rem', fontSize:'0.75rem', borderRadius:99, 
                    background: filter === s ? 'var(--accent)' : 'var(--bg-elevated)',
                    color: filter === s ? 'var(--primary)' : 'var(--text-dim)',
                    border: '1px solid ' + (filter === s ? 'transparent' : 'var(--border-rich)'),
                    fontWeight: 800
                  }}
                >
                  {s ? s.replace('_', ' ').toUpperCase() : 'ALL'}
                </button>
              ))}
           </div>
        </div>

        {isLoading ? <Loader /> : (
          <div style={{ display:'grid', gap:20 }}>
            {bookings.length === 0 ? (
               <div className="glass-card" style={{ textAlign:'center', padding:'8rem 2rem' }}>
                  <Package size={64} color="var(--text-muted)" style={{ marginBottom:24, opacity:0.3 }} />
                  <h4 style={{ fontSize:'1.5rem', color:'white', marginBottom:12 }}>No Records Found</h4>
                  <p style={{ color:'var(--text-muted)', maxWidth:400, margin:'0 auto' }}>You haven't booked any services yet. Start your luxury home journey today.</p>
               </div>
            ) : bookings.map(b => (
              <div key={b._id} className="glass-card" style={{ padding:'2rem', display:'flex', gap:32, flexWrap:'wrap', alignItems:'center' }}>
                <div style={{ width:100, height:100, borderRadius:20, overflow:'hidden', border:'1px solid var(--border-rich)', flexShrink:0 }}>
                   <img src={getCategoryThumbnail(b.service?.category?.name)} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                </div>
                <div style={{ flex:1 }}>
                   <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:8 }}>
                      <h4 style={{ fontWeight:800, fontSize:'1.4rem', color:'white' }}>{b.service?.title}</h4>
                      <span className={`badge ${statusConfig[b.status]?.cls}`}>{statusConfig[b.status]?.label}</span>
                   </div>
                   <div style={{ display:'flex', flexWrap:'wrap', gap:24, color:'var(--text-dim)', fontSize:'0.9rem' }}>
                      <span style={{ display:'flex', alignItems:'center', gap:8 }}><Calendar size={16} className="text-accent" />{new Date(b.scheduledDate).toLocaleDateString(undefined, { dateStyle: 'long' })}</span>
                      <span style={{ display:'flex', alignItems:'center', gap:8 }}><Clock size={16} className="text-accent" />{b.scheduledTime}</span>
                      <span style={{ display:'flex', alignItems:'center', gap:8 }}><User size={16} className="text-accent" />{b.provider?.name || b.providerName || 'Assigning Expert...'}</span>
                   </div>
                </div>
                 <div style={{ textAlign:'right', minWidth:180, display:'flex', flexDirection:'column', gap:12 }}>
                    <div style={{ fontWeight:900, fontSize:'2rem', color:'white' }}>₹{b.totalAmount}</div>
                    
                    {b.status === 'completed' && !b.review && (
                       <button onClick={() => setReviewingBookingId(b._id)} className="btn btn-primary" style={{ padding:'0.6rem 1.2rem', borderRadius:10, fontSize:'0.8rem', gap:8 }}>
                          <Star size={14} fill="currentColor" /> LEAVE REVIEW
                       </button>
                    )}

                    {b.status === 'completed' && b.review && (
                       <div style={{ display:'flex', alignItems:'center', gap:8, color:'var(--accent)', fontWeight:800, fontSize:'0.8rem', justifyContent:'flex-end' }}>
                          <CheckCircle size={14} /> REVIEWED ({b.review.rating}/5)
                       </div>
                    )}

                    <Link to={`/services/${b.service?._id}`} className="btn btn-outline" style={{ borderRadius:10, padding:'0.6rem 1.2rem', fontSize:'0.8rem', border:'1px solid var(--border-rich)' }}>
                       View Details <ArrowRight size={14} style={{ marginLeft:8 }} />
                    </Link>
                 </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;
