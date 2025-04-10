import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

import PageLayout from '@/components/layout/PageLayout';
import ProductGrid from '@/components/products/ProductGrid';
import { Product, Category } from '@/types';
import apiClient from '@/lib/apiClient';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from '@/components/ui/checkbox';
import { Search, SlidersHorizontal, X } from 'lucide-react';

interface BackendProduct {
    _id: string;
    title: string;
    slug: string;
    description: string;
    price: number;
    discountPrice?: number;
    discountEnds?: string;
    images: string[];
    videoUrl?: string;
    category?: { _id: string; name: string; slug: string; image?: string };
    seller?: { _id: string; name: string; email: string; };
    rating?: number;
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
    discountEnds: bp.discountEnds,
    images: bp.images,
    videoUrl: bp.videoUrl,
    categoryId: bp.category?._id,
    category: bp.category ? {
      id: bp.category._id,
      name: bp.category.name,
      slug: bp.category.slug,
      image: bp.category.image,
    } : undefined,
    sellerId: bp.seller?._id,
    seller: bp.seller ? { id: bp.seller._id, name: bp.seller.name, email: bp.seller.email, role: 'seller', createdAt: '' } : undefined,
    rating: bp.rating,
    stock: bp.stock,
    createdAt: bp.createdAt,
    updatedAt: bp.updatedAt,
});

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

