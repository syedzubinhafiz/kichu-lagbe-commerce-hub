import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Product, Review, Category, User as FrontendUser } from '@/types';
import { useCart } from '@/context/CartContext';
import apiClient from '@/lib/apiClient';
import PageLayout from '@/components/layout/PageLayout';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Heart, TruckIcon, ShieldCheck, ArrowLeft, Star, Minus, Plus } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

interface BackendProductDetail {
    _id: string;
    title: string;
    slug: string;
    description: string;
    price: number;
    discountPrice?: number;
    discountEnds?: string;
    images: string[];
    videoUrl?: string;
    category: { _id: string; name: string; slug: string; image?: string };
    seller: { _id: string; name: string; email: string; };
    rating?: number;
    stock: number;
    createdAt: string;
    updatedAt: string;
}

const mapBackendProductDetailToFrontend = (bp: BackendProductDetail): Product => ({
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
    seller: bp.seller ? {
        id: bp.seller._id,
        name: bp.seller.name,
        email: bp.seller.email,
        role: 'seller',
        createdAt: ''
    } : undefined,
    rating: bp.rating,
    stock: bp.stock,
    createdAt: bp.createdAt,
    updatedAt: bp.updatedAt,
});

const ProductDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [timeRemaining, setTimeRemaining] = useState<{ days: number; hours: number; minutes: number; seconds: number } | null>(null);
  const { addToCart } = useCart();

  const { 
      data: backendProduct, 
      isLoading, 
      isError, 
      error 
  } = useQuery<BackendProductDetail, Error>({
    queryKey: ['product', slug], 
    queryFn: async () => {
      if (!slug) throw new Error('Product slug is missing');
      const response = await apiClient.get(`/api/products/${slug}`); 
      return response.data;
    },
    enabled: !!slug,
    retry: 1,
  });

  const product: Product | null = backendProduct ? mapBackendProductDetailToFrontend(backendProduct) : null;
  const reviews: Review[] = [];

  useEffect(() => {
    if (product && product.images.length > 0 && !selectedImage) {
      setSelectedImage(product.images[0]);
    }
  }, [product, selectedImage]);

  useEffect(() => {
    if (!product?.discountEnds) {
        setTimeRemaining(null);
        return;
    }

    const calculateTimeRemaining = () => {
      const now = new Date();
      const end = new Date(product.discountEnds as string);
      const difference = end.getTime() - now.getTime();
      
      if (difference <= 0) {
        setTimeRemaining(null);
        return;
      }
      
      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);
      
      setTimeRemaining({ days, hours, minutes, seconds });
    };
    
    calculateTimeRemaining();
    const interval = setInterval(calculateTimeRemaining, 1000);
    
    return () => clearInterval(interval);
  }, [product]);

  const handleAddToCart = () => {
    if (product) {
      addToCart(product, quantity);
    }
  };

  const incrementQuantity = () => {
    if (product && quantity < product.stock) {
      setQuantity(quantity + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  if (isLoading) {
    return (
      <PageLayout>
        <div className="container mx-auto px-4 py-8 text-center">
          <p>Loading product details...</p>
        </div>
      </PageLayout>
    );
  }

  if (isError) {
    return (
      <PageLayout>
        <div className="container mx-auto px-4 py-16 text-center">
          <h2 className="text-2xl font-bold mb-4 text-red-600">Error Loading Product</h2>
          <p className="mb-8">Could not fetch product details: {error?.message || 'Unknown error'}</p>
          <Link to="/products">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Products
            </Button>
          </Link>
        </div>
      </PageLayout>
    );
  }

  if (!product) {
    return (
      <PageLayout>
        <div className="container mx-auto px-4 py-16 text-center">
          <h2 className="text-2xl font-bold mb-4">Product Not Found</h2>
          <p className="mb-8">The product you're looking for doesn't exist or couldn't be loaded.</p>
          <Link to="/products">
            <Button>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Products
            </Button>
          </Link>
        </div>
      </PageLayout>
    );
  }

  const discountPercentage = product.discountPrice
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;

  const isDiscountActive = product.discountPrice && timeRemaining;

  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-8">
        <nav className="flex mb-6 text-sm">
          <ol className="flex items-center flex-wrap">
            <li className="flex items-center">
              <Link to="/" className="text-gray-500 hover:text-brand-primary">
                Home
              </Link>
              <span className="mx-2">/</span>
            </li>
            <li className="flex items-center">
              <Link to="/products" className="text-gray-500 hover:text-brand-primary">
                All Products
              </Link>
              <span className="mx-2">/</span>
            </li>
            {product.category && (
              <li className="flex items-center">
                <Link 
                  to={`/category/${product.category.slug}`} 
                  className="text-gray-500 hover:text-brand-primary"
                >
                  {product.category.name}
                </Link>
                <span className="mx-2">/</span>
              </li>
            )}
            <li>
              <span className="text-gray-800">{product.title}</span>
            </li>
          </ol>
        </nav>

        <div className="flex flex-col lg:flex-row gap-8 mb-12">
          <div className="w-full lg:w-1/2">
            <div className="mb-4 aspect-square overflow-hidden rounded-lg border bg-white">
              {product.images && product.images.length > 0 ? (
                  <img
                    src={selectedImage || product.images[0]}
                    alt={product.title}
                    className="h-full w-full object-contain p-4"
                  />
              ) : (
                  <div className="h-full w-full flex items-center justify-center bg-gray-100">
                    <span className="text-gray-500">No Image Available</span>
                  </div>
              )}
            </div>
            <div className="grid grid-cols-4 gap-4">
              {product.images.map((image, idx) => (
                <button
                  key={idx}
                  className={`aspect-square rounded-md border overflow-hidden ${
                    selectedImage === image ? 'ring-2 ring-brand-primary' : ''
                  }`}
                  onClick={() => setSelectedImage(image)}
                >
                  <img
                    src={image}
                    alt={`${product.title} - Image ${idx + 1}`}
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="w-full lg:w-1/2">
            <h1 className="text-3xl font-bold mb-2">{product.title}</h1>

            <div className="flex items-center mb-4">
              <div className="flex mr-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={16}
                    className={`${
                      star <= Math.round(product.rating || 0)
                        ? 'fill-brand-accent text-brand-accent'
                        : 'fill-gray-200 text-gray-200'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-600">
                {product.rating?.toFixed(1)} ({reviews.length} reviews)
              </span>
            </div>

            <div className="mb-6">
              {isDiscountActive ? (
                <div className="flex items-center gap-2">
                  <span className="text-3xl font-bold text-brand-primary">
                    ৳{product.discountPrice}
                  </span>
                  <span className="text-lg text-gray-500 line-through">
                    ৳{product.price}
                  </span>
                  <Badge className="bg-brand-accent text-brand-dark font-medium">
                    {discountPercentage}% OFF
                  </Badge>
                </div>
              ) : (
                <span className="text-3xl font-bold text-brand-primary">
                  ৳{product.price}
                </span>
              )}
            </div>

            {isDiscountActive && timeRemaining && (
              <div className="mb-4 p-3 bg-yellow-100 border border-yellow-300 rounded-md text-yellow-800">
                <p className="font-medium text-sm text-center">
                    Offer ends in: {timeRemaining.days}d {timeRemaining.hours}h {timeRemaining.minutes}m {timeRemaining.seconds}s
                </p>
              </div>
            )}

            <p className="text-gray-600 mb-6">
                {product.description.substring(0, 150)}{product.description.length > 150 ? '...' : ''}
            </p>

            <div className="flex items-center mb-6">
              <span className="text-sm font-medium mr-4">Quantity:</span>
              <div className="flex items-center border rounded-md">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={decrementQuantity} 
                  disabled={quantity <= 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-10 text-center">{quantity}</span>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={incrementQuantity} 
                  disabled={product.stock <= quantity}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <Button 
                size="lg" 
                className="flex-1 bg-brand-primary hover:bg-brand-dark"
                onClick={handleAddToCart}
                disabled={product.stock <= 0}
              >
                <ShoppingCart className="mr-2 h-5 w-5" /> 
                {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
              </Button>
              <Button size="lg" variant="outline" className="flex-1">
                <Heart className="mr-2 h-5 w-5" /> Add to Wishlist
              </Button>
            </div>

            {product.seller && (
                <div className="text-sm text-gray-600 mb-4">
                    Sold by: <Link to={`/seller/${product.seller.id}`} className="text-brand-primary hover:underline">{product.seller.name}</Link>
                </div>
            )}

            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <TruckIcon size={18} /> Standard Delivery (3-5 days)
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck size={18} /> 1 Year Warranty Included
              </div>
            </div>

          </div>
        </div>

        <Tabs defaultValue="description">
          <TabsList className="mb-4">
            <TabsTrigger value="description">Description</TabsTrigger>
            <TabsTrigger value="reviews">Reviews ({reviews.length})</TabsTrigger>
          </TabsList>
          <TabsContent value="description">
            <div className="prose max-w-none">
              <p>{product.description}</p>
              {product.videoUrl && (
                <div className="mt-6 aspect-video">
                    <iframe 
                        width="100%" 
                        height="100%" 
                        src={product.videoUrl.replace("watch?v=", "embed/")}
                        title="Product Video" 
                        frameBorder="0" 
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                        allowFullScreen>
                    </iframe>
                </div>
              )}
            </div>
          </TabsContent>
          <TabsContent value="reviews">
            {reviews.length === 0 ? (
                <p>No reviews yet for this product.</p>
            ) : (
                <div className="space-y-6">
                    {reviews.map(review => (
                        <div key={review.id} className="border-b pb-4">
                           {/* ... Review display component ... */} 
                        </div>
                    ))}
                </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
};

export default ProductDetail;
