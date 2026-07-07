import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { KeyRound, Mail, AlertCircle, Eye, EyeOff } from 'lucide-react';

export const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Take redirect path or send to default home/dashboard
  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const loggedUser = await login(email, password);
      
      // Role-based routing redirection
      if (loggedUser.role === 'vendor') {
        navigate('/vendor-dashboard');
      } else if (loggedUser.role === 'admin') {
        navigate('/admin-dashboard');
      } else {
        navigate(from === '/' ? '/catalog' : from);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const fillCredentials = (role: 'customer' | 'vendor' | 'admin') => {
    if (role === 'customer') {
      setEmail('customer@rentease.com');
    } else if (role === 'vendor') {
      setEmail('vendor@rentease.com');
    } else if (role === 'admin') {
      setEmail('admin@rentease.com');
    }
    setPassword('password123');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6 py-12 bg-background">
      <div className="bg-surface p-8 md:p-10 rounded-3xl border border-outline-variant/35 shadow-sm max-w-md w-full space-y-6">
        <div className="text-center space-y-2">
          <h2 className="font-serif text-3xl text-on-surface">Welcome Back</h2>
          <p className="text-sm text-on-surface-variant">Sign in to manage your rentals, inventory, or orders.</p>
        </div>

        {error && (
          <div className="p-4 bg-error-container/40 border border-error-container text-error rounded-xl flex items-start gap-2 text-sm">
            <AlertCircle size={18} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Email Address</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-outline">
                <Mail size={18} />
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-surface-container-low border border-outline-variant/50 focus:border-primary rounded-lg text-sm text-on-surface focus:outline-none transition-colors"
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Password</label>
            </div>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-outline">
                <KeyRound size={18} />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-3 bg-surface-container-low border border-outline-variant/50 focus:border-primary rounded-lg text-sm text-on-surface focus:outline-none transition-colors"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-outline hover:text-primary transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-primary hover:bg-primary-container text-on-primary hover:text-on-primary-container font-semibold rounded-lg text-sm shadow-sm transition-all flex items-center justify-center gap-2"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div className="relative flex py-2 items-center">
          <div className="flex-grow border-t border-outline-variant/30"></div>
          <span className="flex-shrink mx-4 text-xs text-on-surface-variant font-medium uppercase tracking-widest">Demo Presets</span>
          <div className="flex-grow border-t border-outline-variant/30"></div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => fillCredentials('customer')}
            className="py-2 bg-surface-container border border-outline-variant/45 rounded-lg text-[10px] uppercase font-bold tracking-wider hover:bg-primary/5 hover:border-primary hover:text-primary transition-colors"
          >
            Customer
          </button>
          <button
            onClick={() => fillCredentials('vendor')}
            className="py-2 bg-surface-container border border-outline-variant/45 rounded-lg text-[10px] uppercase font-bold tracking-wider hover:bg-primary/5 hover:border-primary hover:text-primary transition-colors"
          >
            Vendor
          </button>
          <button
            onClick={() => fillCredentials('admin')}
            className="py-2 bg-surface-container border border-outline-variant/45 rounded-lg text-[10px] uppercase font-bold tracking-wider hover:bg-primary/5 hover:border-primary hover:text-primary transition-colors"
          >
            Admin
          </button>
        </div>

        <p className="text-center text-sm text-on-surface-variant pt-2">
          New to RentEase?{' '}
          <Link to="/register" className="text-primary hover:underline font-semibold transition-all">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
};
