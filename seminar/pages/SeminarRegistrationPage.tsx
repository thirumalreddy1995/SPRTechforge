import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '../../components/Components';
import {
  SEMINAR_COLLECTIONS,
  countRegisteredSeats,
  defaultSeminarSettings,
  fetchCandidateByToken,
  fetchQuestionsForCandidate,
  fetchRegistrationForCandidate,
  fetchSeminarSettings,
  saveSeminarDoc,
} from '../services/seminarDb';
import { SeminarCandidate, SeminarPreferredMode, SeminarQuestion, SeminarRegistration, SeminarSettings } from '../types';
import { formatSeminarDate } from '../lib/template';
import { generateSeminarId } from '../lib/token';
import { googleCalendarUrl, icsDataUri } from '../lib/ics';

// Public, mobile-first registration page — /seminar/s/:token. No login; the
// invite token IS the identity. All candidate/question text is rendered
// through React (auto-escaped). Questions are rate-limited to 5/min per token
// (client-side; see seminar/README.md for the server-side hardening note).

const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 60 * 1000;

const questionAllowed = (token: string): boolean => {
  try {
    const key = `seminar_q_ts_${token}`;
    const now = Date.now();
    const stamps: number[] = JSON.parse(localStorage.getItem(key) || '[]').filter((t: number) => now - t < RATE_LIMIT_WINDOW_MS);
    if (stamps.length >= RATE_LIMIT_MAX) return false;
    stamps.push(now);
    localStorage.setItem(key, JSON.stringify(stamps));
    return true;
  } catch {
    return true; // storage unavailable — don't block real users
  }
};

type LoadState = 'loading' | 'ready' | 'invalid' | 'offline';

