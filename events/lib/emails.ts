// Event email templates + a thin send helper over the app's unified email
// core (services/emailService.ts). Same banner-delivery logic as the seminar
// mailer: hosted banners are referenced by URL; inline (data:) banners are
// CID-embedded because Gmail strips data: images.

import { emailService, isEmailConfigured } from '../../services/emailService';
import { EventPrivateDetails, EventRegistration, SprEvent } from '../types';
import { formatISTRange } from './datetime';
import { escapeHtml } from '../../seminar/lib/template';
import { googleCalendarUrl } from './ics';

const BANNER_CID = 'event-banner';

export const isEventMailerConfigured = isEmailConfigured;

const wrap = (ev: SprEvent, inner: string): string => {
  const bannerSrc = ev.bannerUrl
    ? (ev.bannerUrl.startsWith('data:') ? `cid:${BANNER_CID}` : ev.bannerUrl)
    : '';
  const banner = bannerSrc
    ? `<img src="${bannerSrc}" alt="${escapeHtml(ev.title)}" style="width:100%;max-width:600px;height:auto;display:block;border-radius:8px;margin:0 auto 16px auto;"/>`
    : '';
  return `<div style="max-width:600px;margin:0 auto;font-family:Arial,Helvetica,sans-serif;color:#1f2937;font-size:15px;line-height:1.6;">
    ${banner}${inner}
    <p style="color:#9ca3af;font-size:12px;margin-top:24px;">SPR Techforge · Software Testing Training &amp; Careers</p>
  </div>`;
};

const whereBlock = (ev: SprEvent, priv: EventPrivateDetails | null, forConfirmed: boolean): string => {
  const rows: string[] = [];
  if (ev.mode !== 'offline') {
    if (forConfirmed && priv?.joinUrl) {
      rows.push(`<p><strong>Join online:</strong> <a href="${escapeHtml(priv.joinUrl)}">${escapeHtml(priv.joinUrl)}</a>${ev.platform ? ` (${escapeHtml(ev.platform)})` : ''}</p>`);
      if (priv.meetingId) rows.push(`<p><strong>Meeting ID:</strong> ${escapeHtml(priv.meetingId)}${priv.passcode ? ` · <strong>Passcode:</strong> ${escapeHtml(priv.passcode)}` : ''}</p>`);
    } else {
      rows.push(`<p><strong>Mode:</strong> Online${ev.platform ? ` (${escapeHtml(ev.platform)})` : ''}</p>`);
    }
  }
  if (ev.mode !== 'online' && ev.venueName) {
    rows.push(`<p><strong>Venue:</strong> ${escapeHtml(ev.venueName)}, ${escapeHtml(ev.venueAddress)}${ev.venueMapUrl ? ` · <a href="${escapeHtml(ev.venueMapUrl)}">Map</a>` : ''}</p>`);
  }
  return rows.join('');
};

export const confirmationEmailHtml = (ev: SprEvent, reg: EventRegistration, priv: EventPrivateDetails | null): string => {
  const gcal = googleCalendarUrl(ev);
  const isWaitlisted = reg.status === 'waitlisted';
  return wrap(ev, `
    <h2 style="color:#065f46;">${isWaitlisted ? "You're on the waitlist" : "You're registered! 🎉"}</h2>
    <p>Hi ${escapeHtml(reg.fullName)},</p>
    <p>${isWaitlisted
      ? `The event is currently full, but you're on the waitlist for <strong>${escapeHtml(ev.title)}</strong>. We'll email you if a seat opens up.`
      : `Your free seat for <strong>${escapeHtml(ev.title)}</strong> is confirmed.`}</p>
    <p><strong>When:</strong> ${escapeHtml(formatISTRange(ev.startAt, ev.endAt))}</p>
    ${whereBlock(ev, priv, !isWaitlisted)}
    <p><strong>Your registration code:</strong> <span style="font-family:monospace;font-size:18px;font-weight:bold;">${escapeHtml(reg.registrationCode)}</span><br/>
    <span style="color:#6b7280;font-size:13px;">Keep this handy — it's used for check-in.</span></p>
    ${gcal && !isWaitlisted ? `<p><a href="${gcal}" style="display:inline-block;background:#2563eb;color:#ffffff;padding:10px 18px;border-radius:8px;text-decoration:none;font-weight:bold;">Add to Google Calendar</a></p>` : ''}
  `);
};

