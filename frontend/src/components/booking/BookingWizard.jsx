import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { createBooking } from '../../redux/slices/bookingsSlice';
import { 
  CheckCircle, Calendar, MapPin, CreditCard, ArrowLeft, ArrowRight, 
  Clock, AlertTriangle, Star, ShieldCheck, Zap, Sparkles, X, UserCheck, 
  Search, Briefcase, Navigation
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { getCategoryThumbnail } from '../../utils/serviceUtils';

const TIME_SLOTS = ['08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM', '06:00 PM'];

const STEPS = [
  { icon: Calendar,    label: 'Schedule' },
  { icon: MapPin,      label: 'Location' },
  { icon: Briefcase,   label: 'Expert'   },
  { icon: CreditCard,  label: 'Payment'  },
  { icon: CheckCircle, label: 'Confirm'  },
];

const StepIndicator = ({ current }) => (
  <div style={{ display:'flex', alignItems:'center', marginBottom:'2.5rem', justifyContent:'center', gap:12 }}>
    {STEPS.map((step, i) => {
      const done    = i < current;
      const active  = i === current;
      return (
        <div key={i} style={{ display:'flex', alignItems:'center', gap:12 }}>
          <div style={{ 
            width:34, height:34, borderRadius:10,
            display:'flex', alignItems:'center', justifyContent:'center',
            background: done ? 'var(--accent-emerald)' : active ? 'var(--grad-brand)' : 'var(--bg-surface)',
            border: active || done ? 'none' : '1px solid var(--border-subtle)',
            color: done||active ? 'white' : 'var(--text-muted)',
            transition:'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: active ? '0 8px 16px rgba(99,102,241,0.3)' : 'none'
          }}>
            {done ? <CheckCircle size={16} /> : <step.icon size={15} />}
          </div>
          {i < STEPS.length - 1 && (
             <div style={{ width:16, height:2, background: done ? 'var(--accent-emerald)' : 'var(--border-subtle)', borderRadius:999 }} />
          )}
        </div>
      );
    })}
  </div>
);

const BookingWizard = ({ service, onClose, initialExpertId }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector(s => s.auth);
  const { isLoading } = useSelector(s => s.bookings);
  
  const [step, setStep] = useState(0);
  const [providers, setProviders] = useState([]);
  const [isFetchingProviders, setIsFetchingProviders] = useState(false);
  
  const [form, setForm] = useState({
    scheduledDate: '',
    scheduledTime: '',
    address: {
      street:  user?.address?.street  || '',
      city:    user?.address?.city    || '',
      state:   user?.address?.state   || '',
      pincode: user?.address?.pincode || '',
    },
    providerId: initialExpertId || null, // Selected provider
    paymentMethod: 'cash',
    notes: '',
    isUrgent: false,
  });

  useEffect(() => {
    if (step === 2) {
      fetchAvailableProviders();
    }
  }, [step]);

  const fetchAvailableProviders = async () => {
    setIsFetchingProviders(true);
    try {
      const { data } = await api.get('/auth/providers', {
        params: { 
          skill: service.category?.name,
          city: form.address.city
        }
      });
      setProviders(data.data);
    } catch (err) {
      toast.error('Could not find nearby experts');
    } finally {
      setIsFetchingProviders(false);
    }
  };

  const isStepValid = () => {
    if (step === 0) return form.scheduledDate && form.scheduledTime;
    if (step === 1) return form.address.street && form.address.city && form.address.state && form.address.pincode;
    if (step === 2) return true; // Provider selection is optional (broadcast if none)
    if (step === 3) return true;
    return true;
  };

  const handleSubmit = async () => {
     const payload = { 
       ...form, 
       serviceId: service._id,
       userLocation: form.address.coordinates || null 
     };
     const result = await dispatch(createBooking(payload));
     if (!result.error) {
       toast.success('Booking confirmed! 🎉');
       navigate('/dashboard');
     }
  };

  const thumbnail = service.image || getCategoryThumbnail(service.category?.name);

  return (
    <div style={{
      position:'fixed', inset:0, zIndex:2000,
      background:'rgba(7,11,20,0.85)', backdropFilter:'blur(12px)',
      display:'flex', alignItems:'center', justifyContent:'center', padding:'1rem',
    }} className="fade-in" onClick={e => e.target === e.currentTarget && onClose()}>
      
      <div style={{
        background:'var(--bg-surface)',
        border:'1px solid var(--border-subtle)',
        borderRadius:'2.5rem',
        width:'100%', maxWidth:600,
        padding:'2.5rem',
        boxShadow: '0 40px 100px rgba(0,0,0,0.6)',
        position:'relative',
        overflow:'hidden'
      }} className="fade-in-up">
        
        {/* Header Summary */}
        <div style={{ display:'flex', gap:20, marginBottom:'2.5rem', padding:'1.25rem', borderRadius:'1.5rem', background:'rgba(255,255,255,0.02)', border:'1px solid var(--border-subtle)', position:'relative', zIndex:1 }}>
           <img src={thumbnail} alt={service.title} style={{ width:64, height:64, borderRadius:12, objectFit:'cover' }} />
           <div style={{ flex:1 }}>
              <div style={{ display:'flex', alignItems:'center', gap:6, color:'var(--brand-400)', fontSize:'0.65rem', fontWeight:800, textTransform:'uppercase', marginBottom:2 }}>
                 <ShieldCheck size={12} /> SECURE BOOKING
              </div>
              <h3 style={{ fontSize:'1rem', fontWeight:800, color:'var(--text-primary)' }} className="truncate">{service.title}</h3>
              <p style={{ fontSize:'0.85rem', color:'var(--brand-400)', fontWeight:900, marginTop:2 }}>₹{service.price}</p>
           </div>
           <button onClick={onClose} style={{ background:'none', border:'none', color:'var(--text-muted)', cursor:'pointer' }}>
              <X size={20} />
           </button>
        </div>

        <StepIndicator current={step} />

        <div style={{ minHeight: 380 }}>
           {/* Step 0: Schedule */}
           {step === 0 && (
             <div className="fade-in">
                <h3 style={{ fontSize:'1.25rem', fontWeight:800, marginBottom:'1.5rem' }}>When should we come?</h3>
                <div style={{ display:'flex', gap:10, overflowX:'auto', paddingBottom:12, marginBottom:'1.5rem' }}>
                  {Array.from({length: 14}).map((_, i) => {
                    const date = new Date();
                    date.setDate(date.getDate() + i + 1);
                    const key = date.toISOString().split('T')[0];
                    const isSelected = form.scheduledDate === key;
                    return (
                      <button key={key} onClick={() => setForm(p => ({...p, scheduledDate:key}))} style={{
                        minWidth:60, padding:'0.75rem 0.5rem', borderRadius:'0.875rem',
                        border:`2px solid ${isSelected ? 'var(--brand-400)' : 'var(--border-subtle)'}`,
                        background: isSelected ? 'rgba(99,102,241,0.1)' : 'var(--bg-card)',
                        cursor:'pointer', transition:'all 0.2s', flexShrink:0,
                      }}>
                        <div style={{ fontSize:'0.6rem', color: isSelected ? 'var(--brand-400)' : 'var(--text-muted)', fontWeight:700 }}>{date.toLocaleDateString('en-US',{weekday:'short'})}</div>
                        <div style={{ fontSize:'1.1rem', fontWeight:900, color: isSelected ? 'white' : 'var(--text-primary)', margin:'2px 0' }}>{date.getDate()}</div>
                        <div style={{ fontSize:'0.6rem', color: isSelected ? 'var(--brand-400)' : 'var(--text-muted)', fontWeight:700 }}>{date.toLocaleDateString('en-US',{month:'short'})}</div>
                      </button>
                    );
                  })}
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(100px, 1fr))', gap:8, marginBottom:'2rem' }}>
                   {TIME_SLOTS.map(slot => (
                     <button key={slot} onClick={() => setForm(p => ({...p, scheduledTime:slot}))} style={{
                        padding:'0.75rem', borderRadius:'0.75rem', fontSize:'0.75rem', fontWeight:700,
                        border:`1.5px solid ${form.scheduledTime === slot ? 'var(--brand-400)' : 'var(--border-subtle)'}`,
                        background: form.scheduledTime === slot ? 'rgba(99,102,241,0.1)' : 'var(--bg-card)',
                        color: form.scheduledTime === slot ? 'white' : 'var(--text-secondary)',
                        cursor:'pointer'
                     }}>{slot}</button>
                   ))}
                </div>
                <div onClick={() => setForm(p => ({...p, isUrgent: !p.isUrgent}))} style={{ display:'flex', alignItems:'center', gap:16, padding:'1rem', borderRadius:'1.25rem', background: form.isUrgent ? 'rgba(244,63,94,0.05)' : 'rgba(255,255,255,0.02)', border: `1.5px solid ${form.isUrgent ? 'var(--accent-rose)' : 'var(--border-subtle)'}`, cursor: 'pointer' }}>
                   <Zap size={20} color={form.isUrgent ? 'var(--accent-rose)' : 'var(--text-muted)'} />
                   <div style={{ flex:1 }}><p style={{ fontWeight:800, fontSize:'0.85rem' }}>Urgent / Emergency Service</p><p style={{ fontSize:'0.7rem', color:'var(--text-muted)' }}>Priority assignment within 60 mins.</p></div>
                </div>
             </div>
           )}

           {/* Step 1: Location */}
           {step === 1 && (
             <div className="fade-in">
                 <div style={{ display:'grid', gap:16 }}>
                    <button 
                      onClick={() => {
                        if (navigator.geolocation) {
                          navigator.geolocation.getCurrentPosition(
                            (pos) => {
                              const { latitude, longitude } = pos.coords;
                              // In a real app, we would reverse-geocode here. 
                              // For now, we'll store the coords and a placeholder address.
                              setForm(p => ({
                                ...p, 
                                address: {
                                  ...p.address,
                                  street: `Live Coords: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
                                  city: 'Current Location',
                                  state: 'Live GPS',
                                  pincode: '000000',
                                  coordinates: { lat: latitude, lng: longitude }
                                }
                              }));
                              toast.success('Live location captured! 📍');
                            },
                            (err) => toast.error('Location access denied.')
                          );
                        }
                      }}
                      className="btn btn-outline"
                      style={{ padding: '1rem', borderRadius: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, borderStyle: 'dashed' }}
                    >
                      <Navigation size={18} className="pulse" /> Use My Current Live Location
                    </button>
                    <div style={{ position: 'relative', textAlign: 'center', margin: '8px 0' }}>
                       <span style={{ background: 'var(--bg-surface)', padding: '0 12px', fontSize: '0.7rem', color: 'var(--text-muted)', position: 'relative', zIndex: 1 }}>OR ENTER MANUALLY</span>
                       <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: 1, background: 'var(--border-subtle)', zIndex: 0 }}></div>
                    </div>
                    <input className="input-field" value={form.address.street} onChange={e => setForm(p => ({...p, address:{...p.address, street:e.target.value}}))} placeholder="House No / Street" />
                    <div style={{ display:'grid', gridTemplateColumns: '1fr 1fr', gap:12 }}>
                       <input className="input-field" value={form.address.city} onChange={e => setForm(p => ({...p, address:{...p.address, city:e.target.value}}))} placeholder="City" />
                       <input className="input-field" value={form.address.state} onChange={e => setForm(p => ({...p, address:{...p.address, state:e.target.value}}))} placeholder="State" />
                    </div>
                    <input className="input-field" value={form.address.pincode} onChange={e => setForm(p => ({...p, address:{...p.address, pincode:e.target.value}}))} placeholder="Pincode" />
                 </div>
             </div>
           )}

           {/* Step 2: Expert Selection */}
           {step === 2 && (
             <div className="fade-in">
                <h3 style={{ fontSize:'1.25rem', fontWeight:800, marginBottom:'0.5rem' }}>Choose your Expert</h3>
                <p style={{ fontSize:'0.85rem', color:'var(--text-muted)', marginBottom:'1.5rem' }}>Select a professional or we'll assign the best one for you.</p>
                
                {isFetchingProviders ? (
                  <div style={{ textAlign:'center', padding:'3rem 0' }}><Sparkles className="pulse" /> Searching Experts...</div>
                ) : providers.length === 0 ? (
                  <div style={{ padding:'2rem', background:'rgba(255,255,255,0.02)', borderRadius:'1.5rem', textAlign:'center', border:'1px dashed var(--border-subtle)' }}>
                     <p style={{ fontWeight:700, marginBottom:8 }}>No specific experts found in {form.address.city}</p>
                     <p style={{ fontSize:'0.8rem', color:'var(--text-muted)' }}>Don't worry! We will broadcast your request to all nearby professionals.</p>
                     <button onClick={() => setStep(3)} className="btn btn-primary" style={{ marginTop:20, width:'100%' }}>Continue with Smart Assignment</button>
                  </div>
                ) : (
                  <div style={{ display:'grid', gap:12, maxHeight:300, overflowY:'auto', paddingRight:8 }} className="custom-scrollbar">
                     <div onClick={() => setForm(p => ({...p, providerId: null}))} style={{
                        padding:'1rem', borderRadius:'1.25rem', cursor:'pointer', border:`2px solid ${form.providerId === null ? 'var(--brand-400)' : 'var(--border-subtle)'}`,
                        background: form.providerId === null ? 'rgba(99,102,241,0.05)' : 'var(--bg-card)', display:'flex', alignItems:'center', gap:12
                     }}>
                        <div style={{ width:40, height:40, borderRadius:10, background:'var(--grad-brand)', display:'flex', alignItems:'center', justifyContent:'center' }}><Zap size={18} color="white"/></div>
                        <div style={{ flex:1 }}><p style={{ fontWeight:800, fontSize:'0.9rem' }}>Smart Assignment</p><p style={{ fontSize:'0.75rem', color:'var(--text-muted)' }}>We'll pick the top-rated professional for you.</p></div>
                        {form.providerId === null && <CheckCircle size={18} color="var(--brand-400)" />}
                     </div>

                     {providers.map(p => (
                       <div key={p._id} onClick={() => setForm(prev => ({...prev, providerId: p._id}))} style={{
                          padding:'1rem', borderRadius:'1.25rem', cursor:'pointer', border:`2px solid ${form.providerId === p._id ? 'var(--brand-400)' : 'var(--border-subtle)'}`,
                          background: form.providerId === p._id ? 'rgba(99,102,241,0.05)' : 'var(--bg-card)', display:'flex', alignItems:'center', gap:12
                       }}>
                          <div className="avatar" style={{ width:40, height:40, fontSize:'0.8rem' }}>{p.name.charAt(0)}</div>
                          <div style={{ flex:1 }}>
                             <p style={{ fontWeight:800, fontSize:'0.9rem' }}>{p.name}</p>
                             <div style={{ display:'flex', alignItems:'center', gap:8, fontSize:'0.7rem', color:'var(--text-muted)' }}>
                                <span style={{ display:'flex', alignItems:'center', gap:2 }}><Star size={10} fill="var(--accent-amber)" color="var(--accent-amber)"/> {p.providerProfile?.rating}</span>
                                <span>• {p.providerProfile?.experience} Yrs Exp</span>
                             </div>
                          </div>
                          {form.providerId === p._id && <CheckCircle size={18} color="var(--brand-400)" />}
                       </div>
                     ))}
                  </div>
                )}
             </div>
           )}

           {/* Step 3: Payment */}
           {step === 3 && (
             <div className="fade-in">
                <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:'1.5rem' }}>
                   <ShieldCheck size={24} className="text-accent" />
                   <h3 style={{ fontSize:'1.25rem', fontWeight:800 }}>Secure Checkout</h3>
                </div>

                <div style={{ display:'grid', gap:16 }}>
                   <div 
                      onClick={() => setForm(p => ({...p, paymentMethod:'online'}))} 
                      style={{ 
                         padding:'1.5rem', borderRadius:'1.5rem', cursor:'pointer', 
                         background: form.paymentMethod === 'online' ? 'rgba(99,102,241,0.05)' : 'rgba(255,255,255,0.02)', 
                         border: `2px solid ${form.paymentMethod === 'online' ? 'var(--accent)' : 'var(--border-subtle)'}`,
                         transition: 'all 0.3s'
                      }}
                   >
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
                         <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                            <CreditCard size={20} className={form.paymentMethod === 'online' ? 'text-accent' : 'text-dim'} />
                            <span style={{ fontWeight:800, color: form.paymentMethod === 'online' ? 'white' : 'var(--text-dim)' }}>Digital Payment</span>
                         </div>
                         <div style={{ display:'flex', gap:4 }}>
                            <div style={{ width:24, height:16, background:'rgba(255,255,255,0.1)', borderRadius:3 }} />
                            <div style={{ width:24, height:16, background:'rgba(255,255,255,0.1)', borderRadius:3 }} />
                         </div>
                      </div>
                      <p style={{ fontSize:'0.75rem', color:'var(--text-muted)' }}>UPI, Credit/Debit Cards, NetBanking. <span style={{ color:'var(--success)', fontWeight:700 }}>5% Instant Discount</span></p>
                   </div>

                   <div 
                      onClick={() => setForm(p => ({...p, paymentMethod:'cash'}))} 
                      style={{ 
                         padding:'1.5rem', borderRadius:'1.5rem', cursor:'pointer', 
                         background: form.paymentMethod === 'cash' ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.02)', 
                         border: `2px solid ${form.paymentMethod === 'cash' ? 'var(--accent)' : 'var(--border-subtle)'}`,
                         transition: 'all 0.3s'
                      }}
                   >
                      <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:8 }}>
                         <Zap size={20} className={form.paymentMethod === 'cash' ? 'text-accent' : 'text-dim'} />
                         <span style={{ fontWeight:800, color: form.paymentMethod === 'cash' ? 'white' : 'var(--text-dim)' }}>Cash After Service</span>
                      </div>
                      <p style={{ fontSize:'0.75rem', color:'var(--text-muted)' }}>Pay directly to the professional after job completion.</p>
                   </div>
                </div>

                <div style={{ marginTop:32, padding:'1.5rem', borderRadius:16, background:'var(--bg-elevated)', border:'1px solid var(--border-subtle)' }}>
                   <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8, fontSize:'0.85rem' }}>
                      <span style={{ color:'var(--text-muted)' }}>Service Fee</span>
                      <span style={{ fontWeight:700 }}>₹{service.price}</span>
                   </div>
                   <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8, fontSize:'0.85rem' }}>
                      <span style={{ color:'var(--text-muted)' }}>Platform Protection</span>
                      <span style={{ fontWeight:700 }}>₹49</span>
                   </div>
                   {form.paymentMethod === 'online' && (
                      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8, fontSize:'0.85rem', color:'var(--success)' }}>
                         <span>Online Discount</span>
                         <span style={{ fontWeight:700 }}>-₹{Math.round(service.price * 0.05)}</span>
                      </div>
                   )}
                   <div style={{ height:1, background:'var(--border-subtle)', margin:'12px 0' }} />
                   <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                      <span style={{ fontWeight:800 }}>Amount to Pay</span>
                      <span style={{ fontSize:'1.5rem', fontWeight:900, color:'white' }}>
                         ₹{form.paymentMethod === 'online' ? Math.round(service.price * 0.95) + 49 : service.price + 49}
                      </span>
                   </div>
                </div>
             </div>
           )}

           {/* Step 4: Confirm */}
           {step === 4 && (
             <div className="fade-in">
                <h3 style={{ fontSize:'1.25rem', fontWeight:800, marginBottom:'1.5rem' }}>Confirm Booking</h3>
                <div style={{ background:'rgba(255,255,255,0.02)', border:'1px solid var(--border-subtle)', borderRadius:'1.5rem', padding:'1.5rem', display:'grid', gap:12 }}>
                   <div style={{ display:'flex', justifyContent:'space-between', fontSize:'0.85rem' }}><span style={{ color:'var(--text-muted)' }}>Expert</span><span style={{ fontWeight:700 }}>{form.providerId ? providers.find(p => p._id === form.providerId)?.name : 'Smart Assignment'}</span></div>
                   <div style={{ display:'flex', justifyContent:'space-between', fontSize:'0.85rem' }}><span style={{ color:'var(--text-muted)' }}>Schedule</span><span style={{ fontWeight:700 }}>{form.scheduledDate} at {form.scheduledTime}</span></div>
                   <div style={{ display:'flex', justifyContent:'space-between', fontSize:'0.85rem' }}><span style={{ color:'var(--text-muted)' }}>Address</span><span style={{ fontWeight:700 }}>{form.address.city}, {form.address.pincode}</span></div>
                   <div style={{ height:1, background:'var(--border-subtle)', margin:'8px 0' }} />
                   <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}><span style={{ fontWeight:800 }}>Total</span><span style={{ fontWeight:900, fontSize:'1.5rem', color:'var(--brand-400)' }}>₹{service.price}</span></div>
                </div>
             </div>
           )}
        </div>

        <div style={{ display:'flex', gap:12, marginTop:'2rem' }}>
           {step > 0 && <button onClick={() => setStep(step-1)} className="btn btn-ghost" style={{ flex:1, height:50 }}>Back</button>}
           <button onClick={() => step === 4 ? handleSubmit() : setStep(step+1)} disabled={!isStepValid() || isLoading} className="btn btn-primary" style={{ flex:2, height:50 }}>{isLoading ? 'Processing...' : step === 4 ? 'Confirm & Book' : 'Continue'}</button>
        </div>
      </div>
    </div>
  );
};

export default BookingWizard;
