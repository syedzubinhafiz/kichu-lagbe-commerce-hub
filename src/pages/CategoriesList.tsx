// src/pages/CategoriesList.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query'; // Import useQuery
import PageLayout from '@/components/layout/PageLayout';
// Remove mock data import
// import { mockCategories } from '@/data/mockData'; 
import { Category } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import apiClient from '@/lib/apiClient'; // Import apiClient

// Define category type expected from backend API (reuse or move to shared types)
interface BackendCategory {
  _id: string;
  name: string;
  slug: string;
  image?: string;
}

// Mapping function (reuse or move to shared utils)
const mapBackendCategoryToFrontend = (bc: BackendCategory): Category => ({
  id: bc._id,
  name: bc.name,
  slug: bc.slug,
  image: bc.image,
});

const CategoriesList = () => {
  // Fetch Categories from API
  const { 
    data: backendCategories, 
    isLoading, 
    isError, 
    error 
  } = useQuery<BackendCategory[], Error>({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await apiClient.get('/api/categories');
      return response.data;
    },
    staleTime: 1000 * 60 * 10, // Cache for 10 minutes
  });

  const categories: Category[] = backendCategories?.map(mapBackendCategoryToFrontend) || [];

  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">All Categories</h1>
        
        {isLoading ? (
          <p className="text-center text-gray-500">Loading categories...</p>
        ) : isError ? (
          <p className="text-center text-red-600">Error loading categories: {error?.message || 'Unknown error'}</p>
        ) : categories.length === 0 ? (
          <p className="text-center text-gray-500">No categories found.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {categories.map((category) => (
              <Link key={category.id} to={`/category/${category.slug}`}>
                <Card className="group overflow-hidden transition-shadow duration-300 hover:shadow-lg">
                  <CardContent className="p-0 aspect-square flex flex-col items-center justify-center relative"> {/* Added relative positioning context */}
                    {category.image ? (
                      <img 
                        src={category.image} 
                        alt={category.name} 
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" 
                      />
                    ) : (
                      <div className="h-full w-full bg-gray-200 flex items-center justify-center">
                        <span className="text-sm text-gray-500">No Image</span>
                      </div>
                    )}
                    {/* Overlay - check if this could somehow be expanding */}
                    <div className="absolute inset-0 bg-black/40 flex items-end p-4 transition-opacity duration-300 opacity-100 md:opacity-0 group-hover:opacity-100">
                      <h3 className="text-white font-semibold text-lg line-clamp-2">{category.name}</h3>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </PageLayout>
  );
};

export default CategoriesList;