// A single-row, left-to-right carousel used by the testimonials and the photo
// gallery. Cards keep one fixed size, the row scrolls with snap points, arrows
// step one card, and it auto-advances (pausing on hover, touch or when the tab
// is hidden). Works with plain touch scrolling on phones.

import React, { useCallback, useEffect, useRef, useState } from 'react';

interface Props {
  children: React.ReactNode[];
  /** Tailwind width classes for one card, e.g. 'w-[280px] sm:w-[320px]'. */
  cardClass: string;
  autoplayMs?: number;
  ariaLabel: string;
  /** Dark chrome (arrows/dots) for dark backgrounds. */
  dark?: boolean;
}

export const HorizontalCarousel: React.FC<Props> = ({ children, cardClass, autoplayMs = 4000, ariaLabel, dark = false }) => {
  const track = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);
  const [index, setIndex] = useState(0);
  const count = children.length;

  const cardStep = () => {
    const el = track.current;
    if (!el || !el.firstElementChild) return 0;
    const first = el.firstElementChild as HTMLElement;
    const gap = parseFloat(getComputedStyle(el).columnGap || '0') || 0;
    return first.getBoundingClientRect().width + gap;
  };

  const scrollToIndex = useCallback((i: number, smooth = true) => {
    const el = track.current;
    if (!el) return;
    el.scrollTo({ left: i * cardStep(), behavior: smooth ? 'smooth' : 'auto' });
  }, []);

  const go = useCallback((d: number) => {
    const el = track.current;
    if (!el || count === 0) return;
    const step = cardStep();
    const visible = Math.max(1, Math.floor(el.clientWidth / (step || 1)));
    const maxIndex = Math.max(0, count - visible);
    let next = index + d;
    if (next > maxIndex) next = 0;          // wrap to the start
    if (next < 0) next = maxIndex;
    setIndex(next);
    scrollToIndex(next);
  }, [count, index, scrollToIndex]);

  // Keep `index` in sync when the user scrolls by touch/trackpad.
  useEffect(() => {
    const el = track.current;
    if (!el) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => { const s = cardStep(); if (s) setIndex(Math.round(el.scrollLeft / s)); });
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => { el.removeEventListener('scroll', onScroll); cancelAnimationFrame(raf); };
  }, []);

  // Autoplay.
  useEffect(() => {
    if (paused || count < 2 || autoplayMs <= 0) return;
    const t = setInterval(() => { if (document.visibilityState === 'visible') go(1); }, autoplayMs);
    return () => clearInterval(t);
  }, [paused, count, autoplayMs, go]);

  if (count === 0) return null;
  const btn = `absolute top-1/2 -translate-y-1/2 z-10 w-10 h-10 sm:w-11 sm:h-11 rounded-full border flex items-center justify-center text-2xl font-black shadow-lg transition-colors ${dark ? 'bg-white/10 hover:bg-white/25 border-white/20 text-white' : 'bg-white hover:bg-gray-50 border-gray-200 text-gray-800'}`;

  return (
    <div
      className="relative"
      onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}
      onTouchStart={() => setPaused(true)} onTouchEnd={() => setPaused(false)}
      onFocus={() => setPaused(true)} onBlur={() => setPaused(false)}
      role="region" aria-roledescription="carousel" aria-label={ariaLabel}
    >
      <div
        ref={track}
        className="flex gap-4 sm:gap-6 overflow-x-auto snap-x snap-mandatory scroll-smooth px-1 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {children.map((child, i) => (
          <div key={i} className={`snap-start shrink-0 ${cardClass}`}>{child}</div>
        ))}
      </div>
      {count > 1 && (
        <>
          <button type="button" onClick={() => go(-1)} aria-label="Previous" className={`${btn} left-0 sm:-left-3`}>‹</button>
          <button type="button" onClick={() => go(1)} aria-label="Next" className={`${btn} right-0 sm:-right-3`}>›</button>
          <div className="flex justify-center gap-1.5 mt-5">
            {children.map((_, i) => (
              <button key={i} type="button" onClick={() => { setIndex(i); scrollToIndex(i); }} aria-label={`Go to item ${i + 1}`} className={`h-1.5 rounded-full transition-all ${i === index ? 'w-6 bg-blue-600' : `w-1.5 ${dark ? 'bg-white/40' : 'bg-gray-300'}`}`} />
            ))}
          </div>
        </>
      )}
    </div>
  );
};
