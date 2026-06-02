import type { Category } from "../types";
import { useEffect } from "react";
import { Home, Film, X, ChevronRight, Sparkles, Send } from "lucide-react";
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
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <div
        onClick={onClose}
        className={`mobile-backdrop fixed inset-0 z-50 bg-black/70 backdrop-blur-sm transition-opacity duration-300 ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      <aside
        className={`mobile-menu-panel fixed left-0 top-0 z-50 h-full w-[85%] max-w-sm overflow-y-auto bg-gradient-to-b from-[#140505] via-[#0a0a0a] to-[#0a0a0a] shadow-2xl ring-1 ring-red-500/20 transition-transform duration-300 ease-out ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-[#0a0a0a]/95 px-4 py-4 backdrop-blur-xl">
          <div className="flex items-center gap-2.5">
            {SITE_LOGO ? (
              <img src={SITE_LOGO} alt={SITE_NAME || "logo"} className="h-9 w-9 rounded-xl object-contain ring-1 ring-red-400/30" />
            ) : (
              <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-red-500/40 bg-gradient-to-br from-red-600/30 to-red-900/40 shadow-lg shadow-red-600/20">
                <Film className="h-4.5 w-4.5 text-red-300" strokeWidth={2.4} />
              </div>
            )}
            <div className="flex items-baseline">
              <span className="text-base font-black tracking-tight text-white sm:text-lg">
                {(SITE_NAME || "SM Movies").split(" ")[0]}
              </span>
              <span className="text-base font-black tracking-tight text-red-500 sm:text-lg">
                {(SITE_NAME || "SM Movies").split(" ")[1] || ""}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close menu"
            className="rounded-xl border border-white/10 bg-white/[0.04] p-1.5 text-slate-300 transition-all hover:bg-red-500/15 hover:text-white"
          >
            <X className="h-5 w-5" strokeWidth={2.4} />
          </button>
        </div>

        {/* Home */}
        <nav className="p-3">
          <button
            onClick={() => {
              onHome();
              onClose();
            }}
            className={`flex w-full items-center gap-3 rounded-2xl px-3.5 py-3 text-sm font-bold transition-all ${
              !selectedCategory
                ? "bg-gradient-to-r from-red-600 to-red-500 text-white shadow-lg shadow-red-600/30"
                : "border border-white/10 bg-white/[0.04] text-slate-200 hover:border-red-400/40 hover:bg-red-500/10 hover:text-white"
            }`}
          >
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-white/15 bg-white/10">
              <Home className="h-4 w-4" strokeWidth={2.4} />
            </span>
            <span className="flex-1 text-left">Home</span>
            <Sparkles className="h-4 w-4 opacity-80" strokeWidth={2.2} />
          </button>
        </nav>

        {/* Categories */}
        <div className="px-3 pb-4">
          <h3 className="flex items-center gap-2 px-2 pb-2.5 pt-1 text-[11px] font-bold uppercase tracking-wider text-red-300/80">
            <span className="h-px flex-1 bg-gradient-to-r from-red-500/40 to-transparent" />
            Categories
            <span className="h-px flex-1 bg-gradient-to-l from-red-500/40 to-transparent" />
          </h3>
          <ul className="category-list space-y-1.5">
            {categories
              .filter((c) => c.slug)
              .map((cat) => {
                const active = selectedCategory === cat.slug;
                return (
                  <li key={cat.slug}>
                    <button
                      onClick={() => {
                        onSelectCategory(cat.slug);
                        onClose();
                      }}
                      className={`group flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all ${
                        active
                          ? "bg-gradient-to-r from-red-600/80 to-red-500/60 text-white shadow-md shadow-red-600/20"
                          : "border border-transparent text-slate-300 hover:border-white/10 hover:bg-white/[0.04] hover:text-white"
                      }`}
                    >
                      <span className="flex items-center gap-2.5">
                        <span
                          className={`h-1.5 w-1.5 rounded-full transition-all ${
                            active ? "bg-white" : "bg-red-500/50 group-hover:bg-red-400"
                          }`}
                        />
                        {cat.name}
                      </span>
                      <ChevronRight
                        className={`h-4 w-4 transition-transform ${
                          active ? "text-white" : "text-slate-500 group-hover:translate-x-0.5 group-hover:text-white"
                        }`}
                        strokeWidth={2.4}
                      />
                    </button>
                  </li>
                );
              })}
          </ul>
        </div>

        {/* Telegram CTA */}
        <div className="px-3 pb-6">
          <a
            href="https://t.me/+FSWElNbfXwdjYWNl"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 rounded-2xl border border-sky-400/30 bg-gradient-to-br from-sky-500/15 via-sky-500/10 to-blue-600/10 p-3.5 transition-all hover:border-sky-300/60 hover:from-sky-500/25 active:scale-[0.98]"
          >
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-sky-400/40 bg-sky-500/20 text-sky-200">
              <Send className="h-5 w-5" strokeWidth={2.2} />
            </span>
            <span className="flex flex-1 flex-col">
              <span className="text-sm font-bold text-white">Join Telegram</span>
              <span className="text-[11px] text-sky-200/80">Get latest movies first</span>
            </span>
            <ChevronRight className="h-4 w-4 text-sky-200" strokeWidth={2.4} />
          </a>
        </div>
      </aside>
    </>
  );
}
