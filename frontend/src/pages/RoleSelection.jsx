import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { User, Briefcase, ChevronRight, MapPin, Phone, Star, Sparkles, Check, ArrowLeft } from 'lucide-react';
import api from '../services/api';
import { setUser } from '../redux/slices/authSlice';
import toast from 'react-hot-toast';

const RoleSelection = () => {
  const [step, setStep] = useState(1);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(false);
  const { user } = useSelector(s => s.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    phone: '',
    address: { city: '', state: '', pincode: '', street: '' },
    providerProfile: {
      bio: '',
      skills: [],
      experience: 0,
    }
  });

  const availableSkills = [
    'Plumbing', 'Electrician', 'Cleaning', 'Carpentry', 
    'AC Repair', 'Painting', 'Appliance Repair', 'Pest Control',
    'Salon at Home', 'Massage Therapy', 'Home Automation'
  ];

  const handleRoleSelect = (selectedRole) => {
    setRole(selectedRole);
    setStep(2);
  };

  const handleSkillToggle = (skill) => {
    const current = formData.providerProfile.skills;
    if (current.includes(skill)) {
      setFormData({
        ...formData,
        providerProfile: { ...formData.providerProfile, skills: current.filter(s => s !== skill) }
      });
    } else {
      setFormData({
        ...formData,
        providerProfile: { ...formData.providerProfile, skills: [...current, skill] }
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/auth/complete-setup', {
        role,
        ...formData
      });
      dispatch(setUser(data.data));
      toast.success('Profile setup complete! Welcome to Fixit.');
      navigate(role === 'provider' ? '/provider/dashboard' : '/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Setup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-deep)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ maxWidth: 900, width: '100%' }} className="reveal-up">
        
        {/* Progress Header */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginBottom: '5rem' }}>
          {[1, 2].map(i => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ 
                width: 44, height: 44, borderRadius: 14, 
                background: step >= i ? 'var(--brand-grad)' : 'var(--bg-elevated)',
                border: '1px solid ' + (step >= i ? 'transparent' : 'var(--border-rich)'),
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1rem', fontWeight: 900, color: step >= i ? 'var(--primary)' : 'var(--text-muted)',
                transition: 'all 0.4s ease',
                boxShadow: step >= i ? 'var(--brand-glow)' : 'none'
              }}>
                {step > i ? <Check size={20} strokeWidth={3} /> : i}
              </div>
              <div style={{ textAlign: 'left' }}>
                <p style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>STEP 0{i}</p>
                <span style={{ fontSize: '0.9rem', fontWeight: 700, color: step >= i ? 'white' : 'var(--text-dim)' }}>
                  {i === 1 ? 'Select Account' : 'Complete Profile'}
                </span>
              </div>
              {i === 1 && <div style={{ width: 60, height: 1, background: 'var(--border-rich)', margin: '0 12px' }} />}
            </div>
          ))}
        </div>

        {step === 1 ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ display: 'inline-flex', padding: '0.6rem 1.5rem', borderRadius: 99, background: 'var(--accent-soft)', color: 'var(--accent)', fontSize: '0.8rem', fontWeight: 800, marginBottom: 24, border: '1px solid var(--border-accent)' }}>
              <Sparkles size={16} style={{ marginRight: 8 }} /> HELLO, {user?.name?.split(' ')[0]?.toUpperCase()}
            </div>
            <h1 style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>Welcome to <span className="gradient-text">Fixit.</span></h1>
            <p style={{ color: 'var(--text-dim)', fontSize: '1.2rem', marginBottom: '4rem', maxWidth: 500, margin: '0 auto 4rem' }}>How would you like to use the platform today?</p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }} className="grid-mobile-stack">
              {/* Option: User */}
              <div 
                onClick={() => handleRoleSelect('user')}
                className="glass-card"
                style={{ padding: '4rem 3rem', cursor: 'pointer', textAlign: 'left' }}
              >
                <div style={{ width: 72, height: 72, borderRadius: 20, background: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 32, border: '1px solid var(--border-rich)' }}>
                  <User size={36} color="white" />
                </div>
                <h3 style={{ fontSize: '1.75rem', marginBottom: '1rem' }}>I want to hire</h3>
                <p style={{ color: 'var(--text-dim)', fontSize: '1rem', lineHeight: 1.6 }}>Find and book verified experts for your home repairs and luxury maintenance.</p>
                <div style={{ marginTop: 40, display: 'flex', alignItems: 'center', gap: 10, fontWeight: 800, color: 'var(--accent)', fontSize: '0.9rem' }}>
                  CONTINUE AS CLIENT <ChevronRight size={18} />
                </div>
              </div>

              {/* Option: Provider */}
              <div 
                onClick={() => handleRoleSelect('provider')}
                className="glass-card"
                style={{ padding: '4rem 3rem', cursor: 'pointer', textAlign: 'left' }}
              >
                <div style={{ width: 72, height: 72, borderRadius: 20, background: 'var(--accent-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 32, border: '1px solid var(--border-accent)' }}>
                  <Briefcase size={36} color="var(--accent)" />
                </div>
                <h3 style={{ fontSize: '1.75rem', marginBottom: '1rem' }}>I want to work</h3>
                <p style={{ color: 'var(--text-dim)', fontSize: '1rem', lineHeight: 1.6 }}>Join India's most elite professional network and grow your luxury service business.</p>
                <div style={{ marginTop: 40, display: 'flex', alignItems: 'center', gap: 10, fontWeight: 800, color: 'var(--accent)', fontSize: '0.9rem' }}>
                  JOIN AS EXPERT <ChevronRight size={18} />
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="reveal-up" style={{ maxWidth: 650, margin: '0 auto' }}>
            <button 
              onClick={() => setStep(1)}
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: '0.9rem', fontWeight: 700, marginBottom: 24, padding: '0.5rem' }}
              onMouseEnter={e => e.currentTarget.style.color = 'white'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
            >
              <ArrowLeft size={18} /> BACK TO SELECTION
            </button>
            
            <div className="glass-card" style={{ padding: '4rem' }}>
              <h2 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Final Details.</h2>
              <p style={{ color: 'var(--text-dim)', fontSize: '1.1rem', marginBottom: '3rem' }}>Complete your profile to unlock the platform features.</p>

              <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 24 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 20 }} className="grid-mobile-stack">
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: 10, display: 'block', letterSpacing: '0.1em' }}>PHONE NUMBER</label>
                    <div style={{ position: 'relative' }}>
                      <Phone size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                      <input 
                        required type="tel" placeholder="+91 98765 43210" className="input-field"
                        style={{ paddingLeft: 48, height: 56 }}
                        value={formData.phone}
                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                      />
                    </div>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: 10, display: 'block', letterSpacing: '0.1em' }}>CITY</label>
                    <div style={{ position: 'relative' }}>
                      <MapPin size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                      <input 
                        required type="text" placeholder="e.g. Mumbai" className="input-field"
                        style={{ paddingLeft: 48, height: 56 }}
                        value={formData.address.city}
                        onChange={e => setFormData({ ...formData, address: { ...formData.address, city: e.target.value } })}
                      />
                    </div>
                  </div>
                </div>

                {role === 'provider' && (
                  <div className="reveal-up" style={{ display: 'grid', gap: 24 }}>
                    <div>
                      <label style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: 16, display: 'block', letterSpacing: '0.1em' }}>SELECT EXPERTISE (MIN 1)</label>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                        {availableSkills.map(skill => (
                          <button
                            key={skill} type="button" onClick={() => handleSkillToggle(skill)}
                            style={{
                              padding: '0.6rem 1.25rem', borderRadius: 12, fontSize: '0.8rem', fontWeight: 700,
                              background: formData.providerProfile.skills.includes(skill) ? 'var(--accent)' : 'rgba(255,255,255,0.03)',
                              border: '1px solid ' + (formData.providerProfile.skills.includes(skill) ? 'transparent' : 'var(--border-rich)'),
                              color: formData.providerProfile.skills.includes(skill) ? 'var(--primary)' : 'var(--text-dim)',
                              cursor: 'pointer', transition: 'all 0.3s'
                            }}
                          >
                            {skill}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: 10, display: 'block', letterSpacing: '0.1em' }}>YEARS OF EXPERIENCE</label>
                      <div style={{ position: 'relative' }}>
                        <Star size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input 
                          required type="number" min="0" className="input-field"
                          style={{ paddingLeft: 48, height: 56 }}
                          value={formData.providerProfile.experience}
                          onChange={e => setFormData({ ...formData, providerProfile: { ...formData.providerProfile, experience: e.target.value } })}
                        />
                      </div>
                    </div>

                    <div>
                      <label style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: 10, display: 'block', letterSpacing: '0.1em' }}>PROFESSIONAL BIO</label>
                      <textarea 
                        required rows={3} placeholder="Tell clients about your expertise and work ethic..." className="input-field"
                        style={{ resize: 'none', padding: '1rem 1.25rem' }}
                        value={formData.providerProfile.bio}
                        onChange={e => setFormData({ ...formData, providerProfile: { ...formData.providerProfile, bio: e.target.value } })}
                      />
                    </div>
                  </div>
                )}

                <button 
                  disabled={loading} type="submit" className="btn btn-primary"
                  style={{ marginTop: 12, height: 64, fontSize: '1.1rem', borderRadius: 16 }}
                >
                  {loading ? 'Finalizing Setup...' : 'Complete Profile & Start →'}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RoleSelection;
