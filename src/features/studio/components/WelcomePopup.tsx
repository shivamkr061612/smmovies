import { useEffect, useState } from "react";
import { Heart, MessageCircle, Sparkles, X, AlertTriangle, ExternalLink } from "lucide-react";
import { SITE_LOGO, SITE_NAME, WHATSAPP_CHANNEL_URL } from "../config/site";

const STORAGE_KEY = "sm_welcome_seen_v1";

export default function WelcomePopup() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(STORAGE_KEY)) {
        const t = setTimeout(() => setOpen(true), 600);
        return () => clearTimeout(t);
      }
    } catch {
      setOpen(true);
    }
  }, []);

  const close = () => {
    setOpen(false);
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {}
  };

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto bg-black/80 backdrop-blur-md">
      <div className="flex min-h-full items-center justify-center p-3 sm:p-4">
        {/* Main Card Wrapper */}
        <div className="relative my-auto w-full max-w-md rounded-3xl border border-red-500/30 bg-gradient-to-br from-[#1a0707] via-[#0a0a0a] to-[#100303] shadow-2xl shadow-red-900/40 ring-1 ring-white/5 animate-in fade-in zoom-in-95 duration-300">
        
        {/* Glow */}
        <div className="pointer-events-none absolute -top-24 left-1/2 h-48 w-48 -translate-x-1/2 rounded-full bg-red-600/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 right-0 h-40 w-40 rounded-full bg-red-700/20 blur-3xl" />

        {/* Close Button - Made sticky so it stays visible even if user scrolls inside the popup */}
        <button
          onClick={close}
          aria-label="Close"
          className="absolute right-3 top-3 z-20 flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-black/50 text-slate-300 backdrop-blur transition-all hover:border-red-400/40 hover:bg-red-500/20 hover:text-white"
        >
          <X className="h-4 w-4" strokeWidth={2.5} />
        </button>

        <div className="relative px-5 pb-6 pt-8 sm:px-7 sm:pt-8">
          {/* Logo */}
          <div className="mb-4 flex justify-center">
            {SITE_LOGO ? (
              <img
                src={SITE_LOGO}
                alt={SITE_NAME}
                className="h-20 w-20 rounded-2xl object-contain ring-2 ring-red-500/30 shadow-lg shadow-red-600/30"
              />
            ) : (
              <Sparkles className="h-12 w-12 text-red-500" />
            )}
          </div>

          {/* Title */}
          <div className="text-center">
            <div className="mb-1 inline-flex items-center gap-1.5 rounded-full border border-red-400/30 bg-red-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-red-300">
              <Sparkles className="h-3 w-3" strokeWidth={2.5} />
              Welcome to {SITE_NAME}
            </div>
            <h2 className="mt-2 text-2xl font-black text-white sm:text-[26px]">
              Hello Movie Lover! <span className="inline-block animate-bounce">👋</span>
            </h2>
            <p className="mt-2.5 text-[13px] leading-relaxed text-slate-300 sm:text-sm">
              Hamari website <span className="font-bold text-white">bilkul nayi</span> hai aur
              hum har din ise behtar bana rahe hain. Aapka pyaar aur support hi humari
              taqat hai <Heart className="inline h-3.5 w-3.5 fill-red-500 text-red-500" />
            </p>
          </div>

          {/* Note */}
          <div className="mt-5 flex gap-3 rounded-2xl border border-amber-400/25 bg-gradient-to-br from-amber-500/10 to-orange-500/5 p-3.5">
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl border border-amber-400/40 bg-amber-500/15">
              <AlertTriangle className="h-4 w-4 text-amber-300" strokeWidth={2.4} />
            </div>
            <div className="flex-1">
              <p className="text-[11px] font-bold uppercase tracking-wider text-amber-300">
                Important Note
              </p>
              <p className="mt-1 text-[12px] leading-relaxed text-slate-200">
                Yeh website kabhi bhi band ho sakti hai. Aapko update milte rahein iske liye
                hamare <span className="font-bold text-white">WhatsApp Channel</span> ko zaroor join karein.
              </p>
            </div>
          </div>

          {/* CTA */}
          <a
            href={WHATSAPP_CHANNEL_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={close}
            className="group mt-5 flex w-full items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-600 px-5 py-3.5 text-sm font-black text-white shadow-lg shadow-emerald-600/40 ring-1 ring-emerald-300/40 transition-all hover:scale-[1.02] hover:shadow-xl hover:shadow-emerald-500/50 active:scale-[0.98]"
          >
            <MessageCircle className="h-5 w-5" strokeWidth={2.6} />
            Join WhatsApp Channel
            <ExternalLink className="h-3.5 w-3.5 opacity-80 transition-transform group-hover:translate-x-0.5" strokeWidth={2.6} />
          </a>

          {/* Cleaned up Maybe Later button */}
          <button
            onClick={close}
            className="mt-2.5 w-full rounded-xl px-4 py-2 text-xs font-semibold text-slate-400 transition-colors hover:text-white"
          >
            Maybe later
          </button>
        </div>
      </div>
    </div>
  );
}
