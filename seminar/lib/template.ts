import { SeminarCandidate, SeminarSettings } from '../types';

// Template rendering: the admin's template HTML is trusted (it's their own
// copy, editable in the Campaign editor); candidate-derived values are always
// HTML-escaped before substitution so imported data can never inject markup.

export const escapeHtml = (s: any): string =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

export interface TemplateVars {
  name: string;
  city: string;
  link: string;
  date: string;
  time: string;
  venue: string;
  trainer: string;
}

/**
 * Replace {placeholders} in a template. Values are escaped when `escape` is
 * true (use for HTML email bodies / page copy); plain replacement otherwise
 * (use for subjects and WhatsApp text).
 */
export const renderTemplate = (tpl: string, vars: Partial<TemplateVars>, escape: boolean): string =>
  tpl.replace(/\{(name|city|link|date|time|venue|trainer)\}/g, (_, key: string) => {
    const v = (vars as any)[key] ?? '';
    return escape ? escapeHtml(v) : String(v);
  });

export const formatSeminarDate = (dateTime: string): { date: string; time: string } => {
  if (!dateTime) return { date: '[DATE]', time: '[TIME]' };
  const d = new Date(dateTime);
  if (isNaN(d.getTime())) return { date: '[DATE]', time: '[TIME]' };
  return {
    date: d.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
    time: d.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' }),
  };
};

export const buildTemplateVars = (
  candidate: Pick<SeminarCandidate, 'fullName' | 'city' | 'inviteToken'>,
  settings: SeminarSettings,
): TemplateVars => {
  const { date, time } = formatSeminarDate(settings.dateTime);
  const base = (settings.publicBaseUrl || `${window.location.origin}${window.location.pathname}`).replace(/\/+$/, '');
  // HashRouter public route
  const link = `${base}/#/seminar/s/${candidate.inviteToken}`;
  const venue = settings.venue || (settings.onlineLink ? 'Online' : '[VENUE]');
  return {
    name: candidate.fullName || 'there',
    city: candidate.city || '',
    link,
    date,
    time,
    venue,
    trainer: settings.trainerName || '[TRAINER NAME]',
  };
};

/** 50/50 A/B subject rotation, sticky per candidate once assigned. */
export const pickSubjectVariant = (index: number): 'A' | 'B' => (index % 2 === 0 ? 'A' : 'B');

// ----------------------------------------------------------------------------
// Default content (§7 of the module spec). [BRACKETS] are facts the admin must
// fill in before sending — the Campaign editor makes all of this editable.
// {placeholders} are substituted per candidate at send time.
// ----------------------------------------------------------------------------

export const DEFAULT_SUBJECT_A = '{name}, start your IT career with Software Testing — free seminar on {date}';
export const DEFAULT_SUBJECT_B = 'No coding pressure. Real IT jobs. Free Software Testing seminar — limited seats';

// The banner <img> is injected by the mailer above this body (CID-embedded
// when the bridge supports it), so the template starts at the greeting.
export const DEFAULT_EMAIL_BODY_HTML = `<div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.6;color:#1f2937;max-width:600px;margin:0 auto;">
  <p>Hi {name},</p>
  <p>If you've been applying for IT jobs and hearing nothing back, here's something worth 60 minutes of your time.</p>
  <p><strong>Software Testing (QA)</strong> is one of the most beginner-friendly ways into the IT industry — companies hire freshers and non-coders for it every single week, and the career path is real: <strong>Manual Tester &rarr; Automation Engineer &rarr; SDET/QA Lead</strong>.</p>
  <p>I'm conducting a <strong>FREE live seminar</strong> to show you exactly how to get there:</p>
  <ul>
    <li>The QA job market right now — which roles are actually hiring freshers</li>
    <li>The skill set that gets interviews: manual testing, [Selenium/automation], [API testing]</li>
    <li>A live testing demo — see the work before you commit to learning it</li>
    <li>Your questions answered live — bring your profile, I'll tell you honestly where you stand</li>
  </ul>
  <p style="font-size:16px;"><strong>&#128197; {date} &nbsp;&middot;&nbsp; &#128336; {time} &nbsp;&middot;&nbsp; &#128205; {venue}</strong><br/>
  Conducted by <strong>{trainer}</strong>, [X years] in software testing.</p>
  <p>Seats are limited to keep the Q&amp;A useful — reserve yours now:</p>
  <p style="text-align:center;margin:28px 0;">
    <a href="{link}" style="background:#ea580c;color:#ffffff;text-decoration:none;font-weight:bold;font-size:16px;padding:14px 32px;border-radius:8px;display:inline-block;">RESERVE MY FREE SEAT &rarr;</a>
  </p>
  <p style="font-size:13px;color:#6b7280;">Can't click the button? Open this link: <a href="{link}">{link}</a><br/>
  Have a question first? Ask it on your page above — I personally reply to every question.</p>
  <p>— {trainer}<br/>[COACHING INSTITUTE NAME], [CITY]</p>
</div>`;

export const DEFAULT_REMINDER_SUBJECT = 'See you tomorrow, {name} — your Software Testing seminar seat is confirmed';

export const DEFAULT_REMINDER_BODY_HTML = `<div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.6;color:#1f2937;max-width:600px;margin:0 auto;">
  <p>Hi {name},</p>
  <p>Your seat for tomorrow's <strong>free Software Testing seminar</strong> is confirmed.</p>
  <p style="font-size:16px;"><strong>&#128197; {date} &nbsp;&middot;&nbsp; &#128336; {time} &nbsp;&middot;&nbsp; &#128205; {venue}</strong></p>
  <p>Bring one question about your career — I'll answer it live.</p>
  <p style="text-align:center;margin:28px 0;">
    <a href="{link}" style="background:#16a34a;color:#ffffff;text-decoration:none;font-weight:bold;font-size:16px;padding:14px 32px;border-radius:8px;display:inline-block;">OPEN MY SEMINAR PAGE &rarr;</a>
  </p>
  <p>— {trainer}</p>
</div>`;

export const DEFAULT_WHATSAPP_TEMPLATE =
  "Hi {name}! \u{1F44B} I'm hosting a *FREE Software Testing seminar* on *{date}* — a beginner-friendly path into IT jobs (no coding background needed). Live demo + I'll answer your career questions personally. Limited seats — reserve here: {link}";

export const DEFAULT_SETTINGS_FIELDS = {
  title: 'Free Software Testing Career Seminar',
  emailSubjectA: DEFAULT_SUBJECT_A,
  emailSubjectB: DEFAULT_SUBJECT_B,
  emailBodyHtml: DEFAULT_EMAIL_BODY_HTML,
  reminderSubject: DEFAULT_REMINDER_SUBJECT,
  reminderBodyHtml: DEFAULT_REMINDER_BODY_HTML,
  whatsappTemplate: DEFAULT_WHATSAPP_TEMPLATE,
  dailySendLimit: 90,
  sendDelayMs: 2000,
};
