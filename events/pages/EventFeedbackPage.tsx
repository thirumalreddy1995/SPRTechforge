// Public post-event survey: /#/events/<slug>/feedback?joined=yes|no&e=<email>
// Opened from the follow-up email (two buttons pre-answer "did you join?").
// Branches: joined → rating, likes, improvements; not joined → reason, next
// session, recording. Both → interest in the course, preferred mode, call time.
// One answer per email per event; a second visit pre-fills and updates it.

import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { Logo } from '../../components/Components';
import { CourseInterest, EventFeedback, FeedbackReason, SprEvent, YesNoMaybe } from '../types';
import { fetchEventBySlug, fetchFeedback, feedbackDocId, findExistingRegistration, submitFeedback } from '../services/eventsPublicDb';
import { formatISTRange } from '../lib/datetime';
import { isValidEmail, normalizeEmail, normalizePhone } from '../lib/validate';
import { FEEDBACK_LIKED_OPTIONS, FEEDBACK_REASON_LABELS } from '../lib/invites';
import { PublicFooter } from '../components/shared';
import { fetchSiteSettingsLite } from '../../site/services/siteDb';

type LoadState = 'loading' | 'ready' | 'notfound' | 'offline';

const Choice: React.FC<{ active: boolean; onClick: () => void; children: React.ReactNode; tone?: 'green' | 'red' | 'blue' }> = ({ active, onClick, children, tone = 'blue' }) => {
  const on = tone === 'green' ? 'bg-emerald-600 border-emerald-600 text-white' : tone === 'red' ? 'bg-red-600 border-red-600 text-white' : 'bg-blue-600 border-blue-600 text-white';
  return (
    <button type="button" onClick={onClick} className={`px-4 py-3 rounded-xl border text-sm font-bold text-left transition-colors ${active ? on : 'bg-white border-gray-300 text-gray-800 hover:border-blue-400'}`}>
      {children}
    </button>
  );
};

const Field: React.FC<{ label: string; children: React.ReactNode; hint?: string }> = ({ label, children, hint }) => (
  <div>
    <p className="text-sm font-bold text-gray-800 mb-2">{label}</p>
    {children}
    {hint && <p className="text-xs text-gray-500 mt-1">{hint}</p>}
  </div>
);

