// Validation for the events module: the publish gate (admin side) and the
// public registration form. Pure functions — covered by events/tests.
// Email/phone normalization is reused from the seminar module's battle-tested
// helpers rather than re-implemented.

import { normalizePhone, isValidEmail, normalizeEmail } from '../../seminar/lib/normalize';
import { EventPrivateDetails, EventRegistration, SprEvent, EventLifecycle } from '../types';
import { isValidIso } from './datetime';
import { youtubeVideoId } from './video';

export { normalizePhone, isValidEmail, normalizeEmail };

/** Dropdown choices for the "Qualification / degree" field. 'Other' reveals a free-text box. */
export const QUALIFICATION_OPTIONS = [
  'B.Tech / B.E',
  'M.Tech / M.E',
  'B.Sc',
  'M.Sc',
  'BCA',
  'MCA',
  'B.Com',
  'M.Com',
  'BBA',
  'MBA',
  'B.A',
  'M.A',
  'Diploma / Polytechnic',
  'Intermediate / 12th',
  'Other',
] as const;

/**
 * Stricter-than-normalizePhone check for a REAL Indian mobile number:
 * exactly 10 digits after +91, starting 6–9, and not an obvious placeholder
 * (all one digit, or a straight ascending/descending run). International
 * numbers (+<cc>…) are accepted as-is when they normalize.
 * Returns the normalized E.164 number, or '' when invalid.
 */
export const validMobileOrEmpty = (raw: string): string => {
  const normalized = normalizePhone(raw);
  if (!normalized) return '';
  if (!normalized.startsWith('+91')) return normalized;
  const local = normalized.slice(3);
  if (local.length !== 10 || !/^[6-9]\d{9}$/.test(local)) return '';
  if (/^(\d)\1{9}$/.test(local)) return '';                         // 9999999999
  if ('0123456789'.includes(local) || '9876543210'.includes(local)) return ''; // 1234567890 / 9876543210
  return normalized;
};

export const isValidMobile = (raw: string): boolean => !!validMobileOrEmpty(raw);

export interface PublishIssue {
  step: number;         // editor step to jump to
  message: string;
}

/**
 * The publish gate. Returns every problem at once (never one-at-a-time
 * whack-a-mole). Empty array = safe to publish.
 */
export const validateForPublish = (ev: SprEvent, priv: EventPrivateDetails): PublishIssue[] => {
  const issues: PublishIssue[] = [];
  const add = (step: number, message: string) => issues.push({ step, message });

  if (!ev.title.trim()) add(1, 'Title is required');
  if (!ev.shortDescription.trim()) add(1, 'Short description is required (shown on event cards)');
  if (!ev.fullDescription.trim()) add(1, 'Full description is required');

  if (!isValidIso(ev.startAt)) add(2, 'Start date & time is required');
  if (!isValidIso(ev.endAt)) add(2, 'End date & time is required');
  if (isValidIso(ev.startAt) && isValidIso(ev.endAt) && new Date(ev.endAt) <= new Date(ev.startAt)) {
    add(2, 'End time must be after the start time');
  }
  if (isValidIso(ev.startAt) && new Date(ev.startAt).getTime() <= Date.now()) {
    add(2, 'Start time is in the past — pick a future date/time');
  }
  if (ev.registrationClosesAt && isValidIso(ev.startAt) && new Date(ev.registrationClosesAt) > new Date(ev.startAt)) {
    add(2, 'Registration close time must not be after the event starts');
  }

  if (ev.mode === 'online' || ev.mode === 'hybrid') {
    if (!priv.joinUrl.trim()) add(2, 'Join URL is required for an online/hybrid event (kept private until someone registers)');
  }
  if (ev.mode === 'offline' || ev.mode === 'hybrid') {
    if (!ev.venueName.trim()) add(2, 'Venue name is required for an offline/hybrid event');
    if (!ev.venueAddress.trim()) add(2, 'Venue address is required for an offline/hybrid event');
  }

  if (!ev.bannerUrl) add(3, 'Banner image is required — it is the first thing people see on the shared link');
  if ((ev.videoUrl || '').trim() && !youtubeVideoId(ev.videoUrl || '')) {
    add(3, 'The intro video link is not a YouTube link — paste a youtube.com/watch or youtu.be link, or clear the field');
  }

  ev.customQuestions.forEach((q, i) => {
    if (!q.label.trim()) add(4, `Custom question ${i + 1} has no label`);
    if (q.fieldType === 'select' && q.options.filter(o => o.trim()).length < 2) {
      add(4, `Custom question "${q.label || i + 1}" needs at least 2 options`);
    }
  });

  return issues;
};

export interface RegistrationFormInput {
  fullName: string;
  email: string;
  mobile: string;
  city: string;
  qualification: string;
  passingYear: string;
  currentStatus: string;
  howDidYouHear: string;
  customAnswers: Record<string, string>;
  /**
   * The single "I agree to the terms & to be contacted" box. Email and
   * WhatsApp consent are recorded from this same tick (see PublicEventPage);
   * the separate flags remain so older callers/tests still type-check.
   */
  consentTerms: boolean;
  consentEmail: boolean;
  consentWhatsApp: boolean;
}

/** Field-keyed errors for inline display. Empty object = valid. */
export const validateRegistration = (form: RegistrationFormInput, ev: SprEvent): Record<string, string> => {
  const errors: Record<string, string> = {};
  if (form.fullName.trim().length < 2) errors.fullName = 'Please enter your full name';
  if (!isValidEmail(form.email)) errors.email = 'Please enter a valid email address';
  if (!isValidMobile(form.mobile)) errors.mobile = 'Enter a valid 10-digit Indian mobile number (starts with 6–9) — we send the joining link to it';
  if (ev.collectFields.qualification && form.qualification.trim().toLowerCase() === 'other') {
    errors.qualification = 'Please type your qualification';
  }
  for (const q of ev.customQuestions) {
    if (q.required && !(form.customAnswers[q.id] || '').trim()) {
      errors[`q_${q.id}`] = 'This field is required';
    }
  }
  if (!form.consentTerms) errors.consentTerms = 'Please accept the terms to register';
  return errors;
};

/** Computed phase of an event, from its times. */
export const lifecycleOf = (ev: Pick<SprEvent, 'startAt' | 'endAt'>, now = Date.now()): EventLifecycle => {
  const start = new Date(ev.startAt).getTime();
  const end = isValidIso(ev.endAt) ? new Date(ev.endAt).getTime() : start;
  if (now < start) return 'upcoming';
  if (now <= end) return 'live';
  return 'past';
};

export type RegistrationWindow =
  | { open: true }
  | { open: false; reason: 'closed_early' | 'window_over' | 'event_over' | 'not_published' };

/** Whether new registrations are accepted right now. */
export const registrationWindow = (ev: SprEvent, now = Date.now()): RegistrationWindow => {
  if (ev.status !== 'published') return { open: false, reason: 'not_published' };
  if (ev.registrationClosedEarly) return { open: false, reason: 'closed_early' };
  if (lifecycleOf(ev, now) === 'past') return { open: false, reason: 'event_over' };
  const closeIso = ev.registrationClosesAt || ev.startAt;
  if (isValidIso(closeIso) && now > new Date(closeIso).getTime()) return { open: false, reason: 'window_over' };
  return { open: true };
};

/** Seats remaining, or null for unlimited. */
export const seatsRemaining = (ev: SprEvent): number | null => {
  if (!ev.capacity || ev.capacity <= 0) return null;
  return Math.max(0, ev.capacity - ev.counters.confirmed);
};