const ProductsList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { slug: categorySlugFromPath } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const initialCategory = categorySlugFromPath || searchParams.get('category') || '';
  
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 30000]);
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'newest');
  const [showDiscount, setShowDiscount] = useState(searchParams.get('discounted') === 'true');
  const [inStock, setInStock] = useState(searchParams.get('inStock') !== 'false');

  useEffect(() => {
    setSelectedCategory(categorySlugFromPath || searchParams.get('category') || '');
  }, [categorySlugFromPath, searchParams]);

  const { data: backendCategories, isLoading: isLoadingCategories } = useQuery<BackendCategory[], Error>({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await apiClient.get('/api/categories');
      return response.data;
    },
    staleTime: 1000 * 60 * 10,
  });

  const categories: Category[] = useMemo(() =>
    backendCategories ? backendCategories.map(mapBackendCategoryToFrontend) : [],
    [backendCategories]
  );
  
  const categoryDisplayName = useMemo(() => {
    if (!selectedCategory) return 'All Products';
    return categories.find(c => c.slug === selectedCategory)?.name || selectedCategory;
  }, [selectedCategory, categories]);

  const queryParams = useMemo(() => {
    const params: Record<string, string> = {};
    if (selectedCategory) params.category = selectedCategory;
    if (searchTerm) params.search = searchTerm;
    if (priceRange[0] > 0) params.minPrice = String(priceRange[0]);
    if (priceRange[1] < 30000) params.maxPrice = String(priceRange[1]);
    if (sortBy !== 'newest') params.sortBy = sortBy;
    if (showDiscount) params.discounted = 'true';
    if (inStock === false) params.inStock = 'false';
    
    return params;
  }, [selectedCategory, searchTerm, priceRange, sortBy, showDiscount, inStock]);

  const { 
    data: products, 
    isLoading, 
    isError, 
    error 
  } = useQuery<Product[], Error>({
    queryKey: ['products', queryParams],
    queryFn: async (): Promise<Product[]> => {
      const response = await apiClient.get('/api/products', { params: queryParams });
      if (!Array.isArray(response.data)) {
          console.error("API did not return an array:", response.data);
          throw new Error('Invalid data format received from API');
      }
      return response.data.map((p: BackendProduct) => mapBackendProductToFrontend(p));
    },
    placeholderData: (previousData) => previousData,
  });

  // Effect to synchronize URL query parameters with filter state
  useEffect(() => {
    const newSearchParams = new URLSearchParams();
    // Only add category to query params if it's NOT from the path slug
    if (selectedCategory && !categorySlugFromPath) {
      newSearchParams.set('category', selectedCategory);
    }
    if (searchTerm) newSearchParams.set('search', searchTerm);
    if (sortBy !== 'newest') newSearchParams.set('sortBy', sortBy);
    if (showDiscount) newSearchParams.set('discounted', 'true');
    if (inStock === false) newSearchParams.set('inStock', 'false'); // Only set if explicitly false

    // Navigate to update URL without adding to history if only query params change
    // If categorySlugFromPath exists, we are already on the right path
    const targetPath = categorySlugFromPath ? `/category/${categorySlugFromPath}` : '/products';
    // Check if navigation is actually needed to prevent loops
    const currentPath = window.location.pathname + window.location.search;
    const nextPath = `${targetPath}?${newSearchParams.toString()}`;
    if (currentPath !== nextPath) {
      navigate(nextPath, { replace: true });
    }

  // Depend on state variables that affect the query parameters
  }, [selectedCategory, searchTerm, sortBy, showDiscount, inStock, categorySlugFromPath, navigate]);

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  };

  const handleCategoryChange = (newSlug: string) => {
    if (newSlug !== categorySlugFromPath) {
       setSelectedCategory(newSlug);
    } else {
       setSelectedCategory(newSlug);
    }
    if (!newSlug && categorySlugFromPath) {
        navigate('/products', { replace: true });
    }
  };

  const clearFilters = () => {
    handleCategoryChange(categorySlugFromPath || ''); 
    setSearchTerm('');
    setPriceRange([0, 30000]);
    setSortBy('newest');
    setShowDiscount(false);
    setInStock(true);
  };

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  const currentProducts = products || [];

  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold capitalize">{categoryDisplayName}</h1>
          <Button 
            variant="outline" 
            className="lg:hidden flex items-center gap-2"
            onClick={toggleFilters}
          >
            <SlidersHorizontal className="h-4 w-4" /> Filters
          </Button>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <div 
            className={`lg:hidden fixed inset-0 z-40 bg-white p-6 transform transition-transform duration-300 ease-in-out ${
              showFilters ? 'translate-x-0' : 'translate-x-full'
            }`}
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">Filters</h3>
              <Button variant="ghost" size="icon" onClick={toggleFilters}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="space-y-6 overflow-y-auto h-[calc(100vh-100px)] pb-6">
              <div className="space-y-4">
                <h4 className="font-medium">Search</h4>
                <form onSubmit={handleSearchSubmit} className="flex gap-2">
                  <Input 
                    placeholder="Search products..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-1"
                  />
                  <Button type="submit" size="icon">
                    <Search className="h-4 w-4" />
                  </Button>
                </form>
              </div>

              <div>
                <h4 className="font-medium mb-2">Categories</h4>
                <Select value={selectedCategory} onValueChange={handleCategoryChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category.id} value={category.slug}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <h4 className="font-medium mb-2">Price Range</h4>
                <div className="px-2">
                  <Slider
                    defaultValue={priceRange}
                    min={0}
                    max={30000}
                    step={100}
                    onValueChange={(value) => setPriceRange(value as [number, number])}
                    className="my-6"
                  />
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>৳{priceRange[0]}</span>
                  <span>৳{priceRange[1]}</span>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium mb-2">Other Filters</h4>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="discounted-mob" 
                    checked={showDiscount}
                    onCheckedChange={(checked) => setShowDiscount(checked as boolean)}
                  />
                  <label
                    htmlFor="discounted-mob"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Discounted Items
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="instock-mob" 
                    checked={inStock}
                    onCheckedChange={(checked) => setInStock(checked as boolean)}
                  />
                  <label
                    htmlFor="instock-mob"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    In Stock Only
                  </label>
                </div>
              </div>

              <div>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={clearFilters}
                >
                  Clear All Filters
                </Button>
              </div>
            </div>
          </div>

          <div className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-24 space-y-6">
              <div className="space-y-4">
                <h4 className="font-medium">Search</h4>
                <form onSubmit={handleSearchSubmit} className="flex gap-2">
                  <Input 
                    placeholder="Search products..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-1"
                  />
                  <Button type="submit" size="icon">
                    <Search className="h-4 w-4" />
                  </Button>
                </form>
              </div>

              <Accordion type="single" collapsible defaultValue="categories">
                <AccordionItem value="categories">
                  <AccordionTrigger className="py-2">Categories</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2 pl-2">
                      <div className="flex items-center space-x-2">
                        <button 
                          className={`text-sm py-1 ${!selectedCategory ? 'font-medium text-brand-primary' : ''}`}
                          onClick={() => handleCategoryChange('')}
                        >
                          All Categories
                        </button>
                      </div>
                      {categories.map(category => (
                        <div key={category.id} className="flex items-center space-x-2">
                          <button 
                            className={`text-sm py-1 ${selectedCategory === category.slug ? 'font-medium text-brand-primary' : ''}`}
                            onClick={() => handleCategoryChange(category.slug)}
                          >
                            {category.name}
                          </button>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="price">
                  <AccordionTrigger className="py-2">Price Range</AccordionTrigger>
                  <AccordionContent>
                    <div className="px-2">
                      <Slider
                        defaultValue={priceRange}
                        min={0}
                        max={30000}
                        step={100}
                        onValueChange={(value) => setPriceRange(value as [number, number])}
                        className="my-6"
                      />
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>৳{priceRange[0]}</span>
                      <span>৳{priceRange[1]}</span>
                    </div>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="other">
                  <AccordionTrigger className="py-2">Other Filters</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-3 pl-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="discounted-desktop" 
                          checked={showDiscount}
                          onCheckedChange={(checked) => setShowDiscount(checked as boolean)}
                        />
                        <label
                          htmlFor="discounted-desktop"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Discounted Items
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="instock-desktop" 
                          checked={inStock}
                          onCheckedChange={(checked) => setInStock(checked as boolean)}
                        />
                        <label
                          htmlFor="instock-desktop"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          In Stock Only
                        </label>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
              
              <div>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={clearFilters}
                >
                  Clear All Filters
                </Button>
              </div>
            </div>
          </div>

          <div className="flex-1">
            <div className="flex justify-between items-center mb-6">
              <p className="text-gray-600">
                {isLoading ? 'Loading...' : `Showing ${currentProducts.length} ${currentProducts.length === 1 ? 'product' : 'products'}`}
              </p>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort By" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="price_low">Price: Low to High</SelectItem>
                  <SelectItem value="price_high">Price: High to Low</SelectItem>
                  <SelectItem value="popular">Popularity</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {isLoading && !products ? (
              <div className="py-10 text-center">
                <p>Loading products...</p>
              </div>
            ) : isError ? (
              <div className="py-10 text-center text-red-600">
                <p>Error loading products: {error?.message || 'Unknown error'}</p>
              </div>
            ) : (
              <>
                {currentProducts.length === 0 ? (
                  <div className="py-10 text-center">
                    <p className="text-lg text-gray-600">No products found matching your criteria</p>
                    <Button 
                      variant="outline" 
                      className="mt-4"
                      onClick={clearFilters}
                    >
                      Clear All Filters
                    </Button>
                  </div>
                ) : (
                  <ProductGrid products={currentProducts} />
                )}
              </>
            )}
          </div>
        </div>
      </div>
      <ReactQueryDevtools initialIsOpen={false} />
    </PageLayout>
  );
};

export default ProductsList;
