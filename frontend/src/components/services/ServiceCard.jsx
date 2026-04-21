import { Star, Clock, Zap, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const priceLabel = { fixed: '₹', hourly: '₹/hr', starting_from: 'From ₹' };

const ServiceCard = ({ service }) => {
  const { _id, title, description, price, priceType, rating, totalRatings, totalBookings, image, category, provider, isUrgent } = service;

  return (
    <Link to={`/services/${_id}`} style={{ textDecoration:'none', display:'block' }}>
      <div style={{
        background:'var(--bg-card)',
        border:'1px solid var(--border-subtle)',
        borderRadius:'1.125rem',
        overflow:'hidden',
        transition:'all 0.3s cubic-bezier(0.4,0,0.2,1)',
        cursor:'pointer',
        height:'100%',
        display:'flex',
        flexDirection:'column',
      }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(99,102,241,0.4)'; e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 20px 48px rgba(0,0,0,0.4)'; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
      >
        {/* Image */}
        <div style={{ position:'relative', height:180, overflow:'hidden', flexShrink:0 }}>
          <img
            src={image || 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=500'}
            alt={title}
            style={{ width:'100%', height:'100%', objectFit:'cover', transition:'transform 0.5s ease' }}
            onError={e => e.target.src = 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=500'}
            onMouseEnter={e => e.target.style.transform = 'scale(1.06)'}
            onMouseLeave={e => e.target.style.transform = 'scale(1)'}
          />
          <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top, rgba(7,11,20,0.85) 0%, transparent 50%)' }} />

          {/* Category badge */}
          {category && (
            <div style={{
              position:'absolute', top:10, left:10,
              padding:'0.25rem 0.625rem', borderRadius:999,
              background:'rgba(7,11,20,0.8)', backdropFilter:'blur(8px)',
              border:'1px solid rgba(255,255,255,0.1)',
              fontSize:'0.72rem', fontWeight:600, color:'white',
              display:'flex', alignItems:'center', gap:4,
            }}>
              {category.icon} {category.name}
            </div>
          )}

          {/* Urgent badge */}
          {isUrgent && (
            <div style={{
              position:'absolute', top:10, right:10,
              padding:'0.2rem 0.5rem', borderRadius:999,
              background:'rgba(244,63,94,0.9)', backdropFilter:'blur(8px)',
              fontSize:'0.68rem', fontWeight:700, color:'white',
              display:'flex', alignItems:'center', gap:3,
            }}>
              <Zap size={10} fill="white" /> URGENT
            </div>
          )}

          {/* Rating overlay */}
          <div style={{
            position:'absolute', bottom:10, right:10,
            padding:'0.25rem 0.625rem', borderRadius:999,
            background:'rgba(7,11,20,0.85)', backdropFilter:'blur(8px)',
            display:'flex', alignItems:'center', gap:4,
          }}>
            <Star size={12} style={{ fill:'#fbbf24', color:'#fbbf24' }} />
            <span style={{ fontSize:'0.78rem', fontWeight:700, color:'white' }}>{rating?.toFixed(1) || '0.0'}</span>
            <span style={{ fontSize:'0.7rem', color:'var(--text-muted)' }}>({totalRatings || 0})</span>
          </div>
        </div>

        {/* Content */}
        <div style={{ padding:'1rem', flex:1, display:'flex', flexDirection:'column' }}>
          <h3 style={{ fontSize:'0.95rem', fontWeight:700, color:'var(--text-primary)', marginBottom:'0.375rem', lineHeight:1.3 }} className="line-clamp-1">
            {title}
          </h3>
          <p style={{ fontSize:'0.8rem', color:'var(--text-secondary)', lineHeight:1.5, marginBottom:'0.75rem', flex:1 }} className="line-clamp-2">
            {description}
          </p>

          {/* Provider */}
          {provider && (
            <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:'0.75rem' }}>
              <div className="avatar" style={{ width:22, height:22, fontSize:'0.65rem' }}>
                {provider.name?.charAt(0)}
              </div>
              <span style={{ fontSize:'0.75rem', color:'var(--text-muted)' }}>{provider.name}</span>
              {provider.providerProfile?.isVerified && (
                <CheckCircle size={12} style={{ color:'var(--accent-emerald)' }} />
              )}
            </div>
          )}

          {/* Bottom row: duration + price */}
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', paddingTop:'0.625rem', borderTop:'1px solid var(--border-subtle)' }}>
            <div style={{ display:'flex', alignItems:'center', gap:4, fontSize:'0.75rem', color:'var(--text-muted)' }}>
              <Clock size={12} />
              <span>{service.duration || 60} min</span>
              {totalBookings > 0 && (
                <span style={{ marginLeft:4 }}>• {totalBookings}+ booked</span>
              )}
            </div>
            <div style={{ textAlign:'right' }}>
              <span style={{ fontSize:'0.7rem', color:'var(--text-muted)' }}>{priceLabel[priceType] || '₹'}</span>
              <span style={{ fontSize:'1.05rem', fontWeight:800, color:'var(--brand-400)', marginLeft:2 }}>
                {price?.toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ServiceCard;
