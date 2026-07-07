import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Mail, KeyRound, Phone, MapPin, Store, AlertCircle } from 'lucide-react';

export const Register: React.FC = () => {
  const { registerUser } = useAuth();
  const navigate = useNavigate();

  const [role, setRole] = useState<'customer' | 'vendor'>('customer');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [serviceAreasInput, setServiceAreasInput] = useState('');
  const [referredBy, setReferredBy] = useState('');
  
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password || !phone || !address) {
      setError('Please fill in all core fields.');
      return;
    }

    if (role === 'vendor' && !businessName) {
      setError('Please provide your business name.');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const serviceAreas = serviceAreasInput
        ? serviceAreasInput.split(',').map(s => s.trim()).filter(s => s.length > 0)
        : [];

      const payload = {
        name,
        email,
        password,
        role,
        phone,
        address,
        businessName: role === 'vendor' ? businessName : undefined,
        serviceAreas: role === 'vendor' ? serviceAreas : undefined,
        referredBy: role === 'customer' && referredBy ? referredBy.trim() : undefined
      };

      const loggedUser = await registerUser(payload);
      
      if (loggedUser.role === 'vendor') {
        navigate('/vendor-dashboard');
      } else {
        navigate('/catalog');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Registration failed. Try using a different email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-6 py-12 bg-background">
      <div className="bg-surface p-8 md:p-10 rounded-3xl border border-outline-variant/35 shadow-sm max-w-lg w-full space-y-6">
        <div className="text-center space-y-2">
          <h2 className="font-serif text-3xl text-on-surface">Create an Account</h2>
          <p className="text-sm text-on-surface-variant">Join RentEase to start renting or listing products.</p>
        </div>

        {/* Role Toggle Selector */}
        <div className="grid grid-cols-2 p-1 bg-surface-container rounded-xl border border-outline-variant/20">
          <button
            type="button"
            onClick={() => setRole('customer')}
            className={`py-2 text-xs font-semibold uppercase tracking-wider rounded-lg transition-all ${
              role === 'customer'
                ? 'bg-surface text-primary shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Customer Account
          </button>
          <button
            type="button"
            onClick={() => setRole('vendor')}
            className={`py-2 text-xs font-semibold uppercase tracking-wider rounded-lg transition-all ${
              role === 'vendor'
                ? 'bg-surface text-primary shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Vendor Partner
          </button>
        </div>

        {error && (
          <div className="p-4 bg-error-container/40 border border-error-container text-error rounded-xl flex items-start gap-2 text-sm">
            <AlertCircle size={18} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Full Name</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-outline">
                  <User size={18} />
                </span>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-surface-container-low border border-outline-variant/50 focus:border-primary rounded-lg text-sm text-on-surface focus:outline-none transition-colors"
                  placeholder="Jane Doe"
                />
              </div>
            </div>

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
                  placeholder="name@example.com"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-outline">
                  <KeyRound size={18} />
                </span>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-surface-container-low border border-outline-variant/50 focus:border-primary rounded-lg text-sm text-on-surface focus:outline-none transition-colors"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Phone Number</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-outline">
                  <Phone size={18} />
                </span>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-surface-container-low border border-outline-variant/50 focus:border-primary rounded-lg text-sm text-on-surface focus:outline-none transition-colors"
                  placeholder="(555) 000-0000"
                />
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Address</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-outline">
                <MapPin size={18} />
              </span>
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-surface-container-low border border-outline-variant/50 focus:border-primary rounded-lg text-sm text-on-surface focus:outline-none transition-colors"
                placeholder="Street address, City, State, ZIP"
              />
            </div>
          </div>

          {/* Conditional Vendor Fields */}
          {role === 'vendor' && (
            <div className="p-4 bg-primary/5 rounded-xl border border-primary/10 space-y-4 transition-all">
              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-wider text-primary">Business/Store Name</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-primary/60">
                    <Store size={18} />
                  </span>
                  <input
                    type="text"
                    required={role === 'vendor'}
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-surface border border-outline-variant/50 focus:border-primary rounded-lg text-sm text-on-surface focus:outline-none transition-colors"
                    placeholder="e.g. Modern Furnishing Hub"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-wider text-primary">Service Cities (comma-separated)</label>
                <input
                  type="text"
                  value={serviceAreasInput}
                  onChange={(e) => setServiceAreasInput(e.target.value)}
                  className="w-full px-4 py-3 bg-surface border border-outline-variant/50 focus:border-primary rounded-lg text-sm text-on-surface focus:outline-none transition-colors"
                  placeholder="e.g. New York, Chicago, San Francisco"
                />
              </div>
            </div>
          )}

          {/* Conditional Referral Code Field for Customers */}
          {role === 'customer' && (
            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Referral Code (Optional)</label>
              <input
                type="text"
                value={referredBy}
                onChange={(e) => setReferredBy(e.target.value)}
                className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/50 focus:border-primary rounded-lg text-sm text-on-surface focus:outline-none transition-colors"
                placeholder="e.g. EASE-ABC123"
              />
              <p className="text-[10px] text-primary leading-none font-semibold">Sign up with a friend's code to get $15 EaseCredits immediately!</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-primary hover:bg-primary-container text-on-primary hover:text-on-primary-container font-semibold rounded-lg text-sm shadow-sm transition-all flex items-center justify-center gap-2"
          >
            {loading ? 'Registering...' : 'Register Account'}
          </button>
        </form>

        <p className="text-center text-sm text-on-surface-variant">
          Already have an account?{' '}
          <Link to="/login" className="text-primary hover:underline font-semibold transition-all">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};
