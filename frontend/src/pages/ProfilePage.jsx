import { useSelector } from 'react-redux';
import { UserProfile } from '@clerk/clerk-react';
import { User, Mail, Shield, Calendar, MapPin, Phone, Edit, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ProfilePage = () => {
  const { user } = useSelector(s => s.auth);
  const navigate = useNavigate();

  return (
    <div className="fade-in" style={{ paddingBottom: 120 }}>
      {/* ── HEADER ────────────────────────────────────────────── */}
      <section style={{ padding: '4rem 0', borderBottom: '1px solid var(--border-subtle)', marginBottom: '4rem' }}>
        <div className="container">
          <button onClick={() => navigate(-1)} className="btn" style={{ background: 'none', border: 'none', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32, fontWeight: 700, padding: 0 }}>
            <ArrowLeft size={20} /> BACK
          </button>
          <div>
            <span style={{ color: 'var(--accent)', fontWeight: 800, fontSize: '0.8rem', letterSpacing: '0.2em' }}>ACCOUNT MANAGEMENT</span>
            <h1 style={{ fontSize: '3.5rem', marginTop: '0.5rem' }}>Your Profile.</h1>
            <p style={{ color: 'var(--text-dim)', fontSize: '1.1rem', marginTop: 8 }}>Manage your personal information and security settings.</p>
          </div>
        </div>
      </section>

      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 48 }} className="grid-mobile-stack">
          {/* Summary Card */}
          <aside>
            <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', position: 'sticky', top: 'calc(var(--nav-h) + 2rem)' }}>
              <div className="avatar" style={{ width: 120, height: 120, fontSize: '3rem', borderRadius: 32, margin: '0 auto 24px', background: 'var(--brand-grad)', color: 'var(--primary)' }}>
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'white' }}>{user?.name}</h2>
              <p style={{ color: 'var(--text-dim)', marginBottom: 24 }}>{user?.email}</p>
              
              <div style={{ display: 'grid', gap: 16, textAlign: 'left' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'var(--text-dim)', fontSize: '0.9rem' }}>
                  <Shield size={16} className="text-accent" />
                  <span>{user?.role?.toUpperCase()} ACCOUNT</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'var(--text-dim)', fontSize: '0.9rem' }}>
                  <Calendar size={16} className="text-accent" />
                  <span>Joined {new Date(user?.createdAt).toLocaleDateString()}</span>
                </div>
                {user?.address?.city && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'var(--text-dim)', fontSize: '0.9rem' }}>
                    <MapPin size={16} className="text-accent" />
                    <span>{user?.address?.city}, {user?.address?.state}</span>
                  </div>
                )}
              </div>
            </div>
          </aside>

          {/* Clerk Profile Component */}
          <div>
            <div className="clerk-profile-wrapper">
              <UserProfile 
                appearance={{
                  variables: {
                    colorPrimary: '#facc15',
                    colorText: '#ffffff',
                    colorBackground: '#121212',
                    colorInputBackground: '#1c1c1c',
                    colorInputText: '#ffffff',
                    colorTextSecondary: '#a1a1aa',
                  },
                  elements: {
                    card: {
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid var(--border-rich)',
                      borderRadius: '24px',
                      boxShadow: 'none',
                    },
                    navbar: {
                      background: 'transparent',
                      borderRight: '1px solid var(--border-subtle)',
                    },
                    pageScrollBox: {
                      padding: '2rem',
                    },
                    headerTitle: {
                      fontSize: '1.5rem',
                      fontWeight: '800',
                    },
                    headerSubtitle: {
                      color: 'var(--text-dim)',
                    }
                  }
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
