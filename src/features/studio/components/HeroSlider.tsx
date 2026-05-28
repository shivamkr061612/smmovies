import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Download, Play } from "lucide-react";
import type { Movie } from "../types";

interface HeroSliderProps {
  movies: Movie[];
  onOpenMovie: (movie: Movie) => void;
}

export default function HeroSlider({ movies, onOpenMovie }: HeroSliderProps) {
  const [index, setIndex] = useState(0);
  const slides = (movies || []).slice(0, 5);
  const total = slides.length;

  useEffect(() => {
    if (total === 0) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % total), 5500);
    return () => clearInterval(t);
  }, [total]);

  if (total === 0) return null;

  const prev = () => setIndex((i) => (i - 1 + total) % total);
  const next = () => setIndex((i) => (i + 1) % total);
  const current = slides[index];

  return (
    <div className="relative">
      {/* Banner: proper cinematic aspect on desktop, taller poster-like on mobile */}
      <div className="relative aspect-[3/4] sm:aspect-[16/9] lg:aspect-[21/9] overflow-hidden rounded-3xl bg-slate-900 shadow-2xl ring-1 ring-white/10">
        {slides.map((m, i) => (
          <div
            key={m.id}
            className={`absolute inset-0 transition-opacity duration-700 ease-out ${
              i === index ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
          >
            {m.imageUrl && (
              <img
                src={m.imageUrl}
                alt={m.title}
                className="absolute inset-0 h-full w-full object-cover"
                loading={i === 0 ? "eager" : "lazy"}
              />
            )}
            {/* iOS-style frosted gradient overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-transparent to-transparent sm:from-black/80" />

            <div className="relative flex h-full flex-col justify-end p-4 sm:justify-center sm:p-8 md:p-10 max-w-2xl">
              <h3 className="text-lg font-extrabold leading-tight text-white drop-shadow-2xl sm:text-2xl md:text-4xl">
                {m.title}
              </h3>
              {m.description && (
                <p className="mt-2 hidden text-sm leading-relaxed text-slate-200 line-clamp-2 sm:block sm:mt-3 md:text-base">
                  {m.description}
                </p>
              )}
              <button
                onClick={() => onOpenMovie(m)}
                className="mt-4 inline-flex w-fit items-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white shadow-lg backdrop-blur-2xl transition-all hover:bg-white/20 hover:border-white/30 active:scale-95 sm:mt-6 sm:px-6 sm:py-3 sm:text-base"
              >
                <Play className="h-4 w-4 fill-current sm:h-5 sm:w-5" />
                Watch Now
              </button>
            </div>
          </div>
        ))}

        {/* Glass nav arrows */}
        <button
          onClick={prev}
          aria-label="Previous"
          className="absolute left-2 top-1/2 z-10 -translate-y-1/2 rounded-full border border-white/15 bg-white/10 p-2 text-white shadow-lg backdrop-blur-xl transition-all hover:bg-white/20 active:scale-90 sm:left-3 sm:p-2.5"
        >
          <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={2.5} />
        </button>
        <button
          onClick={next}
          aria-label="Next"
          className="absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-full border border-white/15 bg-white/10 p-2 text-white shadow-lg backdrop-blur-xl transition-all hover:bg-white/20 active:scale-90 sm:right-3 sm:p-2.5"
        >
          <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={2.5} />
        </button>

        {/* Glass dots */}
        <div className="absolute bottom-3 left-1/2 z-10 -translate-x-1/2 flex items-center gap-1.5 rounded-full border border-white/15 bg-black/30 px-3 py-1.5 backdrop-blur-xl sm:bottom-4">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              aria-label={`Slide ${i + 1}`}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === index ? "w-6 bg-white" : "w-1.5 bg-white/40 hover:bg-white/70"
              }`}
            />
          ))}
        </div>
      </div>
      {/* Hidden current title for SEO */}
      <span className="sr-only">{current.title}</span>
    </div>
  );
}
