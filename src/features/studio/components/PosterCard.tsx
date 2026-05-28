import type { Movie } from "../types";
import { useState } from "react";

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
    if (u.includes("4K") || u.includes("2160")) return "bg-purple-600 text-white";
    if (u.includes("HDTC") || u.includes("CAM")) return "bg-amber-600 text-white";
    if (u.includes("WEB") || u.includes("BLURAY") || u.includes("HD")) return "bg-emerald-600 text-white";
    return "bg-slate-700 text-white";
  };

  return (
    <button
      onClick={() => onClick(movie)}
      className="group block w-full text-left transition-transform duration-300 hover:-translate-y-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-950 rounded-2xl"
    >
      <div className="poster-card relative overflow-hidden rounded-2xl bg-slate-900 shadow-lg shadow-black/40 ring-1 ring-white/5 group-hover:ring-indigo-400/40 group-hover:shadow-2xl group-hover:shadow-indigo-500/20 transition-all duration-300">
        {/* poster-inner */}
        <div className="poster-inner relative aspect-[2/3] overflow-hidden">
          {/* poster-image */}
          <div className="poster-image absolute inset-0">
            <img
              src={imgError ? fallback : movie.imageUrl || fallback}
              alt={movie.title}
              onError={() => setImgError(true)}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
          </div>

          {/* Subtle hover overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-60 transition-opacity duration-300 group-hover:opacity-100" />

          {/* Glass quality badge */}
          {movie.quality && (
            <span
              className={`poster-quality absolute bottom-2 right-2 rounded-lg border border-white/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white shadow-lg backdrop-blur-xl ${getQualityStyle(
                movie.quality
              )}/80`}
            >
              {movie.quality}
            </span>
          )}
        </div>

        {/* poster-info */}
        <div className="poster-info p-3 sm:p-3.5">
          <p className="poster-title text-sm font-semibold leading-snug text-white line-clamp-3 group-hover:text-indigo-300 transition-colors duration-300 sm:text-[0.95rem]">
            {movie.title}
          </p>
        </div>
      </div>
    </button>
  );
}