export const reminderEmailHtml = (ev: SprEvent, reg: EventRegistration, priv: EventPrivateDetails | null): string =>
  wrap(ev, `
    <h2 style="color:#1d4ed8;">Reminder: ${escapeHtml(ev.title)}</h2>
    <p>Hi ${escapeHtml(reg.fullName)},</p>
    <p>Just a reminder about the event you registered for.</p>
    <p><strong>When:</strong> ${escapeHtml(formatISTRange(ev.startAt, ev.endAt))}</p>
    ${whereBlock(ev, priv, true)}
    <p><strong>Your registration code:</strong> <span style="font-family:monospace;font-weight:bold;">${escapeHtml(reg.registrationCode)}</span></p>
    <p>See you there!</p>
  `);

export const cancellationEmailHtml = (ev: SprEvent, reg: EventRegistration, reason: string): string =>
  wrap(ev, `
    <h2 style="color:#b91c1c;">Event cancelled: ${escapeHtml(ev.title)}</h2>
    <p>Hi ${escapeHtml(reg.fullName)},</p>
    <p>We're sorry — the event scheduled for <strong>${escapeHtml(formatISTRange(ev.startAt, ev.endAt))}</strong> has been cancelled.</p>
    ${reason ? `<p><strong>Reason:</strong> ${escapeHtml(reason)}</p>` : ''}
    <p>We'll let you know when the next one is announced. Sorry for the inconvenience.</p>
  `);

export const changeNoticeEmailHtml = (ev: SprEvent, reg: EventRegistration, priv: EventPrivateDetails | null): string =>
  wrap(ev, `
    <h2 style="color:#b45309;">Update to your event: ${escapeHtml(ev.title)}</h2>
    <p>Hi ${escapeHtml(reg.fullName)},</p>
    <p>The details of the event you registered for have changed. Here is the latest information:</p>
    <p><strong>When:</strong> ${escapeHtml(formatISTRange(ev.startAt, ev.endAt))}</p>
    ${whereBlock(ev, priv, true)}
    <p><strong>Your registration code:</strong> <span style="font-family:monospace;font-weight:bold;">${escapeHtml(reg.registrationCode)}</span> (unchanged)</p>
  `);

/**
 * Free-form message from an admin (the "Email selected registrants" modal).
 * The typed text becomes paragraphs; the event details, join link and
 * registration code are appended so every message doubles as a reminder.
 */
export const customMessageEmailHtml = (ev: SprEvent, reg: EventRegistration, priv: EventPrivateDetails | null, message: string): string => {
  const paragraphs = (message || '')
    .split(/\n\s*\n/)
    .map(p => p.trim())
    .filter(Boolean)
    .map(p => `<p>${escapeHtml(p).replace(/\n/g, '<br/>')}</p>`)
    .join('');
  return wrap(ev, `
    <p>Hi ${escapeHtml(reg.fullName)},</p>
    ${paragraphs}
    <div style="background:#f3f4f6;border-radius:8px;padding:12px 16px;margin-top:16px;">
      <p style="margin:0 0 6px 0;"><strong>${escapeHtml(ev.title)}</strong></p>
      <p style="margin:0 0 6px 0;"><strong>When:</strong> ${escapeHtml(formatISTRange(ev.startAt, ev.endAt))}</p>
      ${whereBlock(ev, priv, reg.status !== 'waitlisted')}
      <p style="margin:6px 0 0 0;"><strong>Your registration code:</strong> <span style="font-family:monospace;font-weight:bold;">${escapeHtml(reg.registrationCode)}</span></p>
    </div>
  `);
};

export interface EventEmailOptions {
  /** Override the From address for this send (defaults to the configured sender). */
  from?: string;
  fromName?: string;
}

/** Sends one event email. Banner is CID-embedded when it's an inline data: URL. */
export const sendEventEmail = async (ev: SprEvent, to: string, subject: string, html: string, opts: EventEmailOptions = {}): Promise<void> => {
  await emailService.sendEmail({
    to,
    subject,
    body: html,
    isHtml: true,
    from: opts.from,
    fromName: opts.fromName || 'SPR Techforge',
    inlineImages: ev.bannerUrl && ev.bannerUrl.startsWith('data:')
      ? [{ key: BANNER_CID, url: ev.bannerUrl, name: 'banner' }]
      : undefined,
  });
};
