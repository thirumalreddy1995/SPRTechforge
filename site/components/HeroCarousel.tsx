// Full-width hero slider for the public website. Admin banners (images with
// headline/sub-text/button) replace the built-in slides when present. Rotates
// every 6 s, pauses on hover/touch, supports arrows, dots, swipe and keys.

import React, { useEffect, useRef, useState } from 'react';
import { SiteBanner } from '../types';

export interface HeroSlide {
  id: string;
  eyebrow?: string;
  title: React.ReactNode;
  subtitle: string;
  primary?: { label: string; onClick: () => void };
  secondary?: { label: string; onClick: () => void };
  imageUrl?: string;
  /** Tailwind gradient classes for slides without an image */
  gradient?: string;
}

const AUTOPLAY_MS = 6000;

export const bannerToSlide = (b: SiteBanner, go: (url: string) => void): HeroSlide => ({
  id: b.id,
  title: b.title,
  subtitle: b.subtitle,
  imageUrl: b.imageUrl,
  primary: b.ctaLabel ? { label: b.ctaLabel, onClick: () => go(b.ctaUrl) } : undefined,
});

export const HeroCarousel: React.FC<{ slides: HeroSlide[] }> = ({ slides }) => {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchX = useRef<number | null>(null);
  const count = slides.length;

  useEffect(() => { if (index >= count) setIndex(0); }, [count, index]);
  useEffect(() => {
    if (paused || count < 2) return;
    const t = setInterval(() => setIndex(i => (i + 1) % count), AUTOPLAY_MS);
    return () => clearInterval(t);
  }, [paused, count]);

  const go = (d: number) => count && setIndex(i => (i + d + count) % count);
  if (count === 0) return null;

  return (
    <header
      className="relative min-h-[600px] md:min-h-[680px] lg:min-h-[740px] bg-[#081538] overflow-hidden text-white select-none"
      onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}
      onTouchStart={e => { touchX.current = e.touches[0].clientX; setPaused(true); }}
      onTouchEnd={e => { const s = touchX.current; touchX.current = null; setPaused(false); if (s !== null) { const dx = e.changedTouches[0].clientX - s; if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1); } }}
      tabIndex={0} onKeyDown={e => { if (e.key === 'ArrowRight') go(1); if (e.key === 'ArrowLeft') go(-1); }}
      aria-roledescription="carousel" aria-label="Highlights"
    >
      {slides.map((s, i) => (
        <div key={s.id} className={`absolute inset-0 transition-opacity duration-1000 ${i === index ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`} aria-hidden={i !== index}>
          {s.imageUrl ? (
            <>
              <img src={s.imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover" loading={i === 0 ? 'eager' : 'lazy'} draggable={false} />
              <div className="absolute inset-0 bg-gradient-to-r from-[#081538]/90 via-[#081538]/60 to-[#081538]/20" />
            </>
          ) : (
            <div className={`absolute inset-0 bg-gradient-to-br ${s.gradient || 'from-[#1a3478] via-[#0b1c54] to-[#020617]'}`}>
              <div className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
              <div className="absolute -top-32 right-[-10%] w-[700px] h-[700px] bg-blue-500/20 blur-[160px] rounded-full" />
              <div className="absolute bottom-[-20%] left-[-5%] w-[600px] h-[600px] bg-amber-500/10 blur-[140px] rounded-full" />
            </div>
          )}
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full min-h-[600px] md:min-h-[680px] lg:min-h-[740px] flex items-center pt-24 pb-24">
            <div className="max-w-3xl">
              {s.eyebrow && (
                <div className="inline-flex items-center gap-2.5 bg-white/10 border border-white/15 px-4 py-2 rounded-full mb-6 backdrop-blur-sm">
                  <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                  <span className="text-emerald-200 font-bold tracking-[0.22em] uppercase text-[11px]">{s.eyebrow}</span>
                </div>
              )}
              <h1 className="text-4xl sm:text-5xl lg:text-[64px] font-black leading-[1.05] tracking-tight mb-6 drop-shadow">{s.title}</h1>
              <p className="text-lg md:text-xl text-blue-100/80 mb-9 leading-relaxed max-w-2xl font-medium">{s.subtitle}</p>
              <div className="flex flex-col sm:flex-row gap-3">
                {s.primary && <button onClick={s.primary.onClick} className="bg-amber-400 hover:bg-amber-300 text-amber-950 font-black px-8 py-4 rounded-2xl shadow-[0_15px_40px_rgba(0,0,0,0.35)] hover:scale-[1.03] transition-all text-base">{s.primary.label}</button>}
                {s.secondary && <button onClick={s.secondary.onClick} className="border-2 border-white/30 text-white font-black px-8 py-4 rounded-2xl hover:bg-white/10 hover:scale-[1.03] transition-all text-base backdrop-blur-sm">{s.secondary.label}</button>}
              </div>
            </div>
          </div>
        </div>
      ))}

      {count > 1 && (
        <>
          <button onClick={() => go(-1)} aria-label="Previous slide" className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/10 hover:bg-white/25 border border-white/20 items-center justify-center text-2xl font-black">‹</button>
          <button onClick={() => go(1)} aria-label="Next slide" className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/10 hover:bg-white/25 border border-white/20 items-center justify-center text-2xl font-black">›</button>
          <div className="absolute bottom-8 inset-x-0 z-20 flex justify-center gap-2">
            {slides.map((s, i) => (
              <button key={s.id} onClick={() => setIndex(i)} aria-label={`Go to slide ${i + 1}`} className={`h-2 rounded-full transition-all ${i === index ? 'w-8 bg-amber-400' : 'w-2 bg-white/40 hover:bg-white/70'}`} />
            ))}
          </div>
        </>
      )}
      <div className="absolute bottom-0 left-0 right-0 z-20 pointer-events-none">
        <svg viewBox="0 0 1440 60" className="w-full block" fill="white" preserveAspectRatio="none"><path d="M0,30 C480,60 960,0 1440,30 L1440,60 L0,60 Z" /></svg>
      </div>
    </header>
  );
};
