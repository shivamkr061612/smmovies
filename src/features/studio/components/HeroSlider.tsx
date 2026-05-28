import { useState, useEffect } from "react";
import type { Movie } from "../types";

interface HeroSliderProps {
  movies: Movie[];
  onOpenMovie: (movie: Movie) => void;
}

export default function HeroSlider({ movies, onOpenMovie }: HeroSliderProps) {
  const [index, setIndex] = useState(0);
  const [parsed, setParsed] = useState<Movie[] | null>(null);
  const source = (movies && movies.length > 0) ? movies : (parsed || []);
  const slides = source.slice(0, 5);
  const total = slides.length;

  useEffect(() => {
    if (total === 0) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % total), 5500);
    return () => clearInterval(t);
  }, [total]);

  // If `movies` prop is empty, attempt to parse `.hero-slider` HTML on the page
  useEffect(() => {
    if (movies && movies.length > 0) return;
    try {
      const root = document.querySelector('.hero-slider');
      if (!root) return;
      const banners = Array.from(root.querySelectorAll('.hero-banner')) as Element[];
      if (!banners.length) return;
      const parsedSlides: Movie[] = banners.map((b, idx) => {
        const imgEl = b.querySelector('.hero-image img') as HTMLImageElement | null;
        const titleEl = b.querySelector('.hero-title') as HTMLElement | null;
        const descEl = b.querySelector('.hero-description') as HTMLElement | null;
        const a = b.querySelector('a.btn, a') as HTMLAnchorElement | null;
        const title = titleEl?.textContent?.trim() || '';
        const description = descEl?.textContent?.trim() || '';
        const imageUrl = imgEl?.getAttribute('src') || imgEl?.getAttribute('data-src') || '';
        const downloadUrl = a?.getAttribute('href') || '';
        return {
          id: `hero-${idx}`,
          title,
          description,
          imageUrl,
          downloadUrl,
        } as Movie;
      });
      setParsed(parsedSlides);
    } catch (err) {
      // ignore parse errors
    }
  }, [movies]);

  if (total === 0) return null;

  const prev = () => setIndex((i) => (i - 1 + total) % total);
  const next = () => setIndex((i) => (i + 1) % total);

  return (
    <div className="relative">
      <div className="relative aspect-[16/9] overflow-hidden rounded bg-slate-900 shadow-2xl ring-1 ring-white/10 ">
        {slides.map((m, i) => (
          <div
            key={m.id}
            className={`absolute inset-0 transition-opacity duration-700 ease-out ${
              i === index ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
          >
            {/* Background image */}
            {m.imageUrl && (
              <img
                src={m.imageUrl}
                alt={m.title}
                className="absolute inset-0 h-full w-full object-cover"
                loading={i === 0 ? "eager" : "lazy"}
              />
            )}
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-950/70 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />

            {/* Content */}
            <div className="relative flex h-full flex-col justify-center p-5 sm:p-8 md:p-10 max-w-2xl">
              <h3 className="text-md font-extrabold leading-tight text-white drop-shadow-lg">
                {m.title}
              </h3>
              {m.description && (
                <p className="mt-2 text-xs leading-relaxed text-slate-200 line-clamp-3 sm:mt-3 sm:text-sm md:text-base">
                  {m.description}
                </p>
              )}
              <button
                onClick={() => onOpenMovie(m)}
                className="mt-4 inline-flex w-fit items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/40 transition-all hover:bg-indigo-500 hover:shadow-indigo-500/50 active:scale-95 sm:mt-6 sm:px-6 sm:py-3 sm:text-base"
              >
                Download Now
              </button>
            </div>
          </div>
        ))}

        {/* Prev/Next arrows */}
        <button
          onClick={prev}
          aria-label="Previous"
          className="absolute left-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white backdrop-blur-md transition-all hover:bg-black/60 active:scale-95 sm:left-3"
        >
          <svg className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button
          onClick={next}
          aria-label="Next"
          className="absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white backdrop-blur-md transition-all hover:bg-black/60 active:scale-95 sm:right-3"
        >
          <svg className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Dots */}
      <div className="mt-4 flex items-center justify-center gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            aria-label={`Slide ${i + 1}`}
            className={`h-2 rounded-full transition-all duration-300 ${
              i === index ? "w-8 bg-indigo-500" : "w-2 bg-white/20 hover:bg-white/40"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
