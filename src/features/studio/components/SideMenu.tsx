import type { Category } from "../types";
import { useEffect } from "react";
import {
  Home,
  Film,
  X,
  ChevronRight,
  Sparkles,
  Send,
  MessageCircle,
  Tv,
  Clapperboard,
  Globe2,
  Languages,
  Flame,
  Cat,
  Crown,
  Mountain,
  Palmtree,
  Wheat,
  PlayCircle,
  type LucideIcon,
} from "lucide-react";
import { SITE_LOGO, SITE_NAME, TELEGRAM_URL, WHATSAPP_CHANNEL_URL } from "../config/site";

interface SideMenuProps {
  open: boolean;
  onClose: () => void;
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (slug: string) => void;
  onHome: () => void;
}

function iconForCategory(slug: string, name: string): LucideIcon {
  const s = (slug || name).toLowerCase();
  if (/web|series/.test(s)) return Tv;
  if (/amzn|amazon|prime/.test(s)) return PlayCircle;
  if (/netflix/.test(s)) return PlayCircle;
  if (/jio|hotstar/.test(s)) return PlayCircle;
  if (/18|adult/.test(s)) return Flame;
  if (/dual.*audio/.test(s)) return Languages;
  if (/bollywood|hindi/.test(s)) return Crown;
  if (/hollywood|english/.test(s)) return Clapperboard;
  if (/tamil/.test(s)) return Palmtree;
  if (/telugu/.test(s)) return Mountain;
  if (/malayalam/.test(s)) return Palmtree;
  if (/punjabi/.test(s)) return Wheat;
  if (/anime/.test(s)) return Cat;
  if (/south/.test(s)) return Globe2;
  return Film;
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
        className={`mobile-backdrop fixed inset-0 z-50 bg-black/75 backdrop-blur-md transition-opacity duration-300 ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      <aside
        className={`mobile-menu-panel fixed left-0 top-0 z-50 flex h-full w-[86%] max-w-sm flex-col overflow-hidden bg-gradient-to-b from-[#1a0606] via-[#0a0a0a] to-[#050505] shadow-2xl ring-1 ring-red-500/20 transition-transform duration-300 ease-out ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Decorative glow */}
        <div className="pointer-events-none absolute -top-24 -left-16 h-56 w-56 rounded-full bg-red-700/25 blur-3xl" />
        <div className="pointer-events-none absolute bottom-32 -right-20 h-56 w-56 rounded-full bg-red-900/25 blur-3xl" />

        {/* Header */}
        <div className="relative z-10 flex items-center justify-between border-b border-white/10 bg-[#0a0a0a]/80 px-4 py-4 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            {SITE_LOGO ? (
              <img
                src={SITE_LOGO}
                alt={SITE_NAME || "logo"}
                className="h-11 w-11 rounded-2xl object-contain shadow-lg shadow-red-600/30 ring-2 ring-red-500/40"
              />
            ) : (
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-red-500/40 bg-gradient-to-br from-red-600/30 to-red-900/40 shadow-lg shadow-red-600/20">
                <Film className="h-5 w-5 text-red-300" strokeWidth={2.4} />
              </div>
            )}
            <div className="flex flex-col leading-tight">
              <div className="flex items-baseline">
                <span className="text-lg font-black tracking-tight text-white">
                  {(SITE_NAME || "SM Movies").split(" ")[0]}
                </span>
                <span className="ml-1 text-lg font-black tracking-tight text-red-500">
                  {(SITE_NAME || "SM Movies").split(" ")[1] || ""}
                </span>
              </div>
              <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-red-400/80">
                HD • 4K • Web Series
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close menu"
            className="rounded-xl border border-white/10 bg-white/[0.04] p-2 text-slate-300 transition-all hover:border-red-400/40 hover:bg-red-500/15 hover:text-white"
          >
            <X className="h-5 w-5" strokeWidth={2.4} />
          </button>
        </div>

        {/* Scroll body */}
        <div className="relative z-10 flex-1 overflow-y-auto pb-6">
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
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/15 bg-white/10">
                <Home className="h-4.5 w-4.5" strokeWidth={2.4} />
              </span>
              <span className="flex-1 text-left">Home</span>
              <Sparkles className="h-4 w-4 opacity-80" strokeWidth={2.2} />
            </button>
          </nav>

          {/* Categories */}
          <div className="px-3 pb-4">
            <h3 className="flex items-center gap-2 px-2 pb-2.5 pt-1 text-[11px] font-bold uppercase tracking-[0.18em] text-red-300/80">
              <span className="h-px flex-1 bg-gradient-to-r from-red-500/40 to-transparent" />
              Browse Categories
              <span className="h-px flex-1 bg-gradient-to-l from-red-500/40 to-transparent" />
            </h3>
            <ul className="category-list grid grid-cols-1 gap-1.5">
              {categories
                .filter((c) => c.slug)
                .map((cat) => {
                  const active = selectedCategory === cat.slug;
                  const Icon = iconForCategory(cat.slug, cat.name);
                  return (
                    <li key={cat.slug}>
                      <button
                        onClick={() => {
                          onSelectCategory(cat.slug);
                          onClose();
                        }}
                        className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all ${
                          active
                            ? "bg-gradient-to-r from-red-600/80 to-red-500/50 text-white shadow-md shadow-red-600/20 ring-1 ring-red-400/40"
                            : "border border-transparent text-slate-300 hover:border-white/10 hover:bg-white/[0.04] hover:text-white"
                        }`}
                      >
                        <span
                          className={`inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg transition-all ${
                            active
                              ? "bg-white/15 text-white ring-1 ring-white/30"
                              : "bg-white/[0.04] text-red-300/90 ring-1 ring-white/5 group-hover:bg-red-500/15 group-hover:text-red-200"
                          }`}
                        >
                          <Icon className="h-4 w-4" strokeWidth={2.3} />
                        </span>
                        <span className="flex-1 truncate text-left">{cat.name}</span>
                        <ChevronRight
                          className={`h-4 w-4 transition-transform ${
                            active
                              ? "text-white"
                              : "text-slate-500 group-hover:translate-x-0.5 group-hover:text-white"
                          }`}
                          strokeWidth={2.4}
                        />
                      </button>
                    </li>
                  );
                })}
            </ul>
          </div>

          {/* Channels */}
          <div className="space-y-2.5 px-3 pb-2">
            <h3 className="flex items-center gap-2 px-2 pb-1 text-[11px] font-bold uppercase tracking-[0.18em] text-red-300/80">
              <span className="h-px flex-1 bg-gradient-to-r from-red-500/40 to-transparent" />
              Join Community
              <span className="h-px flex-1 bg-gradient-to-l from-red-500/40 to-transparent" />
            </h3>

            <a
              href={WHATSAPP_CHANNEL_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 rounded-2xl border border-emerald-400/30 bg-gradient-to-br from-emerald-500/15 via-green-500/10 to-emerald-700/10 p-3.5 transition-all hover:scale-[1.01] hover:border-emerald-300/60 hover:from-emerald-500/25 active:scale-[0.98]"
            >
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-400/40 bg-emerald-500/20 text-emerald-200 shadow-md shadow-emerald-600/20">
                <MessageCircle className="h-5 w-5" strokeWidth={2.3} />
              </span>
              <span className="flex flex-1 flex-col">
                <span className="text-sm font-bold text-white">WhatsApp Channel</span>
                <span className="text-[11px] text-emerald-200/80">Updates & backup links</span>
              </span>
              <ChevronRight className="h-4 w-4 text-emerald-200" strokeWidth={2.4} />
            </a>

            <a
              href={TELEGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 rounded-2xl border border-sky-400/30 bg-gradient-to-br from-sky-500/15 via-sky-500/10 to-blue-600/10 p-3.5 transition-all hover:scale-[1.01] hover:border-sky-300/60 hover:from-sky-500/25 active:scale-[0.98]"
            >
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-sky-400/40 bg-sky-500/20 text-sky-200 shadow-md shadow-sky-600/20">
                <Send className="h-5 w-5" strokeWidth={2.2} />
              </span>
              <span className="flex flex-1 flex-col">
                <span className="text-sm font-bold text-white">Telegram Group</span>
                <span className="text-[11px] text-sky-200/80">Get latest movies first</span>
              </span>
              <ChevronRight className="h-4 w-4 text-sky-200" strokeWidth={2.4} />
            </a>
          </div>

          <p className="px-5 pt-4 text-center text-[10px] text-slate-600">
            © {new Date().getFullYear()} {SITE_NAME || "SM Movies"} · Made with ❤️
          </p>
        </div>
      </aside>
    </>
  );
}
