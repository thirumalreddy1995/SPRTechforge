// The event "control room": Overview (link, counters, actions),
// Registrations (search/filter/paginate/export/bulk), Check-in (event day),
// Recap (after the event). Convert-to-Candidate lives in the registration
// detail modal — it reuses the existing Candidates creation path.

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Card, Input, Modal, Select, SearchInput } from '../../components/Components';
import { useApp } from '../../context/AppContext';
import { uploadService } from '../../services/uploadService';
import * as utils from '../../utils';
import { EventPrivateDetails, EventRegistration, FollowUpStatus, RegistrationStatus, SprEvent } from '../types';
import {
  subscribeEvents, subscribeRegistrations, fetchPrivateDetails, updateEvent, updateRegistration,
  changeRegistrationStatus, deleteEvent,
} from '../services/eventsDb';
import { formatISTDateTime, formatISTRange, relativeToNow } from '../lib/datetime';
import { lifecycleOf, registrationWindow, seatsRemaining } from '../lib/validate';
import { CopyButton, EmptyState, StatusBadge, TextArea, TypeBadge, publicEventUrl, whatsAppShareUrl } from '../components/shared';
import { cancellationEmailHtml, isEventMailerConfigured, reminderEmailHtml, sendEventEmail } from '../lib/emails';

const PAGE_SIZE = 25;
const REMINDER_COOLDOWN_MS = 12 * 60 * 60 * 1000;

const REG_STATUS_STYLES: Record<RegistrationStatus, string> = {
  confirmed: 'bg-emerald-100 text-emerald-700',
  waitlisted: 'bg-amber-100 text-amber-700',
  attended: 'bg-blue-100 text-blue-700',
  no_show: 'bg-gray-200 text-gray-600',
  cancelled: 'bg-red-100 text-red-600',
};

const REG_STATUS_LABELS: Record<RegistrationStatus, string> = {
  confirmed: 'Confirmed', waitlisted: 'Waitlisted', attended: 'Attended', no_show: 'No-show', cancelled: 'Cancelled',
};

const FOLLOW_UP_LABELS: Record<FollowUpStatus, string> = {
  none: '— No follow-up yet', contacted: 'Contacted', interested: 'Interested', not_interested: 'Not interested', converted: 'Converted ✓',
};

