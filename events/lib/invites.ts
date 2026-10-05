// Invite-by-email campaign for one event: parsing the uploaded contact list,
// de-duplicating it against what is already on the list, and rendering the
// admin's editable template. Pure functions — covered by events/tests.

import { isValidEmail, normalizeEmail, normalizePhone, cleanText } from '../../seminar/lib/normalize';
import { escapeHtml } from '../../seminar/lib/template';
import { EventInvite, EventInviteTemplate, SprEvent } from '../types';
import { formatISTDate, formatISTRange, formatISTTime } from './datetime';
import { publicEventUrl } from '../components/shared';

/** The ?ref= code stamped on every link in an invitation email — shows up as its own row in "Registrations by source". */
export const INVITE_REF_CODE = 'email';

/** A pasted link is used only when it is a real http(s) URL; anything else falls back to this site's event page. */
export const validLinkOverride = (raw: string | undefined): string => {
  const s = String(raw || '').trim();
  if (!/^https?:\/\/[^\s]+$/i.test(s)) return '';
  try { new URL(s); return s; } catch { return ''; }
};

export const inviteLinkUrl = (ev: Pick<SprEvent, 'slug'>, linkOverride?: string): string => {
  const base = validLinkOverride(linkOverride) || publicEventUrl(ev.slug);
  if (/[?&]ref=/.test(base)) return base;
  const [pathPart, hashPart] = base.split('#');
  const joined = `${pathPart}${pathPart.includes('?') ? '&' : '?'}ref=${INVITE_REF_CODE}`;
  return hashPart !== undefined ? `${joined}#${hashPart}` : joined;
};

export const generateInviteId = (): string =>
  `inv-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

// ---------------------------------------------------------------------------
// Default email copy
// ---------------------------------------------------------------------------

export const INVITE_PLACEHOLDERS = [
  ['{{first_name}}', 'First name from the list ("there" when the row has no name)'],
  ['{{name}}', 'Full name from the list'],
  ['{{event_title}}', 'Event title'],
  ['{{short_description}}', 'The event\'s short description'],
  ['{{date}}', 'Event date, e.g. Sat, 3 Oct 2026'],
  ['{{time}}', 'Start time, e.g. 7:00 pm IST'],
  ['{{when}}', 'Date and time range'],
  ['{{where}}', 'Online on <platform> / venue name'],
  ['{{speaker}}', 'First speaker\'s name'],
  ['{{link}}', 'Registration link (already on the button)'],
  ['{{next_session}}', 'Follow-up survey only: the next session label from the field below'],
] as const;

export const defaultInviteTemplate = (): EventInviteTemplate => ({
  subject: '{{first_name}}, your free seat: {{event_title}} ({{date}})',
  headline: 'You\'re invited — {{event_title}}',
  message: `Hi {{first_name}},

{{short_description}}

We are running this as a **free live session** on {{when}}, {{where}}, and you are invited.

It is free, but the joining link goes only to registered attendees and seats are limited. Reserving yours takes 30 seconds.`,
  buttonLabel: 'Reserve my free seat →',
  closing: 'P.S. Cannot make it live? Register anyway — registered attendees get the recording and the slides.',
  includeHighlights: true,
  includeAgenda: false,
});

// ---------------------------------------------------------------------------
// Post-event follow-up survey
// ---------------------------------------------------------------------------

export const defaultFollowupTemplate = (): EventInviteTemplate => ({
  subject: 'Did you join {{event_title}}? One quick question',
  headline: 'Thank you — and one quick question',
  message: `Hi {{first_name}},

Thank you for registering for **{{event_title}}** on {{date}}.

Over 200 people registered and the live Q&A ran past time, but we also heard that the joining link did not open for some of you on a phone. We want to get this right, so please tell us which of these describes you. It takes about two minutes.

