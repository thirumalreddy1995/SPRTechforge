import React, { useMemo, useState } from 'react';
import { Button, Card, ConfirmationModal, Modal, Pagination, SearchInput, Select } from '../../components/Components';
import { useApp } from '../../context/AppContext';
import { isMasterUser } from '../../utils';
import { useSeminar } from '../context/SeminarContext';
import { SeminarCandidate } from '../types';
import { buildTemplateVars, renderTemplate } from '../lib/template';

// Candidates table with per-candidate WhatsApp / SMS deep links and a
// WhatsApp CSV export. Deliberately NO bulk WhatsApp automation: unofficial
// bulk senders get numbers banned. wa.me links + broadcast lists from your
// own phone are free and ToS-safe (attach the banner image manually there).

const PAGE_SIZE = 50;

export const SeminarCandidates: React.FC = () => {
  const { user, showToast } = useApp();
  const { candidates, registrations, questions, campaignLog, settings, deleteCandidate, updateCandidate, isLoading } = useSeminar();
  const [search, setSearch] = useState('');
  const [groupFilter, setGroupFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [detail, setDetail] = useState<SeminarCandidate | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<SeminarCandidate | null>(null);
  const [blast, setBlast] = useState<{ channel: 'whatsapp' | 'sms'; queue: SeminarCandidate[]; index: number; sent: number } | null>(null);

  const isMaster = isMasterUser(user);

  // One-by-one blast mode: iterates candidates with a phone number that
  // haven't been contacted on this channel yet, opening the pre-filled
  // WhatsApp/SMS composer for each. Progress is stored on the candidate
  // (whatsappStatus / smsStatus), so stopping and resuming later is safe.
  const startBlast = (channel: 'whatsapp' | 'sms') => {
    const queue = filtered.filter(c => c.phone && (channel === 'whatsapp' ? c.whatsappStatus !== 'sent' : c.smsStatus !== 'sent'));
    if (queue.length === 0) {
      showToast('No one left to contact on this channel in the current filter', 'info');
      return;
    }
    setBlast({ channel, queue, index: 0, sent: 0 });
  };

  const blastSendCurrent = async () => {
    if (!blast) return;
    const c = blast.queue[blast.index];
    if (!c) return;
    const link = blast.channel === 'whatsapp' ? waLink(c) : smsLink(c);
    if (link) {
      if (blast.channel === 'whatsapp') window.open(link, '_blank', 'noopener');
      else window.location.href = link;
    }
    try {
      await updateCandidate(c.id, blast.channel === 'whatsapp' ? { whatsappStatus: 'sent' } : { smsStatus: 'sent' });
    } catch { /* status tracking is best-effort */ }
    setBlast(prev => (prev ? { ...prev, index: prev.index + 1, sent: prev.sent + 1 } : prev));
  };

  const blastSkip = () => setBlast(prev => (prev ? { ...prev, index: prev.index + 1 } : prev));

  const regByCandidate = useMemo(() => {
    const m = new Map<string, string>();
    registrations.forEach(r => m.set(r.candidateId, r.status === 'registered' ? r.preferredMode : 'declined'));
    return m;
  }, [registrations]);

  const handleDelete = async (c: SeminarCandidate) => {
    try {
      await deleteCandidate(c.id);
      if (detail?.id === c.id) setDetail(null);
      showToast(`${c.fullName} deleted (registration, questions and send history included)`, 'success');
    } catch (e: any) {
      showToast(`Delete failed: ${e.message || e}`, 'error');
    }
  };

  const groups = useMemo(() => Array.from(new Set(candidates.map(c => c.degreeGroup))).sort(), [candidates]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return candidates
      .filter(c => groupFilter === 'all' || c.degreeGroup === groupFilter)
      .filter(c => {
        if (statusFilter === 'all') return true;
        if (statusFilter === 'registered') return regByCandidate.has(c.id) && regByCandidate.get(c.id) !== 'declined';
        if (statusFilter === 'declined') return regByCandidate.get(c.id) === 'declined';
        return c.emailStatus === statusFilter;
      })
      .filter(c => !q || c.fullName.toLowerCase().includes(q) || c.email.includes(q) || c.phone.includes(q))
      .sort((a, b) => a.fullName.localeCompare(b.fullName));
  }, [candidates, search, groupFilter, statusFilter, regByCandidate]);

  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const waLink = (c: (typeof candidates)[number]): string | null => {
    if (!c.phone) return null;
    const vars = buildTemplateVars(c, settings);
    const msg = renderTemplate(settings.whatsappTemplate, vars, false);
    return `https://wa.me/${c.phone.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`;
  };

  const smsLink = (c: (typeof candidates)[number]): string | null => {
    if (!c.phone) return null;
    const vars = buildTemplateVars(c, settings);
    const msg = renderTemplate(settings.whatsappTemplate, vars, false);
    return `sms:${c.phone}?body=${encodeURIComponent(msg)}`;
  };

  const copyInviteLink = async (c: (typeof candidates)[number]) => {
    const vars = buildTemplateVars(c, settings);
    try {
      await navigator.clipboard.writeText(vars.link);
      showToast('Invite link copied', 'success');
    } catch {
      showToast(vars.link, 'info');
    }
  };

  const exportWhatsAppCsv = () => {
    const rows = filtered.filter(c => c.phone);
    if (rows.length === 0) { showToast('No candidates with a phone number in the current filter', 'error'); return; }
    const esc = (v: string) => `"${String(v).replace(/"/g, '""')}"`;
    const lines = ['Name,Phone,Message'];
    rows.forEach(c => {
      const vars = buildTemplateVars(c, settings);
      const msg = renderTemplate(settings.whatsappTemplate, vars, false);
      lines.push([esc(c.fullName), esc(c.phone), esc(msg)].join(','));
    });
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `seminar-whatsapp-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast(`Exported ${rows.length} contacts`, 'success');
  };

  if (isLoading) return <div className="text-gray-500 p-8 text-center">Loading candidates…</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Seminar &middot; Candidates</h1>
          <p className="text-gray-600">{candidates.length} imported &middot; {filtered.length} matching filters</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="success" onClick={() => startBlast('whatsapp')}>WhatsApp One-by-One</Button>
          <Button variant="secondary" onClick={() => startBlast('sms')}>SMS One-by-One</Button>
          <Button variant="secondary" onClick={exportWhatsAppCsv}>Export WhatsApp CSV</Button>
        </div>
      </div>

      <div className="bg-emerald-50 border-l-4 border-emerald-500 p-3 rounded text-emerald-800 text-xs">
        <strong>WhatsApp flow:</strong> use the per-row buttons for one-at-a-time sends, or the CSV with broadcast lists
        on your phone. <strong>Attach the seminar banner image manually</strong> in WhatsApp — wa.me links can't carry images.
        Bulk WhatsApp automation is deliberately not built: it gets numbers banned without the paid Business API.
      </div>

      <Card>
        <div className="flex flex-wrap gap-3 mb-4">
          <SearchInput
            containerClassName="flex-1 min-w-[200px]"
            placeholder="Search name / email / phone…"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            onClear={() => { setSearch(''); setPage(1); }}
          />
          <div className="w-48">
            <Select value={groupFilter} onChange={e => { setGroupFilter(e.target.value); setPage(1); }}>
              <option value="all">All degree groups</option>
              {groups.map(g => <option key={g} value={g}>{g}</option>)}
            </Select>
          </div>
          <div className="w-48">
            <Select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}>
              <option value="all">All statuses</option>
              <option value="pending">Invite pending</option>
              <option value="sent">Invite sent</option>
              <option value="failed">Invite failed</option>
              <option value="registered">Registered</option>
              <option value="declined">Declined</option>
            </Select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                {['Name', 'Contact', 'Group', 'Invite', 'Registration', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-2 text-left font-bold text-gray-700 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pageItems.map(c => {
                const reg = regByCandidate.get(c.id);
                const wa = waLink(c);
                const sms = smsLink(c);
                return (
                  <tr key={c.id} className="border-t border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-2 whitespace-nowrap">
                      <button onClick={() => setDetail(c)} className="font-bold text-gray-900 hover:text-blue-600 text-left" title="View full details">
                        {c.fullName}
                      </button>
                      <span className="block text-[11px] text-gray-400 font-normal">{c.city || ''}</span>
                    </td>
                    <td className="px-4 py-2 text-gray-600 whitespace-nowrap">
                      {c.email || '—'}
                      <span className="block text-[11px] text-gray-400">
                        {c.phone || 'no phone'}
                        {c.whatsappStatus === 'sent' && <span className="ml-1.5 text-emerald-600 font-bold">WA✓</span>}
                        {c.smsStatus === 'sent' && <span className="ml-1.5 text-blue-600 font-bold">SMS✓</span>}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-gray-600 whitespace-nowrap">{c.degreeGroup}</td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${c.emailStatus === 'sent' ? 'bg-emerald-100 text-emerald-700' : c.emailStatus === 'failed' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'}`}>
                        {c.emailStatus}{c.subjectVariant ? ` · ${c.subjectVariant}` : ''}
                      </span>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      {reg
                        ? <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${reg === 'declined' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>{reg === 'in_person' ? 'in person' : reg}</span>
                        : <span className="text-xs text-gray-400">—</span>}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      <div className="flex gap-2 items-center">
                        <button onClick={() => setDetail(c)} className="text-blue-600 hover:text-blue-800 text-xs font-bold" title="View full details">View</button>
                        {wa && <a href={wa} target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:text-emerald-800 text-xs font-bold" title="Open WhatsApp with a personalized message">WhatsApp</a>}
                        {sms && <a href={sms} className="text-blue-600 hover:text-blue-800 text-xs font-bold" title="Open SMS with a personalized message">SMS</a>}
                        <button onClick={() => copyInviteLink(c)} className="text-gray-500 hover:text-gray-800 text-xs font-bold" title="Copy this candidate's invite link">Copy link</button>
                        {isMaster && <button onClick={() => setDeleteTarget(c)} className="text-red-500 hover:text-red-700 text-xs font-bold" title="Delete this candidate (master only)">Delete</button>}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {pageItems.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-10 text-center text-gray-400 italic">No candidates match. Import a file first (Seminar &rarr; Import Candidates).</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          currentPage={page}
          totalPages={Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))}
          onPageChange={setPage}
        />
      </Card>

      {detail && (() => {
        const reg = registrations.find(r => r.candidateId === detail.id);
        const qs = questions.filter(q => q.candidateId === detail.id).sort((a, b) => (a.createdAt < b.createdAt ? -1 : 1));
        const logs = campaignLog.filter(l => l.candidateId === detail.id).sort((a, b) => (a.sentAt < b.sentAt ? 1 : -1));
        const inviteLink = buildTemplateVars(detail, settings).link;
        const Row: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
          <div className="flex flex-col sm:flex-row sm:gap-3 py-1.5 border-b border-gray-50">
            <span className="w-40 shrink-0 text-xs font-bold text-gray-500 uppercase pt-0.5">{label}</span>
            <span className="text-sm text-gray-800 break-all">{children}</span>
          </div>
        );
        return (
          <Modal isOpen={true} onClose={() => setDetail(null)} title={detail.fullName} size="lg">
            <div className="space-y-5">
              <div>
                <Row label="Email">{detail.email || '—'}</Row>
                <Row label="Phone">{detail.phone || '—'}</Row>
                <Row label="Gender">{detail.gender || '—'}</Row>
                <Row label="City / State">{[detail.city, detail.state].filter(Boolean).join(', ') || '—'}</Row>
                <Row label="Qualification">{detail.qualification || '—'}</Row>
                <Row label="Course / Stream">{detail.courseStream || '—'}</Row>
                <Row label="Institution">{detail.institution || '—'}</Row>
                <Row label="Year of Passing">{detail.yearOfPassing || '—'}</Row>
                <Row label="Experience (Years)">{detail.totalExperience || '—'}</Row>
                <Row label="Degree Group">{detail.degreeGroup}</Row>
                <Row label="Imported">{new Date(detail.createdAt).toLocaleString()}</Row>
                <Row label="Invite Status">{detail.emailStatus}{detail.subjectVariant ? ` (subject ${detail.subjectVariant})` : ''}</Row>
                <Row label="Invite Link"><a href={inviteLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">{inviteLink}</a></Row>
              </div>

              <div>
                <h4 className="font-bold text-gray-800 text-sm mb-1">Registration</h4>
                {reg ? (
                  <p className={`text-sm font-medium ${reg.status === 'registered' ? 'text-emerald-700' : 'text-red-600'}`}>
                    {reg.status === 'registered'
                      ? `Registered — ${reg.preferredMode === 'in_person' ? 'In person' : 'Online'}`
                      : 'Declined'}
                    <span className="text-gray-400 font-normal"> &middot; {new Date(reg.registeredAt).toLocaleString()}</span>
                  </p>
                ) : (
                  <p className="text-sm text-gray-400 italic">Not registered yet.</p>
                )}
              </div>

              <div>
                <h4 className="font-bold text-gray-800 text-sm mb-1">Questions ({qs.length})</h4>
                {qs.length === 0 && <p className="text-sm text-gray-400 italic">No questions asked.</p>}
                <div className="space-y-2">
                  {qs.map(q => (
                    <div key={q.id} className="bg-gray-50 rounded-lg p-2.5">
                      <p className="text-sm text-gray-800 whitespace-pre-wrap">{q.questionText}</p>
                      {q.replyText
                        ? <p className="text-sm text-emerald-700 mt-1 whitespace-pre-wrap">&#8618; {q.replyText}</p>
                        : <p className="text-xs text-amber-600 mt-1 font-bold">Awaiting reply</p>}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-bold text-gray-800 text-sm mb-1">Email History ({logs.length})</h4>
                {logs.length === 0 && <p className="text-sm text-gray-400 italic">Nothing sent yet.</p>}
                <div className="space-y-1">
                  {logs.map(l => (
                    <p key={l.id} className="text-xs text-gray-600">
                      {new Date(l.sentAt).toLocaleString()} &middot; {l.channel.replace('email_', '')}
                      {l.subjectVariant ? ` (subject ${l.subjectVariant})` : ''} &middot;{' '}
                      {l.error ? <span className="text-red-600">failed: {l.error}</span> : <span className="text-emerald-700">sent</span>}
                    </p>
                  ))}
                </div>
              </div>

              {isMaster && (
                <div className="flex justify-end pt-2 border-t border-gray-100">
                  <Button variant="danger" onClick={() => setDeleteTarget(detail)}>Delete Candidate</Button>
                </div>
              )}
            </div>
          </Modal>
        );
      })()}

      {blast && (() => {
        const done = blast.index >= blast.queue.length;
        const c = blast.queue[blast.index];
        const vars = c ? buildTemplateVars(c, settings) : null;
        const msg = vars ? renderTemplate(settings.whatsappTemplate, vars, false) : '';
        const channelName = blast.channel === 'whatsapp' ? 'WhatsApp' : 'SMS';
        const pct = Math.round((blast.index / blast.queue.length) * 100);
        return (
          <Modal isOpen={true} onClose={() => setBlast(null)} title={`${channelName} — one by one`} size="lg">
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs text-gray-600 mb-1">
                  <span>{done ? 'Finished' : `${blast.index + 1} of ${blast.queue.length}`}</span>
                  <span>{blast.sent} sent &middot; {blast.index - blast.sent} skipped</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div className="bg-emerald-500 h-2.5 rounded-full transition-all" style={{ width: `${pct}%` }} />
                </div>
              </div>

              {done ? (
                <div className="text-center py-6">
                  <div className="text-4xl mb-2">&#127881;</div>
                  <p className="font-bold text-gray-900">All done — {blast.sent} of {blast.queue.length} opened for sending.</p>
                  <p className="text-sm text-gray-500 mt-1">Anyone you skipped stays unmarked, so restarting the blast picks them up again.</p>
                  <Button className="mt-4" onClick={() => setBlast(null)}>Close</Button>
                </div>
              ) : (
                <>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="font-bold text-gray-900">{c.fullName} <span className="text-gray-400 font-normal">&middot; {c.phone} &middot; {c.degreeGroup}</span></p>
                    <p className="text-sm text-gray-700 mt-2 whitespace-pre-wrap border-l-2 border-emerald-300 pl-3">{msg}</p>
                  </div>

                  <div className="flex gap-2 flex-wrap">
                    <Button variant="success" onClick={blastSendCurrent}>
                      Open {channelName} &rarr; then Next
                    </Button>
                    <Button variant="secondary" onClick={blastSkip}>Skip</Button>
                    <Button variant="outline" onClick={() => setBlast(null)}>Stop (resume later)</Button>
                  </div>

                  <p className="text-xs text-gray-500">
                    {blast.channel === 'whatsapp'
                      ? <>A WhatsApp tab opens with the message pre-filled — press Send there, then come back. Works best with WhatsApp Web logged in, or run this from your phone. <strong>Attach the banner image manually</strong> if you want it included (links can't carry images).</>
                      : <>Your SMS app opens with the message pre-filled — press Send there, then come back. Run this from your phone; desktop browsers usually can't open SMS links.</>}
                  </p>
                </>
              )}
            </div>
          </Modal>
        );
      })()}

      <ConfirmationModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => { if (deleteTarget) handleDelete(deleteTarget); }}
        title="Delete candidate?"
        message={`This permanently deletes ${deleteTarget?.fullName || 'this candidate'} along with their registration, questions and email history. Their invite link stops working. This cannot be undone.`}
      />
    </div>
  );
};
