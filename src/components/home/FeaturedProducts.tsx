
import React from 'react';
import { Link } from 'react-router-dom';
import { Product } from '@/types';
import ProductGrid from '@/components/products/ProductGrid';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FeaturedProductsProps {
  products: Product[];
  title: string;
  viewAllLink: string;
}

const FeaturedProducts = ({ products, title, viewAllLink }: FeaturedProductsProps) => {
  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl md:text-3xl font-bold">{title}</h2>
          <Link to={viewAllLink}>
            <Button variant="ghost" className="flex items-center gap-2 text-brand-primary">
              View All <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        <ProductGrid products={products} columns={4} />
      </div>
    </section>
  );
};

export default FeaturedProducts;
