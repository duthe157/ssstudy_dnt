"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { blogService, type BlogRecord } from "@/services/blogService";
import { blogCategoryService } from "@/services/blogCategoryService";

export type NewsItem = {
  id: string;
  title: string;
  image: string;
  date: string; // dd/MM/yyyy
  href?: string;
  categoryId?: string;
  postalias?: string;
};

export interface NewsEventsProps {
  news?: NewsItem[];
  events?: NewsItem[];
  className?: string;
}

const demoNews: NewsItem[] = [];
const demoEvents: NewsItem[] = [];

const TabButton: React.FC<{
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}> = ({ active, onClick, children }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-4 py-2 text-sm font-semibold border-b-2 transition-colors ${
        active
          ? "border-primary text-primary"
          : "border-transparent text-gray-500 hover:text-gray-700"
      }`}
    >
      {children}
    </button>
  );
};

const formatDate = (input: string) => input; // already in dd/MM/yyyy

function toVNDate(dateIso?: string): string {
  if (!dateIso) return "";
  const d = new Date(dateIso);
  if (Number.isNaN(d.getTime())) return "";
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

function mapBlogToNewsItemsWithCategory(records: BlogRecord[]): NewsItem[] {
  return records.map((r) => ({
    id: r._id,
    title: r.name,
    image: r.image || "/imgs/home/teacher.png",
    date: toVNDate(r.created_at),
    categoryId: (r as any)?.category?._id || (r as any)?.category?.id,
    postalias: r.alias,
  }));
}

const NewsEvents: React.FC<NewsEventsProps> = ({ news, events, className }) => {
  const [tab, setTab] = useState<"news" | "events">("news");
  const [featuredIndex, setFeaturedIndex] = useState(0);
  const [page, setPage] = useState(0);
  const [remoteNews, setRemoteNews] = useState<NewsItem[] | null>(null);
  const [rightGroups, setRightGroups] = useState<
    {
      category: { id?: string; name: string; alias?: string };
      items: NewsItem[];
    }[]
  >([]);
  const [rightActiveIndex, setRightActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Combined load from a single API
  useEffect(() => {
    let cancelled = false;
    async function loadCombined() {
      try {
        const res = await blogService.topCategoriesPosts({
          status: true,
          limit: 10,
        });
        const data = (res as any)?.data || {};

        // Left list
        const leftRecords: BlogRecord[] = Array.isArray(data?.records)
          ? (data.records as BlogRecord[])
          : Array.isArray(data?.leftData)
          ? (data.leftData as BlogRecord[])
          : [];
        const leftItems = mapBlogToNewsItemsWithCategory(leftRecords);
        if (!cancelled) setRemoteNews(leftItems);

        // Right grouped list
        const groupsRaw: any[] = Array.isArray(data?.groups)
          ? (data.groups as any[])
          : Array.isArray(data?.rightData)
          ? (data.rightData as any[])
          : [];
        const mapped = groupsRaw.map((g: any) => ({
          category: {
            id: g?.category?.id,
            name: g?.category?.name,
            alias: g?.category?.alias,
          },
          items: mapBlogToNewsItemsWithCategory(
            (g?.posts || []) as BlogRecord[]
          ),
        }));
        if (!cancelled) setRightGroups(mapped);
      } catch (e) {
        // swallow to keep demo data
      }
    }
    loadCombined();
    return () => {
      cancelled = true;
    };
  }, []);

  const lists = useMemo(
    () => ({
      news:
        remoteNews && remoteNews.length
          ? remoteNews
          : news && news.length
          ? news
          : demoNews,
      events: events && events.length ? events : demoEvents,
    }),
    [news, events, remoteNews]
  );

  const currentList = tab === "news" ? lists.news : lists.events;
  const safeIndex = Math.min(
    featuredIndex,
    Math.max(0, currentList.length - 1)
  );
  const featured = currentList[safeIndex];
  const thumbs = currentList;
  // Auto-advance featured and keep thumbnails in view
  useEffect(() => {
    if (!currentList || currentList.length <= 1 || isPaused) return;
    const timer = setInterval(() => {
      setFeaturedIndex((idx) => (idx + 1) % currentList.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [currentList, tab, isPaused]);

  const thumbsContainerRef = useRef<HTMLDivElement | null>(null);
  const prevIndexRef = useRef<number>(safeIndex);

  useEffect(() => {
    const container = thumbsContainerRef.current;
    if (!container) return;
    const el = container.querySelector(
      `[data-thumb-index="${safeIndex}"]`
    ) as HTMLElement | null;
    if (el) {
      const targetLeft = Math.max(
        0,
        el.offsetLeft -
          Math.max(0, (container.clientWidth - el.clientWidth) / 2)
      );
      container.scrollTo({ left: targetLeft, behavior: "smooth" });
    }
  }, [safeIndex, tab, currentList.length]);

  // If we wrapped from last -> first, scroll track back to start smoothly
  useEffect(() => {
    const container = thumbsContainerRef.current;
    if (!container) return;
    const wasLast =
      prevIndexRef.current === Math.max(0, currentList.length - 1);
    if (safeIndex === 0 && wasLast) {
      container.scrollTo({ left: 0, behavior: "smooth" });
    }
    prevIndexRef.current = safeIndex;
  }, [safeIndex, currentList.length]);

  function onThumbsScroll(e: React.UIEvent<HTMLDivElement>) {
    // Only handle reset when user is actively interacting (paused state)
    if (!isPaused) return;
    const el = e.currentTarget;
    const threshold = 8; // px
    if (el.scrollLeft + el.clientWidth >= el.scrollWidth - threshold) {
      // reached end → reset to start
      setTimeout(() => {
        el.scrollTo({ left: 0, behavior: "smooth" });
        setFeaturedIndex(0);
      }, 150);
    }
  }

  // Pagination for the right list (max 4 items per page)
  const pageSize = 4;
  const rightRaw = rightGroups[rightActiveIndex]?.items || [];
  const totalPages = Math.max(1, Math.ceil(rightRaw.length / pageSize));
  const currentPage = Math.min(page, totalPages - 1);
  const pagedRightList = rightRaw.slice(
    currentPage * pageSize,
    currentPage * pageSize + pageSize
  );
  const placeholderCount = Math.max(0, pageSize - pagedRightList.length);

  function goPrev() {
    setPage((p) => Math.max(0, Math.min(totalPages - 1, p - 1)));
  }

  function goNext() {
    setPage((p) => Math.max(0, Math.min(totalPages - 1, p + 1)));
  }

  function goTo(idx: number) {
    setPage(Math.max(0, Math.min(totalPages - 1, idx)));
  }

  return (
    <section
      className={`w-full mt-10 ${className || ""}`}
    >
      <div className="max-w-[1440px] mx-auto px-8 sm:px-12 lg:px-16">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 text-center">
          Tin tức và sự kiện
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Featured (left) */}
        <div className="lg:col-span-8 flex flex-col h-full">
          <div className="relative w-full overflow-hidden rounded-xl aspect-video sm:aspect-[4/3] lg:aspect-[16/9]">
            {featured && (
              <>
                <Image
                  src={featured.image}
                  alt={featured.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 66vw"
                  priority
                />
                <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/80 via-black/70 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 text-white">
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        let alias = "";
                        if (featured.categoryId) {
                          const det = await blogCategoryService.detail({
                            id: String(featured.categoryId),
                          });
                          alias = det?.data?.alias || "";
                        }
                        if (alias && featured.postalias) {
                          window.location.href = `/${alias}/${featured.postalias}`;
                        }
                      } catch {}
                    }}
                    className="block text-left"
                  >
                    <h3 className="text-lg md:text-2xl font-semibold leading-snug">
                      {featured.title}
                    </h3>
                  </button>
                  <div className="mt-2 flex items-center gap-2 text-sm opacity-90">
                    <Image
                      src="/icon/time.svg"
                      alt="date"
                      width={16}
                      height={16}
                    />
                    <span>{formatDate(featured.date)}</span>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Thumbnails (auto-slide + swipe, loop to start) */}
          <div
            ref={thumbsContainerRef}
            onScroll={onThumbsScroll}
            onPointerDown={() => setIsPaused(true)}
            onPointerUp={() => setIsPaused(false)}
            onPointerCancel={() => setIsPaused(false)}
            onPointerLeave={() => setIsPaused(false)}
            className="mt-4 flex gap-3 overflow-x-auto snap-x snap-mandatory"
          >
            {thumbs.map((it, idx) => (
              <button
                key={it.id}
                type="button"
                data-thumb-index={idx}
                onClick={() => setFeaturedIndex(idx)}
                className={`relative flex-shrink-0 w-40 aspect-[4/3] rounded-lg overflow-hidden transition-transform snap-start ${
                  idx === safeIndex ? "" : "hover:opacity-90"
                }`}
                aria-label={`Xem: ${it.title}`}
                tabIndex={-1}
              >
                <Image
                  src={it.image}
                  alt={it.title}
                  fill
                  className="object-cover"
                />
                {idx === safeIndex && (
                  <div className="absolute inset-0 bg-white/60" aria-hidden />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* List (right) */}
        <div className="lg:col-span-4 flex flex-col h-full min-h-0">
          <div className="mb-4 flex justify-start">
            <div className="flex gap-2 overflow-x-auto">
              {rightGroups.map((g, idx) => (
                <TabButton
                  key={g.category.name + idx}
                  active={idx === rightActiveIndex}
                  onClick={() => {
                    setRightActiveIndex(idx);
                    setPage(0);
                  }}
                >
                  {g.category.name}
                </TabButton>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-4 flex-1">
            {pagedRightList.map((it) => (
              <button
                key={it.id}
                onClick={async () => {
                  try {
                    let alias = "";
                    if (it.categoryId) {
                      const det = await blogCategoryService.detail({
                        id: String(it.categoryId),
                      });
                      alias = det?.data?.alias || "";
                    }
                    if (alias && it.postalias) {
                      window.location.href = `/${alias}/${it.postalias}`;
                    }
                  } catch {}
                }}
                className="group grid grid-cols-3 gap-3 items-center rounded-xl p-2 hover:bg-gray-50 text-left w-full"
              >
                <div className="relative col-span-1 aspect-[4/3] overflow-hidden rounded-lg">
                  <Image
                    src={it.image}
                    alt={it.title}
                    fill
                    className="object-cover transition-transform group-hover:scale-105"
                  />
                </div>
                <div className="col-span-2">
                  <h4 className="text-sm md:text-base font-semibold text-gray-900 line-clamp-2 group-hover:text-primary">
                    {it.title}
                  </h4>
                  <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                    <Image
                      src="/icon/time.svg"
                      alt="date"
                      width={14}
                      height={14}
                    />
                    <span>{formatDate(it.date)}</span>
                  </div>
                </div>
              </button>
            ))}
            {placeholderCount > 0 &&
              Array.from({ length: placeholderCount }).map((_, i) => (
                <div
                  key={`placeholder-${i}`}
                  aria-hidden
                  className="grid grid-cols-3 gap-3 items-center rounded-xl p-2 invisible"
                >
                  <div className="relative col-span-1 aspect-[4/3] overflow-hidden rounded-lg" />
                  <div className="col-span-2" />
                </div>
              ))}
          </div>
          <div className="mt-4 flex items-center justify-center gap-3">
            <div className="flex items-center gap-2">
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => goTo(i)}
                  aria-label={`Trang ${i + 1}`}
                  className={`h-2 rounded-full transition-all ${
                    i === currentPage
                      ? "w-6 bg-primary"
                      : "w-2 bg-gray-300 hover:bg-gray-400"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
        </div>
      </div>
    </section>
  );
};

export default NewsEvents;
