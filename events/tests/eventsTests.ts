// Events module test suite — pure-logic assertions, following the app's
// in-app test-runner convention (no Node test runner in this project).
// Run from Events → "Run module tests".

import { slugify, uniqueSlug, formatRegistrationCode, randomRegistrationCode } from '../lib/slug';
import { istInputToUtcIso, utcIsoToIstInput, formatISTTime, formatISTDate, formatISTRange, relativeToNow, istCalendarDayDiff } from '../lib/datetime';
import {
  validateForPublish, validateRegistration, lifecycleOf, registrationWindow, seatsRemaining,
  normalizeEmail, normalizePhone, isValidMobile, validMobileOrEmpty, QUALIFICATION_OPTIONS,
} from '../lib/validate';
import { youtubeVideoId, youtubeEmbedUrl } from '../lib/video';
import { buildShareText } from '../components/shared';
import { emptyCounters, emptyPrivateDetails } from '../services/eventsDb';
import { EventInvite, SprEvent } from '../types';
import { parseContactRows, planInvites, registeredInviteIds, renderInviteText, inviteMessageToHtml, inviteVars, defaultInviteTemplate, inviteWhatsAppText, defaultFollowupTemplate, followupLinkUrl, followupWhatsAppText } from '../lib/invites';
import { inviteEmailHtml, followupEmailHtml } from '../lib/emails';

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
      assert(formatISTDate(utc) === 'Sat, 15 Aug 2026', `date shape must be 'Sat, 15 Aug 2026' on every browser, got '${formatISTDate(utc)}'`);
      const range = formatISTRange(utc, istInputToUtcIso('2026-08-15T13:00'));
      assert(range.startsWith('Sat, 15 Aug 2026 · ') && range.endsWith(' IST') && !/,s*2026/.test(range.replace('Sat,', '')), `range separators inconsistent: ${range}`);
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
  {
    name: 'Invite list: header row detected, columns mapped, phones normalized',
    fn: () => {
      const rows = [
        ['S.No', 'Full Name', 'Email ID', 'Mobile Number'],
        [1, 'Priya Sharma', 'Priya@Example.com', '98765 43210'],
        [2, 'Rahul Verma', '', '+91 98765-43211'],
        [3, '', 'no-at-sign', 'abc'],
        [4, 'Only Name', '', ''],
      ];
      const r = parseContactRows(rows);
      assert(r.headerRow === 0, 'header row not detected');
      assert(r.contacts.length === 2, `expected 2 contacts, got ${r.contacts.length}`);
      assert(r.contacts[0].email === 'priya@example.com' && r.contacts[0].mobile === '+919876543210' && r.contacts[0].name === 'Priya Sharma', 'first contact wrong: ' + JSON.stringify(r.contacts[0]));
      assert(r.contacts[1].email === '' && r.contacts[1].mobile === '+919876543211', 'mobile-only row wrong');
      assert(r.unusable === 2, `expected 2 unusable rows, got ${r.unusable}`);
    },
  },
  {
    name: 'Invite list: no header row — cells are recognised by shape',
    fn: () => {
      const rows = [
        ['9876543210', 'Anita', 'anita@example.com'],
        ['bala@example.com'],
        ['', ''],
      ];
      const r = parseContactRows(rows);
      assert(r.headerRow === null, 'should have no header row');
      assert(r.contacts.length === 2, `expected 2 contacts, got ${r.contacts.length}`);
      assert(r.contacts[0].name === 'Anita' && r.contacts[0].email === 'anita@example.com' && r.contacts[0].mobile === '+919876543210', 'shape detection wrong: ' + JSON.stringify(r.contacts[0]));
      assert(r.contacts[1].email === 'bala@example.com' && r.contacts[1].name === '', 'email-only row wrong');
    },
  },
  {
    name: 'Invite list: duplicates in file and already-listed people are skipped',
    fn: () => {
      const existing: EventInvite[] = [{ id: 'inv-1', eventId: 'evt-test', name: 'Old', email: 'old@example.com', mobile: '', status: 'sent', sentCount: 1, source: 'a.csv', createdAt: '', createdBy: '' }];
      const contacts = parseContactRows([
        ['Name', 'Email', 'Mobile'],
        ['Old Person', 'OLD@example.com', ''],
        ['New', 'new@example.com', '9876543210'],
        ['New again', 'new@example.com', ''],
        ['Same phone', '', '9876543210'],
        ['Phone only', '', '9876543299'],
      ]).contacts;
      const plan = planInvites(contacts, existing, { eventId: 'evt-test', userId: 'u1', source: 'b.csv', now: '2026-01-01T00:00:00.000Z' });
      assert(plan.toAdd.length === 2, `expected 2 to add, got ${plan.toAdd.length}`);
      assert(plan.alreadyListed === 1, 'already-listed count wrong');
      assert(plan.duplicatesInFile === 2, `duplicates-in-file wrong: ${plan.duplicatesInFile}`);
      assert(plan.mobileOnly === 1 && plan.toAdd[1].status === 'no_email', 'mobile-only row should be no_email');
      assert(plan.toAdd[0].status === 'pending' && plan.toAdd[0].eventId === 'evt-test' && plan.toAdd[0].source === 'b.csv', 'new invite fields wrong');
    },
  },
  {
    name: 'Invite list: registered invitees matched by email or mobile',
    fn: () => {
      const invites: EventInvite[] = [
        { id: 'a', eventId: 'e', name: '', email: 'a@example.com', mobile: '', status: 'sent', sentCount: 1, source: '', createdAt: '', createdBy: '' },
        { id: 'b', eventId: 'e', name: '', email: '', mobile: '+919876543210', status: 'no_email', sentCount: 0, source: '', createdAt: '', createdBy: '' },
        { id: 'c', eventId: 'e', name: '', email: 'c@example.com', mobile: '', status: 'sent', sentCount: 1, source: '', createdAt: '', createdBy: '' },
      ];
      const regs = [
        { email: 'A@example.com', mobile: '+910000000000', status: 'confirmed' },
        { email: 'x@example.com', mobile: '+919876543210', status: 'attended' },
        { email: 'c@example.com', mobile: '', status: 'cancelled' },
      ];
      const set = registeredInviteIds(invites, regs);
      assert(set.has('a') && set.has('b') && !set.has('c'), `registered set wrong: ${[...set].join(',')}`);
    },
  },
  {
    name: 'Invite email: placeholders, bold, escaping, ?ref=email link',
    fn: () => {
      const ev = baseEvent({ title: 'AI & Testing', shortDescription: 'Short <b>desc</b>', speakers: [{ name: 'Thirumal Reddy S', title: 'Trainer' }], whatYouWillLearn: ['Point one', 'Point two'] });
      const vars = inviteVars(ev, { name: 'priya sharma' });
      assert(vars.first_name === 'priya' && vars.name === 'priya sharma', 'name vars wrong');
      assert(inviteVars(ev).first_name === 'there', 'missing name should greet "there"');
      assert(/\/e\/test-event\/\?ref=email$/.test(vars.link), `link should carry ?ref=email: ${vars.link}`);
      assert(inviteVars(ev, {}, 'https://sprtechforge.com/e/live-slug/').link === 'https://sprtechforge.com/e/live-slug/?ref=email', 'link override should point at the pasted site with ?ref=email');
      assert(inviteVars(ev, {}, 'https://sprtechforge.com/webinar?x=1').link === 'https://sprtechforge.com/webinar?x=1&ref=email', 'override with a query string should append &ref');
      assert(inviteVars(ev, {}, 'https://sprtechforge.com/e/x/?ref=partner').link === 'https://sprtechforge.com/e/x/?ref=partner', 'an override that already has ?ref must be left alone');
      assert(/\/e\/test-event\/\?ref=email$/.test(inviteVars(ev, {}, 'sprtechforge.com/no-scheme').link), 'a non-URL override must fall back to this site');
      assert(inviteEmailHtml(ev, {}, { ...defaultInviteTemplate(), linkOverride: 'https://sprtechforge.com/e/live-slug/' }).includes('https://sprtechforge.com/e/live-slug/?ref=email'), 'email should use the override link');
      assert(renderInviteText('Hi {{first_name}} — {{event_title}}', vars, false) === 'Hi priya — AI & Testing', 'plain render wrong');
      assert(renderInviteText('{{event_title}} {{unknown}}', vars, true) === 'AI &amp; Testing {{unknown}}', 'escaped render / unknown placeholder wrong');
      const html = inviteMessageToHtml('One **bold** line\nsecond line\n\nPara two {{short_description}}', vars);
      assert(html.includes('<strong>bold</strong>') && html.includes('second line') && html.includes('<br/>'), 'bold / line break missing');
      assert((html.match(/<p /g) || []).length === 2, 'expected 2 paragraphs');
      assert(html.includes('Short &lt;b&gt;desc&lt;/b&gt;'), 'values must be HTML-escaped');
      const full = inviteEmailHtml(ev, { name: 'Priya' }, defaultInviteTemplate());
      assert(full.includes('?ref=email') && full.includes('Reserve my free seat') && full.includes('Point one') && full.includes('Thirumal Reddy S'), 'full email missing parts');
      assert(full.includes('unsubscribe'), 'opt-out line missing');
      const wa = inviteWhatsAppText(ev, defaultInviteTemplate());
      assert(wa.includes('*free live session*') && wa.includes('?ref=email') && !wa.includes('&amp;') && !wa.includes('<p'), 'WhatsApp text wrong (plain text, no escaping, no HTML)');
    },
  },
  {
    name: 'Follow-up survey: links carry the answer and email, email has Yes/No buttons, next session renders',
    fn: () => {
      const ev = baseEvent({ title: 'AI & Testing', slug: 'ai-testing' });
      const yes = followupLinkUrl(ev, 'yes', 'Priya@Example.com');
      assert(yes.includes('#/events/ai-testing/feedback?') && yes.includes('joined=yes') && yes.includes('e=priya%40example.com') && yes.includes('ref=email'), `yes link wrong: ${yes}`);
      const plain = followupLinkUrl(ev, '', '');
      assert(!plain.includes('joined=') && !plain.includes('e=') && plain.includes('ref=email'), `plain link wrong: ${plain}`);
      const over = followupLinkUrl(ev, 'no', 'a@b.co', 'https://sprtechforge.com/#/events/ai-testing/feedback');
      assert(over.startsWith('https://sprtechforge.com/#/events/ai-testing/feedback?') && over.includes('joined=no'), `override link wrong: ${over}`);
      const tpl = { ...defaultFollowupTemplate(), nextSessionLabel: 'Saturday 10 Oct, 7:00 PM IST' };
      const html = followupEmailHtml(ev, { name: 'Priya Sharma', email: 'priya@example.com' }, tpl);
      assert(html.includes('Yes, I joined') && html.includes('No, I could not join'), 'both buttons must be present');
      assert(html.includes('joined=yes') && html.includes('joined=no') && html.includes('e=priya%40example.com'), 'buttons must deep-link with answer + email');
      assert(html.includes('Saturday 10 Oct, 7:00 PM IST'), 'next session label must render in the message');
      assert(html.includes('Hi Priya,'), 'first name greeting missing');
      assert(renderInviteText('x {{next_session}} y', { ...inviteVars(ev), next_session: 'SAT' } as any, false) === 'x SAT y', 'next_session placeholder not rendered');
      assert(renderInviteText('x {{next_session}} y', inviteVars(ev), false) === 'x {{next_session}} y', 'undefined placeholder must be left alone');
      const wa = followupWhatsAppText(ev, tpl);
      assert(wa.includes('Saturday 10 Oct') && wa.includes('/feedback') && !wa.includes('<'), 'WhatsApp follow-up text wrong');
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
