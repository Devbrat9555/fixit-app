import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout, clearAuth } from '../../redux/slices/authSlice';
import { useAuth, useUser } from '@clerk/clerk-react';
import { fetchNotifications, markAllRead, markOneRead } from '../../redux/slices/notificationsSlice';
import { Wrench, Menu, X, LogOut, LayoutDashboard, ChevronDown, Bell, Settings, Shield, Briefcase, Sparkles, User as UserIcon } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const NotifPanel = ({ notifications, unreadCount, onClose }) => {
  const dispatch = useDispatch();

  return (
    <div className="absolute right-0 top-16 w-[340px] glass-card shadow-2xl z-50 reveal-up overflow-hidden" style={{ background: 'rgba(15,15,15,0.98)', border: '1px solid var(--border-accent)', borderRadius:20 }}>
      <div className="flex items-center justify-between p-4 border-b border-white/5 bg-white/5">
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
           <h4 className="text-white font-black text-xs uppercase tracking-widest">Inbox</h4>
           {unreadCount > 0 && <span style={{ background:'var(--accent)', color:'var(--primary)', padding:'2px 6px', borderRadius:6, fontSize:10, fontWeight:900 }}>{unreadCount} NEW</span>}
        </div>
        {unreadCount > 0 && (
          <button onClick={() => dispatch(markAllRead())} className="text-[10px] font-bold uppercase tracking-wider text-accent hover:opacity-80 transition-opacity">
            Mark all read
          </button>
        )}
      </div>

      <div style={{ maxHeight: '400px', overflowY: 'auto' }} className="custom-scrollbar">
        {notifications.length === 0 ? (
          <div className="text-center py-12">
            <div style={{ width:48, height:48, borderRadius:99, background:'rgba(255,255,255,0.02)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 12px' }}>
               <Bell size={20} className="opacity-20" />
            </div>
            <p className="text-muted text-[11px] font-medium">Your inbox is empty</p>
          </div>
        ) : (
          notifications.map(n => (
            <div key={n._id}
              onClick={() => {
                 if(!n.isRead) dispatch(markOneRead(n._id));
                 onClose();
              }}
              style={{
                padding: '1rem',
                borderBottom: '1px solid rgba(255,255,255,0.03)',
                background: !n.isRead ? 'rgba(250,204,21,0.02)' : 'transparent',
                cursor: 'pointer',
              }}
              className="flex items-start gap-4 hover:bg-white/5 transition-colors group"
            >
              <div style={{ 
                 width: 36, height: 36, borderRadius: 10, 
                 background: !n.isRead ? 'var(--accent-soft)' : 'rgba(255,255,255,0.03)', 
                 display:'flex', alignItems:'center', justifyContent:'center', flexShrink: 0,
                 fontSize: 16
              }}>
                 {n.icon || '📩'}
              </div>
              <div className="flex-1 min-w-0">
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:2 }}>
                   <p className={`text-[11px] leading-tight ${!n.isRead ? 'text-white font-bold' : 'text-dim'}`}>
                     {n.title}
                   </p>
                   {!n.isRead && <div style={{ width:6, height:6, borderRadius:99, background:'var(--accent)', marginTop:4 }} />}
                </div>
                <p className="text-[10px] text-muted leading-relaxed line-clamp-2">
                  {n.message}
                </p>
                <p className="text-[9px] text-muted/50 mt-2 font-bold uppercase tracking-tighter">
                  {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
      
      <div className="p-3 bg-white/5 border-t border-white/5 text-center">
         <button className="text-[10px] font-black uppercase text-dim hover:text-white transition-colors">View All Activity</button>
      </div>
    </div>
  );
};

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  
  const { user } = useSelector(s => s.auth);
  const { notifications, unreadCount } = useSelector(s => s.notifications);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { user: clerkUser, isSignedIn } = useUser();
  const location = useLocation();
  const dropdownRef = useRef(null);
  const notifRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) setNotifOpen(false);
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) setDropdownOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (user && isSignedIn) dispatch(fetchNotifications());
  }, [user, isSignedIn, dispatch]);

  useEffect(() => {
    setMenuOpen(false);
    setDropdownOpen(false);
    setNotifOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => { 
    await signOut();
    dispatch(clearAuth()); 
    navigate('/'); 
  };

  const getDashLink = () => {
    if (!user) return '/login';
    if (user.role === 'admin') return '/admin/dashboard';
    if (user.role === 'provider') return '/provider/dashboard';
    return '/dashboard';
  };

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/services', label: 'Services' },
    { to: '/providers', label: 'Experts' },
    { to: '/become-a-partner', label: 'Become a Partner' },
  ];

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
      transition: 'all 0.4s ease',
      background: scrolled ? 'rgba(10, 10, 10, 0.85)' : 'transparent',
      backdropFilter: scrolled ? 'blur(20px)' : 'none',
      borderBottom: scrolled ? '1px solid var(--border-subtle)' : '1px solid transparent',
      height: 'var(--nav-h)',
      display: 'flex',
      alignItems: 'center'
    }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {/* Brand */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
          <div style={{
            width: 44, height: 44, borderRadius: 14,
            background: 'var(--brand-grad)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 8px 24px rgba(250, 204, 21, 0.25)',
          }}>
            <Wrench size={22} color="#121212" strokeWidth={2.5} />
          </div>
          <span style={{ fontSize: '1.6rem', fontWeight: 900, letterSpacing: '-0.05em', color:'white' }}>
            Fix<span style={{ color:'var(--accent)' }}>it</span>
          </span>
        </Link>

        {/* Desktop Links */}
        <div className="hide-mobile" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.03)', padding: '0.4rem', borderRadius: 16, border: '1px solid var(--border-subtle)' }}>
          {navLinks.map(l => (
            <Link key={l.to} to={l.to} style={{
              padding: '0.6rem 1.5rem',
              borderRadius: 12,
              fontSize: '0.85rem',
              fontWeight: 700,
              textDecoration: 'none',
              transition: 'all 0.3s',
              color: location.pathname === l.to ? 'var(--primary)' : 'var(--text-dim)',
              background: location.pathname === l.to ? 'var(--accent)' : 'transparent',
            }}>
              {l.label}
            </Link>
          ))}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          {user ? (
            <>
              {/* Notification */}
              <div ref={notifRef} style={{ position: 'relative' }}>
                <button
                  onClick={() => { setNotifOpen(!notifOpen); setDropdownOpen(false); }}
                  style={{
                    width: 44, height: 44, borderRadius: 14,
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid var(--border-rich)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', position: 'relative',
                  }}
                >
                  <Bell size={20} color="white" opacity={notifOpen ? 1 : 0.6} />
                  {unreadCount > 0 && (
                    <div style={{ position:'absolute', top:-4, right:-4, background:'var(--accent)', color:'var(--primary)', fontSize:'0.65rem', fontWeight:900, minWidth:18, height:18, borderRadius:999, display:'flex', alignItems:'center', justifyContent:'center', border:'3px solid var(--bg-deep)' }}>
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </div>
                  )}
                </button>
                {notifOpen && <NotifPanel notifications={notifications} unreadCount={unreadCount} onClose={() => setNotifOpen(false)} />}
              </div>

              {/* Profile Dropdown */}
              <div ref={dropdownRef} style={{ position: 'relative' }}>
                <button
                  onClick={() => { setDropdownOpen(!dropdownOpen); setNotifOpen(false); }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.75rem',
                    padding: '0.4rem', borderRadius: 16,
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid var(--border-rich)',
                    cursor: 'pointer',
                  }}
                >
                  <div className="avatar" style={{ width: 34, height: 34, borderRadius:12, background:'var(--accent)', color:'var(--primary)' }}>
                    {clerkUser?.imageUrl ? (
                      <img src={clerkUser.imageUrl} alt="profile" style={{ width: '100%', height: '100%', borderRadius:12, objectFit: 'cover' }} />
                    ) : (
                      user.name.charAt(0).toUpperCase()
                    )}
                  </div>
                  <ChevronDown size={14} color="var(--text-muted)" style={{ transform: dropdownOpen ? 'rotate(180deg)' : '', transition: 'transform 0.3s', marginRight:4 }} />
                </button>

                {dropdownOpen && (
                  <div className="glass-card" style={{
                    position: 'absolute', right: 0, top: '120%',
                    width: 240, background: 'var(--bg-elevated)',
                    border: '1px solid var(--border-rich)',
                    padding: '0.75rem', zIndex: 110,
                  }}>
                    <div style={{ padding: '0.75rem', borderBottom: '1px solid var(--border-subtle)', marginBottom: '0.5rem' }}>
                      <p style={{ fontSize: '0.9rem', fontWeight: 800, color: 'white' }}>{user.name}</p>
                      <span className="badge badge-pending" style={{ marginTop: '0.6rem', fontSize: '0.6rem' }}>
                        {user.role} account
                      </span>
                    </div>

                    <Link to={getDashLink()} className="dropdown-item" style={{ display:'flex', alignItems:'center', gap:10, padding:'0.75rem', borderRadius:10, textDecoration:'none', color:'var(--text-dim)', fontSize:'0.85rem', fontWeight:600 }}>
                       <LayoutDashboard size={16} /> Dashboard
                    </Link>
                    <Link to="/profile" className="dropdown-item" style={{ display:'flex', alignItems:'center', gap:10, padding:'0.75rem', borderRadius:10, textDecoration:'none', color:'var(--text-dim)', fontSize:'0.85rem', fontWeight:600 }}>
                       <UserIcon size={16} /> My Profile
                    </Link>

                    <div style={{ height: 1, background: 'var(--border-subtle)', margin: '0.5rem 0' }} />
                    <button onClick={handleLogout} style={{ width:'100%', border:'none', background:'transparent', display:'flex', alignItems:'center', gap:10, padding:'0.75rem', borderRadius:10, color:'var(--error)', fontSize:'0.85rem', fontWeight:700, cursor:'pointer' }}>
                       <LogOut size={16} /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <Link to="/login" className="btn btn-outline" style={{ padding: '0.6rem 1.5rem', borderRadius: 12, fontSize:'0.85rem', border:'none' }}>Login</Link>
              <Link to="/register" className="btn btn-primary" style={{ padding: '0.6rem 1.5rem', borderRadius: 12, fontSize:'0.85rem' }}>Get Started</Link>
            </div>
          )}

          <button className="show-mobile" onClick={() => setMenuOpen(!menuOpen)} style={{ background:'none', border:'none', color:'white' }}>
            {menuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="fade-in" style={{ position:'fixed', top:'var(--nav-h)', left:0, right:0, bottom:0, background:'var(--bg-deep)', zIndex:999, padding:'2rem' }}>
           <div style={{ display:'grid', gap:'1rem' }}>
              {navLinks.map(l => (
                <Link key={l.to} to={l.to} style={{ fontSize:'1.75rem', fontWeight:800, textDecoration:'none', color:'white', padding:'1rem 0', borderBottom:'1px solid var(--border-subtle)' }}>
                   {l.label}
                </Link>
              ))}
              <div style={{ marginTop:'2.5rem', display:'grid', gap:'1rem' }}>
                 {user ? (
                   <Link to={getDashLink()} className="btn btn-primary" style={{ height:60, fontSize:'1.1rem' }}>Go to Dashboard</Link>
                 ) : (
                   <>
                     <Link to="/login" className="btn btn-outline" style={{ height:60, fontSize:'1.1rem' }}>Login</Link>
                     <Link to="/register" className="btn btn-primary" style={{ height:60, fontSize:'1.1rem' }}>Get Started</Link>
                   </>
                 )}
              </div>
           </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