const RegStatusBadge: React.FC<{ status: RegistrationStatus }> = ({ status }) => (
  <span className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-bold ${REG_STATUS_STYLES[status]}`}>{REG_STATUS_LABELS[status]}</span>
);

export const EventAdminDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, users, showToast, addCandidate } = useApp();

  const [events, setEvents] = useState<SprEvent[]>([]);
  const [allRegs, setAllRegs] = useState<EventRegistration[]>([]);
  const [priv, setPriv] = useState<EventPrivateDetails | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [tab, setTab] = useState<'overview' | 'registrations' | 'checkin' | 'recap'>('overview');

  // Registrations tab state
  const [q, setQ] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | RegistrationStatus>('all');
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [detailReg, setDetailReg] = useState<EventRegistration | null>(null);
  const [bulkBusy, setBulkBusy] = useState<string | null>(null);

  // Check-in tab
  const [checkinQ, setCheckinQ] = useState('');

  // Cancel modal
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelNotify, setCancelNotify] = useState(true);
  const [cancelBusy, setCancelBusy] = useState(false);

  // Permanent delete (master admin only)
  const [deleteBusy, setDeleteBusy] = useState(false);

  // Recap tab
  const [recapForm, setRecapForm] = useState<SprEvent['recap'] | null>(null);
  const [recapSaving, setRecapSaving] = useState(false);
  const [recapUploading, setRecapUploading] = useState(false);
  const recapPhotoRef = useRef<HTMLInputElement>(null);

  // Convert modal
  const [convertReg, setConvertReg] = useState<EventRegistration | null>(null);
  const [convertForm, setConvertForm] = useState({ batchId: '', agreedAmount: '', joinedDate: new Date().toISOString().split('T')[0] });
  const [convertBusy, setConvertBusy] = useState(false);

  useEffect(() => {
    const unsubE = subscribeEvents(items => { setEvents(items); setLoaded(true); });
    const unsubR = subscribeRegistrations(setAllRegs);
    return () => { unsubE(); unsubR(); };
  }, []);

  const ev = useMemo(() => events.find(e => e.id === id) || null, [events, id]);

  useEffect(() => {
    if (id) fetchPrivateDetails(id).then(setPriv).catch(() => setPriv(null));
  }, [id]);

  useEffect(() => {
    if (ev && !recapForm) setRecapForm(ev.recap || { recordingUrl: '', finalAttendeeCount: 0, photoUrls: [], notes: '' });
  }, [ev]);

  const regs = useMemo(
    () => allRegs.filter(r => r.eventId === id).sort((a, b) => b.registeredAt.localeCompare(a.registeredAt)),
    [allRegs, id],
  );

  // keep detail modal in sync with live data
  useEffect(() => {
    if (detailReg) {
      const fresh = regs.find(r => r.id === detailReg.id);
      if (fresh && fresh !== detailReg) setDetailReg(fresh);
    }
  }, [regs]);

  const counts = useMemo(() => ({
    confirmed: regs.filter(r => r.status === 'confirmed').length,
    waitlisted: regs.filter(r => r.status === 'waitlisted').length,
    attended: regs.filter(r => r.status === 'attended').length,
    noShow: regs.filter(r => r.status === 'no_show').length,
    cancelled: regs.filter(r => r.status === 'cancelled').length,
    total: regs.filter(r => r.status !== 'cancelled').length,
  }), [regs]);

  // NOTE: every hook must live above the early returns below (Rules of Hooks) —
  // a hook after a conditional return blanks the whole page when loading flips.
  const filteredRegs = useMemo(() => {
    const lower = q.trim().toLowerCase();
    return regs
      .filter(r => statusFilter === 'all' || r.status === statusFilter)
      .filter(r => !lower ||
        r.fullName.toLowerCase().includes(lower) ||
        r.email.includes(lower) ||
        r.mobile.includes(lower.replace(/\s/g, '')) ||
        r.registrationCode.toLowerCase().includes(lower));
  }, [regs, q, statusFilter]);

  if (!loaded) return <p className="text-center text-gray-500 py-16">Loading event…</p>;
  if (!ev) return <Card className="p-8 text-center"><p className="font-bold text-gray-700">Event not found.</p><Button className="mt-4 mx-auto" onClick={() => navigate('/events/manage')}>Back to Events</Button></Card>;

  const url = publicEventUrl(ev.slug);
  const shareText = `🎓 ${ev.title}\n📅 ${formatISTRange(ev.startAt, ev.endAt)}\n💯 Free registration — limited seats!\n👉 ${url}`;
  const seats = seatsRemaining(ev);
  const window_ = registrationWindow(ev);

  // ---------------- actions ----------------

  const toggleCloseRegistrations = async () => {
    try {
      await updateEvent(ev.id, { registrationClosedEarly: !ev.registrationClosedEarly, updatedAt: new Date().toISOString(), updatedBy: user?.id });
      showToast(ev.registrationClosedEarly ? 'Registrations reopened' : 'Registrations closed', 'success');
    } catch (e: any) { showToast(`Failed: ${e.message || e}`, 'error'); }
  };

  const unpublish = async () => {
    if (counts.total > 0) { showToast(`Cannot unpublish — ${counts.total} people already registered. Cancel the event instead.`, 'error'); return; }
    if (!window.confirm('Unpublish this event? The public page and registration link will stop working.')) return;
    try {
      await updateEvent(ev.id, { status: 'draft', updatedAt: new Date().toISOString(), updatedBy: user?.id });
      showToast('Event unpublished — it is a draft again', 'success');
    } catch (e: any) { showToast(`Failed: ${e.message || e}`, 'error'); }
  };

  const deletePermanently = async () => {
    if (!utils.isMasterUser(user)) { showToast('Only the master admin can delete events', 'error'); return; }
    const msg = `Permanently delete "${ev.title}"?\n\nThis erases the event, its public page and link, and all ${regs.length} registration record(s). Registrants are NOT notified — use "Cancel event…" if people should be told.\n\nThis cannot be undone.`;
    if (!window.confirm(msg)) return;
    setDeleteBusy(true);
    try {
      await deleteEvent(ev.id);
      showToast('Event deleted permanently', 'success');
      navigate('/events/manage');
    } catch (e: any) {
      showToast(`Delete failed: ${e.message || e}`, 'error');
      setDeleteBusy(false);
    }
  };

  const cancelEvent = async () => {
    setCancelBusy(true);
    try {
      await updateEvent(ev.id, {
        status: 'cancelled', cancelledAt: new Date().toISOString(), cancelReason: cancelReason.trim(),
        updatedAt: new Date().toISOString(), updatedBy: user?.id,
      });
      let sent = 0;
      const toNotify = regs.filter(r => r.status === 'confirmed' || r.status === 'waitlisted');
      if (cancelNotify && toNotify.length > 0) {
        if (!isEventMailerConfigured()) {
          showToast('Event cancelled, but email is not configured — registrants were NOT notified.', 'error');
        } else {
          for (const r of toNotify) {
            try {
              await sendEventEmail(ev, r.email, `Cancelled: ${ev.title}`, cancellationEmailHtml(ev, r, cancelReason.trim()));
              sent++;
              await new Promise(res => setTimeout(res, 400));
            } catch (e) { console.warn('Cancel notice failed for', r.email, e); }
          }
          showToast(`Event cancelled — ${sent}/${toNotify.length} registrants emailed`, 'success');
        }
      } else {
        showToast('Event cancelled', 'success');
      }
      setCancelOpen(false);
    } catch (e: any) {
      showToast(`Cancel failed: ${e.message || e}`, 'error');
    } finally {
      setCancelBusy(false);
    }
  };

  const setRegStatus = async (reg: EventRegistration, status: RegistrationStatus) => {
    try {
      await changeRegistrationStatus(reg, status);
      showToast(`${reg.fullName} → ${REG_STATUS_LABELS[status]}`, 'success');
    } catch (e: any) { showToast(`Failed: ${e.message || e}`, 'error'); }
  };

  const pageRegs = filteredRegs.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const pageCount = Math.max(1, Math.ceil(filteredRegs.length / PAGE_SIZE));

  const exportCsv = () => {
    if (filteredRegs.length === 0) { showToast('Nothing to export with the current filter', 'info'); return; }
    const rows = filteredRegs.map(r => ({
      Code: r.registrationCode,
      Name: r.fullName,
      Email: r.email,
      Mobile: r.mobile,
      City: r.city,
      Qualification: r.qualification,
      PassingYear: r.passingYear,
      CurrentStatus: r.currentStatus,
      HowHeard: r.howDidYouHear,
      ...Object.fromEntries(ev.customQuestions.map(cq => [cq.label || cq.id, r.customAnswers[cq.id] || ''])),
      Status: REG_STATUS_LABELS[r.status],
      FollowUp: FOLLOW_UP_LABELS[r.followUpStatus] || r.followUpStatus,
      RegisteredAt: formatISTDateTime(r.registeredAt),
      UTMSource: r.utm?.source || '',
      ConsentEmail: r.consentEmail?.given ? 'Yes' : 'No',
      ConsentWhatsApp: r.consentWhatsApp?.given ? 'Yes' : 'No',
      ConvertedToCandidate: r.convertedToCandidateId ? 'Yes' : 'No',
    }));
    utils.downloadCSV(rows, `${ev.slug}-registrations.csv`);
  };

  const bulkTargets = () => (selected.size > 0 ? filteredRegs.filter(r => selected.has(r.id)) : filteredRegs);

  const bulkMarkAttended = async () => {
    const targets = bulkTargets().filter(r => r.status === 'confirmed' || r.status === 'waitlisted' || r.status === 'no_show');
    if (targets.length === 0) { showToast('No eligible registrations selected', 'info'); return; }
    setBulkBusy('attend');
    let done = 0;
    for (const r of targets) { try { await changeRegistrationStatus(r, 'attended'); done++; } catch { /* keep going */ } }
    setBulkBusy(null);
    setSelected(new Set());
    showToast(`Marked ${done} as attended`, 'success');
  };

  const bulkSendReminder = async () => {
    if (!isEventMailerConfigured()) { showToast('Email is not configured — see Admin → Communication Settings', 'error'); return; }
    const now = Date.now();
    const targets = bulkTargets().filter(r =>
      (r.status === 'confirmed') &&
      !(r.remindersSent || []).some(x => now - new Date(x.at).getTime() < REMINDER_COOLDOWN_MS)
    );
    if (targets.length === 0) { showToast('Everyone eligible was already reminded in the last 12 hours', 'info'); return; }
    if (!window.confirm(`Send a reminder email to ${targets.length} confirmed registrant${targets.length === 1 ? '' : 's'}?`)) return;
    setBulkBusy('remind');
    let sent = 0;
    for (const r of targets) {
      try {
        await sendEventEmail(ev, r.email, `Reminder: ${ev.title} — ${formatISTRange(ev.startAt, ev.endAt)}`, reminderEmailHtml(ev, r, priv));
        await updateRegistration(r.id, { remindersSent: [...(r.remindersSent || []), { kind: 'reminder', at: new Date().toISOString() }] });
        sent++;
        await new Promise(res => setTimeout(res, 400));
      } catch (e) { console.warn('Reminder failed for', r.email, e); }
    }
    setBulkBusy(null);
    setSelected(new Set());
    showToast(`Reminder sent to ${sent}/${targets.length} registrants`, sent === targets.length ? 'success' : 'info');
  };

  const openConvert = (reg: EventRegistration) => {
    setConvertForm({ batchId: '', agreedAmount: '', joinedDate: new Date().toISOString().split('T')[0] });
    setConvertReg(reg);
  };

  const doConvert = async () => {
    if (!convertReg) return;
    const amount = parseFloat(convertForm.agreedAmount);
    if (!convertForm.batchId.trim()) { showToast('Enter a batch name', 'error'); return; }
    if (isNaN(amount) || amount < 0) { showToast('Enter the agreed course fee', 'error'); return; }
    setConvertBusy(true);
    try {
      const candidateId = utils.generateId();
      addCandidate({
        id: candidateId,
        name: convertReg.fullName,
        email: convertReg.email,
        phone: convertReg.mobile,
        batchId: convertForm.batchId.trim(),
        agreedAmount: amount,
        paidAmount: 0,
        status: 'Training',
        isActive: true,
        joinedDate: convertForm.joinedDate,
        address: convertReg.city,
        referredBy: `Event: ${convertReg.eventTitle}`,
        notes: `Converted from event registration ${convertReg.registrationCode} (${convertReg.eventTitle}).`,
      });
      await updateRegistration(convertReg.id, { convertedToCandidateId: candidateId, followUpStatus: 'converted' });
      showToast(`${convertReg.fullName} is now a candidate 🎉 — fees are tracked in Candidates & Finance`, 'success');
      setConvertReg(null);
      setDetailReg(null);
    } catch (e: any) {
      showToast(`Convert failed: ${e.message || e}`, 'error');
    } finally {
      setConvertBusy(false);
    }
  };

  const saveRecap = async () => {
    if (!recapForm) return;
    setRecapSaving(true);
    try {
      await updateEvent(ev.id, { recap: recapForm, updatedAt: new Date().toISOString(), updatedBy: user?.id });
      showToast('Recap saved — it now shows on the public past-events page', 'success');
    } catch (e: any) { showToast(`Save failed: ${e.message || e}`, 'error'); }
    finally { setRecapSaving(false); }
  };

  const handleRecapPhotos = async (files: File[]) => {
    if (!recapForm || files.length === 0) return;
    setRecapUploading(true);
    try {
      const urls: string[] = [];
      for (const f of files) {
        const up = await uploadService.uploadImage(`events/${ev.id}/recap-${Date.now()}-${f.name}`, f, { maxWidth: 1200 });
        urls.push(up.url);
      }
      const next = { ...recapForm, photoUrls: [...recapForm.photoUrls, ...urls] };
      setRecapForm(next);
      await updateEvent(ev.id, { recap: next });
      showToast(`${urls.length} photo${urls.length === 1 ? '' : 's'} added`, 'success');
    } catch (e: any) { showToast(`Upload failed: ${e.message || e}`, 'error'); }
    finally { setRecapUploading(false); if (recapPhotoRef.current) recapPhotoRef.current.value = ''; }
  };

  const checkinMatches = checkinQ.trim().length >= 2
    ? regs.filter(r => {
        const lower = checkinQ.trim().toLowerCase();
        return r.registrationCode.toLowerCase().includes(lower) || r.fullName.toLowerCase().includes(lower) || r.mobile.includes(lower.replace(/\s/g, '')) || r.email.includes(lower);
      }).slice(0, 8)
    : [];

  // ---------------- render ----------------

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start flex-wrap gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 truncate">{ev.title}</h1>
            <TypeBadge type={ev.type} />
            <StatusBadge ev={ev} />
          </div>
          <p className="text-gray-600 mt-1">{formatISTRange(ev.startAt, ev.endAt)} <span className="text-gray-400">({relativeToNow(ev.startAt)})</span></p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => navigate('/events/manage')}>← All events</Button>
          <Button onClick={() => navigate(`/events/manage/edit/${ev.id}`)}>Edit Event</Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 sm:gap-2 border-b border-gray-200 overflow-x-auto">
        {([
          ['overview', 'Overview'],
          ['registrations', `Registrations (${counts.total})`],
          ['checkin', 'Check-in'],
          ['recap', 'Recap'],
        ] as const).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-4 py-2.5 text-sm font-bold whitespace-nowrap border-b-2 -mb-px transition-colors ${tab === key ? 'border-blue-600 text-blue-700' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ---------- OVERVIEW ---------- */}
      {tab === 'overview' && (
        <div className="space-y-6">
          {ev.status === 'published' && (
            <Card title="📣 Share this registration link">
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 flex items-center gap-2 mb-3">
                <span className="font-mono text-xs text-gray-800 break-all flex-1">{url}</span>
                <CopyButton text={url} />
              </div>
              <div className="flex gap-2 flex-wrap">
                <a href={whatsAppShareUrl(shareText)} target="_blank" rel="noopener noreferrer" className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold">Share on WhatsApp</a>
                <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`} target="_blank" rel="noopener noreferrer" className="px-4 py-2 rounded-lg bg-sky-700 hover:bg-sky-800 text-white text-sm font-bold">Share on LinkedIn</a>
                <a href={url} target="_blank" rel="noopener noreferrer" className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 text-sm font-bold hover:bg-gray-50">Open public page</a>
              </div>
              {!window_.open && (
                <p className="text-xs font-bold text-amber-700 mt-3">
                  ⚠ Registrations are currently closed ({window_.reason === 'closed_early' ? 'closed early by you' : window_.reason === 'window_over' ? 'registration window is over' : 'event has ended'}).
                </p>
              )}
            </Card>
          )}

          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {[
              { label: 'Confirmed', value: counts.confirmed, tint: 'text-emerald-700 bg-emerald-50 border-emerald-100' },
              { label: 'Waitlisted', value: counts.waitlisted, tint: 'text-amber-700 bg-amber-50 border-amber-100' },
              { label: 'Attended', value: counts.attended, tint: 'text-blue-700 bg-blue-50 border-blue-100' },
              { label: 'No-show', value: counts.noShow, tint: 'text-gray-600 bg-gray-50 border-gray-200' },
              { label: seats === null ? 'Capacity' : 'Seats left', value: seats === null ? '∞' : seats, tint: 'text-purple-700 bg-purple-50 border-purple-100' },
            ].map(s => (
              <div key={s.label} className={`rounded-2xl border p-4 text-center ${s.tint}`}>
                <p className="text-3xl font-black">{s.value}</p>
                <p className="text-[10px] font-bold uppercase tracking-wide opacity-80 mt-1">{s.label}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card title="Event details" className="lg:col-span-2">
              {ev.bannerUrl && <img src={ev.bannerUrl} alt="" className="w-full max-w-lg rounded-lg border border-gray-200 mb-4" />}
              <div className="text-sm space-y-2 text-gray-700">
                <p><strong>Type:</strong> {ev.type.replace('_', ' ')}</p>
                <p><strong>When:</strong> {formatISTRange(ev.startAt, ev.endAt)}</p>
                <p><strong>Mode:</strong> {ev.mode === 'online' ? `Online${ev.platform ? ` (${ev.platform})` : ''}` : ev.mode === 'offline' ? 'In person' : 'Hybrid'}</p>
                {(ev.mode !== 'online') && ev.venueName && <p><strong>Venue:</strong> {ev.venueName}, {ev.venueAddress}</p>}
                {(ev.mode !== 'offline') && priv && (
                  <p><strong>Join link (private):</strong> {priv.joinUrl ? <span className="font-mono text-xs break-all">{priv.joinUrl}</span> : <span className="text-red-600">not set!</span>}
                    {priv.meetingId && <> · ID: {priv.meetingId}</>}{priv.passcode && <> · Passcode: {priv.passcode}</>}</p>
                )}
                <p><strong>Registration closes:</strong> {ev.registrationClosesAt ? formatISTDateTime(ev.registrationClosesAt) : 'When the event starts'}</p>
                <p><strong>Waitlist:</strong> {ev.waitlistEnabled ? 'On' : 'Off'}</p>
                {ev.publishedAt && <p className="text-xs text-gray-500"><strong>Published:</strong> {formatISTDateTime(ev.publishedAt)} by {users.find(u => u.id === ev.publishedBy)?.name || '—'}</p>}
                {ev.status === 'cancelled' && <p className="text-red-600 font-bold">Cancelled {ev.cancelledAt ? formatISTDateTime(ev.cancelledAt) : ''}{ev.cancelReason ? ` — ${ev.cancelReason}` : ''}</p>}
              </div>
            </Card>

            <Card title="Actions">
              <div className="flex flex-col gap-2">
                {ev.status === 'published' && lifecycleOf(ev) !== 'past' && (
                  <Button variant="secondary" onClick={toggleCloseRegistrations}>
                    {ev.registrationClosedEarly ? 'Reopen registrations' : 'Close registrations early'}
                  </Button>
                )}
                {ev.status === 'published' && counts.total === 0 && (
                  <Button variant="secondary" onClick={unpublish}>Unpublish (back to draft)</Button>
                )}
                {ev.status === 'published' && lifecycleOf(ev) !== 'past' && (
                  <Button variant="danger" onClick={() => setCancelOpen(true)}>Cancel event…</Button>
                )}
                {utils.isMasterUser(user) && (
                  <Button variant="danger" onClick={deletePermanently} disabled={deleteBusy}>
                    {deleteBusy ? 'Deleting…' : 'Delete permanently…'}
                  </Button>
                )}
                <p className="text-xs text-gray-500 mt-2">
                  Unpublish is only possible with zero registrations. Cancelling keeps all records and can notify everyone by email.
                  {utils.isMasterUser(user) && <> Permanent deletion (master only) erases the event and every registration record without notifying anyone.</>}
                </p>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* ---------- REGISTRATIONS ---------- */}
      {tab === 'registrations' && (
        <Card className="p-0">
          <div className="p-4 border-b border-gray-100 flex flex-col lg:flex-row gap-3 lg:items-center">
            <div className="flex-1">
              <SearchInput value={q} onChange={e => { setQ(e.target.value); setPage(0); }} onClear={() => setQ('')} placeholder="Search name, email, mobile, or code…" />
            </div>
            <Select value={statusFilter} onChange={e => { setStatusFilter(e.target.value as any); setPage(0); }} className="!mb-0 lg:w-40">
              <option value="all">All statuses</option>
              {Object.entries(REG_STATUS_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </Select>
            <div className="flex gap-2 flex-wrap">
              <Button variant="secondary" onClick={bulkSendReminder} disabled={!!bulkBusy}>{bulkBusy === 'remind' ? 'Sending…' : `📨 Remind ${selected.size > 0 ? `(${selected.size})` : 'all confirmed'}`}</Button>
              <Button variant="secondary" onClick={bulkMarkAttended} disabled={!!bulkBusy}>{bulkBusy === 'attend' ? 'Marking…' : `✓ Mark attended ${selected.size > 0 ? `(${selected.size})` : ''}`}</Button>
              <Button variant="secondary" onClick={exportCsv}>⬇ Export CSV</Button>
            </div>
          </div>

          {regs.length === 0 ? (
            <EmptyState icon="🪑" title="No registrations yet" sub="Share the registration link — new registrations appear here instantly." />
          ) : filteredRegs.length === 0 ? (
            <EmptyState icon="🔍" title="Nothing matches your search" />
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-[11px] uppercase tracking-wide text-gray-400 border-b border-gray-100">
                      <th className="px-4 py-2 w-8">
                        <input
                          type="checkbox"
                          className="w-4 h-4"
                          checked={pageRegs.length > 0 && pageRegs.every(r => selected.has(r.id))}
                          onChange={e => {
                            const next = new Set(selected);
                            pageRegs.forEach(r => e.target.checked ? next.add(r.id) : next.delete(r.id));
                            setSelected(next);
                          }}
                        />
                      </th>
                      <th className="px-2 py-2">Code</th>
                      <th className="px-2 py-2">Name</th>
                      <th className="px-2 py-2 hidden md:table-cell">Contact</th>
                      <th className="px-2 py-2 hidden lg:table-cell">Registered</th>
                      <th className="px-2 py-2">Status</th>
                      <th className="px-2 py-2 hidden sm:table-cell">Follow-up</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pageRegs.map(r => (
                      <tr key={r.id} onClick={() => setDetailReg(r)} className="border-b border-gray-50 hover:bg-blue-50/40 cursor-pointer">
                        <td className="px-4 py-2.5" onClick={e => e.stopPropagation()}>
                          <input
                            type="checkbox" className="w-4 h-4"
                            checked={selected.has(r.id)}
                            onChange={e => { const next = new Set(selected); e.target.checked ? next.add(r.id) : next.delete(r.id); setSelected(next); }}
                          />
                        </td>
                        <td className="px-2 py-2.5 font-mono text-xs">{r.registrationCode}</td>
                        <td className="px-2 py-2.5 font-semibold text-gray-900">{r.fullName}{r.convertedToCandidateId && <span title="Converted to candidate"> 🎓</span>}</td>
                        <td className="px-2 py-2.5 hidden md:table-cell text-gray-600 text-xs">{r.email}<br />{r.mobile}</td>
                        <td className="px-2 py-2.5 hidden lg:table-cell text-gray-500 text-xs">{formatISTDateTime(r.registeredAt)}</td>
                        <td className="px-2 py-2.5"><RegStatusBadge status={r.status} /></td>
                        <td className="px-2 py-2.5 hidden sm:table-cell text-xs text-gray-600">{FOLLOW_UP_LABELS[r.followUpStatus] || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {pageCount > 1 && (
                <div className="p-3 flex items-center justify-between border-t border-gray-100 text-sm">
                  <Button variant="secondary" onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}>← Prev</Button>
                  <span className="text-gray-500">Page {page + 1} of {pageCount} · {filteredRegs.length} registrations</span>
                  <Button variant="secondary" onClick={() => setPage(p => Math.min(pageCount - 1, p + 1))} disabled={page >= pageCount - 1}>Next →</Button>
                </div>
              )}
            </>
          )}
        </Card>
      )}

      {/* ---------- CHECK-IN ---------- */}
      {tab === 'checkin' && (
        <Card title="Event-day check-in">
          <p className="text-sm text-gray-600 mb-4">Ask for the registration code (from their confirmation email), or search by name / mobile — then mark attended.</p>
          <SearchInput value={checkinQ} onChange={e => setCheckinQ(e.target.value)} onClear={() => setCheckinQ('')} placeholder="Type code, name, or mobile…" containerClassName="max-w-xl" />
          <div className="mt-4 space-y-2 max-w-xl">
            {checkinQ.trim().length < 2 ? (
              <p className="text-sm text-gray-400 italic">Start typing to find a registrant…</p>
            ) : checkinMatches.length === 0 ? (
              <p className="text-sm font-bold text-red-600">No match — they may not be registered. You can register them on the public page.</p>
            ) : checkinMatches.map(r => (
              <div key={r.id} className={`flex items-center justify-between gap-3 border rounded-xl px-4 py-3 ${r.status === 'attended' ? 'border-emerald-200 bg-emerald-50' : 'border-gray-200 bg-white'}`}>
                <div>
                  <p className="font-bold text-gray-900">{r.fullName} <span className="font-mono text-xs text-gray-500">({r.registrationCode})</span></p>
                  <p className="text-xs text-gray-500">{r.mobile} · <RegStatusBadge status={r.status} /></p>
                </div>
                {r.status === 'attended' ? (
                  <span className="text-emerald-700 font-black">✓ Checked in</span>
                ) : (
                  <Button variant="success" onClick={() => setRegStatus(r, 'attended')}>Mark attended</Button>
                )}
              </div>
            ))}
          </div>
          <div className="mt-6 flex gap-6 text-sm text-gray-600">
            <span><strong className="text-blue-700">{counts.attended}</strong> attended</span>
            <span><strong>{counts.confirmed}</strong> confirmed not yet in</span>
          </div>
        </Card>
      )}

      {/* ---------- RECAP ---------- */}
      {tab === 'recap' && recapForm && (
        <Card title="After the event — recap (shows on the public past-events page)">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Recording link (YouTube, Drive, …)" value={recapForm.recordingUrl} onChange={e => setRecapForm({ ...recapForm, recordingUrl: e.target.value })} placeholder="https://youtu.be/…" />
            <Input label="Final attendee count (social proof)" type="number" min={0} value={String(recapForm.finalAttendeeCount)} onChange={e => setRecapForm({ ...recapForm, finalAttendeeCount: Math.max(0, parseInt(e.target.value, 10) || 0) })} />
          </div>
          <TextArea label="Recap notes" rows={3} value={recapForm.notes} onChange={e => setRecapForm({ ...recapForm, notes: e.target.value })} placeholder="80+ students joined live. Recording and slides below…" />
          <div className="mb-4">
            <p className="text-sm font-medium text-gray-700 mb-2">Photos</p>
            <div className="flex gap-2 flex-wrap mb-2">
              {recapForm.photoUrls.map((u, i) => (
                <div key={i} className="relative group">
                  <img src={u} alt="" className="w-24 h-16 object-cover rounded-lg border border-gray-200" />
                  <button
                    onClick={() => setRecapForm({ ...recapForm, photoUrls: recapForm.photoUrls.filter((_, j) => j !== i) })}
                    className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full w-5 h-5 text-xs font-bold opacity-0 group-hover:opacity-100"
                  >✕</button>
                </div>
              ))}
            </div>
            <input ref={recapPhotoRef} type="file" accept="image/*" multiple className="hidden" onChange={e => handleRecapPhotos(Array.from(e.target.files || []))} />
            <Button variant="secondary" onClick={() => recapPhotoRef.current?.click()} disabled={recapUploading}>{recapUploading ? 'Uploading…' : '+ Add photos'}</Button>
          </div>
          <Button onClick={saveRecap} disabled={recapSaving}>{recapSaving ? 'Saving…' : 'Save Recap'}</Button>
        </Card>
      )}

      {/* ---------- Registration detail modal ---------- */}
      <Modal isOpen={!!detailReg} onClose={() => setDetailReg(null)} title={detailReg ? `${detailReg.fullName} · ${detailReg.registrationCode}` : ''} size="lg">
        {detailReg && (
          <div className="space-y-4 text-sm">
            <div className="flex items-center gap-2 flex-wrap">
              <RegStatusBadge status={detailReg.status} />
              {detailReg.convertedToCandidateId && <span className="text-xs font-bold text-purple-700 bg-purple-50 border border-purple-100 rounded-full px-2 py-0.5">🎓 Candidate</span>}
              <span className="text-xs text-gray-400 ml-auto">Registered {formatISTDateTime(detailReg.registeredAt)}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 text-gray-700">
              <p><strong>Email:</strong> {detailReg.email}</p>
              <p><strong>Mobile:</strong> {detailReg.mobile}</p>
              {detailReg.city && <p><strong>City:</strong> {detailReg.city}</p>}
              {detailReg.qualification && <p><strong>Qualification:</strong> {detailReg.qualification}</p>}
              {detailReg.passingYear && <p><strong>Passing year:</strong> {detailReg.passingYear}</p>}
              {detailReg.currentStatus && <p><strong>Current status:</strong> {detailReg.currentStatus.replace('_', ' ')}</p>}
              {detailReg.howDidYouHear && <p><strong>Heard about us via:</strong> {detailReg.howDidYouHear}</p>}
              {detailReg.utm?.source && <p><strong>Came from:</strong> {detailReg.utm.source}{detailReg.utm.campaign ? ` / ${detailReg.utm.campaign}` : ''}</p>}
            </div>

            {ev.customQuestions.length > 0 && (
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-3">
                <p className="text-xs font-bold text-gray-500 uppercase mb-2">Custom answers</p>
                {ev.customQuestions.map(cq => (
                  <p key={cq.id} className="text-gray-700"><strong>{cq.label}:</strong> {detailReg.customAnswers[cq.id] || <span className="text-gray-400 italic">not answered</span>}</p>
                ))}
              </div>
            )}

            <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs text-gray-600">
              <p className="font-bold text-gray-500 uppercase mb-1.5">Consents (DPDP)</p>
              <p>Terms: {detailReg.consentTerms?.given ? `✓ ${formatISTDateTime(detailReg.consentTerms.at)}` : '✗ not given'}</p>
              <p>Email updates: {detailReg.consentEmail?.given ? `✓ ${formatISTDateTime(detailReg.consentEmail.at)}` : '✗ not given'}</p>
              <p>WhatsApp updates: {detailReg.consentWhatsApp?.given ? `✓ ${formatISTDateTime(detailReg.consentWhatsApp.at)}` : '✗ not given'}</p>
              {(detailReg.remindersSent || []).length > 0 && (
                <p className="mt-1.5">Reminders sent: {(detailReg.remindersSent || []).map(x => formatISTDateTime(x.at)).join('; ')}</p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Follow-up status"
                value={detailReg.followUpStatus}
                onChange={async e => {
                  const v = e.target.value as FollowUpStatus;
                  try { await updateRegistration(detailReg.id, { followUpStatus: v }); } catch (err: any) { showToast(`Failed: ${err.message || err}`, 'error'); }
                }}
              >
                {Object.entries(FOLLOW_UP_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </Select>
              <Select
                label="Registration status"
                value={detailReg.status}
                onChange={e => setRegStatus(detailReg, e.target.value as RegistrationStatus)}
              >
                {Object.entries(REG_STATUS_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </Select>
            </div>

            <TextArea
              label="Admin notes (internal only)"
              rows={2}
              defaultValue={detailReg.adminNotes}
              onBlur={async e => {
                if (e.target.value !== detailReg.adminNotes) {
                  try { await updateRegistration(detailReg.id, { adminNotes: e.target.value }); showToast('Note saved', 'success'); } catch (err: any) { showToast(`Failed: ${err.message || err}`, 'error'); }
                }
              }}
            />

            <div className="flex gap-2 justify-end border-t border-gray-100 pt-4">
              {detailReg.convertedToCandidateId ? (
                <Button variant="secondary" onClick={() => navigate('/candidates')}>View in Candidates →</Button>
              ) : (
                <Button variant="success" onClick={() => openConvert(detailReg)}>🎓 Convert to Candidate</Button>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* ---------- Convert modal ---------- */}
      <Modal isOpen={!!convertReg} onClose={() => setConvertReg(null)} title={`Convert ${convertReg?.fullName || ''} to a paying candidate`} size="md">
        <div className="space-y-3">
          <p className="text-sm text-gray-600">
            This creates a record in <strong>Candidates</strong> (pre-filled from their registration). Course fees and payments are then tracked there and in Finance, like any other candidate.
          </p>
          <Input label="Batch" value={convertForm.batchId} onChange={e => setConvertForm({ ...convertForm, batchId: e.target.value })} placeholder={`e.g. ${new Date().toLocaleString('en-IN', { month: 'short' })}-${new Date().getFullYear()} Weekday Batch`} />
          <Input label="Agreed course fee (₹)" type="number" min={0} value={convertForm.agreedAmount} onChange={e => setConvertForm({ ...convertForm, agreedAmount: e.target.value })} placeholder="e.g. 35000" />
          <Input label="Joining date" type="date" value={convertForm.joinedDate} onChange={e => setConvertForm({ ...convertForm, joinedDate: e.target.value })} />
          <div className="flex gap-2 justify-end pt-2">
            <Button variant="secondary" onClick={() => setConvertReg(null)}>Cancel</Button>
            <Button variant="success" onClick={doConvert} disabled={convertBusy}>{convertBusy ? 'Converting…' : 'Create Candidate'}</Button>
          </div>
        </div>
      </Modal>

      {/* ---------- Cancel modal ---------- */}
      <Modal isOpen={cancelOpen} onClose={() => setCancelOpen(false)} title="Cancel this event?" size="md">
        <div className="space-y-3">
          <p className="text-sm text-gray-700">
            <strong>{counts.confirmed + counts.waitlisted}</strong> people are registered/waitlisted. The event record and all registrations are kept — the public page will show it as cancelled.
          </p>
          <TextArea label="Reason (included in the email)" rows={2} value={cancelReason} onChange={e => setCancelReason(e.target.value)} placeholder="e.g. Trainer unavailable — new date coming soon" />
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" className="w-4 h-4" checked={cancelNotify} onChange={e => setCancelNotify(e.target.checked)} />
            Email everyone who registered
          </label>
          <div className="flex gap-2 justify-end pt-2">
            <Button variant="secondary" onClick={() => setCancelOpen(false)}>Keep event</Button>
            <Button variant="danger" onClick={cancelEvent} disabled={cancelBusy}>{cancelBusy ? 'Cancelling…' : 'Cancel event'}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
