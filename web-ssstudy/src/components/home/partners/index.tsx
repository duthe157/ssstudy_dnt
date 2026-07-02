"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { blogService, type BlogRecord } from "@/services/blogService";
import { Calendar } from "lucide-react";

interface PartnerPost {
  id: string;
  title: string;
  alias: string;
  image?: string;
  description?: string;
  createdAt?: string;
}

function mapPosts(records: BlogRecord[]): PartnerPost[] {
  return (records || []).map((r) => ({
    id: r._id,
    title: r.name,
    alias: r.alias,
    image: r.image,
    description: r.description,
    createdAt: r.created_at,
  }));
}

function formatDate(date?: string) {
  if (!date) return "";
  try {
    const d = new Date(date);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleDateString("vi-VN");
  } catch {
    return "";
  }
}

export function PartnersSection() {
  const [posts, setPosts] = useState<PartnerPost[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const response = await blogService.listFilter({
          category_name: "doi-tac",
        });
        if (cancelled) return;
        const records = response?.data?.records || [];
        const mapped = mapPosts(records)
          .sort((a, b) => {
            const ta = new Date(a.createdAt || 0).getTime();
            const tb = new Date(b.createdAt || 0).getTime();
            return tb - ta;
          })
          .slice(0, 3);
        setPosts(mapped);
      } catch {
        if (!cancelled) setPosts([]);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const hasData = useMemo(() => Array.isArray(posts) && posts.length > 0, [posts]);

  if (!hasData) return null;

  return (
    <section className="w-full mt-16 md:mt-24 pb-12 md:pb-16">
      <div className="max-w-[1440px] mx-auto px-8 sm:px-12 lg:px-16">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 text-center">
          Đối tác
        </h2>

        <div className="flex justify-end">
          <Link
            href="/doi-tac"
            className="text-[#235CD0] text-sm font-medium flex items-center gap-2 hover:underline"
          >
            Xem tất cả
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M13 5L20 12L13 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M4 12H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {posts!.map((p) => (
            <Link
              key={p.id}
              href={`/doi-tac/${p.alias}`}
              className="group rounded-xl overflow-hidden border border-gray-100 hover:shadow-md transition-shadow bg-white"
            >
              <div className="relative w-full aspect-[16/9]">
                {p.image ? (
                  <Image
                    src={p.image}
                    alt={p.title}
                    fill
                    sizes="(max-width: 1024px) 100vw, 33vw"
                    className="object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gray-100" />
                )}
              </div>
              <div className="p-4">
                <h3 className="text-base md:text-lg font-semibold text-gray-900 line-clamp-2 group-hover:text-primary">
                  {p.title}
                </h3>
                {p.description ? (
                  <div
                    className="mt-2 text-sm text-gray-600 line-clamp-3"
                    dangerouslySetInnerHTML={{ __html: p.description }}
                  />
                ) : null}
                <div className="mt-4 flex items-center gap-2 text-xs text-gray-500">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDate(p.createdAt)}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export default PartnersSection;


