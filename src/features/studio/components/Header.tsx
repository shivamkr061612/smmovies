import { useState, useRef, useEffect } from "react";
import { Search, X, Menu, SlidersHorizontal } from "lucide-react";
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
    const final = quality ? `${q} ${quality}`.trim() : q;
    onSearch(final);
  };

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-white/10 bg-gradient-to-b from-[#0a0a0a]/95 to-[#0a0a0a]/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center gap-2 px-3 py-3 sm:gap-3 sm:px-4 sm:py-3.5">
          {/* Hamburger */}
          <button
            onClick={onMenuClick}
            aria-label="Menu"
            className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-white transition-all hover:border-red-400/40 hover:bg-red-500/10 active:scale-95"
          >
            <Menu className="h-5 w-5" strokeWidth={2.4} />
          </button>

          {/* Logo */}
          <button
            onClick={onLogoClick}
            className={`flex flex-shrink-0 items-center transition-all active:scale-95 ${
              open ? "hidden sm:flex" : "flex"
            }`}
            aria-label="Home"
          >
            {SITE_LOGO ? (
              <img src={SITE_LOGO} alt={SITE_TITLE || SITE_NAME || "logo"} className="h-8 object-contain" />
            ) : (
              <div className="flex items-baseline gap-1">
                <span className="text-base font-black tracking-tight text-white sm:text-lg">
                  {(SITE_NAME || "SM Movies").split(" ")[0]}
                </span>
                <span className="text-base font-black tracking-tight text-red-600 sm:text-lg">
                  {(SITE_NAME || "SM Movies").split(" ").slice(1).join(" ")}
                </span>
              </div>
            )}
          </button>

          {/* Spacer */}
          <div className={`flex-1 ${open ? "hidden sm:block" : ""}`} />

          {/* Search area */}
          <div className={`flex items-center gap-2 ${open ? "flex-1 sm:flex-initial" : ""}`}>
            {!open ? (
              <button
                onClick={() => setOpen(true)}
                aria-label="Search"
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-white transition-all hover:border-red-400/40 hover:bg-red-500/10 active:scale-95"
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
                className="flex w-full items-center gap-1.5 rounded-2xl border border-red-400/40 bg-white/[0.06] px-2 py-1.5 shadow-lg shadow-red-500/10 sm:w-72 md:w-96"
              >
                <Search className="ml-1 h-4 w-4 flex-shrink-0 text-red-300" strokeWidth={2.4} />
                <input
                  ref={inputRef}
                  type="text"
                  value={searchValue}
                  onChange={(e) => onSearch(e.target.value)}
                  placeholder="Search movies, shows…"
                  className="min-w-0 flex-1 bg-transparent px-1 text-sm text-white placeholder-slate-400 outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowFilter((v) => !v)}
                  aria-label="Filters"
                  className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg transition-colors ${
                    showFilter || quality
                      ? "bg-red-500/30 text-white"
                      : "text-slate-300 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <SlidersHorizontal className="h-3.5 w-3.5" strokeWidth={2.4} />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onSearch("");
                    setOpen(false);
                    setShowFilter(false);
                    setQuality("");
                  }}
                  aria-label="Close search"
                  className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
                >
                  <X className="h-4 w-4" strokeWidth={2.4} />
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Filter chips */}
        {open && showFilter && (
          <div className="border-t border-white/10 bg-[#0a0a0a]/95 backdrop-blur-xl">
            <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-2 px-3 py-2.5 sm:px-4">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Quality:
              </span>
              {["", "480p", "720p", "1080p", "4K", "HEVC", "Dual Audio"].map((q) => (
                <button
                  key={q || "any"}
                  onClick={() => setQuality(q)}
                  className={`rounded-full border px-3 py-1 text-xs font-semibold transition-all ${
                    quality === q
                      ? "border-red-400/60 bg-red-500/20 text-white"
                      : "border-white/10 bg-white/[0.04] text-slate-300 hover:border-white/25 hover:text-white"
                  }`}
                >
                  {q || "Any"}
                </button>
              ))}
            </div>
          </div>
        )}
      </header>
      <MobileHeaderSlider />
    </>
  );
}
