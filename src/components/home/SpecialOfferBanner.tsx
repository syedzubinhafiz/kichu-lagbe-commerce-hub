
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const SpecialOfferBanner = () => {
  return (
    <section className="py-12 bg-brand-primary text-white">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="mb-6 md:mb-0">
            <span className="inline-block bg-brand-accent text-brand-dark font-medium px-3 py-1 rounded-full text-sm mb-4">Limited Time Offer</span>
            <h2 className="text-3xl md:text-4xl font-bold mb-2">Special Discount for New Customers</h2>
            <p className="text-lg opacity-90 mb-6">Use code KICHUFIRST for 10% off your first purchase</p>
            <Link to="/products">
              <Button size="lg" className="bg-white text-brand-primary hover:bg-brand-accent">
                Shop Now
              </Button>
            </Link>
          </div>
          <div className="relative">
            <div className="bg-white/20 backdrop-blur-md rounded-lg p-6 text-center relative">
              <div className="absolute -inset-1 bg-white/30 blur rounded-lg"></div>
              <div className="relative">
                <span className="block text-lg font-semibold">Your First Order</span>
                <span className="block text-5xl font-bold my-2">10% OFF</span>
                <span className="block text-sm">Use code: KICHUFIRST</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SpecialOfferBanner;
