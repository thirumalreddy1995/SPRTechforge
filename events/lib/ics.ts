// Calendar helpers for events: .ics file (data URI download) and a Google
// Calendar template URL. Modeled on seminar/lib/ics.ts but driven by the
// event's own start/end instead of module settings.

import { SprEvent } from '../types';
import { isValidIso } from './datetime';

const icsStamp = (iso: string): string =>
  new Date(iso).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');

const escapeIcsText = (s: string): string =>
  (s || '').replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');

const locationOf = (ev: SprEvent): string => {
  if (ev.mode === 'online') return ev.platform ? `Online (${ev.platform})` : 'Online';
  const venue = [ev.venueName, ev.venueAddress].filter(Boolean).join(', ');
  return ev.mode === 'hybrid' ? `${venue || 'Venue'} / Online` : venue;
};

export const buildIcs = (ev: SprEvent): string | null => {
  if (!isValidIso(ev.startAt) || !isValidIso(ev.endAt)) return null;
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//SPR Techforge//Events//EN',
    'BEGIN:VEVENT',
    `UID:${ev.id}@sprtechforge`,
    `DTSTAMP:${icsStamp(new Date().toISOString())}`,
    `DTSTART:${icsStamp(ev.startAt)}`,
    `DTEND:${icsStamp(ev.endAt)}`,
    `SUMMARY:${escapeIcsText(ev.title)}`,
    `DESCRIPTION:${escapeIcsText(ev.shortDescription)}`,
    `LOCATION:${escapeIcsText(locationOf(ev))}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
};

export const icsDataUri = (ev: SprEvent): string | null => {
  const ics = buildIcs(ev);
  return ics ? `data:text/calendar;charset=utf-8,${encodeURIComponent(ics)}` : null;
};

export const googleCalendarUrl = (ev: SprEvent): string | null => {
  if (!isValidIso(ev.startAt) || !isValidIso(ev.endAt)) return null;
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: ev.title,
    dates: `${icsStamp(ev.startAt)}/${icsStamp(ev.endAt)}`,
    details: ev.shortDescription,
    location: locationOf(ev),
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
};
