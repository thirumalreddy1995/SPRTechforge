// Create / edit an event — a 5-step wizard that saves a draft at every step
// so input is never lost. Publishing runs the validation gate and produces
// the shareable registration link.

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Card, Input, Modal, Select } from '../../components/Components';
import { useApp } from '../../context/AppContext';
import { uploadService } from '../../services/uploadService';
import {
  EventCustomQuestion,
  EventPrivateDetails,
  SprEvent,
} from '../types';
import {
  saveEvent, savePrivateDetails, fetchPrivateDetails, subscribeEvents, emptyCounters, emptyPrivateDetails,
  fetchRegistrationsForEvent,
} from '../services/eventsDb';
import { istInputToUtcIso, utcIsoToIstInput, formatISTRange } from '../lib/datetime';
import { slugify, uniqueSlug, EVENT_TYPE_LABELS } from '../lib/slug';
import { validateForPublish } from '../lib/validate';
import { youtubeEmbedUrl } from '../lib/video';
import { TextArea, CopyButton, publicEventUrl, whatsAppShareUrl, buildShareText } from '../components/shared';
import { changeNoticeEmailHtml, isEventMailerConfigured, sendEventEmail } from '../lib/emails';

const STEPS = ['Basics', 'Schedule & Mode', 'Content', 'Registration', 'Review & Publish'];

const MAX_BANNER_BYTES = 5 * 1024 * 1024;
const BANNER_MIME = ['image/jpeg', 'image/png', 'image/webp'];