If you joined: how was it, and what should we improve? If you could not: what stopped you, and would you like to join the repeat session on {{next_session}}?`,
  buttonLabel: 'Yes, I joined',
  closing: 'Everyone who answers gets the recording and the 60-day plan by email, whether or not you could attend.',
  includeHighlights: false,
  includeAgenda: false,
  linkOverride: '',
  nextSessionLabel: 'Saturday 10 Oct, 7:00 PM IST',
});

/** The survey page for this event on the current site (or the pasted base), with the person's answer and email pre-filled. */
export const followupLinkUrl = (ev: Pick<SprEvent, 'slug'>, joined: 'yes' | 'no' | '', email: string, linkOverride?: string): string => {
  const base = validLinkOverride(linkOverride) || `${window.location.origin}${window.location.pathname}#/events/${ev.slug}/feedback`;
  const params = new URLSearchParams();
  if (joined) params.set('joined', joined);
  if (email) params.set('e', email.trim().toLowerCase());
  params.set('ref', INVITE_REF_CODE);
  const qs = params.toString();
  // A hash route keeps its query after the hash (#/path?x=1); a plain URL takes it before.
  if (base.includes('#')) return `${base}${base.includes('?') ? '&' : '?'}${qs}`;
  return `${base}${base.includes('?') ? '&' : '?'}${qs}`;
};

export const FEEDBACK_REASON_LABELS: Record<string, string> = {
  link_mobile: 'The joining link did not work on my phone',
  link_failed: 'The link did not open at all',
  busy: 'I was busy at that time',
  forgot: 'I forgot about it',
  no_details: 'I did not receive the joining details',
  other: 'Something else',
};

export const FEEDBACK_LIKED_OPTIONS = ['Live testing demo', 'AI in testing demos', 'Jobs and salary numbers', 'Career questions answered', '60-day plan', 'Live Q&A'];

/** The same follow-up as a WhatsApp message (one link, no personalisation). */
export const followupWhatsAppText = (ev: SprEvent, tpl: EventInviteTemplate): string => {
  const vars = inviteVars(ev, {}, undefined);
  const body = renderInviteText(tpl.message, { ...vars, next_session: tpl.nextSessionLabel || '' } as any, false).replace(/\*\*(.+?)\*\*/g, '*$1*').trim();
  return `${body}\n\nAnswer here (2 minutes): ${followupLinkUrl(ev, '', '', tpl.linkOverride)}`;
};

// ---------------------------------------------------------------------------
// Template rendering
// ---------------------------------------------------------------------------

export interface InviteVars {
  first_name: string;
  name: string;
  event_title: string;
  short_description: string;
  date: string;
  time: string;
  when: string;
  where: string;
  speaker: string;
  link: string;
  /** Follow-up survey only: the next session's date/time label. */
  next_session?: string;
}

export const whereText = (ev: Pick<SprEvent, 'mode' | 'platform' | 'venueName'>): string => {
  if (ev.mode === 'offline') return ev.venueName ? `in person at ${ev.venueName}` : 'in person';
  if (ev.mode === 'hybrid') return `online${ev.platform ? ` on ${ev.platform}` : ''} or in person${ev.venueName ? ` at ${ev.venueName}` : ''}`;
  return `online${ev.platform ? ` on ${ev.platform}` : ''}`;
};

export const inviteVars = (ev: SprEvent, person: { name?: string } = {}, linkOverride?: string): InviteVars => {
  const name = cleanText(person.name || '');
  return {
    first_name: name ? name.split(' ')[0] : 'there',
    name: name || 'there',
    event_title: ev.title,
    short_description: ev.shortDescription,
    date: formatISTDate(ev.startAt),
    time: `${formatISTTime(ev.startAt)} IST`,
    when: formatISTRange(ev.startAt, ev.endAt),
    where: whereText(ev),
    speaker: ev.speakers?.[0]?.name || '',
    link: inviteLinkUrl(ev, linkOverride),
  };
};

/**
 * Replaces {{placeholders}} in admin text. With `escape` the whole text and the
 * values are HTML-escaped (for the email body); without it the result is plain
 * text (subjects, WhatsApp).
 */
