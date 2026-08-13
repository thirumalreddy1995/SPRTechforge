// Compact "Upcoming Events" strip for the public homepage (LandingPage).
// Renders nothing at all when there are no upcoming published events, so the
// homepage never shows an empty section.

import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { SprEvent } from '../types';
import { fetchPublicEvents } from '../services/eventsDb';
import { formatISTRange } from '../lib/datetime';
import { lifecycleOf, registrationWindow } from '../lib/validate';
import { TypeBadge, LiveBadge } from './shared';

export const UpcomingEventsWidget: React.FC = () => {
  const [events, setEvents] = useState<SprEvent[]>([]);

  useEffect(() => {
    fetchPublicEvents().then(setEvents).catch(() => { /* widget is optional — stay hidden */ });
  }, []);

  const visible = useMemo(
    () => events
      .filter(e => e.status === 'published' && lifecycleOf(e) !== 'past')
      .sort((a, b) => a.startAt.localeCompare(b.startAt))
      .slice(0, 3),
    [events],
  );

  if (visible.length === 0) return null;

  return (
    <section className="py-16 px-4 bg-gradient-to-b from-blue-50/60 to-white">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-end justify-between mb-8 gap-4 flex-wrap">
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-blue-600 mb-1">Free · Live · Online & In-person</p>
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900">Upcoming Free Events</h2>
          </div>
          <Link to="/events" className="text-sm font-bold text-blue-600 hover:text-blue-800 whitespace-nowrap">See all events →</Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {visible.map(ev => (
            <Link
              key={ev.id}
              to={`/events/${ev.slug}`}
              className="block bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              {ev.bannerUrl && <img src={ev.bannerUrl} alt={ev.title} loading="lazy" className="w-full aspect-[1200/628] object-cover" />}
              <div className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TypeBadge type={ev.type} />
                  {lifecycleOf(ev) === 'live' && <LiveBadge />}
                </div>
                <h3 className="font-black text-gray-900 leading-snug mb-1 line-clamp-2">{ev.title}</h3>
                <p className="text-xs font-bold text-gray-600">📅 {formatISTRange(ev.startAt, ev.endAt)}</p>
                {registrationWindow(ev).open && (
                  <p className="mt-2 text-sm font-black text-blue-600">Register free →</p>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};
