// Student success stories: one horizontal row of same-sized cards that scrolls
// left to right (auto-advancing, with arrows). Renders nothing when none are
// approved.

import React from 'react';
import { SiteTestimonial } from '../types';
import { HorizontalCarousel } from './HorizontalCarousel';

export const Testimonials: React.FC<{ items: SiteTestimonial[] }> = ({ items }) => {
  if (items.length === 0) return null;
  return (
    <section id="testimonials" className="py-24 bg-gradient-to-b from-gray-50 to-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="inline-block text-blue-600 font-black uppercase tracking-[0.3em] text-xs mb-3">Student stories</span>
          <h2 className="text-3xl md:text-5xl font-black text-gray-900 tracking-tight">Students success stories</h2>
        </div>
        <HorizontalCarousel cardClass="w-[280px] sm:w-[320px]" ariaLabel="Student success stories" autoplayMs={4500}>
          {items.slice(0, 12).map(t => (
            <figure key={t.id} className="h-full bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-shadow flex flex-col items-center text-center p-6 min-h-[380px]">
              <div className="w-24 h-24 rounded-full bg-blue-600 text-white text-3xl font-black flex items-center justify-center overflow-hidden ring-4 ring-blue-50 shrink-0">
                {t.photoUrl ? <img src={t.photoUrl} alt={t.name} className="w-full h-full object-cover" loading="lazy" /> : t.name.charAt(0).toUpperCase()}
              </div>
              <figcaption className="mt-4 min-w-0 w-full">
                <p className="font-black text-gray-900 text-lg truncate">{t.name}</p>
                {t.role && <p className="text-xs font-bold text-blue-700 uppercase tracking-wider mt-1 line-clamp-2">{t.role}</p>}
              </figcaption>
              <div className="text-amber-400 text-sm tracking-wider mt-3" aria-label={`${t.rating} out of 5`}>{'★'.repeat(t.rating)}<span className="text-gray-200">{'★'.repeat(5 - t.rating)}</span></div>
              {t.quote && <blockquote className="text-gray-600 text-sm leading-relaxed mt-3 line-clamp-5">“{t.quote}”</blockquote>}
            </figure>
          ))}
        </HorizontalCarousel>
      </div>
    </section>
  );
};
