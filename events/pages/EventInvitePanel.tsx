// "Invite" tab of the event control room: upload a contact list (Excel/CSV),
// edit + preview the invitation email, send it through the outbox, and watch
// who registered. Sends run from this tab; every send is written to the
// invite record, so a closed tab or a failure is resumable ("pending" only).

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Button, Card, Input } from '../../components/Components';
import { useApp } from '../../context/AppContext';
import * as utils from '../../utils';
import { EventInvite, EventInviteTemplate, EventRegistration, InviteStatus, SprEvent } from '../types';
// (SprEvent is also used for the typed template-field update in saveTemplate)
import { addInvites, deleteInvites, subscribeInvites, updateEvent, updateInvite } from '../services/eventsDb';
import { followupEmailHtml, inviteEmailHtml, isEventMailerConfigured, sendEventEmail } from '../lib/emails';
import {
  INVITE_PLACEHOLDERS, defaultFollowupTemplate, defaultInviteTemplate, followupLinkUrl, followupWhatsAppText, inviteLinkUrl, inviteVars, inviteWhatsAppText,
  parseContactRows, planInvites, registeredInviteIds, renderInviteText, validLinkOverride,
} from '../lib/invites';

/** What the tab sends: the registration invitation, or the post-event follow-up survey. */
type MailMode = 'invite' | 'followup';
import { formatISTDateTime } from '../lib/datetime';
import { CopyButton, TextArea } from '../components/shared';

const MAX_FILE_BYTES = 20 * 1024 * 1024;
const SEND_CONCURRENCY = 3;
const ROWS_SHOWN = 300;

type Filter = 'all' | InviteStatus | 'registered';

interface RunState { running: boolean; total: number; done: number; sent: number; failed: number; }
const IDLE: RunState = { running: false, total: 0, done: 0, sent: 0, failed: 0 };

const STATUS_STYLE: Record<InviteStatus, string> = {
  pending: 'bg-gray-100 text-gray-600',
  sent: 'bg-blue-100 text-blue-700',
  failed: 'bg-red-100 text-red-600',
  no_email: 'bg-amber-100 text-amber-700',
};
const STATUS_LABEL: Record<InviteStatus, string> = { pending: 'Not sent yet', sent: 'Invited', failed: 'Failed', no_email: 'Mobile only' };

