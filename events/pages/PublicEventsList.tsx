// PUBLIC /#/events — no login. Mobile-first. Three groups: Happening now,
// Upcoming, Past (with recap as social proof).

import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Logo } from '../../components/Components';
import { SprEvent } from '../types';
import { fetchPublicEvents } from '../services/eventsPublicDb';
import { formatISTRange } from '../lib/datetime';
import { lifecycleOf, registrationWindow, seatsRemaining } from '../lib/validate';
import { LiveBadge, TypeBadge } from '../components/shared';

type LoadState = 'loading' | 'ready' | 'offline';

const EventCard: React.FC<{ ev: SprEvent; live?: boolean }> = ({ ev, live }) => {
  const seats = seatsRemaining(ev);
  const window_ = registrationWindow(ev);
  const closingSoon = window_.open && new Date((ev.registrationClosesAt || ev.startAt)).getTime() - Date.now() < 24 * 60 * 60 * 1000;
  return (
    <Link
      to={`/events/${ev.slug}`}
      className="block bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
    >
      {ev.bannerUrl && <img src={ev.bannerUrl} alt={ev.title} loading="lazy" className="w-full aspect-[1200/628] object-cover" />}
      <div className="p-4 sm:p-5">
        <div className="flex items-center gap-2 flex-wrap mb-2">
          <TypeBadge type={ev.type} />
          {live && <LiveBadge />}
          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">FREE</span>
        </div>
        <h3 className="font-black text-gray-900 text-lg leading-snug mb-1">{ev.title}</h3>
        <p className="text-sm text-gray-500 mb-3 line-clamp-2">{ev.shortDescription}</p>
        <p className="text-sm font-bold text-gray-800">📅 {formatISTRange(ev.startAt, ev.endAt)}</p>
        <p className="text-sm text-gray-600 mt-0.5">
          {ev.mode === 'online' ? `💻 Online${ev.platform ? ` · ${ev.platform}` : ''}` : ev.mode === 'offline' ? `📍 ${ev.venueName}` : `📍 ${ev.venueName} + 💻 Online`}
        </p>
        {window_.open && (
          <div className="mt-3 flex items-center justify-between gap-2">
            <span className="text-xs font-bold text-orange-600">
              {seats !== null ? `${seats} seat${seats === 1 ? '' : 's'} left` : closingSoon ? 'Registrations closing soon' : ''}
            </span>
            <span className="px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-bold">Register Free →</span>
          </div>
        )}
        {!window_.open && lifecycleOf(ev) !== 'past' && ev.status !== 'cancelled' && (
          <p className="mt-3 text-xs font-bold text-gray-400">Registrations closed</p>
        )}
      </div>
    </Link>
  );
};

const PastCard: React.FC<{ ev: SprEvent }> = ({ ev }) => (
  <Link to={`/events/${ev.slug}`} className="block bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
    <div className="flex gap-4 p-4 items-center">
      {ev.bannerUrl && <img src={ev.bannerUrl} alt="" loading="lazy" className="w-28 h-16 object-cover rounded-lg shrink-0 hidden sm:block" />}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 mb-1"><TypeBadge type={ev.type} /></div>
        <h3 className="font-bold text-gray-800 truncate">{ev.title}</h3>
        <p className="text-xs text-gray-500">{formatISTRange(ev.startAt, ev.endAt)}</p>
        <div className="flex gap-3 mt-1 text-xs font-bold">
          {ev.recap?.finalAttendeeCount > 0 && <span className="text-emerald-700">👥 {ev.recap.finalAttendeeCount} attended</span>}
          {ev.recap?.recordingUrl && <span className="text-blue-600">▶ Recording available</span>}
        </div>
      </div>
    </div>
  </Link>
);

export const PublicEventsList: React.FC = () => {
  const [state, setState] = useState<LoadState>('loading');
  const [events, setEvents] = useState<SprEvent[]>([]);

  useEffect(() => {
    fetchPublicEvents()
      .then(items => { setEvents(items); setState('ready'); })
      .catch(() => setState('offline'));
  }, []);

  const groups = useMemo(() => {
    const published = events.filter(e => e.status === 'published');
    return {
      live: published.filter(e => lifecycleOf(e) === 'live').sort((a, b) => a.startAt.localeCompare(b.startAt)),
      upcoming: published.filter(e => lifecycleOf(e) === 'upcoming').sort((a, b) => a.startAt.localeCompare(b.startAt)),
      past: published.filter(e => lifecycleOf(e) === 'past').sort((a, b) => b.startAt.localeCompare(a.startAt)),
    };
  }, [events]);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/"><Logo size="sm" /></Link>
          <Link to="/" className="text-sm font-bold text-blue-600 hover:text-blue-800">← Home</Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
        <h1 className="text-3xl sm:text-4xl font-black text-gray-900 mb-2">Free Events & Webinars</h1>
        <p className="text-gray-600 mb-8 max-w-2xl">
          Live sessions on software testing careers — free to attend, no experience needed. Reserve a seat and join from anywhere.
        </p>

        {state === 'loading' && (
          <div className="space-y-4">
            {[0, 1].map(i => <div key={i} className="bg-white rounded-2xl border border-gray-200 h-64 animate-pulse" />)}
          </div>
        )}

        {state === 'offline' && (
          <div className="text-center py-16">
            <div className="text-5xl mb-3">📡</div>
            <p className="font-bold text-gray-700">We couldn't load events</p>
            <p className="text-sm text-gray-500 mt-1">Please check your internet connection and reload the page.</p>
          </div>
        )}

        {state === 'ready' && (
          <div className="space-y-10">
            {groups.live.length > 0 && (
              <section>
                <h2 className="text-lg font-black text-red-600 mb-4 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse" /> Happening now
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {groups.live.map(ev => <EventCard key={ev.id} ev={ev} live />)}
                </div>
              </section>
            )}

            <section>
              <h2 className="text-lg font-black text-gray-900 mb-4">Upcoming events</h2>
              {groups.upcoming.length === 0 ? (
                <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-8 text-center">
                  <div className="text-4xl mb-2">🗓️</div>
                  <p className="font-bold text-gray-700">No upcoming events right now</p>
                  <p className="text-sm text-gray-500 mt-1">
                    New free webinars and demo classes are announced regularly.{' '}
                    <Link to="/" className="text-blue-600 font-bold underline">Contact us</Link> and we'll let you know about the next one.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {groups.upcoming.map(ev => <EventCard key={ev.id} ev={ev} />)}
                </div>
              )}
            </section>

            {groups.past.length > 0 && (
              <section>
                <h2 className="text-lg font-black text-gray-900 mb-4">Past events</h2>
                <div className="space-y-3">
                  {groups.past.map(ev => <PastCard key={ev.id} ev={ev} />)}
                </div>
              </section>
            )}
          </div>
        )}
      </main>

      <footer className="text-center text-xs text-gray-400 pb-8">
        SPR Techforge · Software Testing Training &amp; Careers
      </footer>
    </div>
  );
};
