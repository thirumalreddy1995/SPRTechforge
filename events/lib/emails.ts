// Event email templates + a thin send helper over the app's unified email
// core (services/emailService.ts). Same banner-delivery logic as the seminar
// mailer: hosted banners are referenced by URL; inline (data:) banners are
// CID-embedded because Gmail strips data: images.

import { emailService, isEmailConfigured } from '../../services/emailService';
import { EventInviteTemplate, EventPrivateDetails, EventRegistration, SprEvent } from '../types';
import { formatISTRange } from './datetime';
import { escapeHtml } from '../../seminar/lib/template';
import { googleCalendarUrl } from './ics';
import { followupLinkUrl, inviteMessageToHtml, inviteVars, renderInviteText } from './invites';

const BANNER_CID = 'event-banner';

export const isEventMailerConfigured = isEmailConfigured;

/** Public page for the event on the host the email is sent from (prod or QA). */
const eventPageUrl = (ev: SprEvent): string => `${window.location.origin}/e/${ev.slug}/`;
/** Where the deploy publishes the event banner as a plain JPEG (scripts/build-share-pages.mjs). */
const hostedBannerUrl = (ev: SprEvent): string => `${eventPageUrl(ev)}banner.jpg`;

const wrap = (ev: SprEvent, inner: string, bannerLink: string = eventPageUrl(ev)): string => {
  // data: banners render as cid:… here; sendEventEmail swaps that for the hosted
  // JPEG when it exists, so the picture is a normal linked image, not an attachment.
  const bannerSrc = ev.bannerUrl
    ? (ev.bannerUrl.startsWith('data:') ? `cid:${BANNER_CID}` : ev.bannerUrl)
    : '';
  const banner = bannerSrc
    ? `<a href="${escapeHtml(bannerLink)}" style="display:block;text-decoration:none;"><img src="${bannerSrc}" alt="${escapeHtml(ev.title)}" style="width:100%;max-width:600px;height:auto;display:block;border-radius:8px;margin:0 auto 16px auto;border:0;"/></a>`
    : '';
  return `<div style="max-width:600px;margin:0 auto;font-family:Arial,Helvetica,sans-serif;color:#1f2937;font-size:15px;line-height:1.6;">
    ${banner}${inner}
    <div style="margin-top:24px;padding:14px 16px;background:#f3f4f6;border-radius:8px;font-size:13px;color:#374151;">
      <p style="margin:0 0 6px 0;"><strong>Need help joining or have a question?</strong></p>
      <p style="margin:0;">Call / WhatsApp: <a href="tel:+918297276500" style="color:#1d4ed8;text-decoration:none;font-weight:bold;">+91 82972 76500</a> &nbsp;·&nbsp; <a href="tel:+918217651466" style="color:#1d4ed8;text-decoration:none;font-weight:bold;">+91 82176 51466</a></p>
      <p style="margin:0;">Email: <a href="mailto:admin@sprtechforge.com" style="color:#1d4ed8;text-decoration:none;font-weight:bold;">admin@sprtechforge.com</a> &nbsp;·&nbsp; <a href="mailto:hr@sprtechforge.com" style="color:#1d4ed8;text-decoration:none;font-weight:bold;">hr@sprtechforge.com</a></p>
    </div>
    <p style="margin:18px 0 0 0;"><img src="https://sprtechforge.com/logo.png" alt="SPR TechForge" height="40" style="height:40px;width:auto;display:block;"/></p>
    <p style="color:#9ca3af;font-size:12px;margin-top:8px;">SPR TechForge Pvt Ltd · <a href="https://maps.app.goo.gl/diXNusi9LLbdN2ZdA" style="color:#9ca3af;">202, Above Union Bank, Near Forum Sujana Mall, KPHB 6th Phase, Kukatpally, Hyderabad 500085</a> · <a href="https://sprtechforge.com" style="color:#9ca3af;">sprtechforge.com</a></p>
  </div>`;
};

