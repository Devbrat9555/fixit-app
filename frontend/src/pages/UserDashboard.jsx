import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMyBookings, cancelBooking, addReview } from '../redux/slices/bookingsSlice';
import { Link } from 'react-router-dom';
import Loader from '../components/common/Loader';
import LiveTrackingMap from '../components/booking/LiveTrackingMap';
import { Calendar, Clock, MapPin, Star, X, CheckCircle, XCircle, Package, AlertCircle, Navigation } from 'lucide-react';

const statusConfig = {
  pending:     { label:'Pending',     cls:'badge-pending',     icon:'⏳' },
  confirmed:   { label:'Confirmed',   cls:'badge-confirmed',   icon:'✅' },
  in_progress: { label:'In Progress', cls:'badge-in_progress', icon:'🔧' },
  completed:   { label:'Completed',   cls:'badge-completed',   icon:'🎉' },
  cancelled:   { label:'Cancelled',   cls:'badge-cancelled',   icon:'❌' },
  rejected:    { label:'Rejected',    cls:'badge-rejected',    icon:'🚫' },
};

const ReviewModal = ({ booking, onClose, onSubmit }) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-content" style={{ padding:'1.75rem' }}>
        <h3 style={{ fontWeight:700, fontSize:'1.1rem', marginBottom:4 }}>Rate this Service ⭐</h3>
        <p style={{ color:'var(--text-muted)', fontSize:'0.85rem', marginBottom:'1.25rem' }}>{booking.service?.title}</p>
        <div style={{ display:'flex', gap:8, marginBottom:'1.25rem' }}>
          {[1,2,3,4,5].map(s => (
            <button key={s} onClick={() => setRating(s)} style={{ background:'none', border:'none', cursor:'pointer', fontSize:'2rem', transition:'transform 0.1s' }}
              onMouseEnter={e => e.currentTarget.style.transform='scale(1.2)'}
              onMouseLeave={e => e.currentTarget.style.transform='scale(1)'}
            >
              <Star size={28} style={{ fill: s<=rating ? '#fbbf24' : 'transparent', color: s<=rating ? '#fbbf24' : 'var(--text-muted)' }} />
            </button>
          ))}
        </div>
        <textarea placeholder="Share your experience..." value={comment} onChange={e => setComment(e.target.value)}
          rows={3} className="input-field" style={{ resize:'none', marginBottom:'1rem' }} />
        <div style={{ display:'flex', gap:10 }}>
          <button onClick={onClose} className="btn btn-ghost" style={{ flex:1 }}>Cancel</button>
          <button onClick={() => onSubmit(booking._id, rating, comment)} className="btn btn-primary" style={{ flex:1 }}>Submit Review</button>
        </div>
      </div>
    </div>
  );
};

