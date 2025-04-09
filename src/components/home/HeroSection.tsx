
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

const HeroSection = () => {
  return (
    <div className="bg-gradient-to-r from-brand-light to-white">
      <div className="container mx-auto px-4 py-12 md:py-20">
        <div className="flex flex-col md:flex-row items-center">
          <div className="w-full md:w-1/2 md:pr-10">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 text-brand-dark">
              Find Everything You Need
            </h1>
            <p className="text-lg md:text-xl mb-8 text-gray-700">
              Discover amazing products at incredible prices. Whether you're looking for electronics, clothing, or household items, we've got you covered.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/products">
                <Button size="lg" className="bg-brand-primary hover:bg-brand-dark">
                  Shop Now <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/categories">
                <Button size="lg" variant="outline">
                  Browse Categories
                </Button>
              </Link>
            </div>
          </div>
          <div className="w-full md:w-1/2 mt-10 md:mt-0">
            <div className="relative">
              <div className="absolute -inset-4 rounded-lg bg-brand-primary/20 blur-lg"></div>
              <img 
                src="https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d" 
                alt="Kichu Lagbe shopping experience" 
                className="relative rounded-lg shadow-lg w-full h-auto object-cover"
              />
              <div className="absolute -bottom-4 -right-4 bg-white p-3 rounded-lg shadow-lg">
                <div className="bg-brand-accent rounded-lg p-2 text-center">
                  <span className="block text-xs font-semibold">Limited Time</span>
                  <span className="block text-lg font-bold text-brand-dark">20% OFF</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
