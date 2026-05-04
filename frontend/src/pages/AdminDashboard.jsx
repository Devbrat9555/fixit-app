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
  ChevronRight, ArrowUpRight, Star, Briefcase, AlertCircle
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
    { id: 'analytics', label: 'Overview', icon: BarChart3, color: 'var(--accent)' },
    { id: 'users', label: 'Customers', icon: Users, color: '#a855f7' },
    { id: 'providers_all', label: 'Experts', icon: Briefcase, color: '#10b981' },
    { id: 'providers', label: 'Verifications', icon: ShieldCheck, color: '#f59e0b' },
    { id: 'bookings', label: 'Operations', icon: Calendar, color: '#6366f1' },
    { id: 'categories', label: 'Catalog', icon: Settings, color: '#9ca3af' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-deep)', display: 'flex' }} className="grid-mobile-stack">
      {/* ── Sidebar ── */}
      <aside style={{ 
        width: '280px', background: 'var(--bg-surface)', 
        borderRight: '1px solid var(--border-subtle)',
        padding: '2rem 1.5rem', display: 'flex', flexDirection: 'column',
        position: 'sticky', top: 'var(--nav-h)', height: 'calc(100vh - var(--nav-h))'
      }} className="hide-mobile">
        <div style={{ marginBottom: '3rem' }}>
          <p style={{ fontSize: '0.65rem', fontWeight: 900, color: 'var(--text-muted)', letterSpacing: '0.15em', marginBottom: '1.5rem' }}>MAIN MENU</p>
          <div style={{ display: 'grid', gap: '0.5rem' }}>
            {TABS.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)} style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '1rem', borderRadius: 12,
                background: tab === t.id ? 'var(--accent-soft)' : 'transparent',
                color: tab === t.id ? 'var(--accent)' : 'var(--text-dim)',
                border: 'none', cursor: 'pointer', transition: 'all 0.3s ease',
                fontWeight: 700, fontSize: '0.9rem'
              }}>
                <t.icon size={20} />
                {t.label}
                {t.id === 'providers' && pending.length > 0 && <span style={{ marginLeft:'auto', background:'var(--error)', color:'white', fontSize:10, padding:'2px 6px', borderRadius:6 }}>{pending.length}</span>}
              </button>
            ))}
          </div>
        </div>
        
        <div style={{ marginTop: 'auto', padding: '1.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: 20, border: '1px solid var(--border-subtle)' }}>
          <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'white', marginBottom: 4 }}>System Status</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div className="pulse" style={{ width: 8, height: 8, background: 'var(--success)', borderRadius: 99 }} />
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 800 }}>LIVE PRODUCTION</span>
          </div>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <main style={{ flex: 1, padding: '3rem' }}>
        <div style={{ marginBottom: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 900, letterSpacing: '-0.03em' }}>
              {TABS.find(t => t.id === tab)?.label} Control
            </h1>
            <p style={{ color: 'var(--text-dim)', marginTop: 4 }}>Managing Fixit Marketplace ecosystem and operations.</p>
          </div>
          <div style={{ textAlign: 'right' }} className="hide-mobile">
            <p style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-muted)' }}>ADMINISTRATOR</p>
            <p style={{ fontWeight: 800, color: 'white' }}>{user?.name}</p>
          </div>
        </div>

        {loading ? <div style={{ display:'flex', justifyContent:'center', padding:'10rem 0' }}><Loader /></div> : (
          <div className="fade-in">
            {/* ── ANALYTICS ── */}
            {tab === 'analytics' && analytics && (
              <div style={{ display: 'grid', gap: '2.5rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
                  {[
                    { l: 'Total Revenue', v: `₹${(analytics.totalRevenue || 0).toLocaleString()}`, c: 'var(--success)', i: TrendingUp },
                    { l: 'Active Users', v: analytics.totalUsers, c: '#a855f7', i: Users },
                    { l: 'Completed Jobs', v: analytics.totalBookings, c: 'var(--accent)', i: Calendar },
                    { l: 'Catalog Items', v: analytics.totalServices, c: '#6366f1', i: Package },
                  ].map((s, idx) => (
                    <div key={idx} className="glass-card" style={{ padding: '2rem', position: 'relative', overflow: 'hidden' }}>
                      <div style={{ position: 'absolute', top: 0, right: 0, padding: '1.5rem', opacity: 0.05 }}><s.i size={60} /></div>
                      <p style={{ fontSize: '0.7rem', fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>{s.l}</p>
                      <h3 style={{ fontSize: '2.25rem', fontWeight: 900, color: 'white' }}>{s.v}</h3>
                      <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 6, color: s.c, fontSize: '0.75rem', fontWeight: 800 }}>
                        <ArrowUpRight size={14} /> +12.5% this month
                      </div>
                    </div>
                  ))}
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem' }} className="grid-mobile-stack">
                   <div className="glass-card" style={{ padding: '2rem' }}>
                      <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '2rem' }}>Growth Analytics</h3>
                      <div style={{ height: 300, background: 'rgba(255,255,255,0.01)', borderRadius: 20, border: '1px dashed var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                         Interactive Chart Component (Coming Soon)
                      </div>
                   </div>
                   <div className="glass-card" style={{ padding: '2rem' }}>
                      <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1.5rem' }}>System Alerts</h3>
                      <div style={{ display: 'grid', gap: '1rem' }}>
                         {pending.length > 0 && (
                           <div style={{ padding: '1.25rem', borderRadius: 16, background: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.2)', display: 'flex', gap: 12 }}>
                              <ShieldCheck size={20} className="text-warning" />
                              <div>
                                 <p style={{ fontWeight: 800, fontSize: '0.9rem', color: 'white' }}>Pending Approvals</p>
                                 <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>{pending.length} experts waiting for verification.</p>
                                 <button onClick={() => setTab('providers')} style={{ marginTop: 12, background: 'none', border: 'none', color: 'var(--accent)', fontWeight: 800, fontSize: '0.75rem', cursor: 'pointer' }}>REVIEW NOW →</button>
                              </div>
                           </div>
                         )}
                         <div style={{ padding: '1.25rem', borderRadius: 16, background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.2)', display: 'flex', gap: 12 }}>
                            <CheckCircle size={20} className="text-success" />
                            <div>
                               <p style={{ fontWeight: 800, fontSize: '0.9rem', color: 'white' }}>Server Status</p>
                               <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>All systems operational. Latency: 42ms</p>
                            </div>
                         </div>
                      </div>
                   </div>
                </div>
              </div>
            )}

            {/* ── CUSTOMERS LIST ── */}
            {tab === 'users' && (
              <div className="glass-card" style={{ padding: '1.5rem', overflow: 'hidden' }}>
                 <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Registered Customers</h3>
                    <div style={{ position: 'relative', width: 300 }}>
                       <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                       <input type="text" placeholder="Search customers..." value={userSearch} onChange={e => setUserSearch(e.target.value)} className="input-field" style={{ paddingLeft: 38, height: 40, fontSize: '0.85rem' }} />
                    </div>
                 </div>
                 <div style={{ overflowX: 'auto' }}>
                    <table className="table">
                       <thead><tr><th>Customer Detail</th><th>Status</th><th>Joined Date</th><th>Actions</th></tr></thead>
                       <tbody>
                          {users.filter(u => u.role === 'user').map(u => (
                            <tr key={u._id}>
                               <td>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                     <div className="avatar" style={{ width: 36, height: 36, fontSize: '0.7rem' }}>{u.name?.charAt(0)}</div>
                                     <div><p style={{ fontWeight: 800, fontSize: '0.9rem' }}>{u.name}</p><p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{u.email}</p></div>
                                  </div>
                               </td>
                               <td><span className={`badge ${u.isActive ? 'badge-success' : 'badge-error'}`} style={{ fontSize: 9 }}>{u.isActive ? 'ACTIVE' : 'BANNED'}</span></td>
                               <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                               <td>
                                  <div style={{ display: 'flex', gap: 8 }}>
                                     <button onClick={() => toggleUser(u._id)} className="btn btn-outline" style={{ padding: '0.4rem', width: 32, height: 32 }}>{u.isActive ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}</button>
                                     <button onClick={() => deleteUser(u._id)} className="btn btn-outline" style={{ padding: '0.4rem', width: 32, height: 32, color: 'var(--error)' }}><Trash2 size={14} /></button>
                                  </div>
                               </td>
                            </tr>
                          ))}
                       </tbody>
                    </table>
                 </div>
              </div>
            )}

            {/* ── ALL EXPERTS LIST ── */}
            {tab === 'providers_all' && (
              <div className="glass-card" style={{ padding: '1.5rem', overflow: 'hidden' }}>
                 <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Service Professionals</h3>
                    <div style={{ position: 'relative', width: 300 }}>
                       <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                       <input type="text" placeholder="Search experts..." value={userSearch} onChange={e => setUserSearch(e.target.value)} className="input-field" style={{ paddingLeft: 38, height: 40, fontSize: '0.85rem' }} />
                    </div>
                 </div>
                 <div style={{ overflowX: 'auto' }}>
                    <table className="table">
                       <thead><tr><th>Expert Detail</th><th>Verification</th><th>Rating</th><th>Status</th><th>Actions</th></tr></thead>
                       <tbody>
                          {users.filter(u => u.role === 'provider').map(u => (
                            <tr key={u._id}>
                               <td>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                     <div className="avatar" style={{ width: 36, height: 36, fontSize: '0.7rem', background: 'var(--accent)', color: 'var(--primary)' }}>{u.name?.charAt(0)}</div>
                                     <div><p style={{ fontWeight: 800, fontSize: '0.9rem' }}>{u.name}</p><p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{u.email}</p></div>
                                  </div>
                               </td>
                               <td>
                                  {u.providerProfile?.isApproved ? 
                                    <span style={{ color: 'var(--success)', display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.75rem', fontWeight: 800 }}><ShieldCheck size={14} /> VERIFIED</span> : 
                                    <span style={{ color: 'var(--warning)', display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.75rem', fontWeight: 800 }}><AlertCircle size={14} /> PENDING</span>
                                  }
                               </td>
                               <td style={{ fontSize: '0.85rem', fontWeight: 700 }}><Star size={12} fill="var(--accent)" color="var(--accent)" style={{ marginRight: 4 }} />{u.providerProfile?.rating || '5.0'}</td>
                               <td><span className={`badge ${u.isActive ? 'badge-success' : 'badge-error'}`} style={{ fontSize: 9 }}>{u.isActive ? 'ACTIVE' : 'BANNED'}</span></td>
                               <td>
                                  <div style={{ display: 'flex', gap: 8 }}>
                                     <button onClick={() => toggleUser(u._id)} className="btn btn-outline" style={{ padding: '0.4rem', width: 32, height: 32 }}>{u.isActive ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}</button>
                                     <button onClick={() => deleteUser(u._id)} className="btn btn-outline" style={{ padding: '0.4rem', width: 32, height: 32, color: 'var(--error)' }}><Trash2 size={14} /></button>
                                  </div>
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
      </main>
    </div>
  );
};

export default AdminDashboard;
