// Events module test suite — pure-logic assertions, following the app's
// in-app test-runner convention (no Node test runner in this project).
// Run from Events → "Run module tests".

import { slugify, uniqueSlug, formatRegistrationCode } from '../lib/slug';
import { istInputToUtcIso, utcIsoToIstInput, formatISTTime } from '../lib/datetime';
import { validateForPublish, validateRegistration, lifecycleOf, registrationWindow, seatsRemaining, normalizeEmail, normalizePhone } from '../lib/validate';
import { emptyCounters, emptyPrivateDetails } from '../services/eventsDb';
import { SprEvent } from '../types';

export interface EventsTestResult {
  name: string;
  status: 'PASS' | 'FAIL';
  message: string;
}

const assert = (cond: boolean, msg: string) => { if (!cond) throw new Error(msg); };

const baseEvent = (overrides: Partial<SprEvent> = {}): SprEvent => ({
  id: 'evt-test', slug: 'test-event', title: 'Test Webinar', type: 'webinar',
  shortDescription: 'Short', fullDescription: 'Full',
  whatYouWillLearn: [], whoShouldAttend: [], prerequisites: [],
  bannerPath: '', bannerUrl: 'https://example.com/banner.jpg', speakers: [], agenda: [],
  mode: 'online', platform: 'Meet', venueName: '', venueAddress: '', venueMapUrl: '',
  startAt: new Date(Date.now() + 86400000).toISOString(),
  endAt: new Date(Date.now() + 90000000).toISOString(),
  timezone: 'Asia/Kolkata', registrationClosesAt: '',
  capacity: 0, waitlistEnabled: true,
  collectFields: { city: true, qualification: true, passingYear: true, currentStatus: true, howDidYouHear: true },
  customQuestions: [], status: 'published', registrationClosedEarly: false,
  counters: emptyCounters(), registrationSeq: 0,
  recap: { recordingUrl: '', finalAttendeeCount: 0, photoUrls: [], notes: '' },
  createdAt: '', createdBy: '', updatedAt: '', updatedBy: '',
  ...overrides,
});

const validRegForm = () => ({
  fullName: 'Test Person', email: 'test@example.com', mobile: '9849123456',
  city: '', qualification: '', passingYear: '', currentStatus: '', howDidYouHear: '',
  customAnswers: {}, consentTerms: true, consentEmail: false, consentWhatsApp: false,
});

