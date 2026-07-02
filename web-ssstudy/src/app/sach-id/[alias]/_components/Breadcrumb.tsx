// Breadcrumb.tsx - Đường dẫn điều hướng

import Link from "next/link";
import { BreadcrumbItem } from "./types";

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav className="book-breadcrumb mb-4" aria-label="Breadcrumb">
      <ol className="breadcrumb-list flex items-center gap-2 list-none p-0 m-0">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          // Ẩn item cuối cùng trên mobile
          if (isLast) {
            return (
              <li key={index} className="hidden xl:flex items-center gap-2">
                <span className="text-gray-900 font-medium">{item.label}</span>
              </li>
            );
          }

          return (
            <li key={index} className="flex items-center gap-2">
              {item.url ? (
                <>
                  <Link
                    href={item.url}
                    className="text-gray-600 hover:text-blue-600 transition-colors"
                  >
                    {item.label}
                  </Link>
                  <span className="text-gray-400">/</span>
                </>
              ) : (
                <span className="text-gray-600">{item.label}</span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
