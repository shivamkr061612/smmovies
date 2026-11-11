import type { Movie } from "../types";
import { useState } from "react";
import { Clapperboard } from "lucide-react";

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
          <stop offset="0%" style="stop-color:#1e1b4b"/><stop offset="100%" style="stop-color:#312e81"/>
        </linearGradient></defs>
        <rect width="400" height="600" fill="url(#g)"/>
        <text x="200" y="300" text-anchor="middle" fill="#818cf8" font-size="56" font-family="sans-serif">🎬</text>
        <text x="200" y="370" text-anchor="middle" fill="#c7d2fe" font-size="18" font-family="sans-serif">No Poster</text>
      </svg>`
    );

  // Determine quality badge style
  const getQualityStyle = (q: string) => {
    const u = q.toUpperCase();
    if (u.includes("4K") || u.includes("2160")) return "bg-rose-700 text-white";
    if (u.includes("HDTC") || u.includes("CAM")) return "bg-amber-600 text-white";
    if (u.includes("WEB") || u.includes("BLURAY") || u.includes("HD")) return "bg-emerald-600 text-white";
    return "bg-slate-700 text-white";
  };

  return (
    <button
      onClick={() => onClick(movie)}
      className="group block w-full rounded-2xl text-left transition-transform duration-300 hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-rose-400 focus:ring-offset-2 focus:ring-offset-wine-950"
    >
      <div className="poster-card site-glass relative overflow-hidden rounded-2xl shadow-lg transition-all duration-300 group-hover:border-rose-300/40 group-hover:shadow-2xl">
        {/* poster-inner */}
        <div className="poster-inner relative aspect-[2/3] overflow-hidden">
          {/* poster-image */}
          <div className="poster-image absolute inset-0">
            <img
              {imgError || !movie.imageUrl ? (
                <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-gradient-to-br from-wine-900 to-wine-950 text-rose-200/70">
                  <Clapperboard className="h-9 w-9" strokeWidth={1.5} />
                  <span className="px-4 text-center text-xs text-rose-100/70">Poster unavailable</span>
                </div>
              ) : (
                <img
                  src={movie.imageUrl}
                  alt={movie.title}
                  onError={() => setImgError(true)}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              )}
          </div>

          {/* Subtle hover overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-60 transition-opacity duration-300 group-hover:opacity-100" />

          {/* Glass quality badge */}
          {movie.quality && (
            <span
              className={`poster-quality absolute bottom-2 right-2 rounded-lg border border-white/25 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white shadow-lg backdrop-blur-xl ${getQualityStyle(
                movie.quality
              )}`}
            >
              {movie.quality}
            </span>
          )}
        </div>

        {/* poster-info */}
        <div className="poster-info p-3 sm:p-3.5">
          <p className="poster-title line-clamp-3 text-sm font-semibold leading-snug text-foreground transition-colors duration-300 group-hover:text-rose-200 sm:text-[0.95rem]">
            {movie.title}
          </p>
        </div>
      </div>
    </button>
  );
}
