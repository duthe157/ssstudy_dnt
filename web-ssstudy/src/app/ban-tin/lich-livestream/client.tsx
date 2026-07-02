"use client";

import { useCallback, useEffect, useMemo, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import ImageWithFallback from "@/components/ui/ImageWithFallback";
import { blogService, type BlogRecord } from "@/services/blogService";
import { blogCategoryService } from "@/services/blogCategoryService";
import { GRADES } from "@/utils/constants";
import { subjectService, type SubjectRecord } from "@/services/subjectService";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination/pagination";

interface Props {
  alias: string;
}

function LivestreamContent({ alias }: Props) {
  const searchParams = useSearchParams();
  const categoryIdFromQS = searchParams?.get("category_id");
  const [resolvedCategoryId, setResolvedCategoryId] = useState<string | null>(
    categoryIdFromQS || null
  );
  const [currentCategory, setCurrentCategory] = useState<any | null>(null);

  const [records, setRecords] = useState<BlogRecord[]>([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(5);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const [activeGrade, setActiveGrade] = useState<string | null>(null);
  const [subjects, setSubjects] = useState<SubjectRecord[]>([]);
  const [activeSubject, setActiveSubject] = useState<string | number | null>(
    null
  );

  // Load subjects from API
  useEffect(() => {
    let cancelled = false;
    async function loadSubjects() {
      try {
        const res = await subjectService.list({ limit: 999, is_delete: false });
        const list = res?.data?.records || res?.records || [];
        if (!cancelled) {
          setSubjects(list);
          setActiveSubject(null); // default: no subject filter
        }
      } catch {}
    }
    loadSubjects();
    return () => {
      cancelled = true;
    };
  }, []);

  // Resolve category id by alias if not provided
  useEffect(() => {
    let cancelled = false;
    async function resolve() {
      try {
        const res = await blogCategoryService.listPublic();
        const list = res?.data?.records || [];
        const foundById = categoryIdFromQS
          ? list.find((c: any) => c?._id === categoryIdFromQS)
          : null;
        const foundByalias = list.find((c: any) => c?.alias === alias) || null;
        const found = foundById || foundByalias;
        if (!cancelled) {
          setResolvedCategoryId(found?._id || categoryIdFromQS || null);
          setCurrentCategory(found || null);
        }
      } catch {}
    }
    resolve();
    return () => {
      cancelled = true;
    };
  }, [alias, categoryIdFromQS]);

  const totalPages = useMemo(() => {
    if (!limit) return 1;
    return Math.max(1, Math.ceil((total || 0) / limit));
  }, [total, limit]);

  const loadPosts = useCallback(
    async (
      pageNum: number,
      categoryId?: string | null,
      level?: string | number | null,
      subjectId?: string | number | null
    ) => {
      setLoading(true);
      try {
        const res = await blogService.listPublic({
          keyword: null,
          limit,
          page: pageNum,
          category_id: categoryId || null,
          level: level ? String(level) : null,
          subject_id: subjectId ? String(subjectId) : null,
        });
        const data = res?.data;
        setRecords(data?.records || []);
        setTotal((data as any)?.totalRecord ?? data?.total ?? 0);
      } finally {
        setLoading(false);
      }
    },
    [limit]
  );

  useEffect(() => {
    if (!resolvedCategoryId) return;
    loadPosts(page, resolvedCategoryId, activeGrade, activeSubject);
  }, [resolvedCategoryId, page, activeGrade, activeSubject, loadPosts]);

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
    const add = (n: number) => {
      if (n > 2 && n < totalP - 1 && !middle.includes(n)) middle.push(n);
    };
    add(current - 1);
    if (!middle.includes(current)) middle.push(current);
    add(current + 1);
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
    <div className="grid grid-cols-12 gap-6">
      {/* Left filter sidebar */}
      <aside className="col-span-12 md:col-span-3">
        <div className="bg-white rounded-lg border">
          <div className="p-4 border-b font-semibold flex items-center justify-between">
            Cấp học
            <button className="text-gray-400" aria-label="toggle">
              ^
            </button>
          </div>
          <div className="p-3 grid grid-cols-2 gap-2">
            {GRADES.map((g) => (
              <button
                key={g._id}
                onClick={() => {
                  setActiveGrade((prev) => (prev === g._id ? null : g._id));
                  setPage(1);
                }}
                className={`px-3 py-1 rounded border text-sm ${
                  activeGrade === g._id
                    ? "bg-blue-50 border-blue-500 text-blue-600"
                    : "border-gray-200 hover:bg-gray-50"
                }`}
              >
                {g.name}
              </button>
            ))}
          </div>
          <div className="px-4 py-3 border-t font-semibold flex items-center justify-between">
            Môn học
            <button className="text-gray-400" aria-label="toggle">
              ^
            </button>
          </div>
          <div className="p-3 grid grid-cols-2 gap-2">
            {subjects.slice(0, 12).map((s) => {
              const sid = s._id ?? s.id!;
              return (
                <button
                  key={String(sid)}
                  onClick={() => {
                    setActiveSubject((prev) => (prev === sid ? null : sid));
                    setPage(1);
                  }}
                  className={`px-3 py-1 rounded border text-sm ${
                    activeSubject === sid
                      ? "bg-blue-50 border-blue-500 text-blue-600"
                      : "border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  {s.name}
                </button>
              );
            })}
          </div>
        </div>
      </aside>

      {/* Right content list */}
      <section className="col-span-12 md:col-span-9">
        <div className="mb-2">
          <h1 className="text-xl md:text-2xl font-bold">
            {currentCategory?.name || "Lịch livestream"}
          </h1>
        </div>
        <div className="space-y-4">
          {loading && !records.length ? (
            <div className="py-12 text-center text-gray-500">Đang tải...</div>
          ) : (
            records.map((post) => (
              <Link
                key={post._id}
                href={
                  post?.alias
                    ? `/tin-tuc/${currentCategory?.alias}/${post.alias}?id=${post._id}`
                    : "#"
                }
                className="grid grid-cols-1 md:grid-cols-12 gap-4 rounded-lg border p-3 hover:bg-gray-50 bg-white"
              >
                <div className="md:col-span-4">
                  <ImageWithFallback
                    src={post.image || "/imgs/home/banner-header-1.png"}
                    fallbackSrc="/imgs/home/banner-header-1.png"
                    alt={post.name}
                    width={480}
                    height={320}
                    className="w-full h-44 object-cover rounded"
                  />
                </div>
                <div className="md:col-span-8">
                  <h3 className="text-base md:text-lg font-semibold line-clamp-2">
                    {post.name}
                  </h3>
                  {post.description && (
                    <div
                      className="text-sm text-gray-600 mt-2 line-clamp-2"
                      dangerouslySetInnerHTML={{ __html: post.description }}
                    />
                  )}
                  <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
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
            ))
          )}
        </div>

        {/* Pagination center */}
        {totalPages > 1 && (
          <div className="mt-6 flex justify-center">
            <Pagination className="whitespace-nowrap">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (page > 1) setPage(page - 1);
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
                          setPage(p);
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
                      if (page < totalPages) setPage(page + 1);
                    }}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </section>
    </div>
  );
}

export default function LivestreamCategoryClient({ alias }: Props) {
  return (
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
      <LivestreamContent alias={alias} />
    </Suspense>
  );
}
