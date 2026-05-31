import { useState, useRef, useEffect } from "react";
import { Menu, Search, X, Filter, Flame, Zap } from "lucide-react";
import { SITE_LOGO, SITE_NAME, SITE_TITLE } from "../config/site";
import type { Category } from "../types";

interface HeaderProps {
  searchValue: string;
  onSearch: (q: string) => void;
  onMenuClick: () => void;
  onLogoClick: () => void;
  categories?: Category[];
  selectedCategory?: string;
  onSelectCategory?: (slug: string) => void;
}

export default function Header({
  searchValue,
  onSearch,
  onMenuClick,
  onLogoClick,
  categories = [],
  selectedCategory = "",
  onSelectCategory,
}: HeaderProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (searchOpen) {
      // focus after the transition starts
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [searchOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "/" && document.activeElement !== inputRef.current) {
        e.preventDefault();
        setSearchOpen(true);
      }
      if (e.key === "Escape") {
        setSearchOpen(false);
        setFilterOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(e.target as Node)) {
        setFilterOpen(false);
        if (!searchValue) setSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [searchValue]);

  const activeCat = categories.find((c) => c.slug === selectedCategory)?.name;

  return (
    <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-zinc-950/80 backdrop-blur-2xl">
      {/* Top accent line — amber → violet */}
      <div className="h-[2px] bg-gradient-to-r from-amber-500 via-fuchsia-500 to-violet-500" />

      <div className="mx-auto flex max-w-7xl items-center gap-2 px-3 py-3 sm:gap-3 sm:px-5 sm:py-3.5">
        {/* Hamburger */}
        <button
          onClick={onMenuClick}
          aria-label="Open menu"
          className="group flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.04] text-white transition-all hover:border-amber-400/40 hover:bg-amber-500/10 hover:text-amber-300 active:scale-90"
        >
          <Menu className="h-5 w-5" strokeWidth={2.4} />
        </button>

        {/* Logo — cinematic */}
        <button
          onClick={onLogoClick}
          className="flex flex-shrink-0 items-center gap-2 transition-transform active:scale-95"
          aria-label="Home"
        >
          {SITE_LOGO ? (
            <img src={SITE_LOGO} alt={SITE_TITLE || SITE_NAME || "logo"} className="h-9 object-contain" />
          ) : (
            <>
              <div className="relative">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 via-orange-500 to-fuchsia-600 shadow-lg shadow-amber-500/30">
                  <Flame className="h-5 w-5 text-zinc-950" strokeWidth={2.5} fill="currentColor" />
                </div>
                <Zap className="absolute -right-1 -top-1 h-3.5 w-3.5 fill-amber-300 text-amber-300 drop-shadow-[0_0_4px_rgba(245,158,11,0.9)]" />
              </div>
              <div className="hidden sm:flex items-baseline gap-1">
                <span className="text-lg font-black tracking-tight text-white">
                  {(SITE_NAME || "SM Movies").split(" ")[0]}
                </span>
                <span className="bg-gradient-to-r from-amber-400 to-fuchsia-500 bg-clip-text text-lg font-black tracking-tight text-transparent">
                  {(SITE_NAME || "SM Movies").split(" ").slice(1).join(" ")}
                </span>
              </div>
            </>
          )}
        </button>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Search area — collapsible */}
        <div ref={wrapRef} className="relative flex items-center gap-1.5">
          {/* Search icon (collapsed) */}
          {!searchOpen && (
            <button
              onClick={() => setSearchOpen(true)}
              aria-label="Open search"
              className="relative flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.04] text-white transition-all hover:border-amber-400/40 hover:bg-amber-500/10 hover:text-amber-300 active:scale-90"
            >
              <Search className="h-5 w-5" strokeWidth={2.4} />
              {(searchValue || selectedCategory) && (
                <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.9)]" />
              )}
            </button>
          )}

          {/* Expanded search bar */}
          {searchOpen && (
            <div className="flex items-center gap-1.5 rounded-2xl border border-amber-400/40 bg-zinc-900/95 px-2 py-1.5 shadow-xl shadow-amber-500/20 backdrop-blur-xl animate-in fade-in slide-in-from-right-2 duration-200">
              <Search className="ml-1 h-4 w-4 flex-shrink-0 text-amber-400" strokeWidth={2.4} />
              <input
                ref={inputRef}
                type="text"
                value={searchValue}
                onChange={(e) => onSearch(e.target.value)}
                placeholder="Search movies, series..."
                className="w-44 min-w-0 bg-transparent text-sm font-medium text-white placeholder-zinc-500 outline-none sm:w-64"
              />
              {searchValue && (
                <button
                  type="button"
                  onClick={() => onSearch("")}
                  aria-label="Clear"
                  className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-white/10 hover:text-white"
                >
                  <X className="h-4 w-4" strokeWidth={2.4} />
                </button>
              )}
              {/* Filter trigger */}
              {categories.length > 0 && (
                <button
                  type="button"
                  onClick={() => setFilterOpen((v) => !v)}
                  aria-label="Filter"
                  className={`flex h-7 items-center gap-1 rounded-lg border px-2 text-xs font-bold transition-colors ${
                    selectedCategory || filterOpen
                      ? "border-amber-400/50 bg-amber-500/15 text-amber-300"
                      : "border-white/10 bg-white/5 text-zinc-400 hover:text-white"
                  }`}
                >
                  <Filter className="h-3.5 w-3.5" strokeWidth={2.5} />
                  {activeCat ? activeCat.slice(0, 6) : "Filter"}
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  setSearchOpen(false);
                  setFilterOpen(false);
                  onSearch("");
                }}
                aria-label="Close search"
                className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-white/10 hover:text-white"
              >
                <X className="h-4 w-4" strokeWidth={2.4} />
              </button>
            </div>
          )}

          {/* Filter dropdown */}
          {filterOpen && onSelectCategory && (
            <div className="absolute right-0 top-[calc(100%+8px)] z-50 max-h-80 w-64 overflow-y-auto rounded-2xl border border-white/10 bg-zinc-950/95 p-2 shadow-2xl shadow-black/50 backdrop-blur-2xl animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="px-2 py-1.5 text-[10px] font-bold uppercase tracking-widest text-amber-400">
                Categories
              </div>
              <div className="grid grid-cols-2 gap-1">
                {categories.map((c) => (
                  <button
                    key={c.slug || "all"}
                    onClick={() => {
                      onSelectCategory(c.slug);
                      setFilterOpen(false);
                    }}
                    className={`rounded-lg px-2.5 py-2 text-left text-xs font-semibold transition-colors ${
                      selectedCategory === c.slug
                        ? "bg-gradient-to-r from-amber-500 to-fuchsia-600 text-white shadow-md shadow-amber-500/30"
                        : "text-zinc-300 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
