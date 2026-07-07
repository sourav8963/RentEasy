import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Calendar, RefreshCw, Truck, Wrench, Info, Check, CornerDownRight } from 'lucide-react';

interface Rental {
  _id: string;
  id?: string;
  rentalPlan: number;
  rentPerMonth: number;
  securityDeposit: number;
  quantity: number;
  deliveryDate: string;
  returnDate: string;
  deliveryAddress: string;
  status: 'Pending' | 'Confirmed' | 'Delivered' | 'Active' | 'Pickup Scheduled' | 'Completed' | 'Cancelled';
  ownedOutright?: boolean;
  relocationRequested?: boolean;
  relocationAddress?: string;
  flexSwapRequested?: boolean;
  productId: {
    _id: string;
    productName: string;
    images: string[];
    subCategory: string;
    category?: string;
  };
}

export const MyRentals: React.FC = () => {
  const { user, api } = useAuth();
  const navigate = useNavigate();

  const [rentals, setRentals] = useState<Rental[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Extension states
  const [extendingId, setExtendingId] = useState<string | null>(null);
  const [extMonths, setExtMonths] = useState<number>(3);
  const [extSuccess, setExtSuccess] = useState<string | null>(null);

  // Advanced RentEase states
  const [relocatingId, setRelocatingId] = useState<string | null>(null);
  const [relocationAddress, setRelocationAddress] = useState('');
  const [swappingId, setSwappingId] = useState<string | null>(null);
  const [targetProductId, setTargetProductId] = useState('');
  const [buyoutResult, setBuyoutResult] = useState<any | null>(null);

  useEffect(() => {
    const fetchRentals = async () => {
      setLoading(true);
      try {
        const res = await api.get('/rentals/my-rentals');
        setRentals(res.data);
        
        // Fetch products for FlexSwap exchanges
        const prodRes = await api.get('/products');
        setProducts(prodRes.data);
      } catch (err) {
        console.error(err);
        setError('Failed to fetch rentals history.');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchRentals();
    }
  }, [user]);

  const handleExtendSubmit = async (rentalId: string) => {
    try {
      const res = await api.put(`/rentals/${rentalId}/extend`, { months: extMonths });
      
      // Update local state
      setRentals((prev) =>
        prev.map((r) => (r._id === rentalId || r.id === rentalId ? { ...r, rentalPlan: res.data.rentalPlan, returnDate: res.data.returnDate } : r))
      );

      setExtSuccess(rentalId);
      setExtendingId(null);
      setTimeout(() => setExtSuccess(null), 3000);
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to extend lease.');
    }
  };

  const handleScheduleReturn = async (rentalId: string) => {
    if (!window.confirm('Are you sure you want to schedule a return/pickup for this item?')) return;
    try {
      const res = await api.put(`/rentals/${rentalId}/status`, { status: 'Pickup Scheduled' });
      setRentals((prev) =>
        prev.map((r) => (r._id === rentalId || r.id === rentalId ? { ...r, status: res.data.status } : r))
      );
    } catch (err) {
      console.error(err);
      alert('Failed to schedule return.');
    }
  };

  const handleCancelRental = async (rentalId: string) => {
    if (!window.confirm('Are you sure you want to cancel this rental contract?')) return;
    try {
      const res = await api.put(`/rentals/${rentalId}/status`, { status: 'Cancelled' });
      setRentals((prev) =>
        prev.map((r) => (r._id === rentalId || r.id === rentalId ? { ...r, status: res.data.status } : r))
      );
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to cancel contract.');
    }
  };

  const handleBuyout = async (rentalId: string) => {
    if (!window.confirm('Are you sure you want to buyout this item permanently under EaseOwn?')) return;
    try {
      const res = await api.post(`/rentals/${rentalId}/buyout`);
      setBuyoutResult(res.data);
      // Update local rental state status to Completed
      setRentals((prev) =>
        prev.map((r) => (r._id === rentalId || r.id === rentalId ? { ...r, status: 'Completed', ownedOutright: true } : r))
      );
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to complete EaseOwn buyout.');
    }
  };

  const handleRelocation = async (rentalId: string) => {
    if (!relocationAddress) {
      alert('Please enter a new shipping address.');
      return;
    }
    try {
      await api.post(`/rentals/${rentalId}/relocate`, { address: relocationAddress });
      alert('ShiftEase Relocation requested successfully! Our logistics team will contact you.');
      setRelocatingId(null);
      setRelocationAddress('');
      setRentals((prev) =>
        prev.map((r) => (r._id === rentalId || r.id === rentalId ? { ...r, relocationRequested: true, relocationAddress } : r))
      );
    } catch (err) {
      console.error(err);
      alert('Failed to request relocation.');
    }
  };

  const handleFlexSwap = async (rentalId: string) => {
    if (!targetProductId) {
      alert('Please select a target product to swap with.');
      return;
    }
    try {
      await api.post(`/rentals/${rentalId}/swap`, { targetProductId });
      alert('FlexSwap exchange requested! Our partners will arrange pickup and swap delivery.');
      setSwappingId(null);
      setTargetProductId('');
      setRentals((prev) =>
        prev.map((r) => (r._id === rentalId || r.id === rentalId ? { ...r, flexSwapRequested: true, flexSwapProductId: targetProductId } : r))
      );
    } catch (err) {
      console.error(err);
      alert('Failed to request FlexSwap.');
    }
  };

  const getStatusStyle = (status: Rental['status']) => {
    switch (status) {
      case 'Pending':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Confirmed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Delivered':
      case 'Active':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Pickup Scheduled':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Completed':
        return 'bg-zinc-100 text-zinc-800 border-zinc-200';
      case 'Cancelled':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      default:
        return 'bg-zinc-100 text-zinc-800 border-zinc-200';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center space-y-3">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm text-on-surface-variant">Loading rental history...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center p-6 space-y-4">
        <Info size={36} className="text-error" />
        <h3 className="font-serif text-2xl text-on-surface">Error loading rentals</h3>
        <p className="text-sm text-on-surface-variant max-w-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-6 md:px-12 max-w-container-max mx-auto space-y-8 bg-background">
      <div className="space-y-3 text-center md:text-left">
        <h1 className="font-serif text-3xl md:text-4xl text-on-surface">My Active & Past Rentals</h1>
        <p className="text-on-surface-variant text-sm max-w-md">
          Track shipping delivery progress, extend tenures, or log maintenance requests.
        </p>
      </div>

      {rentals.length === 0 ? (
        <div className="bg-surface rounded-3xl border border-outline-variant/30 flex flex-col items-center justify-center text-center p-8 space-y-4 min-h-[45vh]">
          <span className="text-5xl">🛋️</span>
          <h3 className="font-serif text-2xl text-on-surface">No Rentals Found</h3>
          <p className="text-sm text-on-surface-variant max-w-sm">
            You don't have any active rental leases. Start shopping our catalog.
          </p>
          <Link
            to="/catalog"
            className="px-6 py-2.5 bg-primary text-on-primary hover:bg-primary-container hover:text-on-primary-container rounded-lg text-sm font-semibold tracking-wide shadow-sm"
          >
            Start Renting
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {rentals.map((rental) => {
            const rId = rental._id || rental.id;
            const isExtendable = rental.status === 'Active' || rental.status === 'Delivered';
            const isReturnable = rental.status === 'Active' || rental.status === 'Delivered';

            return (
              <div
                key={rId}
                className="bg-surface rounded-2xl border border-outline-variant/35 shadow-sm p-6 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6"
              >
                {/* Product Detail Banner */}
                <div className="flex gap-4 items-start">
                  <img
                    src={rental.productId?.images?.[0] || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=600&q=80'}
                    alt={rental.productId?.productName}
                    className="w-20 h-20 rounded-xl object-cover border border-outline-variant/35 bg-surface-container-low shrink-0"
                  />
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-serif text-lg text-on-surface font-semibold">
                        {rental.productId?.productName || 'Deleted Product'}
                      </h3>
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 border rounded-full ${getStatusStyle(rental.status)}`}>
                        {rental.status}
                      </span>
                    </div>
                    <p className="text-xs text-on-surface-variant">Qty: {rental.quantity} unit(s) • Sub-Category: {rental.productId?.subCategory}</p>
                    <p className="text-sm font-serif text-primary font-bold">
                      ${rental.rentPerMonth} <span className="text-[10px] font-sans font-normal text-on-surface-variant">/mo</span>
                    </p>
                  </div>
                </div>

                {/* Contract / Tenure Details */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 bg-surface-container-low/40 p-4 rounded-xl border border-outline-variant/20 lg:w-96 text-xs">
                  <div>
                    <p className="text-on-surface-variant font-medium uppercase tracking-wider mb-1 text-[10px]">Tenure</p>
                    <p className="font-bold text-on-surface">{rental.rentalPlan} Months</p>
                  </div>
                  <div>
                    <p className="text-on-surface-variant font-medium uppercase tracking-wider mb-1 text-[10px]">Delivery</p>
                    <p className="font-semibold text-on-surface">
                      {new Date(rental.deliveryDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <p className="text-on-surface-variant font-medium uppercase tracking-wider mb-1 text-[10px]">Return Date</p>
                    <p className="font-semibold text-on-surface">
                      {new Date(rental.returnDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Operations / Dashboard Actions */}
                <div className="flex flex-col sm:flex-row gap-2 shrink-0 w-full lg:w-auto">
                  {rental.ownedOutright ? (
                    <div className="py-2 px-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-lg flex items-center justify-center gap-1">
                      <Check size={14} /> Owned Outright (EaseOwn)
                    </div>
                  ) : extendingId === rId ? (
                    // Inline extension controls
                    <div className="flex items-center gap-2 border border-primary/20 bg-primary/5 p-2 rounded-xl w-full">
                      <select
                        value={extMonths}
                        onChange={(e) => setExtMonths(Number(e.target.value))}
                        className="bg-surface py-2 px-2.5 rounded-lg text-xs border border-outline-variant focus:outline-none focus:border-primary text-on-surface"
                      >
                        <option value={3}>+ 3 Months</option>
                        <option value={6}>+ 6 Months</option>
                        <option value={12}>+ 12 Months</option>
                      </select>
                      <button
                        onClick={() => handleExtendSubmit(rId!)}
                        className="bg-primary text-on-primary py-2 px-3 rounded-lg text-xs font-bold hover:bg-primary-container hover:text-on-primary-container shrink-0 transition-colors"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => setExtendingId(null)}
                        className="text-on-surface-variant hover:text-on-surface text-xs font-bold px-2 py-2"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : relocatingId === rId ? (
                    // Inline Relocation Address Form
                    <div className="flex flex-col gap-2 border border-primary/20 bg-primary/5 p-3 rounded-xl w-full text-left">
                      <p className="text-[10px] font-bold text-primary uppercase tracking-wider">New Shifting Address</p>
                      <input
                        type="text"
                        required
                        value={relocationAddress}
                        onChange={(e) => setRelocationAddress(e.target.value)}
                        placeholder="Enter shipping address"
                        className="bg-surface py-2 px-3 rounded-lg text-xs border border-outline-variant focus:outline-none focus:border-primary text-on-surface font-semibold"
                      />
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleRelocation(rId!)}
                          className="bg-primary text-on-primary py-1.5 px-3 rounded-lg text-xs font-bold hover:bg-primary-container hover:text-on-primary-container transition-colors"
                        >
                          Submit Shifting
                        </button>
                        <button
                          type="button"
                          onClick={() => { setRelocatingId(null); setRelocationAddress(''); }}
                          className="text-on-surface-variant hover:text-on-surface text-xs font-bold px-2 py-1"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : swappingId === rId ? (
                    // Inline FlexSwap dropdown product exchange
                    <div className="flex flex-col gap-2 border border-primary/20 bg-primary/5 p-3 rounded-xl w-full text-left">
                      <p className="text-[10px] font-bold text-primary uppercase tracking-wider">FlexSwap Product Exchange</p>
                      <select
                        value={targetProductId}
                        onChange={(e) => setTargetProductId(e.target.value)}
                        className="bg-surface py-2 px-2.5 rounded-lg text-xs border border-outline-variant focus:outline-none focus:border-primary text-on-surface font-semibold"
                      >
                        <option value="">-- Choose Exchange Product --</option>
                        {products
                          .filter(p => p._id !== rental.productId?._id)
                          .map(p => (
                            <option key={p._id || p.id} value={p._id || p.id}>
                              {p.productName} (${p.rentPerMonth}/mo)
                            </option>
                          ))}
                      </select>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleFlexSwap(rId!)}
                          className="bg-primary text-on-primary py-1.5 px-3 rounded-lg text-xs font-bold hover:bg-primary-container hover:text-on-primary-container transition-colors"
                        >
                          Request Swap
                        </button>
                        <button
                          type="button"
                          onClick={() => { setSwappingId(null); setTargetProductId(''); }}
                          className="text-on-surface-variant hover:text-on-surface text-xs font-bold px-2 py-1"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    // Normal actions list
                    <div className="flex flex-wrap gap-2 justify-end">
                      {isExtendable && (
                        <>
                          <button
                            onClick={() => setExtendingId(rId!)}
                            className="py-2 px-3 border border-primary text-primary hover:bg-primary/5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
                          >
                            <RefreshCw size={12} /> Extend
                          </button>

                          <button
                            onClick={() => setSwappingId(rId!)}
                            className="py-2 px-3 border border-outline hover:bg-surface-container-low text-secondary rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
                          >
                            Swap / Upgrade
                          </button>

                          <button
                            onClick={() => setRelocatingId(rId!)}
                            className="py-2 px-3 border border-outline hover:bg-surface-container-low text-secondary rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
                          >
                            Relocate
                          </button>

                          <button
                            onClick={() => handleBuyout(rId!)}
                            className="py-2 px-3 border border-primary bg-primary/5 text-primary hover:bg-primary/10 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-colors"
                          >
                            EaseOwn Buyout
                          </button>
                        </>
                      )}
                      
                      {isReturnable && (
                        <button
                          onClick={() => handleScheduleReturn(rId!)}
                          className="py-2 px-3 border border-outline-variant hover:bg-surface-container-low text-secondary rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
                        >
                          <Truck size={12} /> Schedule Return
                        </button>
                      )}

                      {(rental.status === 'Pending' || rental.status === 'Confirmed') && (
                        <button
                          onClick={() => handleCancelRental(rId!)}
                          className="py-2 px-3 border border-error text-error hover:bg-error/5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
                        >
                          Cancel Rental
                        </button>
                      )}

                      {(rental.status === 'Active' || rental.status === 'Delivered') && (
                        <Link
                          to="/maintenance"
                          state={{ rentalId: rId, productName: rental.productId?.productName }}
                          className="py-2 px-3 bg-primary text-on-primary hover:bg-primary-container hover:text-on-primary-container rounded-lg text-xs font-semibold flex items-center justify-center gap-1 shadow-sm transition-colors"
                        >
                          <Wrench size={12} /> Raise Repair
                        </Link>
                      )}
                    </div>
                  )}

                  {extSuccess === rId && (
                    <div className="p-2 bg-primary/10 border border-primary/20 text-primary text-xs rounded-xl flex items-center justify-center gap-1 font-semibold">
                      <Check size={14} /> Lease successfully extended!
                    </div>
                  )}

                  {buyoutResult?.rental?._id === rId && (
                    <div className="p-2 bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex flex-col items-center justify-center gap-1 font-semibold">
                      <p className="flex items-center gap-1"><Check size={14} /> Buyout confirmed! Cost: ${buyoutResult.buyoutCost}</p>
                    </div>
                  )}

                  {rental.relocationRequested && (
                    <div className="p-2 bg-blue-50 border border-blue-200 text-blue-800 text-[10px] rounded-lg text-left leading-relaxed font-semibold">
                      🚚 Shifting relocation requested to: <br /><span className="text-[9px] text-on-surface-variant font-normal">{rental.relocationAddress}</span>
                    </div>
                  )}

                  {rental.flexSwapRequested && (
                    <div className="p-2 bg-blue-50 border border-blue-200 text-blue-800 text-[10px] rounded-lg text-left leading-relaxed font-semibold">
                      🔄 FlexSwap replacement requested!
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
