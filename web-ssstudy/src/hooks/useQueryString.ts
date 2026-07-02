"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

export function useQueryString() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const updateQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams?.toString());
      value ? params.set(name, value) : params.delete(name);
      router.replace(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams]
  );

  const updateAndResetQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams();
      value ? params.set(name, value) : params.delete(name);
      router.replace(`${pathname}?${params.toString()}`);
    },
    [router, pathname]
  );

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams();
      params.set(name, value);
      router.replace(`${pathname}?${params.toString()}`);
    },
    [router, pathname]
  );

  const updateQueryStrings = useCallback(
    (values: Record<string, string | null | undefined>) => {
      const params = new URLSearchParams(searchParams?.toString());
      Object.entries(values).forEach(([name, value]) => {
        if (value) params.set(name, value);
        else params.delete(name);
      });
      router.replace(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams]
  );

  const clearQueryString = useCallback(() => {
    router.replace(pathname ?? "");
  }, [router, pathname]);

  return {
    updateQueryString,
    updateAndResetQueryString,
    createQueryString,
    updateQueryStrings,
    clearQueryString,
  };
}
