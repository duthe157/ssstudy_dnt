"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  blogCategoryService,
  type BlogCategoryRecord,
  type BlogCategoryWithCount,
} from "@/services/blogCategoryService";
import { blogService, type BlogRecord } from "@/services/blogService";
import Image from "next/image";
import ImageWithFallback from "@/components/ui/ImageWithFallback";
import Link from "next/link";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination/pagination";
import { useSearchParams } from "next/navigation";

interface Props {
  alias: string;
}

export default function CategoryPageClient({ alias }: Props) {
  const searchParams = useSearchParams();
  const categoryIdFromQS = searchParams?.get("category_id");
  const [categories, setCategories] = useState<BlogCategoryRecord[]>([]);
  const [categoriesWithCount, setCategoriesWithCount] = useState<
    BlogCategoryWithCount[]
  >([]);
  const [currentCategory, setCurrentCategory] =
    useState<BlogCategoryRecord | null>(null);
  const [records, setRecords] = useState<BlogRecord[]>([]);
  const [featured, setFeatured] = useState<BlogRecord[]>([]);
  const [sidebarFeatured, setSidebarFeatured] = useState<BlogRecord[]>([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(5);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  // Load categories once
  useEffect(() => {
    let cancelled = false;
    async function loadCats() {
      try {
        const res = await blogCategoryService.listPublic();
        const list = (res?.data?.records || []).filter(
          (c) => c?.status !== false
        );
        if (cancelled) return;
        setCategories(list);
        const foundByalias = list.find((c) => c.alias === alias) || null;
        const foundById = categoryIdFromQS
          ? list.find((c) => c._id === categoryIdFromQS) || null
          : null;
        setCurrentCategory(foundById || foundByalias);
      } catch {}
    }
    loadCats();
    return () => {
      cancelled = true;
    };
  }, [alias, categoryIdFromQS]);

  // Load categories with count for sidebar
  useEffect(() => {
    let cancelled = false;
    async function loadCounts() {
      try {
        const res = await blogCategoryService.listWithCount();
        const records = (res?.data?.records || res?.records || []).filter(
          (c: any) => c?.status !== false
        );
        if (!cancelled) setCategoriesWithCount(records);
      } catch {}
    }
    loadCounts();
    return () => {
      cancelled = true;
    };
  }, []);

  const totalPages = useMemo(() => {
    if (!limit) return 1;
    return Math.max(1, Math.ceil((total || 0) / limit));
  }, [total, limit]);

  // Reset page when category changes from URL or alias
  useEffect(() => {
    setPage(1);
  }, [alias, categoryIdFromQS]);

  const loadPosts = useCallback(async (pageNum: number, categoryId?: string | null) => {
    setLoading(true);
    try {
      const res = await blogService.listPublic({ keyword: null, limit, page: pageNum, category_id: categoryId || null });
      const data = res?.data;
   
      setRecords(data?.records || []);
      setTotal(((data as any)?.totalRecord ?? data?.total ?? 0));
    } finally {
      setLoading(false);
    }
  }, [limit]);

  const loadFeatured = useCallback(async (categoryId?: string | null) => {
    try {
      if (!categoryId) {
        setFeatured([]);
        return;
      }
      const res = await blogService.latestByCategory({
        category_id: categoryId,
      });
      const list = res?.data?.records || [];
      setFeatured(list);
    } catch {}
  }, []);

  const loadSidebarFeatured = useCallback(
    async (categoryId?: string | null) => {
      try {
        if (!categoryId) {
          setSidebarFeatured([]);
          return;
        }
        const res = await blogService.featuredByCategory({
          category_id: categoryId,
        });
        const list = res?.data?.records || res?.records || [];
        setSidebarFeatured(list.slice(0, 3));
      } catch {}
    },
    []
  );

  // Load posts whenever alias/page changes and category is resolved
  useEffect(() => {
    if (!categories.length) return;
    const catById = categoryIdFromQS
      ? categories.find((c) => c._id === categoryIdFromQS)
      : null;
    const cat = catById || categories.find((c) => c.alias === alias) || null;
    setCurrentCategory(cat);
    const resolvedId = cat?._id || categoryIdFromQS || null;
    loadPosts(page, resolvedId);
    loadFeatured(resolvedId);
    loadSidebarFeatured(resolvedId);
  }, [
    alias,
    categoryIdFromQS,
    categories,
    page,
    loadPosts,
    loadFeatured,
    loadSidebarFeatured,
  ]);

  const onPageChange = (p: number) => setPage(p);

  function buildPages(current: number, totalP: number): (number | string)[] {
    const pages: (number | string)[] = [];
    if (totalP <= 8) {
      for (let i = 1; i <= totalP; i++) pages.push(i);
      return pages;
    }

    pages.push(1);
    if (current > 2) pages.push(2);
    if (current > 3) pages.push("...");

    const middle: number[] = [];
    const addIfValid = (n: number) => {
      if (n > 2 && n < totalP - 1 && !middle.includes(n)) middle.push(n);
    };
    addIfValid(current - 1);
    // always include current (even when it is 2 or totalP-1 we already handled above)
    if (!middle.includes(current)) middle.push(current);
    addIfValid(current + 1);
    for (const m of middle.sort((a, b) => a - b))
      if (!pages.includes(m)) pages.push(m);

    if (current < totalP - 3) pages.push("...");

    pages.push(totalP - 1, totalP);
    return pages.filter((v, i, self) => self.indexOf(v) === i);
  }

  function formatDate(input?: string) {
    if (!input) return "";
    const head = input.substring(0, 10);
    if (/^\d{4}-\d{2}-\d{2}$/.test(head)) {
      const [y, m, d] = head.split("-");
      return `${d}/${m}/${y}`;
    }
    const d = new Date(input);
    if (isNaN(d.getTime())) return head.replaceAll("-", "/");
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yy = String(d.getFullYear());
    return `${dd}/${mm}/${yy}`;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Featured grid full width */}
      <div className="lg:col-span-12">
        {/* Featured grid on top: show first 4 posts in a 2x2 with larger first */}
        {loading && featured.length === 0 ? (
          <div className="py-12 text-center text-gray-500">Đang tải...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Left: big feature (col-span-2) */}
            {(() => {
              const items = featured.length ? featured : records;
              const first = items[0];
              if (!first) return null;
              return (
                <Link
                  key={first._id}
                  href={
                    first?.alias
                      ? `/tin-tuc/${currentCategory?.alias}/${first.alias}?id=${first._id}`
                      : "#"
                  }
                  className="relative md:col-span-2 group block overflow-hidden rounded-lg"
                >
                  <ImageWithFallback
                    src={first.image || "/imgs/home/banner-header-1.png"}
                    fallbackSrc="/imgs/home/banner-header-1.png"
                    alt={first.name}
                    width={1200}
                    height={600}
                    className="w-full h-60 md:h-80 object-cover group-hover:scale-[1.02] transition-transform"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <div className="absolute bottom-0 p-4 text-white">
                    <div className="flex items-center gap-2 text-sm opacity-90">
                      <Image
                        src="/icon/calendar.svg"
                        alt=""
                        width={14}
                        height={14}
                      />
                      <span>{formatDate(first?.created_at)}</span>
                    </div>
                    <h3 className="text-lg md:text-xl font-semibold line-clamp-2">
                      {first.name}
                    </h3>
                  </div>
                </Link>
              );
            })()}

            {/* Right column: top large, bottom two small */}
            {(() => {
              const items = featured.length ? featured : records;
              const second = items[1];
              const third = items[2];
              const fourth = items[3];
              return (
                <div className="grid gap-4">
                  {second ? (
                    <Link
                      key={second._id}
                      href={
                        second?.alias
                          ? `/tin-tuc/${currentCategory?.alias}/${second.alias}?id=${second._id}`
                          : "#"
                      }
                      className="relative group block overflow-hidden rounded-lg"
                    >
                      <ImageWithFallback
                        src={second.image || "/imgs/home/banner-header-1.png"}
                        fallbackSrc="/imgs/home/banner-header-1.png"
                        alt={second.name}
                        width={800}
                        height={400}
                        className="w-full h-40 md:h-80 object-cover group-hover:scale-[1.02] transition-transform"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                      <div className="absolute bottom-0 p-3 text-white">
                        <div className="flex items-center gap-1 text-xs opacity-90">
                          <Image
                            src="/icon/calendar.svg"
                            alt=""
                            width={12}
                            height={12}
                          />
                          <span>{formatDate(second?.created_at)}</span>
                        </div>
                        <h3 className="text-base font-semibold line-clamp-2">
                          {second.name}
                        </h3>
                      </div>
                    </Link>
                  ) : null}

                  <div className="grid grid-cols-2 gap-4">
                    {third ? (
                      <Link
                        key={third._id}
                        href={
                          third?.alias
                            ? `/tin-tuc/${currentCategory?.alias}/${third.alias}?id=${third._id}`
                            : "#"
                        }
                        className="relative group block overflow-hidden rounded-lg"
                      >
                        <ImageWithFallback
                          src={third.image || "/imgs/home/banner-header-1.png"}
                          fallbackSrc="/imgs/home/banner-header-1.png"
                          alt={third.name}
                          width={400}
                          height={300}
                          className="w-full h-32 md:h-40 object-cover group-hover:scale-[1.02] transition-transform"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                        <div className="absolute bottom-0 p-2 text-white">
                          <div className="flex items-center gap-1 text-[10px] opacity-90">
                            <Image
                              src="/icon/calendar.svg"
                              alt=""
                              width={10}
                              height={10}
                            />
                            <span>{formatDate(third?.created_at)}</span>
                          </div>
                          <h3 className="text-sm font-semibold line-clamp-2">
                            {third.name}
                          </h3>
                        </div>
                      </Link>
                    ) : null}

                    {fourth ? (
                      <Link
                        key={fourth._id}
                        href={
                          fourth?.alias
                            ? `/tin-tuc/${currentCategory?.alias}/${fourth.alias}?id=${fourth._id}`
                            : "#"
                        }
                        className="relative group block overflow-hidden rounded-lg"
                      >
                        <ImageWithFallback
                          src={fourth.image || "/imgs/home/banner-header-1.png"}
                          fallbackSrc="/imgs/home/banner-header-1.png"
                          alt={fourth.name}
                          width={400}
                          height={300}
                          className="w-full h-32 md:h-40 object-cover group-hover:scale-[1.02] transition-transform"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                        <div className="absolute bottom-0 p-2 text-white">
                          <div className="flex items-center gap-1 text-[10px] opacity-90">
                            <Image
                              src="/icon/calendar.svg"
                              alt=""
                              width={10}
                              height={10}
                            />
                            <span>{formatDate(fourth?.created_at)}</span>
                          </div>
                          <h3 className="text-sm font-semibold line-clamp-2">
                            {fourth.name}
                          </h3>
                        </div>
                      </Link>
                    ) : null}
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </div>

      <div className="lg:col-span-9 space-y-6">
        <div className="rounded-lg overflow-hidden">
          {/* <br></br> */}
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl md:text-2xl font-bold">
              {currentCategory?.name || "Danh mục"}
            </h1>
          </div>
          {/* List section */}
          <div className="mt-6 space-y-4">
            {records.map((post) => (
              <Link
                key={post._id}
                href={
                  post?.alias
                    ? `/tin-tuc/${currentCategory?.alias}/${post.alias}?id=${post._id}`
                    : "#"
                }
                className="grid grid-cols-1 md:grid-cols-12 gap-4 rounded-lg border p-3 hover:bg-gray-50"
              >
                <div className="md:col-span-3">
                  <ImageWithFallback
                    src={post.image || "/imgs/home/banner-header-1.png"}
                    fallbackSrc="/imgs/home/banner-header-1.png"
                    alt={post.name}
                    width={400}
                    height={250}
                    className="w-full h-40 object-cover rounded"
                  />
                </div>
                <div className="md:col-span-9">
                  <h3 className="text-base md:text-lg font-semibold line-clamp-2">
                    {post.name}
                  </h3>
                  <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
                    <Image
                      src="/icon/calendar.svg"
                      alt=""
                      width={14}
                      height={14}
                    />
                    <span>{formatDate(post?.created_at)}</span>
                  </div>
                  {post.description && (
                    <div
                      className="text-sm text-gray-600 mt-2 line-clamp-2"
                      dangerouslySetInnerHTML={{ __html: post.description }}
                    />
                  )}
                </div>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex justify-center">
              <Pagination className="whitespace-nowrap">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (page > 1) onPageChange(page - 1);
                      }}
                    />
                  </PaginationItem>
                  {buildPages(page, totalPages).map((p, idx) =>
                    typeof p === "string" ? (
                      <PaginationEllipsis key={`e-${idx}`} />
                    ) : (
                      <PaginationItem key={p}>
                        <PaginationLink
                          href="#"
                          isActive={p === page}
                          onClick={(e) => {
                            e.preventDefault();
                            onPageChange(p);
                          }}
                        >
                          {p}
                        </PaginationLink>
                      </PaginationItem>
                    )
                  )}
                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (page < totalPages) onPageChange(page + 1);
                      }}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </div>
      </div>

      {/* Sidebar */}
      <div className="lg:col-span-3 space-y-6">
        <div className="bg-white rounded-lg border">
          <div className="p-4 border-b font-semibold">Danh mục</div>
          <div className="p-2">
            <ul className="space-y-1">
              {categoriesWithCount.map((c) => (
                <li key={c._id}>
                  <Link
                    href={`/ban-tin/${c.alias || ""}?category_id=${c._id}`}
                    className={`flex items-center justify-between px-3 py-2 rounded hover:bg-gray-50 ${
                      c._id === currentCategory?._id
                        ? "text-blue-600 font-semibold"
                        : ""
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      {/* <span className={`inline-flex items-center justify-center w-4 h-4 rounded-full border ${c._id === currentCategory?._id ? 'border-blue-500 text-blue-500' : 'border-gray-300 text-gray-400'}`}>○</span> */}
                      <Image
                        src="/icon/arrow.svg"
                        alt=""
                        width={14}
                        height={14}
                      />
                      {c.name}
                    </span>
                    <span className="text-xs text-gray-500">
                      ({c.post_count ?? 0})
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Featured posts in sidebar (API: featured-by-category) */}
        <div className="bg-white rounded-lg border">
          <div className="p-4 border-b font-semibold">Bài viết nổi bật</div>
          <div className="p-2 space-y-2">
            {(sidebarFeatured.length
              ? sidebarFeatured
              : records.slice(0, 3)
            ).map((post) => (
              <Link
                key={post._id}
                href={
                  post?.alias
                    ? `/tin-tuc/${currentCategory?.alias}/${post.alias}?id=${post._id}`
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
                    <span>{formatDate(post?.created_at)}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
