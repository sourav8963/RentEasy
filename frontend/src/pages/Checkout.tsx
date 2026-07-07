import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Trash2, Calendar, MapPin, Clock, ShoppingBag, CheckCircle, Info } from 'lucide-react';

export const Checkout: React.FC = () => {
  const { cart, updateQuantity, removeFromCart, updatePlan, totalMonthlyRent, totalSecurityDeposit, clearCart } = useCart();
  const { user, api } = useAuth();
  const navigate = useNavigate();

  // Form states
  const [address, setAddress] = useState(user?.address || '');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [timeSlot, setTimeSlot] = useState('09:00 AM - 12:00 PM');
  
  const [isSuccess, setIsSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Advanced RentEase options
  const [rentShield, setRentShield] = useState(false);
  const [applyCredits, setApplyCredits] = useState(false);

  const rentShieldCost = rentShield ? cart.reduce((sum, item) => sum + (5 * item.quantity), 0) : 0;
  const availableCredits = user?.easeCredits || 0;
  const creditsDiscount = applyCredits ? Math.min(availableCredits, totalMonthlyRent + rentShieldCost) : 0;

  const grandTotalNow = (totalMonthlyRent + rentShieldCost - creditsDiscount) + totalSecurityDeposit;

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      // Redirect to login, passing current checkout route as redirect state
      navigate('/login', { state: { from: { pathname: '/checkout' } } });
      return;
    }

    if (!address || !deliveryDate) {
      setError('Please fill in your delivery address and preferred date.');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const items = cart.map(item => ({
        productId: item.productId,
        rentalPlan: item.rentalPlan,
        rentPerMonth: item.rentPerMonth,
        securityDeposit: item.securityDeposit,
        quantity: item.quantity
      }));

      await api.post('/rentals/checkout', {
        items,
        deliveryAddress: address,
        deliveryDate,
        deliveryTimeSlot: timeSlot,
        rentShieldActive: rentShield,
        usedEaseCredits: creditsDiscount
      });

      // Deduct spent credits locally
      if (user && creditsDiscount > 0) {
        user.easeCredits = Math.max(0, (user.easeCredits || 0) - creditsDiscount);
      }

      // Clear local cart and show confirmation screen
      clearCart();
      setIsSuccess(true);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Checkout failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center px-6 py-12 bg-background">
        <div className="bg-surface p-8 md:p-10 rounded-3xl border border-outline-variant/35 shadow-sm max-w-md w-full text-center space-y-6">
          <div className="flex justify-center text-primary">
            <CheckCircle size={64} className="stroke-[1.5]" />
          </div>
          <div className="space-y-2">
            <h2 className="font-serif text-3xl text-on-surface">Order Confirmed!</h2>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              Your rental contract is successfully active. Our delivery partners will contact you to coordinate assembly.
            </p>
          </div>
          <div className="p-4 bg-surface-container-low rounded-2xl border border-outline-variant/20 text-left space-y-2">
            <p className="text-xs text-on-surface font-semibold uppercase tracking-wider">Estimated Delivery</p>
            <p className="text-sm text-primary font-bold">{deliveryDate} at {timeSlot}</p>
            <p className="text-xs text-on-surface-variant">Address: {address}</p>
          </div>
          <div className="grid grid-cols-2 gap-3 pt-2">
            <Link
              to="/my-rentals"
              className="py-3 px-4 bg-primary text-on-primary hover:bg-primary-container hover:text-on-primary-container font-semibold rounded-lg text-sm text-center shadow-sm transition-all"
            >
              Track Rentals
            </Link>
            <Link
              to="/catalog"
              className="py-3 px-4 border border-outline-variant hover:bg-surface-container-low text-secondary font-semibold rounded-lg text-sm text-center transition-all"
            >
              Shop More
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6 space-y-4 bg-background">
        <span className="text-6xl">🛒</span>
        <h2 className="font-serif text-3xl text-on-surface">Your Cart is Empty</h2>
        <p className="text-sm text-on-surface-variant max-w-sm">
          You haven't added any furniture or appliances to your rental cart yet.
        </p>
        <Link
          to="/catalog"
          className="px-8 py-3.5 bg-primary text-on-primary hover:bg-primary-container hover:text-on-primary-container rounded-lg font-semibold tracking-wide shadow-sm transition-all"
        >
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-6 md:px-12 max-w-container-max mx-auto space-y-8 bg-background">
      <h1 className="font-serif text-3xl md:text-4xl text-on-surface">Your Rental Cart & Checkout</h1>

      {error && (
        <div className="p-4 bg-error-container/40 border border-error-container text-error rounded-xl flex items-start gap-2 text-sm max-w-4xl">
          <Info size={18} className="shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Cart Items List */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-surface rounded-2xl border border-outline-variant/35 shadow-sm p-6 space-y-6">
            <h3 className="font-serif text-xl text-on-surface font-semibold border-b border-outline-variant/20 pb-3">
              Review Selected Items ({cart.length})
            </h3>

            <div className="divide-y divide-outline-variant/20">
              {cart.map((item, idx) => (
                <div key={`${item.productId}-${item.rentalPlan}`} className="py-6 first:pt-0 last:pb-0 flex flex-col sm:flex-row gap-6 justify-between items-stretch">
                  <div className="flex gap-4 items-start">
                    <img
                      src={item.images[0]}
                      alt={item.productName}
                      className="w-20 h-20 rounded-xl object-cover border border-outline-variant/30 bg-surface-container-low shrink-0"
                    />
                    <div className="space-y-1">
                      <h4 className="font-serif text-md text-on-surface font-semibold line-clamp-1">{item.productName}</h4>
                      <p className="text-xs text-on-surface-variant font-medium">Refundable Deposit: ${item.securityDeposit} / unit</p>
                      
                      {/* Tenure Selector in Cart */}
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">Plan:</span>
                        <select
                          value={item.rentalPlan}
                          onChange={(e) => updatePlan(item.productId, item.rentalPlan, Number(e.target.value))}
                          className="bg-surface-container py-1 px-2 rounded-md text-xs border border-outline-variant/50 focus:outline-none focus:border-primary text-on-surface"
                        >
                          <option value={3}>3 Months</option>
                          <option value={6}>6 Months</option>
                          <option value={12}>12 Months</option>
                          <option value={24}>24 Months</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="flex sm:flex-col justify-between items-end shrink-0 text-right">
                    <button
                      onClick={() => removeFromCart(item.productId, item.rentalPlan)}
                      className="p-1.5 text-outline hover:text-error rounded-lg hover:bg-surface-container-low sm:order-2 transition-colors"
                      title="Remove Item"
                    >
                      <Trash2 size={18} />
                    </button>

                    <div className="space-y-2 sm:order-1">
                      <p className="text-base font-serif text-primary font-bold">${item.rentPerMonth} <span className="text-xs font-sans font-normal text-on-surface-variant">/mo</span></p>
                      
                      {/* Quantity Toggles */}
                      <div className="flex items-center border border-outline-variant/40 rounded-md bg-surface text-xs justify-end max-w-fit ml-auto">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.productId, item.rentalPlan, item.quantity - 1)}
                          className="px-2 py-1 text-secondary font-bold"
                        >
                          -
                        </button>
                        <span className="px-2.5 py-1 font-semibold">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.productId, item.rentalPlan, item.quantity + 1)}
                          className="px-2 py-1 text-secondary font-bold"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Delivery Address & Billing */}
        <div className="lg:col-span-5 space-y-6">
          <form onSubmit={handleCheckoutSubmit} className="bg-surface rounded-2xl border border-outline-variant/35 shadow-sm p-6 space-y-6">
            <h3 className="font-serif text-xl text-on-surface font-semibold border-b border-outline-variant/20 pb-3">
              Delivery Details
            </h3>

            {/* Address Input */}
            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant flex items-center gap-1">
                <MapPin size={14} /> Shipping / Assembly Address
              </label>
              <textarea
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/50 focus:border-primary rounded-lg text-sm text-on-surface focus:outline-none transition-colors"
                placeholder="Enter complete shipping address"
                rows={3}
              />
            </div>

            {/* Date Slot */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant flex items-center gap-1">
                  <Calendar size={14} /> Delivery Date
                </label>
                <input
                  type="date"
                  required
                  min={new Date(Date.now() + 86400000).toISOString().split('T')[0]} // Min is tomorrow
                  value={deliveryDate}
                  onChange={(e) => setDeliveryDate(e.target.value)}
                  className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/50 focus:border-primary rounded-lg text-sm text-on-surface focus:outline-none transition-colors"
                />
              </div>

              {/* Time Slot Selector */}
              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant flex items-center gap-1">
                  <Clock size={14} /> Preferred Slot
                </label>
                <select
                  value={timeSlot}
                  onChange={(e) => setTimeSlot(e.target.value)}
                  className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/50 focus:border-primary rounded-lg text-sm text-on-surface-variant focus:outline-none transition-colors"
                >
                  <option value="09:00 AM - 12:00 PM">Morning (9 AM - 12 PM)</option>
                  <option value="12:00 PM - 03:00 PM">Afternoon (12 PM - 3 PM)</option>
                  <option value="03:00 PM - 06:00 PM">Evening (3 PM - 6 PM)</option>
                </select>
              </div>
            </div>

            {/* RentEase Protection Shield & EaseCredits Options */}
            <div className="border-t border-outline-variant/20 pt-4 space-y-4">
              <h4 className="text-xs font-semibold uppercase tracking-widest text-on-surface-variant mb-2">Checkout Customizations</h4>
              
              {/* RentShield Option */}
              <label className="flex items-start gap-3 p-3 bg-surface-container-low/60 rounded-xl border border-outline-variant/20 cursor-pointer hover:bg-surface-container-low transition-colors">
                <input
                  type="checkbox"
                  checked={rentShield}
                  onChange={(e) => setRentShield(e.target.checked)}
                  className="mt-1 rounded text-primary focus:ring-primary border-outline-variant"
                />
                <div className="space-y-0.5 text-left">
                  <p className="text-xs font-bold text-on-surface flex items-center gap-1">🛡️ Add RentShield Protection</p>
                  <p className="text-[10px] text-on-surface-variant font-normal leading-relaxed">
                    Waiver coverage for accidental damage, spills, and drops. Just <strong>$5/month</strong> per unit.
                  </p>
                </div>
              </label>

              {/* EaseCredits Wallet Option */}
              {availableCredits > 0 && (
                <label className="flex items-start gap-3 p-3 bg-primary/5 rounded-xl border border-primary/10 cursor-pointer hover:bg-primary/10 transition-colors">
                  <input
                    type="checkbox"
                    checked={applyCredits}
                    onChange={(e) => setApplyCredits(e.target.checked)}
                    className="mt-1 rounded text-primary focus:ring-primary border-primary/20"
                  />
                  <div className="space-y-0.5 text-left">
                    <p className="text-xs font-bold text-primary">🎁 Apply EaseCredits Balance</p>
                    <p className="text-[10px] text-on-surface-variant font-normal leading-relaxed">
                      Deduct from your virtual reward wallet. Available balance: <strong>${availableCredits} EaseCredits</strong>.
                    </p>
                  </div>
                </label>
              )}
            </div>

            {/* Billing Summary */}
            <div className="border-t border-outline-variant/20 pt-4 space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-widest text-on-surface-variant">Payment Summary</h4>
              <div className="flex justify-between text-sm">
                <span>Monthly Rent (recurring)</span>
                <span className="font-semibold text-on-surface">${totalMonthlyRent}/mo</span>
              </div>
              {rentShield && (
                <div className="flex justify-between text-xs text-on-surface-variant">
                  <span>RentShield Protection Fee</span>
                  <span className="font-semibold text-on-surface">+ ${rentShieldCost}/mo</span>
                </div>
              )}
              {applyCredits && creditsDiscount > 0 && (
                <div className="flex justify-between text-xs text-primary">
                  <span>EaseCredits Discount Applied</span>
                  <span className="font-semibold">- ${creditsDiscount}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span>Security Deposit (refundable)</span>
                <span className="font-semibold text-on-surface">${totalSecurityDeposit}</span>
              </div>
              <div className="border-t border-outline-variant/20 pt-3 flex justify-between items-center text-base">
                <span className="font-serif text-lg font-semibold text-on-surface">Payable Now</span>
                <span className="font-serif text-2xl text-primary font-bold">${grandTotalNow}</span>
              </div>
              <p className="text-[10px] text-on-surface-variant text-center">
                * upfront payment includes first month's rent + 100% refundable security deposit.
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-primary hover:bg-primary-container text-on-primary hover:text-on-primary-container font-semibold rounded-lg text-sm shadow-sm transition-all flex items-center justify-center gap-2"
            >
              {loading ? 'Processing Checkout...' : user ? `Pay & Rent ($${grandTotalNow})` : 'Log In to Checkout'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
