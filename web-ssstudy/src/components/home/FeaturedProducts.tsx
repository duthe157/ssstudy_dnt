'use client';

import React from 'react';
import Link from 'next/link';

interface ProductProps {
  id: number;
  name: string;
  price: number;
  imageUrl: string;
  slug: string;
}

const FeaturedProducts = ({ products }: { products: ProductProps[] }) => {
  if (!products || products.length === 0) {
    return null;
  }

  return (
    <section className="py-10">
      <div className="container mx-auto">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Sản phẩm nổi bật</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <div key={product.id} className="group">
              <div className="relative overflow-hidden rounded-lg bg-white shadow-md hover:shadow-lg transition-all duration-300">
                <Link href={`/product/${product.slug}`}>
                  <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden">
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="text-sm font-medium text-gray-900 truncate">{product.name}</h3>
                    <p className="mt-2 text-lg font-semibold text-blue-600">
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price)}
                    </p>
                  </div>
                </Link>
                <button className="absolute bottom-4 right-4 rounded-full bg-blue-600 p-2 text-white shadow-sm hover:bg-blue-700 focus:outline-none">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts; 