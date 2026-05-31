import type { Movie } from "../types";
import { useState } from "react";
import { Film, Play, Sparkles } from "lucide-react";

interface PosterCardProps {
  movie: Movie;
  onClick: (movie: Movie) => void;
}

export default function PosterCard({ movie, onClick }: PosterCardProps) {
  const [imgError, setImgError] = useState(false);

  const fallback =
    "data:image/svg+xml," +
    encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="600" viewBox="0 0 400 600">
        <defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#18181b"/><stop offset="100%" style="stop-color:#0c0a09"/>
        </linearGradient></defs>
        <rect width="400" height="600" fill="url(#g)"/>
        <text x="200" y="320" text-anchor="middle" fill="#f59e0b" font-size="56" font-family="sans-serif">🎬</text>
      </svg>`
    );

  const getQualityStyle = (q: string) => {
    const u = q.toUpperCase();
    if (u.includes("4K") || u.includes("2160")) return "bg-gradient-to-r from-fuchsia-600 to-violet-700 text-white";
    if (u.includes("HDTC") || u.includes("CAM")) return "bg-gradient-to-r from-amber-600 to-orange-700 text-white";
    if (u.includes("WEB") || u.includes("BLURAY") || u.includes("HD"))
      return "bg-gradient-to-r from-emerald-500 to-teal-600 text-white";
    return "bg-zinc-800/90 text-zinc-100";
  };

  return (
    <button
      onClick={() => onClick(movie)}
      className="group block w-full text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 rounded-2xl"
    >
      <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-zinc-900/60 shadow-lg shadow-black/40 ring-1 ring-white/[0.03] transition-all duration-500 group-hover:-translate-y-1.5 group-hover:border-amber-400/40 group-hover:shadow-2xl group-hover:shadow-amber-500/20">
        <div className="relative aspect-[2/3] overflow-hidden">
          <img
            src={imgError ? fallback : movie.imageUrl || fallback}
            alt={movie.title}
            onError={() => setImgError(true)}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
          />

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent opacity-70 transition-opacity duration-300 group-hover:opacity-95" />

          {/* Hover play badge */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-all duration-300 group-hover:opacity-100">
            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/30 bg-amber-500/90 text-zinc-950 shadow-2xl shadow-amber-500/50 backdrop-blur-xl scale-75 transition-transform duration-300 group-hover:scale-100">
              <Play className="h-5 w-5" strokeWidth={2.5} fill="currentColor" />
            </div>
          </div>

          {/* Quality badge */}
          {movie.quality && (
            <span
              className={`absolute right-2 top-2 inline-flex items-center gap-1 rounded-lg border border-white/20 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider shadow-lg backdrop-blur-xl ${getQualityStyle(
                movie.quality
              )}`}
            >
              <Sparkles className="h-2.5 w-2.5" strokeWidth={3} />
              {movie.quality}
            </span>
          )}

          {/* Category chip bottom-left */}
          <span className="absolute bottom-2 left-2 inline-flex items-center gap-1 rounded-md border border-white/10 bg-black/60 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-amber-300 backdrop-blur-xl">
            <Film className="h-2.5 w-2.5" strokeWidth={2.5} />
            HD
          </span>
        </div>

        <div className="p-3">
          <p className="line-clamp-2 text-sm font-bold leading-snug text-white transition-colors duration-300 group-hover:text-amber-300">
            {movie.title}
          </p>
        </div>
      </div>
    </button>
  );
}
