"use client";

import React from "react";
import { Skeleton } from "./Skeleton";

export const BannerSkeleton = () => (
  <div className="w-full h-80 bg-gray-200 animate-pulse rounded-lg"></div>
);

export const ProductSkeleton = () => (
  <div className="bg-white rounded-lg shadow-md p-4 animate-pulse">
    <div className="aspect-w-1 aspect-h-1 w-full bg-gray-300 rounded-md mb-4"></div>
    <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
    <div className="h-6 bg-gray-300 rounded w-1/2"></div>
  </div>
);

export const CategorySkeleton = () => (
  <div className="flex flex-col items-center animate-pulse">
    <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gray-300 mb-3"></div>
    <div className="h-4 bg-gray-300 rounded w-20"></div>
  </div>
);

export const FeaturedProductsSkeleton = () => (
  <section className="py-10">
    <div className="container mx-auto">
      <div className="h-6 bg-gray-300 rounded w-48 mb-6"></div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {Array(4)
          .fill(0)
          .map((_, index) => (
            <ProductSkeleton key={index} />
          ))}
      </div>
    </div>
  </section>
);

export const CategoryListSkeleton = () => (
  <section className="py-10 bg-gray-50">
    <div className="container mx-auto">
      <div className="h-6 bg-gray-300 rounded w-48 mb-6"></div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {Array(5)
          .fill(0)
          .map((_, index) => (
            <CategorySkeleton key={index} />
          ))}
      </div>
    </div>
  </section>
);

export const InterviewCardSkeleton = () => {
  return (
    <div className="w-full">
      <Skeleton className="w-full aspect-[280/203] rounded-t-md" />

      <div className="flex flex-col gap-4 p-4 border border-border border-t-0 rounded-b-md">
        <div className="flex items-center gap-4">
          <Skeleton className="size-[58px] rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>
      </div>
    </div>
  );
};
