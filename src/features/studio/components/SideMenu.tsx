import type { Category } from "../types";
import { useEffect } from "react";
import { SITE_LOGO, SITE_NAME } from "../config/site";

interface SideMenuProps {
  open: boolean;
  onClose: () => void;
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (slug: string) => void;
  onHome: () => void;
}

export default function SideMenu({
  open,
  onClose,
  categories,
  selectedCategory,
  onSelectCategory,
  onHome,
}: SideMenuProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className={`mobile-backdrop fixed inset-0 z-50 transition-opacity duration-300 ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      {/* Drawer */}
      <aside
        className={`mobile-menu-panel fixed left-0 top-0 z-50 h-full w-[85%] max-w-sm overflow-y-auto bg-[#1a1530] shadow-2xl ring-1 ring-white/10 transition-transform duration-300 ease-out ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-[#1a1530]/95 px-4 py-4 backdrop-blur-xl">
          <div className="flex items-center gap-2">
            {SITE_LOGO ? (
              <img src={SITE_LOGO} alt={SITE_NAME || 'logo'} className="h-8 w-8 rounded-md object-contain" />
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-md border-2 border-red-600 bg-red-950">
                <svg viewBox="0 0 24 24" className="h-4 w-4 text-red-500" fill="currentColor">
                  <circle cx="12" cy="12" r="3" />
                  <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2" />
                </svg>
              </div>
            )}
            <div className="flex items-baseline">
              <span className="text-base font-black tracking-tight text-white sm:text-lg">{(SITE_NAME || 'MoviesDrive').split(' ')[0]}</span>
              <span className="text-base font-black tracking-tight text-red-600 sm:text-lg">{(SITE_NAME || 'MoviesDrive').split(' ')[1] || ''}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close menu"
            className="rounded-lg p-1.5 text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Home */}
        <nav className="p-3">
          <button
            onClick={() => {
              onHome();
              onClose();
            }}
            className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition-colors ${
              !selectedCategory
                ? "bg-red-600 text-white"
                : "text-slate-200 hover:bg-white/5"
            }`}
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Home
          </button>
        </nav>

        {/* Categories */}
        <div className="px-3 pb-6">
          <h3 className="px-3 pb-2 pt-2 text-xs font-bold uppercase tracking-wider text-slate-500">
            Categories
          </h3>
          <ul className="category-list space-y-1">
            {categories
              .filter((c) => c.slug)
              .map((cat) => (
                <li key={cat.slug}>
                  <button
                    onClick={() => {
                      onSelectCategory(cat.slug);
                      onClose();
                    }}
                    className={`flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                      selectedCategory === cat.slug
                        ? "bg-red-600 text-white"
                        : "text-slate-300 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <span>{cat.name}</span>
                    <svg className="h-4 w-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </li>
              ))}
          </ul>
        </div>
      </aside>
    </>
  );
}
