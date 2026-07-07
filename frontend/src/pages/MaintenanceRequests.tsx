import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Wrench, CheckCircle, Info, Calendar, ArrowRight, ClipboardList } from 'lucide-react';

interface Rental {
  _id: string;
  id?: string;
  productId: {
    productName: string;
  };
  status: string;
}

interface MaintenanceRequest {
  _id: string;
  id?: string;
  issueCategory: string;
  description: string;
  images: string[];
  status: 'Pending' | 'In Progress' | 'Resolved';
  resolutionNotes?: string;
  scheduledDate?: string;
  rentalId: {
    _id: string;
    productId?: {
      productName: string;
    };
  };
  createdAt: string;
}

export const MaintenanceRequests: React.FC = () => {
  const { user, api } = useAuth();
  const location = useLocation();

  // Read state if passed from MyRentals redirection
  const preselectedRentalId = location.state?.rentalId || '';
  const preselectedProductName = location.state?.productName || '';

  // Data states
  const [activeRentals, setActiveRentals] = useState<Rental[]>([]);
  const [tickets, setTickets] = useState<MaintenanceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Form states
  const [rentalId, setRentalId] = useState(preselectedRentalId);
  const [issueCategory, setIssueCategory] = useState('Functional Damage');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [rentalsRes, ticketsRes] = await Promise.all([
          api.get('/rentals/my-rentals'),
          api.get('/maintenance/my-requests')
        ]);
        
        // Filter rentals to show only active/delivered orders that can have repairs
        const deliverable = rentalsRes.data.filter(
          (r: any) => r.status === 'Active' || r.status === 'Delivered' || r.status === 'Pickup Scheduled'
        );
        setActiveRentals(deliverable);
        setTickets(ticketsRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rentalId || !description) {
      alert('Please select an active rental item and write a description.');
      return;
    }

    setFormLoading(true);
    try {
      const payload = {
        rentalId,
        issueCategory,
        description,
        images: imageUrl ? [imageUrl] : undefined
      };

      const res = await api.post('/maintenance', payload);
      
      // Update local state list
      setTickets(prev => [res.data, ...prev]);
      
      // Reset form
      setDescription('');
      setImageUrl('');
      setSuccess(true);
      setTimeout(() => setSuccess(false), 4000);
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to submit maintenance claim.');
    } finally {
      setFormLoading(false);
    }
  };

  const getTicketStatusStyle = (status: MaintenanceRequest['status']) => {
    switch (status) {
      case 'Pending':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'In Progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Resolved':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      default:
        return 'bg-zinc-100 text-zinc-800 border-zinc-200';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center space-y-3">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm text-on-surface-variant">Loading support tickets...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-6 md:px-12 max-w-container-max mx-auto space-y-8 bg-background">
      <div className="space-y-3 text-center md:text-left">
        <h1 className="font-serif text-3xl md:text-4xl text-on-surface">Maintenance & Support Center</h1>
        <p className="text-on-surface-variant text-sm max-w-md">
          Report product damage, appliance dysfunctions, or request cleaning assistance.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Raise Ticket Form */}
        <div className="lg:col-span-5 bg-surface p-6 rounded-2xl border border-outline-variant/35 shadow-sm space-y-6">
          <h3 className="font-serif text-xl text-on-surface font-semibold border-b border-outline-variant/20 pb-3 flex items-center gap-2">
            <Wrench size={18} /> File a Support Claim
          </h3>

          {success && (
            <div className="p-4 bg-emerald-100/55 border border-emerald-200 text-emerald-800 rounded-xl flex items-center gap-2 text-xs font-semibold">
              <CheckCircle size={18} className="shrink-0" />
              <span>Claim submitted successfully. Vendors will schedule resolution.</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs font-medium">
            {/* Select Rental Product */}
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-wider text-on-surface-variant font-bold">Select Rented Product</label>
              {activeRentals.length === 0 ? (
                <div className="p-3 bg-surface-container-low rounded-lg border border-outline-variant/30 text-on-surface-variant italic">
                  No active/delivered products available to raise repair claims.
                </div>
              ) : (
                <select
                  value={rentalId}
                  required
                  onChange={(e) => setRentalId(e.target.value)}
                  className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/50 focus:border-primary rounded-lg text-sm text-on-surface focus:outline-none transition-colors"
                >
                  <option value="">-- Choose active item --</option>
                  {activeRentals.map((r) => {
                    const rId = r._id || r.id;
                    return (
                      <option key={rId} value={rId}>
                        {r.productId?.productName} (Lease Ref: {rId?.substring(0, 8)})
                      </option>
                    );
                  })}
                </select>
              )}
            </div>

            {/* Issue Category */}
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-wider text-on-surface-variant font-bold">Category of Issue</label>
              <select
                value={issueCategory}
                onChange={(e) => setIssueCategory(e.target.value)}
                className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/50 focus:border-primary rounded-lg text-sm text-on-surface-variant focus:outline-none transition-colors"
              >
                <option value="Functional Damage">Functional Damage (doesn't work)</option>
                <option value="Cleaning">Cleaning & Stain Removal</option>
                <option value="Wear & Tear">Physical Wear & Tear (loose joints/scratches)</option>
                <option value="Other">Other Issues</option>
              </select>
            </div>

            {/* Problem Description */}
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-wider text-on-surface-variant font-bold">Describe the issue</label>
              <textarea
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/50 focus:border-primary rounded-lg text-sm text-on-surface focus:outline-none transition-colors"
                placeholder="Details of what is broken, when it happened, or requested service support"
                rows={4}
              />
            </div>

            {/* Optional Image Url */}
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-wider text-on-surface-variant font-bold flex justify-between">
                <span>Issue Photo URL</span>
                <span className="text-secondary/50 font-normal">Optional</span>
              </label>
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/50 focus:border-primary rounded-lg text-sm text-on-surface focus:outline-none transition-colors"
                placeholder="https://example.com/photo.jpg"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={formLoading || activeRentals.length === 0}
              className={`w-full py-3.5 rounded-lg text-sm font-semibold tracking-wide flex items-center justify-center gap-1.5 shadow-sm transition-all ${
                activeRentals.length === 0
                  ? 'bg-outline-variant/40 text-on-surface-variant cursor-not-allowed'
                  : 'bg-primary text-on-primary hover:bg-primary-container hover:text-on-primary-container'
              }`}
            >
              {formLoading ? 'Submitting Claim...' : 'Log Support Ticket'}
            </button>
          </form>
        </div>

        {/* Right Side: Raised Tickets List */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-surface p-6 rounded-2xl border border-outline-variant/35 shadow-sm space-y-6">
            <h3 className="font-serif text-xl text-on-surface font-semibold border-b border-outline-variant/20 pb-3 flex items-center gap-2">
              <ClipboardList size={18} /> Support Tickets Directory ({tickets.length})
            </h3>

            {tickets.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-center text-on-surface-variant italic space-y-2">
                <span>No support tickets filed yet.</span>
                <p className="text-xs font-normal max-w-xs">
                  If any furniture is loose or appliance fails, select it on the left and submit a repair claim.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-outline-variant/25">
                {tickets.map((t) => {
                  const tId = t._id || t.id;
                  const productName = t.rentalId?.productId?.productName || 'Rented Utility';

                  return (
                    <div key={tId} className="py-6 first:pt-0 last:pb-0 space-y-4">
                      <div className="flex justify-between items-start flex-wrap gap-2 text-xs">
                        <div>
                          <h4 className="font-serif text-base text-on-surface font-bold">
                            {productName}
                          </h4>
                          <p className="text-[10px] text-on-surface-variant font-medium tracking-wide uppercase">
                            Ref ID: #{tId?.substring(0, 8)} • Filed {new Date(t.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 border rounded-full ${getTicketStatusStyle(t.status)}`}>
                          {t.status}
                        </span>
                      </div>

                      <div className="text-xs space-y-2">
                        <p className="font-semibold text-on-surface">
                          Category: <span className="font-bold text-primary">{t.issueCategory}</span>
                        </p>
                        <p className="text-on-surface-variant leading-relaxed p-3 bg-surface-container-low/60 rounded-xl border border-outline-variant/15">
                          {t.description}
                        </p>
                      </div>

                      {/* Display scheduled repair date if set */}
                      {t.scheduledDate && (
                        <div className="flex items-center gap-1.5 text-xs text-primary bg-primary-fixed/40 p-2.5 rounded-lg max-w-fit font-bold border border-primary-fixed">
                          <Calendar size={14} /> Scheduled Service Date:{' '}
                          {new Date(t.scheduledDate).toLocaleDateString()}
                        </div>
                      )}

                      {/* Resolution Notes from Vendor */}
                      {t.resolutionNotes && (
                        <div className="bg-emerald-50/50 border border-emerald-100 p-3.5 rounded-xl space-y-1 text-xs">
                          <p className="font-bold text-emerald-800 flex items-center gap-1">
                            <CheckCircle size={14} /> Vendor Resolution Notes
                          </p>
                          <p className="text-on-surface-variant leading-relaxed font-normal">
                            {t.resolutionNotes}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};


