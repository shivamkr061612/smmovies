import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Play, Flame, Star } from "lucide-react";
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
      <div className="relative aspect-[4/5] sm:aspect-[16/9] lg:aspect-[21/9] overflow-hidden rounded-3xl border border-white/[0.08] bg-zinc-950 shadow-2xl shadow-black/60 ring-1 ring-amber-500/10">
        {slides.map((m, i) => (
          <div
            key={m.id}
            className={`absolute inset-0 transition-opacity duration-1000 ease-out ${
              i === index ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
          >
            {m.imageUrl && (
              <img
                src={m.imageUrl}
                alt={m.title}
                className="absolute inset-0 h-full w-full object-cover scale-105"
                loading={i === 0 ? "eager" : "lazy"}
              />
            )}
            {/* Cinematic gradient overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/70 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/40 to-transparent sm:from-zinc-950/95" />
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-transparent to-fuchsia-500/10" />

            <div className="relative flex h-full flex-col justify-end p-5 sm:justify-center sm:p-10 md:p-14 max-w-2xl">
              {/* Featured chip */}
              <div className="mb-3 inline-flex w-fit items-center gap-1.5 rounded-full border border-amber-400/40 bg-amber-500/15 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-amber-300 backdrop-blur-xl">
                <Flame className="h-3 w-3 fill-amber-400 text-amber-400" strokeWidth={2.5} />
                Featured
              </div>

              <h3 className="text-2xl font-black leading-tight text-white drop-shadow-2xl sm:text-3xl md:text-5xl">
                {m.title}
              </h3>

              <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-zinc-300 sm:text-sm">
                {m.quality && (
                  <span className="inline-flex items-center gap-1 rounded-md border border-white/20 bg-white/10 px-2 py-0.5 font-bold backdrop-blur-xl">
                    {m.quality}
                  </span>
                )}
                <span className="inline-flex items-center gap-1 text-amber-400">
                  <Star className="h-3.5 w-3.5 fill-current" strokeWidth={2} />
                  <Star className="h-3.5 w-3.5 fill-current" strokeWidth={2} />
                  <Star className="h-3.5 w-3.5 fill-current" strokeWidth={2} />
                  <Star className="h-3.5 w-3.5 fill-current" strokeWidth={2} />
                  <Star className="h-3.5 w-3.5 fill-current opacity-40" strokeWidth={2} />
                </span>
              </div>

              {m.description && (
                <p className="mt-3 hidden text-sm leading-relaxed text-zinc-300/90 line-clamp-2 sm:block md:text-base">
                  {m.description}
                </p>
              )}

              <div className="mt-5 flex items-center gap-2.5 sm:mt-7 sm:gap-3">
                <button
                  onClick={() => onOpenMovie(m)}
                  className="group inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-amber-400 to-fuchsia-500 px-5 py-3 text-sm font-black text-zinc-950 shadow-xl shadow-amber-500/40 transition-all hover:scale-105 hover:shadow-amber-500/60 active:scale-95 sm:px-7 sm:py-3.5 sm:text-base"
                >
                  <Play className="h-4 w-4 fill-current sm:h-5 sm:w-5" />
                  Watch Now
                </button>
                <button
                  onClick={() => onOpenMovie(m)}
                  className="inline-flex items-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-sm font-bold text-white backdrop-blur-2xl transition-all hover:bg-white/20 active:scale-95 sm:px-5 sm:py-3.5"
                >
                  More info
                </button>
              </div>
            </div>
          </div>
        ))}

        {/* Arrows */}
        <button
          onClick={prev}
          aria-label="Previous"
          className="absolute left-2 top-1/2 z-10 -translate-y-1/2 rounded-full border border-white/20 bg-zinc-950/60 p-2 text-white shadow-lg backdrop-blur-xl transition-all hover:bg-amber-500/30 hover:border-amber-400/50 active:scale-90 sm:left-4 sm:p-2.5"
        >
          <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={2.5} />
        </button>
        <button
          onClick={next}
          aria-label="Next"
          className="absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-full border border-white/20 bg-zinc-950/60 p-2 text-white shadow-lg backdrop-blur-xl transition-all hover:bg-amber-500/30 hover:border-amber-400/50 active:scale-90 sm:right-4 sm:p-2.5"
        >
          <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={2.5} />
        </button>

        {/* Dots */}
        <div className="absolute bottom-3 left-1/2 z-10 -translate-x-1/2 flex items-center gap-1.5 rounded-full border border-white/15 bg-zinc-950/60 px-3 py-1.5 backdrop-blur-xl sm:bottom-5">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              aria-label={`Slide ${i + 1}`}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === index
                  ? "w-8 bg-gradient-to-r from-amber-400 to-fuchsia-500"
                  : "w-1.5 bg-white/40 hover:bg-white/70"
              }`}
            />
          ))}
        </div>
      </div>
      <span className="sr-only">{current.title}</span>
    </div>
  );
}
