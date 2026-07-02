import { Suspense } from 'react';
import CategoryBreadcrumbClient from '../_components/category-breadcrumb-client';
import LivestreamCategoryClient from './client';

export default function LivestreamCategoryPage() {
  const alias = "lich-livestream";
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        <Suspense
          fallback={<div className="text-center py-8">Đang tải...</div>}
        >
          <CategoryBreadcrumbClient alias={alias} />
          <LivestreamCategoryClient alias={alias} />
        </Suspense>
      </div>
    </div>
  );
}
