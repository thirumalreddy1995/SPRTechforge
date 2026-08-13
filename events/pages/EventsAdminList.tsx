// Admin → SPRConnect → Events: the event list. Create, duplicate, delete
// (drafts only), and jump into any event's control room.

import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Select, SearchInput } from '../../components/Components';
import { useApp } from '../../context/AppContext';
import { EventRegistration, SprEvent } from '../types';
import { subscribeEvents, subscribeRegistrations, saveEvent, deleteEvent, fetchPrivateDetails, savePrivateDetails, emptyCounters } from '../services/eventsDb';
import { formatISTRange, relativeToNow } from '../lib/datetime';
import { lifecycleOf } from '../lib/validate';
import { EVENT_TYPE_LABELS, slugify, uniqueSlug } from '../lib/slug';
import { StatusBadge, TypeBadge, EmptyState } from '../components/shared';
import { runEventsTests, EventsTestResult } from '../tests/eventsTests';

const generateEventId = () => `evt-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

type ListFilter = 'all' | 'draft' | 'upcoming' | 'live' | 'past' | 'cancelled';

const matchesFilter = (ev: SprEvent, f: ListFilter): boolean => {
  switch (f) {
    case 'all': return true;
    case 'draft': return ev.status === 'draft';
    case 'cancelled': return ev.status === 'cancelled';
    case 'upcoming': return ev.status === 'published' && lifecycleOf(ev) === 'upcoming';
    case 'live': return ev.status === 'published' && lifecycleOf(ev) === 'live';
    case 'past': return ev.status === 'published' && lifecycleOf(ev) === 'past';
  }
};

export const EventsAdminList: React.FC = () => {
  const navigate = useNavigate();
  const { user, showToast } = useApp();
  const [events, setEvents] = useState<SprEvent[]>([]);
  const [registrations, setRegistrations] = useState<EventRegistration[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [filter, setFilter] = useState<ListFilter>('all');
  const [q, setQ] = useState('');
  const [testResults, setTestResults] = useState<EventsTestResult[] | null>(null);

  useEffect(() => {
    const unsubEvents = subscribeEvents(items => { setEvents(items); setLoaded(true); }, e => { setLoadError(String(e?.message || e)); setLoaded(true); });
    const unsubRegs = subscribeRegistrations(setRegistrations);
    return () => { unsubEvents(); unsubRegs(); };
  }, []);

  const regCountByEvent = useMemo(() => {
    const out: Record<string, number> = {};
    for (const r of registrations) {
      if (r.status === 'cancelled') continue;
      out[r.eventId] = (out[r.eventId] || 0) + 1;
    }
    return out;
  }, [registrations]);

  const visible = useMemo(() => {
    const lower = q.trim().toLowerCase();
    return events
      .filter(ev => matchesFilter(ev, filter))
      .filter(ev => !lower || ev.title.toLowerCase().includes(lower) || EVENT_TYPE_LABELS[ev.type].toLowerCase().includes(lower))
      .sort((a, b) => (b.startAt || b.createdAt).localeCompare(a.startAt || a.createdAt));
  }, [events, filter, q]);

  const stats = useMemo(() => ({
    upcoming: events.filter(e => e.status === 'published' && lifecycleOf(e) === 'upcoming').length,
    live: events.filter(e => e.status === 'published' && lifecycleOf(e) === 'live').length,
    totalRegs: registrations.filter(r => r.status !== 'cancelled').length,
    converted: registrations.filter(r => !!r.convertedToCandidateId).length,
  }), [events, registrations]);

  const handleDuplicate = async (ev: SprEvent) => {
    if (!user) return;
    try {
      const now = new Date().toISOString();
      const id = generateEventId();
      const taken = new Set(events.map(e => e.slug).filter(Boolean));
      const copy: SprEvent = {
        ...ev,
        id,
        title: `${ev.title} (Copy)`,
        slug: uniqueSlug(slugify(`${ev.title} copy`), taken),
        status: 'draft',
        registrationClosedEarly: false,
        publishedAt: undefined,
        publishedBy: undefined,
        cancelledAt: undefined,
        cancelReason: undefined,
        counters: emptyCounters(),
        registrationSeq: 0,
        recap: { recordingUrl: '', finalAttendeeCount: 0, photoUrls: [], notes: '' },
        createdAt: now, createdBy: user.id, updatedAt: now, updatedBy: user.id,
      };
      await saveEvent(copy);
      const priv = await fetchPrivateDetails(ev.id);
      await savePrivateDetails({ ...priv, id });
      showToast('Event duplicated as a draft — update the date and publish', 'success');
      navigate(`/events/manage/edit/${id}`);
    } catch (e: any) {
      showToast(`Duplicate failed: ${e.message || e}`, 'error');
    }
  };

  const handleDelete = async (ev: SprEvent) => {
    const regs = regCountByEvent[ev.id] || 0;
    if (ev.status !== 'draft' || regs > 0) {
      showToast('Only drafts with zero registrations can be deleted. Cancel the event instead.', 'error');
      return;
    }
    if (!window.confirm(`Delete draft "${ev.title}"? This cannot be undone.`)) return;
    try {
      await deleteEvent(ev.id);
      showToast('Draft deleted', 'success');
    } catch (e: any) {
      showToast(`Delete failed: ${e.message || e}`, 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Events</h1>
          <p className="text-gray-600">Create free webinars & demo classes, share the link anywhere, and watch registrations come in.</p>
        </div>
        <Button onClick={() => navigate('/events/manage/new')}>+ Create Event</Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Upcoming events', value: stats.upcoming, tint: 'text-blue-700 bg-blue-50 border-blue-100' },
          { label: 'Live right now', value: stats.live, tint: 'text-red-700 bg-red-50 border-red-100' },
          { label: 'Total registrations', value: stats.totalRegs, tint: 'text-emerald-700 bg-emerald-50 border-emerald-100' },
          { label: 'Converted to candidates', value: stats.converted, tint: 'text-purple-700 bg-purple-50 border-purple-100' },
        ].map(s => (
          <div key={s.label} className={`rounded-2xl border p-4 ${s.tint}`}>
            <p className="text-3xl font-black">{s.value}</p>
            <p className="text-xs font-bold uppercase tracking-wide opacity-80 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <Card className="p-0">
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-3 sm:items-center">
          <div className="flex-1">
            <SearchInput value={q} onChange={e => setQ(e.target.value)} onClear={() => setQ('')} placeholder="Search events…" />
          </div>
          <Select value={filter} onChange={e => setFilter(e.target.value as ListFilter)} className="!mb-0 sm:w-44">
            <option value="all">All statuses</option>
            <option value="upcoming">Upcoming</option>
            <option value="live">Live now</option>
            <option value="draft">Drafts</option>
            <option value="past">Completed</option>
            <option value="cancelled">Cancelled</option>
          </Select>
        </div>

        {!loaded ? (
          <p className="text-center text-gray-500 py-12">Loading events…</p>
        ) : loadError ? (
          <EmptyState icon="⚠️" title="Could not load events" sub={loadError} />
        ) : visible.length === 0 ? (
          <EmptyState
            icon="🎪"
            title={events.length === 0 ? 'No events yet' : 'Nothing matches your filter'}
            sub={events.length === 0 ? 'Create your first free webinar or demo class — it takes about 5 minutes, and you get a link you can share on WhatsApp and LinkedIn.' : undefined}
          >
            {events.length === 0 && <Button onClick={() => navigate('/events/manage/new')}>+ Create your first event</Button>}
          </EmptyState>
        ) : (
          <div className="divide-y divide-gray-100">
            {visible.map(ev => {
              const regs = regCountByEvent[ev.id] || 0;
              return (
                <div
                  key={ev.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => navigate(ev.status === 'draft' ? `/events/manage/edit/${ev.id}` : `/events/manage/view/${ev.id}`)}
                  onKeyDown={e => { if (e.key === 'Enter') navigate(ev.status === 'draft' ? `/events/manage/edit/${ev.id}` : `/events/manage/view/${ev.id}`); }}
                  className="w-full text-left p-4 hover:bg-blue-50/40 transition-colors flex items-center gap-4 cursor-pointer"
                >
                  <div className="w-20 h-12 rounded-lg bg-gray-100 overflow-hidden shrink-0 hidden sm:block">
                    {ev.bannerUrl
                      ? <img src={ev.bannerUrl} alt="" className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center text-gray-300 text-xl">🖼️</div>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-gray-900 truncate">{ev.title || 'Untitled event'}</span>
                      <TypeBadge type={ev.type} />
                      <StatusBadge ev={ev} />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {ev.startAt ? <>{formatISTRange(ev.startAt, ev.endAt)} <span className="text-gray-400">({relativeToNow(ev.startAt)})</span></> : 'No date set yet'}
                      {' · '}{ev.mode === 'online' ? 'Online' : ev.mode === 'offline' ? 'In person' : 'Hybrid'}
                    </p>
                  </div>
                  <div className="text-center shrink-0 px-2">
                    <p className="text-2xl font-black text-blue-700">{regs}</p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase">Registered{ev.capacity > 0 ? ` / ${ev.capacity}` : ''}</p>
                  </div>
                  <div className="shrink-0 flex flex-col gap-1.5 items-stretch" onClick={e => e.stopPropagation()}>
                    <button onClick={() => handleDuplicate(ev)} className="text-xs font-bold text-blue-600 hover:text-blue-800 px-2 py-1 rounded hover:bg-blue-50">Duplicate</button>
                    {ev.status === 'draft' && regs === 0 && (
                      <button onClick={() => handleDelete(ev)} className="text-xs font-bold text-red-500 hover:text-red-700 px-2 py-1 rounded hover:bg-red-50">Delete</button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      <div className="text-right">
        <button onClick={() => setTestResults(runEventsTests())} className="text-xs text-gray-400 hover:text-gray-600 underline">
          Run module tests
        </button>
      </div>
      {testResults && (
        <Card title={`Module tests — ${testResults.filter(t => t.status === 'PASS').length}/${testResults.length} passed`}>
          <div className="space-y-1 text-sm font-mono">
            {testResults.map(t => (
              <p key={t.name} className={t.status === 'PASS' ? 'text-emerald-700' : 'text-red-600 font-bold'}>
                {t.status === 'PASS' ? '✓' : '✗'} {t.name}{t.status === 'FAIL' ? ` — ${t.message}` : ''}
              </p>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};
