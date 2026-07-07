import React from 'react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-surface-container border-t border-outline-variant/30 py-12 px-6 md:px-12 text-on-surface-variant">
      <div className="max-w-container-max mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="space-y-4">
          <h3 className="font-serif text-xl text-primary font-bold">RentEase</h3>
          <p className="text-sm leading-relaxed max-w-xs">
            Affordable and flexible furniture and appliance rental services. Transform your temporary stay into a premium home environment without the upfront costs.
          </p>
        </div>

        <div>
          <h4 className="font-serif text-sm font-semibold uppercase text-on-surface tracking-wider mb-4">Rental Categories</h4>
          <ul className="space-y-2 text-sm">
            <li>
              <Link to="/catalog?category=furniture" className="hover:text-primary transition-colors">
                Furniture Rentals
              </Link>
            </li>
            <li>
              <Link to="/catalog?category=appliances" className="hover:text-primary transition-colors">
                Home Appliances
              </Link>
            </li>
            <li>
              <Link to="/catalog" className="hover:text-primary transition-colors">
                Browse All Products
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-serif text-sm font-semibold uppercase text-on-surface tracking-wider mb-4">Quick Links</h4>
          <ul className="space-y-2 text-sm">
            <li>
              <Link to="/login" className="hover:text-primary transition-colors">
                Customer Login
              </Link>
            </li>
            <li>
              <Link to="/register" className="hover:text-primary transition-colors">
                Vendor Enrollment
              </Link>
            </li>
            <li>
              <span className="cursor-not-allowed text-secondary/60">Service Areas</span>
            </li>
            <li>
              <span className="cursor-not-allowed text-secondary/60">FAQs & Support</span>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-serif text-sm font-semibold uppercase text-on-surface tracking-wider mb-4">Contact Info</h4>
          <p className="text-sm">Email: contact@rentease.com</p>
          <p className="text-sm">Phone: +1 (555) 019-2834</p>
          <p className="text-sm mt-2">HQ: 789 HQ Parkway, Manhattan, NY</p>
        </div>
      </div>

      <div className="max-w-container-max mx-auto mt-12 pt-6 border-t border-outline-variant/20 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs">
        <p>&copy; {new Date().getFullYear()} RentEase Platform. All rights reserved.</p>
        <div className="flex gap-6">
          <span className="hover:underline cursor-pointer">Privacy Policy</span>
          <span className="hover:underline cursor-pointer">Terms of Service</span>
        </div>
      </div>
    </footer>
  );
};
