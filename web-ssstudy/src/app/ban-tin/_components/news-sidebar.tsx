"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import {
  blogCategoryService,
  type BlogCategoryWithCount,
} from "@/services/blogCategoryService";
import { blogService, type BlogRecord } from "@/services/blogService";
import ImageWithFallback from "@/components/ui/ImageWithFallback";

interface Props {
  currentCategory?: {
    id?: string | null;
    alias?: string | null;
    name?: string | null;
  } | null;
  recordsFallback?: BlogRecord[];
}

export default function NewsSidebar({
  currentCategory,
  recordsFallback,
}: Props) {
  const [categoriesWithCount, setCategoriesWithCount] = useState<
    BlogCategoryWithCount[]
  >([]);
  const [sidebarFeatured, setSidebarFeatured] = useState<BlogRecord[]>([]);

  useEffect(() => {
    let cancelled = false;
    blogCategoryService
      .listWithCount()
      .then((res) => {
        const records = (res?.data?.records || res?.records || []).filter(
          (c: any) => c?.status !== false
        );
        if (!cancelled) setCategoriesWithCount(records);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function loadFeatured() {
      const id = currentCategory?.id || null;
      if (!id) {
        setSidebarFeatured(recordsFallback?.slice(0, 3) || []);
        return;
      }
      try {
        const res = await blogService.featuredByCategory({
          category_id: String(id),
        });
        const list = res?.data?.records || res?.records || [];
        if (!cancelled) setSidebarFeatured(list.slice(0, 3));
      } catch {
        if (!cancelled) setSidebarFeatured(recordsFallback?.slice(0, 3) || []);
      }
    }
    loadFeatured();
    return () => {
      cancelled = true;
    };
  }, [currentCategory?.id]);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border">
        <div className="p-4 border-b font-semibold">Danh mục</div>
        <div className="p-2">
          <ul className="space-y-1">
            {categoriesWithCount.map((c) => (
              <li key={c._id}>
                <Link
                  href={`/ban-tin/${c.alias || ""}?category_id=${c._id}`}
                  className={`flex items-center justify-between px-3 py-2 rounded hover:bg-gray-50 ${
                    c._id === currentCategory?.id
                      ? "text-blue-600 font-semibold"
                      : ""
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Image
                      src="/icon/arrow.svg"
                      alt=""
                      width={14}
                      height={14}
                    />
                    {c.name}
                  </span>
                  <span className="text-xs text-gray-500">
                    ({(c as any)?.post_count ?? 0})
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="bg-white rounded-lg border">
        <div className="p-4 border-b font-semibold">Bài viết nổi bật</div>
        <div className="p-2 space-y-2">
          {(sidebarFeatured.length ? sidebarFeatured : recordsFallback || [])
            .slice(0, 3)
            .map((post) => (
              <Link
                key={post._id}
                href={
                  post?.alias
                    ? `/tin-tuc/${post?.category?.alias}/${post.alias}?id=${post._id}`
                    : "#"
                }
                className="flex items-center gap-3 p-2 rounded hover:bg-gray-50"
              >
                <ImageWithFallback
                  src={post.image || "/imgs/home/banner-header-1.png"}
                  fallbackSrc="/imgs/home/banner-header-1.png"
                  alt={post.name}
                  width={80}
                  height={60}
                  className="w-20 h-14 object-cover rounded"
                />
                <div className="text-sm">
                  <p className="font-medium line-clamp-2">{post.name}</p>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Image
                      src="/icon/calendar.svg"
                      alt=""
                      width={14}
                      height={14}
                    />
                    <span>
                      {(post?.created_at || "")
                        .substring(0, 10)
                        .split("-")
                        .reverse()
                        .join("/")}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
        </div>
      </div>
    </div>
  );
}
