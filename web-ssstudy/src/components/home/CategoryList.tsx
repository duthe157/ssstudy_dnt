'use client';

import React from 'react';
import Link from 'next/link';

interface CategoryProps {
  id: number;
  name: string;
  slug: string;
  imageUrl: string;
}

const CategoryList = ({ categories }: { categories: CategoryProps[] }) => {
  if (!categories || categories.length === 0) {
    return null;
  }

  return (
    <section className="py-10 bg-gray-50">
      <div className="container mx-auto">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Danh mục sản phẩm</h2>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {categories.map((category) => (
            <Link 
              key={category.id} 
              href={`/category/${category.slug}`}
              className="group flex flex-col items-center justify-center bg-white rounded-lg p-4 transition-all hover:shadow-md"
            >
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden mb-3">
                <img
                  src={category.imageUrl}
                  alt={category.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
              </div>
              <h3 className="text-sm md:text-base font-medium text-center text-gray-800">
                {category.name}
              </h3>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoryList; 