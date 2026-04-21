import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProviderBookings, updateBookingStatus } from '../redux/slices/bookingsSlice';
import Loader from '../components/common/Loader';
import api from '../services/api';
import toast from 'react-hot-toast';
import LiveTrackingMap from '../components/booking/LiveTrackingMap';
import { Plus, Trash2, Star, CheckCircle, XCircle, Calendar, Package, TrendingUp, Clock, MapPin, User, ToggleLeft, ToggleRight, IndianRupee, Award, Zap, Navigation } from 'lucide-react';

const AddServiceModal = ({ onClose, onSubmit }) => {
  const [cats, setCats] = useState([]);
  const [form, setForm] = useState({ title:'', description:'', category:'', price:'', priceType:'fixed', duration:60, image:'', tags:'' });
  useEffect(() => { api.get('/categories').then(r => setCats(r.data.data)).catch(() => {}); }, []);
  const upd = k => e => setForm(p => ({ ...p, [k]: e.target.value }));
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-content" style={{ padding:'1.75rem' }}>
        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'1.25rem' }}>
          <h3 style={{ fontWeight:700, fontSize:'1.05rem' }}>Add New Service</h3>
          <button onClick={onClose} style={{ background:'none', border:'none', color:'var(--text-muted)', cursor:'pointer', fontSize:'1.1rem' }}>✕</button>
        </div>
        <form onSubmit={e => { e.preventDefault(); onSubmit({ ...form, tags: form.tags.split(',').map(t => t.trim()).filter(Boolean) }); }} style={{ display:'flex', flexDirection:'column', gap:'0.875rem' }}>
          <div><label className="label">Title *</label><input className="input-field" placeholder="e.g. Home Electrical Wiring" value={form.title} onChange={upd('title')} required /></div>
          <div><label className="label">Category *</label>
            <select className="input-field" value={form.category} onChange={upd('category')} required>
              <option value="">Select Category</option>
              {cats.map(c => <option key={c._id} value={c._id}>{c.icon} {c.name}</option>)}
            </select>
          </div>
          <div><label className="label">Description *</label><textarea className="input-field" placeholder="Describe your service..." value={form.description} onChange={upd('description')} required rows={3} style={{ resize:'none' }} /></div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
            <div><label className="label">Price (₹) *</label><input className="input-field" type="number" placeholder="999" value={form.price} onChange={upd('price')} required min={0} /></div>
            <div><label className="label">Type</label>
              <select className="input-field" value={form.priceType} onChange={upd('priceType')}>
                <option value="fixed">Fixed</option><option value="hourly">Hourly</option><option value="starting_from">Starting From</option>
              </select>
            </div>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
            <div><label className="label">Duration (mins)</label><input className="input-field" type="number" value={form.duration} onChange={upd('duration')} min={15} /></div>
            <div><label className="label">Image URL</label><input className="input-field" type="url" placeholder="https://..." value={form.image} onChange={upd('image')} /></div>
          </div>
          <div><label className="label">Tags (comma separated)</label><input className="input-field" placeholder="electrical, wiring, repair" value={form.tags} onChange={upd('tags')} /></div>
          <div style={{ display:'flex', gap:10, marginTop:4 }}>
            <button type="button" onClick={onClose} className="btn btn-ghost" style={{ flex:1 }}>Cancel</button>
            <button type="submit" className="btn btn-primary" style={{ flex:1 }}>Add Service</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ProviderDashboard = () => {
  const dispatch = useDispatch();
  const { user } = useSelector(s => s.auth);
  const { providerBookings, isLoading } = useSelector(s => s.bookings);
  const [myServices, setMyServices] = useState([]);
  const [earnings, setEarnings] = useState(null);
  const [tab, setTab] = useState('bookings');
  const [bFilter, setBFilter] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [isOnline, setIsOnline] = useState(user?.providerProfile?.isOnline || false);

  useEffect(() => {
    dispatch(fetchProviderBookings(bFilter ? { status: bFilter } : {}));
    api.get('/services/my-services').then(r => setMyServices(r.data.data)).catch(() => {});
    api.get('/bookings/provider-earnings').then(r => setEarnings(r.data.data)).catch(() => {});
    setIsOnline(user?.providerProfile?.isOnline || false);
  }, [dispatch, bFilter]);

  const handleStatus = (id, status) => dispatch(updateBookingStatus({ id, status }));

  const handleToggle = async () => {
    try {
      const { data } = await api.put('/bookings/toggle-availability');
      setIsOnline(data.isOnline);
      toast.success(data.message);
    } catch { toast.error('Failed to update availability'); }
  };

  const handleAddService = async (form) => {
    try {
      await api.post('/services', form);
      toast.success('Service added!');
      setShowAdd(false);
      api.get('/services/my-services').then(r => setMyServices(r.data.data));
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this service?')) return;
    try { await api.delete(`/services/${id}`); setMyServices(p => p.filter(s => s._id !== id)); toast.success('Deleted'); }
    catch { toast.error('Failed'); }
  };

  if (!user?.isApproved) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', paddingTop:80 }}>
      <div className="card" style={{ padding:'3rem', textAlign:'center', maxWidth:400 }}>
        <div style={{ fontSize:'3.5rem', marginBottom:'1rem' }}>⏳</div>
        <h2 style={{ fontWeight:700, marginBottom:8 }}>Pending Approval</h2>
        <p style={{ color:'var(--text-muted)' }}>Your account is under review. You'll be notified once approved by admin.</p>
      </div>
    </div>
  );

  const tabs = [['bookings','Bookings',Calendar],['services','Services',Package],['earnings','Earnings',TrendingUp]];

  return (
    <div style={{ minHeight:'100vh', paddingTop:80, paddingBottom:48 }}>
      {showAdd && <AddServiceModal onClose={() => setShowAdd(false)} onSubmit={handleAddService} />}
      <div className="container">
        {/* Header */}
        <div style={{ display:'flex', flexWrap:'wrap', gap:16, alignItems:'flex-start', justifyContent:'space-between', marginBottom:'1.75rem' }}>
          <div>
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:4 }}>
              <h1 style={{ fontSize:'1.875rem', fontWeight:800, letterSpacing:'-0.02em' }}>Provider Dashboard</h1>
              <span className={`badge ${isOnline ? 'badge-online' : 'badge-offline'}`}>{isOnline ? '🟢 Online' : '⚫ Offline'}</span>
            </div>
            <p style={{ color:'var(--text-muted)' }}>Welcome, <span style={{ color:'var(--brand-400)', fontWeight:600 }}>{user?.name}</span></p>
          </div>
          <div style={{ display:'flex', gap:10 }}>
            {/* Availability Toggle */}
            <div style={{ display:'flex', alignItems:'center', gap:10, padding:'0.625rem 1rem', borderRadius:'0.75rem', background:'var(--bg-card)', border:'1px solid var(--border-subtle)' }}>
              <span style={{ fontSize:'0.82rem', fontWeight:500, color:'var(--text-secondary)' }}>Availability</span>
              <div className={`toggle ${isOnline ? 'on' : ''}`} onClick={handleToggle} style={{ cursor:'pointer' }}>
                <div className="toggle-thumb" />
              </div>
            </div>
            <button onClick={() => setShowAdd(true)} className="btn btn-primary">
              <Plus size={16} /> Add Service
            </button>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:'1.75rem' }}>
          {[
            { label:'Total Jobs', value: providerBookings.length, color:'#6366f1' },
            { label:'Pending', value: providerBookings.filter(b=>b.status==='pending').length, color:'#fbbf24' },
            { label:'Completed', value: providerBookings.filter(b=>b.status==='completed').length, color:'#34d399' },
            { label:'This Month', value: `₹${(earnings?.monthlyEarnings||0).toLocaleString('en-IN')}`, color:'#a855f7' },
          ].map(s => (
            <div key={s.label} className="stat-card" style={{ textAlign:'center' }}>
              <div style={{ fontSize:'1.75rem', fontWeight:900, color:s.color }}>{s.value}</div>
              <div style={{ fontSize:'0.78rem', color:'var(--text-muted)', marginTop:4 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display:'flex', gap:4, padding:4, borderRadius:'0.875rem', background:'var(--bg-surface)', border:'1px solid var(--border-subtle)', width:'fit-content', marginBottom:'1.5rem' }}>
          {tabs.map(([key,label,Icon]) => (
            <button key={key} onClick={() => setTab(key)} style={{
              display:'flex', alignItems:'center', gap:6, padding:'0.55rem 1.125rem', borderRadius:'0.625rem',
              fontSize:'0.85rem', fontWeight:600, cursor:'pointer', border:'none', transition:'all 0.2s',
              background: tab===key ? 'var(--grad-brand)' : 'transparent',
              color: tab===key ? 'white' : 'var(--text-muted)',
            }}>
              <Icon size={14} /> {label}
            </button>
          ))}
        </div>

        {/* BOOKINGS TAB */}
        {tab==='bookings' && (
          <div>
            <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:'1rem' }}>
              {['','pending','confirmed','in_progress','completed'].map(s => (
                <button key={s} onClick={() => setBFilter(s)} style={{
                  padding:'0.35rem 0.875rem', borderRadius:999, fontSize:'0.78rem', fontWeight:600,
                  background: bFilter===s ? 'var(--brand-500)' : 'rgba(255,255,255,0.04)',
                  border:`1px solid ${bFilter===s ? 'var(--brand-500)' : 'var(--border-subtle)'}`,
                  color: bFilter===s ? 'white' : 'var(--text-muted)',
                  cursor:'pointer', transition:'all 0.2s', textTransform:'capitalize',
                }}>{s||'All'}</button>
              ))}
            </div>
            {isLoading ? <Loader /> : providerBookings.length===0 ? (
              <div style={{ textAlign:'center', padding:'4rem 0' }}>
                <div style={{ fontSize:'4rem', marginBottom:'1rem' }}>📭</div>
                <h3 style={{ fontWeight:700 }}>No bookings yet</h3>
                <p style={{ color:'var(--text-muted)' }}>Add services and go online to receive bookings</p>
              </div>
            ) : (
              <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                {providerBookings.map(b => (
                  <div key={b._id} className="card" style={{ padding:'1.25rem' }}>
                    <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6, flexWrap:'wrap' }}>
                          <h3 style={{ fontWeight:700, fontSize:'0.95rem' }}>{b.service?.title}</h3>
                          <span className={`badge badge-${b.status}`}>{b.status.replace('_',' ')}</span>
                          {b.isUrgent && <span style={{ padding:'0.15rem 0.5rem', borderRadius:999, fontSize:'0.68rem', fontWeight:700, background:'rgba(244,63,94,0.15)', color:'#f87171', display:'flex', alignItems:'center', gap:3 }}><Zap size={9} /> Urgent</span>}
                        </div>
                        <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:6 }}>
                          <div className="avatar" style={{ width:24, height:24, fontSize:'0.7rem', flexShrink:0 }}>{b.user?.name?.charAt(0)}</div>
                          <span style={{ fontSize:'0.82rem', color:'var(--text-secondary)' }}>{b.user?.name}</span>
                          <span style={{ fontSize:'0.78rem', color:'var(--text-muted)' }}>• {b.user?.phone}</span>
                        </div>
                        <div style={{ display:'flex', flexWrap:'wrap', gap:10, fontSize:'0.78rem', color:'var(--text-muted)' }}>
                          <span style={{ display:'flex', alignItems:'center', gap:3 }}><Calendar size={11} />{new Date(b.scheduledDate).toLocaleDateString('en-IN')}</span>
                          <span style={{ display:'flex', alignItems:'center', gap:3 }}><Clock size={11} />{b.scheduledTime}</span>
                          <span style={{ display:'flex', alignItems:'center', gap:3 }}><MapPin size={11} />{b.address?.street}, {b.address?.city}</span>
                        </div>
                      </div>
                      <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:8, flexShrink:0 }}>
                        <span style={{ fontWeight:900, fontSize:'1.1rem', color:'var(--brand-400)' }}>₹{b.totalAmount?.toLocaleString('en-IN')}</span>
                        <div style={{ display:'flex', gap:6 }}>
                          {b.status==='pending' && (<>
                            <button onClick={() => handleStatus(b._id,'confirmed')} className="btn btn-success btn-sm" style={{ display:'flex', alignItems:'center', gap:3 }}><CheckCircle size={11} /> Accept</button>
                            <button onClick={() => handleStatus(b._id,'rejected')} className="btn btn-danger btn-sm" style={{ display:'flex', alignItems:'center', gap:3 }}><XCircle size={11} /> Reject</button>
                          </>)}
                          {b.status==='confirmed' && <button onClick={() => handleStatus(b._id,'in_progress')} className="btn btn-primary btn-sm">Start Job</button>}
                          {b.status==='in_progress' && <button onClick={() => handleStatus(b._id,'completed')} className="btn btn-success btn-sm">Finish Job</button>}
                        </div>
                      </div>
                    </div>
                    {/* Live Tracking Sharing */}
                    {b.status === 'in_progress' && (
                      <div style={{ marginTop:'1rem', paddingTop:'1rem', borderTop:'1px solid var(--border-subtle)', animation:'fadeIn 0.3s ease' }}>
                        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'0.75rem' }}>
                          <div style={{ display:'flex', alignItems:'center', gap:6, color:'var(--brand-400)', fontWeight:700, fontSize:'0.9rem' }}>
                            <Navigation size={16} /> Sharing Live Location with Customer
                          </div>
                          <span className="badge badge-in_progress" style={{ animation:'pulse 2s infinite' }}>Broadcasting...</span>
                        </div>
                        <LiveTrackingMap bookingId={b._id} isProvider={true} />
                      </div>
                    )}
                    {b.notes && <p style={{ marginTop:10, paddingTop:10, borderTop:'1px solid var(--border-subtle)', fontSize:'0.8rem', color:'var(--text-muted)', display:'flex', alignItems:'center', gap:6 }}>📝 {b.notes}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* SERVICES TAB */}
        {tab==='services' && (
          myServices.length===0 ? (
            <div style={{ textAlign:'center', padding:'4rem 0' }}>
              <div style={{ fontSize:'4rem', marginBottom:'1rem' }}>📦</div>
              <h3 style={{ fontWeight:700, marginBottom:8 }}>No services yet</h3>
              <button onClick={() => setShowAdd(true)} className="btn btn-primary"><Plus size={15} /> Add First Service</button>
            </div>
          ) : (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))', gap:16 }}>
              {myServices.map(s => (
                <div key={s._id} className="card" style={{ overflow:'hidden' }}>
                  <div style={{ height:140, overflow:'hidden', position:'relative' }}>
                    <img src={s.image||'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400'} alt={s.title}
                      style={{ width:'100%', height:'100%', objectFit:'cover' }}
                      onError={e => e.target.src='https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400'} />
                    <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top, rgba(7,11,20,0.7) 0%, transparent 50%)' }} />
                    <span style={{ position:'absolute', top:8, right:8, padding:'0.2rem 0.5rem', borderRadius:999, fontSize:'0.68rem', fontWeight:700, background: s.isActive ? 'rgba(16,185,129,0.85)' : 'rgba(107,114,128,0.7)', color:'white' }}>
                      {s.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div style={{ padding:'0.875rem' }}>
                    <h3 style={{ fontWeight:700, fontSize:'0.9rem', marginBottom:4 }} className="line-clamp-1">{s.title}</h3>
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
                      <span style={{ display:'flex', alignItems:'center', gap:3, fontSize:'0.8rem', color:'var(--text-muted)' }}>
                        <Star size={11} style={{ fill:'#fbbf24', color:'#fbbf24' }} />{s.rating?.toFixed(1)} ({s.totalRatings})
                      </span>
                      <span style={{ fontWeight:800, color:'var(--brand-400)', fontSize:'0.95rem' }}>₹{s.price?.toLocaleString('en-IN')}</span>
                    </div>
                    <button onClick={() => handleDelete(s._id)} className="btn btn-danger btn-sm btn-full" style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:4 }}>
                      <Trash2 size={12} /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {/* EARNINGS TAB */}
        {tab==='earnings' && earnings && (
          <div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12, marginBottom:'1.5rem' }}>
              {[
                { label:'Total Earnings', value:`₹${earnings.totalEarnings?.toLocaleString('en-IN')}`, color:'#6366f1', icon:IndianRupee },
                { label:'This Month', value:`₹${earnings.monthlyEarnings?.toLocaleString('en-IN')}`, color:'#10b981', icon:TrendingUp },
                { label:'Jobs Done', value:earnings.completedJobs, color:'#a855f7', icon:Award },
              ].map(s => (
                <div key={s.label} className="stat-card">
                  <div style={{ width:40, height:40, borderRadius:10, background:`${s.color}18`, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:12 }}>
                    <s.icon size={18} color={s.color} />
                  </div>
                  <div style={{ fontSize:'1.6rem', fontWeight:900, color:s.color }}>{s.value}</div>
                  <div style={{ fontSize:'0.78rem', color:'var(--text-muted)', marginTop:4 }}>{s.label}</div>
                </div>
              ))}
            </div>
            {earnings.recentTransactions?.length > 0 && (
              <div className="card" style={{ overflow:'hidden' }}>
                <div style={{ padding:'1rem 1.25rem', borderBottom:'1px solid var(--border-subtle)', fontWeight:700, fontSize:'0.9rem' }}>Recent Transactions</div>
                <table className="table">
                  <thead><tr><th>Date</th><th>Booking</th><th>Total</th><th>Your Earnings</th></tr></thead>
                  <tbody>
                    {earnings.recentTransactions.map(t => (
                      <tr key={t._id}>
                        <td style={{ color:'var(--text-muted)', fontSize:'0.8rem' }}>{new Date(t.createdAt).toLocaleDateString('en-IN')}</td>
                        <td style={{ fontSize:'0.85rem' }}>Service Booking</td>
                        <td style={{ fontSize:'0.85rem' }}>₹{t.totalAmount?.toLocaleString('en-IN')}</td>
                        <td style={{ fontWeight:700, color:'var(--accent-emerald)' }}>₹{t.providerPayout?.toLocaleString('en-IN')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProviderDashboard;