export const EventInvitePanel: React.FC<{ ev: SprEvent; regs: EventRegistration[] }> = ({ ev, regs }) => {
  const { user, showToast } = useApp();
  const fileRef = useRef<HTMLInputElement>(null);
  const stopRef = useRef(false);

  const [invites, setInvites] = useState<EventInvite[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [lastImport, setLastImport] = useState<string>('');

  const [mode, setMode] = useState<MailMode>('invite');
  const savedTemplate = (m: MailMode): EventInviteTemplate => (m === 'invite' ? ev.inviteTemplate || defaultInviteTemplate() : ev.followupTemplate || defaultFollowupTemplate());
  const [tpl, setTpl] = useState<EventInviteTemplate>(() => savedTemplate('invite'));
  const [tplDirty, setTplDirty] = useState(false);
  const [tplSaving, setTplSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  const [testEmail, setTestEmail] = useState(user?.email || (user?.username?.includes('@') ? user.username : ''));
  const [testBusy, setTestBusy] = useState(false);

  const [filter, setFilter] = useState<Filter>('all');
  const [q, setQ] = useState('');
  const [retryFailed, setRetryFailed] = useState(true);
  const [resendSent, setResendSent] = useState(false);
  const [run, setRun] = useState<RunState>(IDLE);
  const [log, setLog] = useState<string[]>([]);
  const [clearing, setClearing] = useState(false);

  useEffect(() => subscribeInvites(ev.id, items => { setInvites(items); setLoaded(true); }, () => setLoaded(true)), [ev.id]);
  useEffect(() => { if (!tplDirty) setTpl(savedTemplate(mode)); }, [ev.inviteTemplate, ev.followupTemplate, mode]); // eslint-disable-line react-hooks/exhaustive-deps
  const switchMode = (m: MailMode) => {
    if (m === mode) return;
    if (tplDirty && !window.confirm('You have unsaved wording. Discard it and switch?')) return;
    setTplDirty(false); setMode(m); setTpl(savedTemplate(m));
  };

  const registered = useMemo(() => registeredInviteIds(invites, regs.filter(r => r.eventId === ev.id)), [invites, regs, ev.id]);
  const counts = useMemo(() => ({
    total: invites.length,
    pending: invites.filter(i => i.status === 'pending').length,
    sent: invites.filter(i => i.status === 'sent').length,
    failed: invites.filter(i => i.status === 'failed').length,
    mobileOnly: invites.filter(i => i.status === 'no_email').length,
    registered: registered.size,
  }), [invites, registered]);

  const sorted = useMemo(() => [...invites].sort((a, b) => b.createdAt.localeCompare(a.createdAt) || a.email.localeCompare(b.email)), [invites]);
  const visible = useMemo(() => {
    const lower = q.trim().toLowerCase();
    return sorted
      .filter(i => filter === 'all' || (filter === 'registered' ? registered.has(i.id) : i.status === filter))
      .filter(i => !lower || i.name.toLowerCase().includes(lower) || i.email.includes(lower) || i.mobile.includes(lower.replace(/\s/g, '')));
  }, [sorted, filter, q, registered]);

  const targets = useMemo(() => invites.filter(i => i.email && (
    i.status === 'pending' || (retryFailed && i.status === 'failed') || (resendSent && i.status === 'sent')
  )), [invites, retryFailed, resendSent]);

  const mailerReady = isEventMailerConfigured();
  const sampleInvite = invites.find(i => i.name && i.email) || invites.find(i => i.email);
  const sample = { name: sampleInvite?.name || 'Priya Sharma', email: sampleInvite?.email || 'priya@example.com' };
  const previewVars = { ...inviteVars(ev, sample, tpl.linkOverride), next_session: tpl.nextSessionLabel || '' };
  const previewSubject = renderInviteText(tpl.subject, previewVars, false);
  const emailHtmlFor = (person: { name?: string; email?: string }) => (mode === 'invite' ? inviteEmailHtml(ev, person, tpl) : followupEmailHtml(ev, person, tpl));
  const previewHtml = useMemo(() => emailHtmlFor(sample), [ev, tpl, mode, sample.name, sample.email]); // eslint-disable-line react-hooks/exhaustive-deps
  // An uploaded (data:) banner is referenced as cid:… in the real mail; show the picture itself in the preview.
  const previewShown = useMemo(() => previewHtml.split('cid:event-banner').join(ev.bannerUrl || ''), [previewHtml, ev.bannerUrl]);

  const setT = (patch: Partial<EventInviteTemplate>) => { setTpl(prev => ({ ...prev, ...patch })); setTplDirty(true); };
  const appendLog = (line: string) => setLog(prev => [...prev.slice(-199), `${new Date().toLocaleTimeString()} ${line}`]);

  // ---------------- list ----------------

  const downloadSample = () => utils.downloadCSV([
    { Name: 'Priya Sharma', Email: 'priya@example.com', Mobile: '9876543210' },
    { Name: 'Rahul Verma', Email: 'rahul@example.com', Mobile: '+91 98765 43211' },
    { Name: 'Mobile only row', Email: '', Mobile: '9876543212' },
  ], 'invite-list-sample.csv');

  const handleFile = async (file: File) => {
    if (file.size > MAX_FILE_BYTES) { showToast('File exceeds the 20 MB limit', 'error'); return; }
    const lower = file.name.toLowerCase();
    if (!/\.(xlsx|xls|csv|txt)$/.test(lower)) { showToast('Use an .xlsx, .xls or .csv file', 'error'); return; }
    setParsing(true);
    try {
      const xlsx: any = await import('xlsx');
      const wb = xlsx.read(await file.arrayBuffer(), { type: 'array' });
      const rows: any[][] = [];
      wb.SheetNames.forEach((name: string) => {
        const sheetRows = xlsx.utils.sheet_to_json(wb.Sheets[name], { header: 1, blankrows: false, defval: '' }) as any[][];
        rows.push(...sheetRows);
      });
      const parsed = parseContactRows(rows);
      const plan = planInvites(parsed.contacts, invites, { eventId: ev.id, userId: user?.id || '', source: file.name });
      if (plan.toAdd.length) await addInvites(plan.toAdd);
      const parts = [
        `${plan.toAdd.length} added`,
        plan.mobileOnly ? `${plan.mobileOnly} with a mobile number only (cannot be emailed)` : '',
        plan.alreadyListed ? `${plan.alreadyListed} already on the list` : '',
        plan.duplicatesInFile ? `${plan.duplicatesInFile} repeated in the file` : '',
        parsed.unusable ? `${parsed.unusable} row(s) had no usable email or mobile` : '',
      ].filter(Boolean);
      const summary = `${file.name}: ${parts.join(' · ')}`;
      setLastImport(summary);
      showToast(plan.toAdd.length ? `${plan.toAdd.length} contact(s) added to the invite list` : 'Nothing new to add from this file', plan.toAdd.length ? 'success' : 'info');
    } catch (e: any) {
      showToast(`Could not read the file: ${e.message || e}`, 'error');
    } finally {
      setParsing(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const removeOne = async (inv: EventInvite) => {
    try { await deleteInvites([inv.id]); } catch (e: any) { showToast(`Remove failed: ${e.message || e}`, 'error'); }
  };

  const clearList = async () => {
    if (!window.confirm(`Remove all ${invites.length} people from this event's invite list? Registrations are not affected.`)) return;
    setClearing(true);
    try { await deleteInvites(invites.map(i => i.id)); showToast('Invite list cleared', 'success'); }
    catch (e: any) { showToast(`Clear failed: ${e.message || e}`, 'error'); }
    finally { setClearing(false); }
  };

  const exportList = () => {
    if (visible.length === 0) { showToast('Nothing to export with the current filter', 'info'); return; }
    utils.downloadCSV(visible.map(i => ({
      Name: i.name, Email: i.email, Mobile: i.mobile,
      Status: STATUS_LABEL[i.status], Registered: registered.has(i.id) ? 'Yes' : 'No',
      SentCount: i.sentCount, LastSent: i.sentAt ? formatISTDateTime(i.sentAt) : '', Error: i.lastError || '', Source: i.source,
    })), `${ev.slug}-invites.csv`);
  };

  // ---------------- template ----------------

  const saveTemplate = async (): Promise<boolean> => {
    if (!tpl.subject.trim()) { showToast('Enter an email subject', 'error'); return false; }
    if (!tpl.message.trim()) { showToast('Enter the message', 'error'); return false; }
    setTplSaving(true);
    try {
      await updateEvent(ev.id, { [mode === 'invite' ? 'inviteTemplate' : 'followupTemplate']: tpl, updatedAt: new Date().toISOString(), updatedBy: user?.id } as Partial<SprEvent>);
      setTplDirty(false);
      return true;
    } catch (e: any) { showToast(`Save failed: ${e.message || e}`, 'error'); return false; }
    finally { setTplSaving(false); }
  };

  const resetTemplate = () => { if (window.confirm('Replace your wording with the built-in default?')) { setTpl(mode === 'invite' ? defaultInviteTemplate() : defaultFollowupTemplate()); setTplDirty(true); } };

  const sendTest = async () => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(testEmail.trim())) { showToast('Enter a valid email address for the test', 'error'); return; }
    if (!mailerReady) { showToast('Email is not configured — see Admin → Communication Settings', 'error'); return; }
    setTestBusy(true);
    try {
      await sendEventEmail(ev, testEmail.trim(), `[TEST] ${previewSubject}`, emailHtmlFor({ name: sample.name, email: testEmail.trim() }));
      showToast(`Test ${mode === 'invite' ? 'invitation' : 'follow-up'} queued for ${testEmail.trim()} — allow a minute`, 'success');
    } catch (e: any) { showToast(`Test send failed: ${e.message || e}`, 'error'); }
    finally { setTestBusy(false); }
  };

  // ---------------- send ----------------

  const sendInvites = async () => {
    if (!mailerReady) { showToast('Email is not configured — see Admin → Communication Settings', 'error'); return; }
    if (mode === 'invite' && ev.status !== 'published') { showToast('Publish the event first — the registration link only works for a published event', 'error'); return; }
    const list = targets;
    if (list.length === 0) { showToast('Nobody to send to — upload a list or tick "resend"', 'info'); return; }
    if (tplDirty && !(await saveTemplate())) return;
    if (!window.confirm(`Send the ${mode === 'invite' ? 'invitation' : 'follow-up survey'} email to ${list.length} people now?`)) return;

    stopRef.current = false;
    setLog([]);
    setRun({ running: true, total: list.length, done: 0, sent: 0, failed: 0 });
    appendLog(`Sending to ${list.length} people through the outbox (delivered at ~24/min).`);
    let idx = 0, sent = 0, failed = 0, done = 0;
    const worker = async () => {
      while (!stopRef.current) {
        const i = idx++;
        if (i >= list.length) return;
        const inv = list[i];
        const vars = { ...inviteVars(ev, inv, tpl.linkOverride), next_session: tpl.nextSessionLabel || '' };
        try {
          await sendEventEmail(ev, inv.email, renderInviteText(tpl.subject, vars, false), emailHtmlFor(inv));
          await updateInvite(inv.id, { status: 'sent', sentAt: new Date().toISOString(), sentCount: (inv.sentCount || 0) + 1, lastError: '' });
          sent++;
        } catch (e: any) {
          failed++;
          const msg = String(e?.message || e).slice(0, 200);
          appendLog(`FAILED ${inv.email}: ${msg}`);
          await updateInvite(inv.id, { status: 'failed', lastError: msg }).catch(() => { /* keep going */ });
        }
        done++;
        setRun({ running: true, total: list.length, done, sent, failed });
      }
    };
    await Promise.all(Array.from({ length: Math.min(SEND_CONCURRENCY, list.length) }, worker));
    setRun({ running: false, total: list.length, done, sent, failed });
    appendLog(stopRef.current ? `Stopped — ${sent} queued, ${failed} failed, ${list.length - done} not attempted (still pending).` : `Finished — ${sent} queued, ${failed} failed.`);
    showToast(`${sent} ${mode === 'invite' ? 'invitation(s)' : 'follow-up email(s)'} queued${failed ? `, ${failed} failed` : ''}`, failed ? 'info' : 'success');
  };

  const pct = run.total ? Math.round(run.done * 100 / run.total) : 0;
  const link = mode === 'invite' ? inviteLinkUrl(ev, tpl.linkOverride) : followupLinkUrl(ev, '', '', tpl.linkOverride);
  const overrideTyped = (tpl.linkOverride || '').trim();
  const overrideBad = !!overrideTyped && !validLinkOverride(overrideTyped);

  return (
    <div className="space-y-6">
      {!mailerReady && (
        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded text-amber-800 text-sm">
          Email is not configured in this environment, so nothing can be sent. You can still build the list and edit the email. See Admin → Communication Settings.
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
        {[
          { label: 'On the list', value: counts.total, tint: 'text-gray-700 bg-gray-50 border-gray-200' },
          { label: 'Not sent yet', value: counts.pending, tint: 'text-amber-700 bg-amber-50 border-amber-100' },
          { label: 'Invited', value: counts.sent, tint: 'text-blue-700 bg-blue-50 border-blue-100' },
          { label: 'Failed', value: counts.failed, tint: 'text-red-700 bg-red-50 border-red-100' },
          { label: 'Mobile only', value: counts.mobileOnly, tint: 'text-gray-600 bg-gray-50 border-gray-200' },
          { label: 'Registered', value: counts.registered, tint: 'text-emerald-700 bg-emerald-50 border-emerald-100' },
        ].map(s => (
          <div key={s.label} className={`rounded-2xl border p-3 text-center ${s.tint}`}>
            <p className="text-2xl font-black">{s.value}</p>
            <p className="text-[10px] font-bold uppercase tracking-wide opacity-80 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* 1. Upload */}
      <Card title="1 · Upload your contact list (Excel or CSV)">
        <p className="text-sm text-gray-600 mb-3">
          Any sheet with a <strong>Name</strong>, <strong>Email</strong> and <strong>Mobile</strong> column works — column names are detected automatically, and rows without a header row are read too. People already on the list are skipped, so you can upload the same file again safely. Mobile-only rows are kept for WhatsApp but cannot be emailed.
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv,.txt" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
          <Button onClick={() => fileRef.current?.click()} disabled={parsing || run.running}>{parsing ? 'Reading file…' : '⬆ Upload Excel / CSV'}</Button>
          <Button variant="secondary" onClick={downloadSample}>Download sample CSV</Button>
          {invites.length > 0 && <Button variant="secondary" onClick={exportList}>Export list (CSV)</Button>}
          {invites.length > 0 && <Button variant="danger" onClick={clearList} disabled={clearing || run.running}>{clearing ? 'Clearing…' : 'Clear list'}</Button>}
        </div>
        {lastImport && <p className="text-xs text-emerald-700 font-semibold mt-3">✓ {lastImport}</p>}
      </Card>

      {/* 2. Email */}
      <Card title={mode === 'invite' ? '2 · The invitation email' : '2 · The follow-up survey email'} action={
        <div className="flex gap-2">
          <Button variant="secondary" onClick={resetTemplate}>Reset to default</Button>
          <Button onClick={saveTemplate} disabled={tplSaving || !tplDirty}>{tplSaving ? 'Saving…' : tplDirty ? 'Save wording' : 'Saved ✓'}</Button>
        </div>
      }>
        <div className="mb-5 flex flex-wrap items-center gap-3">
          <p className="text-sm font-bold text-gray-800">What to send:</p>
          <div className="inline-flex rounded-xl border border-gray-300 overflow-hidden">
            <button type="button" onClick={() => switchMode('invite')} className={`px-4 py-2 text-sm font-bold ${mode === 'invite' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}>Invitation to register</button>
            <button type="button" onClick={() => switchMode('followup')} className={`px-4 py-2 text-sm font-bold border-l border-gray-300 ${mode === 'followup' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}>Follow-up survey (after the event)</button>
          </div>
          <p className="text-xs text-gray-500">{mode === 'invite' ? 'Asks people to register. Every link carries ?ref=email.' : 'Asks "Did you join?" with Yes / No buttons that open the survey page with the person\'s answer and email pre-filled. Answers appear on the Feedback tab.'}</p>
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div className="space-y-4">
            <Input label="Subject line" value={tpl.subject} onChange={e => setT({ subject: e.target.value })} />
            <Input label="Headline (big text under the banner)" value={tpl.headline} onChange={e => setT({ headline: e.target.value })} />
            <TextArea label="Message" rows={10} value={tpl.message} onChange={e => setT({ message: e.target.value })} hint="Plain text. A blank line starts a new paragraph; **double stars** make text bold. The date, place, speaker and the big button are added automatically below the message." />
            {mode === 'invite' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="Button text" value={tpl.buttonLabel} onChange={e => setT({ buttonLabel: e.target.value })} />
                <div className="flex flex-col justify-end gap-2 text-sm text-gray-700 pb-1">
                  <label className="flex items-center gap-2"><input type="checkbox" className="w-4 h-4" checked={tpl.includeHighlights} onChange={e => setT({ includeHighlights: e.target.checked })} /> Include "What you will learn" points ({ev.whatYouWillLearn.filter(Boolean).length})</label>
                  <label className="flex items-center gap-2"><input type="checkbox" className="w-4 h-4" checked={tpl.includeAgenda} onChange={e => setT({ includeAgenda: e.target.checked })} /> Include the agenda ({ev.agenda.length} items)</label>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label='"Yes" button text (the "No" button is fixed)' value={tpl.buttonLabel} onChange={e => setT({ buttonLabel: e.target.value })} />
                <Input label="Next session (shown in the email and on the survey page)" value={tpl.nextSessionLabel || ''} onChange={e => setT({ nextSessionLabel: e.target.value })} placeholder="e.g. Saturday 10 Oct, 7:00 PM IST" />
              </div>
            )}
            <TextArea label="Closing line (after the button)" rows={2} value={tpl.closing} onChange={e => setT({ closing: e.target.value })} />
            <div>
              <Input label={mode === 'invite' ? 'Registration link to use (optional)' : 'Survey page link to use (optional)'} value={tpl.linkOverride || ''} onChange={e => setT({ linkOverride: e.target.value })} placeholder={mode === 'invite' ? `Leave empty to use this site's page for the event` : `Leave empty to use this site's survey page`} />
              <p className={`text-xs mt-1 ${overrideBad ? 'text-red-600 font-bold' : 'text-gray-500'}`}>
                {overrideBad
                  ? 'That is not a full link — it must start with https:// (this site\'s own page will be used until it is fixed).'
                  : mode === 'invite'
                    ? <>Paste the <strong>live</strong> event link here when you run the campaign from the QA site, so registrations land on the live site. The button and every link in the email will use: <span className="font-mono break-all">{link}</span></>
                    : <>Leave empty unless the survey page lives on another site. The buttons will open: <span className="font-mono break-all">{link}</span> (plus the person's answer and email).</>}
              </p>
            </div>
            <details className="text-xs text-gray-600">
              <summary className="cursor-pointer font-bold text-gray-700">Placeholders you can use</summary>
              <table className="mt-2 w-full">
                <tbody>{INVITE_PLACEHOLDERS.map(([k, d]) => <tr key={k} className="border-t border-gray-100"><td className="py-1 pr-3 font-mono whitespace-nowrap">{k}</td><td className="py-1">{d}</td></tr>)}</tbody>
              </table>
            </details>
            <div className="border-t border-gray-100 pt-4">
              <p className="text-sm font-bold text-gray-800 mb-1">Send a test to yourself first</p>
              <div className="flex flex-wrap items-end gap-2">
                <div className="flex-1 min-w-[220px]"><Input type="email" value={testEmail} onChange={e => setTestEmail(e.target.value)} placeholder="you@example.com" /></div>
                <Button variant="secondary" onClick={sendTest} disabled={testBusy || !mailerReady}>{testBusy ? 'Sending…' : 'Send test'}</Button>
              </div>
            </div>
            <div className="border-t border-gray-100 pt-4">
              <p className="text-sm font-bold text-gray-800 mb-1">{mode === 'invite' ? 'Same invitation for WhatsApp' : 'Same survey request for WhatsApp'}</p>
              <p className="text-xs text-gray-500 mb-2">{mode === 'invite' ? <>For the mobile-only rows, or a broadcast list. The link carries the <span className="font-mono">email</span> source code, so those registrations are counted with this campaign.</> : 'For the community group or mobile-only rows. The page asks for the email, so answers still match registrations.'}</p>
              <div className="flex gap-2 flex-wrap items-center">
                <CopyButton text={mode === 'invite' ? inviteWhatsAppText(ev, tpl) : followupWhatsAppText(ev, tpl)} label="Copy WhatsApp message" />
                <span className="font-mono text-xs text-gray-600 break-all">{link}</span>
              </div>
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-bold text-gray-800">Preview <span className="font-normal text-gray-500">(as {sample.name} would see it)</span></p>
              <button className="text-xs text-blue-600 underline" onClick={() => setShowPreview(v => !v)}>{showPreview ? 'Hide' : 'Show'}</button>
            </div>
            {showPreview && (
              <div className="border border-gray-200 rounded-xl bg-gray-50 p-3">
                <p className="text-xs text-gray-500 mb-2"><strong className="text-gray-700">Subject:</strong> {previewSubject}</p>
                <div className="bg-white rounded-lg border border-gray-200 p-4 overflow-x-auto" dangerouslySetInnerHTML={{ __html: previewShown }} />
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* 3. Send */}
      <Card title="3 · Send">
        <div className="flex flex-wrap gap-4 items-center text-sm text-gray-700 mb-4">
          <label className="flex items-center gap-2"><input type="checkbox" className="w-4 h-4" checked={retryFailed} onChange={e => setRetryFailed(e.target.checked)} /> Include failed ({counts.failed})</label>
          <label className="flex items-center gap-2"><input type="checkbox" className="w-4 h-4" checked={resendSent} onChange={e => setResendSent(e.target.checked)} /> Also resend to people already invited ({counts.sent})</label>
        </div>
        <div className="flex flex-wrap gap-3 items-center">
          <Button variant="success" onClick={sendInvites} disabled={run.running || targets.length === 0 || !mailerReady}>
            {run.running ? `Sending… ${run.done}/${run.total}` : `Send ${mode === 'invite' ? 'invitation' : 'follow-up survey'} to ${targets.length} ${targets.length === 1 ? 'person' : 'people'}`}
          </Button>
          {run.running && <Button variant="danger" onClick={() => { stopRef.current = true; }}>Stop</Button>}
          <span className="text-xs text-gray-500">Emails go into the outbox and are delivered at about 24 per minute, so 500 people take roughly 20 minutes to reach. Keep this tab open until the button says finished.</span>
        </div>
        {(run.running || run.done > 0) && (
          <div className="mt-4">
            <div className="flex justify-between text-xs text-gray-600 mb-1"><span>{run.running ? 'Sending…' : 'Finished'}</span><span>{run.done}/{run.total} · {run.sent} queued · {run.failed} failed</span></div>
            <div className="w-full bg-gray-200 rounded-full h-3"><div className="bg-emerald-500 h-3 rounded-full transition-all" style={{ width: `${pct}%` }} /></div>
          </div>
        )}
        {log.length > 0 && (
          <div className="mt-3 max-h-40 overflow-y-auto bg-gray-900 text-gray-200 text-xs font-mono rounded-lg p-3 space-y-0.5">
            {log.map((l, i) => <div key={i} className={l.includes('FAILED') ? 'text-red-400' : ''}>{l}</div>)}
          </div>
        )}
      </Card>

      {/* List */}
      <Card className="p-0">
        <div className="p-4 border-b border-gray-100 flex flex-wrap gap-3 items-center">
          <p className="font-bold text-gray-800 mr-auto">People on the list <span className="text-gray-400 font-normal">({visible.length}{visible.length !== invites.length ? ` of ${invites.length}` : ''})</span></p>
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search name, email, mobile…" className="px-3 py-2 border border-gray-300 rounded-lg text-sm w-56" />
          <select value={filter} onChange={e => setFilter(e.target.value as Filter)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
            <option value="all">All</option>
            <option value="pending">Not sent yet</option>
            <option value="sent">Invited</option>
            <option value="failed">Failed</option>
            <option value="no_email">Mobile only</option>
            <option value="registered">Registered ✓</option>
          </select>
        </div>
        {!loaded ? <p className="p-6 text-sm text-gray-500">Loading…</p>
        : invites.length === 0 ? <p className="p-6 text-sm text-gray-500 italic">No one yet — upload an Excel or CSV file above.</p>
        : visible.length === 0 ? <p className="p-6 text-sm text-gray-500 italic">Nobody matches this filter.</p>
        : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="text-left text-xs uppercase tracking-wider text-gray-500 border-b border-gray-200"><th className="py-2 px-4">Name</th><th className="py-2 px-4">Email</th><th className="py-2 px-4">Mobile</th><th className="py-2 px-4">Status</th><th className="py-2 px-4">Last sent</th><th className="py-2 px-4"></th></tr></thead>
              <tbody>
                {visible.slice(0, ROWS_SHOWN).map(i => (
                  <tr key={i.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-2 px-4 font-medium text-gray-900">{i.name || <span className="text-gray-400">—</span>}</td>
                    <td className="py-2 px-4 text-gray-700">{i.email || <span className="text-gray-400">—</span>}</td>
                    <td className="py-2 px-4 text-gray-700">{i.mobile || <span className="text-gray-400">—</span>}</td>
                    <td className="py-2 px-4">
                      {registered.has(i.id)
                        ? <span className="inline-block px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-700">Registered ✓</span>
                        : <span className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-bold ${STATUS_STYLE[i.status]}`} title={i.lastError || ''}>{STATUS_LABEL[i.status]}{i.status === 'sent' && i.sentCount > 1 ? ` ×${i.sentCount}` : ''}</span>}
                    </td>
                    <td className="py-2 px-4 text-xs text-gray-500">{i.sentAt ? formatISTDateTime(i.sentAt) : '—'}</td>
                    <td className="py-2 px-4 text-right"><button onClick={() => removeOne(i)} disabled={run.running} className="text-xs text-gray-400 hover:text-red-600" title="Remove from list">✕</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {visible.length > ROWS_SHOWN && <p className="p-3 text-xs text-gray-500">Showing the first {ROWS_SHOWN}. Use the search or export the full list.</p>}
          </div>
        )}
      </Card>
    </div>
  );
};
