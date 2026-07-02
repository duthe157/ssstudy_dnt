"use client";

import { useEffect, useState } from "react";
import {
  homeService,
  HomePageData,
  HomePageResponse,
} from "@/services/homeService";

export function HomePage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<HomePageData | null>(null);

  useEffect(() => {
    async function fetchHomeData() {
      try {
        setLoading(true);
        const response = await homeService.getHomePageData();
        if (response && response.data && response.code === 200) {
          setData({
            banners: response.data.banners || [],
            featuredProducts: response.data.featuredProducts || [],
            categories: response.data.categories || [],
          });
          setError(null);
        } else {
          throw new Error("Dữ liệu không hợp lệ");
        }
      } catch (err) {
        console.error("Lỗi khi tải dữ liệu trang chủ:", err);
        setError("Không thể tải dữ liệu trang chủ. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    }

    fetchHomeData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 p-4">
        <p>{error}</p>
        <button
          className="mt-4 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/80"
          onClick={() => window.location.reload()}
        >
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Banner Section */}
      {data?.banners && data.banners.length > 0 && (
        <section className="mb-10">
          <h2 className="text-2xl font-bold mb-4">Banners</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.banners.map((banner) => (
              <a
                key={banner.id}
                href={banner.link}
                className="block overflow-hidden rounded-lg shadow-md hover:shadow-lg transition-shadow"
              >
                <img
                  src={banner.imageUrl}
                  alt={banner.title}
                  className="w-full h-auto object-cover"
                />
              </a>
            ))}
          </div>
        </section>
      )}

      {/* Featured Products Section */}
      {data?.featuredProducts && data.featuredProducts.length > 0 && (
        <section className="mb-10">
          <h2 className="text-2xl font-bold mb-4">Sản phẩm nổi bật</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {data.featuredProducts.map((product) => (
              <div
                key={product.id}
                className="rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow"
              >
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <h3 className="font-medium text-lg mb-2">{product.name}</h3>
                  <p className="text-primary font-bold">
                    {new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    }).format(product.price)}
                  </p>
                  <button className="mt-3 w-full py-2 bg-primary text-white rounded-md hover:bg-primary/80 transition-colors">
                    Xem chi tiết
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Categories Section */}
      {data?.categories && data.categories.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold mb-4">Danh mục sản phẩm</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {data.categories.map((category) => (
              <a
                key={category.id}
                href={`/categories/${category.slug}`}
                className="group block p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div className="w-16 h-16 mx-auto mb-3 rounded-full overflow-hidden">
                  <img
                    src={category.imageUrl}
                    alt={category.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                  />
                </div>
                <h3 className="text-center font-medium">{category.name}</h3>
              </a>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
