
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getProductBySlug, getReviewsByProductId } from '@/data/mockData';
import { Product, Review } from '@/types';
import { useCart } from '@/context/CartContext';
import PageLayout from '@/components/layout/PageLayout';
import { Button } from '@/components/ui/button';
import { 
  ShoppingCart, 
  Heart, 
  TruckIcon, 
  ShieldCheck, 
  ArrowLeft,
  Star,
  Minus,
  Plus
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

const ProductDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState<{ days: number; hours: number; minutes: number; seconds: number } | null>(null);
  const { addToCart } = useCart();
  
  // Load product and reviews
  useEffect(() => {
    if (!slug) return;

    const fetchData = () => {
      setIsLoading(true);
      try {
        // Get product by slug
        const foundProduct = getProductBySlug(slug);
        
        if (foundProduct) {
          setProduct(foundProduct);
          setSelectedImage(foundProduct.images[0]);
          
          // Get reviews for this product
          const productReviews = getReviewsByProductId(foundProduct.id);
          setReviews(productReviews);
        }
      } catch (error) {
        console.error("Error loading product:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [slug]);

  // Calculate discount countdown timer if applicable
  useEffect(() => {
    if (!product?.discountEnds) return;

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
          <p>Loading product...</p>
        </div>
      </PageLayout>
    );
  }

  if (!product) {
    return (
      <PageLayout>
        <div className="container mx-auto px-4 py-16 text-center">
          <h2 className="text-2xl font-bold mb-4">Product Not Found</h2>
          <p className="mb-8">The product you're looking for doesn't exist.</p>
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

  // Calculate discount percentage if applicable
  const discountPercentage = product.discountPrice
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;

  // Check if discount is active
  const isDiscountActive = product.discountPrice && timeRemaining;

  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
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

        {/* Product details section */}
        <div className="flex flex-col lg:flex-row gap-8 mb-12">
          {/* Product images */}
          <div className="w-full lg:w-1/2">
            <div className="mb-4 aspect-square overflow-hidden rounded-lg border bg-white">
              <img
                src={selectedImage || product.images[0]}
                alt={product.title}
                className="h-full w-full object-contain p-4"
              />
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

          {/* Product info */}
          <div className="w-full lg:w-1/2">
            <h1 className="text-3xl font-bold mb-2">{product.title}</h1>

            {/* Ratings */}
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

            {/* Price */}
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

            {/* Discount countdown */}
            {isDiscountActive && timeRemaining && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-600 mb-2">Special price ends in:</p>
                <div className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="bg-brand-primary text-white rounded p-2 w-12 text-center">
                      <span className="text-lg font-bold">{timeRemaining.days}</span>
                    </div>
                    <span className="text-xs mt-1">Days</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="bg-brand-primary text-white rounded p-2 w-12 text-center">
                      <span className="text-lg font-bold">{timeRemaining.hours}</span>
                    </div>
                    <span className="text-xs mt-1">Hours</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="bg-brand-primary text-white rounded p-2 w-12 text-center">
                      <span className="text-lg font-bold">{timeRemaining.minutes}</span>
                    </div>
                    <span className="text-xs mt-1">Minutes</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="bg-brand-primary text-white rounded p-2 w-12 text-center">
                      <span className="text-lg font-bold">{timeRemaining.seconds}</span>
                    </div>
                    <span className="text-xs mt-1">Seconds</span>
                  </div>
                </div>
              </div>
            )}

            {/* Stock status */}
            <div className="mb-6">
              <p className="text-sm text-gray-600">
                Availability: 
                <span className={`ml-2 font-medium ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {product.stock > 0 ? `In Stock (${product.stock} available)` : 'Out of Stock'}
                </span>
              </p>
            </div>

            {/* Quantity selector */}
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

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <Button
                size="lg"
                className="flex-1 bg-brand-primary hover:bg-brand-dark"
                disabled={product.stock <= 0}
                onClick={handleAddToCart}
              >
                <ShoppingCart className="mr-2 h-5 w-5" />
                Add to Cart
              </Button>
              <Button size="lg" variant="outline" className="flex-1">
                <Heart className="mr-2 h-5 w-5" />
                Add to Wishlist
              </Button>
            </div>

            {/* Seller info */}
            {product.seller && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium">Sold by:</p>
                <p className="text-brand-primary font-medium">{product.seller.name}</p>
              </div>
            )}

            {/* Shipping & return */}
            <div className="space-y-3">
              <div className="flex items-center">
                <TruckIcon className="h-5 w-5 mr-2 text-brand-primary" />
                <span className="text-sm">Free shipping for orders above ৳2000</span>
              </div>
              <div className="flex items-center">
                <ShieldCheck className="h-5 w-5 mr-2 text-brand-primary" />
                <span className="text-sm">30 days return policy</span>
              </div>
            </div>
          </div>
        </div>

        {/* Product details tabs */}
        <div className="mb-12">
          <Tabs defaultValue="description">
            <TabsList className="w-full grid grid-cols-3">
              <TabsTrigger value="description">Description</TabsTrigger>
              <TabsTrigger value="specifications">Specifications</TabsTrigger>
              <TabsTrigger value="reviews">
                Reviews ({reviews.length})
              </TabsTrigger>
            </TabsList>
            <TabsContent value="description" className="p-6 bg-white border rounded-b-lg">
              <div className="prose max-w-none">
                <p>{product.description}</p>
              </div>
            </TabsContent>
            <TabsContent value="specifications" className="p-6 bg-white border rounded-b-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="flex justify-between">
                    <span className="font-medium">Category</span>
                    <span>{product.category?.name}</span>
                  </p>
                  <Separator />
                  <p className="flex justify-between">
                    <span className="font-medium">Brand</span>
                    <span>Generic</span>
                  </p>
                  <Separator />
                  <p className="flex justify-between">
                    <span className="font-medium">Item Code</span>
                    <span>{product.id}</span>
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="flex justify-between">
                    <span className="font-medium">Weight</span>
                    <span>0.5 kg</span>
                  </p>
                  <Separator />
                  <p className="flex justify-between">
                    <span className="font-medium">Manufacturing Date</span>
                    <span>2022</span>
                  </p>
                  <Separator />
                  <p className="flex justify-between">
                    <span className="font-medium">Country of Origin</span>
                    <span>Bangladesh</span>
                  </p>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="reviews" className="p-6 bg-white border rounded-b-lg">
              {reviews.length > 0 ? (
                <div className="space-y-6">
                  {reviews.map(review => (
                    <div key={review.id} className="border-b pb-4 last:border-b-0 last:pb-0">
                      <div className="flex items-center mb-2">
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              size={16}
                              className={`${
                                star <= review.rating
                                  ? 'fill-brand-accent text-brand-accent'
                                  : 'fill-gray-200 text-gray-200'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="ml-2 text-sm font-medium">{review.user?.name}</span>
                      </div>
                      <p className="text-sm text-gray-700">{review.comment}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p>No reviews yet. Be the first to review this product!</p>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </PageLayout>
  );
};

export default ProductDetail;
