import React from 'react';
import { useQuery } from '@tanstack/react-query';
import PageLayout from '@/components/layout/PageLayout';
import HeroSection from '@/components/home/HeroSection';
import CategorySection from '@/components/home/CategorySection';
import FeaturedProducts from '@/components/home/FeaturedProducts';
import SpecialOfferBanner from '@/components/home/SpecialOfferBanner';
import apiClient from '@/lib/apiClient';
import { Product, Category } from '@/types';

interface BackendCategory {
  _id: string;
  name: string;
  slug: string;
  image?: string;
}

const mapBackendCategoryToFrontend = (bc: BackendCategory): Category => ({
  id: bc._id,
  name: bc.name,
  slug: bc.slug,
  image: bc.image,
});

interface BackendProduct {
  _id: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  discountPrice?: number;
  images: string[];
  category: BackendCategory | string;
  seller: any;
  stock: number;
  createdAt: string;
  updatedAt: string;
}

const mapBackendProductToFrontend = (bp: BackendProduct): Product => ({
  id: bp._id,
  title: bp.title,
  slug: bp.slug,
  description: bp.description,
  price: bp.price,
  discountPrice: bp.discountPrice,
  images: bp.images,
  categoryId: typeof bp.category === 'object' ? (bp.category as BackendCategory)._id : bp.category,
  category: typeof bp.category === 'object' ? mapBackendCategoryToFrontend(bp.category as BackendCategory) : undefined,
  sellerId: bp.seller?._id,
  stock: bp.stock,
  createdAt: bp.createdAt,
  updatedAt: bp.updatedAt,
});

const Index = () => {
  const { data: backendCategories, isLoading: isLoadingCategories } = useQuery<BackendCategory[], Error>({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await apiClient.get('/api/categories');
      return response.data;
    },
    staleTime: 1000 * 60 * 5,
  });
  const categories = backendCategories?.map(mapBackendCategoryToFrontend) || [];

  const { data: backendFeatured, isLoading: isLoadingFeatured } = useQuery<BackendProduct[], Error>({
    queryKey: ['products', { sortBy: 'newest', limit: 8 }],
    queryFn: async () => {
      const response = await apiClient.get('/api/products', { params: { sortBy: 'newest', limit: 8 } });
      return response.data;
    },
    staleTime: 1000 * 60 * 5,
  });
  const featuredProducts = backendFeatured?.map(mapBackendProductToFrontend) || [];

  const { data: backendDiscounted, isLoading: isLoadingDiscounted } = useQuery<BackendProduct[], Error>({
    queryKey: ['products', { discounted: 'true', limit: 4 }],
    queryFn: async () => {
      const response = await apiClient.get('/api/products', { params: { discounted: 'true', limit: 4 } });
      return response.data;
    },
    staleTime: 1000 * 60 * 5,
  });
  const discountedProducts = backendDiscounted?.map(mapBackendProductToFrontend) || [];

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
        products={discountedProducts}
        title="Special Deals" 
        viewAllLink="/products?discounted=true"
      />
    </PageLayout>
  );
};

export default Index;
