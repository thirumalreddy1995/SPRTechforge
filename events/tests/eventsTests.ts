// Events module test suite — pure-logic assertions, following the app's
// in-app test-runner convention (no Node test runner in this project).
// Run from Events → "Run module tests".

import { slugify, uniqueSlug, formatRegistrationCode, randomRegistrationCode } from '../lib/slug';
import { istInputToUtcIso, utcIsoToIstInput, formatISTTime, relativeToNow, istCalendarDayDiff } from '../lib/datetime';
import {
  validateForPublish, validateRegistration, lifecycleOf, registrationWindow, seatsRemaining,
  normalizeEmail, normalizePhone, isValidMobile, validMobileOrEmpty, QUALIFICATION_OPTIONS,
} from '../lib/validate';
import { youtubeVideoId, youtubeEmbedUrl } from '../lib/video';
import { buildShareText } from '../components/shared';
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
  bannerPath: '', bannerUrl: 'https://example.com/banner.jpg', videoUrl: '', speakers: [], agenda: [],
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
  fullName: 'Test Person', email: 'test@example.com', mobile: '9849123456', mobileDial: '91',
  city: '', qualification: 'B.Tech / B.E', passingYear: '', currentStatus: '', howDidYouHear: '',
  customAnswers: {}, consentTerms: true, consentEmail: true, consentWhatsApp: true,
});

