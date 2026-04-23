import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { register } from '../redux/slices/authSlice';
import { Wrench, Eye, EyeOff, User, Mail, Lock, Phone, ArrowRight } from 'lucide-react';

const RegisterPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isLoading } = useSelector(state => state.auth);
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState(searchParams.get('role') ? 2 : 1);

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: searchParams.get('role') || '',
  });

  const handleChange = e => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.role) return;
    const result = await dispatch(register(form));
    if (!result.error) {
      const role = result.payload.user.role;
      if (role === 'admin') navigate('/admin/dashboard');
      else if (role === 'provider') navigate('/provider/dashboard');
      else navigate('/dashboard');
    }
  };

  const selectRole = (role) => {
    setForm(prev => ({ ...prev, role }));
    setStep(2);
  };

  return (
    <div className="min-h-screen flex items-center justify-center pt-16 pb-12 px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <Wrench size={20} className="text-white" />
            </div>
            <span className="text-2xl font-bold gradient-text">Fixit</span>
          </Link>
          
          {step === 1 ? (
            <>
              <h1 className="text-3xl font-black text-white mb-2">Join Fixit</h1>
              <p className="text-slate-400 text-sm">Choose how you want to use the platform</p>
            </>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-white mb-1">
                {form.role === 'provider' ? 'Join as an Expert' : 'Create Customer Account'}
              </h1>
              <p className="text-slate-400 text-sm">Fill in your details to get started</p>
            </>
          )}
        </div>

        {step === 1 ? (
          <div className="space-y-4">
            <button 
              onClick={() => selectRole('user')}
              className="card w-full p-6 text-left hover:border-indigo-500/50 transition-all group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                    <User size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">I'm a Customer</h3>
                    <p className="text-xs text-slate-400">I want to book home services</p>
                  </div>
                </div>
                <ArrowRight size={20} className="text-slate-600 group-hover:text-indigo-400 transform group-hover:translate-x-1 transition-all" />
              </div>
            </button>

            <button 
              onClick={() => selectRole('provider')}
              className="card w-full p-6 text-left hover:border-purple-500/50 transition-all group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400">
                    <Wrench size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">I'm a Service Provider</h3>
                    <p className="text-xs text-slate-400">I want to provide services and earn</p>
                  </div>
                </div>
                <ArrowRight size={20} className="text-slate-600 group-hover:text-purple-400 transform group-hover:translate-x-1 transition-all" />
              </div>
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="card p-6 space-y-4">
            <div className="flex justify-between items-center mb-2">
              <button 
                type="button" 
                onClick={() => setStep(1)}
                className="text-xs font-bold text-indigo-400 hover:text-indigo-300"
              >
                ← Change Role
              </button>
              <span className="text-[10px] font-black uppercase tracking-widest px-2 py-1 bg-slate-800 rounded text-slate-400">
                Registering as {form.role === 'provider' ? 'Expert' : 'Customer'}
              </span>
            </div>

            <div>
              <label className="text-xs text-slate-400 mb-1.5 block font-medium">Full Name</label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  name="name"
                  placeholder="John Doe"
                  value={form.name}
                  onChange={handleChange}
                  required
                  className="input-field pl-9"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-400 mb-1.5 block font-medium">Email Address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={handleChange}
                  required
                  className="input-field pl-9"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-400 mb-1.5 block font-medium">Phone Number</label>
              <div className="relative">
                <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="tel"
                  name="phone"
                  placeholder="9876543210"
                  value={form.phone}
                  onChange={handleChange}
                  required
                  className="input-field pl-9"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-400 mb-1.5 block font-medium">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="Min. 6 characters"
                  value={form.password}
                  onChange={handleChange}
                  required
                  minLength={6}
                  className="input-field pl-9 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {form.role === 'provider' && (
              <div className="glass-light rounded-xl p-4 text-xs text-amber-400/80 border border-amber-500/20 leading-relaxed">
                <strong>Note:</strong> Service Provider accounts require verification and approval by the administrator before becoming visible to customers.
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full py-3 text-base justify-center mt-2"
            >
              {isLoading ? 'Creating account...' : (
                <>Create Account <ArrowRight size={18} /></>
              )}
            </button>
          </form>
        )}

        <p className="text-center text-slate-400 text-sm mt-4">
          Already have an account?{' '}
          <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-semibold">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
