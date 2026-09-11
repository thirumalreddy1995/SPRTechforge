import { EventType } from '../types';

/** "Free Selenium Webinar!" → "free-selenium-webinar" */
export const slugify = (title: string): string => {
  const s = (title || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60)
    .replace(/-$/, '');
  return s || 'event';
};

/** Appends -2, -3, … until the slug is not in `taken`. */
export const uniqueSlug = (base: string, taken: Set<string>): string => {
  if (!taken.has(base)) return base;
  for (let i = 2; ; i++) {
    const candidate = `${base}-${i}`;
    if (!taken.has(candidate)) return candidate;
  }
};

const CODE_PREFIX: Record<EventType, string> = {
  webinar: 'WEB',
  demo_class: 'DEMO',
  seminar: 'SEM',
  workshop: 'WRK',
  other: 'EVT',
};

/** (webinar, 42) → "SPR-WEB-0042" — human-readable registration code. */
export const formatRegistrationCode = (type: EventType, seq: number): string =>
  `SPR-${CODE_PREFIX[type] || 'EVT'}-${String(seq).padStart(4, '0')}`;

export const EVENT_TYPE_LABELS: Record<EventType, string> = {
  webinar: 'Webinar',
  demo_class: 'Demo Class',
  seminar: 'Seminar',
  workshop: 'Workshop',
  other: 'Event',
};
