import * as React from "react";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";

type MarketPaginationProps = { page: number; totalPages: number; onPageChange: (page: number) => void };

export function MarketPagination({ page, totalPages, onPageChange }: MarketPaginationProps) {
  if (totalPages <= 1) return null;
  const pages = Array.from({ length: totalPages }, (_, index) => index + 1);
  const handleClick = (target: number) => (event: React.MouseEvent) => {
    event.preventDefault();
    onPageChange(target);
  };

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious href="#" onClick={handleClick(Math.max(1, page - 1))} className={page === 1 ? "pointer-events-none opacity-50" : undefined} aria-disabled={page === 1} />
        </PaginationItem>
        {pages.map((pageNumber) => (
          <PaginationItem key={pageNumber}>
            <PaginationLink href="#" onClick={handleClick(pageNumber)} isActive={pageNumber === page}>
              {pageNumber}
            </PaginationLink>
          </PaginationItem>
        ))}
        <PaginationItem>
          <PaginationNext href="#" onClick={handleClick(Math.min(totalPages, page + 1))} className={page === totalPages ? "pointer-events-none opacity-50" : undefined} aria-disabled={page === totalPages} />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