export const renderInviteText = (tpl: string, vars: InviteVars, escape: boolean): string => {
  const src = escape ? escapeHtml(tpl) : String(tpl || '');
  return src.replace(/\{\{\s*([a-z_]+)\s*\}\}/g, (m, key: string) => {
    if (!(key in vars) || (vars as any)[key] === undefined) return m;
    const v = (vars as any)[key] ?? '';
    return escape ? escapeHtml(v) : String(v);
  });
};

/** Plain text with blank-line paragraphs and **bold** → email-safe HTML paragraphs. */
export const inviteMessageToHtml = (message: string, vars: InviteVars): string =>
  renderInviteText(message, vars, true)
    .split(/\n\s*\n/)
    .map(p => p.trim())
    .filter(Boolean)
    .map(p => `<p style="margin:0 0 14px 0;">${p.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br/>')}</p>`)
    .join('');

/** The same invitation as a WhatsApp / SMS message (no HTML, generic greeting). */
export const inviteWhatsAppText = (ev: SprEvent, tpl: EventInviteTemplate): string => {
  const vars = inviteVars(ev, {}, tpl.linkOverride);
  const body = renderInviteText(tpl.message, vars, false).replace(/\*\*(.+?)\*\*/g, '*$1*').trim();
  return `${body}\n\n${tpl.buttonLabel.replace(/\s*→\s*$/, '')}: ${vars.link}`;
};

// ---------------------------------------------------------------------------
// Contact list parsing (rows from xlsx.utils.sheet_to_json(..., { header: 1 }))
// ---------------------------------------------------------------------------

export interface ParsedContact {
  name: string;
  email: string;   // normalized; '' when missing/invalid
  mobile: string;  // E.164; '' when missing/invalid
  row: number;     // 1-based row number in the sheet, for messages
}

export interface ParseReport {
  contacts: ParsedContact[];
  /** Rows that had neither a valid email nor a valid mobile. */
  unusable: number;
  headerRow: number | null;
}

const HEADER_HINTS = {
  name: /^(full\s*)?name$|candidate|student|person|contact\s*name/i,
  email: /e-?mail|mail\s*id/i,
  mobile: /mobile|phone|contact\s*(no|number)?$|whatsapp|cell|number/i,
};

const looksLikeHeader = (row: any[]): boolean =>
  row.some(c => typeof c === 'string' && (HEADER_HINTS.email.test(c) || HEADER_HINTS.mobile.test(c) || HEADER_HINTS.name.test(c)));

const cellText = (c: any): string => cleanText(typeof c === 'number' ? String(c) : c);

const firstEmailIn = (row: any[]): string => {
  for (const c of row) { const e = normalizeEmail(cellText(c)); if (e && isValidEmail(e)) return e; }
  return '';
};
const firstMobileIn = (row: any[], skip: string): string => {
  for (const c of row) {
    const t = cellText(c);
    if (!t || t === skip || t.includes('@')) continue;
    const digits = t.replace(/\D/g, '');
    if (digits.length < 10 || digits.length > 15) continue;
    const p = normalizePhone(t);
    if (p) return p;
  }
  return '';
};
const firstNameIn = (row: any[], email: string, mobile: string): string => {
  for (const c of row) {
    const t = cellText(c);
    if (!t || t.includes('@') || /^\+?[\d\s()-]{7,}$/.test(t) || t.length < 2 || t.length > 80) continue;
    if (email && t.toLowerCase() === email) continue;
    if (mobile && normalizePhone(t) === mobile) continue;
    return t;
  }
  return '';
};

/**
 * Turns sheet rows into contacts. Works with or without a header row: with
 * headers the Name / Email / Mobile columns are used, and any cell that is
 * empty falls back to scanning the row (people often put the email in the
 * wrong column); without headers every row is scanned.
 */
