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
    <nav className="pagination flex items-center justify-center gap-2 py-4" aria-label="Pagination">
      {/* Prev button */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={!hasPrev}
        className={`page-btn prev-btn flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-sm font-semibold transition-all duration-300 ${
          hasPrev
            ? "bg-white/5 text-slate-200 hover:bg-indigo-600 hover:text-white hover:shadow-lg active:scale-95"
            : "cursor-not-allowed text-slate-600 opacity-40"
        }`}
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 18L9 12l6-6" />
        </svg>
      
      </button>

      {/* page-numbers container */}
      <div className="page-numbers flex items-center gap-1.5">
        {pageNumbers.map((page, idx) =>
          page === "..." ? (
            <span
              key={`dots-${idx}`}
              className="page-dots px-2 py-2.5 text-sm text-slate-500 font-medium"
            >
              ...
            </span>
          ) : (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`page-num min-w-[36px] rounded-xl px-3 py-2 text-sm font-semibold transition-all duration-300 ${
                page === currentPage
                  ? "page-num active bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30 scale-105 ring-2 ring-indigo-400/35"
                  : "bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white hover:shadow-md"
              }`}
            >
              {page}
            </button>
          )
        )}
      </div>

      {/* Next button */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={!hasNext}
        className={`page-btn next-btn flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-sm font-semibold transition-all duration-300 ${
          hasNext
            ? "bg-white/5 text-slate-200 hover:bg-indigo-600 hover:text-white hover:shadow-lg active:scale-95"
            : "cursor-not-allowed text-slate-600 opacity-40"
        }`}
      >
        
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 18l6-6-6-6" />
        </svg>
      </button>
    </nav>
  );
}
