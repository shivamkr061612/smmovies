import type { Category } from "../types";
import { useEffect } from "react";
import {
  Home,
  X,
  Flame,
  Film,
  Tv,
  Globe2,
  Sparkles,
  Languages,
  Heart,
  Cat,
  Crown,
  Cpu,
  ChevronRight,
  Send,
} from "lucide-react";
import { SITE_LOGO, SITE_NAME } from "../config/site";

interface SideMenuProps {
  open: boolean;
  onClose: () => void;
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (slug: string) => void;
  onHome: () => void;
}

const TELEGRAM_URL = "https://t.me/+FSWElNbfXwdjYWNl";

// Icon map per category slug
function CategoryIcon({ slug }: { slug: string }) {
  const s = slug.toLowerCase();
  const cls = "h-4 w-4";
  if (s.includes("netflix")) return <Tv className={cls} strokeWidth={2.4} />;
  if (s.includes("amzn") || s.includes("amazon") || s.includes("prime")) return <Crown className={cls} strokeWidth={2.4} />;
  if (s.includes("hotstar") || s.includes("jio")) return <Sparkles className={cls} strokeWidth={2.4} />;
  if (s.includes("web")) return <Globe2 className={cls} strokeWidth={2.4} />;
  if (s.includes("anime")) return <Cat className={cls} strokeWidth={2.4} />;
  if (s.includes("bollywood")) return <Film className={cls} strokeWidth={2.4} />;
  if (s.includes("hollywood")) return <Film className={cls} strokeWidth={2.4} />;
  if (s.includes("dual")) return <Languages className={cls} strokeWidth={2.4} />;
  if (s.includes("tamil") || s.includes("telugu") || s.includes("malayalam") || s.includes("punjabi"))
    return <Languages className={cls} strokeWidth={2.4} />;
  if (s.includes("18")) return <Heart className={cls} strokeWidth={2.4} />;
  return <Cpu className={cls} strokeWidth={2.4} />;
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
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className={`fixed inset-0 z-50 bg-black/70 backdrop-blur-md transition-opacity duration-300 ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      {/* Drawer */}
      <aside
        className={`fixed left-0 top-0 z-50 h-full w-[86%] max-w-sm overflow-y-auto bg-gradient-to-b from-zinc-950 via-zinc-950 to-black shadow-2xl ring-1 ring-amber-500/10 transition-transform duration-300 ease-out ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Accent line */}
        <div className="h-[2px] bg-gradient-to-r from-amber-500 via-fuchsia-500 to-violet-500" />

        {/* Decorative glow */}
        <div className="pointer-events-none absolute -top-20 left-1/2 -translate-x-1/2 h-48 w-48 rounded-full bg-amber-500/20 blur-3xl" />

        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/[0.06] bg-zinc-950/85 px-4 py-4 backdrop-blur-2xl">
          <div className="flex items-center gap-2.5">
            {SITE_LOGO ? (
              <img src={SITE_LOGO} alt={SITE_NAME || "logo"} className="h-9 w-9 rounded-xl object-contain" />
            ) : (
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 via-orange-500 to-fuchsia-600 shadow-lg shadow-amber-500/30">
                <Flame className="h-5 w-5 text-zinc-950" strokeWidth={2.5} fill="currentColor" />
              </div>
            )}
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-black text-white">
                {(SITE_NAME || "SM Movies").split(" ")[0]}
              </span>
              <span className="bg-gradient-to-r from-amber-400 to-fuchsia-500 bg-clip-text text-lg font-black text-transparent">
                {(SITE_NAME || "SM Movies").split(" ")[1] || ""}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close menu"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-zinc-300 transition-all hover:border-amber-400/40 hover:bg-amber-500/10 hover:text-amber-300 active:scale-90"
          >
            <X className="h-5 w-5" strokeWidth={2.4} />
          </button>
        </div>

        {/* Home */}
        <nav className="relative p-3">
          <button
            onClick={() => {
              onHome();
              onClose();
            }}
            className={`group flex w-full items-center gap-3 rounded-2xl px-3.5 py-3 text-sm font-bold transition-all ${
              !selectedCategory
                ? "bg-gradient-to-r from-amber-500 to-fuchsia-600 text-white shadow-lg shadow-amber-500/30"
                : "text-zinc-200 hover:bg-white/5"
            }`}
          >
            <span
              className={`flex h-8 w-8 items-center justify-center rounded-xl ${
                !selectedCategory ? "bg-white/20" : "bg-white/[0.04] group-hover:bg-amber-500/15"
              }`}
            >
              <Home className="h-4 w-4" strokeWidth={2.5} />
            </span>
            Home
            <ChevronRight className="ml-auto h-4 w-4 opacity-50" strokeWidth={2.5} />
          </button>
        </nav>

        {/* Categories */}
        <div className="relative px-3 pb-6">
          <h3 className="px-3 pb-2 pt-2 text-[10px] font-black uppercase tracking-[0.2em] text-amber-400/80">
            Browse Categories
          </h3>
          <ul className="space-y-1">
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
                      className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all ${
                        active
                          ? "bg-gradient-to-r from-amber-500/20 to-fuchsia-500/10 text-amber-300 ring-1 ring-amber-400/40"
                          : "text-zinc-300 hover:bg-white/[0.04] hover:text-white"
                      }`}
                    >
                      <span
                        className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
                          active
                            ? "bg-amber-500/20 text-amber-300"
                            : "bg-white/[0.04] text-zinc-400 group-hover:bg-amber-500/10 group-hover:text-amber-300"
                        }`}
                      >
                        <CategoryIcon slug={cat.slug} />
                      </span>
                      <span className="flex-1 text-left">{cat.name}</span>
                      <ChevronRight
                        className={`h-4 w-4 transition-transform ${
                          active ? "text-amber-400" : "text-zinc-600 group-hover:translate-x-0.5"
                        }`}
                        strokeWidth={2.5}
                      />
                    </button>
                  </li>
                );
              })}
          </ul>

          {/* Telegram CTA */}
          <a
            href={TELEGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 flex items-center gap-3 rounded-2xl border border-sky-400/30 bg-gradient-to-r from-sky-500/15 to-cyan-500/10 px-4 py-3 text-sm font-bold text-sky-200 shadow-lg shadow-sky-500/10 transition-all hover:scale-[1.02] hover:from-sky-500/25"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-sky-400 to-cyan-500 text-white shadow-md">
              <Send className="h-4 w-4" strokeWidth={2.5} fill="currentColor" />
            </span>
            <span className="flex-1">
              <span className="block text-xs text-sky-300/70">Get instant updates</span>
              Join Telegram
            </span>
            <ChevronRight className="h-4 w-4 text-sky-300" strokeWidth={2.5} />
          </a>
        </div>
      </aside>
    </>
  );
}
