import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { createBooking } from '../../redux/slices/bookingsSlice';
import { CheckCircle, Calendar, MapPin, CreditCard, ArrowLeft, ArrowRight, Clock, AlertTriangle, Star } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';

const TIME_SLOTS = ['08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM', '06:00 PM'];

const STEPS = [
  { icon: Calendar,    label: 'Date & Time' },
  { icon: MapPin,      label: 'Address'     },
  { icon: CreditCard,  label: 'Payment'     },
  { icon: CheckCircle, label: 'Confirm'     },
];

const StepIndicator = ({ current }) => (
  <div style={{ display:'flex', alignItems:'center', marginBottom:'2rem' }}>
    {STEPS.map((step, i) => {
      const done    = i < current;
      const active  = i === current;
      return (
        <div key={i} style={{ display:'flex', alignItems:'center', flex: i < STEPS.length-1 ? 1 : 'none' }}>
          <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:4, flexShrink:0 }}>
            <div style={{
              width:38, height:38, borderRadius:'50%',
              display:'flex', alignItems:'center', justifyContent:'center',
              fontSize:'0.8rem', fontWeight:700,
              background: done ? 'var(--accent-emerald)' : active ? 'var(--grad-brand)' : 'var(--bg-surface)',
              border: active ? 'none' : done ? 'none' : '1.5px solid var(--border-default)',
              color: done||active ? 'white' : 'var(--text-muted)',
              transition:'all 0.3s ease',
              boxShadow: active ? 'var(--shadow-brand)' : 'none',
            }}>
              {done ? <CheckCircle size={16} /> : <step.icon size={15} />}
            </div>
            <span style={{ fontSize:'0.68rem', fontWeight:600, color: active ? 'var(--brand-400)' : done ? 'var(--accent-emerald)' : 'var(--text-muted)', whiteSpace:'nowrap' }}>
              {step.label}
            </span>
          </div>
          {i < STEPS.length-1 && (
            <div style={{ flex:1, height:2, margin:'0 8px 18px', background: done ? 'var(--accent-emerald)' : 'var(--border-subtle)', transition:'background 0.4s' }} />
          )}
        </div>
      );
    })}
  </div>
);

// Get next 14 days excluding today
const getAvailableDates = () => {
  const dates = [];
  for (let i = 1; i <= 14; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    dates.push(d);
  }
  return dates;
};

