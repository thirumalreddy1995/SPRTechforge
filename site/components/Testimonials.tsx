// Student testimonials. Renders nothing when none are approved.

import React from 'react';
import { SiteTestimonial } from '../types';

export const Testimonials: React.FC<{ items: SiteTestimonial[] }> = ({ items }) => {
  if (items.length === 0) return null;
  return (
    <section id="testimonials" className="py-24 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="inline-block text-blue-600 font-black uppercase tracking-[0.3em] text-xs mb-3">Student stories</span>
          <h2 className="text-3xl md:text-5xl font-black text-gray-900 tracking-tight">What our students say</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.slice(0, 9).map(t => (
            <figure key={t.id} className="bg-white rounded-3xl border border-gray-100 p-7 shadow-sm hover:shadow-xl transition-shadow flex flex-col">
              <div className="text-amber-400 text-sm tracking-wider mb-3" aria-label={`${t.rating} out of 5`}>{'★'.repeat(t.rating)}<span className="text-gray-200">{'★'.repeat(5 - t.rating)}</span></div>
              <blockquote className="text-gray-700 leading-relaxed flex-1">“{t.quote}”</blockquote>
              <figcaption className="flex items-center gap-3 mt-6 pt-5 border-t border-gray-100">
                <div className="w-11 h-11 rounded-full bg-blue-600 text-white font-black flex items-center justify-center overflow-hidden shrink-0">
                  {t.photoUrl ? <img src={t.photoUrl} alt="" className="w-full h-full object-cover" /> : t.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="font-black text-gray-900 truncate">{t.name}</p>
                  {t.role && <p className="text-xs text-gray-500 truncate">{t.role}</p>}
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
};
