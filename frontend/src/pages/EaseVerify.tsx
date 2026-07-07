import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, ShieldAlert, FileText, Upload, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

export const EaseVerify: React.FC = () => {
  const { user, api, updateProfile } = useAuth();
  
  const [docType, setDocType] = useState('National ID Card');
  const [docUrl, setDocUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docUrl) {
      setError('Please provide a document image or file link.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      // POST document to verify endpoint
      const res = await api.post('/auth/verify', { docUrl });
      
      // Update global context user state
      if (user) {
        user.verifyStatus = 'Pending';
        user.verifyDocUrl = docUrl;
      }
      setSuccess(true);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to submit verification document.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center space-y-4">
        <ShieldAlert size={48} className="text-error" />
        <h2 className="font-serif text-2xl text-on-surface">Access Denied</h2>
        <p className="text-sm text-on-surface-variant max-w-sm">Please log in to complete your profile verification check.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-6 md:px-12 max-w-container-max mx-auto space-y-8 bg-background">
      <div className="space-y-3 text-center md:text-left">
        <h1 className="font-serif text-3xl md:text-4xl text-on-surface flex items-center justify-center md:justify-start gap-2">
          <ShieldCheck className="text-primary" /> EaseVerify Profile Verification
        </h1>
        <p className="text-sm text-on-surface-variant max-w-md">
          Verify your identity to lock down premium rental products, buyouts, and logistics benefits.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Current Verification Status Info */}
        <div className="lg:col-span-5 bg-surface p-6 rounded-2xl border border-outline-variant/35 shadow-sm space-y-6">
          <h3 className="font-serif text-xl text-on-surface font-semibold border-b border-outline-variant/20 pb-3">
            Verification Status
          </h3>

          {user.verifyStatus === 'Verified' ? (
            <div className="bg-emerald-50 border border-emerald-200 p-6 rounded-2xl text-center space-y-4">
              <div className="flex justify-center text-emerald-800">
                <CheckCircle2 size={48} className="stroke-[1.5]" />
              </div>
              <div className="space-y-1">
                <h4 className="font-serif text-lg text-emerald-800 font-bold">Profile Verified</h4>
                <p className="text-xs text-on-surface-variant">
                  Your identity check is completed. You are authorized to rent high-value items and buyout assets.
                </p>
              </div>
            </div>
          ) : user.verifyStatus === 'Pending' || success ? (
            <div className="bg-blue-50 border border-blue-200 p-6 rounded-2xl text-center space-y-4">
              <div className="flex justify-center text-blue-800 animate-pulse">
                <Clock size={48} className="stroke-[1.5]" />
              </div>
              <div className="space-y-1">
                <h4 className="font-serif text-lg text-blue-800 font-bold">Review Underway</h4>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  Your document submission is currently pending review by our compliance team. Verification is usually completed in under 2 hours.
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-amber-50 border border-amber-200 p-6 rounded-2xl text-center space-y-4">
              <div className="flex justify-center text-amber-800">
                <ShieldAlert size={48} className="stroke-[1.5]" />
              </div>
              <div className="space-y-1">
                <h4 className="font-serif text-lg text-amber-800 font-bold">Verification Required</h4>
                <p className="text-xs text-on-surface-variant">
                  Please upload a photo of your government-issued ID to complete your RentEase credentials.
                </p>
              </div>
            </div>
          )}

          <div className="p-4 bg-surface-container-low/60 rounded-xl border border-outline-variant/20 text-xs text-on-surface-variant space-y-2 leading-relaxed">
            <h4 className="font-semibold text-on-surface uppercase tracking-wider text-[10px]">Why is verification required?</h4>
            <p>
              RentEase rents out expensive, high-quality furniture and appliances without heavy security deposits. This profile check minimizes asset loss risks, enabling us to keep prices low.
            </p>
          </div>
        </div>

        {/* Right Column: Upload Document Form */}
        <div className="lg:col-span-7">
          {user.verifyStatus === 'Unverified' && !success ? (
            <form onSubmit={handleSubmit} className="bg-surface p-6 rounded-2xl border border-outline-variant/35 shadow-sm space-y-6 text-xs font-semibold">
              <h3 className="font-serif text-xl text-on-surface font-semibold border-b border-outline-variant/20 pb-3 flex items-center gap-2">
                <Upload size={18} /> Submit Identity Credentials
              </h3>

              {error && (
                <div className="p-4 bg-error-container/40 border border-error-container text-error rounded-xl flex items-start gap-2 text-sm font-normal">
                  <AlertCircle size={18} className="shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider text-on-surface-variant font-bold">Document Type</label>
                  <select
                    value={docType}
                    onChange={(e) => setDocType(e.target.value)}
                    className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/50 focus:border-primary rounded-lg text-sm text-on-surface-variant focus:outline-none transition-colors"
                  >
                    <option value="National ID Card">National ID Card / Aadhaar</option>
                    <option value="Drivers License">Driver's License</option>
                    <option value="Passport">Passport Book</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider text-on-surface-variant font-bold">Document Image Link</label>
                  <input
                    type="url"
                    required
                    value={docUrl}
                    onChange={(e) => setDocUrl(e.target.value)}
                    className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/50 focus:border-primary rounded-lg text-sm text-on-surface focus:outline-none transition-colors"
                    placeholder="https://example.com/id-photo.jpg"
                  />
                </div>
              </div>

              <div className="p-4 bg-primary/5 rounded-xl border border-primary/10 text-[10px] text-primary leading-relaxed font-semibold">
                Note: For local testing, you can paste any image URL (e.g. https://images.unsplash.com/photo-1555041469-a586c61ea9bc) as your ID verification document.
              </div>

              <button
                type="submit"
                disabled={loading}
                className="py-3 px-6 bg-primary text-on-primary hover:bg-primary-container hover:text-on-primary-container font-semibold rounded-lg text-sm shadow-sm transition-colors flex items-center justify-center gap-2"
              >
                {loading ? 'Submitting Doc...' : 'Submit Verification'}
              </button>
            </form>
          ) : (
            <div className="bg-surface p-8 rounded-2xl border border-outline-variant/35 shadow-sm text-center space-y-4">
              <FileText size={48} className="text-outline mx-auto stroke-[1.2]" />
              <h3 className="font-serif text-2xl text-on-surface">Document Logged</h3>
              <p className="text-sm text-on-surface-variant max-w-sm mx-auto leading-relaxed">
                Your submitted document reference is logged in our database. While review is pending, you can continue browsing our product catalog.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
