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
  const generatePageNumbers = () => {
    const pageNumbers: (number | string)[] = [];
    // Hiển thị 2 trang đầu
    if (totalPages > 1) {
      pageNumbers.push(1);
      if (totalPages > 2) {
        pageNumbers.push(2);
      }
    }

    // Hiển thị dấu "..." nếu cần
    if (currentPage > 4) {
      pageNumbers.push("...");
    }

    // Hiển thị các trang xung quanh trang hiện tại
    for (
      let i = Math.max(3, currentPage - 1);
      i <= Math.min(totalPages - 2, currentPage + 1);
      i++
    ) {
      if (!pageNumbers.includes(i)) {
        pageNumbers.push(i);
      }
    }

    // Hiển thị dấu "..." nếu cần
    if (currentPage < totalPages - 3) {
      pageNumbers.push("...");
    }

    // Hiển thị 2 trang cuối
    if (totalPages > 3) {
      if (totalPages > 4) {
        pageNumbers.push(totalPages - 1);
      }
      pageNumbers.push(totalPages);
    }

    // Loại bỏ các phần tử trùng lặp
    return Array.from(new Set(pageNumbers));
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
