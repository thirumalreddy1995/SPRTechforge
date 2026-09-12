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

/** (webinar, 42) → "SPR-WEB-0042" — sequential code, used when seats are limited (transaction path). */
export const formatRegistrationCode = (type: EventType, seq: number): string =>
  `SPR-${CODE_PREFIX[type] || 'EVT'}-${String(seq).padStart(4, '0')}`;

const CODE_EPOCH = Date.UTC(2026, 0, 1);
const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no 0/O/1/I — read aloud at check-in

/**
 * (webinar) → "SPR-WEB-K7M2QXA" — code for UNLIMITED-seat events, where
 * registrations are written without a shared counter so thousands of people
 * can sign up at the same moment. First 4 chars come from the time (so codes
 * still sort roughly by registration order), last 3 are random (32,768
 * combinations per ~1.6 s slot). A load test with 22 sign-ups/second showed
 * 6 clashes in 2,000 with only 2 random chars; 3 makes that ~0.02 per slot.
 * The code is a check-in aid, never an identity.
 */
export const randomRegistrationCode = (type: EventType, now = Date.now()): string => {
  const ticks = Math.floor(Math.max(0, now - CODE_EPOCH) / 1600) % (32 ** 4);
  let t = '';
  for (let v = ticks, i = 0; i < 4; i++) { t = CODE_ALPHABET[v % 32] + t; v = Math.floor(v / 32); }
  let r = '';
  for (let i = 0; i < 3; i++) r += CODE_ALPHABET[Math.floor(Math.random() * 32)];
  return `SPR-${CODE_PREFIX[type] || 'EVT'}-${t}${r}`;
};

export const EVENT_TYPE_LABELS: Record<EventType, string> = {
  webinar: 'Webinar',
  demo_class: 'Demo Class',
  seminar: 'Seminar',
  workshop: 'Workshop',
  other: 'Event',
};
