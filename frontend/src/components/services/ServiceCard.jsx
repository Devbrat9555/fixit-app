import { Star, Clock, Zap, CheckCircle, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getCategoryThumbnail } from '../../utils/serviceUtils';

const ServiceCard = ({ service }) => {
  const { _id, title, description, price, priceType, rating, totalBookings, image, category, provider, isUrgent } = service;

  const thumbnail = image || getCategoryThumbnail(category?.name);

  return (
    <Link to={`/services/${_id}`} style={{ textDecoration:'none' }}>
      <div className="glass-card" style={{
        height:'100%',
        display:'flex',
        flexDirection:'column',
        overflow:'hidden',
        position: 'relative'
      }}>
        {/* Image Section */}
        <div style={{ position:'relative', height:220, overflow:'hidden' }}>
          <img
            src={thumbnail}
            alt={title}
            style={{ width:'100%', height:'100%', objectFit:'cover' }}
            onError={e => e.target.src = 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=500'}
          />
          {/* Subtle Overlay */}
          <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top, rgba(10,10,10,0.8) 0%, transparent 50%)' }} />

          {/* Badges */}
          <div style={{ position:'absolute', top:16, left:16, display:'flex', gap:10 }}>
            {category && (
              <div style={{
                padding:'0.4rem 0.8rem', borderRadius:8,
                background:'rgba(20,20,20,0.8)', backdropFilter:'blur(10px)',
                border:'1px solid var(--border-rich)',
                fontSize:'0.65rem', fontWeight:800, color:'white',
                display:'flex', alignItems:'center', gap:6,
                letterSpacing:'0.05em'
              }}>
                {category.name.toUpperCase()}
              </div>
            )}
          </div>

          {/* Urgent Label */}
          {isUrgent && (
            <div style={{
              position:'absolute', top:16, right:16,
              background:'var(--brand-grad)',
              padding:'0.4rem 0.8rem', borderRadius:8,
              fontSize:'0.6rem', fontWeight:900, color:'var(--primary)',
              boxShadow: '0 4px 12px rgba(250,204,21,0.3)'
            }}>
              URGENT
            </div>
          )}
        </div>

        {/* Content Section */}
        <div style={{ padding:'1.75rem', flex:1, display:'flex', flexDirection:'column' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'1rem' }}>
            <h3 style={{ fontSize:'1.25rem', fontWeight:800, color:'white', lineHeight:1.2, flex:1 }}>
              {title}
            </h3>
            <div style={{ display:'flex', alignItems:'center', gap:4, background:'var(--accent-soft)', padding:'0.3rem 0.6rem', borderRadius:6 }}>
               <Star size={12} fill="var(--accent)" color="var(--accent)" />
               <span style={{ fontSize:'0.8rem', fontWeight:800, color:'var(--accent)' }}>{rating?.toFixed(1) || '0.0'}</span>
            </div>
          </div>

          <p style={{ fontSize:'0.9rem', color:'var(--text-dim)', marginBottom:'1.5rem', lineHeight:1.6 }} className="line-clamp-2">
            {description}
          </p>

          {/* Expert Info if available */}
          {provider && (
             <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:'1.5rem', padding:'0.75rem', background:'rgba(255,255,255,0.02)', borderRadius:12, border:'1px solid var(--border-subtle)' }}>
                <div style={{ width:32, height:32, borderRadius:8, background:'var(--bg-elevated)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.7rem', fontWeight:800, color:'var(--accent)' }}>{provider.name?.charAt(0)}</div>
                <div style={{ flex:1 }}>
                   <p style={{ fontSize:'0.7rem', color:'var(--text-muted)', fontWeight:800, textTransform:'uppercase' }}>Assigned Expert</p>
                   <p style={{ fontSize:'0.85rem', color:'white', fontWeight:700 }}>{provider.name}</p>
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:4, color:'var(--accent)', fontWeight:800, fontSize:'0.75rem' }}>
                   <Star size={12} fill="var(--accent)" color="var(--accent)" /> {provider.providerProfile?.rating || '5.0'}
                </div>
             </div>
          )}

          {/* Metrics */}
          <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:'2rem' }}>
            <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:'0.75rem', color:'var(--text-muted)', fontWeight:600 }}>
              <Clock size={14} className="text-accent" />
              <span>{service.duration || 60} mins</span>
            </div>
            <div style={{ width:1, height:12, background:'var(--border-rich)' }} />
            <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:'0.75rem', color:'var(--text-muted)', fontWeight:600 }}>
              <CheckCircle size={14} className="text-success" />
              <span>{totalBookings || 0}+ booked</span>
            </div>
          </div>

          {/* Footer */}
          <div style={{ marginTop:'auto', paddingTop:'1.5rem', borderTop:'1px solid var(--border-subtle)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <div>
               <p style={{ fontSize:'0.65rem', color:'var(--text-muted)', textTransform:'uppercase', fontWeight:800, letterSpacing:'0.05em', marginBottom:4 }}>Starting from</p>
               <h4 style={{ fontSize:'1.5rem', fontWeight:900, color:'var(--accent)' }}>
                 ₹{price?.toLocaleString('en-IN')}
               </h4>
            </div>
            <div style={{ width:44, height:44, borderRadius:12, background:'rgba(255,255,255,0.03)', display:'flex', alignItems:'center', justifyContent:'center', border:'1px solid var(--border-rich)', color:'var(--text-dim)' }}>
               <ChevronRight size={20} />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ServiceCard;
