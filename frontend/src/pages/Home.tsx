import React from 'react';
import { Link } from 'react-router-dom';
import { Sofa, Refrigerator, ShieldCheck, Truck, RefreshCw, Wrench, ArrowRight } from 'lucide-react';

export const Home: React.FC = () => {
  const featuredCategories = [
    { name: 'Sofas & Loungers', image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=600&q=80', sub: 'Sofa' },
    { name: 'Beds & Wardrobes', image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=600&q=80', sub: 'Bed' },
    { name: 'Kitchen Appliances', image: 'https://images.unsplash.com/photo-1571175482282-4b38d6df955b?auto=format&fit=crop&w=600&q=80', sub: 'Refrigerator' },
    { name: 'Washers & Dryers', image: 'https://images.unsplash.com/photo-1582738411706-bfc8e691d1c2?auto=format&fit=crop&w=600&q=80', sub: 'Washing Machine' }
  ];

  return (
    <div className="bg-background min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 px-6 md:px-12 max-w-container-max mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-6 space-y-6">
          <span className="text-xs uppercase tracking-wider font-semibold text-primary bg-primary-fixed/40 px-3 py-1.5 rounded-full">
            The Circular Furniture Economy
          </span>
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl text-on-surface leading-[1.1] tracking-tight">
            Live beautifully.<br />
            Rent <span className="italic font-normal text-primary">flexibly</span>.
          </h1>
          <p className="text-body-lg text-on-surface-variant max-w-lg leading-relaxed">
            Upgrade your space with premium furniture and smart appliances without the commitment of purchase. Select flexible tenures with full delivery and maintenance support.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 pt-2">
            <Link
              to="/catalog"
              className="px-8 py-4 bg-primary text-on-primary hover:bg-primary-container hover:text-on-primary-container rounded-lg font-semibold tracking-wide flex items-center justify-center gap-2 shadow-sm hover:shadow transition-all"
            >
              Explore Products <ArrowRight size={18} />
            </Link>
            <a
              href="#why-rentease"
              className="px-8 py-4 border border-outline-variant hover:bg-surface-container-low text-secondary rounded-lg font-semibold tracking-wide text-center transition-all"
            >
              How it works
            </a>
          </div>
        </div>
        <div className="lg:col-span-6 relative">
          <div className="absolute inset-0 bg-secondary-container/20 rounded-3xl -rotate-2 -z-10"></div>
          <img
            src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=80"
            alt="Japandi styled room furniture set"
            className="rounded-3xl shadow-xl w-full h-[400px] md:h-[500px] object-cover border border-outline-variant/30"
          />
        </div>
      </section>

      {/* Category Grid Section */}
      <section className="py-16 px-6 md:px-12 bg-surface-container-low">
        <div className="max-w-container-max mx-auto space-y-10">
          <div className="text-center md:text-left space-y-2">
            <h2 className="font-serif text-3xl md:text-4xl text-on-surface">Browse by Category</h2>
            <p className="text-on-surface-variant text-sm max-w-md">
              Curated collections specifically tailored for modern apartments, corporate flats, and cozy homes.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredCategories.map((cat, idx) => (
              <Link
                key={idx}
                to={`/catalog?subCategory=${cat.sub}`}
                className="group relative overflow-hidden rounded-2xl aspect-[4/3] border border-outline-variant/30 bg-surface-container-highest shadow-sm hover:shadow-md transition-all"
              >
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent flex flex-col justify-end p-6">
                  <h3 className="font-serif text-lg text-white font-medium group-hover:translate-x-1 transition-transform">
                    {cat.name}
                  </h3>
                  <span className="text-xs text-white/70 tracking-wider flex items-center gap-1 mt-1">
                    Rent now <ArrowRight size={12} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose RentEase Section */}
      <section id="why-rentease" className="py-20 px-6 md:px-12 max-w-container-max mx-auto space-y-12">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <h2 className="font-serif text-3xl md:text-4xl text-on-surface">Effortless Relocation, Serene Ownership</h2>
          <p className="text-on-surface-variant text-sm">
            We take care of the heavy lifting. RentEase provides premium utilities with comprehensive support services.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="bg-surface p-6 rounded-2xl border border-outline-variant/35 shadow-sm space-y-4 hover:-translate-y-1 transition-all">
            <div className="w-12 h-12 rounded-xl bg-primary-fixed flex items-center justify-center text-primary font-bold">
              <Truck size={24} />
            </div>
            <h3 className="font-serif text-xl text-on-surface font-semibold">Free Delivery & Assembly</h3>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              We ship, deliver, and professionally assemble every single appliance and furniture item in your service area.
            </p>
          </div>

          <div className="bg-surface p-6 rounded-2xl border border-outline-variant/35 shadow-sm space-y-4 hover:-translate-y-1 transition-all">
            <div className="w-12 h-12 rounded-xl bg-primary-fixed flex items-center justify-center text-primary font-bold">
              <Wrench size={24} />
            </div>
            <h3 className="font-serif text-xl text-on-surface font-semibold">Free Maintenance Support</h3>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              Faulty appliances or loose joints? Raise a request in your customer dashboard, and our service team resolves it.
            </p>
          </div>

          <div className="bg-surface p-6 rounded-2xl border border-outline-variant/35 shadow-sm space-y-4 hover:-translate-y-1 transition-all">
            <div className="w-12 h-12 rounded-xl bg-primary-fixed flex items-center justify-center text-primary font-bold">
              <RefreshCw size={24} />
            </div>
            <h3 className="font-serif text-xl text-on-surface font-semibold">Flexible Tenures</h3>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              Rent for 3, 6, 12, or 24 months. The longer your lease contract duration, the lower your monthly rental costs.
            </p>
          </div>

          <div className="bg-surface p-6 rounded-2xl border border-outline-variant/35 shadow-sm space-y-4 hover:-translate-y-1 transition-all">
            <div className="w-12 h-12 rounded-xl bg-primary-fixed flex items-center justify-center text-primary font-bold">
              <ShieldCheck size={24} />
            </div>
            <h3 className="font-serif text-xl text-on-surface font-semibold">Quality Inspection</h3>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              Every rental item passes a multi-point quality check. We ensure deep sanitization and immaculate finishes.
            </p>
          </div>
        </div>
      </section>

      {/* Featured Furniture Showcase CTA */}
      <section className="py-16 px-6 md:px-12 bg-primary/5 border-t border-b border-primary/10">
        <div className="max-w-container-max mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="space-y-3 max-w-xl text-center md:text-left">
            <h2 className="font-serif text-3xl text-on-surface">Furnish your entire flat under $150/mo</h2>
            <p className="text-on-surface-variant text-sm">
              Combine sofas, double beds, desks, and refrigerators into your cart and select custom plans to match your exact budget constraints.
            </p>
          </div>
          <Link
            to="/catalog"
            className="px-8 py-4 bg-primary text-on-primary hover:bg-primary-container hover:text-on-primary-container rounded-lg font-semibold tracking-wide shadow-sm hover:shadow transition-all whitespace-nowrap"
          >
            Start Shopping Catalog
          </Link>
        </div>
      </section>
    </div>
  );
};
