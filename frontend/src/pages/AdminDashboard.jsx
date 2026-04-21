import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts';
import api from '../services/api';
import Loader from '../components/common/Loader';
import toast from 'react-hot-toast';
import { Users, Package, Calendar, TrendingUp, CheckCircle, XCircle, Shield, Settings, Search, Trash2, ToggleLeft, ToggleRight, Plus, BarChart3 } from 'lucide-react';

const AdminDashboard = () => {
  const { user } = useSelector(s => s.auth);
  const [tab, setTab] = useState('analytics');
  const [analytics, setAnalytics] = useState(null);
  const [users, setUsers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [pending, setPending] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const [newCat, setNewCat] = useState({ name:'', description:'', icon:'🔧' });

  const load = async (t) => {
    setLoading(true);
    try {
      if (t==='analytics') { const {data} = await api.get('/admin/analytics'); setAnalytics(data.data); }
      else if (t==='users') { const {data} = await api.get('/admin/users', {params:{search:userSearch,limit:50}}); setUsers(data.data); }
      else if (t==='bookings') { const {data} = await api.get('/admin/bookings', {params:{limit:50}}); setBookings(data.data); }
      else if (t==='providers') { const {data} = await api.get('/admin/providers/pending'); setPending(data.data); }
      else if (t==='categories') { const {data} = await api.get('/categories'); setCategories(data.data); }
    } catch { toast.error('Failed to load data'); }
    setLoading(false);
  };

  useEffect(() => { load(tab); }, [tab]);
  useEffect(() => { if (tab==='users') load('users'); }, [userSearch]);

  const toggleUser = async (id) => { try { await api.put(`/admin/users/${id}/toggle-active`); toast.success('Updated'); load('users'); } catch { toast.error('Failed'); } };
  const deleteUser = async (id) => { if (!window.confirm('Delete permanently?')) return; try { await api.delete(`/admin/users/${id}`); toast.success('Deleted'); load('users'); } catch { toast.error('Failed'); } };
  const approveProvider = async (id, isApproved) => { try { await api.put(`/admin/providers/${id}/approval`, {isApproved}); toast.success(isApproved?'Approved':'Rejected'); load('providers'); } catch { toast.error('Failed'); } };
  const addCategory = async (e) => { e.preventDefault(); try { await api.post('/categories', newCat); toast.success('Created!'); setNewCat({name:'',description:'',icon:'🔧'}); load('categories'); } catch (err) { toast.error(err.response?.data?.message||'Failed'); } };
  const deleteCategory = async (id) => { if (!window.confirm('Delete?')) return; try { await api.delete(`/categories/${id}`); toast.success('Deleted'); load('categories'); } catch { toast.error('Failed'); } };

  const TABS = [
    ['analytics','Analytics',BarChart3],['users','Users',Users],['providers','Approvals',Shield],
    ['bookings','Bookings',Calendar],['categories','Categories',Settings],
  ];

  // Chart tooltip
  const ChartTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div style={{ background:'var(--bg-card)', border:'1px solid var(--border-default)', borderRadius:8, padding:'0.625rem 0.875rem', fontSize:'0.8rem' }}>
        <p style={{ color:'var(--text-muted)', marginBottom:2 }}>{label}</p>
        {payload.map(p => <p key={p.name} style={{ color:p.color, fontWeight:700 }}>{p.name}: {typeof p.value==='number' && p.value>100 ? `₹${p.value.toLocaleString('en-IN')}` : p.value}</p>)}
      </div>
    );
  };

  return (
    <div style={{ minHeight:'100vh', paddingTop:80, paddingBottom:48 }}>
      <div className="container">
        {/* Header */}
        <div style={{ marginBottom:'1.75rem' }}>
          <h1 style={{ fontSize:'1.875rem', fontWeight:800, letterSpacing:'-0.02em' }}>Admin Dashboard</h1>
          <p style={{ color:'var(--text-muted)', marginTop:4 }}>Manage <span style={{ color:'var(--brand-400)', fontWeight:600 }}>Fixit</span> platform</p>
        </div>

        {/* Tabs */}
        <div style={{ display:'flex', gap:2, padding:4, borderRadius:'0.875rem', background:'var(--bg-surface)', border:'1px solid var(--border-subtle)', width:'fit-content', marginBottom:'1.75rem', overflowX:'auto' }}>
          {TABS.map(([key,label,Icon]) => (
            <button key={key} onClick={() => setTab(key)} style={{
              display:'flex', alignItems:'center', gap:6, padding:'0.55rem 1.125rem', borderRadius:'0.625rem',
              fontSize:'0.82rem', fontWeight:600, cursor:'pointer', border:'none', transition:'all 0.2s', whiteSpace:'nowrap',
              background: tab===key ? 'var(--grad-brand)' : 'transparent',
              color: tab===key ? 'white' : 'var(--text-muted)',
            }}>
              <Icon size={14} /> {label}
            </button>
          ))}
        </div>

        {loading ? <Loader /> : (
          <>
            {/* ── ANALYTICS ── */}
            {tab==='analytics' && analytics && (
              <div className="fade-in">
                {/* Top stats */}
                <div style={{ display:'grid', gridTemplateColumns:'repeat(6,1fr)', gap:12, marginBottom:'1.5rem' }}>
                  {[
                    {l:'Users',v:analytics.totalUsers,c:'#6366f1',icon:Users},{l:'Providers',v:analytics.totalProviders,c:'#a855f7',icon:Shield},
                    {l:'Services',v:analytics.totalServices,c:'#06b6d4',icon:Package},{l:'Bookings',v:analytics.totalBookings,c:'#f59e0b',icon:Calendar},
                    {l:'Pending Approvals',v:analytics.pendingProviders,c:'#f97316',icon:XCircle},
                    {l:'Revenue',v:`₹${(analytics.totalRevenue||0).toLocaleString('en-IN')}`,c:'#10b981',icon:TrendingUp},
                  ].map(({l,v,c,icon:Icon}) => (
                    <div key={l} className="stat-card" style={{ textAlign:'center', gridColumn: l==='Revenue' ? 'span 2' : 'auto' }}>
                      <div style={{ width:36, height:36, borderRadius:8, background:`${c}18`, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 8px' }}>
                        <Icon size={16} color={c} />
                      </div>
                      <div style={{ fontSize:'1.5rem', fontWeight:900, color:c }}>{v}</div>
                      <div style={{ fontSize:'0.72rem', color:'var(--text-muted)', marginTop:4 }}>{l}</div>
                    </div>
                  ))}
                </div>

                {/* Charts row */}
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:'1.5rem' }}>
                  {/* Booking status bar chart */}
                  <div className="card" style={{ padding:'1.25rem' }}>
                    <h3 style={{ fontWeight:700, fontSize:'0.9rem', marginBottom:'1.25rem' }}>Bookings by Status</h3>
                    <ResponsiveContainer width="100%" height={180}>
                      <BarChart data={analytics.bookingsByStatus?.map(b => ({ name:b._id?.replace('_',' '), count:b.count }))}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="name" tick={{ fill:'var(--text-muted)', fontSize:11 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill:'var(--text-muted)', fontSize:11 }} axisLine={false} tickLine={false} />
                        <Tooltip content={<ChartTooltip />} />
                        <Bar dataKey="count" fill="#6366f1" radius={[4,4,0,0]} name="Bookings" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Recent bookings */}
                  <div className="card" style={{ padding:'1.25rem' }}>
                    <h3 style={{ fontWeight:700, fontSize:'0.9rem', marginBottom:'1rem' }}>Recent Bookings</h3>
                    <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                      {analytics.recentBookings?.map(b => (
                        <div key={b._id} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:8 }}>
                          <div style={{ flex:1, minWidth:0 }}>
                            <p style={{ fontWeight:600, fontSize:'0.82rem', color:'var(--text-primary)' }}>{b.user?.name}</p>
                            <p style={{ fontSize:'0.75rem', color:'var(--text-muted)' }} className="line-clamp-1">{b.service?.title}</p>
                          </div>
                          <div style={{ textAlign:'right', flexShrink:0 }}>
                            <span className={`badge badge-${b.status}`} style={{ fontSize:'0.68rem' }}>{b.status}</span>
                            <p style={{ fontWeight:700, color:'var(--brand-400)', fontSize:'0.85rem', marginTop:2 }}>₹{b.totalAmount?.toLocaleString('en-IN')}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── USERS ── */}
            {tab==='users' && (
              <div className="fade-in">
                <div style={{ display:'flex', gap:12, marginBottom:'1rem', alignItems:'center' }}>
                  <div style={{ position:'relative', flex:1, maxWidth:320 }}>
                    <Search size={14} style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'var(--text-muted)' }} />
                    <input type="text" placeholder="Search users..." value={userSearch} onChange={e => setUserSearch(e.target.value)} className="input-field" style={{ paddingLeft:36 }} />
                  </div>
                </div>
                <div className="card" style={{ overflow:'hidden' }}>
                  <table className="table">
                    <thead><tr><th>User</th><th>Role</th><th>Joined</th><th>Status</th><th>Actions</th></tr></thead>
                    <tbody>
                      {users.map(u => (
                        <tr key={u._id}>
                          <td>
                            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                              <div className="avatar" style={{ width:32, height:32, fontSize:'0.82rem', flexShrink:0 }}>{u.name?.charAt(0)}</div>
                              <div><p style={{ fontWeight:600, fontSize:'0.875rem' }}>{u.name}</p><p style={{ fontSize:'0.75rem', color:'var(--text-muted)' }}>{u.email}</p></div>
                            </div>
                          </td>
                          <td>
                            <span style={{ padding:'0.2rem 0.625rem', borderRadius:999, fontSize:'0.72rem', fontWeight:700, textTransform:'capitalize',
                              color: u.role==='admin'?'#fbbf24':u.role==='provider'?'#a78bfa':'#60a5fa',
                              background: u.role==='admin'?'rgba(245,158,11,0.1)':u.role==='provider'?'rgba(168,85,247,0.1)':'rgba(99,102,241,0.1)',
                            }}>
                              {u.role==='admin'?'👑':u.role==='provider'?'🔧':'👤'} {u.role}
                            </span>
                          </td>
                          <td style={{ color:'var(--text-muted)', fontSize:'0.8rem' }}>{new Date(u.createdAt).toLocaleDateString('en-IN')}</td>
                          <td><span className={`badge ${u.isActive?'badge-completed':'badge-cancelled'}`}>{u.isActive?'Active':'Inactive'}</span></td>
                          <td>
                            {u.role!=='admin' && (
                              <div style={{ display:'flex', gap:6 }}>
                                <button onClick={() => toggleUser(u._id)} style={{ padding:'0.3rem', borderRadius:6, background:'none', border:'none', cursor:'pointer', color: u.isActive?'#fbbf24':'#34d399', transition:'all 0.2s' }} title={u.isActive?'Deactivate':'Activate'}>
                                  {u.isActive ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                                </button>
                                <button onClick={() => deleteUser(u._id)} style={{ padding:'0.3rem', borderRadius:6, background:'none', border:'none', cursor:'pointer', color:'#f87171', transition:'all 0.2s' }}>
                                  <Trash2 size={15} />
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {users.length===0 && <div style={{ textAlign:'center', padding:'3rem', color:'var(--text-muted)' }}>No users found</div>}
                </div>
              </div>
            )}

            {/* ── PROVIDER APPROVALS ── */}
            {tab==='providers' && (
              <div className="fade-in">
                <h3 style={{ fontWeight:700, marginBottom:'1rem', fontSize:'0.95rem' }}>Pending Approvals ({pending.length})</h3>
                {pending.length===0 ? (
                  <div style={{ textAlign:'center', padding:'4rem 0' }}>
                    <CheckCircle size={48} color="var(--accent-emerald)" style={{ margin:'0 auto 1rem' }} />
                    <h3 style={{ fontWeight:700 }}>All caught up!</h3>
                    <p style={{ color:'var(--text-muted)' }}>No pending provider approvals</p>
                  </div>
                ) : (
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:16 }}>
                    {pending.map(p => (
                      <div key={p._id} className="card" style={{ padding:'1.25rem' }}>
                        <div style={{ display:'flex', gap:12, marginBottom:'1rem' }}>
                          <div className="avatar" style={{ width:48, height:48, fontSize:'1.1rem', flexShrink:0 }}>{p.name?.charAt(0)}</div>
                          <div style={{ flex:1, minWidth:0 }}>
                            <h4 style={{ fontWeight:700, fontSize:'0.95rem', marginBottom:2 }}>{p.name}</h4>
                            <p style={{ fontSize:'0.78rem', color:'var(--text-muted)' }}>{p.email}</p>
                            <p style={{ fontSize:'0.78rem', color:'var(--text-muted)' }}>{p.phone}</p>
                            {p.providerProfile?.bio && <p style={{ fontSize:'0.78rem', color:'var(--text-secondary)', marginTop:6, lineHeight:1.5 }} className="line-clamp-2">{p.providerProfile.bio}</p>}
                          </div>
                        </div>
                        <div style={{ display:'flex', gap:8 }}>
                          <button onClick={() => approveProvider(p._id,true)} className="btn btn-success btn-sm" style={{ flex:1, justifyContent:'center', display:'flex', gap:4 }}><CheckCircle size={13} /> Approve</button>
                          <button onClick={() => approveProvider(p._id,false)} className="btn btn-danger btn-sm" style={{ flex:1, justifyContent:'center', display:'flex', gap:4 }}><XCircle size={13} /> Reject</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── BOOKINGS ── */}
            {tab==='bookings' && (
              <div className="fade-in card" style={{ overflow:'hidden' }}>
                <table className="table">
                  <thead><tr><th>Service</th><th>Customer</th><th>Provider</th><th>Date</th><th>Amount</th><th>Status</th></tr></thead>
                  <tbody>
                    {bookings.map(b => (
                      <tr key={b._id}>
                        <td style={{ fontWeight:600, fontSize:'0.875rem', maxWidth:160 }} className="line-clamp-1">{b.service?.title}</td>
                        <td style={{ fontSize:'0.85rem', color:'var(--text-secondary)' }}>{b.user?.name}</td>
                        <td style={{ fontSize:'0.85rem', color:'var(--text-secondary)' }}>{b.provider?.name}</td>
                        <td style={{ fontSize:'0.78rem', color:'var(--text-muted)' }}>{new Date(b.scheduledDate).toLocaleDateString('en-IN')}</td>
                        <td style={{ fontWeight:700, color:'var(--brand-400)', fontSize:'0.9rem' }}>₹{b.totalAmount?.toLocaleString('en-IN')}</td>
                        <td><span className={`badge badge-${b.status}`}>{b.status.replace('_',' ')}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {bookings.length===0 && <div style={{ textAlign:'center', padding:'3rem', color:'var(--text-muted)' }}>No bookings found</div>}
              </div>
            )}

            {/* ── CATEGORIES ── */}
            {tab==='categories' && (
              <div className="fade-in" style={{ display:'grid', gridTemplateColumns:'300px 1fr', gap:20 }}>
                <div className="card" style={{ padding:'1.25rem', alignSelf:'start' }}>
                  <h3 style={{ fontWeight:700, fontSize:'0.9rem', marginBottom:'1rem', display:'flex', alignItems:'center', gap:6 }}>
                    <Plus size={15} color="var(--brand-400)" /> Add Category
                  </h3>
                  <form onSubmit={addCategory} style={{ display:'flex', flexDirection:'column', gap:'0.75rem' }}>
                    <div><label className="label">Name *</label><input className="input-field" placeholder="e.g. Roofing" value={newCat.name} onChange={e => setNewCat(p=>({...p,name:e.target.value}))} required /></div>
                    <div><label className="label">Icon (emoji)</label><input className="input-field" placeholder="🏠" value={newCat.icon} onChange={e => setNewCat(p=>({...p,icon:e.target.value}))} /></div>
                    <div><label className="label">Description</label><textarea className="input-field" rows={2} style={{resize:'none'}} placeholder="Brief description..." value={newCat.description} onChange={e => setNewCat(p=>({...p,description:e.target.value}))} /></div>
                    <button type="submit" className="btn btn-primary btn-full">Create Category</button>
                  </form>
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:12, alignContent:'start' }}>
                  {categories.map(c => (
                    <div key={c._id} className="card" style={{ padding:'1rem', display:'flex', alignItems:'center', gap:12 }}>
                      <span style={{ fontSize:'1.75rem', flexShrink:0 }}>{c.icon}</span>
                      <div style={{ flex:1, minWidth:0 }}>
                        <p style={{ fontWeight:700, fontSize:'0.875rem' }}>{c.name}</p>
                        <p style={{ fontSize:'0.75rem', color:'var(--text-muted)' }} className="line-clamp-1">{c.description}</p>
                      </div>
                      <button onClick={() => deleteCategory(c._id)} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--text-muted)', padding:4, borderRadius:6, flexShrink:0, transition:'color 0.2s' }}
                        onMouseEnter={e => e.currentTarget.style.color='#f87171'} onMouseLeave={e => e.currentTarget.style.color='var(--text-muted)'}
                      ><Trash2 size={14} /></button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