export const parseContactRows = (rows: any[][]): ParseReport => {
  const contacts: ParsedContact[] = [];
  let unusable = 0;
  let headerRow: number | null = null;
  let cols = { name: -1, email: -1, mobile: -1 };

  for (let i = 0; i < Math.min(rows.length, 10); i++) {
    const r = rows[i] || [];
    if (looksLikeHeader(r)) {
      headerRow = i;
      r.forEach((c, idx) => {
        const t = typeof c === 'string' ? c : '';
        if (cols.email < 0 && HEADER_HINTS.email.test(t)) cols.email = idx;
        else if (cols.mobile < 0 && HEADER_HINTS.mobile.test(t)) cols.mobile = idx;
        else if (cols.name < 0 && HEADER_HINTS.name.test(t)) cols.name = idx;
      });
      break;
    }
  }

  for (let i = headerRow === null ? 0 : headerRow + 1; i < rows.length; i++) {
    const r = rows[i] || [];
    if (r.every(c => cellText(c) === '')) continue;
    let email = cols.email >= 0 ? normalizeEmail(cellText(r[cols.email])) : '';
    if (!email || !isValidEmail(email)) email = firstEmailIn(r);
    let mobile = cols.mobile >= 0 ? normalizePhone(cellText(r[cols.mobile])) : '';
    if (!mobile) mobile = firstMobileIn(r, email);
    let name = cols.name >= 0 ? cellText(r[cols.name]) : '';
    if (!name || name.includes('@')) name = firstNameIn(r, email, mobile);
    if (!email && !mobile) { unusable++; continue; }
    contacts.push({ name, email, mobile, row: i + 1 });
  }
  return { contacts, unusable, headerRow };
};

// ---------------------------------------------------------------------------
// Merge into the event's list
// ---------------------------------------------------------------------------

export interface InvitePlan {
  toAdd: EventInvite[];
  /** Same person twice in the file. */
  duplicatesInFile: number;
  /** Already on this event's invite list. */
  alreadyListed: number;
  /** Added with a mobile number only — cannot be emailed, but exportable for WhatsApp. */
  mobileOnly: number;
}

const identity = (email: string, mobile: string): string => (email ? `e:${email}` : mobile ? `p:${mobile}` : '');

export const planInvites = (
  contacts: ParsedContact[],
  existing: EventInvite[],
  ctx: { eventId: string; userId: string; source: string; now?: string },
): InvitePlan => {
  const seen = new Set<string>();
  existing.forEach(i => { if (i.email) seen.add(`e:${i.email}`); if (i.mobile) seen.add(`p:${i.mobile}`); });
  const plan: InvitePlan = { toAdd: [], duplicatesInFile: 0, alreadyListed: 0, mobileOnly: 0 };
  const inFile = new Set<string>();
  const now = ctx.now || new Date().toISOString();
  for (const c of contacts) {
    const key = identity(c.email, c.mobile);
    if (!key) continue;
    const keys = [c.email ? `e:${c.email}` : '', c.mobile ? `p:${c.mobile}` : ''].filter(Boolean);
    if (keys.some(k => inFile.has(k))) { plan.duplicatesInFile++; continue; }
    if (keys.some(k => seen.has(k))) { plan.alreadyListed++; keys.forEach(k => inFile.add(k)); continue; }
    keys.forEach(k => inFile.add(k));
    if (!c.email) plan.mobileOnly++;
    plan.toAdd.push({
      id: generateInviteId(),
      eventId: ctx.eventId,
      name: c.name,
      email: c.email,
      mobile: c.mobile,
      status: c.email ? 'pending' : 'no_email',
      sentCount: 0,
      source: ctx.source,
      createdAt: now,
      createdBy: ctx.userId,
    });
  }
  return plan;
};

/** Invitees who went on to register: matched by email, then mobile. */
export const registeredInviteIds = (
  invites: EventInvite[],
  regs: { email: string; mobile: string; status: string }[],
): Set<string> => {
  const emails = new Set<string>();
  const mobiles = new Set<string>();
  regs.forEach(r => { if (r.status !== 'cancelled') { if (r.email) emails.add(r.email.toLowerCase()); if (r.mobile) mobiles.add(r.mobile); } });
  const out = new Set<string>();
  invites.forEach(i => { if ((i.email && emails.has(i.email)) || (i.mobile && mobiles.has(i.mobile))) out.add(i.id); });
  return out;
};