const BookingWizard = ({ service, onClose }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector(s => s.auth);
  const { isLoading } = useSelector(s => s.bookings);
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    scheduledDate: '',
    scheduledTime: '',
    address: {
      street:  user?.address?.street  || '',
      city:    user?.address?.city    || '',
      state:   user?.address?.state   || '',
      pincode: user?.address?.pincode || '',
    },
    paymentMethod: 'cash',
    notes: '',
    isUrgent: false,
  });

  const dates = getAvailableDates();

  const isStep0Valid = () => form.scheduledDate && form.scheduledTime;
  const isStep1Valid = () => form.address.street && form.address.city && form.address.state && form.address.pincode;
  const isStepValid  = [isStep0Valid, isStep1Valid, () => true, () => true];

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleSubmit = async () => {
    if (form.paymentMethod === 'online') {
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) return toast.error('Failed to load Razorpay SDK');

      try {
        const { data: orderData } = await api.post('/payments/create-order', { amount: service.price });
        const order = orderData.data;
        const isMock = orderData.isMock;
        const keyId = orderData.keyId;

        const options = {
          key: keyId,
          amount: order.amount,
          currency: order.currency,
          name: 'Fixit',
          description: `Payment for ${service.title}`,
          order_id: order.id,
          handler: async function (response) {
            try {
              const verifyPayload = {
                razorpay_order_id: response.razorpay_order_id || order.id,
                razorpay_payment_id: response.razorpay_payment_id || `pay_${Date.now()}`,
                razorpay_signature: response.razorpay_signature || 'mock_sig',
                isMock: isMock
              };
              await api.post('/payments/verify', verifyPayload);
              
              // Proceed with booking creation after payment is verified
              const payload = { ...form, serviceId: service._id, razorpayOrderId: verifyPayload.razorpay_order_id, razorpayPaymentId: verifyPayload.razorpay_payment_id };
              const result = await dispatch(createBooking(payload));
              if (!result.error) {
                toast.success('Payment & Booking confirmed! 🎉');
                navigate('/dashboard');
              }
            } catch (err) {
              toast.error('Payment verification failed');
            }
          },
          prefill: {
            name: user?.name,
            email: user?.email,
            contact: user?.phone || '9999999999'
          },
          theme: { color: '#6366f1' }
        };

        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', function (response) {
          toast.error(response.error.description);
        });
        rzp.open();
      } catch (err) {
        toast.error('Could not initiate payment. Try again.');
      }
    } else {
      const payload = { ...form, serviceId: service._id };
      const result = await dispatch(createBooking(payload));
      if (!result.error) {
        toast.success('Booking confirmed! 🎉');
        navigate('/dashboard');
      }
    }
  };

  const Section = ({ title, children }) => (
    <div style={{ animation:'fadeInUp 0.35s ease both' }}>
      <h3 style={{ fontSize:'1rem', fontWeight:700, color:'var(--text-primary)', marginBottom:'1.25rem', display:'flex', alignItems:'center', gap:8 }}>
        {title}
      </h3>
      {children}
    </div>
  );

  return (
    <div style={{
      position:'fixed', inset:0, zIndex:60,
      background:'rgba(0,0,0,0.75)', backdropFilter:'blur(6px)',
      display:'flex', alignItems:'center', justifyContent:'center', padding:'1rem',
      overflowY:'auto',
    }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{
        background:'var(--bg-card)',
        border:'1px solid var(--border-default)',
        borderRadius:'1.25rem',
        width:'100%', maxWidth:560,
        padding:'2rem',
        animation:'scaleIn 0.25s ease',
        position:'relative',
      }}>
        {/* Service summary header */}
        <div style={{ display:'flex', gap:12, marginBottom:'1.75rem', padding:'0.875rem', borderRadius:'0.875rem', background:'var(--bg-surface)', border:'1px solid var(--border-subtle)' }}>
          <img src={service.image} alt={service.title} style={{ width:56, height:56, borderRadius:8, objectFit:'cover', flexShrink:0 }}
            onError={e => e.target.src='https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=100'} />
          <div style={{ flex:1, minWidth:0 }}>
            <p style={{ fontWeight:700, color:'var(--text-primary)', fontSize:'0.9rem' }} className="line-clamp-1">{service.title}</p>
            <p style={{ fontSize:'0.8rem', color:'var(--text-muted)', marginTop:2 }}>by {service.provider?.name}</p>
          </div>
          <div style={{ textAlign:'right', flexShrink:0 }}>
            <p style={{ fontWeight:900, fontSize:'1.15rem', color:'var(--brand-400)' }}>₹{service.price?.toLocaleString('en-IN')}</p>
            <p style={{ fontSize:'0.7rem', color:'var(--text-muted)' }}>incl. taxes</p>
          </div>
        </div>

        <StepIndicator current={step} />

        {/* Step 0: Date & Time */}
        {step === 0 && (
          <Section title="📅 Select Date & Time">
            <div style={{ marginBottom:'1.25rem' }}>
              <label className="label">Choose Date</label>
              <div style={{ display:'flex', gap:8, overflowX:'auto', paddingBottom:8 }}>
                {dates.map(date => {
                  const key = date.toISOString().split('T')[0];
                  const isSelected = form.scheduledDate === key;
                  const dayName = date.toLocaleDateString('en-US',{weekday:'short'});
                  const dayNum  = date.getDate();
                  const month   = date.toLocaleDateString('en-US',{month:'short'});
                  return (
                    <button key={key} onClick={() => setForm(p => ({...p, scheduledDate:key}))} style={{
                      minWidth:56, padding:'0.625rem 0.5rem', borderRadius:'0.75rem',
                      border:`1.5px solid ${isSelected ? 'var(--brand-500)' : 'var(--border-subtle)'}`,
                      background: isSelected ? 'rgba(99,102,241,0.15)' : 'var(--bg-surface)',
                      cursor:'pointer', textAlign:'center', transition:'all 0.2s', flexShrink:0,
                    }}>
                      <div style={{ fontSize:'0.65rem', color: isSelected ? 'var(--brand-400)' : 'var(--text-muted)', fontWeight:600 }}>{dayName}</div>
                      <div style={{ fontSize:'1.1rem', fontWeight:800, color: isSelected ? 'var(--brand-400)' : 'var(--text-primary)' }}>{dayNum}</div>
                      <div style={{ fontSize:'0.65rem', color: isSelected ? 'var(--brand-400)' : 'var(--text-muted)' }}>{month}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="label">Choose Time Slot</label>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8 }}>
                {TIME_SLOTS.map(slot => {
                  const isSelected = form.scheduledTime === slot;
                  return (
                    <button key={slot} onClick={() => setForm(p => ({...p, scheduledTime:slot}))} style={{
                      padding:'0.6rem', borderRadius:'0.625rem', fontSize:'0.8rem', fontWeight:600,
                      border:`1.5px solid ${isSelected ? 'var(--brand-500)' : 'var(--border-subtle)'}`,
                      background: isSelected ? 'rgba(99,102,241,0.15)' : 'var(--bg-surface)',
                      color: isSelected ? 'var(--brand-400)' : 'var(--text-secondary)',
                      cursor:'pointer', transition:'all 0.2s', display:'flex', alignItems:'center', justifyContent:'center', gap:4,
                    }}>
                      <Clock size={12} /> {slot}
                    </button>
                  );
                })}
              </div>
            </div>

            <div style={{ marginTop:'1rem' }}>
              <label className="label">Special notes (optional)</label>
              <textarea
                placeholder="Describe the issue or any specific requirements..."
                value={form.notes}
                onChange={e => setForm(p => ({...p, notes:e.target.value}))}
                rows={2}
                className="input-field"
                style={{ resize:'none' }}
              />
            </div>

            {/* Urgent toggle */}
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginTop:'1rem', padding:'0.75rem 1rem', borderRadius:'0.75rem', background:'var(--bg-surface)', border:'1px solid var(--border-subtle)' }}>
              <div>
                <p style={{ fontSize:'0.875rem', fontWeight:600, color:'var(--text-primary)', display:'flex', alignItems:'center', gap:6 }}>
                  <AlertTriangle size={14} color="#f59e0b" /> Mark as Urgent
                </p>
                <p style={{ fontSize:'0.75rem', color:'var(--text-muted)' }}>Get priority assignment within 2 hours</p>
              </div>
              <div className={`toggle ${form.isUrgent ? 'on' : ''}`} onClick={() => setForm(p => ({...p, isUrgent:!p.isUrgent}))}>
                <div className="toggle-thumb" />
              </div>
            </div>
          </Section>
        )}

        {/* Step 1: Address */}
        {step === 1 && (
          <Section title="📍 Service Address">
            <div style={{ display:'grid', gap:'0.875rem' }}>
              <div>
                <label className="label">Street / House No *</label>
                <input className="input-field" placeholder="e.g. 12, Green Valley Apartments" value={form.address.street}
                  onChange={e => setForm(p => ({...p, address:{...p.address, street:e.target.value}}))} />
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                <div>
                  <label className="label">City *</label>
                  <input className="input-field" placeholder="Mumbai" value={form.address.city}
                    onChange={e => setForm(p => ({...p, address:{...p.address, city:e.target.value}}))} />
                </div>
                <div>
                  <label className="label">State *</label>
                  <input className="input-field" placeholder="Maharashtra" value={form.address.state}
                    onChange={e => setForm(p => ({...p, address:{...p.address, state:e.target.value}}))} />
                </div>
              </div>
              <div>
                <label className="label">Pincode *</label>
                <input className="input-field" placeholder="400001" maxLength={6} value={form.address.pincode}
                  onChange={e => setForm(p => ({...p, address:{...p.address, pincode:e.target.value}}))} />
              </div>
            </div>
          </Section>
        )}

        {/* Step 2: Payment */}
        {step === 2 && (
          <Section title="💳 Payment Method">
            <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
              {[
                { value:'cash',   label:'Cash on Delivery', desc:'Pay in cash when the service is done.', emoji:'💵' },
                { value:'online', label:'Online Payment',   desc:'UPI, credit/debit card, net banking.', emoji:'📱' },
              ].map(opt => (
                <div key={opt.value}
                  onClick={() => setForm(p => ({...p, paymentMethod:opt.value}))}
                  style={{
                    padding:'1rem 1.25rem', borderRadius:'0.875rem',
                    border:`1.5px solid ${form.paymentMethod === opt.value ? 'var(--brand-500)' : 'var(--border-subtle)'}`,
                    background: form.paymentMethod === opt.value ? 'rgba(99,102,241,0.08)' : 'var(--bg-surface)',
                    cursor: 'pointer',
                    transition:'all 0.2s', display:'flex', alignItems:'center', gap:12,
                  }}
                >
                  <span style={{ fontSize:'1.5rem' }}>{opt.emoji}</span>
                  <div style={{ flex:1 }}>
                    <p style={{ fontWeight:600, fontSize:'0.9rem', color:'var(--text-primary)' }}>{opt.label}</p>
                    <p style={{ fontSize:'0.78rem', color:'var(--text-muted)' }}>{opt.desc}</p>
                  </div>
                  {form.paymentMethod === opt.value && (
                    <CheckCircle size={18} color="var(--brand-500)" />
                  )}
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Step 3: Confirm */}
        {step === 3 && (
          <Section title="✅ Booking Summary">
            <div style={{ background:'var(--bg-surface)', borderRadius:'0.875rem', padding:'1.25rem', marginBottom:'1rem' }}>
              {[
                { label:'Service',   value: service.title },
                { label:'Provider',  value: service.provider?.name },
                { label:'Date',      value: new Date(form.scheduledDate).toLocaleDateString('en-IN', { weekday:'long', day:'numeric', month:'long', year:'numeric' }) },
                { label:'Time',      value: form.scheduledTime },
                { label:'Address',   value: `${form.address.street}, ${form.address.city}, ${form.address.state} - ${form.address.pincode}` },
                { label:'Payment',   value: form.paymentMethod === 'cash' ? '💵 Cash on Delivery' : '📱 Online' },
              ].map(({ label, value }) => (
                <div key={label} style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', padding:'0.5rem 0', borderBottom:'1px solid var(--border-subtle)', gap:12 }}>
                  <span style={{ fontSize:'0.82rem', color:'var(--text-muted)', flexShrink:0 }}>{label}</span>
                  <span style={{ fontSize:'0.85rem', fontWeight:500, color:'var(--text-primary)', textAlign:'right' }}>{value}</span>
                </div>
              ))}
              {form.isUrgent && (
                <div style={{ display:'flex', alignItems:'center', gap:6, padding:'0.5rem 0 0', color:'#f59e0b', fontSize:'0.82rem', fontWeight:600 }}>
                  <AlertTriangle size={13} /> Marked as Urgent
                </div>
              )}
            </div>

            {/* Price breakdown */}
            <div style={{ background:'rgba(99,102,241,0.06)', border:'1px solid rgba(99,102,241,0.15)', borderRadius:'0.875rem', padding:'1.25rem' }}>
              {[
                { label:'Service price', value:`₹${service.price?.toLocaleString('en-IN')}` },
                { label:'Platform fee',  value:'₹0', muted:true, small:'Waived off 🎉' },
              ].map(r => (
                <div key={r.label} style={{ display:'flex', justifyContent:'space-between', padding:'0.375rem 0', fontSize:'0.85rem' }}>
                  <span style={{ color:'var(--text-secondary)' }}>{r.label} {r.small && <span style={{ fontSize:'0.72rem', color:'var(--accent-emerald)' }}>{r.small}</span>}</span>
                  <span style={{ fontWeight:600, color: r.muted ? 'var(--text-muted)' : 'var(--text-primary)', textDecoration: r.muted ? 'line-through' : 'none' }}>{r.value}</span>
                </div>
              ))}
              <div style={{ display:'flex', justifyContent:'space-between', paddingTop:'0.75rem', marginTop:'0.375rem', borderTop:'1px solid rgba(99,102,241,0.2)' }}>
                <span style={{ fontWeight:700, color:'var(--text-primary)' }}>Total to pay</span>
                <span style={{ fontWeight:900, fontSize:'1.2rem', color:'var(--brand-400)' }}>₹{service.price?.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </Section>
        )}

        {/* Navigation Buttons */}
        <div style={{ display:'flex', gap:12, marginTop:'1.75rem' }}>
          {step > 0 && (
            <button onClick={() => setStep(step-1)} className="btn btn-ghost" style={{ flex:1 }}>
              <ArrowLeft size={16} /> Back
            </button>
          )}
          {step < STEPS.length-1 ? (
            <button
              onClick={() => isStepValid[step]() && setStep(step+1)}
              disabled={!isStepValid[step]()}
              className="btn btn-primary"
              style={{ flex:1, opacity: isStepValid[step]() ? 1 : 0.5, cursor: isStepValid[step]() ? 'pointer' : 'not-allowed' }}
            >
              Continue <ArrowRight size={16} />
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={isLoading} className="btn btn-primary" style={{ flex:1 }}>
              {isLoading ? '⏳ Processing...' : '🎉 Confirm Booking'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingWizard;