/** A real button for the meeting link — the raw Teams/Meet URL is long and off-putting in an email. */
const joinButton = (url: string, platform: string): string =>
  `<p style="margin:14px 0;"><a href="${escapeHtml(url)}" style="display:inline-block;background:#1d4ed8;color:#ffffff;padding:12px 22px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:15px;">▶ Join Meeting${platform ? ` on ${escapeHtml(platform)}` : ''}</a><br/>
  <span style="color:#6b7280;font-size:12px;">Button not working? Copy this link into your browser: <a href="${escapeHtml(url)}" style="color:#6b7280;word-break:break-all;">${escapeHtml(url)}</a></span></p>`;

/** "Join our WhatsApp community" button — reminders and the recording go there. */
const communityBlock = (ev: SprEvent): string => ev.whatsappGroupUrl
  ? `<div style="margin:18px 0;padding:14px 16px;background:#ecfdf5;border:1px solid #a7f3d0;border-radius:8px;">
    <p style="margin:0 0 8px 0;color:#065f46;"><strong>Join the WhatsApp community</strong> — we post reminders, the joining link and the recording there, so you never miss the session.</p>
    <a href="${escapeHtml(ev.whatsappGroupUrl)}" style="display:inline-block;background:#16a34a;color:#ffffff;padding:10px 18px;border-radius:8px;text-decoration:none;font-weight:bold;">Join on WhatsApp</a>
  </div>`
  : '';

