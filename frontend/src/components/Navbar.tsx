import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { ShoppingCart, User, LogOut, Wrench, FileText, LayoutDashboard, ShoppingBag, Truck } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { cart } = useCart();
  const navigate = useNavigate();

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <nav className="sticky top-0 z-50 bg-surface/95 backdrop-blur-md border-b border-outline-variant/30 py-4 px-6 md:px-12 flex justify-between items-center transition-all">
      <Link to="/" className="flex items-center gap-2">
        <span className="font-serif text-2xl md:text-3xl text-primary font-bold tracking-tight">RentEase</span>
      </Link>

      <div className="hidden md:flex items-center gap-8">
        <Link to="/catalog" className="text-secondary hover:text-primary font-medium tracking-wide text-sm transition-colors">
          Shop Catalog
        </Link>
        {user && user.role === 'customer' && (
          <>
            <Link to="/my-rentals" className="text-secondary hover:text-primary font-medium tracking-wide text-sm transition-colors flex items-center gap-1">
              <ShoppingBag size={16} /> My Rentals
            </Link>
            <Link to="/shiftease" className="text-secondary hover:text-primary font-medium tracking-wide text-sm transition-colors flex items-center gap-1">
              <Truck size={16} /> ShiftEase Movers
            </Link>
            <Link to="/ease-verify" className="text-secondary hover:text-primary font-medium tracking-wide text-sm transition-colors flex items-center gap-1">
              <FileText size={16} /> EaseVerify
            </Link>
            <Link to="/maintenance" className="text-secondary hover:text-primary font-medium tracking-wide text-sm transition-colors flex items-center gap-1">
              <Wrench size={16} /> Maintenance
            </Link>
          </>
        )}
        {user && user.role === 'vendor' && (
          <Link to="/vendor-dashboard" className="text-secondary hover:text-primary font-medium tracking-wide text-sm transition-colors flex items-center gap-1">
            <LayoutDashboard size={16} /> Vendor Dashboard
          </Link>
        )}
        {user && user.role === 'admin' && (
          <Link to="/admin-dashboard" className="text-secondary hover:text-primary font-medium tracking-wide text-sm transition-colors flex items-center gap-1">
            <LayoutDashboard size={16} /> Admin Dashboard
          </Link>
        )}
      </div>

      <div className="flex items-center gap-4 md:gap-6">
        {(!user || user.role === 'customer') && (
          <Link to="/checkout" className="relative p-2 text-secondary hover:text-primary transition-colors">
            <ShoppingCart size={22} />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-primary text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-sm">
                {cartCount}
              </span>
            )}
          </Link>
        )}

        {user ? (
          <div className="flex items-center gap-4 border-l border-outline-variant/40 pl-4 md:pl-6">
            <div className="text-right hidden sm:block text-xs font-semibold">
              <p className="text-[10px] text-on-surface-variant uppercase tracking-wider font-bold">{user.role}</p>
              <p className="text-sm font-bold text-on-surface flex items-center gap-1.5 justify-end">
                {user.name.split(' ')[0]}
                {user.role === 'customer' && (user.easeCredits ?? 0) > 0 && (
                  <span className="text-[9px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-bold border border-primary/25" title="Available EaseCredits">
                    ${user.easeCredits}
                  </span>
                )}
              </p>
            </div>
            <button
              onClick={() => {
                logout();
                navigate('/login');
              }}
              title="Logout"
              className="p-2 text-secondary hover:text-error transition-colors rounded-full hover:bg-surface-container-low"
            >
              <LogOut size={20} />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="px-4 py-2 border border-primary text-primary hover:bg-primary/5 rounded-lg text-sm font-semibold tracking-wide transition-all"
            >
              Log In
            </Link>
            <Link
              to="/register"
              className="hidden sm:inline-block px-4 py-2 bg-primary text-on-primary hover:bg-primary-container hover:text-on-primary-container rounded-lg text-sm font-semibold tracking-wide shadow-sm transition-all"
            >
              Sign Up
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};