const okPriv = { id: 'evt-test', joinUrl: 'https://meet.google.com/x', meetingId: '', passcode: '' };

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
    name: 'Registration code (unlimited events): format, time-ordering, no ambiguous chars, unique in a burst',
    fn: () => {
      const c = randomRegistrationCode('webinar');
      assert(/^SPR-WEB-[A-HJ-NP-Z2-9]{7}$/.test(c), `unexpected format ${c}`);
      assert(!/[0O1I]/.test(c.slice(8)), 'codes must avoid 0/O/1/I');
      const early = randomRegistrationCode('seminar', Date.UTC(2026, 8, 1)).slice(8, 12);
      const later = randomRegistrationCode('seminar', Date.UTC(2026, 8, 2)).slice(8, 12);
      assert(early < later, `time prefix should sort by registration time (${early} vs ${later})`);
      const seen = new Set();
      for (let i = 0; i < 2000; i++) seen.add(randomRegistrationCode('webinar', Date.now() + i * 1600));
      assert(seen.size === 2000, `expected 2000 distinct codes across distinct time slots, got ${seen.size}`);
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
    name: 'Relative time follows the IST calendar (tomorrow evening is "tomorrow", not "in 2 days")',
    fn: () => {
      // now = Fri 11 Sep 2026 01:00 IST; event = Sat 12 Sep 2026 18:30 IST (41.5 h away)
      const now = new Date(istInputToUtcIso('2026-09-11T01:00')).getTime();
      const tomorrowEvening = istInputToUtcIso('2026-09-12T18:30');
      assert(istCalendarDayDiff(tomorrowEvening, now) === 1, `expected day diff 1, got ${istCalendarDayDiff(tomorrowEvening, now)}`);
      assert(relativeToNow(tomorrowEvening, now) === 'tomorrow', `got "${relativeToNow(tomorrowEvening, now)}"`);
      assert(relativeToNow(istInputToUtcIso('2026-09-11T18:30'), now) === 'today · in 18 hours', `got "${relativeToNow(istInputToUtcIso('2026-09-11T18:30'), now)}"`);
      assert(relativeToNow(istInputToUtcIso('2026-09-16T10:00'), now) === 'in 5 days', `got "${relativeToNow(istInputToUtcIso('2026-09-16T10:00'), now)}"`);
      assert(relativeToNow(istInputToUtcIso('2026-09-10T23:30'), now) === 'yesterday', `got "${relativeToNow(istInputToUtcIso('2026-09-10T23:30'), now)}"`);
      assert(relativeToNow(istInputToUtcIso('2026-09-01T10:00'), now) === '10 days ago', `got "${relativeToNow(istInputToUtcIso('2026-09-01T10:00'), now)}"`);
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
      assert(validateForPublish(past, okPriv).some(i => i.message.includes('past')), 'past start not caught');
      const swapped = baseEvent({ endAt: new Date(Date.now() + 1000).toISOString() });
      assert(validateForPublish(swapped, okPriv).some(i => i.message.includes('after the start')), 'end<=start not caught');
    },
  },
  {
    name: 'Publish gate: clean online event passes; bad video link is caught',
    fn: () => {
      const issues = validateForPublish(baseEvent(), okPriv);
      assert(issues.length === 0, `expected 0 issues, got: ${issues.map(i => i.message).join('; ')}`);
      const withVideo = validateForPublish(baseEvent({ videoUrl: 'https://youtu.be/dQw4w9WgXcQ' }), okPriv);
      assert(withVideo.length === 0, 'valid YouTube link should not block publishing');
      const badVideo = validateForPublish(baseEvent({ videoUrl: 'https://vimeo.com/12345' }), okPriv);
      assert(badVideo.some(i => i.message.includes('YouTube')), 'non-YouTube video link should be flagged');
    },
  },
  {
    name: 'YouTube: every share format → same video ID → embed URL',
    fn: () => {
      const id = 'dQw4w9WgXcQ';
      const forms = [
        `https://www.youtube.com/watch?v=${id}`,
        `https://www.youtube.com/watch?v=${id}&t=42s`,
        `https://youtu.be/${id}`,
        `https://youtu.be/${id}?si=abc`,
        `https://www.youtube.com/embed/${id}`,
        `https://www.youtube.com/shorts/${id}`,
        `https://www.youtube.com/live/${id}`,
        `https://m.youtube.com/watch?v=${id}`,
        `youtube.com/watch?v=${id}`,
        id,
      ];
      forms.forEach(f => assert(youtubeVideoId(f) === id, `failed to parse ${f} → ${youtubeVideoId(f)}`));
      assert(youtubeEmbedUrl(forms[0]) === `https://www.youtube-nocookie.com/embed/${id}?rel=0`, `embed url: ${youtubeEmbedUrl(forms[0])}`);
      assert(youtubeVideoId('https://vimeo.com/123') === '', 'vimeo must not parse');
      assert(youtubeVideoId('not a url') === '', 'garbage must not parse');
      assert(youtubeVideoId('') === '', 'empty must not parse');
    },
  },
  {
    name: 'Registration validation: happy path + failures',
    fn: () => {
      const ev = baseEvent();
      assert(Object.keys(validateRegistration(validRegForm(), ev)).length === 0, `valid form rejected: ${JSON.stringify(validateRegistration(validRegForm(), ev))}`);
      assert(!!validateRegistration({ ...validRegForm(), email: 'bad@@x' }, ev).email, 'bad email accepted');
      assert(!!validateRegistration({ ...validRegForm(), mobile: '12345' }, ev).mobile, 'bad mobile accepted');
      assert(!!validateRegistration({ ...validRegForm(), consentTerms: false }, ev).consentTerms, 'missing consent accepted');
    },
  },
  {
    name: 'Registration validation: mobile must be a real Indian number',
    fn: () => {
      assert(isValidMobile('9849123456'), '10-digit starting 9 should pass');
      assert(isValidMobile('+91 63001 23456'), '+91 with spaces should pass');
      assert(isValidMobile('098491 23456'), 'leading 0 should pass');
      assert(validMobileOrEmpty('9849123456') === '+919849123456', 'should normalize to E.164');
      assert(!isValidMobile('1234567890'), 'ascending sequence must fail');
      assert(!isValidMobile('9876543210'), 'descending sequence must fail');
      assert(!isValidMobile('9999999999'), 'all-same digits must fail');
      assert(!isValidMobile('5849123456'), 'Indian mobiles start with 6–9');
      assert(!isValidMobile('984912345'), '9 digits must fail');
      assert(!isValidMobile('98491234567'), '11 digits (no leading 0) must fail');
      assert(!isValidMobile('9849123456', '91') === false, 'sanity');
      assert(validMobileOrEmpty('919849123456', '91') === '+919849123456', 'typed 91 prefix should be stripped');
    },
  },
  {
    name: 'Registration validation: other countries via the country-code selector',
    fn: () => {
      assert(validMobileOrEmpty('4155552671', '1') === '+14155552671', 'US number should get +1');
      assert(validMobileOrEmpty('07911 123456', '44') === '+447911123456', 'UK trunk 0 should be stripped');
      assert(validMobileOrEmpty('+44 7911 123456', '44') === '+447911123456', 'typed +44 should not be doubled');
      assert(validMobileOrEmpty('501234567', '971') === '+971501234567', 'UAE number accepted');
      assert(validMobileOrEmpty('1234', '1') === '', 'too short must fail');
      assert(validMobileOrEmpty('5555555555', '1') === '', 'all-same digits must fail');
      const ev = baseEvent();
      assert(!validateRegistration({ ...validRegForm(), mobile: '4155552671', mobileDial: '1' }, ev).mobile, 'US form should pass');
      assert(!!validateRegistration({ ...validRegForm(), mobile: '4155552671', mobileDial: '91' }, ev).mobile, 'US number under India must fail');
    },
  },
  {
    name: 'Registration validation: qualification dropdown + "Other" needs text',
    fn: () => {
      const ev = baseEvent();
      assert(QUALIFICATION_OPTIONS.includes('B.Tech / B.E') && QUALIFICATION_OPTIONS.includes('Other'), 'option list must contain the standard degrees and Other');
      assert(!!validateRegistration({ ...validRegForm(), qualification: 'Other' }, ev).qualification, 'bare "Other" must ask for text');
      assert(!validateRegistration({ ...validRegForm(), qualification: 'B.Pharm' }, ev).qualification, 'typed qualification is fine');
      assert(!validateRegistration({ ...validRegForm(), qualification: '' }, ev).qualification, 'qualification is optional');
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
    name: 'Share text: plain text only (no emoji → no "?" boxes in WhatsApp) and carries the link',
    fn: () => {
      const text = buildShareText(baseEvent({ title: 'Free Seminar' }), 'https://example.com/#/events/free-seminar');
      // Emoji are surrogate pairs / symbol-block characters — none may appear.
      assert(!/[\uD800-\uDFFF\u2600-\u27BF\u2B00-\u2BFF]/.test(text), `share text contains emoji/symbols: ${JSON.stringify(text)}`);
      assert(text.startsWith('Free Seminar\n'), 'title must be the first line');
      assert(text.includes('https://example.com/#/events/free-seminar'), 'link missing');
      assert(text.includes('Free registration'), 'free wording missing');
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
