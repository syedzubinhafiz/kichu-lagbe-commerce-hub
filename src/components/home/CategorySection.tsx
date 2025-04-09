
import React from 'react';
import { Link } from 'react-router-dom';
import { Category } from '@/types';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CategorySectionProps {
  categories: Category[];
}

const CategorySection = ({ categories }: CategorySectionProps) => {
  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl md:text-3xl font-bold">Shop by Category</h2>
          <Link to="/categories">
            <Button variant="ghost" className="flex items-center gap-2 text-brand-primary">
              View All <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {categories.map((category) => (
            <Link 
              to={`/category/${category.slug}`}
              key={category.id}
              className="group rounded-lg overflow-hidden bg-white border border-gray-200 shadow-sm transition-all duration-300 hover:shadow-md"
            >
              <div className="relative pt-[100%] bg-gray-100">
                <img
                  src={category.image}
                  alt={category.name}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
              </div>
              <div className="p-4 text-center">
                <h3 className="font-medium">{category.name}</h3>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategorySection;
