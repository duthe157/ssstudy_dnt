import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  href?: string;
  hideOnMobile?: boolean;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav
      className="flex items-center space-x-2 text-sm text-gray-600 mb-6"
      aria-label="Breadcrumb"
    >
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        const wrapperClass = item.hideOnMobile
          ? "flex items-center space-x-2 breadcrumb-hide-mobile"
          : "flex items-center space-x-2";

        return (
          <div key={index} className={wrapperClass}>
            {index > 0 && <ChevronRight className="h-4 w-4 text-gray-400" />}
            {item.href ? (
              <Link
                href={item.href}
                className="hover:text-blue-600 transition-colors"
              >
                {item.label}
              </Link>
            ) : (
              <span className="text-gray-800 font-medium">{item.label}</span>
            )}
          </div>
        );
      })}
    </nav>
  );
}