const generateEventId = () => `evt-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
const generateQid = () => `q-${Math.random().toString(36).slice(2, 9)}`;

const newEvent = (userId: string): SprEvent => {
  const now = new Date().toISOString();
  return {
    id: generateEventId(),
    slug: '',
    title: '',
    type: 'webinar',
    shortDescription: '',
    fullDescription: '',
    whatYouWillLearn: [],
    whoShouldAttend: [],
    prerequisites: [],
    bannerPath: '',
    bannerUrl: '',
    videoUrl: '',
    speakers: [],
    agenda: [],
    mode: 'online',
    platform: 'Google Meet',
    venueName: '',
    venueAddress: '',
    venueMapUrl: '',
    startAt: '',
    endAt: '',
    timezone: 'Asia/Kolkata',
    registrationClosesAt: '',
    capacity: 0,
    waitlistEnabled: true,
    collectFields: { city: true, qualification: true, passingYear: true, currentStatus: true, howDidYouHear: true },
    customQuestions: [],
    status: 'draft',
    registrationClosedEarly: false,
    counters: emptyCounters(),
    registrationSeq: 0,
    recap: { recordingUrl: '', finalAttendeeCount: 0, photoUrls: [], notes: '' },
    createdAt: now, createdBy: userId, updatedAt: now, updatedBy: userId,
  };
};

/** One-per-line textarea bound to a string[] field. */
const LinesEditor: React.FC<{ label: string; hint?: string; value: string[]; onChange: (v: string[]) => void; placeholder?: string }> =
  ({ label, hint, value, onChange, placeholder }) => (
    <TextArea
      label={label}
      hint={hint || 'One item per line'}
      rows={4}
      placeholder={placeholder}
      value={value.join('\n')}
      onChange={e => onChange(e.target.value.split('\n'))}
    />
  );

export const EventEditor: React.FC = () => {
  const { id: routeId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, showToast } = useApp();

  const [form, setForm] = useState<SprEvent | null>(null);
  const [priv, setPriv] = useState<EventPrivateDetails | null>(null);
  const [allEvents, setAllEvents] = useState<SprEvent[]>([]);
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [publishedUrl, setPublishedUrl] = useState<string | null>(null);
  const [pendingCriticalSave, setPendingCriticalSave] = useState<null | { changed: string[] }>(null);
  const [notFound, setNotFound] = useState(false);
  const bannerRef = useRef<HTMLInputElement>(null);
  // Snapshot of registrant-facing fields, to detect critical changes on published events.
  const criticalBaseline = useRef<string>('');

  const criticalFingerprint = (ev: SprEvent, p: EventPrivateDetails) =>
    JSON.stringify([ev.startAt, ev.endAt, ev.mode, ev.venueName, ev.venueAddress, p.joinUrl, p.meetingId, p.passcode]);

  useEffect(() => {
    const unsub = subscribeEvents(setAllEvents);
    return unsub;
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!user) return;
      if (!routeId) {
        // Only seed once — live snapshot updates must never wipe typed input.
        if (!form) {
          const ev = newEvent(user.id);
          setForm(ev);
          setPriv(emptyPrivateDetails(ev.id));
          criticalBaseline.current = '';
        }
        return;
      }
      // Editing: wait for subscription data, then hydrate once.
      const existing = allEvents.find(e => e.id === routeId);
      if (!existing) {
        if (allEvents.length > 0) setNotFound(true);
        return;
      }
      if (form?.id === routeId) return; // already hydrated
      const p = await fetchPrivateDetails(routeId);
      if (cancelled) return;
      setForm(existing);
      setPriv(p);
      criticalBaseline.current = criticalFingerprint(existing, p);
    })();
    return () => { cancelled = true; };
  }, [routeId, allEvents, user]);

  const set = (patch: Partial<SprEvent>) => setForm(prev => prev ? { ...prev, ...patch } : prev);
  const setP = (patch: Partial<EventPrivateDetails>) => setPriv(prev => prev ? { ...prev, ...patch } : prev);

  const issues = useMemo(() => (form && priv ? validateForPublish(form, priv) : []), [form, priv]);

  if (!user) return null;
  if (notFound) return <Card className="p-8 text-center"><p className="font-bold text-gray-700">Event not found.</p><Button className="mt-4 mx-auto" onClick={() => navigate('/events/manage')}>Back to Events</Button></Card>;
  if (!form || !priv) return <p className="text-center text-gray-500 py-16">Loading…</p>;

  const ensureSlug = (ev: SprEvent): string => {
    if (ev.slug) return ev.slug;
    const taken = new Set(allEvents.filter(e => e.id !== ev.id).map(e => e.slug).filter(Boolean));
    return uniqueSlug(slugify(ev.title || 'event'), taken);
  };

  const persist = async (ev: SprEvent, p: EventPrivateDetails, toastMsg?: string) => {
    const withMeta: SprEvent = { ...ev, slug: ensureSlug(ev), updatedAt: new Date().toISOString(), updatedBy: user.id };
    await saveEvent(withMeta);
    await savePrivateDetails(p);
    setForm(withMeta);
    if (toastMsg) showToast(toastMsg, 'success');
    // First save of a brand-new event: move to the edit URL so a browser
    // refresh reopens this same draft instead of a blank form.
    if (!routeId) navigate(`/events/manage/edit/${withMeta.id}`, { replace: true });
    return withMeta;
  };

  const criticalChanges = (): string[] => {
    if (form.status !== 'published' || !criticalBaseline.current) return [];
    if (criticalFingerprint(form, priv) === criticalBaseline.current) return [];
    const before = JSON.parse(criticalBaseline.current);
    const now = [form.startAt, form.endAt, form.mode, form.venueName, form.venueAddress, priv.joinUrl, priv.meetingId, priv.passcode];
    const labels = ['start time', 'end time', 'mode', 'venue', 'venue address', 'join link', 'meeting ID', 'passcode'];
    return labels.filter((_, i) => before[i] !== now[i]);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const changed = criticalChanges();
      if (changed.length > 0) {
        // Published event, registrant-facing details changed → explicit confirm + offer to notify.
        setPendingCriticalSave({ changed });
        return;
      }
      await persist(form, priv, form.status === 'draft' ? 'Draft saved' : 'Changes saved');
    } catch (e: any) {
      showToast(`Save failed: ${e.message || e}`, 'error');
    } finally {
      setSaving(false);
    }
  };

  const confirmCriticalSave = async (notifyRegistrants: boolean) => {
    setPendingCriticalSave(null);
    setSaving(true);
    try {
      const saved = await persist(form, priv, 'Changes saved');
      criticalBaseline.current = criticalFingerprint(saved, priv);
      if (notifyRegistrants) {
        if (!isEventMailerConfigured()) {
          showToast('Saved, but email is not configured — registrants were NOT notified. See Admin → Communication Settings.', 'error');
          return;
        }
        const regs = (await fetchRegistrationsForEvent(saved.id)).filter(r => r.status === 'confirmed' || r.status === 'waitlisted');
        let sent = 0;
        for (const r of regs) {
          try {
            await sendEventEmail(saved, r.email, `Update: ${saved.title}`, changeNoticeEmailHtml(saved, r, priv));
            sent++;
            await new Promise(res => setTimeout(res, 400));
          } catch (e) { console.warn('Change notice failed for', r.email, e); }
        }
        showToast(`Saved — update email sent to ${sent}/${regs.length} registrants`, 'success');
      }
    } catch (e: any) {
      showToast(`Save failed: ${e.message || e}`, 'error');
    } finally {
      setSaving(false);
    }
  };

  const goToStep = async (target: number) => {
    // Autosave when moving between steps — "never lose input".
    try { await persist(form, priv); } catch { /* keep editing; explicit save will surface the error */ }
    setStep(target);
  };

  const handleBanner = async (file: File) => {
    if (!BANNER_MIME.includes(file.type)) { showToast('Banner must be JPG, PNG or WebP', 'error'); return; }
    if (file.size > MAX_BANNER_BYTES) { showToast('Banner exceeds the 5 MB limit', 'error'); return; }
    setUploadingBanner(true);
    try {
      const path = `events/${form.id}/banner-${Date.now()}`;
      const up = await uploadService.uploadImage(path, file, { maxWidth: 1200 });
      set({ bannerUrl: up.url, bannerPath: up.storage === 'firebase' ? path : '' });
      showToast(up.storage === 'inline' ? 'Banner saved (compressed inline — cloud Storage unavailable)' : 'Banner uploaded', 'success');
    } catch (e: any) {
      showToast(`Banner upload failed: ${e.message || e}`, 'error');
    } finally {
      setUploadingBanner(false);
      if (bannerRef.current) bannerRef.current.value = '';
    }
  };

  const handlePublish = async () => {
    if (issues.length > 0) { showToast('Fix the issues listed below before publishing', 'error'); return; }
    setPublishing(true);
    try {
      const now = new Date().toISOString();
      const published = await persist({ ...form, status: 'published', publishedAt: form.publishedAt || now, publishedBy: form.publishedBy || user.id }, priv);
      criticalBaseline.current = criticalFingerprint(published, priv);
      setPublishedUrl(publicEventUrl(published.slug));
    } catch (e: any) {
      showToast(`Publish failed: ${e.message || e}`, 'error');
    } finally {
      setPublishing(false);
    }
  };

  const shareText = buildShareText(form);

  // ---------------- step renderers ----------------

  const stepBasics = (
    <Card title="Step 1 — The basics">
      <Input label="Event title" value={form.title} onChange={e => set({ title: e.target.value })} placeholder="e.g. Free Live Webinar: Start Your Software Testing Career" />
      <Select label="Event type" value={form.type} onChange={e => set({ type: e.target.value as SprEvent['type'] })}>
        {Object.entries(EVENT_TYPE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
      </Select>
      <TextArea
        label="Short description"
        hint="1–2 sentences shown on event cards and link shares"
        rows={2}
        maxLength={200}
        value={form.shortDescription}
        onChange={e => set({ shortDescription: e.target.value })}
        placeholder="Learn how freshers from any degree can land a QA job in 6 months."
      />
      <TextArea
        label="Full description"
        hint="Shown on the event page. Plain text — blank lines create paragraphs."
        rows={8}
        value={form.fullDescription}
        onChange={e => set({ fullDescription: e.target.value })}
      />
    </Card>
  );

  const stepSchedule = (
    <div className="space-y-6">
      <Card title="Step 2 — When">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Starts (IST)" type="datetime-local" value={utcIsoToIstInput(form.startAt)} onChange={e => set({ startAt: istInputToUtcIso(e.target.value) })} />
          <Input label="Ends (IST)" type="datetime-local" value={utcIsoToIstInput(form.endAt)} onChange={e => set({ endAt: istInputToUtcIso(e.target.value) })} />
        </div>
        <Input
          label="Registrations close at (IST) — leave empty to close when the event starts"
          type="datetime-local"
          value={utcIsoToIstInput(form.registrationClosesAt)}
          onChange={e => set({ registrationClosesAt: istInputToUtcIso(e.target.value) })}
        />
      </Card>
      <Card title="Where">
        <div className="grid grid-cols-3 gap-3 mb-4">
          {([['online', '💻 Online'], ['offline', '🏢 In person'], ['hybrid', '🔀 Hybrid']] as const).map(([m, label]) => (
            <button
              key={m}
              onClick={() => set({ mode: m })}
              className={`py-3 rounded-xl border-2 font-bold text-sm transition-colors ${form.mode === m ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}
            >
              {label}
            </button>
          ))}
        </div>
        {(form.mode === 'online' || form.mode === 'hybrid') && (
          <div className="border border-blue-100 bg-blue-50/50 rounded-xl p-4 mb-4">
            <p className="text-xs font-bold text-blue-700 uppercase mb-3">Online details — the join link stays private until someone registers</p>
            <Input label="Platform (shown publicly)" value={form.platform} onChange={e => set({ platform: e.target.value })} placeholder="Zoom / Google Meet / Jitsi" />
            <Input label="Join URL (private)" value={priv.joinUrl} onChange={e => setP({ joinUrl: e.target.value })} placeholder="https://meet.google.com/…" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Meeting ID (private, optional)" value={priv.meetingId} onChange={e => setP({ meetingId: e.target.value })} />
              <Input label="Passcode (private, optional)" value={priv.passcode} onChange={e => setP({ passcode: e.target.value })} />
            </div>
          </div>
        )}
        {(form.mode === 'offline' || form.mode === 'hybrid') && (
          <div className="border border-emerald-100 bg-emerald-50/50 rounded-xl p-4">
            <p className="text-xs font-bold text-emerald-700 uppercase mb-3">Venue details</p>
            <Input label="Venue name" value={form.venueName} onChange={e => set({ venueName: e.target.value })} placeholder="SPR Techforge Training Center" />
            <Input label="Full address" value={form.venueAddress} onChange={e => set({ venueAddress: e.target.value })} />
            <Input label="Google Maps link (optional)" value={form.venueMapUrl} onChange={e => set({ venueMapUrl: e.target.value })} placeholder="https://maps.app.goo.gl/…" />
          </div>
        )}
      </Card>
    </div>
  );

  const stepContent = (
    <div className="space-y-6">
      <Card title="Step 3 — Banner (required)">
        <div className="flex flex-col md:flex-row gap-6 items-start">
          <div className="flex-1 w-full">
            {form.bannerUrl ? (
              <img src={form.bannerUrl} alt="Event banner" className="w-full max-w-xl rounded-lg border border-gray-200" />
            ) : (
              <div className="w-full max-w-xl h-40 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 text-sm">
                No banner yet — this is the first thing people see
              </div>
            )}
          </div>
          <div className="w-full md:w-72 space-y-3">
            <input ref={bannerRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleBanner(f); }} />
            <Button onClick={() => bannerRef.current?.click()} disabled={uploadingBanner} className="w-full">
              {uploadingBanner ? 'Uploading…' : form.bannerUrl ? 'Replace Banner' : 'Upload Banner'}
            </Button>
            <p className="text-xs text-gray-500">JPG / PNG / WebP. Recommended 1200×628 (the standard social-share size).</p>
          </div>
        </div>
      </Card>
      <Card title="Intro video (optional)">
        <p className="text-xs text-gray-500 mb-3">
          Paste a YouTube link and it plays at the top of the public page, so people can see exactly what they'll learn before they register.
          Any YouTube link format works (youtube.com/watch, youtu.be, Shorts, Live).
        </p>
        <Input
          label="YouTube link"
          value={form.videoUrl || ''}
          onChange={e => set({ videoUrl: e.target.value })}
          placeholder="https://www.youtube.com/watch?v=…  or  https://youtu.be/…"
        />
        {(form.videoUrl || '').trim() && (
          youtubeEmbedUrl(form.videoUrl || '') ? (
            <div className="max-w-xl aspect-video rounded-lg overflow-hidden border border-gray-200 bg-black">
              <iframe
                src={youtubeEmbedUrl(form.videoUrl || '')}
                title="Intro video preview"
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : (
            <p className="text-xs font-bold text-red-600">That doesn't look like a YouTube link — the page will only embed YouTube videos.</p>
          )
        )}
      </Card>
      <Card title="Speakers & agenda (optional but recommended)">
        <p className="text-sm font-bold text-gray-700 mb-2">Speakers</p>
        {form.speakers.map((s, i) => (
          <div key={i} className="flex gap-2 items-start mb-1">
            <div className="flex-1"><Input placeholder="Name" value={s.name} onChange={e => set({ speakers: form.speakers.map((x, j) => j === i ? { ...x, name: e.target.value } : x) })} /></div>
            <div className="flex-1"><Input placeholder="Title, e.g. Senior QA Lead — 12 yrs" value={s.title} onChange={e => set({ speakers: form.speakers.map((x, j) => j === i ? { ...x, title: e.target.value } : x) })} /></div>
            <button onClick={() => set({ speakers: form.speakers.filter((_, j) => j !== i) })} className="text-red-500 hover:text-red-700 font-bold px-2 py-2">✕</button>
          </div>
        ))}
        <Button variant="secondary" onClick={() => set({ speakers: [...form.speakers, { name: '', title: '' }] })}>+ Add speaker</Button>

        <p className="text-sm font-bold text-gray-700 mb-2 mt-6">Agenda</p>
        {form.agenda.map((a, i) => (
          <div key={i} className="flex gap-2 items-start mb-1">
            <div className="w-32"><Input placeholder="11:00 AM" value={a.time} onChange={e => set({ agenda: form.agenda.map((x, j) => j === i ? { ...x, time: e.target.value } : x) })} /></div>
            <div className="flex-1"><Input placeholder="What happens in this part" value={a.title} onChange={e => set({ agenda: form.agenda.map((x, j) => j === i ? { ...x, title: e.target.value } : x) })} /></div>
            <button onClick={() => set({ agenda: form.agenda.filter((_, j) => j !== i) })} className="text-red-500 hover:text-red-700 font-bold px-2 py-2">✕</button>
          </div>
        ))}
        <Button variant="secondary" onClick={() => set({ agenda: [...form.agenda, { time: '', title: '' }] })}>+ Add agenda item</Button>
      </Card>
      <Card title="Selling points">
        <LinesEditor label="What you will learn" value={form.whatYouWillLearn} onChange={v => set({ whatYouWillLearn: v })} placeholder={'How manual testing works in real companies\nAutomation career roadmap\nLive Q&A'} />
        <LinesEditor label="Who should attend" value={form.whoShouldAttend} onChange={v => set({ whoShouldAttend: v })} placeholder={'Freshers from any degree (2019–2026 passouts)\nWorking professionals wanting to switch to IT'} />
        <LinesEditor label="Prerequisites" hint="One per line — leave empty if none" value={form.prerequisites} onChange={v => set({ prerequisites: v })} placeholder="None — just curiosity!" />
      </Card>
    </div>
  );

  const stepRegistration = (
    <div className="space-y-6">
      <Card title="Step 4 — Seats">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Capacity (0 = unlimited)"
            type="number" min={0}
            value={String(form.capacity)}
            onChange={e => set({ capacity: Math.max(0, parseInt(e.target.value, 10) || 0) })}
          />
          <div className="pt-7">
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input type="checkbox" className="w-4 h-4" checked={form.waitlistEnabled} onChange={e => set({ waitlistEnabled: e.target.checked })} />
              Enable waitlist when full (recommended)
            </label>
          </div>
        </div>
      </Card>
      <Card title="Registration form fields">
        <p className="text-xs text-gray-500 mb-3">Name, email and mobile are always collected. Choose the extra fields:</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {([
            ['city', 'City'],
            ['qualification', 'Qualification / degree'],
            ['passingYear', 'Passing year'],
            ['currentStatus', 'Current status (student / fresher / working)'],
            ['howDidYouHear', 'How did you hear about us'],
          ] as const).map(([k, label]) => (
            <label key={k} className="flex items-center gap-2 text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
              <input type="checkbox" className="w-4 h-4" checked={form.collectFields[k]} onChange={e => set({ collectFields: { ...form.collectFields, [k]: e.target.checked } })} />
              {label}
            </label>
          ))}
        </div>
      </Card>
      <Card title="Custom questions (optional)">
        {form.customQuestions.map((cq, i) => (
          <div key={cq.id} className="border border-gray-200 rounded-xl p-3 mb-3 bg-gray-50/50">
            <div className="flex gap-2 items-start">
              <div className="flex-1"><Input placeholder="Question label, e.g. Which topic interests you most?" value={cq.label} onChange={e => set({ customQuestions: form.customQuestions.map((x, j) => j === i ? { ...x, label: e.target.value } : x) })} /></div>
              <div className="w-36">
                <Select value={cq.fieldType} onChange={e => set({ customQuestions: form.customQuestions.map((x, j) => j === i ? { ...x, fieldType: e.target.value as EventCustomQuestion['fieldType'] } : x) })}>
                  <option value="text">Text answer</option>
                  <option value="select">Dropdown</option>
                </Select>
              </div>
              <button onClick={() => set({ customQuestions: form.customQuestions.filter((_, j) => j !== i) })} className="text-red-500 hover:text-red-700 font-bold px-2 py-2">✕</button>
            </div>
            {cq.fieldType === 'select' && (
              <TextArea
                label="Dropdown options" hint="One option per line (at least 2)" rows={3}
                value={cq.options.join('\n')}
                onChange={e => set({ customQuestions: form.customQuestions.map((x, j) => j === i ? { ...x, options: e.target.value.split('\n') } : x) })}
              />
            )}
            <label className="flex items-center gap-2 text-xs text-gray-600">
              <input type="checkbox" className="w-4 h-4" checked={cq.required} onChange={e => set({ customQuestions: form.customQuestions.map((x, j) => j === i ? { ...x, required: e.target.checked } : x) })} />
              Required
            </label>
          </div>
        ))}
        <Button variant="secondary" onClick={() => set({ customQuestions: [...form.customQuestions, { id: generateQid(), label: '', fieldType: 'text', required: false, options: [] }] })}>
          + Add custom question
        </Button>
      </Card>
    </div>
  );

  const stepReview = (
    <div className="space-y-6">
      {issues.length > 0 ? (
        <Card title={`⚠️ ${issues.length} thing${issues.length === 1 ? '' : 's'} to fix before publishing`}>
          <ul className="space-y-2">
            {issues.map((iss, i) => (
              <li key={i} className="flex items-center justify-between gap-3 text-sm bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                <span className="text-red-700 font-medium">{iss.message}</span>
                <button onClick={() => setStep(iss.step - 1)} className="text-xs font-bold text-blue-600 underline shrink-0">Fix in step {iss.step}</button>
              </li>
            ))}
          </ul>
        </Card>
      ) : (
        <Card>
          <p className="text-emerald-700 font-bold">✓ Everything looks good — ready to publish.</p>
        </Card>
      )}

      <Card title="Preview">
        <div className="flex items-start gap-4 flex-col sm:flex-row">
          {form.bannerUrl && <img src={form.bannerUrl} alt="" className="w-full sm:w-64 rounded-lg border border-gray-200" />}
          <div className="text-sm space-y-1.5 flex-1">
            <p className="font-black text-lg text-gray-900">{form.title || 'Untitled'}</p>
            <p className="text-gray-600">{form.shortDescription}</p>
            <p><strong>When:</strong> {formatISTRange(form.startAt, form.endAt) || '—'}</p>
            <p><strong>Where:</strong> {form.mode === 'online' ? `Online${form.platform ? ` (${form.platform})` : ''}` : form.mode === 'offline' ? form.venueName || '—' : `${form.venueName || '—'} + Online`}</p>
            <p><strong>Capacity:</strong> {form.capacity > 0 ? `${form.capacity} seats${form.waitlistEnabled ? ' + waitlist' : ''}` : 'Unlimited'}</p>
            <p><strong>Link:</strong> <span className="font-mono text-xs">{publicEventUrl(form.slug || slugify(form.title || 'event'))}</span></p>
            <button
              onClick={async () => { const saved = await persist(form, priv); window.open(publicEventUrl(saved.slug), '_blank'); }}
              className="text-blue-600 font-bold text-xs underline"
            >
              Open full page preview (only you can see drafts)
            </button>
          </div>
        </div>
      </Card>

      <div className="flex gap-3 justify-end">
        <Button variant="secondary" onClick={handleSave} disabled={saving}>{saving ? 'Saving…' : 'Save as Draft'}</Button>
        {form.status !== 'published' && (
          <Button variant="success" onClick={handlePublish} disabled={publishing || issues.length > 0}>
            {publishing ? 'Publishing…' : '🚀 Publish Event'}
          </Button>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6 pb-24">
      <div className="flex justify-between items-center flex-wrap gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{routeId ? 'Edit Event' : 'Create Event'}</h1>
          <p className="text-gray-600">{form.title || 'Your progress is saved as a draft at every step.'}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => navigate(form.status === 'draft' ? '/events/manage' : `/events/manage/view/${form.id}`)}>← Back</Button>
          <Button variant="secondary" onClick={handleSave} disabled={saving}>{saving ? 'Saving…' : 'Save Draft'}</Button>
        </div>
      </div>

      {/* Stepper */}
      <div className="flex gap-1 sm:gap-2 overflow-x-auto pb-1">
        {STEPS.map((label, i) => (
          <button
            key={label}
            onClick={() => goToStep(i)}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-colors ${
              i === step ? 'bg-blue-600 text-white shadow' : 'bg-white border border-gray-200 text-gray-600 hover:border-blue-300'
            }`}
          >
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] ${i === step ? 'bg-white/20' : 'bg-gray-100'}`}>{i + 1}</span>
            {label}
          </button>
        ))}
      </div>

      {step === 0 && stepBasics}
      {step === 1 && stepSchedule}
      {step === 2 && stepContent}
      {step === 3 && stepRegistration}
      {step === 4 && stepReview}

      {step < 4 && (
        <div className="flex justify-between">
          <Button variant="secondary" onClick={() => goToStep(Math.max(0, step - 1))} disabled={step === 0}>← Previous</Button>
          <Button onClick={() => goToStep(step + 1)}>Next: {STEPS[step + 1]} →</Button>
        </div>
      )}

      {/* Critical-change confirmation for published events */}
      <Modal isOpen={!!pendingCriticalSave} onClose={() => { setPendingCriticalSave(null); setSaving(false); }} title="You changed details registrants already have" size="md">
        <div className="space-y-4">
          <p className="text-sm text-gray-700">
            This event is <strong>already published</strong> and you changed: <strong>{pendingCriticalSave?.changed.join(', ')}</strong>.
            People who registered were told the old details.
          </p>
          <div className="flex flex-col gap-2">
            <Button variant="success" onClick={() => confirmCriticalSave(true)}>Save & email the update to all registrants</Button>
            <Button variant="secondary" onClick={() => confirmCriticalSave(false)}>Save without notifying</Button>
            <Button variant="outline" onClick={() => { setPendingCriticalSave(null); setSaving(false); }}>Keep editing</Button>
          </div>
        </div>
      </Modal>

      {/* Publish success */}
      <Modal isOpen={!!publishedUrl} onClose={() => { setPublishedUrl(null); navigate(`/events/manage/view/${form.id}`); }} title="🎉 Your event is live!" size="md">
        <div className="space-y-4">
          <p className="text-sm text-gray-700">Anyone with this link can now view the event and register — no login needed. Share it on WhatsApp, LinkedIn, or anywhere else:</p>
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 flex items-center gap-2">
            <span className="font-mono text-xs text-gray-800 break-all flex-1">{publishedUrl}</span>
            <CopyButton text={publishedUrl || ''} />
          </div>
          <div className="flex gap-2 flex-wrap">
            <a href={whatsAppShareUrl(shareText)} target="_blank" rel="noopener noreferrer" className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold">Share on WhatsApp</a>
            <a href={publishedUrl || '#'} target="_blank" rel="noopener noreferrer" className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 text-sm font-bold hover:bg-gray-50">Open public page</a>
          </div>
          <Button className="w-full" onClick={() => { setPublishedUrl(null); navigate(`/events/manage/view/${form.id}`); }}>Go to event dashboard →</Button>
        </div>
      </Modal>
    </div>
  );
};
