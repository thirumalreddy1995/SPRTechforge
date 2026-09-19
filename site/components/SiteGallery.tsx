// "Life at SPR TechForge" photos: a horizontal carousel of same-sized tiles
// with a simple lightbox. Renders nothing when there are no photos.

import React, { useEffect, useState } from 'react';
import { SitePhoto } from '../types';
import { HorizontalCarousel } from './HorizontalCarousel';

export const SiteGallery: React.FC<{ photos: SitePhoto[] }> = ({ photos }) => {
  const [open, setOpen] = useState<number | null>(null);
  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(null);
      if (e.key === 'ArrowRight') setOpen(i => (i === null ? null : (i + 1) % photos.length));
      if (e.key === 'ArrowLeft') setOpen(i => (i === null ? null : (i - 1 + photos.length) % photos.length));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, photos.length]);

  if (photos.length === 0) return null;
  const shown = photos.slice(0, 16);

  return (
    <section id="gallery" className="py-24 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="inline-block text-blue-600 font-black uppercase tracking-[0.3em] text-xs mb-3">Gallery</span>
          <h2 className="text-3xl md:text-5xl font-black text-gray-900 tracking-tight">Life at SPR TechForge</h2>
          <p className="text-gray-500 mt-4 max-w-2xl mx-auto font-medium">Classrooms, project demos, seminars and celebrations.</p>
        </div>
        <HorizontalCarousel cardClass="w-[260px] sm:w-[300px]" ariaLabel="Photo gallery" autoplayMs={4000}>
          {shown.map((p, i) => (
            <button key={p.id} type="button" onClick={() => setOpen(i)} className="group relative block w-full overflow-hidden rounded-2xl bg-gray-100 aspect-[4/3]" aria-label={p.caption || `Photo ${i + 1}`}>
              <img src={p.imageUrl} alt={p.caption} loading="lazy" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              {p.caption && <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent text-white text-xs sm:text-sm font-semibold px-3 pb-3 pt-8 text-left">{p.caption}</span>}
            </button>
          ))}
        </HorizontalCarousel>
      </div>
      {open !== null && shown[open] && (
        <div className="fixed inset-0 z-[60] bg-black/90 flex items-center justify-center p-4" onClick={() => setOpen(null)} role="dialog" aria-modal="true">
          <button className="absolute top-4 right-4 text-white/80 hover:text-white text-3xl font-black" aria-label="Close">×</button>
          <button onClick={e => { e.stopPropagation(); setOpen((open - 1 + shown.length) % shown.length); }} className="absolute left-3 md:left-6 text-white/80 hover:text-white text-4xl font-black" aria-label="Previous photo">‹</button>
          <figure className="max-w-5xl max-h-[85vh]" onClick={e => e.stopPropagation()}>
            <img src={shown[open].imageUrl} alt={shown[open].caption} className="max-h-[75vh] w-auto mx-auto rounded-xl object-contain" />
            {shown[open].caption && <figcaption className="text-center text-white/90 text-sm font-semibold mt-3">{shown[open].caption}</figcaption>}
          </figure>
          <button onClick={e => { e.stopPropagation(); setOpen((open + 1) % shown.length); }} className="absolute right-3 md:right-6 text-white/80 hover:text-white text-4xl font-black" aria-label="Next photo">›</button>
        </div>
      )}
    </section>
  );
};
