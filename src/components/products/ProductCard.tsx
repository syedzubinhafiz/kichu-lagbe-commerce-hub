import React from 'react';
import { Link } from 'react-router-dom';
import { Product } from '@/types';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
  className?: string;
}

const ProductCard = ({ product, className }: ProductCardProps) => {
  const { addToCart } = useCart();

  // Calculate discount percentage if there's a discount price
  const discountPercentage = product.discountPrice
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;

  // Check if discount period is active
  const isDiscountActive = product.discountPrice && product.discountEnds
    ? new Date(product.discountEnds) > new Date()
    : false;

  return (
    <div className={cn("group rounded-lg border bg-card overflow-hidden transition-all duration-300 hover:shadow-md", className)}>
      <div className="relative overflow-hidden pt-[56.25%]">
        {/* Product image */}
        <Link to={`/product/${product.slug}`}>
          {product.images && product.images.length > 0 ? (
            <img
              src={product.images[0]}
              alt={product.title}
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            // Optional: Render a placeholder if no image
            <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
              <span className="text-gray-500 text-sm">No Image</span>
            </div>
          )}
        </Link>

        {/* Discount badge */}
        {isDiscountActive && discountPercentage > 0 && (
          <Badge className="absolute left-2 top-2 bg-brand-accent text-brand-dark font-medium">
            {discountPercentage}% Off
          </Badge>
        )}

        {/* Quick add button */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 translate-y-full transition-transform duration-300 group-hover:translate-y-0">
          <Button 
            size="sm" 
            className="w-full bg-white text-black hover:bg-brand-accent" 
            onClick={() => addToCart(product)}
          >
            <ShoppingCart className="mr-2 h-4 w-4" /> Quick Add
          </Button>
        </div>
      </div>

      <div className="p-4">
        <Link to={`/product/${product.slug}`}>
          <h3 className="font-medium line-clamp-2 min-h-[2.5rem] hover:text-brand-primary transition-colors">
            {product.title}
          </h3>
        </Link>
        
        <div className="mt-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isDiscountActive ? (
              <>
                <span className="font-bold text-brand-primary">৳{product.discountPrice}</span>
                <span className="text-sm text-gray-500 line-through">৳{product.price}</span>
              </>
            ) : (
              <span className="font-bold text-brand-primary">৳{product.price}</span>
            )}
          </div>
          
          {product.rating && (
            <div className="flex items-center text-sm text-brand-accent">
              <span>★</span>
              <span className="ml-1 text-gray-700">{product.rating.toFixed(1)}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
