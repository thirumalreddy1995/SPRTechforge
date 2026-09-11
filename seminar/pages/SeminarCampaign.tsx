import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Button, Card, Input } from '../../components/Components';
import { useApp } from '../../context/AppContext';
import { useSeminar } from '../context/SeminarContext';
import { SeminarCandidate, SeminarSettings, SubjectVariant } from '../types';
import { buildTemplateVars, pickSubjectVariant, renderTemplate } from '../lib/template';
import { isSeminarMailerConfigured, sendSeminarEmail, composeEmailHtml } from '../services/seminarMailer';
import { generateSeminarId } from '../lib/token';

// Campaign sender. Sending happens from this browser tab through the free
// Gmail bridge (~100/day), so the run is deliberately resumable: every send is
// written to seminar_campaign_log and the candidate's emailStatus, and
// "Resume" simply targets pending-only again. Keep the tab open during a run.

interface RunState {
  running: boolean;
  total: number;
  done: number;
  sent: number;
  failed: number;
  current: string;
}

const IDLE: RunState = { running: false, total: 0, done: 0, sent: 0, failed: 0, current: '' };

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

const isToday = (iso: string) => {
  const d = new Date(iso);
  const now = new Date();
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
};

const TextArea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string }> = ({ label, className = '', ...props }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <textarea
      className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm font-mono ${className}`}
      {...props}
    />
  </div>
);

export const SeminarCampaign: React.FC = () => {
  const { user, showToast } = useApp();
  const { candidates, registrations, campaignLog, settings, saveSettings, updateCandidate, addCampaignLog, isLoading } = useSeminar();

  const [form, setForm] = useState<SeminarSettings>(settings);
  const [isSavingTpl, setIsSavingTpl] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const [dryRun, setDryRun] = useState(false);
  const [retryFailed, setRetryFailed] = useState(false);
  const [run, setRun] = useState<RunState>(IDLE);
  const [runLog, setRunLog] = useState<string[]>([]);
  const stopRef = useRef(false);

  useEffect(() => { setForm(settings); }, [settings]);
  useEffect(() => { if (!testEmail && user?.username?.includes('@')) setTestEmail(user.username); }, [user]);

  const set = (patch: Partial<SeminarSettings>) => setForm(prev => ({ ...prev, ...patch }));

  const mailerReady = isSeminarMailerConfigured();

  // --- Targeting ---------------------------------------------------------

  const emailable = useMemo(() => candidates.filter(c => c.email), [candidates]);
  const pendingInvites = useMemo(
    () => emailable.filter(c => c.emailStatus === 'pending' || (retryFailed && c.emailStatus === 'failed')),
    [emailable, retryFailed],
  );

  const remindedIds = useMemo(
    () => new Set(campaignLog.filter(l => l.channel === 'email_reminder' && !l.error).map(l => l.candidateId)),
    [campaignLog],
  );
  const registeredCandidates = useMemo(() => {
    const byId = new Map(candidates.map(c => [c.id, c]));
    return registrations
      .filter(r => r.status === 'registered')
      .map(r => byId.get(r.candidateId))
      .filter((c): c is SeminarCandidate => !!c && !!c.email);
  }, [registrations, candidates]);
  const pendingReminders = useMemo(
    () => registeredCandidates.filter(c => !remindedIds.has(c.id)),
    [registeredCandidates, remindedIds],
  );

  const sentToday = useMemo(
    () => campaignLog.filter(l => !l.error && l.channel !== 'email_test' && isToday(l.sentAt)).length,
    [campaignLog],
  );
  const remainingToday = Math.max(0, (form.dailySendLimit || 90) - sentToday);

  // --- Preview -----------------------------------------------------------

  const sampleCandidate: SeminarCandidate = emailable[0] || {
    id: 'sample', fullName: 'Priya Sharma', email: 'priya@example.com', phone: '+919876543210',
    city: 'Hyderabad', degreeGroup: 'B.Tech-BE', inviteToken: 'SAMPLE-TOKEN',
    emailStatus: 'pending', createdAt: new Date().toISOString(),
  };
  const previewVars = buildTemplateVars(sampleCandidate, form);
  const previewSubjectA = renderTemplate(form.emailSubjectA, previewVars, false);
  const previewSubjectB = renderTemplate(form.emailSubjectB, previewVars, false);
  const previewHtml = composeEmailHtml(renderTemplate(form.emailBodyHtml, previewVars, true), form.bannerUrl, form.title, false);

  // --- Actions -----------------------------------------------------------

  const saveTemplates = async () => {
    setIsSavingTpl(true);
    try {
      await saveSettings(form);
      showToast('Templates saved', 'success');
    } catch (e: any) {
      showToast(`Save failed: ${e.message || e}`, 'error');
    } finally {
      setIsSavingTpl(false);
    }
  };

  const appendLog = (line: string) =>
    setRunLog(prev => [...prev.slice(-199), `${new Date().toLocaleTimeString()} ${line}`]);

  const sendTest = async () => {
    if (!testEmail.includes('@')) { showToast('Enter a valid test email', 'error'); return; }
    setIsTesting(true);
    try {
      const subject = `[TEST] ${renderTemplate(form.emailSubjectA, previewVars, false)}`;
      const html = renderTemplate(form.emailBodyHtml, previewVars, true);
      await sendSeminarEmail({ to: testEmail, subject, html, bannerUrl: form.bannerUrl, bannerAlt: form.title, bannerInline: form.bannerInline, fromName: form.fromName });
      await addCampaignLog({ id: generateSeminarId('semlog'), candidateId: '', channel: 'email_test', sentAt: new Date().toISOString(), error: null });
      showToast(`Test email sent to ${testEmail}`, 'success');
    } catch (e: any) {
      showToast(`Test send failed: ${e.message || e}`, 'error');
    } finally {
      setIsTesting(false);
    }
  };

  const runBatch = async (kind: 'invite' | 'reminder') => {
    const targets = kind === 'invite' ? pendingInvites : pendingReminders;
    const cap = dryRun ? targets.length : Math.min(targets.length, remainingToday);
    if (cap === 0) {
      showToast(targets.length === 0 ? 'Nothing to send — no matching candidates' : 'Daily send limit reached — resume tomorrow', 'info');
      return;
    }
    // Persist any unsaved template edits so what you see is what gets sent.
    await saveSettings(form);

    stopRef.current = false;
    setRunLog([]);
    setRun({ running: true, total: cap, done: 0, sent: 0, failed: 0, current: '' });
    appendLog(`${dryRun ? 'DRY RUN — ' : ''}Starting ${kind} batch: ${cap} of ${targets.length} target(s), limit ${form.dailySendLimit}/day, delay ${form.sendDelayMs}ms`);

    let abCounter = candidates.filter(c => c.subjectVariant).length; // continue rotation across runs
    let sent = 0, failed = 0;

    for (let i = 0; i < cap; i++) {
      if (stopRef.current) { appendLog('Stopped by user. Progress is saved — Resume targets the rest.'); break; }
      const c = targets[i];
      setRun(prev => ({ ...prev, current: c.fullName }));
      const vars = buildTemplateVars(c, form);

      let subject: string;
      let bodyTpl: string;
      let variant: SubjectVariant | undefined;
      if (kind === 'invite') {
        variant = c.subjectVariant || pickSubjectVariant(abCounter++);
        subject = renderTemplate(variant === 'A' ? form.emailSubjectA : form.emailSubjectB, vars, false);
        bodyTpl = form.emailBodyHtml;
      } else {
        subject = renderTemplate(form.reminderSubject, vars, false);
        bodyTpl = form.reminderBodyHtml;
      }
      const html = renderTemplate(bodyTpl, vars, true);

      if (dryRun) {
        appendLog(`DRY: would send to ${c.email} (${c.fullName})${variant ? ` [subject ${variant}]` : ''} — "${subject}"`);
        sent++;
      } else {
        try {
          await sendSeminarEmail({ to: c.email, subject, html, bannerUrl: form.bannerUrl, bannerAlt: form.title, bannerInline: form.bannerInline, fromName: form.fromName });
          await addCampaignLog({
            id: generateSeminarId('semlog'), candidateId: c.id,
            channel: kind === 'invite' ? 'email_invite' : 'email_reminder',
            subjectVariant: variant, sentAt: new Date().toISOString(), error: null,
          });
          if (kind === 'invite') await updateCandidate(c.id, { emailStatus: 'sent', subjectVariant: variant });
          sent++;
          appendLog(`Sent to ${c.email}${variant ? ` [subject ${variant}]` : ''}`);
        } catch (e: any) {
          failed++;
          const msg = String(e?.message || e);
          appendLog(`FAILED for ${c.email}: ${msg}`);
          // Failures are logged but never stop the run.
          try {
            await addCampaignLog({
              id: generateSeminarId('semlog'), candidateId: c.id,
              channel: kind === 'invite' ? 'email_invite' : 'email_reminder',
              subjectVariant: variant, sentAt: new Date().toISOString(), error: msg,
            });
            if (kind === 'invite') await updateCandidate(c.id, { emailStatus: 'failed', subjectVariant: variant });
          } catch { /* logging must never kill the run */ }
        }
      }

      setRun(prev => ({ ...prev, done: i + 1, sent, failed }));
      if (!dryRun && i < cap - 1) await sleep(form.sendDelayMs || 2000);
    }

    setRun(prev => ({ ...prev, running: false, current: '' }));
    appendLog(`Batch finished: ${sent} ${dryRun ? 'simulated' : 'sent'}, ${failed} failed.`);
    showToast(`Batch finished: ${sent} ${dryRun ? 'simulated' : 'sent'}, ${failed} failed`, failed ? 'info' : 'success');
  };

  if (isLoading) return <div className="text-gray-500 p-8 text-center">Loading campaign data…</div>;

  const pct = run.total > 0 ? Math.round((run.done / run.total) * 100) : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Seminar &middot; Campaign</h1>
        <p className="text-gray-600">Edit templates, preview, test on yourself, then batch-send. Placeholders: {'{name} {city} {link} {date} {time} {venue} {trainer}'}</p>
      </div>

      {!mailerReady && (
        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded text-amber-800 text-sm">
          Email bridge is not configured in this build (VITE_EMAIL_ENDPOINT / VITE_EMAIL_SHARED_SECRET) — no email can send.
          Run "Test Email Connection" on Seminar &rarr; Settings for the exact reason, and see SETUP-EMAIL.md.
          You can still edit templates and use Dry Run.
        </div>
      )}

      {/* Status strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="text-center py-4"><p className="text-xs text-gray-500 uppercase font-bold">Pending Invites</p><p className="text-2xl font-bold text-gray-900">{pendingInvites.length}</p></Card>
        <Card className="text-center py-4"><p className="text-xs text-gray-500 uppercase font-bold">Sent Today</p><p className="text-2xl font-bold text-gray-900">{sentToday}</p></Card>
        <Card className="text-center py-4"><p className="text-xs text-gray-500 uppercase font-bold">Remaining Today</p><p className="text-2xl font-bold text-gray-900">{remainingToday}</p></Card>
        <Card className="text-center py-4"><p className="text-xs text-gray-500 uppercase font-bold">Reminders Due</p><p className="text-2xl font-bold text-gray-900">{pendingReminders.length}</p></Card>
      </div>

      <Card title="Invitation Templates" action={<Button onClick={saveTemplates} disabled={isSavingTpl}>{isSavingTpl ? 'Saving…' : 'Save Templates'}</Button>}>
        <div className="space-y-4">
          <Input label="Subject A (50% of sends)" value={form.emailSubjectA} onChange={e => set({ emailSubjectA: e.target.value })} />
          <Input label="Subject B (50% of sends)" value={form.emailSubjectB} onChange={e => set({ emailSubjectB: e.target.value })} />
          <TextArea label="Invitation Body (HTML — the banner is added on top automatically)" rows={14} value={form.emailBodyHtml} onChange={e => set({ emailBodyHtml: e.target.value })} />
          <p className="text-xs text-amber-700 bg-amber-50 rounded p-2">
            Fill in every <strong>[BRACKETED]</strong> fact (trainer experience, institute name, tools covered) before sending —
            they are deliberately not invented for you.
          </p>
        </div>
      </Card>

      <Card title="Rendered Preview (sample candidate)">
        <div className="text-sm text-gray-600 mb-3 space-y-1">
          <p><span className="font-bold text-gray-800">Subject A:</span> {previewSubjectA}</p>
          <p><span className="font-bold text-gray-800">Subject B:</span> {previewSubjectB}</p>
        </div>
        <div className="border border-gray-200 rounded-lg p-4 bg-white overflow-x-auto">
          {/* Admin-authored template rendered with escaped candidate data — same HTML the email will contain. */}
          <div dangerouslySetInnerHTML={{ __html: previewHtml }} />
        </div>
      </Card>

      <Card title="Send">
        <div className="flex flex-wrap items-end gap-3 mb-4">
          <div className="flex-1 min-w-[220px]">
            <Input label="Send test email to" type="email" value={testEmail} onChange={e => setTestEmail(e.target.value)} placeholder="you@example.com" />
          </div>
          <Button variant="secondary" onClick={sendTest} disabled={isTesting || !mailerReady || run.running}>
            {isTesting ? 'Sending…' : 'Send Test to Myself'}
          </Button>
        </div>

        <div className="flex flex-wrap gap-4 items-center mb-4 text-sm text-gray-700">
          <label className="flex items-center gap-2"><input type="checkbox" className="w-4 h-4" checked={dryRun} onChange={e => setDryRun(e.target.checked)} /> Dry run (simulate, send nothing)</label>
          <label className="flex items-center gap-2"><input type="checkbox" className="w-4 h-4" checked={retryFailed} onChange={e => setRetryFailed(e.target.checked)} /> Include previously failed</label>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button variant="success" onClick={() => runBatch('invite')} disabled={run.running || (!mailerReady && !dryRun)}>
            {pendingInvites.length > 0 && candidates.some(c => c.emailStatus === 'sent')
              ? `Resume Sending (${pendingInvites.length} pending)`
              : `Send Invites (${pendingInvites.length})`}
          </Button>
          <Button variant="secondary" onClick={() => runBatch('reminder')} disabled={run.running || (!mailerReady && !dryRun)}>
            Send Reminders to Registered ({pendingReminders.length})
          </Button>
          {run.running && <Button variant="danger" onClick={() => { stopRef.current = true; }}>Stop</Button>}
        </div>

        {(run.running || run.done > 0) && (
          <div className="mt-5">
            <div className="flex justify-between text-xs text-gray-600 mb-1">
              <span>{run.running ? `Sending… ${run.current}` : 'Finished'}</span>
              <span>{run.done}/{run.total} &middot; {run.sent} ok &middot; {run.failed} failed</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div className="bg-emerald-500 h-3 rounded-full transition-all" style={{ width: `${pct}%` }} />
            </div>
          </div>
        )}

        {runLog.length > 0 && (
          <div className="mt-4 h-48 overflow-y-auto bg-gray-900 text-gray-200 text-xs font-mono rounded-lg p-3 space-y-0.5">
            {runLog.map((l, i) => <div key={i} className={l.includes('FAILED') ? 'text-red-400' : ''}>{l}</div>)}
          </div>
        )}

        <p className="text-xs text-gray-500 mt-4">
          Keep this tab open while a batch runs. Every send is logged, so closing the tab or hitting the daily
          limit is safe — "Resume Sending" continues with pending candidates only. Subjects rotate A/B 50/50 and the
          variant used is stored per candidate.
        </p>
      </Card>

      <Card title="Reminder Templates (sent to registered candidates the day before)">
        <div className="space-y-4">
          <Input label="Reminder Subject" value={form.reminderSubject} onChange={e => set({ reminderSubject: e.target.value })} />
          <TextArea label="Reminder Body (HTML)" rows={8} value={form.reminderBodyHtml} onChange={e => set({ reminderBodyHtml: e.target.value })} />
        </div>
      </Card>
    </div>
  );
};
