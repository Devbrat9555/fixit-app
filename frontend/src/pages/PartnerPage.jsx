import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ShieldCheck, Zap, TrendingUp, Users, CheckCircle, ArrowRight, Briefcase, Award, Sparkles, Star } from 'lucide-react';

const PartnerPage = () => {
  const { user } = useSelector(state => state.auth);

  return (
    <div className="fade-in">
      {/* ── HERO SECTION ────────────────────────────────────────── */}
      <section style={{ 
        padding: '10rem 0 6rem', 
        background: 'var(--bg-card)', 
        borderBottom: '1px solid var(--border-subtle)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ position:'absolute', top:0, left:0, right:0, height:1, background:'var(--brand-grad)', opacity:0.3 }} />
        
        <div className="container" style={{ textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '0.6rem 1.5rem', borderRadius: 99, background: 'var(--accent-soft)', color: 'var(--accent)', fontWeight: 800, fontSize: '0.8rem', marginBottom: 32, textTransform: 'uppercase', letterSpacing: '0.15em', border:'1px solid var(--border-accent)' }}>
             <ShieldCheck size={18} /> THE EXPERT ELITE
          </div>
          <h1 style={{ fontSize: 'clamp(3rem, 8vw, 5rem)', fontWeight: 900, letterSpacing: '-0.05em', lineHeight: 1, marginBottom: 32 }}>
            Monetize Your <br /> <span className="gradient-text">Mastery.</span>
          </h1>
          <p style={{ fontSize: '1.25rem', color: 'var(--text-dim)', maxWidth: 750, margin: '0 auto 48px', lineHeight: 1.8 }}>
            Join India's most exclusive professional network. We don't just find you work; we build your legacy in the luxury home service industry.
          </p>
          <div style={{ display: 'flex', gap: 20, justifyContent: 'center', flexWrap: 'wrap' }}>
             {user?.role === 'provider' ? (
                <Link to="/provider/dashboard" className="btn btn-primary" style={{ padding: '1.25rem 3.5rem', fontSize: '1.1rem', borderRadius: 20 }}>Expert Dashboard</Link>
             ) : (
                <Link to="/register?role=provider" className="btn btn-primary" style={{ padding: '1.25rem 3.5rem', fontSize: '1.1rem', borderRadius: 20 }}>Join the Network</Link>
             )}
             
             {user ? (
                <Link to={user.role === 'provider' ? "/provider/dashboard" : "/dashboard"} className="btn btn-outline" style={{ padding: '1.25rem 3.5rem', fontSize: '1.1rem', borderRadius: 20 }}>Go to Portal</Link>
             ) : (
                <Link to="/login" className="btn btn-outline" style={{ padding: '1.25rem 3.5rem', fontSize: '1.1rem', borderRadius: 20 }}>Expert Portal</Link>
             )}
          </div>
        </div>
      </section>

      {/* ── BENEFITS ─────────────────────────────────────────── */}
      <section style={{ padding: '10rem 0' }}>
         <div className="container">
            <div style={{ textAlign: 'center', marginBottom: '6rem' }}>
               <span style={{ color: 'var(--accent)', fontWeight: 800, fontSize: '0.8rem', letterSpacing: '0.2em' }}>THE ADVANTAGE</span>
               <h2 style={{ fontSize: '3.5rem', fontWeight: 900, marginTop: '1rem' }}>Why lead with Fixit?</h2>
            </div>

            <div className="grid-auto">
               {[
                 { icon: TrendingUp, title: 'Exponential Growth', desc: 'Our top-tier experts earn 4x the industry standard through high-value luxury leads.', color: 'var(--accent)' },
                 { icon: Zap, title: 'Instant Liquidity', desc: 'Secure your earnings with near-instant settlements directly to your business account.', color: 'var(--success)' },
                 { icon: Star, title: 'Prestige Branding', desc: 'Gain exclusive ratings and verified badges that establish you as a premier service artisan.', color: 'var(--accent-amber)' },
                 { icon: Briefcase, title: 'Absolute Autonomy', desc: 'Control your schedule with surgical precision. Your availability, your rules.', color: '#a855f7' },
               ].map((b, i) => (
                 <div key={i} className="glass-card reveal-up" style={{ padding: '3.5rem', animationDelay: `${i * 0.1}s` }}>
                    <div style={{ width: 64, height: 64, borderRadius: 18, background: 'rgba(255,255,255,0.03)', border:'1px solid var(--border-rich)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 32 }}>
                       <b.icon size={32} color={b.color} />
                    </div>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 16, color:'white' }}>{b.title}</h3>
                    <p style={{ color: 'var(--text-dim)', lineHeight: 1.8, fontSize: '1rem' }}>{b.desc}</p>
                 </div>
               ))}
            </div>
         </div>
      </section>

      {/* ── PROCESS ──────────────────────────────────────────── */}
      <section style={{ padding: '10rem 0', background: 'var(--bg-deep)', borderTop: '1px solid var(--border-subtle)' }}>
         <div className="container">
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 100, alignItems: 'center' }} className="grid-mobile-stack">
               <div className="reveal-up">
                  <span style={{ color: 'var(--accent)', fontWeight: 800, fontSize: '0.8rem', letterSpacing: '0.2em' }}>ONBOARDING</span>
                  <h2 style={{ fontSize: '3.5rem', fontWeight: 900, marginBottom: 48, marginTop: '1rem', lineHeight: 1.1 }}>Join the Elite in <br /> Three Simple Phases</h2>
                  <div style={{ display: 'grid', gap: 40 }}>
                     {[
                       { step: '01', title: 'Digital Enrollment', desc: 'Detail your expertise, certifications, and operational region through our secure portal.' },
                       { step: '02', title: 'Credential Audit', desc: 'Our team performs a high-standard background and skill verification of your portfolio.' },
                       { step: '03', title: 'Market Activation', desc: 'Start receiving high-value service requests within 24 hours of final approval.' },
                     ].map((s, i) => (
                       <div key={i} style={{ display: 'flex', gap: 32 }}>
                          <div style={{ fontSize: '3.5rem', fontWeight: 900, color: 'var(--accent)', opacity:0.1, fontStyle: 'italic', lineHeight: 1, width:80 }}>{s.step}</div>
                          <div>
                             <h4 style={{ fontWeight: 800, fontSize: '1.5rem', marginBottom: 8, color:'white' }}>{s.title}</h4>
                             <p style={{ color: 'var(--text-dim)', fontSize:'1.1rem', lineHeight:1.6 }}>{s.desc}</p>
                          </div>
                       </div>
                     ))}
                  </div>
                  <Link to="/register?role=provider" className="btn btn-primary" style={{ marginTop: 64, padding: '1.25rem 3rem', fontSize:'1.1rem' }}>Initiate Registration <ArrowRight size={20} style={{ marginLeft:12 }} /></Link>
               </div>
               
               <div style={{ position: 'relative' }} className="reveal-up">
                  <div style={{ 
                    borderRadius: '2.5rem', overflow: 'hidden', 
                    border: '1px solid var(--border-rich)',
                    boxShadow: '0 40px 80px rgba(0,0,0,0.6)'
                  }}>
                     <img src="/hero-main.png" alt="Master Artisan" style={{ width: '100%', display: 'block' }} />
                  </div>
                  <div className="glass-card" style={{ position: 'absolute', bottom: -40, right: -40, padding: '2rem 3rem', background: 'var(--bg-elevated)', border: '1px solid var(--border-accent)', textAlign:'center' }}>
                     <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <div style={{ width: 56, height: 56, borderRadius: 14, background: 'var(--accent-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                           <Award size={28} className="text-accent" />
                        </div>
                        <div style={{ textAlign:'left' }}>
                           <p style={{ fontWeight: 900, fontSize: '1.5rem', color:'white' }}>50,000+</p>
                           <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.1em' }}>Verified Experts</p>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </section>
    </div>
  );
};

export default PartnerPage;