const whereBlock = (ev: SprEvent, priv: EventPrivateDetails | null, forConfirmed: boolean): string => {
  const rows: string[] = [];
  if (ev.mode !== 'offline') {
    if (forConfirmed && priv?.joinUrl) {
      rows.push(`<p style="margin-bottom:0;"><strong>How to join:</strong> Online${ev.platform ? ` on ${escapeHtml(ev.platform)}` : ''} — click the button a few minutes before the start time.</p>`);
      rows.push(joinButton(priv.joinUrl, ev.platform));
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
    ${communityBlock(ev)}
    ${gcal && !isWaitlisted ? `<p><a href="${gcal}" style="display:inline-block;background:#2563eb;color:#ffffff;padding:10px 18px;border-radius:8px;text-decoration:none;font-weight:bold;">Add to Google Calendar</a></p>` : ''}
    <p style="margin-top:18px;">While you wait for the session, learn more about SPR TechForge — our software testing courses, QA services and placement support — at <a href="https://sprtechforge.com" style="color:#1d4ed8;font-weight:bold;">sprtechforge.com</a>.</p>
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
    ${communityBlock(ev)}
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

/**
 * Invitation to register (Invite tab). The admin edits the words; this lays
 * them out: banner → headline → message → facts box → highlights → big button
 * → closing → opt-out line. Every link carries ?ref=email for attribution.
 */
export const inviteEmailHtml = (ev: SprEvent, person: { name?: string }, tpl: EventInviteTemplate): string => {
  const vars = inviteVars(ev, person, tpl.linkOverride);
  const link = vars.link;
  const highlights = (ev.whatYouWillLearn || []).map(s => s.trim()).filter(Boolean).slice(0, 6);
  const agenda = (ev.agenda || []).filter(a => (a.title || '').trim());
  const facts = [
    `<p style="margin:0 0 4px 0;">📅 <strong>When:</strong> ${escapeHtml(vars.when)}</p>`,
    `<p style="margin:0 0 4px 0;">${ev.mode === 'offline' ? '📍' : '💻'} <strong>Where:</strong> ${escapeHtml(vars.where.charAt(0).toUpperCase() + vars.where.slice(1))}</p>`,
    vars.speaker ? `<p style="margin:0 0 4px 0;">🎤 <strong>Speaker:</strong> ${escapeHtml(vars.speaker)}${ev.speakers[0]?.title ? ` — ${escapeHtml(ev.speakers[0].title)}` : ''}</p>` : '',
    `<p style="margin:0;">🎟️ <strong>Cost:</strong> Free — registration required</p>`,
  ].join('');
  const button = `<p style="text-align:center;margin:26px 0 8px 0;"><a href="${escapeHtml(link)}" style="display:inline-block;background:#ea580c;color:#ffffff;padding:15px 34px;border-radius:10px;text-decoration:none;font-weight:bold;font-size:17px;">${escapeHtml(renderInviteText(tpl.buttonLabel, vars, false) || 'Register free →')}</a></p>
    <p style="text-align:center;margin:0 0 22px 0;color:#6b7280;font-size:12px;">Free · takes 30 seconds · the joining link is emailed to you</p>`;
  return wrap(ev, `
    <h2 style="color:#1e3a8a;font-size:24px;line-height:1.25;margin:0 0 14px 0;">${renderInviteText(tpl.headline, vars, true)}</h2>
    ${inviteMessageToHtml(tpl.message, vars)}
    <div style="margin:18px 0;padding:14px 16px;background:#eff6ff;border:1px solid #bfdbfe;border-radius:10px;font-size:14px;">${facts}</div>
    ${tpl.includeHighlights && highlights.length ? `<p style="margin:0 0 6px 0;"><strong>What you will take away</strong></p><ul style="margin:0 0 16px 0;padding-left:20px;">${highlights.map(h => `<li style="margin:3px 0;">${escapeHtml(h)}</li>`).join('')}</ul>` : ''}
    ${tpl.includeAgenda && agenda.length ? `<p style="margin:0 0 6px 0;"><strong>Agenda</strong></p><table style="border-collapse:collapse;margin:0 0 16px 0;font-size:14px;">${agenda.map(a => `<tr><td style="padding:2px 12px 2px 0;color:#6b7280;white-space:nowrap;vertical-align:top;">${escapeHtml(a.time || '')}</td><td style="padding:2px 0;">${escapeHtml(a.title)}</td></tr>`).join('')}</table>` : ''}
    ${button}
    ${tpl.closing.trim() ? `<p style="color:#374151;margin:0 0 14px 0;">${renderInviteText(tpl.closing, vars, true).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br/>')}</p>` : ''}
    <p style="font-size:12px;color:#9ca3af;margin:0;">Button not working? Open this link: <a href="${escapeHtml(link)}" style="color:#6b7280;word-break:break-all;">${escapeHtml(link)}</a></p>
    <p style="font-size:11px;color:#9ca3af;margin:12px 0 0 0;">You are receiving this invitation because you shared your contact details with SPR TechForge. Not interested? Reply with "unsubscribe" and we will not email you about events again.</p>
  `, link);
};

/**
 * Post-event follow-up (Invite tab, "Follow-up survey" mode). Two buttons send
 * the reader to the survey page with their answer and email pre-filled, so the
 * page can branch (how was it? / what stopped you?) without asking again.
 */
export const followupEmailHtml = (ev: SprEvent, person: { name?: string; email?: string }, tpl: EventInviteTemplate): string => {
  const vars = { ...inviteVars(ev, person, undefined), next_session: tpl.nextSessionLabel || '' };
  const yes = followupLinkUrl(ev, 'yes', person.email || '', tpl.linkOverride);
  const no = followupLinkUrl(ev, 'no', person.email || '', tpl.linkOverride);
  const plain = followupLinkUrl(ev, '', person.email || '', tpl.linkOverride);
  return wrap(ev, `
    <h2 style="color:#1e3a8a;font-size:24px;line-height:1.25;margin:0 0 14px 0;">${renderInviteText(tpl.headline, vars, true)}</h2>
    ${inviteMessageToHtml(tpl.message, vars as any)}
    <p style="margin:22px 0 10px 0;font-weight:bold;font-size:17px;color:#111827;">Did you join the live session?</p>
    <table role="presentation" style="border-collapse:collapse;margin:0 0 8px 0;"><tr>
      <td style="padding:0 12px 12px 0;"><a href="${escapeHtml(yes)}" style="display:inline-block;background:#16a34a;color:#ffffff;padding:15px 30px;border-radius:10px;text-decoration:none;font-weight:bold;font-size:17px;">✅ ${escapeHtml(renderInviteText(tpl.buttonLabel, vars, false) || 'Yes, I joined')}</a></td>
      <td style="padding:0 0 12px 0;"><a href="${escapeHtml(no)}" style="display:inline-block;background:#dc2626;color:#ffffff;padding:15px 30px;border-radius:10px;text-decoration:none;font-weight:bold;font-size:17px;">❌ No, I could not join</a></td>
    </tr></table>
    <p style="margin:0 0 22px 0;color:#6b7280;font-size:13px;">Two minutes, five questions, no login.</p>
    ${tpl.closing.trim() ? `<p style="color:#374151;margin:0 0 14px 0;">${renderInviteText(tpl.closing, vars, true).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br/>')}</p>` : ''}
    <p style="font-size:12px;color:#9ca3af;margin:0;">Buttons not working? Open this link: <a href="${escapeHtml(plain)}" style="color:#6b7280;word-break:break-all;">${escapeHtml(plain)}</a></p>
    <p style="font-size:11px;color:#9ca3af;margin:12px 0 0 0;">You are receiving this because you registered for this event with SPR TechForge. Reply "unsubscribe" and we will not email you about events again.</p>
  `, plain);
};

export interface EventEmailOptions {
  /** Override the From address for this send (defaults to the configured sender). */
  from?: string;
  fromName?: string;
}

// Hosted-banner availability per event, remembered for the session. The JPEG appears
// on the next scheduled deploy after publishing (≤30 min); until then we embed.
const hostedBannerCache = new Map<string, Promise<boolean>>();
const hasHostedBanner = (ev: SprEvent): Promise<boolean> => {
  if (!ev.slug) return Promise.resolve(false);
  const cached = hostedBannerCache.get(ev.slug);
  if (cached) return cached;
  const check: Promise<boolean> = fetch(hostedBannerUrl(ev), { method: 'HEAD', cache: 'no-store' })
    .then(r => r.ok && (r.headers.get('content-type') || '').toLowerCase().startsWith('image/'))
    .catch(() => false);
  hostedBannerCache.set(ev.slug, check);
  check.then(ok => { if (!ok) hostedBannerCache.delete(ev.slug); }); // retry next time if not published yet
  return check;
};

/**
 * Sends one event email. A data: banner is referenced as a hosted JPEG when the
 * site has published it (a clickable image, no attachment); otherwise it is
 * CID-embedded so the email still shows the picture.
 */
export const sendEventEmail = async (ev: SprEvent, to: string, subject: string, html: string, opts: EventEmailOptions = {}): Promise<void> => {
  const inline = !!ev.bannerUrl && ev.bannerUrl.startsWith('data:');
  const useHosted = inline && await hasHostedBanner(ev);
  const body = useHosted ? html.split(`cid:${BANNER_CID}`).join(hostedBannerUrl(ev)) : html;
  // Queued on the bridge: the visitor gets an instant "queued" reply and the
  // server sends at a safe rate, so a burst of registrations never trips the
  // mailbox's per-minute limit or leaves someone without a confirmation.
  await emailService.sendEmail({
    to,
    subject,
    body,
    isHtml: true,
    queue: true,
    key: `${ev.id}|${to.toLowerCase()}|${subject}`,
    from: opts.from,
    fromName: opts.fromName || 'SPR Techforge',
    inlineImages: inline && !useHosted
      ? [{ key: BANNER_CID, url: ev.bannerUrl, name: 'banner' }]
      : undefined,
  });
};
