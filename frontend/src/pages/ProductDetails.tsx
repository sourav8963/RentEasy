import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, ShoppingCart, ShieldCheck, Heart, Info, Check } from 'lucide-react';
import { API_URL } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

interface Product {
  _id: string;
  productName: string;
  category: 'furniture' | 'appliances';
  subCategory: string;
  rentPerMonth: number;
  securityDeposit: number;
  quantity: number;
  availableQuantity: number;
  images: string[];
  description: string;
  specifications: Record<string, string>;
  vendorId?: {
    _id: string;
    name: string;
    email: string;
    businessName?: string;
  };
}

export const ProductDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Selector states
  const [selectedPlan, setSelectedPlan] = useState<number>(3); // defaults to 3 months
  const [quantity, setQuantity] = useState<number>(1);
  const [addedMessage, setAddedMessage] = useState(false);

  const planOptions = [
    { months: 3, label: '3 Months', discount: 0 },
    { months: 6, label: '6 Months', discount: 0.05 },
    { months: 12, label: '12 Months', discount: 0.10 },
    { months: 24, label: '24 Months', discount: 0.15 }
  ];

  useEffect(() => {
    const fetchProductDetails = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${API_URL}/products/${id}`);
        setProduct(res.data);
      } catch (err) {
        console.error(err);
        setError('Failed to load product details.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProductDetails();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center space-y-3">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm text-on-surface-variant">Loading item details...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center p-6 space-y-4">
        <Info size={36} className="text-error" />
        <h3 className="font-serif text-2xl text-on-surface">Product not found</h3>
        <p className="text-sm text-on-surface-variant max-w-sm">We couldn't fetch details for this rental ID.</p>
        <Link to="/catalog" className="text-primary font-semibold hover:underline flex items-center gap-1">
          <ArrowLeft size={16} /> Back to Catalog
        </Link>
      </div>
    );
  }

  // Calculate rent discount based on active plan tenure
  const activeOption = planOptions.find(o => o.months === selectedPlan) || planOptions[0];
  const discountedRent = Math.round(product.rentPerMonth * (1 - activeOption.discount));
  const totalRentSum = discountedRent * quantity;
  const totalDepositSum = product.securityDeposit * quantity;
  const isOutOfStock = product.availableQuantity <= 0;

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    
    addToCart({
      productId: product._id,
      productName: product.productName,
      images: product.images,
      rentPerMonth: discountedRent,
      securityDeposit: product.securityDeposit,
      rentalPlan: selectedPlan,
      quantity: quantity
    });

    setAddedMessage(true);
    setTimeout(() => setAddedMessage(false), 3000);
  };

  return (
    <div className="min-h-screen py-12 px-6 md:px-12 max-w-container-max mx-auto space-y-10 bg-background">
      {/* Back Button */}
      <Link to="/catalog" className="inline-flex items-center gap-2 text-sm text-on-surface-variant hover:text-primary font-semibold transition-colors">
        <ArrowLeft size={16} /> Back to shop catalog
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Left Side Column: Product Image Gallery */}
        <div className="lg:col-span-6 space-y-4">
          <div className="aspect-[4/3] rounded-3xl overflow-hidden border border-outline-variant/30 bg-surface-container-low shadow-sm relative">
            {isOutOfStock && (
              <span className="absolute top-4 left-4 z-10 bg-error/10 text-error border border-error/25 text-xs uppercase font-bold tracking-widest px-3 py-1.5 rounded-full">
                Rented Out
              </span>
            )}
            <img
              src={product.images[0]}
              alt={product.productName}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Right Side Column: Product Details & Pricing Simulator */}
        <div className="lg:col-span-6 space-y-8">
          <div className="space-y-3">
            <span className="text-xs uppercase tracking-widest text-primary bg-primary/5 border border-primary/10 px-3 py-1 rounded-full font-semibold">
              {product.category} • {product.subCategory}
            </span>
            <h1 className="font-serif text-3xl md:text-4xl text-on-surface leading-tight">
              {product.productName}
            </h1>
            <p className="text-xs text-on-surface-variant">
              Fitted & managed by{' '}
              <span className="font-bold text-on-surface">
                {product.vendorId?.businessName || product.vendorId?.name || 'Partner Vendor'}
              </span>
            </p>
          </div>

          <p className="text-sm leading-relaxed text-on-surface-variant">
            {product.description || 'No description provided. This is a premium furniture/appliance item curated for comfort, aesthetic utility, and reliability.'}
          </p>

          {/* Plan Tenure Simulator */}
          <div className="space-y-4 bg-surface p-6 rounded-2xl border border-outline-variant/30 shadow-sm">
            <div className="flex justify-between items-center border-b border-outline-variant/30 pb-3">
              <h3 className="font-serif text-lg font-semibold text-on-surface">1. Choose Rental Tenure</h3>
              <span className="text-[10px] text-primary uppercase font-bold tracking-wider bg-primary/5 px-2.5 py-1 rounded-full">
                longer tenure = lower rent
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {planOptions.map((opt) => (
                <button
                  key={opt.months}
                  onClick={() => setSelectedPlan(opt.months)}
                  className={`py-3 px-2 rounded-xl border flex flex-col items-center justify-center transition-all ${
                    selectedPlan === opt.months
                      ? 'border-primary bg-primary/5'
                      : 'border-outline-variant/40 hover:bg-surface-container-low'
                  }`}
                >
                  <span className="text-sm font-bold text-on-surface">{opt.label}</span>
                  {opt.discount > 0 ? (
                    <span className="text-[10px] text-primary font-semibold mt-1">
                      Save {opt.discount * 100}%
                    </span>
                  ) : (
                    <span className="text-[10px] text-on-surface-variant mt-1">Base Rate</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Pricing Summary and Action Button */}
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6 bg-surface-container-low p-6 rounded-2xl border border-outline-variant/25">
              <div>
                <p className="text-xs text-on-surface-variant">Rent Per Month</p>
                <p className="text-2xl font-serif text-primary font-bold">
                  ${discountedRent}
                  <span className="text-xs font-sans font-normal text-on-surface-variant">/mo</span>
                </p>
                {activeOption.discount > 0 && (
                  <p className="text-[10px] text-primary font-semibold line-through">
                    Normally ${product.rentPerMonth}/mo
                  </p>
                )}
              </div>
              <div className="text-right border-l border-outline-variant/30 pl-6">
                <p className="text-xs text-on-surface-variant">Refundable Deposit</p>
                <p className="text-xl font-serif text-on-surface font-semibold">
                  ${product.securityDeposit}
                </p>
                <p className="text-[9px] text-on-surface-variant">100% refundable upon return</p>
              </div>
            </div>

            {/* Quantity Selector & Cart Action */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <div className="flex items-center border border-outline-variant/50 rounded-lg bg-surface">
                <button
                  type="button"
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="px-4 py-3 text-secondary hover:text-primary transition-colors font-bold"
                >
                  -
                </button>
                <span className="px-4 py-3 font-semibold text-sm w-12 text-center">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity(q => Math.min(product.availableQuantity, q + 1))}
                  className="px-4 py-3 text-secondary hover:text-primary transition-colors font-bold"
                >
                  +
                </button>
              </div>

              <button
                type="button"
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className={`flex-grow py-4 px-6 rounded-lg text-sm font-semibold tracking-wide flex items-center justify-center gap-2 shadow-sm transition-all ${
                  isOutOfStock
                    ? 'bg-outline-variant/40 text-on-surface-variant cursor-not-allowed'
                    : 'bg-primary text-on-primary hover:bg-primary-container hover:text-on-primary-container'
                }`}
              >
                <ShoppingCart size={18} /> Add to Rental Cart
              </button>
            </div>

            {/* In-Stock Indicator */}
            <div className="flex justify-between items-center text-xs text-on-surface-variant">
              <span>Refundable Security Deposit is paid upfront during checkout.</span>
              <span className={`font-semibold ${isOutOfStock ? 'text-error' : 'text-primary'}`}>
                {isOutOfStock ? 'Rented Out' : `In Stock: ${product.availableQuantity} units`}
              </span>
            </div>

            {addedMessage && (
              <div className="p-4 bg-primary/10 border border-primary/20 text-primary rounded-xl flex items-center justify-between text-sm transition-all">
                <span className="flex items-center gap-2 font-medium">
                  <Check size={18} /> Item added to cart successfully!
                </span>
                <Link to="/checkout" className="text-xs uppercase font-bold tracking-wider hover:underline">
                  Go to checkout
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Specifications & Details Section */}
      <section className="border-t border-outline-variant/30 pt-10 space-y-6">
        <h3 className="font-serif text-2xl text-on-surface">Specifications & Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-surface rounded-2xl border border-outline-variant/30 overflow-hidden">
            <table className="w-full text-sm text-left border-collapse">
              <tbody>
                {product.specifications && Object.entries(product.specifications).length > 0 ? (
                  Object.entries(product.specifications).map(([key, val], idx) => (
                    <tr key={idx} className="border-b border-outline-variant/25 last:border-0 hover:bg-surface-container-low transition-colors">
                      <td className="px-6 py-4 font-semibold text-on-surface-variant bg-surface-container-low/30 w-1/3">
                        {key}
                      </td>
                      <td className="px-6 py-4 text-on-surface">
                        {val}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr className="hover:bg-surface-container-low transition-colors">
                    <td className="px-6 py-4 text-on-surface-variant italic" colSpan={2}>
                      No specific measurements or technical parameters listed.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="bg-surface p-6 rounded-2xl border border-outline-variant/30 space-y-4 flex flex-col justify-center">
            <div className="flex gap-3">
              <ShieldCheck size={32} className="text-primary shrink-0" />
              <div className="space-y-1">
                <h4 className="font-serif text-lg text-on-surface font-semibold">100% Refund Guarantee</h4>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  Your security deposit is securely held and immediately credited back to your bank account within 24 hours of successful product return inspection.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <ShieldCheck size={32} className="text-primary shrink-0" />
              <div className="space-y-1">
                <h4 className="font-serif text-lg text-on-surface font-semibold">Damage & Inspection Policy</h4>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  Standard wear-and-tear is fully covered. Our team performs inspection on collection. For any disputes, our admin support is ready to assist.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
