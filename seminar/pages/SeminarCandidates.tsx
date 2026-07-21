import React, { useMemo, useState } from 'react';
import { Button, Card, Pagination, SearchInput, Select } from '../../components/Components';
import { useApp } from '../../context/AppContext';
import { useSeminar } from '../context/SeminarContext';
import { buildTemplateVars, renderTemplate } from '../lib/template';

// Candidates table with per-candidate WhatsApp / SMS deep links and a
// WhatsApp CSV export. Deliberately NO bulk WhatsApp automation: unofficial
// bulk senders get numbers banned. wa.me links + broadcast lists from your
// own phone are free and ToS-safe (attach the banner image manually there).

const PAGE_SIZE = 50;

export const SeminarCandidates: React.FC = () => {
  const { showToast } = useApp();
  const { candidates, registrations, settings, isLoading } = useSeminar();
  const [search, setSearch] = useState('');
  const [groupFilter, setGroupFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);

  const regByCandidate = useMemo(() => {
    const m = new Map<string, string>();
    registrations.forEach(r => m.set(r.candidateId, r.status === 'registered' ? r.preferredMode : 'declined'));
    return m;
  }, [registrations]);

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
        <Button variant="secondary" onClick={exportWhatsAppCsv}>Export WhatsApp CSV</Button>
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
                    <td className="px-4 py-2 font-bold text-gray-900 whitespace-nowrap">{c.fullName}<span className="block text-[11px] text-gray-400 font-normal">{c.city || ''}</span></td>
                    <td className="px-4 py-2 text-gray-600 whitespace-nowrap">{c.email || '—'}<span className="block text-[11px] text-gray-400">{c.phone || 'no phone'}</span></td>
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
                        {wa && <a href={wa} target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:text-emerald-800 text-xs font-bold" title="Open WhatsApp with a personalized message">WhatsApp</a>}
                        {sms && <a href={sms} className="text-blue-600 hover:text-blue-800 text-xs font-bold" title="Open SMS with a personalized message">SMS</a>}
                        <button onClick={() => copyInviteLink(c)} className="text-gray-500 hover:text-gray-800 text-xs font-bold" title="Copy this candidate's invite link">Copy link</button>
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
    </div>
  );
};
