import { SeminarSettings } from '../types';

// "Add to calendar" helpers for the public registration success state.
// Google Calendar link + downloadable .ics — both free, no services involved.

const toUtcStamp = (d: Date): string =>
  d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');

const eventWindow = (settings: SeminarSettings): { start: Date; end: Date } | null => {
  if (!settings.dateTime) return null;
  const start = new Date(settings.dateTime);
  if (isNaN(start.getTime())) return null;
  const end = new Date(start.getTime() + 90 * 60 * 1000); // default 90 min
  return { start, end };
};

export const googleCalendarUrl = (settings: SeminarSettings): string | null => {
  const win = eventWindow(settings);
  if (!win) return null;
  const location = settings.onlineLink || settings.venue || '';
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: settings.title || 'Free Software Testing Seminar',
    dates: `${toUtcStamp(win.start)}/${toUtcStamp(win.end)}`,
    location,
    details: settings.onlineLink ? `Join link: ${settings.onlineLink}` : '',
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
};

export const icsDataUri = (settings: SeminarSettings): string | null => {
  const win = eventWindow(settings);
  if (!win) return null;
  const esc = (s: string) => s.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//SPRTechforge//Seminar//EN',
    'BEGIN:VEVENT',
    `UID:seminar-${toUtcStamp(win.start)}@sprtechforge`,
    `DTSTAMP:${toUtcStamp(new Date())}`,
    `DTSTART:${toUtcStamp(win.start)}`,
    `DTEND:${toUtcStamp(win.end)}`,
    `SUMMARY:${esc(settings.title || 'Free Software Testing Seminar')}`,
    `LOCATION:${esc(settings.onlineLink || settings.venue || '')}`,
    settings.onlineLink ? `DESCRIPTION:${esc(`Join link: ${settings.onlineLink}`)}` : 'DESCRIPTION:',
    'END:VEVENT',
    'END:VCALENDAR',
  ];
  return `data:text/calendar;charset=utf-8,${encodeURIComponent(lines.join('\r\n'))}`;
};
