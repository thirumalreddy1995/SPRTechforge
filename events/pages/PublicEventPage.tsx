// PUBLIC /#/events/:slug — the shared registration link opens here.
// No login, mobile-first, one column, large tap targets. Handles: live event
// page, registration form (with duplicate & capacity handling), success state,
// waitlist, closed states, cancelled notice, past-event recap, and a
// draft-preview mode visible only to logged-in admins.

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { EventPrivateDetails, EventRegistration, SprEvent } from '../types';
import { fetchEventBySlug, findExistingRegistration, registerForEvent, fetchPrivateDetails } from '../services/eventsDb';
import { formatISTRange } from '../lib/datetime';
import {
  lifecycleOf, registrationWindow, seatsRemaining,
  validateRegistration, RegistrationFormInput, normalizeEmail, normalizePhone,
} from '../lib/validate';
import { icsDataUri, googleCalendarUrl } from '../lib/ics';
import { LiveBadge, TypeBadge, whatsAppShareUrl, publicEventUrl } from '../components/shared';
import { confirmationEmailHtml, isEventMailerConfigured, sendEventEmail } from '../lib/emails';

const MIN_FILL_TIME_MS = 3000; // bots submit instantly; humans don't

const generateRegId = () => `reg-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

type LoadState = 'loading' | 'ready' | 'notfound' | 'offline';

const emptyForm = (): RegistrationFormInput => ({
  fullName: '', email: '', mobile: '', city: '', qualification: '', passingYear: '',
  currentStatus: '', howDidYouHear: '', customAnswers: {},
  consentTerms: false, consentEmail: false, consentWhatsApp: false,
});

/** Large-tap-target labelled input for the public form. */
const PInput: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string }> = ({ label, error, ...props }) => (
  <div>
    <label className="block text-sm font-bold text-gray-700 mb-1">{label}{props.required && <span className="text-red-500"> *</span>}</label>
    <input
      {...props}
      className={`w-full px-4 py-3 border rounded-xl text-base outline-none transition-colors focus:ring-2 ${error ? 'border-red-400 focus:ring-red-200' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-100'}`}
    />
    {error && <p className="text-xs text-red-600 font-semibold mt-1">{error}</p>}
  </div>
);

const PSelect: React.FC<React.SelectHTMLAttributes<HTMLSelectElement> & { label: string; error?: string }> = ({ label, error, children, ...props }) => (
  <div>
    <label className="block text-sm font-bold text-gray-700 mb-1">{label}{props.required && <span className="text-red-500"> *</span>}</label>
    <select
      {...props}
      className={`w-full px-4 py-3 border rounded-xl text-base bg-white outline-none transition-colors focus:ring-2 ${error ? 'border-red-400 focus:ring-red-200' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-100'}`}
    >
      {children}
    </select>
    {error && <p className="text-xs text-red-600 font-semibold mt-1">{error}</p>}
  </div>
);

const Consent: React.FC<{ checked: boolean; onChange: (v: boolean) => void; error?: string; children: React.ReactNode }> = ({ checked, onChange, error, children }) => (
  <div>
    <label className="flex items-start gap-3 text-sm text-gray-700 cursor-pointer">
      <input type="checkbox" className="w-5 h-5 mt-0.5 shrink-0" checked={checked} onChange={e => onChange(e.target.checked)} />
      <span>{children}</span>
    </label>
    {error && <p className="text-xs text-red-600 font-semibold mt-1 ml-8">{error}</p>}
  </div>
);

