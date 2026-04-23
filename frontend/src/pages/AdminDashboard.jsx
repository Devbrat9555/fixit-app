import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import api from '../services/api';
import Loader from '../components/common/Loader';
import toast from 'react-hot-toast';
import { 
  Users, Package, Calendar, TrendingUp, CheckCircle, XCircle, 
  Shield, Settings, Search, Trash2, ToggleLeft, ToggleRight, 
  Plus, BarChart3, Sparkles, LayoutGrid, ShieldCheck, UserCheck, 
  ChevronRight, ArrowUpRight
} from 'lucide-react';

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
    { id: 'analytics', label: 'Overview', icon: BarChart3, color: 'var(--brand-400)' },
    { id: 'users', label: 'User Base', icon: Users, color: 'var(--accent-purple)' },
    { id: 'providers', label: 'Approvals', icon: ShieldCheck, color: 'var(--accent-amber)' },
    { id: 'bookings', label: 'Operations', icon: Calendar, color: 'var(--accent-emerald)' },
    { id: 'categories', label: 'Catalog', icon: Settings, color: 'var(--text-muted)' },
  ];

  const ChartTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div style={{ background:'var(--bg-card)', border:'1px solid var(--border-subtle)', borderRadius:12, padding:'1rem', fontSize:'0.85rem', boxShadow:'0 10px 25px rgba(0,0,0,0.3)' }}>
        <p style={{ color:'var(--text-muted)', marginBottom:6, fontWeight:600 }}>{label}</p>
        {payload.map(p => (
          <div key={p.name} style={{ display:'flex', alignItems:'center', gap:8 }}>
             <div style={{ width:8, height:8, borderRadius:999, background:p.color }} />
             <span style={{ color:p.color, fontWeight:800 }}>{p.name}: {typeof p.value==='number' && p.value>1000 ? `₹${p.value.toLocaleString('en-IN')}` : p.value}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="fade-in" style={{ paddingBottom:64 }}>
      {/* Hero Header */}
      <section style={{ background: 'var(--bg-surface)', padding: '3rem 0', borderBottom: '1px solid var(--border-subtle)', marginBottom: '3rem' }}>
        <div className="container">
           <div style={{ display:'flex', alignItems:'center', gap:8, color:'var(--brand-400)', fontWeight:700, fontSize:'0.8rem', marginBottom:8, textTransform:'uppercase', letterSpacing:'0.05em' }}>
              <Sparkles size={14} /> CENTRAL ADMINISTRATION
            </div>
            <h1 style={{ fontSize:'2.5rem', fontWeight:900, letterSpacing:'-0.03em' }}>Fixit Command Center</h1>
            <p style={{ color:'var(--text-muted)', marginTop:4 }}>System health, user management, and operational controls.</p>
        </div>
      </section>

      <div className="container">
        {/* Modern Tabs */}
        <div style={{ display:'flex', gap:8, marginBottom:'2.5rem', overflowX:'auto', paddingBottom:8 }}>
          {TABS.map(t => (
            <button 
              key={t.id} onClick={() => setTab(t.id)}
              style={{
                display:'flex', alignItems:'center', gap:10, padding:'0.875rem 1.5rem', borderRadius:'1rem',
                background: tab === t.id ? 'var(--bg-surface)' : 'transparent',
                border: `1px solid ${tab === t.id ? 'var(--border-subtle)' : 'transparent'}`,
                color: tab === t.id ? t.color : 'var(--text-muted)',
                fontWeight: 800, cursor: 'pointer', transition: 'all 0.2s ease', whiteSpace:'nowrap',
                position: 'relative'
              }}
            >
              <t.icon size={18} />
              {t.label}
              {t.id === 'providers' && pending.length > 0 && (
                <span style={{ position:'absolute', top:8, right:8, width:8, height:8, background:'var(--accent-rose)', borderRadius:999, border:'2px solid var(--bg-surface)' }} />
              )}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ display:'flex', justifyContent:'center', padding:'5rem 0' }}><Loader /></div>
        ) : (
          <div className="fade-in">
            {/* ── ANALYTICS ── */}
            {tab==='analytics' && analytics && (
              <>
                {/* 🚨 QUICK APPROVAL ALERT 🚨 */}
                {analytics.pendingProviders > 0 && (
                  <div className="card scale-in" style={{ padding:'1.5rem', background:'rgba(245,158,11,0.05)', border:'1px solid var(--accent-amber)', marginBottom:'2rem', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                     <div style={{ display:'flex', alignItems:'center', gap:16 }}>
                        <div style={{ padding:12, background:'var(--accent-amber)20', borderRadius:12 }}>
                           <ShieldCheck size={24} color="var(--accent-amber)" />
                        </div>
                        <div>
                           <h4 style={{ fontWeight:900, fontSize:'1.1rem' }}>{analytics.pendingProviders} Partners Waiting for Approval</h4>
                           <p style={{ fontSize:'0.85rem', color:'var(--text-muted)' }}>New professionals have applied to join Fixit. Review them now.</p>
                        </div>
                     </div>
                     <button onClick={() => setTab('providers')} className="btn btn-primary" style={{ background:'var(--accent-amber)', color:'black', border:'none' }}>Go to Approvals <ChevronRight size={16} /></button>
                  </div>
                )}

                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(180px, 1fr))', gap:20, marginBottom:'2.5rem' }}>
                  {[
                    {l:'Active Users',v:analytics.totalUsers,c:'var(--brand-400)',icon:Users},
                    {l:'Partners',v:analytics.totalProviders,c:'var(--accent-purple)',icon:Shield},
                    {l:'Catalog Size',v:analytics.totalServices,c:'var(--accent-emerald)',icon:Package},
                    {l:'Bookings',v:analytics.totalBookings,c:'var(--accent-amber)',icon:Calendar},
                    {l:'Pending',v:analytics.pendingProviders,c:'var(--accent-rose)',icon:XCircle},
                    {l:'Revenue',v:`₹${(analytics.totalRevenue||0).toLocaleString('en-IN')}`,c:'var(--accent-emerald)',icon:TrendingUp},
                  ].map((s, i) => (
                    <div key={i} className="card" style={{ padding:'1.5rem', textAlign:'center' }}>
                       <div style={{ width:44, height:44, borderRadius:12, background: `${s.c}10`, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 12px' }}>
                          <s.icon size={20} color={s.c} />
                       </div>
                       <div style={{ fontSize:'1.75rem', fontWeight:900, color:s.c }}>{s.v}</div>
                       <div style={{ fontSize:'0.75rem', color:'var(--text-muted)', fontWeight:700, marginTop:4, textTransform:'uppercase' }}>{s.l}</div>
                    </div>
                  ))}
                </div>

                <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr', gap:24 }} className="grid-mobile-stack">
                   <div className="card" style={{ padding:'1.5rem' }}>
                      <h3 style={{ fontSize:'1.1rem', fontWeight:800, marginBottom:'2rem', display:'flex', alignItems:'center', gap:8 }}>
                         <BarChart3 size={20} color="var(--brand-400)" /> Booking Distribution
                      </h3>
                      <ResponsiveContainer width="100%" height={260}>
                        <BarChart data={analytics.bookingsByStatus?.map(b => ({ name:b._id?.replace('_',' '), count:b.count }))}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                          <XAxis dataKey="name" tick={{ fill:'var(--text-muted)', fontSize:11 }} axisLine={false} tickLine={false} />
                          <YAxis tick={{ fill:'var(--text-muted)', fontSize:11 }} axisLine={false} tickLine={false} />
                          <Tooltip content={<ChartTooltip />} cursor={{ fill:'rgba(255,255,255,0.02)' }} />
                          <Bar dataKey="count" fill="var(--brand-400)" radius={[6,6,0,0]} barSize={40} />
                        </BarChart>
                      </ResponsiveContainer>
                   </div>

                   <div className="card" style={{ padding:'1.5rem' }}>
                      <h3 style={{ fontSize:'1.1rem', fontWeight:800, marginBottom:'1.5rem' }}>Recent Activity</h3>
                      <div style={{ display:'grid', gap:16 }}>
                         {analytics.recentBookings?.map(b => (
                           <div key={b._id} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', borderBottom:'1px solid var(--border-subtle)', pb:12 }}>
                              <div style={{ minWidth:0 }}>
                                 <p style={{ fontWeight:700, fontSize:'0.9rem' }}>{b.user?.name}</p>
                                 <p style={{ fontSize:'0.75rem', color:'var(--text-muted)' }} className="truncate">{b.service?.title}</p>
                              </div>
                              <div style={{ textAlign:'right' }}>
                                 <span style={{ fontSize:'0.7rem', fontWeight:800, color:'var(--brand-400)' }}>₹{b.totalAmount}</span>
                                 <div style={{ fontSize:'0.65rem', color:'var(--text-muted)' }}>{new Date(b.createdAt).toLocaleDateString()}</div>
                              </div>
                           </div>
                         ))}
                      </div>
                      <button onClick={() => setTab('bookings')} style={{ width:'100%', marginTop:24, padding:'0.75rem', background:'rgba(255,255,255,0.02)', border:'1px solid var(--border-subtle)', borderRadius:8, fontSize:'0.8rem', fontWeight:700, color:'var(--text-muted)', cursor:'pointer' }}>View All Bookings</button>
                   </div>
                </div>
              </>
            )}

            {/* ── USERS ── */}
            {tab==='users' && (
              <div className="fade-in">
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem' }}>
                   <div style={{ position:'relative', maxWidth:400, flex:1 }}>
                      <Search size={18} style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', color:'var(--text-muted)' }} />
                      <input type="text" placeholder="Search by name or email..." value={userSearch} onChange={e => setUserSearch(e.target.value)} className="input-field" style={{ paddingLeft:44 }} />
                   </div>
                </div>
                <div className="card" style={{ overflowX:'auto' }}>
                  <table className="table">
                    <thead><tr><th>User Detail</th><th>Access Role</th><th>Member Since</th><th>Account Status</th><th>Operations</th></tr></thead>
                    <tbody>
                      {users.map(u => (
                        <tr key={u._id}>
                          <td>
                            <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                              <div className="avatar" style={{ width:36, height:36, fontSize:'0.9rem' }}>{u.name?.charAt(0)}</div>
                              <div><p style={{ fontWeight:700, fontSize:'0.9rem' }}>{u.name}</p><p style={{ fontSize:'0.75rem', color:'var(--text-muted)' }}>{u.email}</p></div>
                            </div>
                          </td>
                          <td>
                            <span style={{ 
                               display:'inline-flex', alignItems:'center', gap:6, padding:'0.3rem 0.75rem', borderRadius:999, fontSize:'0.7rem', fontWeight:800,
                               background: u.role==='admin' ? 'rgba(245,158,11,0.1)' : u.role==='provider' ? 'rgba(168,85,247,0.1)' : 'rgba(99,102,241,0.1)',
                               color: u.role==='admin' ? 'var(--accent-amber)' : u.role==='provider' ? 'var(--accent-purple)' : 'var(--brand-400)'
                            }}>
                              {u.role==='admin' ? <Shield size={12}/> : u.role==='provider' ? <Briefcase size={12}/> : <UserCheck size={12}/>}
                              {u.role?.toUpperCase()}
                            </span>
                          </td>
                          <td style={{ color:'var(--text-muted)', fontSize:'0.85rem' }}>{new Date(u.createdAt).toLocaleDateString('en-IN', {day:'numeric', month:'short', year:'numeric'})}</td>
                          <td>
                            <span className={`badge ${u.isActive?'badge-completed':'badge-cancelled'}`} style={{ borderRadius:999, padding:'0.3rem 0.8rem', fontSize:'0.7rem' }}>
                               {u.isActive ? 'Active' : 'Banned'}
                            </span>
                          </td>
                          <td>
                            {u.role!=='admin' && (
                              <div style={{ display:'flex', gap:8 }}>
                                <button onClick={() => toggleUser(u._id)} style={{ padding:8, borderRadius:8, background:'var(--bg-card)', border:'1px solid var(--border-subtle)', color: u.isActive?'var(--accent-amber)':'var(--accent-emerald)', cursor:'pointer' }}>
                                  {u.isActive ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                                </button>
                                <button onClick={() => deleteUser(u._id)} style={{ padding:8, borderRadius:8, background:'var(--bg-card)', border:'1px solid var(--border-subtle)', color:'var(--accent-rose)', cursor:'pointer' }}>
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ── APPROVALS ── */}
            {tab==='providers' && (
               <div className="fade-in">
                  <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:'2rem' }}>
                     <div style={{ padding: '0.6rem', borderRadius: 10, background: 'rgba(245,158,11,0.1)', color: 'var(--accent-amber)' }}>
                        <Shield size={22} />
                     </div>
                     <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Pending Partner Verification ({pending.length})</h3>
                  </div>
                  
                  {pending.length === 0 ? (
                    <div style={{ textAlign:'center', padding:'8rem 0', background:'var(--bg-surface)', borderRadius:'2rem' }}>
                       <CheckCircle size={60} color="var(--accent-emerald)" style={{ marginBottom:16 }} />
                       <h3 style={{ fontSize:'1.5rem', fontWeight:800 }}>All applications verified!</h3>
                       <p style={{ color:'var(--text-muted)' }}>There are no new provider applications to review.</p>
                    </div>
                  ) : (
                    <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(340px, 1fr))', gap:20 }}>
                       {pending.map(p => (
                         <div key={p._id} className="card" style={{ padding:'1.75rem' }}>
                            <div style={{ display:'flex', gap:16, marginBottom:20 }}>
                               <div className="avatar" style={{ width:56, height:56, fontSize:'1.2rem' }}>{p.name?.charAt(0)}</div>
                               <div>
                                  <h4 style={{ fontWeight:800, fontSize:'1.1rem' }}>{p.name}</h4>
                                  <p style={{ fontSize:'0.8rem', color:'var(--text-muted)' }}>{p.email}</p>
                                  <div style={{ display:'flex', gap:8, marginTop:6 }}>
                                     {p.providerProfile?.skills?.slice(0,2).map(s => <span key={s} style={{ fontSize:'0.65rem', padding:'0.2rem 0.5rem', background:'rgba(255,255,255,0.05)', borderRadius:4 }}>{s}</span>)}
                                  </div>
                               </div>
                            </div>
                            <p style={{ fontSize:'0.85rem', color:'var(--text-secondary)', lineHeight:1.6, marginBottom:24 }} className="line-clamp-2">"{p.providerProfile?.bio}"</p>
                            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                               <button onClick={() => approveProvider(p._id,true)} className="btn btn-primary" style={{ height:44 }}>Verify Partner</button>
                               <button onClick={() => approveProvider(p._id,false)} className="btn btn-ghost" style={{ height:44, color:'var(--accent-rose)', borderColor:'rgba(244,63,94,0.2)' }}>Decline</button>
                            </div>
                         </div>
                       ))}
                    </div>
                  )}
               </div>
            )}

            {/* ── BOOKINGS ── */}
            {tab==='bookings' && (
              <div className="fade-in card" style={{ overflowX:'auto' }}>
                <table className="table">
                  <thead><tr><th>Job Detail</th><th>Customer</th><th>Expert</th><th>Schedule</th><th>Revenue</th><th>Process</th></tr></thead>
                  <tbody>
                    {bookings.map(b => (
                      <tr key={b._id}>
                        <td style={{ fontWeight:700, fontSize:'0.9rem', maxWidth:200 }} className="truncate">{b.service?.title}</td>
                        <td style={{ fontSize:'0.85rem' }}>{b.user?.name}</td>
                        <td style={{ fontSize:'0.85rem', color:'var(--text-secondary)' }}>{b.provider?.name || '---'}</td>
                        <td style={{ fontSize:'0.8rem', color:'var(--text-muted)' }}>{new Date(b.scheduledDate).toLocaleDateString()}</td>
                        <td style={{ fontWeight:800, color:'var(--brand-400)' }}>₹{b.totalAmount}</td>
                        <td><span className={`badge badge-${b.status}`} style={{ fontSize:'0.65rem', textTransform:'uppercase' }}>{b.status.replace('_',' ')}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* ── CATEGORIES ── */}
            {tab==='categories' && (
              <div className="fade-in" style={{ display:'grid', gridTemplateColumns:'340px 1fr', gap:24 }} className="grid-mobile-stack">
                 <div className="card" style={{ padding:'2rem', alignSelf:'start' }}>
                    <h3 style={{ fontSize:'1.25rem', fontWeight:800, marginBottom:8 }}>New Category</h3>
                    <p style={{ fontSize:'0.85rem', color:'var(--text-muted)', marginBottom:24 }}>Expand your service marketplace.</p>
                    <form onSubmit={addCategory} style={{ display:'grid', gap:16 }}>
                       <div><label className="label" style={{fontSize:'0.75rem'}}>Title</label><input className="input-field" placeholder="Plumbing" value={newCat.name} onChange={e => setNewCat(p=>({...p,name:e.target.value}))} required /></div>
                       <div><label className="label" style={{fontSize:'0.75rem'}}>Icon (Emoji)</label><input className="input-field" placeholder="🔧" value={newCat.icon} onChange={e => setNewCat(p=>({...p,icon:e.target.value}))} /></div>
                       <div><label className="label" style={{fontSize:'0.75rem'}}>Description</label><textarea className="input-field" rows={3} placeholder="Details..." value={newCat.description} onChange={e => setNewCat(p=>({...p,description:e.target.value}))} /></div>
                       <button type="submit" className="btn btn-primary btn-full" style={{ height:52 }}>Create Category</button>
                    </form>
                 </div>
                 
                 <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(220px, 1fr))', gap:16 }}>
                    {categories.map(c => (
                      <div key={c._id} className="card" style={{ padding:'1.25rem', position:'relative' }}>
                         <div style={{ fontSize:'2.5rem', marginBottom:12 }}>{c.icon}</div>
                         <h4 style={{ fontWeight:800, fontSize:'1.1rem', marginBottom:4 }}>{c.name}</h4>
                         <p style={{ fontSize:'0.8rem', color:'var(--text-muted)', lineHeight:1.5 }} className="line-clamp-2">{c.description}</p>
                         <button onClick={() => deleteCategory(c._id)} style={{ position:'absolute', top:12, right:12, background:'none', border:'none', color:'var(--text-muted)', cursor:'pointer' }}>
                            <Trash2 size={14} />
                         </button>
                      </div>
                    ))}
                 </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
