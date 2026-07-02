import { Suspense } from "react";
import CategoryBreadcrumbClient from "../_components/category-breadcrumb-client";
import CategoryPageClient from "../_components/category-page-client";

interface PageProps {
  params: { alias: string };
  searchParams: { [key: string]: string | string[] | undefined };
}

export default function BlogCategoryPage({ params, searchParams }: PageProps) {
  const { alias } = params;
  const categoryId =
    typeof searchParams?.category_id === "string"
      ? searchParams.category_id
      : "";
  const currentCategoryHref = `/ban-tin/${alias}${
    categoryId ? `?category_id=${categoryId}` : ""
  }`;
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        <CategoryBreadcrumbClient alias={alias} />
        <Suspense
          fallback={
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Đang tải...</p>
              </div>
            </div>
          }
        >
          <CategoryPageClient alias={alias} />
        </Suspense>
      </div>
    </div>
  );
}
