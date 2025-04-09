
import React from 'react';
import { Product } from '@/types';
import ProductCard from '@/components/products/ProductCard';

interface ProductGridProps {
  products: Product[];
  columns?: number;
}

const ProductGrid = ({ products, columns = 4 }: ProductGridProps) => {
  // Determine grid columns based on prop
  const gridColsClass = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
    5: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5',
  }[columns] || 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4';

  if (!products || products.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-lg text-gray-500">No products found</p>
      </div>
    );
  }

  return (
    <div className={`grid ${gridColsClass} gap-6`}>
      {products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};

export default ProductGrid;