const TESTS: { name: string; fn: () => void }[] = [
  {
    name: 'Slug: title → clean kebab-case',
    fn: () => {
      assert(slugify('Free Selenium Webinar!  #1') === 'free-selenium-webinar-1', `got ${slugify('Free Selenium Webinar!  #1')}`);
      assert(slugify('   ') === 'event', 'empty title should fall back to "event"');
    },
  },
  {
    name: 'Slug: uniqueness suffixing',
    fn: () => {
      const taken = new Set(['demo', 'demo-2']);
      assert(uniqueSlug('demo', taken) === 'demo-3', `got ${uniqueSlug('demo', taken)}`);
      assert(uniqueSlug('fresh', taken) === 'fresh', 'untaken slug should pass through');
    },
  },
  {
    name: 'Registration code format per event type',
    fn: () => {
      assert(formatRegistrationCode('webinar', 42) === 'SPR-WEB-0042', `got ${formatRegistrationCode('webinar', 42)}`);
      assert(formatRegistrationCode('demo_class', 7) === 'SPR-DEMO-0007', `got ${formatRegistrationCode('demo_class', 7)}`);
      assert(formatRegistrationCode('other', 12345) === 'SPR-EVT-12345', 'long sequences must not truncate');
    },
  },
  {
    name: 'Timezone: IST input ↔ UTC ISO round-trip',
    fn: () => {
      const utc = istInputToUtcIso('2026-08-15T11:00');
      assert(utc === '2026-08-15T05:30:00.000Z', `IST 11:00 should be 05:30 UTC, got ${utc}`);
      assert(utcIsoToIstInput(utc) === '2026-08-15T11:00', `round-trip failed: ${utcIsoToIstInput(utc)}`);
      assert(formatISTTime(utc).toLowerCase().includes('11'), `IST display should show 11 AM, got ${formatISTTime(utc)}`);
    },
  },
  {
    name: 'Publish gate: catches all missing fields at once',
    fn: () => {
      const issues = validateForPublish(baseEvent({ title: '', bannerUrl: '', startAt: '' }), emptyPrivateDetails('evt-test'));
      assert(issues.length >= 4, `expected ≥4 issues (title, banner, start, joinUrl), got ${issues.length}`);
    },
  },
  {
    name: 'Publish gate: end before start / start in past rejected',
    fn: () => {
      const past = baseEvent({ startAt: new Date(Date.now() - 1000).toISOString() });
      assert(validateForPublish(past, { id: 'x', joinUrl: 'https://x', meetingId: '', passcode: '' }).some(i => i.message.includes('past')), 'past start not caught');
      const swapped = baseEvent({ endAt: new Date(Date.now() + 1000).toISOString() });
      assert(validateForPublish(swapped, { id: 'x', joinUrl: 'https://x', meetingId: '', passcode: '' }).some(i => i.message.includes('after the start')), 'end<=start not caught');
    },
  },
  {
    name: 'Publish gate: clean online event passes',
    fn: () => {
      const issues = validateForPublish(baseEvent(), { id: 'evt-test', joinUrl: 'https://meet.google.com/x', meetingId: '', passcode: '' });
      assert(issues.length === 0, `expected 0 issues, got: ${issues.map(i => i.message).join('; ')}`);
    },
  },
  {
    name: 'Registration validation: happy path + failures',
    fn: () => {
      const ev = baseEvent();
      assert(Object.keys(validateRegistration(validRegForm(), ev)).length === 0, 'valid form rejected');
      assert(!!validateRegistration({ ...validRegForm(), email: 'bad@@x' }, ev).email, 'bad email accepted');
      assert(!!validateRegistration({ ...validRegForm(), mobile: '12345' }, ev).mobile, 'bad mobile accepted');
      assert(!!validateRegistration({ ...validRegForm(), consentTerms: false }, ev).consentTerms, 'missing consent accepted');
    },
  },
  {
    name: 'Registration validation: required custom question enforced',
    fn: () => {
      const ev = baseEvent({ customQuestions: [{ id: 'q1', label: 'Topic?', fieldType: 'text', required: true, options: [] }] });
      assert(!!validateRegistration(validRegForm(), ev)['q_q1'], 'missing required answer accepted');
      const ok = validateRegistration({ ...validRegForm(), customAnswers: { q1: 'Automation' } }, ev);
      assert(!ok['q_q1'], 'answered question still flagged');
    },
  },
  {
    name: 'Duplicate keys: email + phone normalization',
    fn: () => {
      assert(normalizeEmail('  Person@Example.COM ') === 'person@example.com', 'email not normalized');
      assert(normalizePhone('098-491 234-56') === '+919849123456', 'phone not normalized');
    },
  },
  {
    name: 'Lifecycle: upcoming / live / past computed from times',
    fn: () => {
      const now = Date.now();
      const mk = (s: number, e: number) => ({ startAt: new Date(now + s).toISOString(), endAt: new Date(now + e).toISOString() });
      assert(lifecycleOf(mk(10000, 20000), now) === 'upcoming', 'future event should be upcoming');
      assert(lifecycleOf(mk(-10000, 10000), now) === 'live', 'in-progress event should be live');
      assert(lifecycleOf(mk(-20000, -10000), now) === 'past', 'finished event should be past');
    },
  },
  {
    name: 'Registration window: draft, closed-early, window-over, open',
    fn: () => {
      assert(!registrationWindow(baseEvent({ status: 'draft' })).open, 'draft should be closed');
      assert(!registrationWindow(baseEvent({ registrationClosedEarly: true })).open, 'closed-early should be closed');
      const over = baseEvent({ registrationClosesAt: new Date(Date.now() - 1000).toISOString() });
      assert(!registrationWindow(over).open, 'past close time should be closed');
      assert(registrationWindow(baseEvent()).open, 'published future event should be open');
    },
  },
  {
    name: 'Capacity: seats remaining math',
    fn: () => {
      assert(seatsRemaining(baseEvent()) === null, 'capacity 0 should mean unlimited');
      const ev = baseEvent({ capacity: 50, counters: { confirmed: 47, waitlisted: 3 } });
      assert(seatsRemaining(ev) === 3, `expected 3 seats, got ${seatsRemaining(ev)}`);
      const full = baseEvent({ capacity: 10, counters: { confirmed: 12, waitlisted: 0 } });
      assert(seatsRemaining(full) === 0, 'overfull must clamp to 0, never negative');
    },
  },
];

export const runEventsTests = (): EventsTestResult[] =>
  TESTS.map(t => {
    try {
      t.fn();
      return { name: t.name, status: 'PASS' as const, message: '' };
    } catch (e: any) {
      return { name: t.name, status: 'FAIL' as const, message: String(e?.message || e) };
    }
  });
