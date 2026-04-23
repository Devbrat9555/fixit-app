import { useSelector } from 'react-redux';
import { Link, useLocation } from 'react-router-dom';
import { Navigation, Clock, ChevronRight, Zap } from 'lucide-react';

const ActiveBookingBar = () => {
  const { bookings } = useSelector(s => s.bookings);
  const location = useLocation();

  // Find the most urgent active booking
  const activeBooking = bookings.find(b => ['accepted', 'on_the_way', 'arrived'].includes(b.status));

  // Don't show on dashboard (where the tracker is already visible) or if no active booking
  if (!activeBooking || location.pathname === '/dashboard') return null;

  const statusLabels = {
    accepted: 'Preparing for service',
    on_the_way: 'Expert is on the way',
    arrived: 'Expert has arrived'
  };

  return (
    <div 
      className="fade-in"
      style={{
        position: 'fixed',
        bottom: 24,
        left: '50%',
        transform: 'translateX(-50%)',
        width: 'calc(100% - 48px)',
        maxWidth: 600,
        zIndex: 2000,
      }}
    >
      <Link to="/dashboard" style={{ textDecoration: 'none' }}>
        <div className="glass-card" style={{
          padding: '1rem 1.5rem',
          background: 'rgba(20, 20, 20, 0.95)',
          border: '1px solid var(--border-accent)',
          boxShadow: '0 20px 40px rgba(0,0,0,0.6), var(--brand-glow)',
          display: 'flex',
          alignItems: 'center',
          gap: 16
        }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12,
            background: 'var(--brand-grad)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0
          }}>
            <Navigation size={22} color="var(--primary)" className="pulse" />
          </div>
          
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 2 }}>
              Active Booking
            </p>
            <h4 style={{ fontSize: '1rem', color: 'white', fontWeight: 800 }}>
              {statusLabels[activeBooking.status]}
            </h4>
          </div>

          <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: 12 }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                <Clock size={14} />
                <span>ETA: 15m</span>
             </div>
             <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ChevronRight size={18} color="white" />
             </div>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default ActiveBookingBar;
