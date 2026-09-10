// PUBLIC /#/events/:slug — the shared registration link opens here.
// No login, mobile-first, large tap targets. Layout: a hero (banner + key
// facts + "Reserve your seat" button), then everything a visitor needs to
// decide — intro video, about, what you'll learn, agenda, who should attend —
// with the registration form alongside on desktop and after the content on
// phones (a sticky bottom button jumps to it). Handles: live event page,
// registration form (duplicate & capacity handling), success state, waitlist,
// closed states, cancelled notice, past-event recap, and a draft-preview mode
// visible only to logged-in admins.

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Logo } from '../../components/Components';
import { EventPrivateDetails, EventRegistration, SprEvent } from '../types';
import { fetchEventBySlug, findExistingRegistration, registerForEvent, fetchPrivateDetails } from '../services/eventsDb';
import { formatISTRange } from '../lib/datetime';
import {
  lifecycleOf, registrationWindow, seatsRemaining,
  validateRegistration, RegistrationFormInput, normalizeEmail, validMobileOrEmpty, QUALIFICATION_OPTIONS,
} from '../lib/validate';
import { youtubeEmbedUrl } from '../lib/video';
import { icsDataUri, googleCalendarUrl } from '../lib/ics';
import { LiveBadge, TypeBadge, whatsAppShareUrl, buildShareText } from '../components/shared';
import { confirmationEmailHtml, isEventMailerConfigured, sendEventEmail } from '../lib/emails';

const MIN_FILL_TIME_MS = 3000; // bots submit instantly; humans don't

const generateRegId = () => `reg-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

type LoadState = 'loading' | 'ready' | 'notfound' | 'offline';

const emptyForm = (): RegistrationFormInput => ({
  fullName: '', email: '', mobile: '', city: '', qualification: '', passingYear: '',
  currentStatus: '', howDidYouHear: '', customAnswers: {},
  consentTerms: false, consentEmail: false, consentWhatsApp: false,
});

const inputClass = (error?: string) =>
  `w-full px-4 py-3 border rounded-xl text-base outline-none transition-colors focus:ring-2 ${error ? 'border-red-400 focus:ring-red-200' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-100'}`;

/** Large-tap-target labelled input for the public form. */
const PInput: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string; hint?: string }> = ({ label, error, hint, ...props }) => (
  <div>
    <label className="block text-sm font-bold text-gray-700 mb-1">{label}{props.required && <span className="text-red-500"> *</span>}</label>
    <input {...props} className={inputClass(error)} />
    {error ? <p className="text-xs text-red-600 font-semibold mt-1">{error}</p> : hint ? <p className="text-xs text-gray-400 mt-1">{hint}</p> : null}
  </div>
);

const PSelect: React.FC<React.SelectHTMLAttributes<HTMLSelectElement> & { label: string; error?: string }> = ({ label, error, children, ...props }) => (
  <div>
    <label className="block text-sm font-bold text-gray-700 mb-1">{label}{props.required && <span className="text-red-500"> *</span>}</label>
    <select {...props} className={`${inputClass(error)} bg-white`}>
      {children}
    </select>
    {error && <p className="text-xs text-red-600 font-semibold mt-1">{error}</p>}
  </div>
);

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="bg-white rounded-2xl border border-gray-200 p-5 sm:p-7">
    <h2 className="text-lg font-black text-gray-900 mb-3">{title}</h2>
    {children}
  </div>
);

const Bullets: React.FC<{ items: string[]; mark: string; markClass: string }> = ({ items, mark, markClass }) => (
  <ul className="space-y-2">
    {items.map((x, i) => (
      <li key={i} className="flex items-start gap-2.5 text-[15px] text-gray-700 leading-relaxed">
        <span className={`font-black mt-0.5 shrink-0 ${markClass}`}>{mark}</span>{x}
      </li>
    ))}
  </ul>
);

