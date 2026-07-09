import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "./pagination";

interface CustomPaginationProps {
  totalPages: number;
  currentPage: number;
  onPageChange?: (page: number) => void;
  className?: string;
}

export function CustomPagination({
  totalPages,
  currentPage,
  onPageChange,
  className,
}: CustomPaginationProps) {
  // Hàm tạo ra danh sách các trang cần hiển thị
  const generatePageNumbers = (): (number | string)[] => {
    // Với ít trang, hiển thị tất cả
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    // Vùng đầu: cố định 4 trang đầu
    if (currentPage <= 3) {
      return [1, 2, 3, 4, "...", totalPages];
    }
    // Vùng cuối: cố định 4 trang cuối
    if (currentPage >= totalPages - 2) {
      return [1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }
    // Vùng giữa: trang hiện tại +- 1
    return [1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages];
  };

  const pages = generatePageNumbers();

  return (
    <Pagination className={className}>
      <PaginationContent>
        {/* Nút Previous */}
        <PaginationItem>
          <PaginationPrevious
            href="#"
            onClick={(e) => {
              e.preventDefault();
              if (currentPage > 1) {
                onPageChange?.(currentPage - 1);
              }
            }}
            // Vô hiệu hóa nếu đang ở trang đầu
            className={
              currentPage === 1 ? "pointer-events-none opacity-50" : ""
            }
          />
        </PaginationItem>

        {/* Render các số trang và dấu ... */}
        {pages.map((page, index) => (
          <PaginationItem key={index}>
            {page === "..." ? (
              <PaginationEllipsis />
            ) : (
              <PaginationLink
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  onPageChange?.(page as number);
                }}
                isActive={currentPage === page}
              >
                {page}
              </PaginationLink>
            )}
          </PaginationItem>
        ))}

        {/* Nút Next */}
        <PaginationItem>
          <PaginationNext
            href="#"
            onClick={(e) => {
              e.preventDefault();
              if (currentPage < totalPages) {
                onPageChange?.(currentPage + 1);
              }
            }}
            // Vô hiệu hóa nếu đang ở trang cuối
            className={
              currentPage === totalPages ? "pointer-events-none opacity-50" : ""
            }
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
