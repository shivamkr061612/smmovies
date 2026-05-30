import { useState, useRef, useEffect } from "react";
import { SITE_LOGO, SITE_NAME, SITE_TITLE } from "../config/site";
import MobileHeaderSlider from "./MobileHeaderSlider";

interface HeaderProps {
  searchValue: string;
  onSearch: (q: string) => void;
  onMenuClick: () => void;
  onLogoClick: () => void;
}

export default function Header({ searchValue, onSearch, onMenuClick, onLogoClick }: HeaderProps) {
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "/" && document.activeElement !== inputRef.current) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <>
    <header className="sticky top-0 z-40 border-b border-white/5 bg-[#0a0a0a]/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-3 py-3 sm:gap-4 sm:px-4 sm:py-4">
        {/* Hamburger */}
        <button
          onClick={onMenuClick}
          aria-label="Menu"
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg text-white transition-colors hover:bg-white/10 active:scale-95"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Logo */}
        <button
          onClick={onLogoClick}
          className="flex flex-shrink-0 items-center transition-transform active:scale-95"
          aria-label="Home"
        >
          {SITE_LOGO ? (
            <img src={SITE_LOGO} alt={SITE_TITLE || SITE_NAME || 'logo'} className="h-8 object-contain" />
          ) : (
            <div className="flex items-center gap-1.5">
              <div className="relative">
                <div className="flex h-8 w-8 items-center justify-center rounded-md border-2 border-red-600 bg-gradient-to-br from-red-900/40 to-red-950 shadow-lg shadow-red-600/30">
                  <svg viewBox="0 0 24 24" className="h-4.5 w-4.5 text-red-500" fill="currentColor">
                    <circle cx="12" cy="12" r="3" />
                    <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2" />
                    <circle cx="5" cy="8" r="1.5" />
                    <circle cx="19" cy="8" r="1.5" />
                    <circle cx="5" cy="16" r="1.5" />
                    <circle cx="19" cy="16" r="1.5" />
                  </svg>
                </div>
                <span className="absolute -right-1 -top-1 text-yellow-400 text-sm">⚡</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-base font-black tracking-tight text-white sm:text-lg">{(SITE_NAME || 'SM Movies').split(' ')[0]}</span>
                <span className="text-base font-black tracking-tight text-red-600 sm:text-lg">{(SITE_NAME || 'SM Movies').split(' ').slice(1).join(' ')}</span>
              </div>
            </div>
          )}
        </button>

        {/* Search bar */}
        <div className="search-bar relative w-35">
          <form
            id="searchform"
            onSubmit={(e) => e.preventDefault()}
            className={`flex items-center gap-2 rounded-full border px-3.5 py-2 transition-all duration-300 sm:px-4 sm:py-2.5 ${
              focused
                ? "border-red-400/60 bg-white/10 shadow-lg shadow-red-500/20"
                : "border-white/15 bg-white/[0.03] hover:border-white/25"
            }`}
          >
            <svg
              className={`search-icon h-4 w-4 flex-shrink-0 transition-colors sm:h-5 sm:w-5 ${
                focused ? "text-red-400" : "text-slate-400"
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input
              ref={inputRef}
              type="text"
              value={searchValue}
              onChange={(e) => onSearch(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              placeholder="Search here..."
              className="search-input min-w-0 flex-1 bg-transparent text-sm text-white placeholder-slate-400 outline-none"
            />
            {searchValue && (
              <button
                type="button"
                onClick={() => onSearch("")}
                className="flex-shrink-0 rounded-full p-0.5 text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </form>
        </div>
      </div>
    </header>
    {/* Mobile header slider below main header content */}
    <MobileHeaderSlider />
    </>
  );
}