export const PublicEventPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const location = useLocation();
  const { user } = useApp(); // only used to allow draft preview for admins

  const [state, setState] = useState<LoadState>('loading');
  const [ev, setEv] = useState<SprEvent | null>(null);
  const [priv, setPriv] = useState<EventPrivateDetails | null>(null);

  const [form, setForm] = useState<RegistrationFormInput>(emptyForm());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [honeypot, setHoneypot] = useState('');
  const formLoadedAt = useRef(Date.now());
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
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
      })
      .catch(() => { if (!cancelled) setState('offline'); });
    return () => { cancelled = true; };
  }, [slug]);

  const isAdminViewer = !!user && (user.role === 'admin' || user.modules.includes('users'));

  if (state === 'loading') {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4"><p className="text-gray-500">Loading event…</p></div>;
  }
  if (state === 'offline') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
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
  const gcal = googleCalendarUrl(ev);
  const ics = icsDataUri(ev);
  const shareText = `🎓 ${ev.title}\n📅 ${formatISTRange(ev.startAt, ev.endAt)}\n💯 Free registration!\n👉 ${publicEventUrl(ev.slug)}`;

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
      const mobile = normalizePhone(form.mobile);

      // Friendly duplicate handling — never a second record, never a scary error.
      const existing = await findExistingRegistration(ev.id, email, mobile);
      if (existing && existing.status !== 'cancelled') {
        setAlreadyRegistered(existing);
        if (existing.status === 'confirmed' && (ev.mode === 'online' || ev.mode === 'hybrid')) {
          fetchPrivateDetails(ev.id).then(setPriv).catch(() => {});
        }
        return;
      }

      const now = new Date().toISOString();
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
        consentEmail: stamp(form.consentEmail),
        consentWhatsApp: stamp(form.consentWhatsApp),
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

      let privDetails: EventPrivateDetails | null = null;
      if (reg.status === 'confirmed' && (ev.mode === 'online' || ev.mode === 'hybrid')) {
        try { privDetails = await fetchPrivateDetails(ev.id); setPriv(privDetails); } catch { /* success page still works */ }
      }

      // Confirmation email — fire and forget; the success page shows everything anyway.
      if (isEventMailerConfigured() && reg.consentEmail.given) {
        sendEventEmail(ev, reg.email, `${reg.status === 'waitlisted' ? 'Waitlisted' : 'Registered'}: ${ev.title}`, confirmationEmailHtml(ev, reg, privDetails))
          .catch(e => console.warn('Confirmation email failed:', e));
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
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
      <p className="text-gray-600 text-sm mb-5">
        {reg.status === 'waitlisted'
          ? "The event is currently full. We'll email you if a seat opens up."
          : `Your free seat for ${formatISTRange(ev.startAt, ev.endAt)} is confirmed.`}
        {reg.consentEmail.given && ' A confirmation email is on its way.'}
      </p>

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
    <div ref={formRef} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 sm:p-7">
      <h2 className="text-xl font-black text-gray-900 mb-1">Reserve your free seat</h2>
      {seats !== null && seats > 0 && <p className="text-sm font-bold text-orange-600 mb-4">{seats} seat{seats === 1 ? '' : 's'} remaining</p>}
      {seats === 0 && ev.waitlistEnabled && <p className="text-sm font-bold text-amber-600 mb-4">All seats taken — you can still join the waitlist.</p>}

      <div className="space-y-4">
        <PInput label="Full name" required value={form.fullName} error={errors.fullName} onChange={e => setF({ fullName: e.target.value })} autoComplete="name" />
        <PInput label="Email" required type="email" value={form.email} error={errors.email} onChange={e => setF({ email: e.target.value })} autoComplete="email" inputMode="email" />
        <PInput label="Mobile (WhatsApp preferred)" required type="tel" value={form.mobile} error={errors.mobile} onChange={e => setF({ mobile: e.target.value })} autoComplete="tel" inputMode="tel" placeholder="98xxxxxxxx" />

        {ev.collectFields.city && <PInput label="City" value={form.city} onChange={e => setF({ city: e.target.value })} autoComplete="address-level2" />}
        {ev.collectFields.qualification && <PInput label="Qualification / degree" value={form.qualification} onChange={e => setF({ qualification: e.target.value })} placeholder="B.Tech / B.Sc / MCA / B.Com…" />}
        {ev.collectFields.passingYear && <PInput label="Passing year" value={form.passingYear} onChange={e => setF({ passingYear: e.target.value })} inputMode="numeric" placeholder="2024" />}
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
          <p className="text-xs text-gray-500">
            We use these details only to manage your event registration and to tell you about our training programs. We never sell your data.
          </p>
          <Consent checked={form.consentTerms} onChange={v => setF({ consentTerms: v })} error={errors.consentTerms}>
            I agree to be contacted about <strong>this event</strong> (confirmation & reminders). <span className="text-red-500">*</span>
          </Consent>
          <Consent checked={form.consentEmail} onChange={v => setF({ consentEmail: v })}>
            Email me the confirmation and future course updates.
          </Consent>
          <Consent checked={form.consentWhatsApp} onChange={v => setF({ consentWhatsApp: v })}>
            You may contact me on WhatsApp.
          </Consent>
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

  // ---------------- page ----------------

  return (
    <div className="min-h-screen bg-gray-50">
      {ev.status === 'draft' && (
        <div className="bg-amber-400 text-amber-950 text-center text-sm font-bold py-2 px-4 sticky top-0 z-30">
          👁 PREVIEW — this event is a draft. Only you (admin) can see this page. Publish it to make the link work for everyone.
        </div>
      )}

      <div className="max-w-2xl mx-auto px-4 py-6 sm:py-10">
        {ev.bannerUrl && <img src={ev.bannerUrl} alt={ev.title} className="w-full rounded-2xl shadow-sm mb-6" />}

        <div className="flex items-center gap-2 flex-wrap mb-3">
          <TypeBadge type={ev.type} />
          {phase === 'live' && ev.status === 'published' && <LiveBadge />}
          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">FREE</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 leading-tight mb-2">{ev.title}</h1>
        <p className="text-gray-600 mb-4">{ev.shortDescription}</p>

        <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-6 space-y-1.5 text-sm">
          <p className="font-bold text-gray-900">📅 {formatISTRange(ev.startAt, ev.endAt)}</p>
          {(ev.mode === 'online' || ev.mode === 'hybrid') && <p className="text-gray-700">💻 Online{ev.platform ? ` · ${ev.platform}` : ''} — join link is shared after you register</p>}
          {(ev.mode === 'offline' || ev.mode === 'hybrid') && (
            <p className="text-gray-700">
              📍 {ev.venueName}{ev.venueAddress ? `, ${ev.venueAddress}` : ''}
              {ev.venueMapUrl && <> · <a className="text-blue-600 underline font-bold" href={ev.venueMapUrl} target="_blank" rel="noopener noreferrer">Map</a></>}
            </p>
          )}
          {ev.speakers.filter(s => s.name).length > 0 && (
            <p className="text-gray-700">🎤 {ev.speakers.filter(s => s.name).map(s => s.title ? `${s.name} (${s.title})` : s.name).join(', ')}</p>
          )}
        </div>

        {/* Cancelled */}
        {ev.status === 'cancelled' && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center mb-6">
            <div className="text-4xl mb-2">😔</div>
            <h2 className="text-lg font-black text-red-700">This event was cancelled</h2>
            {ev.cancelReason && <p className="text-sm text-gray-600 mt-1">{ev.cancelReason}</p>}
            <Link to="/events" className="inline-block mt-3 text-blue-600 font-bold underline text-sm">See upcoming events →</Link>
          </div>
        )}

        {/* Past → recap */}
        {ev.status === 'published' && phase === 'past' && (
          <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-black text-gray-900 mb-2">This event is over — here's how it went</h2>
            {ev.recap?.finalAttendeeCount > 0 && <p className="text-sm font-bold text-emerald-700 mb-2">👥 {ev.recap.finalAttendeeCount} people attended</p>}
            {ev.recap?.notes && <p className="text-sm text-gray-600 whitespace-pre-wrap mb-3">{ev.recap.notes}</p>}
            {ev.recap?.recordingUrl && (
              <a href={ev.recap.recordingUrl} target="_blank" rel="noopener noreferrer" className="inline-block px-4 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 mb-3">▶ Watch the recording</a>
            )}
            {(ev.recap?.photoUrls || []).length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
                {ev.recap.photoUrls.map((u, i) => <img key={i} src={u} alt="" loading="lazy" className="w-full aspect-video object-cover rounded-lg border border-gray-100" />)}
              </div>
            )}
            <p className="text-sm text-gray-500 mt-4">Missed it? <Link to="/events" className="text-blue-600 font-bold underline">Check the next upcoming event →</Link></p>
          </div>
        )}

        {/* Live/upcoming published: registration area */}
        {ev.status !== 'cancelled' && phase !== 'past' && (
          done ? successView(done, false)
          : alreadyRegistered ? successView(alreadyRegistered, true)
          : window_.open ? registrationForm
          : (
            <div className="bg-white rounded-2xl border border-gray-200 p-6 text-center">
              <div className="text-4xl mb-2">🔒</div>
              <h2 className="text-lg font-black text-gray-800">Registrations are closed</h2>
              <p className="text-sm text-gray-500 mt-1">
                {seats === 0 ? 'All seats were taken. ' : ''}Follow the next event — free sessions run regularly.
              </p>
              <Link to="/events" className="inline-block mt-3 text-blue-600 font-bold underline text-sm">See upcoming events →</Link>
            </div>
          )
        )}

        {/* Content sections */}
        {(paragraphs.length > 0 || ev.whatYouWillLearn.filter(Boolean).length > 0) && !done && !alreadyRegistered && (
          <div className="mt-8 space-y-6">
            {paragraphs.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-200 p-5 sm:p-6">
                <h2 className="font-black text-gray-900 mb-3">About this {ev.type === 'demo_class' ? 'demo class' : ev.type}</h2>
                {paragraphs.map((p, i) => <p key={i} className="text-sm text-gray-700 leading-relaxed mb-3 whitespace-pre-wrap">{p}</p>)}
              </div>
            )}
            {ev.whatYouWillLearn.filter(Boolean).length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-200 p-5 sm:p-6">
                <h2 className="font-black text-gray-900 mb-3">What you'll learn</h2>
                <ul className="space-y-2">
                  {ev.whatYouWillLearn.filter(Boolean).map((x, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-700"><span className="text-emerald-600 font-black mt-0.5">✓</span>{x}</li>
                  ))}
                </ul>
              </div>
            )}
            {ev.agenda.filter(a => a.title).length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-200 p-5 sm:p-6">
                <h2 className="font-black text-gray-900 mb-3">Agenda</h2>
                <div className="space-y-2">
                  {ev.agenda.filter(a => a.title).map((a, i) => (
                    <div key={i} className="flex gap-3 text-sm">
                      {a.time && <span className="font-bold text-blue-700 w-20 shrink-0">{a.time}</span>}
                      <span className="text-gray-700">{a.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {ev.whoShouldAttend.filter(Boolean).length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-200 p-5 sm:p-6">
                <h2 className="font-black text-gray-900 mb-3">Who should attend</h2>
                <ul className="space-y-2">
                  {ev.whoShouldAttend.filter(Boolean).map((x, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-700"><span className="text-blue-600 font-black mt-0.5">•</span>{x}</li>
                  ))}
                </ul>
              </div>
            )}
            {ev.prerequisites.filter(Boolean).length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-200 p-5 sm:p-6">
                <h2 className="font-black text-gray-900 mb-3">Prerequisites</h2>
                <ul className="space-y-2">
                  {ev.prerequisites.filter(Boolean).map((x, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-700"><span className="text-gray-400 font-black mt-0.5">–</span>{x}</li>
                  ))}
                </ul>
              </div>
            )}
            {window_.open && (
              <button onClick={scrollToForm} className="w-full py-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-lg font-black shadow-lg shadow-blue-200">
                Register Free →
              </button>
            )}
          </div>
        )}

        <p className="text-center text-xs text-gray-400 mt-10">
          SPR Techforge · Free event · No payment is ever requested on this page.
        </p>
      </div>
    </div>
  );
};