const UserDashboard = () => {
  const dispatch = useDispatch();
  const { user } = useSelector(s => s.auth);
  const { bookings, isLoading } = useSelector(s => s.bookings);
  const [filter, setFilter] = useState('');
  const [reviewBooking, setReviewBooking] = useState(null);

  useEffect(() => { dispatch(fetchMyBookings(filter ? { status: filter } : {})); }, [dispatch, filter]);

  const handleCancel = id => { if (window.confirm('Cancel this booking?')) dispatch(cancelBooking({ id, reason:'Cancelled by user' })); };
  const handleReview = async (id, rating, comment) => {
    await dispatch(addReview({ id, rating, comment }));
    setReviewBooking(null);
    dispatch(fetchMyBookings({}));
  };

  const counts = {
    total: bookings.length,
    pending: bookings.filter(b => b.status==='pending').length,
    completed: bookings.filter(b => b.status==='completed').length,
    cancelled: bookings.filter(b => b.status==='cancelled').length,
  };

  return (
    <div style={{ minHeight:'100vh', paddingTop:80, paddingBottom:48 }}>
      {reviewBooking && <ReviewModal booking={reviewBooking} onClose={() => setReviewBooking(null)} onSubmit={handleReview} />}
      <div className="container">
        {/* Header */}
        <div style={{ marginBottom:'2rem' }}>
          <h1 style={{ fontSize:'1.875rem', fontWeight:800, letterSpacing:'-0.02em' }}>My Bookings</h1>
          <p style={{ color:'var(--text-muted)', marginTop:4 }}>Welcome back, <span style={{ color:'var(--brand-400)', fontWeight:600 }}>{user?.name}</span></p>
        </div>

        {/* Stats */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:'1.75rem' }}>
          {[
            { label:'Total', value:counts.total, color:'#6366f1', bg:'rgba(99,102,241,0.1)' },
            { label:'Pending', value:counts.pending, color:'#fbbf24', bg:'rgba(245,158,11,0.1)' },
            { label:'Completed', value:counts.completed, color:'#34d399', bg:'rgba(16,185,129,0.1)' },
            { label:'Cancelled', value:counts.cancelled, color:'#f87171', bg:'rgba(239,68,68,0.1)' },
          ].map(s => (
            <div key={s.label} className="stat-card" style={{ textAlign:'center' }}>
              <div style={{ fontSize:'2rem', fontWeight:900, color:s.color }}>{s.value}</div>
              <div style={{ fontSize:'0.78rem', color:'var(--text-muted)', marginTop:4 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:'1.25rem' }}>
          {['','pending','confirmed','in_progress','completed','cancelled'].map(s => (
            <button key={s} onClick={() => setFilter(s)} style={{
              padding:'0.4rem 1rem', borderRadius:999, fontSize:'0.8rem', fontWeight:600,
              background: filter===s ? 'var(--brand-500)' : 'rgba(255,255,255,0.04)',
              border:`1px solid ${filter===s ? 'var(--brand-500)' : 'var(--border-subtle)'}`,
              color: filter===s ? 'white' : 'var(--text-secondary)',
              cursor:'pointer', transition:'all 0.2s', textTransform:'capitalize',
            }}>
              {s || 'All'}
            </button>
          ))}
        </div>

        {/* Bookings */}
        {isLoading ? <Loader /> : bookings.length === 0 ? (
          <div style={{ textAlign:'center', padding:'5rem 0' }}>
            <div style={{ fontSize:'4rem', marginBottom:'1rem' }}>📋</div>
            <h3 style={{ fontWeight:700, marginBottom:8 }}>No bookings yet</h3>
            <p style={{ color:'var(--text-muted)', marginBottom:'1.5rem' }}>Start by booking a service!</p>
            <Link to="/services" className="btn btn-primary">Browse Services</Link>
          </div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            {bookings.map(b => {
              const cfg = statusConfig[b.status] || {};
              return (
                <div key={b._id} className="card" style={{ padding:'1.25rem' }}>
                  <div style={{ display:'flex', gap:14, flexWrap:'wrap' }}>
                    <img src={b.service?.image || 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=100'}
                      alt={b.service?.title} onError={e => e.target.src='https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=100'}
                      style={{ width:64, height:64, borderRadius:10, objectFit:'cover', flexShrink:0 }} />
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:8, flexWrap:'wrap' }}>
                        <h3 style={{ fontWeight:700, fontSize:'0.95rem' }} className="line-clamp-1">{b.service?.title}</h3>
                        <span className={`badge ${cfg.cls}`}>{cfg.icon} {cfg.label}</span>
                      </div>
                      <p style={{ color:'var(--text-muted)', fontSize:'0.8rem', marginTop:4 }}>by {b.provider?.name}</p>
                      <div style={{ display:'flex', flexWrap:'wrap', gap:12, marginTop:8, fontSize:'0.78rem', color:'var(--text-muted)' }}>
                        <span style={{ display:'flex', alignItems:'center', gap:4 }}><Calendar size={11} />{new Date(b.scheduledDate).toLocaleDateString('en-IN')}</span>
                        <span style={{ display:'flex', alignItems:'center', gap:4 }}><Clock size={11} />{b.scheduledTime}</span>
                        <span style={{ display:'flex', alignItems:'center', gap:4 }}><MapPin size={11} />{b.address?.city}</span>
                      </div>
                    </div>
                    <div style={{ textAlign:'right', display:'flex', flexDirection:'column', gap:8, alignItems:'flex-end', flexShrink:0 }}>
                      <span style={{ fontSize:'1.1rem', fontWeight:900, color:'var(--brand-400)' }}>₹{b.totalAmount?.toLocaleString('en-IN')}</span>
                      <div style={{ display:'flex', gap:6 }}>
                        {['pending','confirmed'].includes(b.status) && (
                          <button onClick={() => handleCancel(b._id)}
                            className="btn btn-danger btn-sm" style={{ display:'flex', alignItems:'center', gap:4 }}>
                            <X size={11} /> Cancel
                          </button>
                        )}
                        {b.status==='completed' && !b.review && (
                          <button onClick={() => setReviewBooking(b)} className="btn btn-amber btn-sm" style={{ display:'flex', alignItems:'center', gap:4 }}>
                            <Star size={11} /> Review
                          </button>
                        )}
                        {b.review && (
                          <span className="badge badge-completed" style={{ display:'flex', alignItems:'center', gap:3 }}>
                            <CheckCircle size={10} /> Reviewed
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  {/* Tracking Map for In Progress */}
                  {b.status === 'in_progress' && (
                    <div style={{ marginTop:'1rem', animation:'fadeIn 0.3s ease' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:'0.75rem', color:'var(--brand-400)', fontWeight:700, fontSize:'0.9rem' }}>
                        <Navigation size={16} /> Live Provider Tracking
                      </div>
                      <LiveTrackingMap bookingId={b._id} isProvider={false} />
                    </div>
                  )}
                  {/* Timeline */}
                  {b.timeline?.length > 0 && (
                    <div style={{ marginTop:'0.875rem', paddingTop:'0.875rem', borderTop:'1px solid var(--border-subtle)', display:'flex', gap:6, overflowX:'auto' }}>
                      {b.timeline.map((t, i) => (
                        <div key={i} style={{ display:'flex', alignItems:'center', gap:6, flexShrink:0 }}>
                          <div style={{ padding:'0.2rem 0.625rem', borderRadius:999, fontSize:'0.7rem', fontWeight:600, background:'rgba(99,102,241,0.1)', color:'var(--brand-400)' }}>
                            {(statusConfig[t.status] || {}).icon} {t.status?.replace('_',' ')}
                          </div>
                          {i < b.timeline.length-1 && <div style={{ width:12, height:1, background:'var(--border-subtle)' }} />}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;
