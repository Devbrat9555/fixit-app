import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { login } from '../redux/slices/authSlice';
import { Wrench, Eye, EyeOff, Mail, Lock, ArrowRight, User, ShieldCheck } from 'lucide-react';

const LoginPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading } = useSelector(state => state.auth);
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState(1);
  const [selectedRole, setSelectedRole] = useState('');
  const [form, setForm] = useState({ email: '', password: '' });

  const handleChange = e => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    const result = await dispatch(login(form));
    if (!result.error) {
      const role = result.payload.user.role;
      if (role === 'admin') navigate('/admin/dashboard');
      else if (role === 'provider') navigate('/provider/dashboard');
      else navigate('/dashboard');
    }
  };

  const selectRole = (role) => {
    setSelectedRole(role);
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
              <h1 className="text-3xl font-black text-white mb-2">Welcome Back</h1>
              <p className="text-slate-400 text-sm">Sign in to your account</p>
            </>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-white mb-1">
                {selectedRole === 'provider' ? 'Expert Login' : selectedRole === 'admin' ? 'Admin Login' : 'Customer Login'}
              </h1>
              <p className="text-slate-400 text-sm">Enter your credentials to continue</p>
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
                    <h3 className="text-lg font-bold text-white">Customer</h3>
                    <p className="text-xs text-slate-400">Login to book services</p>
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
                    <h3 className="text-lg font-bold text-white">Service Provider</h3>
                    <p className="text-xs text-slate-400">Login to manage jobs</p>
                  </div>
                </div>
                <ArrowRight size={20} className="text-slate-600 group-hover:text-purple-400 transform group-hover:translate-x-1 transition-all" />
              </div>
            </button>

            <button 
              onClick={() => selectRole('admin')}
              className="w-full flex items-center justify-center gap-2 py-4 text-xs font-bold text-slate-500 hover:text-slate-300 transition-colors uppercase tracking-widest"
            >
              <ShieldCheck size={14} /> Login as Admin
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="card p-6 space-y-4">
            <button 
              type="button" 
              onClick={() => setStep(1)}
              className="text-xs font-bold text-indigo-400 hover:text-indigo-300 mb-2"
            >
              ← Back to Role Selection
            </button>

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
              <label className="text-xs text-slate-400 mb-1.5 block font-medium">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="Your password"
                  value={form.password}
                  onChange={handleChange}
                  required
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

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full py-3 text-base justify-center mt-2"
            >
              {isLoading ? 'Signing in...' : (
                <>Sign In <ArrowRight size={18} /></>
              )}
            </button>
          </form>
        )}

        <p className="text-center text-slate-400 text-sm mt-8">
          Don't have an account?{' '}
          <Link to="/register" className="text-indigo-400 hover:text-indigo-300 font-semibold">
            Sign up for free
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
