import { useEffect, useRef, useState } from "react";

interface Slide {
  id: string;
  imageUrl: string;
  label?: string;
}

export default function MobileHeaderSlider() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [slides, setSlides] = useState<Slide[]>([]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    // Collect images from .hero-slider and .poster-card on the page and use their length
    const imgs: string[] = [];
    const heroImgs = Array.from(document.querySelectorAll('.hero-slider .hero-banner img')) as HTMLImageElement[];
    heroImgs.forEach((i) => {
      const src = i.getAttribute('src') || i.getAttribute('data-src') || '';
      if (src) imgs.push(src);
    });
    const posterImgs = Array.from(document.querySelectorAll('.poster-card img')) as HTMLImageElement[];
    posterImgs.forEach((i) => {
      const src = i.getAttribute('src') || i.getAttribute('data-src') || '';
      if (src) imgs.push(src);
    });
    // Deduplicate and keep order, cap at 6 slides
    const unique = Array.from(new Set(imgs)).filter(Boolean).slice(0, 6);
    if (unique.length) {
      setSlides(unique.map((u, idx) => ({ id: `m-${idx}`, imageUrl: u, label: 'NETFLIX' })));
    } else {
      // no images found: do not render the slider
      setSlides([]);
    }
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onScroll = () => {
      const w = el.clientWidth;
      const s = el.scrollLeft;
      const idx = Math.round(s / w);
      setIndex(idx);
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, [containerRef]);

  if (!slides.length) return null;

  return (
    <div className="mobile-header-slider sm:hidden">
      <div ref={containerRef} className="mhs-track">
        {slides.map((s, i) => (
          <div className="mhs-slide" key={s.id}>
            <img src={s.imageUrl} alt={s.label || ''} className="mhs-img" />
            <div className="mhs-overlay">
              <span className="mhs-stroke">{s.label || 'NETFLIX'}</span>
            </div>
            <div className="mhs-index mhs-index-large">{i + 1}</div>
          </div>
        ))}
      </div>
      <div className="mhs-dots">
        {slides.map((_, i) => (
          <button
            key={i}
            className={`mhs-dot ${i === index ? 'active' : ''}`}
            onClick={() => {
              const el = containerRef.current;
              if (!el) return;
              el.scrollTo({ left: i * el.clientWidth, behavior: 'smooth' });
            }}
          >
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  );
}
