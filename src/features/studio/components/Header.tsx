import { useState, useRef, useEffect } from "react";
import { Search, X, Menu, SlidersHorizontal, RotateCcw, Sparkles } from "lucide-react";
import { SITE_LOGO, SITE_NAME, SITE_TITLE } from "../config/site";
import MobileHeaderSlider from "./MobileHeaderSlider";

interface HeaderProps {
  searchValue: string;
  onSearch: (q: string) => void;
  onMenuClick: () => void;
  onLogoClick: () => void;
}

export default function Header({ searchValue, onSearch, onMenuClick, onLogoClick }: HeaderProps) {
  const [open, setOpen] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [quality, setQuality] = useState<string>("");
  const [language, setLanguage] = useState<string>("");
  const [year, setYear] = useState<string>("");
  const [format, setFormat] = useState<string>("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      // focus after expand animation
      const t = setTimeout(() => inputRef.current?.focus(), 80);
      return () => clearTimeout(t);
    }
  }, [open]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "/" && document.activeElement !== inputRef.current) {
        e.preventDefault();
        setOpen(true);
      }
      if (e.key === "Escape" && open) {
        setOpen(false);
        setShowFilter(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  const submitSearch = (q: string) => {
    const parts = [q, quality, language, year, format].filter(Boolean);
    onSearch(parts.join(" ").trim());
  };

  const hasActiveFilter = Boolean(quality || language || year || format);

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-white/10 bg-wine-950/80 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-7xl items-center gap-2 px-3 py-3 sm:gap-3 sm:px-4 sm:py-3.5">
          {/* Hamburger */}
          <button
            onClick={onMenuClick}
            aria-label="Menu"
            className="site-glass flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-foreground transition-all hover:border-rose-400/40 hover:bg-rose-400/10 active:scale-95"
          >
            <Menu className="h-5 w-5" strokeWidth={2.4} />
          </button>

          {/* Logo + Brand text (always visible) */}
          <button
            onClick={onLogoClick}
            className={`flex min-w-0 flex-shrink items-center gap-2 transition-all active:scale-95 ${
              open ? "hidden sm:flex" : "flex"
            }`}
            aria-label="Home"
          >
            {SITE_LOGO ? (
              <img
                src={SITE_LOGO}
                alt={SITE_TITLE || SITE_NAME || "logo"}
                className="h-8 w-8 flex-shrink-0 rounded-lg object-contain"
                onError={(e) => ((e.currentTarget as HTMLImageElement).style.display = "none")}
              />
            ) : null}
            <div className="flex items-baseline gap-1 truncate">
              <span className="truncate text-base font-black tracking-tight text-white sm:text-lg">SM</span>
              <span className="truncate text-base font-black tracking-tight text-red-500 sm:text-lg">Movies</span>
            </div>
          </button>

          {/* Spacer */}
          <div className={`flex-1 ${open ? "hidden sm:block" : ""}`} />

          {/* Search area */}
          <div className={`flex items-center gap-2 ${open ? "flex-1 sm:flex-initial" : ""}`}>
            {!open ? (
              <button
                onClick={() => setOpen(true)}
                aria-label="Search"
                className="site-glass flex h-10 w-10 items-center justify-center rounded-xl text-foreground transition-all hover:border-rose-400/40 hover:bg-rose-400/10 active:scale-95"
              >
                <Search className="h-5 w-5" strokeWidth={2.4} />
              </button>
            ) : (
              <form
                id="searchform"
                onSubmit={(e) => {
                  e.preventDefault();
                  submitSearch(searchValue);
                }}
                className="site-glass flex w-full items-center gap-1.5 rounded-2xl border-rose-300/40 px-2 py-1.5 shadow-lg sm:w-72 md:w-96"
              >
                <Search className="ml-1 h-4 w-4 shrink-0 text-rose-300" strokeWidth={2.4} />
                <input
                  ref={inputRef}
                  type="text"
                  value={searchValue}
                  onChange={(e) => onSearch(e.target.value)}
                  placeholder="Search movies, shows…"
                  className="min-w-0 flex-1 bg-transparent px-1 text-sm text-foreground placeholder:text-muted-foreground outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowFilter((v) => !v)}
                  aria-label="Filters"
                  className={`relative flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg transition-colors ${
                    showFilter || hasActiveFilter
                      ? "bg-rose-500/30 text-foreground"
                      : "text-muted-foreground hover:bg-white/10 hover:text-foreground"
                  }`}
                >
                  <SlidersHorizontal className="h-3.5 w-3.5" strokeWidth={2.4} />
                  {hasActiveFilter && (
                    <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-rose-300 ring-2 ring-wine-950" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onSearch("");
                    setOpen(false);
                    setShowFilter(false);
                    setQuality("");
                    setLanguage("");
                    setYear("");
                  }}
                  aria-label="Close search"
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-white/10 hover:text-foreground"
                >
                  <X className="h-4 w-4" strokeWidth={2.4} />
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Filter panel */}
        {open && showFilter && (
          <div className="border-t border-white/10 bg-wine-950/90 backdrop-blur-2xl">
            <div className="mx-auto grid max-w-7xl gap-4 px-3 py-4 sm:grid-cols-2 sm:px-4">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-rose-200 sm:col-span-2">
                <Sparkles className="h-4 w-4" />
                <span>Advanced search</span>
              </div>
              <FilterRow
                label="Quality"
                value={quality}
                onChange={setQuality}
                options={["", "480p", "720p", "1080p", "2160p", "4K", "HEVC"]}
              />
              <FilterRow
                label="Language"
                value={language}
                onChange={setLanguage}
                options={["", "Hindi", "English", "Dual Audio", "Tamil", "Telugu", "Malayalam", "Punjabi", "Bengali"]}
              />
              <FilterRow
                label="Year"
                value={year}
                onChange={setYear}
                options={["", "2026", "2025", "2024", "2023", "2022", "2021", "2020"]}
              />
              <FilterRow
                label="Type"
                value={format}
                onChange={setFormat}
                options={["", "Movie", "Web Series", "Anime"]}
              />
              <div className="flex items-center justify-between border-t border-white/10 pt-3 sm:col-span-2">
                {hasActiveFilter ? (
                  <button
                    onClick={() => {
                      setQuality("");
                      setLanguage("");
                      setYear("");
                      setFormat("");
                      onSearch(searchValue);
                    }}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-200 hover:text-foreground"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    Clear filters
                  </button>
                ) : (
                  <span />
                )}
                <button
                  onClick={() => submitSearch(searchValue)}
                  className="rounded-xl bg-gradient-to-r from-wine-800 to-rose-700 px-4 py-2 text-xs font-bold text-white shadow-md transition-all hover:brightness-110 active:scale-95"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        )}
      </header>
      <MobileHeaderSlider />
    </>
  );
}

function FilterRow({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-start">
      <span className="shrink-0 text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground sm:w-20 sm:pt-2">
        {label}
      </span>
      <div className="scrollbar-none flex min-w-0 gap-1.5 overflow-x-auto pb-1">
        {options.map((opt) => {
          const active = value === opt;
          return (
            <button
              key={opt || "any"}
              type="button"
              onClick={() => onChange(opt)}
              className={`shrink-0 rounded-xl border px-3 py-1.5 text-[11px] font-semibold transition-all ${
                active
                  ? "border-rose-300/60 bg-rose-500/25 text-foreground shadow-sm"
                  : "border-white/10 bg-white/[0.04] text-muted-foreground hover:border-rose-300/40 hover:text-foreground"
              }`}
            >
              {opt || "Any"}
            </button>
          );
        })}
      </div>
    </div>
  );
}