export const PublicEventPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const location = useLocation();
  const { user } = useApp(); // only used to allow draft preview for admins

  const [state, setState] = useState<LoadState>('loading');
  const [ev, setEv] = useState<SprEvent | null>(null);
  const [priv, setPriv] = useState<EventPrivateDetails | null>(null);

  const [form, setForm] = useState<RegistrationFormInput>(emptyForm());
  const [qualChoice, setQualChoice] = useState('');
  const [qualOther, setQualOther] = useState('');
  const [showTerms, setShowTerms] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [honeypot, setHoneypot] = useState('');
  const formLoadedAt = useRef(Date.now());
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState<boolean | null>(null);
  const [done, setDone] = useState<EventRegistration | null>(null);
  const [alreadyRegistered, setAlreadyRegistered] = useState<EventRegistration | null>(null);
  const formRef = useRef<HTMLDivElement>(null);

  const utm = useMemo(() => {
    const p = new URLSearchParams(location.search);
    return { source: p.get('utm_source') || '', medium: p.get('utm_medium') || '', campaign: p.get('utm_campaign') || '' };
  }, [location.search]);

  useEffect(() => {
    let cancelled = false;
    setState('loading');
    fetchEventBySlug(slug || '')
      .then(found => {
        if (cancelled) return;
        if (!found) { setState('notfound'); return; }
        setEv(found);
        setState('ready');
        formLoadedAt.current = Date.now();
        if (found.title) document.title = `${found.title} · SPR Techforge`;
      })
      .catch(() => { if (!cancelled) setState('offline'); });
    return () => { cancelled = true; document.title = 'SPR Techforge Management'; };
  }, [slug]);

  // Keep the qualification dropdown + "Other" text in sync with the form value.
  useEffect(() => {
    const value = qualChoice === 'Other' ? (qualOther.trim() || 'Other') : qualChoice;
    setForm(prev => (prev.qualification === value ? prev : { ...prev, qualification: value }));
  }, [qualChoice, qualOther]);

  const isAdminViewer = !!user && (user.role === 'admin' || user.modules.includes('users'));

  if (state === 'loading') {
    return (
      <div className="min-h-screen bg-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-3xl border border-gray-200 h-72 animate-pulse" />
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6"><div className="bg-white rounded-2xl border border-gray-200 h-48 animate-pulse" /><div className="bg-white rounded-2xl border border-gray-200 h-40 animate-pulse" /></div>
            <div className="bg-white rounded-2xl border border-gray-200 h-96 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }
  if (state === 'offline') {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="text-5xl mb-4">📡</div>
          <h1 className="text-xl font-bold text-gray-800 mb-2">We couldn't reach the server</h1>
          <p className="text-gray-600 text-sm">Please check your internet connection and reload this page.</p>
        </div>
      </div>
    );
  }
  if (state === 'notfound' || !ev || (ev.status === 'draft' && !isAdminViewer)) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="text-5xl mb-4">🔍</div>
          <h1 className="text-xl font-bold text-gray-800 mb-2">This event link doesn't look right</h1>
          <p className="text-gray-600 text-sm mb-4">The event may have been removed, or the link is incomplete. Try opening it again from the original message.</p>
          <Link to="/events" className="text-blue-600 font-bold underline">See all upcoming events →</Link>
        </div>
      </div>
    );
  }

  const phase = lifecycleOf(ev);
  const window_ = registrationWindow(ev);
  const seats = seatsRemaining(ev);
  const paragraphs = ev.fullDescription.split(/\n\s*\n/).filter(p => p.trim());
  const learn = ev.whatYouWillLearn.filter(Boolean);
  const attend = ev.whoShouldAttend.filter(Boolean);
  const prereqs = ev.prerequisites.filter(Boolean);
  const agenda = ev.agenda.filter(a => a.title);
  const speakers = ev.speakers.filter(s => s.name);
  const embed = youtubeEmbedUrl(ev.videoUrl || '');
  const gcal = googleCalendarUrl(ev);
  const ics = icsDataUri(ev);
  const shareText = buildShareText(ev);
  const typeLabel = ev.type === 'demo_class' ? 'demo class' : ev.type === 'other' ? 'event' : ev.type;
  const canRegister = ev.status !== 'cancelled' && phase !== 'past' && window_.open && !done && !alreadyRegistered;

  const scrollToForm = () => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  const setF = (patch: Partial<RegistrationFormInput>) => setForm(prev => ({ ...prev, ...patch }));

  const handleSubmit = async () => {
    setSubmitError(null);

    // Abuse checks: honeypot must stay empty; humans take >3s to fill a form.
    if (honeypot.trim() !== '') return;
    if (Date.now() - formLoadedAt.current < MIN_FILL_TIME_MS) {
      setSubmitError('That was fast! Please review your details and try again.');
      return;
    }

    const errs = validateRegistration(form, ev);
    setErrors(errs);
    if (Object.keys(errs).length > 0) {
      setSubmitError('Please fix the highlighted fields.');
      return;
    }

    setSubmitting(true);
    try {
      const email = normalizeEmail(form.email);
      const mobile = validMobileOrEmpty(form.mobile);

      // Friendly duplicate handling — never a second record, never a scary error.
      const existing = await findExistingRegistration(ev.id, email, mobile);
      if (existing && existing.status !== 'cancelled') {
        setAlreadyRegistered(existing);
        if (existing.status === 'confirmed' && (ev.mode === 'online' || ev.mode === 'hybrid')) {
          fetchPrivateDetails(ev.id).then(setPriv).catch(() => {});
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }

      const now = new Date().toISOString();
      // One terms checkbox covers contact about this event by email and WhatsApp.
      const stamp = (given: boolean) => ({ given, at: given ? now : '' });
      const draft: Omit<EventRegistration, 'registrationCode' | 'status'> = {
        id: generateRegId(),
        eventId: ev.id,
        eventSlug: ev.slug,
        eventTitle: ev.title,
        fullName: form.fullName.trim(),
        email,
        mobile,
        city: form.city.trim(),
        qualification: form.qualification.trim(),
        passingYear: form.passingYear.trim(),
        currentStatus: form.currentStatus as EventRegistration['currentStatus'],
        howDidYouHear: form.howDidYouHear.trim(),
        customAnswers: form.customAnswers,
        consentTerms: stamp(form.consentTerms),
        consentEmail: stamp(form.consentTerms),
        consentWhatsApp: stamp(form.consentTerms),
        utm,
        registeredAt: now,
        remindersSent: [],
        adminNotes: '',
        followUpStatus: 'none',
      };

      const outcome = await registerForEvent(ev.id, draft);
      if (!outcome.ok) {
        if (outcome.reason === 'full') {
          setSubmitError('Sorry — all seats are taken and this event has no waitlist. Follow us for the next one!');
        } else {
          setSubmitError('Registrations for this event are closed.');
        }
        // refresh counters/state
        fetchEventBySlug(ev.slug).then(fresh => fresh && setEv(fresh)).catch(() => {});
        return;
      }

      const reg = outcome.registration;
      setDone(reg);
      window.scrollTo({ top: 0, behavior: 'smooth' });

      let privDetails: EventPrivateDetails | null = null;
      if (reg.status === 'confirmed' && (ev.mode === 'online' || ev.mode === 'hybrid')) {
        try { privDetails = await fetchPrivateDetails(ev.id); setPriv(privDetails); } catch { /* success page still works */ }
      }

      // Confirmation email with the joining link — the success page shows
      // everything too, so a mail failure never blocks the registration.
      if (isEventMailerConfigured()) {
        setEmailSent(null);
        sendEventEmail(ev, reg.email, `${reg.status === 'waitlisted' ? 'Waitlisted' : 'Registered'}: ${ev.title}`, confirmationEmailHtml(ev, reg, privDetails))
          .then(() => setEmailSent(true))
          .catch(e => { console.warn('Confirmation email failed:', e); setEmailSent(false); });
      } else {
        setEmailSent(false);
      }
    } catch (e: any) {
      console.error('Registration failed', e);
      setSubmitError('Something went wrong while saving your registration — please check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // ---------------- sub-views ----------------

  const successView = (reg: EventRegistration, isExisting: boolean) => (
    <div className="bg-white rounded-2xl border border-emerald-200 shadow-sm p-6 sm:p-8 text-center">
      <div className="text-5xl mb-3">{reg.status === 'waitlisted' ? '⏳' : '🎉'}</div>
      <h2 className="text-2xl font-black text-emerald-700 mb-1">
        {isExisting ? "You're already registered!" : reg.status === 'waitlisted' ? "You're on the waitlist" : "You're in, " + reg.fullName.split(' ')[0] + '!'}
      </h2>
      <p className="text-gray-600 text-sm mb-2">
        {reg.status === 'waitlisted'
          ? "The event is currently full. We'll email you if a seat opens up."
          : `Your free seat for ${formatISTRange(ev.startAt, ev.endAt)} is confirmed.`}
      </p>
      {!isExisting && (
        <p className="text-sm mb-5">
          {emailSent === true && <span className="text-emerald-700 font-semibold">✓ Confirmation and joining details emailed to {reg.email}.</span>}
          {emailSent === null && <span className="text-gray-500">Sending your confirmation email to {reg.email}…</span>}
          {emailSent === false && <span className="text-gray-500">Save this page or take a screenshot — it has everything you need to join.</span>}
        </p>
      )}
      {isExisting && <p className="text-sm text-gray-500 mb-5">Here are your details again — nothing else to do.</p>}

      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-5 inline-block">
        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Your registration code</p>
        <p className="text-2xl font-black font-mono text-gray-900 mt-1">{reg.registrationCode}</p>
        <p className="text-[11px] text-gray-500 mt-1">Keep this handy — it's used for check-in.</p>
      </div>

      {reg.status === 'confirmed' && (ev.mode === 'online' || ev.mode === 'hybrid') && priv?.joinUrl && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-5 text-left">
          <p className="text-xs font-bold text-blue-700 uppercase mb-1">Join online{ev.platform ? ` · ${ev.platform}` : ''}</p>
          <a href={priv.joinUrl} target="_blank" rel="noopener noreferrer" className="text-blue-700 font-bold underline break-all text-sm">{priv.joinUrl}</a>
          {(priv.meetingId || priv.passcode) && (
            <p className="text-xs text-gray-600 mt-1">
              {priv.meetingId && <>Meeting ID: <strong>{priv.meetingId}</strong></>}
              {priv.meetingId && priv.passcode && ' · '}
              {priv.passcode && <>Passcode: <strong>{priv.passcode}</strong></>}
            </p>
          )}
        </div>
      )}

      <div className="flex justify-center gap-3 flex-wrap">
        {reg.status === 'confirmed' && gcal && <a href={gcal} target="_blank" rel="noopener noreferrer" className="px-4 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700">Add to Google Calendar</a>}
        {reg.status === 'confirmed' && ics && <a href={ics} download={`${ev.slug}.ics`} className="px-4 py-2.5 rounded-xl border border-gray-300 text-gray-700 text-sm font-bold hover:bg-gray-50">Download .ics</a>}
        <a href={whatsAppShareUrl(shareText)} target="_blank" rel="noopener noreferrer" className="px-4 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-bold hover:bg-emerald-700">Invite a friend on WhatsApp</a>
      </div>
    </div>
  );

  const registrationForm = (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 sm:p-7">
      <h2 className="text-xl font-black text-gray-900 mb-1">Reserve your free seat</h2>
      {seats !== null && seats > 0 && <p className="text-sm font-bold text-orange-600 mb-4">{seats} seat{seats === 1 ? '' : 's'} remaining</p>}
      {seats === 0 && ev.waitlistEnabled && <p className="text-sm font-bold text-amber-600 mb-4">All seats taken — you can still join the waitlist.</p>}
      {(seats === null || seats > 0) && <p className="text-sm text-gray-500 mb-4">Takes under a minute. The joining link is emailed to you right after.</p>}

      <div className="space-y-4">
        <PInput label="Full name" required value={form.fullName} error={errors.fullName} onChange={e => setF({ fullName: e.target.value })} autoComplete="name" />
        <PInput label="Email" required type="email" value={form.email} error={errors.email} onChange={e => setF({ email: e.target.value })} autoComplete="email" inputMode="email" />
        <PInput
          label="Mobile (WhatsApp preferred)" required type="tel"
          value={form.mobile} error={errors.mobile}
          onChange={e => setF({ mobile: e.target.value.replace(/[^\d+\s-]/g, '').slice(0, 16) })}
          autoComplete="tel" inputMode="tel" placeholder="98xxxxxxxx" maxLength={16}
          hint="10-digit Indian number — we send the joining link here"
        />

        {ev.collectFields.city && <PInput label="City" value={form.city} onChange={e => setF({ city: e.target.value })} autoComplete="address-level2" />}
        {ev.collectFields.qualification && (
          <>
            <PSelect label="Qualification / degree" value={qualChoice} error={qualChoice !== 'Other' ? errors.qualification : undefined} onChange={e => setQualChoice(e.target.value)}>
              <option value="">— Select —</option>
              {QUALIFICATION_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
            </PSelect>
            {qualChoice === 'Other' && (
              <PInput label="Please specify your qualification" required value={qualOther} error={errors.qualification} onChange={e => setQualOther(e.target.value)} placeholder="e.g. B.Pharm" />
            )}
          </>
        )}
        {ev.collectFields.passingYear && (
          <PInput
            label="Passing year" value={form.passingYear}
            onChange={e => setF({ passingYear: e.target.value.replace(/\D/g, '').slice(0, 4) })}
            inputMode="numeric" placeholder="2024" maxLength={4}
          />
        )}
        {ev.collectFields.currentStatus && (
          <PSelect label="Current status" value={form.currentStatus} onChange={e => setF({ currentStatus: e.target.value })}>
            <option value="">— Select —</option>
            <option value="student">Student</option>
            <option value="fresher">Fresher (looking for a job)</option>
            <option value="working">Working professional</option>
            <option value="career_break">On a career break</option>
          </PSelect>
        )}
        {ev.collectFields.howDidYouHear && (
          <PSelect label="How did you hear about this event?" value={form.howDidYouHear} onChange={e => setF({ howDidYouHear: e.target.value })}>
            <option value="">— Select —</option>
            <option>WhatsApp</option>
            <option>LinkedIn</option>
            <option>Instagram / Facebook</option>
            <option>Friend / colleague</option>
            <option>College</option>
            <option>Other</option>
          </PSelect>
        )}

        {ev.customQuestions.map(cq => cq.fieldType === 'select' ? (
          <PSelect
            key={cq.id} label={cq.label} required={cq.required} error={errors[`q_${cq.id}`]}
            value={form.customAnswers[cq.id] || ''}
            onChange={e => setF({ customAnswers: { ...form.customAnswers, [cq.id]: e.target.value } })}
          >
            <option value="">— Select —</option>
            {cq.options.filter(o => o.trim()).map(o => <option key={o}>{o}</option>)}
          </PSelect>
        ) : (
          <PInput
            key={cq.id} label={cq.label} required={cq.required} error={errors[`q_${cq.id}`]}
            value={form.customAnswers[cq.id] || ''}
            onChange={e => setF({ customAnswers: { ...form.customAnswers, [cq.id]: e.target.value } })}
          />
        ))}

        {/* Honeypot — invisible to humans, irresistible to bots */}
        <div style={{ position: 'absolute', left: '-9999px', top: '-9999px', height: 0, overflow: 'hidden' }} aria-hidden="true">
          <label>Website<input type="text" tabIndex={-1} autoComplete="off" value={honeypot} onChange={e => setHoneypot(e.target.value)} /></label>
        </div>

        <div className="border-t border-gray-100 pt-4 space-y-3">
          <label className="flex items-start gap-3 text-sm text-gray-700 cursor-pointer">
            <input
              type="checkbox" className="w-5 h-5 mt-0.5 shrink-0"
              checked={form.consentTerms}
              onChange={e => setF({ consentTerms: e.target.checked, consentEmail: e.target.checked, consentWhatsApp: e.target.checked })}
            />
            <span>
              I agree to the{' '}
              <button type="button" onClick={() => setShowTerms(s => !s)} className="text-blue-600 font-bold underline">terms &amp; conditions</button>
              {' '}and to SPR Techforge contacting me about this event and its training programs by email, SMS or WhatsApp. <span className="text-red-500">*</span>
            </span>
          </label>
          {errors.consentTerms && <p className="text-xs text-red-600 font-semibold ml-8">{errors.consentTerms}</p>}
          {showTerms && (
            <div className="ml-8 bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs text-gray-600 space-y-1.5">
              <p className="font-bold text-gray-700">Terms &amp; conditions</p>
              <p>1. This {typeLabel} is free. No payment is requested on this page or at any point for attending.</p>
              <p>2. Your name, email and mobile number are used to confirm your seat, send the joining link and reminders, and follow up about SPR Techforge training programs. We never sell your data.</p>
              <p>3. Seats are limited and confirmed in the order registrations arrive. SPR Techforge may reschedule or cancel the session; registrants are notified by email.</p>
              <p>4. Sessions may be recorded for those who could not attend live.</p>
              <p>5. You can ask us to delete your registration data at any time by replying to any of our emails.</p>
            </div>
          )}
        </div>

        {submitError && <p className="text-sm font-bold text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">{submitError}</p>}

        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full py-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-lg font-black shadow-lg shadow-blue-200 transition-colors disabled:opacity-60"
        >
          {submitting ? 'Reserving your seat…' : seats === 0 && ev.waitlistEnabled ? 'Join the Waitlist — Free' : 'Register Free →'}
        </button>
        <p className="text-center text-xs text-gray-400">100% free · No payment is ever requested on this page</p>
      </div>
    </div>
  );

  const closedView = (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 text-center">
      <div className="text-4xl mb-2">🔒</div>
      <h2 className="text-lg font-black text-gray-800">Registrations are closed</h2>
      <p className="text-sm text-gray-500 mt-1">
        {seats === 0 ? 'All seats were taken. ' : ''}Follow the next event — free sessions run regularly.
      </p>
      <Link to="/events" className="inline-block mt-3 text-blue-600 font-bold underline text-sm">See upcoming events →</Link>
    </div>
  );

  const cancelledView = (
    <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
      <div className="text-4xl mb-2">😔</div>
      <h2 className="text-lg font-black text-red-700">This event was cancelled</h2>
      {ev.cancelReason && <p className="text-sm text-gray-600 mt-1">{ev.cancelReason}</p>}
      <Link to="/events" className="inline-block mt-3 text-blue-600 font-bold underline text-sm">See upcoming events →</Link>
    </div>
  );

  const recapView = (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      <h2 className="text-lg font-black text-gray-900 mb-2">This event is over — here's how it went</h2>
      {ev.recap?.finalAttendeeCount > 0 && <p className="text-sm font-bold text-emerald-700 mb-2">👥 {ev.recap.finalAttendeeCount} people attended</p>}
      {ev.recap?.notes && <p className="text-sm text-gray-600 whitespace-pre-wrap mb-3">{ev.recap.notes}</p>}
      {ev.recap?.recordingUrl && (
        <a href={ev.recap.recordingUrl} target="_blank" rel="noopener noreferrer" className="inline-block px-4 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 mb-3">▶ Watch the recording</a>
      )}
      {(ev.recap?.photoUrls || []).length > 0 && (
        <div className="grid grid-cols-2 gap-2 mt-2">
          {ev.recap.photoUrls.map((u, i) => <img key={i} src={u} alt="" loading="lazy" className="w-full aspect-video object-cover rounded-lg border border-gray-100" />)}
        </div>
      )}
      <p className="text-sm text-gray-500 mt-4">Missed it? <Link to="/events" className="text-blue-600 font-bold underline">Check the next upcoming event →</Link></p>
    </div>
  );

  const sidePanel =
    ev.status === 'cancelled' ? cancelledView
    : phase === 'past' ? recapView
    : done ? successView(done, false)
    : alreadyRegistered ? successView(alreadyRegistered, true)
    : window_.open ? registrationForm
    : closedView;

  // ---------------- page ----------------

  return (
    <div className="min-h-screen bg-gray-100">
      {ev.status === 'draft' && (
        <div className="bg-amber-400 text-amber-950 text-center text-sm font-bold py-2 px-4 sticky top-0 z-30">
          👁 PREVIEW — this event is a draft. Only you (admin) can see this page. Publish it to make the link work for everyone.
        </div>
      )}

      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <Link to="/"><Logo size="sm" /></Link>
          <Link to="/events" className="text-sm font-bold text-blue-600 hover:text-blue-800">All events →</Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10 pb-28 lg:pb-12">
        {/* ---------- HERO ---------- */}
        <section className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-5">
            <div className="lg:col-span-3 bg-slate-900">
              {ev.bannerUrl
                ? <img src={ev.bannerUrl} alt={ev.title} className="w-full h-full object-cover aspect-[1200/628]" />
                : <div className="w-full h-full min-h-[220px] bg-gradient-to-br from-blue-900 to-slate-900" />}
            </div>
            <div className="lg:col-span-2 p-6 sm:p-8 flex flex-col">
              <div className="flex items-center gap-2 flex-wrap mb-3">
                <TypeBadge type={ev.type} />
                {phase === 'live' && ev.status === 'published' && <LiveBadge />}
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">FREE</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-gray-900 leading-tight mb-2">{ev.title}</h1>
              <p className="text-gray-600 mb-5">{ev.shortDescription}</p>

              <div className="space-y-2 text-sm border-t border-gray-100 pt-4">
                <p className="font-bold text-gray-900">📅 {formatISTRange(ev.startAt, ev.endAt)}</p>
                {(ev.mode === 'online' || ev.mode === 'hybrid') && <p className="text-gray-700">💻 Online{ev.platform ? ` · ${ev.platform}` : ''} — join link is emailed after you register</p>}
                {(ev.mode === 'offline' || ev.mode === 'hybrid') && (
                  <p className="text-gray-700">
                    📍 {ev.venueName}{ev.venueAddress ? `, ${ev.venueAddress}` : ''}
                    {ev.venueMapUrl && <> · <a className="text-blue-600 underline font-bold" href={ev.venueMapUrl} target="_blank" rel="noopener noreferrer">Map</a></>}
                  </p>
                )}
                {speakers.length > 0 && (
                  <p className="text-gray-700">🎤 {speakers.map(s => s.title ? `${s.name} (${s.title})` : s.name).join(', ')}</p>
                )}
              </div>

              <div className="mt-auto pt-6">
                {canRegister ? (
                  <>
                    <button onClick={scrollToForm} className="w-full py-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-lg font-black shadow-lg shadow-blue-200 transition-colors">
                      {seats === 0 && ev.waitlistEnabled ? 'Join the Waitlist — Free' : 'Reserve your free seat →'}
                    </button>
                    <p className="text-center text-xs text-gray-400 mt-2">
                      {seats !== null && seats > 0 ? `${seats} seat${seats === 1 ? '' : 's'} left · ` : ''}Takes under a minute · No payment ever
                    </p>
                  </>
                ) : done || alreadyRegistered ? (
                  <p className="text-center text-sm font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-xl py-3">✓ You're registered — details are below</p>
                ) : ev.status === 'cancelled' ? (
                  <p className="text-center text-sm font-bold text-red-700 bg-red-50 border border-red-100 rounded-xl py-3">This event was cancelled</p>
                ) : phase === 'past' ? (
                  <p className="text-center text-sm font-bold text-gray-600 bg-gray-50 border border-gray-200 rounded-xl py-3">This event has ended</p>
                ) : (
                  <p className="text-center text-sm font-bold text-gray-600 bg-gray-50 border border-gray-200 rounded-xl py-3">Registrations are closed</p>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ---------- CONTENT + FORM ---------- */}
        <div className="mt-6 lg:mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-start">
          <div className="lg:col-span-2 space-y-6">
            {embed && (
              <div className="bg-white rounded-2xl border border-gray-200 p-3 sm:p-4">
                <div className="aspect-video rounded-xl overflow-hidden bg-black">
                  <iframe
                    src={embed}
                    title={`${ev.title} — intro video`}
                    className="w-full h-full"
                    loading="lazy"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2 px-1">▶ Watch a quick intro to what you'll learn in this {typeLabel}.</p>
              </div>
            )}

            {paragraphs.length > 0 && (
              <Section title={`About this ${typeLabel}`}>
                {paragraphs.map((p, i) => <p key={i} className="text-[15px] text-gray-700 leading-relaxed mb-3 last:mb-0 whitespace-pre-wrap">{p}</p>)}
              </Section>
            )}

            {learn.length > 0 && (
              <Section title="What you'll learn">
                <Bullets items={learn} mark="✓" markClass="text-emerald-600" />
              </Section>
            )}

            {agenda.length > 0 && (
              <Section title="Agenda">
                <div className="space-y-2.5">
                  {agenda.map((a, i) => (
                    <div key={i} className="flex gap-3 text-[15px]">
                      {a.time && <span className="font-bold text-blue-700 w-24 shrink-0">{a.time}</span>}
                      <span className="text-gray-700">{a.title}</span>
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {(attend.length > 0 || prereqs.length > 0) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {attend.length > 0 && (
                  <Section title="Who should attend">
                    <Bullets items={attend} mark="•" markClass="text-blue-600" />
                  </Section>
                )}
                {prereqs.length > 0 && (
                  <Section title="Prerequisites">
                    <Bullets items={prereqs} mark="–" markClass="text-gray-400" />
                  </Section>
                )}
              </div>
            )}

            {speakers.length > 0 && (
              <Section title={speakers.length === 1 ? 'Your speaker' : 'Your speakers'}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {speakers.map((s, i) => (
                    <div key={i} className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
                      <div className="w-11 h-11 rounded-full bg-blue-600 text-white font-black flex items-center justify-center shrink-0">{s.name.trim().charAt(0).toUpperCase()}</div>
                      <div className="min-w-0">
                        <p className="font-bold text-gray-900 truncate">{s.name}</p>
                        {s.title && <p className="text-xs text-gray-500">{s.title}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {canRegister && (
              <button onClick={scrollToForm} className="hidden lg:block w-full py-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-lg font-black shadow-lg shadow-blue-200">
                Register Free →
              </button>
            )}
          </div>

          <aside ref={formRef} className="scroll-mt-6 lg:sticky lg:top-6 lg:max-h-[calc(100vh-3rem)] lg:overflow-y-auto">
            {sidePanel}
          </aside>
        </div>

        <p className="text-center text-xs text-gray-400 mt-10">
          SPR Techforge · Free event · No payment is ever requested on this page.
        </p>
      </main>

      {/* Sticky register button on phones — the form sits below the content there. */}
      {canRegister && (
        <div className="lg:hidden fixed bottom-0 inset-x-0 z-20 p-3 bg-white/95 backdrop-blur border-t border-gray-200">
          <button onClick={scrollToForm} className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-base font-black shadow-lg shadow-blue-200">
            {seats === 0 && ev.waitlistEnabled ? 'Join the Waitlist — Free' : 'Register Free →'}
          </button>
        </div>
      )}
    </div>
  );
};
