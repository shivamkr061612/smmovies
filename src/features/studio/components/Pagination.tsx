import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
  onPageChange: (page: number) => void;
}

export default function Pagination({
  currentPage,
  totalPages,
  hasNext,
  hasPrev,
  onPageChange,
}: PaginationProps) {
  const getPageNumbers = (): (number | "...")[] => {
    const pages: (number | "...")[] = [];
    const maxVisible = 5;
    if (totalPages <= maxVisible + 2) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push("...");
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (currentPage < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <nav className="flex items-center justify-center gap-2 py-6" aria-label="Pagination">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={!hasPrev}
        aria-label="Previous page"
        className={`flex h-10 w-10 items-center justify-center rounded-xl border text-sm font-bold transition-all ${
          hasPrev
            ? "border-white/10 bg-white/[0.04] text-zinc-200 hover:border-amber-400/40 hover:bg-amber-500/15 hover:text-amber-300 active:scale-90"
            : "cursor-not-allowed border-white/5 text-zinc-700 opacity-40"
        }`}
      >
        <ChevronLeft className="h-4 w-4" strokeWidth={2.5} />
      </button>

      <div className="flex items-center gap-1.5">
        {pageNumbers.map((page, idx) =>
          page === "..." ? (
            <span key={`d-${idx}`} className="px-1 text-sm font-bold text-zinc-600">
              ···
            </span>
          ) : (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`flex h-10 min-w-[40px] items-center justify-center rounded-xl px-3 text-sm font-black transition-all ${
                page === currentPage
                  ? "bg-gradient-to-br from-amber-400 to-fuchsia-600 text-white shadow-lg shadow-amber-500/40 scale-110 ring-1 ring-amber-300/50"
                  : "border border-white/10 bg-white/[0.04] text-zinc-300 hover:border-amber-400/30 hover:bg-amber-500/10 hover:text-amber-300"
              }`}
            >
              {page}
            </button>
          )
        )}
      </div>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={!hasNext}
        aria-label="Next page"
        className={`flex h-10 w-10 items-center justify-center rounded-xl border text-sm font-bold transition-all ${
          hasNext
            ? "border-white/10 bg-white/[0.04] text-zinc-200 hover:border-amber-400/40 hover:bg-amber-500/15 hover:text-amber-300 active:scale-90"
            : "cursor-not-allowed border-white/5 text-zinc-700 opacity-40"
        }`}
      >
        <ChevronRight className="h-4 w-4" strokeWidth={2.5} />
      </button>
    </nav>
  );
}