export const SeminarRegistrationPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();

  const [state, setState] = useState<LoadState>('loading');
  const [settings, setSettings] = useState<SeminarSettings>(defaultSeminarSettings());
  const [candidate, setCandidate] = useState<SeminarCandidate | null>(null);
  const [registration, setRegistration] = useState<SeminarRegistration | null>(null);
  const [questions, setQuestions] = useState<SeminarQuestion[]>([]);
  const [seatsTaken, setSeatsTaken] = useState<number | null>(null);

  const [mode, setMode] = useState<SeminarPreferredMode>('online');
  const [isReserving, setIsReserving] = useState(false);
  const [questionText, setQuestionText] = useState('');
  const [isAsking, setIsAsking] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [cfg, cand] = await Promise.all([fetchSeminarSettings(), fetchCandidateByToken(token || '')]);
        if (cancelled) return;
        setSettings(cfg);
        if (!cand) { setState('invalid'); return; }
        setCandidate(cand);
        const [reg, qs] = await Promise.all([
          fetchRegistrationForCandidate(cand.id),
          fetchQuestionsForCandidate(cand.id),
        ]);
        if (cancelled) return;
        setRegistration(reg);
        setQuestions(qs);
        if (cfg.showSeatsRemaining && cfg.seatsLimit > 0) {
          try { setSeatsTaken(await countRegisteredSeats()); } catch { /* non-critical */ }
        }
        setState('ready');
      } catch (e) {
        console.error('Seminar page failed to load', e);
        if (!cancelled) setState('offline');
      }
    })();
    return () => { cancelled = true; };
  }, [token]);

  const reserve = async (status: 'registered' | 'declined') => {
    if (!candidate) return;
    setIsReserving(true);
    setNotice(null);
    try {
      const reg: SeminarRegistration = {
        id: registration?.id || generateSeminarId('semreg'),
        candidateId: candidate.id,
        status,
        preferredMode: mode,
        registeredAt: new Date().toISOString(),
      };
      await saveSeminarDoc(SEMINAR_COLLECTIONS.registrations, reg);
      setRegistration(reg);
    } catch (e) {
      setNotice('Could not save your response — please check your connection and try again.');
    } finally {
      setIsReserving(false);
    }
  };

  const ask = async () => {
    if (!candidate) return;
    const text = questionText.trim();
    if (!text) return;
    if (text.length > 1000) { setNotice('Please keep your question under 1000 characters.'); return; }
    if (!questionAllowed(candidate.inviteToken)) {
      setNotice('You’re asking very fast — please wait a minute and try again.');
      return;
    }
    setIsAsking(true);
    setNotice(null);
    try {
      const q: SeminarQuestion = {
        id: generateSeminarId('semq'),
        candidateId: candidate.id,
        questionText: text,
        createdAt: new Date().toISOString(),
        replyText: null,
        repliedAt: null,
        replyEmailed: false,
      };
      await saveSeminarDoc(SEMINAR_COLLECTIONS.questions, q);
      setQuestions(prev => [...prev, q]);
      setQuestionText('');
    } catch (e) {
      setNotice('Could not submit your question — please try again.');
    } finally {
      setIsAsking(false);
    }
  };

  // --- Render states -----------------------------------------------------

  if (state === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <p className="text-gray-500">Loading your invitation…</p>
      </div>
    );
  }

  if (state === 'invalid' || state === 'offline') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="text-5xl mb-4">{state === 'invalid' ? '\u{1F50D}' : '\u{1F4E1}'}</div>
          <h1 className="text-xl font-bold text-gray-800 mb-2">
            {state === 'invalid' ? "This link doesn't look right" : "We couldn't reach the server"}
          </h1>
          <p className="text-gray-600 text-sm">
            {state === 'invalid'
              ? 'Your invitation link may be incomplete — try opening it again from your email or WhatsApp message. If it still fails, reply to the invitation and we’ll send a fresh one.'
              : 'Please check your internet connection and reload this page.'}
          </p>
        </div>
      </div>
    );
  }

  const { date, time } = formatSeminarDate(settings.dateTime);
  const venueLine = [settings.venue, settings.onlineLink ? 'Online' : ''].filter(Boolean).join(' / ') || 'Online';
  const seatsRemaining =
    settings.showSeatsRemaining && settings.seatsLimit > 0 && seatsTaken !== null
      ? Math.max(0, settings.seatsLimit - seatsTaken)
      : null;
  const isRegistered = registration?.status === 'registered';
  const gcal = googleCalendarUrl(settings);
  const ics = icsDataUri(settings);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-6 sm:py-10">

        {settings.bannerUrl && (
          <img src={settings.bannerUrl} alt={settings.title} className="w-full rounded-xl shadow-sm mb-6" />
        )}

        {/* §7C copy */}
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 leading-tight mb-2">
          Your IT career doesn't need more luck. It needs a skill companies are hiring for.
        </h1>
        <p className="text-gray-600 mb-6 italic">
          Free Software Testing seminar &middot; {date}, {time} &middot; {venueLine} &middot; Limited seats
        </p>

        <div className="space-y-3 mb-8">
          {[
            ['\u{1F393}', 'Freshers welcome', '2019–2026 passouts, any degree — B.Tech, B.Sc, MCA, BCA, B.Com, MBA.'],
            ['\u{1F4BB}', 'No coding background needed', 'Start with manual testing, grow into automation.'],
            ['\u{1F5E3}️', 'Ask anything live', 'Get an honest roadmap for YOUR profile.'],
          ].map(([icon, title, sub]) => (
            <div key={title} className="flex items-start gap-3 bg-white rounded-xl border border-gray-200 p-4">
              <span className="text-2xl">{icon}</span>
              <div>
                <p className="font-bold text-gray-900">{title}</p>
                <p className="text-gray-600 text-sm">{sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Reserve form / success state */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 sm:p-6 mb-8">
          {isRegistered ? (
            <div className="text-center">
              <div className="text-4xl mb-2">&#127881;</div>
              <h2 className="text-xl font-bold text-emerald-700 mb-1">You're in, {candidate?.fullName}!</h2>
              <p className="text-gray-600 text-sm mb-4">
                Your {registration?.preferredMode === 'in_person' ? 'in-person' : 'online'} seat is reserved for {date} at {time}.
                {settings.onlineLink && registration?.preferredMode === 'online' && (
                  <> Join link: <a className="text-blue-600 underline break-all" href={settings.onlineLink}>{settings.onlineLink}</a></>
                )}
              </p>
              <div className="flex justify-center gap-3 flex-wrap">
                {gcal && <a href={gcal} target="_blank" rel="noopener noreferrer" className="text-blue-600 font-bold text-sm underline">Add to Google Calendar</a>}
                {ics && <a href={ics} download="seminar.ics" className="text-blue-600 font-bold text-sm underline">Download .ics</a>}
              </div>
              <button onClick={() => reserve('declined')} disabled={isReserving} className="mt-4 text-xs text-gray-400 underline">
                Can't make it anymore? Release my seat
              </button>
            </div>
          ) : registration?.status === 'declined' ? (
            <div className="text-center">
              <h2 className="text-lg font-bold text-gray-800 mb-1">No problem, {candidate?.fullName}.</h2>
              <p className="text-gray-600 text-sm mb-4">Changed your mind? Your seat is one tap away.</p>
              <Button variant="success" onClick={() => reserve('registered')} disabled={isReserving} className="w-full text-lg py-3">
                {isReserving ? 'Reserving…' : 'Reserve My Free Seat'}
              </Button>
            </div>
          ) : (
            <>
              <h2 className="text-lg font-bold text-gray-900 mb-1">Reserve your free seat, {candidate?.fullName}</h2>
              {seatsRemaining !== null && (
                <p className="text-sm font-bold text-orange-600 mb-3">{seatsRemaining} seat{seatsRemaining === 1 ? '' : 's'} remaining</p>
              )}
              <p className="text-sm text-gray-600 mb-3">How will you attend?</p>
              <div className="grid grid-cols-2 gap-3 mb-4">
                {([['online', 'Online'], ['in_person', 'In Person']] as [SeminarPreferredMode, string][]).map(([m, label]) => (
                  <button
                    key={m}
                    onClick={() => setMode(m)}
                    className={`py-3 rounded-xl border-2 font-bold text-sm transition-colors ${mode === m ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <Button variant="success" onClick={() => reserve('registered')} disabled={isReserving} className="w-full text-lg py-3">
                {isReserving ? 'Reserving…' : 'Reserve My Free Seat'}
              </Button>
              <button onClick={() => reserve('declined')} disabled={isReserving} className="w-full mt-3 text-xs text-gray-400 underline">
                Can't attend this time
              </button>
            </>
          )}
          {notice && <p className="text-sm text-red-600 mt-3 text-center">{notice}</p>}
        </div>

        {/* Q&A thread */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 sm:p-6">
          <h3 className="font-bold text-gray-900 mb-1">Have a doubt? Ask before you decide — I reply personally.</h3>
          <p className="text-xs text-gray-500 mb-4">Replies also land in your email inbox.</p>

          <div className="space-y-4 mb-4">
            {questions.map(q => (
              <div key={q.id}>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-400 mb-1">You asked &middot; {new Date(q.createdAt).toLocaleString()}</p>
                  <p className="text-gray-800 text-sm whitespace-pre-wrap">{q.questionText}</p>
                </div>
                {q.replyText && (
                  <div className="ml-4 mt-2 border-l-2 border-emerald-300 pl-3">
                    <p className="text-xs text-emerald-700 font-bold mb-1">{settings.trainerName || 'Trainer'} replied</p>
                    <p className="text-gray-700 text-sm whitespace-pre-wrap">{q.replyText}</p>
                  </div>
                )}
              </div>
            ))}
            {questions.length === 0 && <p className="text-gray-400 text-sm italic">No questions yet — be the first.</p>}
          </div>

          <div className="flex gap-2 items-end">
            <textarea
              rows={2}
              maxLength={1000}
              placeholder="e.g. I'm a 2021 B.Com passout with no IT experience — is this for me?"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
              value={questionText}
              onChange={e => setQuestionText(e.target.value)}
            />
            <Button variant="success" onClick={ask} disabled={isAsking || !questionText.trim()}>
              {isAsking ? '…' : 'Ask'}
            </Button>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-8">
          {settings.trainerName && <>Conducted by {settings.trainerName} &middot; </>}Free seminar &middot; No payment is ever requested on this page.
        </p>
      </div>
    </div>
  );
};
