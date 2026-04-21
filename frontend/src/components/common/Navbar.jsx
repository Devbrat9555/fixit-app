import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../redux/slices/authSlice';
import { fetchNotifications, markAllRead, markOneRead, deleteNotif } from '../../redux/slices/notificationsSlice';
import { Wrench, Menu, X, LogOut, LayoutDashboard, ChevronDown, Bell, Settings, User, Shield, Briefcase, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const NotifPanel = ({ onClose }) => {
  const dispatch = useDispatch();
  const { notifications, unreadCount } = useSelector(s => s.notifications);

  return (
    <div className="absolute right-0 top-12 w-80 glass rounded-2xl shadow-2xl z-50 fade-in-down overflow-hidden" style={{ border: '1px solid rgba(99,102,241,0.2)' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div>
          <span className="text-white font-semibold text-sm">Notifications</span>
          {unreadCount > 0 && (
            <span className="ml-2 px-1.5 py-0.5 rounded-full text-xs font-bold" style={{ background: 'rgba(239,68,68,0.2)', color: '#f87171' }}>
              {unreadCount} new
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button onClick={() => dispatch(markAllRead())} className="text-xs" style={{ color: 'var(--brand-400)' }}>
            Mark all read
          </button>
        )}
      </div>

      {/* List */}
      <div style={{ maxHeight: '340px', overflowY: 'auto' }}>
        {notifications.length === 0 ? (
          <div className="text-center py-10">
            <div className="text-3xl mb-2">🔔</div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>No notifications yet</p>
          </div>
        ) : (
          notifications.map(n => (
            <div key={n._id}
              onClick={() => !n.isRead && dispatch(markOneRead(n._id))}
              style={{
                padding: '0.875rem 1rem',
                borderBottom: '1px solid rgba(255,255,255,0.04)',
                background: !n.isRead ? 'rgba(99,102,241,0.06)' : 'transparent',
                cursor: 'pointer',
                transition: 'background 0.2s',
              }}
              className="flex items-start gap-3 hover:bg-white/5"
            >
              <span style={{ fontSize: '1.2rem', flexShrink: 0, marginTop: '1px' }}>{n.icon}</span>
              <div className="flex-1 min-w-0">
                <p style={{ color: 'var(--text-primary)', fontSize: '0.82rem', fontWeight: n.isRead ? 400 : 600, lineHeight: 1.4 }}>
                  {n.title}
                </p>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '2px', lineHeight: 1.4 }} className="line-clamp-2">
                  {n.message}
                </p>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.7rem', marginTop: '4px' }}>
                  {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                </p>
              </div>
              <button onClick={(e) => { e.stopPropagation(); dispatch(deleteNotif(n._id)); }}
                className="opacity-0 hover:opacity-100 p-1 rounded"
                style={{ color: 'var(--text-muted)', transition: 'opacity 0.2s', flexShrink: 0 }}
                onMouseEnter={e => e.currentTarget.style.opacity = 1}
                onMouseLeave={e => e.currentTarget.style.opacity = 0}
              >
                <Trash2 size={12} />
              </button>
              {!n.isRead && (
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--brand-500)', marginTop: 5, flexShrink: 0 }} />
              )}
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
  const { unreadCount } = useSelector(s => s.notifications);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef(null);
  const notifRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (user) dispatch(fetchNotifications());
  }, [user, dispatch]);

  useEffect(() => {
    setMenuOpen(false);
    setDropdownOpen(false);
    setNotifOpen(false);
  }, [location.pathname]);

  const handleLogout = () => { dispatch(logout()); navigate('/'); };

  const getDashLink = () => {
    if (!user) return '/login';
    return user.role === 'admin' ? '/admin/dashboard' : user.role === 'provider' ? '/provider/dashboard' : '/dashboard';
  };

  const roleColor = { admin: '#f59e0b', provider: '#a855f7', user: '#6366f1' };
  const roleBg = { admin: 'rgba(245,158,11,0.1)', provider: 'rgba(168,85,247,0.1)', user: 'rgba(99,102,241,0.1)' };

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/services', label: 'Services' },
  ];

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
      transition: 'all 0.3s ease',
      background: scrolled ? 'rgba(7,11,20,0.92)' : 'transparent',
      backdropFilter: scrolled ? 'blur(20px)' : 'none',
      borderBottom: scrolled ? '1px solid rgba(255,255,255,0.05)' : 'none',
    }}>
      <div className="container" style={{ height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', textDecoration: 'none' }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'var(--grad-brand)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 14px rgba(99,102,241,0.4)',
            transition: 'transform 0.2s ease',
          }}
            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.08)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
          >
            <Wrench size={17} color="white" />
          </div>
          <span style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em', whiteSpace: 'nowrap' }} className="gradient-text">
            Fixit
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hide-mobile" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          {navLinks.map(l => (
            <Link key={l.to} to={l.to} style={{
              padding: '0.5rem 1rem',
              borderRadius: '0.5rem',
              fontSize: '0.875rem',
              fontWeight: 500,
              textDecoration: 'none',
              transition: 'all 0.2s',
              color: location.pathname === l.to ? 'var(--brand-400)' : 'var(--text-secondary)',
              background: location.pathname === l.to ? 'rgba(99,102,241,0.1)' : 'transparent',
            }}>
              {l.label}
            </Link>
          ))}
        </div>

        {/* Right side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {user ? (
            <>
              {/* Notification Bell */}
              <div ref={notifRef} style={{ position: 'relative' }}>
                <button
                  onClick={() => { setNotifOpen(!notifOpen); setDropdownOpen(false); }}
                  style={{
                    width: 38, height: 38, borderRadius: 10,
                    background: notifOpen ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', position: 'relative', transition: 'all 0.2s',
                  }}
                >
                  <Bell size={17} color={notifOpen ? 'var(--brand-400)' : 'var(--text-secondary)'} />
                  {unreadCount > 0 && (
                    <div className="notif-dot" style={{ fontSize: unreadCount > 9 ? '0.5rem' : '0.6rem' }}>
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </div>
                  )}
                </button>
                {notifOpen && <NotifPanel onClose={() => setNotifOpen(false)} />}
              </div>

              {/* User Dropdown */}
              <div ref={dropdownRef} style={{ position: 'relative' }}>
                <button
                  onClick={() => { setDropdownOpen(!dropdownOpen); setNotifOpen(false); }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                    padding: '0.375rem 0.75rem 0.375rem 0.375rem',
                    borderRadius: '0.75rem',
                    background: dropdownOpen ? 'rgba(99,102,241,0.12)' : 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    cursor: 'pointer', transition: 'all 0.2s',
                  }}
                >
                  <div className="avatar" style={{ width: 30, height: 30, fontSize: '0.8rem' }}>
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', maxWidth: 80, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} className="hide-mobile">
                    {user.name.split(' ')[0]}
                  </span>
                  <ChevronDown size={13} color="var(--text-muted)" style={{ transform: dropdownOpen ? 'rotate(180deg)' : '', transition: 'transform 0.2s' }} />
                </button>

                {dropdownOpen && (
                  <div style={{
                    position: 'absolute', right: 0, top: '110%',
                    width: 220,
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-default)',
                    borderRadius: '0.875rem',
                    boxShadow: 'var(--shadow-card)',
                    padding: '0.5rem',
                    zIndex: 60,
                  }} className="fade-in-down">
                    {/* User info */}
                    <div style={{ padding: '0.5rem 0.75rem 0.75rem', marginBottom: '0.25rem', borderBottom: '1px solid var(--border-subtle)' }}>
                      <p style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>{user.name}</p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }} className="truncate">{user.email}</p>
                      <span style={{
                        display: 'inline-block', marginTop: '0.375rem',
                        padding: '0.2rem 0.6rem', borderRadius: '999px',
                        fontSize: '0.7rem', fontWeight: 700, textTransform: 'capitalize',
                        color: roleColor[user.role], background: roleBg[user.role],
                      }}>
                        {user.role === 'admin' ? '👑' : user.role === 'provider' ? '🔧' : '👤'} {user.role}
                      </span>
                    </div>

                    {[
                      { to: getDashLink(), icon: LayoutDashboard, label: 'Dashboard' },
                      { to: '/profile', icon: Settings, label: 'Settings' },
                    ].map(item => (
                      <Link key={item.to} to={item.to} style={{
                        display: 'flex', alignItems: 'center', gap: '0.6rem',
                        padding: '0.6rem 0.75rem', borderRadius: '0.5rem',
                        fontSize: '0.85rem', fontWeight: 500,
                        color: 'var(--text-secondary)', textDecoration: 'none',
                        transition: 'all 0.15s',
                      }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.08)'; e.currentTarget.style.color = 'var(--brand-400)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = ''; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                      >
                        <item.icon size={15} /> {item.label}
                      </Link>
                    ))}

                    <div style={{ margin: '0.25rem 0', height: 1, background: 'var(--border-subtle)' }} />
                    <button onClick={handleLogout} style={{
                      width: '100%', display: 'flex', alignItems: 'center', gap: '0.6rem',
                      padding: '0.6rem 0.75rem', borderRadius: '0.5rem',
                      fontSize: '0.85rem', fontWeight: 500, cursor: 'pointer',
                      background: 'transparent', border: 'none',
                      color: '#f87171', transition: 'all 0.15s',
                    }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.08)'}
                      onMouseLeave={e => e.currentTarget.style.background = ''}
                    >
                      <LogOut size={15} /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost hide-mobile" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>Login</Link>
              <Link to="/register" className="btn btn-primary" style={{ padding: '0.5rem 1.125rem', fontSize: '0.875rem' }}>Get Started</Link>
            </>
          )}

          {/* Mobile toggle */}
          <button
            className="show-mobile"
            onClick={() => setMenuOpen(!menuOpen)}
            style={{
              width: 38, height: 38, borderRadius: 8,
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
            }}
          >
            {menuOpen ? <X size={18} color="white" /> : <Menu size={18} color="var(--text-secondary)" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="glass fade-in-down" style={{ margin: '0 1rem 0.75rem', borderRadius: '0.875rem', padding: '1rem' }}>
          {navLinks.map(l => (
            <Link key={l.to} to={l.to} style={{
              display: 'block', padding: '0.75rem 0.5rem',
              fontSize: '0.9rem', fontWeight: 500, textDecoration: 'none',
              color: location.pathname === l.to ? 'var(--brand-400)' : 'var(--text-secondary)',
              borderBottom: '1px solid rgba(255,255,255,0.04)',
            }}>
              {l.label}
            </Link>
          ))}
          <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem' }}>
            {user ? (
              <>
                <Link to={getDashLink()} className="btn btn-primary btn-full" style={{ flex: 1 }}>Dashboard</Link>
                <button onClick={handleLogout} className="btn btn-danger" style={{ flex: 1 }}>Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-ghost btn-full" style={{ flex: 1 }}>Login</Link>
                <Link to="/register" className="btn btn-primary btn-full" style={{ flex: 1 }}>Sign Up</Link>
              </>
            )}
          </div>
        </div>
      )}

      {/* Backdrop to close dropdowns */}
      {(dropdownOpen || notifOpen) && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 49 }} onClick={() => { setDropdownOpen(false); setNotifOpen(false); }} />
      )}
    </nav>
  );
};

export default Navbar;
