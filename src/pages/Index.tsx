
import React from 'react';
import PageLayout from '@/components/layout/PageLayout';
import HeroSection from '@/components/home/HeroSection';
import CategorySection from '@/components/home/CategorySection';
import FeaturedProducts from '@/components/home/FeaturedProducts';
import SpecialOfferBanner from '@/components/home/SpecialOfferBanner';
import { getProducts, getCategories } from '@/data/mockData';

const Index = () => {
  // Get featured products and categories from mock data
  const featuredProducts = getProducts(8);
  const discountedProducts = getProducts().filter(product => product.discountPrice);
  const categories = getCategories();

  return (
    <PageLayout>
      <HeroSection />
      
      <CategorySection categories={categories} />
      
      <FeaturedProducts 
        products={featuredProducts} 
        title="Featured Products" 
        viewAllLink="/products"
      />
      
      <SpecialOfferBanner />
      
      <FeaturedProducts 
        products={discountedProducts.slice(0, 4)} 
        title="Special Deals" 
        viewAllLink="/products/deals"
      />
    </PageLayout>
  );
};

export default Index;
