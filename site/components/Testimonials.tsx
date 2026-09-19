// Student success stories: each testimonial is one designed image card uploaded
// by the admin. Same-size cards in a single row that scrolls left to right
// (auto-advancing, with arrows); tap a card to enlarge it. Renders nothing when
// no approved image testimonials exist.

import React, { useEffect, useState } from 'react';
import { SiteTestimonial } from '../types';
import { HorizontalCarousel } from './HorizontalCarousel';

export const Testimonials: React.FC<{ items: SiteTestimonial[] }> = ({ items }) => {
  const cards = items.filter(t => t.photoUrl).slice(0, 16);
  const [open, setOpen] = useState<number | null>(null);
  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(null);
      if (e.key === 'ArrowRight') setOpen(i => (i === null ? null : (i + 1) % cards.length));
      if (e.key === 'ArrowLeft') setOpen(i => (i === null ? null : (i - 1 + cards.length) % cards.length));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, cards.length]);
  if (cards.length === 0) return null;
  return (
    <section id="testimonials" className="py-24 bg-gradient-to-b from-gray-50 to-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="inline-block text-blue-600 font-black uppercase tracking-[0.3em] text-xs mb-3">Student stories</span>
          <h2 className="text-3xl md:text-5xl font-black text-gray-900 tracking-tight">Students success stories</h2>
        </div>
        <HorizontalCarousel cardClass="w-[260px] sm:w-[300px]" ariaLabel="Student success stories" autoplayMs={4500}>
          {cards.map((t, i) => (
            <button key={t.id} type="button" onClick={() => setOpen(i)} className="group block w-full aspect-[4/5] bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-shadow overflow-hidden" aria-label={t.name ? `Success story: ${t.name}` : 'Student success story'}>
              <img src={t.photoUrl} alt={t.name || 'Student success story'} loading="lazy" className="w-full h-full object-contain group-hover:scale-[1.02] transition-transform duration-500" />
            </button>
          ))}
        </HorizontalCarousel>
      </div>
      {open !== null && cards[open] && (
        <div className="fixed inset-0 z-[60] bg-black/90 flex items-center justify-center p-4" onClick={() => setOpen(null)} role="dialog" aria-modal="true">
          <button className="absolute top-4 right-4 text-white/80 hover:text-white text-3xl font-black" aria-label="Close">×</button>
          <button onClick={e => { e.stopPropagation(); setOpen((open - 1 + cards.length) % cards.length); }} className="absolute left-3 md:left-6 text-white/80 hover:text-white text-4xl font-black" aria-label="Previous">‹</button>
          <img src={cards[open].photoUrl} alt={cards[open].name || 'Student success story'} className="max-h-[85vh] max-w-[92vw] w-auto rounded-xl object-contain" onClick={e => e.stopPropagation()} />
          <button onClick={e => { e.stopPropagation(); setOpen((open + 1) % cards.length); }} className="absolute right-3 md:right-6 text-white/80 hover:text-white text-4xl font-black" aria-label="Next">›</button>
        </div>
      )}
    </section>
  );
};
