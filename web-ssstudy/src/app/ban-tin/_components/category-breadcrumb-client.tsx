"use client";

import { useEffect, useMemo, useState } from "react";
import Breadcrumb from "@/components/ui/breadcrumb";
import {
  blogCategoryService,
  type BlogCategoryRecord,
} from "@/services/blogCategoryService";
import { useSearchParams } from "next/navigation";

interface Props {
  alias: string;
}

export default function CategoryBreadcrumbClient({ alias }: Props) {
  const searchParams = useSearchParams();
  const categoryId = searchParams?.get("category_id");
  const [categories, setCategories] = useState<BlogCategoryRecord[]>([]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await blogCategoryService.listPublic();
        const list = (res?.data?.records || []).filter(
          (c) => c?.status !== false
        );
        if (!cancelled) setCategories(list);
      } catch {}
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const current = useMemo(() => {
    const byId = categoryId
      ? categories.find((c) => (c as any)?._id === categoryId)
      : undefined;
    return byId || categories.find((c) => c.alias === alias);
  }, [categories, alias, categoryId]);

  const currentHref = useMemo(() => {
    const id = (current as any)?._id || categoryId || "";
    return `/ban-tin/${alias}${id ? `?category_id=${id}` : ""}`;
  }, [alias, current, categoryId]);

  return (
    <Breadcrumb
      items={[
        { label: "Trang chủ", href: "/" },
        // { label: 'Bản tin', href: currentHref },
        { label: current?.name || "Bản tin", href: currentHref },
      ]}
    />
  );
}