export const EventFeedbackPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const location = useLocation();
  const params = useMemo(() => new URLSearchParams(location.search), [location.search]);

  const [state, setState] = useState<LoadState>('loading');
  const [ev, setEv] = useState<SprEvent | null>(null);
  const [communityUrl, setCommunityUrl] = useState('');
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const [joined, setJoined] = useState<boolean | null>(params.get('joined') === 'yes' ? true : params.get('joined') === 'no' ? false : null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState((params.get('e') || '').trim().toLowerCase());
  const [mobile, setMobile] = useState('');
  const [registrationCode, setRegistrationCode] = useState('');
  const [rating, setRating] = useState(0);
  const [liked, setLiked] = useState<string[]>([]);
  const [improve, setImprove] = useState('');
  const [reason, setReason] = useState<FeedbackReason | ''>('');
  const [reasonOther, setReasonOther] = useState('');
  const [nextSession, setNextSession] = useState<YesNoMaybe | ''>('');
  const [wantRecording, setWantRecording] = useState(true);
  const [courseInterest, setCourseInterest] = useState<CourseInterest | ''>('');
  const [preferredMode, setPreferredMode] = useState<'online' | 'offline' | 'either' | ''>('');
  const [callTime, setCallTime] = useState('');
  const [comments, setComments] = useState('');

  const nextLabel = ev?.followupTemplate?.nextSessionLabel || 'the next session';

  useEffect(() => {
    let live = true;
    setState('loading');
    fetchEventBySlug(slug || '')
      .then(async found => {
        if (!live) return;
        if (!found) { setState('notfound'); return; }
        setEv(found);
        document.title = `Feedback · ${found.title}`;
        setState('ready');
        const e = (params.get('e') || '').trim().toLowerCase();
        if (e) {
          // Pre-fill from the registration and from an earlier answer, if any.
          const [reg, earlier] = await Promise.all([
            findExistingRegistration(found.id, e, '').catch(() => null),
            fetchFeedback(found.id, e).catch(() => null),
          ]);
          if (!live) return;
          if (reg) { setName(reg.fullName || ''); setMobile(reg.mobile || ''); setRegistrationCode(reg.registrationCode || ''); }
          if (earlier) {
            setName(earlier.name || reg?.fullName || ''); setMobile(earlier.mobile || reg?.mobile || '');
            if (params.get('joined') === null) setJoined(earlier.joined);
            setRating(earlier.rating || 0); setLiked(earlier.liked || []); setImprove(earlier.improve || '');
            setReason(earlier.reason || ''); setReasonOther(earlier.reasonOther || ''); setNextSession(earlier.nextSession || '');
            setWantRecording(earlier.wantRecording !== false); setCourseInterest(earlier.courseInterest || '');
            setPreferredMode(earlier.preferredMode || ''); setCallTime(earlier.callTime || ''); setComments(earlier.comments || '');
          }
        }
      })
      .catch(() => { if (live) setState('offline'); });
    fetchSiteSettingsLite().then(s => { if (live) setCommunityUrl(s.whatsappCommunityUrl || ''); }).catch(() => {});
    return () => { live = false; document.title = 'SPR Techforge Management'; };
  }, [slug]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleLiked = (v: string) => setLiked(prev => prev.includes(v) ? prev.filter(x => x !== v) : [...prev, v]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ev) return;
    setError('');
    const em = normalizeEmail(email);
    if (joined === null) { setError('Please tell us whether you joined the live session.'); return; }
    if (!isValidEmail(em)) { setError('Please enter the email address you registered with.'); return; }
    if (joined && rating === 0) { setError('Please rate the session, 1 to 5.'); return; }
    if (!joined && !reason) { setError('Please tell us what stopped you from joining.'); return; }
    if (!joined && !nextSession) { setError(`Please tell us whether you would like to join ${nextLabel}.`); return; }
    if (!courseInterest) { setError('Please tell us whether you are interested in the full programme.'); return; }
    setBusy(true);
    try {
      const now = new Date().toISOString();
      const earlier = await fetchFeedback(ev.id, em).catch(() => null);
      const fb: EventFeedback = {
        id: feedbackDocId(ev.id, em),
        eventId: ev.id, eventSlug: ev.slug, eventTitle: ev.title,
        name: name.trim(), email: em, mobile: normalizePhone(mobile) || mobile.trim(), registrationCode,
        joined,
        rating: joined ? rating : 0, liked: joined ? liked : [], improve: joined ? improve.trim() : '',
        reason: joined ? '' : reason, reasonOther: joined ? '' : reasonOther.trim(), nextSession: joined ? '' : nextSession, wantRecording: joined ? true : wantRecording,
        courseInterest, preferredMode, callTime: callTime.trim(), comments: comments.trim(),
        submittedAt: earlier?.submittedAt || now, updatedAt: now,
        source: params.get('ref') || (params.get('e') ? 'email' : 'direct'),
      };
      await submitFeedback(fb);
      setDone(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      setError('Could not save your answer. Please check your connection and try again.');
      console.warn(err);
    } finally { setBusy(false); }
  };

  const shell = (inner: React.ReactNode) => (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <Link to="/"><Logo size="sm" /></Link>
          <Link to="/events" className="text-sm font-bold text-blue-600 hover:text-blue-800">All events →</Link>
        </div>
      </header>
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        {inner}
        <PublicFooter />
      </main>
    </div>
  );

  if (state === 'loading') return shell(<p className="text-center text-gray-500 py-16">Loading…</p>);
  if (state === 'notfound' || !ev) return shell(<div className="bg-white rounded-2xl border border-gray-200 p-8 text-center"><h1 className="text-xl font-bold text-gray-800 mb-2">This feedback link doesn't look right</h1><Link to="/events" className="text-blue-600 font-bold underline">See upcoming events →</Link></div>);
  if (state === 'offline') return shell(<div className="bg-white rounded-2xl border border-gray-200 p-8 text-center"><h1 className="text-xl font-bold text-gray-800 mb-2">We couldn't reach the server</h1><p className="text-gray-600">Please check your connection and reload this page.</p></div>);

  if (done) {
    return shell(
      <div className="bg-white rounded-2xl border border-emerald-200 shadow-sm p-6 sm:p-8 text-center">
        <div className="text-5xl mb-3">🙏</div>
        <h1 className="text-2xl font-black text-emerald-700 mb-2">Thank you{name ? `, ${name.split(' ')[0]}` : ''}!</h1>
        <p className="text-gray-700 mb-5">Your answer is saved. {joined ? 'The recording and the 60-day plan are on their way to your email.' : wantRecording ? 'We will email you the recording and the 60-day plan.' : 'We have noted your answer.'}</p>
        {!joined && nextSession !== 'no' && (
          <p className="text-gray-800 font-semibold mb-5">We will send you the joining details for {nextLabel} by email and WhatsApp, with a link that works on every phone.</p>
        )}
        {courseInterest !== 'no' && courseInterest && <p className="text-gray-700 mb-5">Our team will reach out about the Software Testing programme{callTime ? ` ${callTime.toLowerCase().startsWith('any') ? 'at a convenient time' : `around ${callTime}`}` : ''}.</p>}
        {communityUrl && <a href={communityUrl} target="_blank" rel="noopener noreferrer" className="inline-block px-5 py-3 rounded-xl bg-[#25D366] hover:bg-[#1ebe5b] text-white font-black">Join our WhatsApp community</a>}
        <p className="text-sm text-gray-500 mt-5"><Link to="/events" className="text-blue-600 font-bold underline">See upcoming events →</Link></p>
      </div>,
    );
  }

  return shell(
    <form onSubmit={submit} className="space-y-5">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8">
        <p className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-1">Two-minute feedback</p>
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 leading-tight">{ev.title}</h1>
        <p className="text-gray-600 mt-1">{formatISTRange(ev.startAt, ev.endAt)}</p>
        <p className="text-gray-700 mt-4">Thank you for registering. Your answers decide how we run the next session, so please be honest.</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8 space-y-6">
        <Field label="1 · Did you join the live session?">
          <div className="grid grid-cols-2 gap-3">
            <Choice tone="green" active={joined === true} onClick={() => setJoined(true)}>✅ Yes, I joined</Choice>
            <Choice tone="red" active={joined === false} onClick={() => setJoined(false)}>❌ No, I could not</Choice>
          </div>
        </Field>

        {joined === true && (
          <>
            <Field label="2 · How was the session?">
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map(n => (
                  <button key={n} type="button" onClick={() => setRating(n)} aria-label={`${n} star${n > 1 ? 's' : ''}`} className={`flex-1 py-3 rounded-xl border text-2xl ${rating >= n ? 'bg-amber-400 border-amber-400' : 'bg-white border-gray-300'}`}>★</button>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-1">1 = poor · 5 = excellent</p>
            </Field>
            <Field label="3 · What did you like most? (pick any)">
              <div className="flex flex-wrap gap-2">
                {FEEDBACK_LIKED_OPTIONS.map(o => <Choice key={o} active={liked.includes(o)} onClick={() => toggleLiked(o)}>{o}</Choice>)}
              </div>
            </Field>
            <Field label="4 · What should we improve? (optional)">
              <textarea value={improve} onChange={e => setImprove(e.target.value)} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm" placeholder="Audio, pace, topics you wanted more of, anything…" />
            </Field>
          </>
        )}

        {joined === false && (
          <>
            <Field label="2 · What stopped you from joining?">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {(Object.keys(FEEDBACK_REASON_LABELS) as FeedbackReason[]).map(r => <Choice key={r} active={reason === r} onClick={() => setReason(r)}>{FEEDBACK_REASON_LABELS[r]}</Choice>)}
              </div>
              {reason === 'other' && <input value={reasonOther} onChange={e => setReasonOther(e.target.value)} className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-xl text-sm" placeholder="Tell us what happened" />}
            </Field>
            <Field label={`3 · We are running the session again on ${nextLabel}. Would you like to join?`}>
              <div className="grid grid-cols-3 gap-2">
                <Choice tone="green" active={nextSession === 'yes'} onClick={() => setNextSession('yes')}>Yes, count me in</Choice>
                <Choice active={nextSession === 'maybe'} onClick={() => setNextSession('maybe')}>Maybe</Choice>
                <Choice tone="red" active={nextSession === 'no'} onClick={() => setNextSession('no')}>No</Choice>
              </div>
            </Field>
            <Field label="4 · Would you like the recording of Saturday's session?">
              <div className="grid grid-cols-2 gap-2">
                <Choice tone="green" active={wantRecording} onClick={() => setWantRecording(true)}>Yes, email it to me</Choice>
                <Choice active={!wantRecording} onClick={() => setWantRecording(false)}>No, thanks</Choice>
              </div>
            </Field>
          </>
        )}

        {joined !== null && (
          <>
            <Field label="5 · Are you interested in the full Software Testing programme at SPR TechForge?" hint="Manual, automation (Selenium with Java or C#, Playwright), API, performance and AI-assisted testing, with live projects and placement support. Fee ₹15,000.">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <Choice tone="green" active={courseInterest === 'yes'} onClick={() => setCourseInterest('yes')}>Yes, tell me more</Choice>
                <Choice active={courseInterest === 'maybe'} onClick={() => setCourseInterest('maybe')}>Maybe, send details</Choice>
                <Choice active={courseInterest === 'no'} onClick={() => setCourseInterest('no')}>Not now</Choice>
              </div>
            </Field>
            {courseInterest && courseInterest !== 'no' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Preferred mode">
                  <div className="grid grid-cols-3 gap-2">
                    <Choice active={preferredMode === 'online'} onClick={() => setPreferredMode('online')}>Online</Choice>
                    <Choice active={preferredMode === 'offline'} onClick={() => setPreferredMode('offline')}>Offline, KPHB</Choice>
                    <Choice active={preferredMode === 'either'} onClick={() => setPreferredMode('either')}>Either</Choice>
                  </div>
                </Field>
                <Field label="Best time to call you">
                  <div className="grid grid-cols-3 gap-2">
                    {['Morning', 'Afternoon', 'Evening'].map(t => <Choice key={t} active={callTime === t} onClick={() => setCallTime(t)}>{t}</Choice>)}
                  </div>
                </Field>
              </div>
            )}
            <Field label="Anything else you want to tell us? (optional)">
              <textarea value={comments} onChange={e => setComments(e.target.value)} rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm" />
            </Field>
          </>
        )}
      </div>

      {joined !== null && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8 space-y-4">
          <p className="text-sm font-bold text-gray-800">Your details</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input value={name} onChange={e => setName(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-xl text-sm" placeholder="Full name" />
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-xl text-sm" placeholder="Email you registered with" required />
            <input type="tel" value={mobile} onChange={e => setMobile(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-xl text-sm" placeholder="Mobile (optional)" />
          </div>
          {registrationCode && <p className="text-xs text-emerald-700 font-semibold">Matched your registration {registrationCode}.</p>}
          {error && <p className="text-sm font-bold text-red-600">{error}</p>}
          <button type="submit" disabled={busy} className="w-full py-4 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-lg font-black shadow-lg shadow-blue-200">{busy ? 'Saving…' : 'Submit my answers'}</button>
          <p className="text-xs text-gray-500">We use your answers only to improve our sessions and, if you asked, to contact you about the programme.</p>
        </div>
      )}
    </form>,
  );
};
