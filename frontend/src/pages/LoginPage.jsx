import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { login } from '../redux/slices/authSlice';
import { Wrench, Eye, EyeOff, Mail, Lock, ArrowRight } from 'lucide-react';

const LoginPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading } = useSelector(state => state.auth);
  const [showPassword, setShowPassword] = useState(false);
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

  const demoLogins = [
    { label: '👤 Demo User', email: 'user@fixit.com', password: 'user1234' },
    { label: '🧑‍🔧 Demo Provider', email: 'ramesh@fixit.com', password: 'provider123' },
    { label: '🛠️ Demo Admin', email: 'admin@fixit.com', password: 'admin123' },
  ];

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
          <h1 className="text-2xl font-bold text-white mb-1">Welcome back</h1>
          <p className="text-slate-400 text-sm">Sign in to continue to Fixit</p>
        </div>

        <form onSubmit={handleSubmit} className="card p-6 space-y-4 mb-4">
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

        {/* Demo Login Buttons */}
        <div className="card p-4 mb-4">
          <p className="text-xs text-slate-500 text-center mb-3 uppercase tracking-wider">Quick Demo Login</p>
          <div className="flex flex-col gap-2">
            {demoLogins.map(d => (
              <button
                key={d.email}
                type="button"
                onClick={() => {
                  setForm({ email: d.email, password: d.password });
                }}
                className="text-sm text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/5 px-3 py-2 rounded-lg transition-all text-left"
              >
                {d.label} — <span className="text-slate-500">{d.email}</span>
              </button>
            ))}
          </div>
        </div>

        <p className="text-center text-slate-400 text-sm">
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
