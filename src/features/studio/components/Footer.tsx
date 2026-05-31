import { Flame, Send, Heart } from "lucide-react";
import { FOOTER_AD_HTML, SITE_LOGO, SITE_NAME } from "../config/site";

const TELEGRAM_URL = "https://t.me/+FSWElNbfXwdjYWNl";

export default function Footer() {
  return (
    <footer className="relative mt-16 border-t border-white/[0.06] bg-gradient-to-b from-zinc-950 to-black py-10">
      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-amber-500 to-transparent opacity-60" />

      <div className="mx-auto max-w-7xl px-4 text-center">
        {FOOTER_AD_HTML && (
          <div className="mb-6" dangerouslySetInnerHTML={{ __html: FOOTER_AD_HTML }} />
        )}

        <div className="flex items-center justify-center gap-2.5">
          {SITE_LOGO ? (
            <img src={SITE_LOGO} alt={SITE_NAME || "logo"} className="h-9 object-contain" />
          ) : (
            <>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 via-orange-500 to-fuchsia-600 shadow-lg shadow-amber-500/30">
                <Flame className="h-5 w-5 text-zinc-950" strokeWidth={2.5} fill="currentColor" />
              </div>
              <span className="text-lg font-black text-white">
                {(SITE_NAME || "SM Movies").split(" ")[0]}
                <span className="bg-gradient-to-r from-amber-400 to-fuchsia-500 bg-clip-text text-transparent">
                  {" " + ((SITE_NAME || "SM Movies").split(" ")[1] || "")}
                </span>
              </span>
            </>
          )}
        </div>

        <p className="mt-4 text-sm text-zinc-400">
          Your destination for the latest movies & web series in HD, 4K quality.
        </p>

        <a
          href={TELEGRAM_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-5 inline-flex items-center gap-2 rounded-full border border-sky-400/30 bg-gradient-to-r from-sky-500/15 to-cyan-500/10 px-5 py-2.5 text-sm font-bold text-sky-200 shadow-lg shadow-sky-500/10 transition-all hover:scale-105 hover:from-sky-500/25"
        >
          <Send className="h-4 w-4" strokeWidth={2.5} fill="currentColor" />
          Join Telegram
        </a>

        <p className="mt-6 flex items-center justify-center gap-1.5 text-xs text-zinc-600">
          © {new Date().getFullYear()} {SITE_NAME || "SM Movies"} · Crafted with
          <Heart className="h-3 w-3 fill-amber-400 text-amber-400" strokeWidth={2.5} />
        </p>
      </div>
    </footer>
  );
}
