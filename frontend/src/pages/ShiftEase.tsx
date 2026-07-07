import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Truck, Navigation, Calendar, PackageOpen, CheckCircle, Calculator, Info } from 'lucide-react';

export const ShiftEase: React.FC = () => {
  const { user, api } = useAuth();
  
  const [sourceAddress, setSourceAddress] = useState('');
  const [destAddress, setDestAddress] = useState('');
  const [moveDate, setMoveDate] = useState('');
  const [cargoSize, setCargoSize] = useState('Studio');
  const [itemsListStr, setItemsListStr] = useState('');
  const [loading, setLoading] = useState(false);
  const [bookingResult, setBookingResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  const getEstimatedFee = (size: string) => {
    switch (size) {
      case '1 BHK': return 200;
      case '2 BHK': return 320;
      case '3+ BHK': return 480;
      default: return 120;
    }
  };

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sourceAddress || !destAddress || !moveDate || !cargoSize) {
      setError('Please fill in all required shifting details.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const itemsList = itemsListStr.split('\n').map(i => i.trim()).filter(Boolean);
      
      const res = await api.post('/shiftease/mover', {
        sourceAddress,
        destAddress,
        date: moveDate,
        cargoSize,
        itemsList
      });

      setBookingResult(res.data.booking);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to book shifting.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center space-y-4">
        <Truck size={48} className="text-primary animate-bounce" />
        <h2 className="font-serif text-2xl text-on-surface">Sign In Required</h2>
        <p className="text-sm text-on-surface-variant max-w-sm">Please log in to book packers and movers services.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-6 md:px-12 max-w-container-max mx-auto space-y-8 bg-background">
      <div className="space-y-3 text-center md:text-left">
        <h1 className="font-serif text-3xl md:text-4xl text-on-surface flex items-center justify-center md:justify-start gap-2">
          <Truck className="text-primary" /> ShiftEase Logistics & Shifting
        </h1>
        <p className="text-sm text-on-surface-variant max-w-md">
          Book professional packaging, loading, and transit logistics for your upcoming home relocation.
        </p>
      </div>

      {bookingResult ? (
        <div className="max-w-2xl mx-auto bg-surface p-8 rounded-3xl border border-outline-variant/35 shadow-sm text-center space-y-6">
          <div className="flex justify-center text-primary">
            <CheckCircle size={56} className="stroke-[1.2]" />
          </div>
          <div className="space-y-2">
            <h2 className="font-serif text-2xl text-on-surface">Shifting Booked Successfully!</h2>
            <p className="text-xs text-on-surface-variant">Reference ID: <strong className="text-primary text-sm uppercase">{bookingResult.refNo}</strong></p>
          </div>

          <div className="bg-surface-container-low border border-outline-variant/20 p-6 rounded-2xl grid grid-cols-2 gap-6 text-left text-xs leading-relaxed font-semibold">
            <div>
              <p className="text-[10px] text-on-surface-variant uppercase tracking-wider mb-0.5">Moving Date</p>
              <p className="text-sm text-on-surface">{new Date(bookingResult.date).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-[10px] text-on-surface-variant uppercase tracking-wider mb-0.5">Volume Size</p>
              <p className="text-sm text-on-surface">{bookingResult.cargoSize}</p>
            </div>
            <div className="col-span-2">
              <p className="text-[10px] text-on-surface-variant uppercase tracking-wider mb-0.5">From Address</p>
              <p className="text-sm text-on-surface font-normal">{bookingResult.sourceAddress}</p>
            </div>
            <div className="col-span-2">
              <p className="text-[10px] text-on-surface-variant uppercase tracking-wider mb-0.5">To Address</p>
              <p className="text-sm text-on-surface font-normal">{bookingResult.destAddress}</p>
            </div>
            <div className="col-span-2 border-t border-outline-variant/30 pt-4 flex justify-between items-center text-sm">
              <span className="text-on-surface">Estimated Shifting Fee:</span>
              <span className="text-primary font-bold text-lg font-serif">${bookingResult.estimatedFee}</span>
            </div>
          </div>

          <p className="text-xs text-on-surface-variant max-w-sm mx-auto">
            Our logistics support representative will contact you shortly to coordinate packing inventory and timing details.
          </p>

          <button
            onClick={() => setBookingResult(null)}
            className="px-6 py-2.5 bg-primary text-on-primary hover:bg-primary-container hover:text-on-primary-container rounded-lg text-xs font-bold transition-colors"
          >
            Book Another Shifting
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Shifting Booking Form */}
          <form onSubmit={handleBook} className="lg:col-span-8 bg-surface p-6 rounded-3xl border border-outline-variant/35 shadow-sm space-y-6 text-xs font-semibold">
            <h3 className="font-serif text-xl text-on-surface font-semibold border-b border-outline-variant/20 pb-3">
              Request Moving Quote
            </h3>

            {error && (
              <div className="p-4 bg-error-container/40 border border-error-container text-error rounded-xl">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider text-on-surface-variant font-bold flex items-center gap-1">
                  <Navigation size={12} className="rotate-45" /> Source Address (Current)
                </label>
                <input
                  type="text"
                  required
                  value={sourceAddress}
                  onChange={(e) => setSourceAddress(e.target.value)}
                  className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/50 focus:border-primary rounded-lg text-sm text-on-surface focus:outline-none transition-colors"
                  placeholder="Street Address, City, ZIP"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider text-on-surface-variant font-bold flex items-center gap-1">
                  <Navigation size={12} className="rotate-45" /> Destination Address (New)
                </label>
                <input
                  type="text"
                  required
                  value={destAddress}
                  onChange={(e) => setDestAddress(e.target.value)}
                  className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/50 focus:border-primary rounded-lg text-sm text-on-surface focus:outline-none transition-colors"
                  placeholder="Street Address, City, ZIP"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider text-on-surface-variant font-bold flex items-center gap-1">
                  <Calendar size={12} /> Desired Shifting Date
                </label>
                <input
                  type="date"
                  required
                  value={moveDate}
                  onChange={(e) => setMoveDate(e.target.value)}
                  className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/50 focus:border-primary rounded-lg text-sm text-on-surface focus:outline-none transition-colors"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider text-on-surface-variant font-bold flex items-center gap-1">
                  <PackageOpen size={12} /> Home Volume Cargo Size
                </label>
                <select
                  value={cargoSize}
                  onChange={(e) => setCargoSize(e.target.value)}
                  className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/50 focus:border-primary rounded-lg text-sm text-on-surface-variant focus:outline-none transition-colors"
                >
                  <option value="Studio">Studio Apartment (Small Cargo)</option>
                  <option value="1 BHK">1 BHK (Medium Cargo)</option>
                  <option value="2 BHK">2 BHK (Large Cargo)</option>
                  <option value="3+ BHK">3+ BHK (Extra Large Cargo)</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-wider text-on-surface-variant font-bold">Item Inventory List (Optional)</label>
              <textarea
                value={itemsListStr}
                onChange={(e) => setItemsListStr(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/50 focus:border-primary rounded-lg text-sm text-on-surface focus:outline-none transition-colors font-sans"
                placeholder="List major items to move, one per line (e.g. Queen Bed, Dining Table, 3-Seater Sofa)..."
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="py-3 px-6 bg-primary text-on-primary hover:bg-primary-container hover:text-on-primary-container rounded-lg text-sm font-bold shadow-sm transition-colors flex items-center justify-center gap-2"
            >
              {loading ? 'Processing Quote...' : 'Confirm Shifting Booking'}
            </button>
          </form>

          {/* Pricing Estimation Panel */}
          <div className="lg:col-span-4 bg-surface p-6 rounded-3xl border border-outline-variant/35 shadow-sm space-y-6">
            <h3 className="font-serif text-lg text-on-surface font-semibold border-b border-outline-variant/20 pb-3 flex items-center gap-1.5">
              <Calculator size={18} /> Pricing Calculator
            </h3>

            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs text-on-surface-variant">
                <span>Selected volume size:</span>
                <span className="font-bold text-on-surface">{cargoSize}</span>
              </div>
              <div className="flex justify-between items-center text-xs text-on-surface-variant">
                <span>Distance Rate:</span>
                <span className="font-bold text-on-surface">Flat Rate / Covered</span>
              </div>
              <div className="border-t border-outline-variant/35 pt-3 flex justify-between items-center text-sm font-semibold">
                <span className="text-on-surface">Estimated Shifting Quote:</span>
                <span className="text-primary font-bold font-serif text-xl">${getEstimatedFee(cargoSize)}</span>
              </div>
            </div>

            <div className="p-4 bg-surface-container-low rounded-xl border border-outline-variant/20 text-xs text-on-surface-variant space-y-2 leading-relaxed font-normal">
              <h4 className="font-bold text-on-surface uppercase tracking-wider text-[9px] flex items-center gap-1">
                <Info size={12} /> ShiftEase Perks
              </h4>
              <ul className="list-disc pl-4 space-y-1">
                <li>Professional furniture packing, wrapping, and dismantling</li>
                <li>Safe transport in double-walled secure logistics trucks</li>
                <li>Hassle-free delivery, unpacking, and setup</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
