import { Link } from 'react-router-dom';
import { Wrench, Phone, MapPin, ShieldCheck, Heart, Send, Mail, MessageSquare } from 'lucide-react';
import { FiInstagram } from 'react-icons/fi';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    company: [
      { label: 'About Us', to: '#' },
      { label: 'Careers', to: '#' },
      { label: 'Blog', to: '#' },
      { label: 'Partner with Us', to: '/register' },
    ],
    services: [
      { label: 'Home Cleaning', to: '/services' },
      { label: 'AC Maintenance', to: '/services' },
      { label: 'Electrical Help', to: '/services' },
      { label: 'Plumbing Experts', to: '/services' },
    ],
    support: [
      { label: 'Help Center', to: '#' },
      { label: 'Safety Measures', to: '#' },
      { label: 'Terms & Conditions', to: '#' },
      { label: 'Privacy Policy', to: '#' },
    ]
  };

  return (
    <footer style={{ 
      background: 'var(--bg-deep)', 
      borderTop: '1px solid var(--border-subtle)',
      paddingTop: '8rem',
      paddingBottom: '3rem',
      position: 'relative',
      zIndex: 10
    }}>
      <div className="container">
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '1.5fr 1fr 1fr 1fr', 
          gap: '4rem',
          marginBottom: '6rem'
        }} className="grid-mobile-stack">
          
          {/* Brand Column */}
          <div>
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none', marginBottom: '2rem' }}>
              <div style={{ 
                width: 44, height: 44, borderRadius: 14, 
                background: 'var(--brand-grad)', 
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 8px 24px rgba(250, 204, 21, 0.25)'
              }}>
                <Wrench size={22} color="var(--primary)" strokeWidth={2.5} />
              </div>
              <span style={{ fontSize: '1.8rem', fontWeight: 900, letterSpacing: '-0.05em', color: 'white' }}>
                Fix<span style={{ color: 'var(--accent)' }}>it</span>
              </span>
            </Link>
            <p style={{ color: 'var(--text-dim)', fontSize: '1rem', lineHeight: 1.8, marginBottom: '2.5rem', maxWidth: 300 }}>
              Reimagining home maintenance with luxury, precision, and verified expertise. Experience the gold standard.
            </p>
            <div style={{ display: 'flex', gap: '1rem' }}>
              {[
                { icon: FiInstagram, href: 'https://instagram.com/derek2._.0' },
                { icon: MessageSquare, href: 'https://wa.me/919555977917' },
                { icon: Mail, href: 'mailto:yadavdevbrat022@gmail.com' }
              ].map((s, i) => (
                <a key={i} href={s.href} target="_blank" rel="noopener noreferrer" 
                  style={{ 
                    width: 48, height: 48, borderRadius: 14, 
                    background: 'var(--bg-elevated)', 
                    border: '1px solid var(--border-rich)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'var(--text-dim)', transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={e => { e.currentTarget.style.color = 'var(--accent)'; e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.transform = 'translateY(-4px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-dim)'; e.currentTarget.style.borderColor = 'var(--border-rich)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                >
                  <s.icon size={20} />
                </a>
              ))}
            </div>
          </div>

          {/* Links Columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 style={{ color: 'white', fontSize: '0.9rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '2rem' }}>{title}</h4>
              <div style={{ display: 'grid', gap: '1.25rem' }}>
                {links.map(l => (
                  <Link key={l.label} to={l.to} style={{ 
                    color: 'var(--text-dim)', textDecoration: 'none', fontSize: '0.95rem', fontWeight: 500,
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={e => { e.currentTarget.style.color = 'white'; e.currentTarget.style.transform = 'translateX(6px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-dim)'; e.currentTarget.style.transform = 'translateX(0)'; }}
                  >
                    {l.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Section */}
        <div style={{ 
          borderTop: '1px solid var(--border-subtle)', 
          paddingTop: '3rem',
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '2rem'
        }}>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
             <ShieldCheck size={18} className="text-accent" />
             <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 600 }}>
               © {currentYear} Fixit Marketplace. Secured with Advanced Encryption.
             </p>
          </div>
          <div style={{ display: 'flex', gap: '3rem' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', display:'flex', alignItems:'center', gap:6 }}>
               Developed with <Heart size={14} fill="#ef4444" color="#ef4444" /> for Excellence
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
