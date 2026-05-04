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
    <div className="glass-card shadow-2xl z-[2000] reveal-up" style={{ 
      position: 'absolute', right: 0, top: 'calc(100% + 15px)', 
      width: '320px', background: 'rgba(15, 15, 15, 0.98)', 
      border: '1px solid var(--border-accent)', borderRadius: '24px',
      overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
    }}>
      <div style={{ display:'flex', alignItems:'center', justifyBetween:'space-between', padding:'1.25rem', borderBottom: '1px solid var(--border-subtle)', background: 'rgba(255,255,255,0.02)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
           <h4 style={{ fontSize:'0.7rem', fontWeight:900, textTransform:'uppercase', letterSpacing:'0.1em', color:'white' }}>Activity</h4>
           {unreadCount > 0 && <span style={{ background:'var(--accent)', color:'var(--primary)', padding:'2px 8px', borderRadius:6, fontSize:10, fontWeight:900 }}>{unreadCount} NEW</span>}
        </div>
        <button onClick={() => dispatch(markAllRead())} style={{ marginLeft:'auto', background:'none', border:'none', fontSize:10, fontWeight:800, color:'var(--accent)', cursor:'pointer', textTransform:'uppercase' }}>Clear All</button>
      </div>

      <div style={{ maxHeight: '380px', overflowY: 'auto', padding: '0.5rem' }} className="custom-scrollbar-thin">
        {notifications.length === 0 ? (
          <div style={{ padding:'3rem 1rem', textAlign:'center' }}>
            <Bell size={32} style={{ opacity:0.1, marginBottom:12 }} />
            <p style={{ fontSize:'0.75rem', color:'var(--text-muted)' }}>No new updates</p>
          </div>
        ) : (
          notifications.map(n => (
            <div key={n._id} onClick={() => { if(!n.isRead) dispatch(markOneRead(n._id)); onClose(); }}
              style={{ padding:'1rem', borderRadius:16, marginBottom:4, background: !n.isRead ? 'rgba(250,204,21,0.03)' : 'transparent', cursor:'pointer', display:'flex', gap:12 }}
              className="hover-bg-subtle"
            >
              <div style={{ width:40, height:40, borderRadius:12, background: !n.isRead ? 'var(--accent-soft)' : 'rgba(255,255,255,0.03)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                 {n.icon || '✨'}
              </div>
              <div style={{ flex:1 }}>
                 <p style={{ fontSize:'0.8rem', fontWeight: !n.isRead ? 800 : 600, color: !n.isRead ? 'white' : 'var(--text-dim)', marginBottom:2 }}>{n.title}</p>
                 <p style={{ fontSize:'0.7rem', color:'var(--text-muted)', lineHeight:1.4 }}>{n.message}</p>
                 <p style={{ fontSize:'0.6rem', color:'var(--text-muted)', opacity:0.5, marginTop:6, fontWeight:800 }}>{formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}</p>
              </div>
            </div>
          ))
        )}
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
        <div className="fade-in" style={{ 
          position:'fixed', top:0, left:0, right:0, bottom:0, 
          background:'rgba(10, 10, 10, 0.98)', 
          backdropFilter: 'blur(20px)',
          zIndex: 999, padding: '2rem',
          display:'flex', flexDirection:'column'
        }}>
           <div style={{ display:'flex', justifyContent:'flex-end', marginBottom:'2rem' }}>
              <button onClick={() => setMenuOpen(false)} style={{ background:'none', border:'none', color:'white' }}>
                 <X size={32} />
              </button>
           </div>
           
           <div style={{ display:'grid', gap:'0.5rem' }}>
              {navLinks.map((l, i) => (
                <Link key={l.to} to={l.to} style={{ 
                   fontSize:'2rem', fontWeight:900, textDecoration:'none', 
                   color: location.pathname === l.to ? 'var(--accent)' : 'white', 
                   padding:'1.25rem 0', borderBottom:'1px solid var(--border-subtle)',
                   animation: `revealUp 0.5s ease forwards ${i * 0.1}s`
                }}>
                   {l.label}
                </Link>
              ))}
              <div style={{ marginTop:'3rem', display:'grid', gap:'1rem' }}>
                 {user ? (
                   <Link to={getDashLink()} className="btn btn-primary" style={{ height:60, fontSize:'1.1rem', borderRadius:16 }}>Go to Dashboard</Link>
                 ) : (
                   <>
                     <Link to="/login" className="btn btn-outline" style={{ height:60, fontSize:'1.1rem', borderRadius:16 }}>Login</Link>
                     <Link to="/register" className="btn btn-primary" style={{ height:60, fontSize:'1.1rem', borderRadius:16 }}>Get Started</Link>
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
