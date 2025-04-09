
import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-gray-100 pt-12 mt-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand and Description */}
          <div>
            <Link to="/" className="flex items-center gap-2">
              <span className="font-heading text-2xl font-bold text-brand-primary">Kichu Lagbe</span>
            </Link>
            <p className="mt-4 text-sm text-gray-600">
              Your one-stop shop for all your needs. From electronics to clothing, 
              we've got everything you need at great prices.
            </p>
            <div className="mt-6 flex items-center space-x-4">
              <a href="#" className="text-gray-600 hover:text-brand-primary transition-colors">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-gray-600 hover:text-brand-primary transition-colors">
                <Instagram size={20} />
              </a>
              <a href="#" className="text-gray-600 hover:text-brand-primary transition-colors">
                <Twitter size={20} />
              </a>
            </div>
          </div>

          {/* Shopping Links */}
          <div>
            <h3 className="font-heading text-lg font-semibold mb-4">Shopping</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/products" className="text-gray-600 hover:text-brand-primary transition-colors">
                  All Products
                </Link>
              </li>
              <li>
                <Link to="/categories" className="text-gray-600 hover:text-brand-primary transition-colors">
                  Categories
                </Link>
              </li>
              <li>
                <Link to="/cart" className="text-gray-600 hover:text-brand-primary transition-colors">
                  Your Cart
                </Link>
              </li>
              <li>
                <Link to="/wishlist" className="text-gray-600 hover:text-brand-primary transition-colors">
                  Wishlist
                </Link>
              </li>
            </ul>
          </div>

          {/* Account Links */}
          <div>
            <h3 className="font-heading text-lg font-semibold mb-4">Account</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/login" className="text-gray-600 hover:text-brand-primary transition-colors">
                  Login
                </Link>
              </li>
              <li>
                <Link to="/register" className="text-gray-600 hover:text-brand-primary transition-colors">
                  Register
                </Link>
              </li>
              <li>
                <Link to="/profile/orders" className="text-gray-600 hover:text-brand-primary transition-colors">
                  Order History
                </Link>
              </li>
              <li>
                <Link to="/profile" className="text-gray-600 hover:text-brand-primary transition-colors">
                  Profile
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Information */}
          <div>
            <h3 className="font-heading text-lg font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <MapPin size={18} className="flex-shrink-0 text-brand-primary mt-0.5" />
                <span className="text-gray-600">
                  123 Commerce St., Dhaka, Bangladesh
                </span>
              </li>
              <li className="flex items-center gap-2">
                <Phone size={18} className="flex-shrink-0 text-brand-primary" />
                <a href="tel:+8801234567890" className="text-gray-600 hover:text-brand-primary transition-colors">
                  +880 123 456 7890
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail size={18} className="flex-shrink-0 text-brand-primary" />
                <a href="mailto:info@kichulagbe.com" className="text-gray-600 hover:text-brand-primary transition-colors">
                  info@kichulagbe.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="my-8 border-t border-gray-200"></div>
        
        <div className="flex flex-col md:flex-row md:justify-between py-6 text-sm text-gray-600">
          <div>
            &copy; {currentYear} Kichu Lagbe. All rights reserved.
          </div>
          <div className="mt-4 md:mt-0 space-x-4">
            <Link to="/privacy-policy" className="hover:text-brand-primary transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms-of-service" className="hover:text-brand-primary transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
