import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { WebLead, WebLeadStatus } from '../types';
import { Button, Modal, ConfirmationModal, SearchInput } from '../components/Components';

const STATUS_COLORS: Record<WebLeadStatus, string> = {
  'New': 'bg-blue-50 text-blue-700 border-blue-100',
  'In Progress': 'bg-amber-50 text-amber-700 border-amber-100',
  'Responded': 'bg-emerald-50 text-emerald-700 border-emerald-100',
  'Closed': 'bg-gray-100 text-gray-500 border-gray-200',
};

const STATUS_DOT: Record<WebLeadStatus, string> = {
  'New': 'bg-blue-500',
  'In Progress': 'bg-amber-500',
  'Responded': 'bg-emerald-500',
  'Closed': 'bg-gray-400',
};

export const WebLeadsPage: React.FC = () => {
  const { webLeads, updateWebLead, deleteWebLead, markWebLeadRead } = useApp();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<WebLeadStatus | 'All'>('All');
  const [selected, setSelected] = useState<WebLead | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const unreadCount = webLeads.filter(l => !l.isRead).length;

  const filtered = webLeads.filter(l => {
    const q = search.toLowerCase();
    const matchesText = !q ||
      l.name.toLowerCase().includes(q) ||
      (l.email || '').toLowerCase().includes(q) ||
      (l.company || '').toLowerCase().includes(q) ||
      (l.service || '').toLowerCase().includes(q) ||
      l.phone.includes(q);
    const matchesStatus = statusFilter === 'All' || l.status === statusFilter;
    return matchesText && matchesStatus;
  }).sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());

  const openLead = (lead: WebLead) => {
    setSelected(lead);
    markWebLeadRead(lead.id);
  };

  const handleStatusChange = (lead: WebLead, status: WebLeadStatus) => {
    updateWebLead({ ...lead, status });
    if (selected?.id === lead.id) setSelected({ ...lead, status });
  };

  const handleNoteChange = (note: string) => {
    if (!selected) return;
    const updated = { ...selected, internalNote: note };
    setSelected(updated);
    updateWebLead(updated);
  };

  const handleDelete = () => {
    if (!deleteId) return;
    deleteWebLead(deleteId);
    if (selected?.id === deleteId) setSelected(null);
    setDeleteId(null);
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-gray-900">Web Enquiries</h1>
            {unreadCount > 0 && (
              <span className="bg-blue-600 text-white text-xs font-black px-2.5 py-1 rounded-full">{unreadCount} new</span>
            )}
          </div>
          <p className="text-gray-500 text-sm mt-1">Contact form submissions from the website. Respond and track each lead here.</p>
        </div>
        <div className="flex gap-3 items-center flex-wrap">
          <SearchInput
            placeholder="Search leads..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            onClear={() => setSearch('')}
            containerClassName="w-64"
          />
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as any)}
            className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:ring-1 focus:ring-spr-accent outline-none"
          >
            <option value="All">All Status</option>
            <option value="New">New</option>
            <option value="In Progress">In Progress</option>
            <option value="Responded">Responded</option>
            <option value="Closed">Closed</option>
          </select>
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {(['All', 'New', 'In Progress', 'Responded'] as const).map(s => {
          const count = s === 'All' ? webLeads.length : webLeads.filter(l => l.status === s).length;
          const colors: Record<string, string> = { All: 'border-l-gray-400', New: 'border-l-blue-500', 'In Progress': 'border-l-amber-500', Responded: 'border-l-emerald-500' };
          return (
            <button key={s} onClick={() => setStatusFilter(s === 'All' ? 'All' : s as WebLeadStatus)}
              className={`bg-white border border-gray-100 border-l-4 ${colors[s]} rounded-xl p-5 text-left hover:shadow-md transition-all ${statusFilter === s ? 'ring-2 ring-spr-accent/30' : ''}`}>
              <p className="text-2xl font-black text-gray-900">{count}</p>
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mt-1">{s === 'All' ? 'Total Leads' : s}</p>
            </button>
          );
        })}
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
          <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <p className="text-gray-400 font-semibold">No enquiries found.</p>
          {!search && statusFilter === 'All' && <p className="text-gray-400 text-sm mt-1">Website enquiries will appear here when someone fills the contact form.</p>}
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left text-xs font-bold text-gray-500 uppercase tracking-widest px-6 py-3">Contact</th>
                  <th className="text-left text-xs font-bold text-gray-500 uppercase tracking-widest px-4 py-3">Service</th>
                  <th className="text-left text-xs font-bold text-gray-500 uppercase tracking-widest px-4 py-3">Date</th>
                  <th className="text-left text-xs font-bold text-gray-500 uppercase tracking-widest px-4 py-3">Status</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map(lead => (
                  <tr key={lead.id}
                    onClick={() => openLead(lead)}
                    className={`cursor-pointer hover:bg-blue-50/40 transition-colors ${!lead.isRead ? 'bg-blue-50/20' : ''}`}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {!lead.isRead && <span className="w-2 h-2 bg-blue-500 rounded-full shrink-0" />}
                        <div className={lead.isRead ? 'pl-5' : ''}>
                          <p className={`text-sm ${!lead.isRead ? 'font-bold text-gray-900' : 'font-semibold text-gray-800'}`}>{lead.name}</p>
                          {lead.company && <p className="text-xs text-gray-400 mt-0.5">{lead.company}</p>}
                          <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                            <span>{lead.phone}</span>
                            {lead.email && <span className="truncate max-w-[180px]">{lead.email}</span>}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm text-gray-600">{lead.service || <span className="text-gray-300 italic">Not specified</span>}</span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm text-gray-500 whitespace-nowrap">{formatDate(lead.submittedAt)}</span>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${STATUS_COLORS[lead.status]}`}>
                        {lead.status}
                      </span>
                    </td>
                    <td className="px-4 py-4" onClick={e => e.stopPropagation()}>
                      <button
                        onClick={() => setDeleteId(lead.id)}
                        className="text-gray-300 hover:text-red-500 transition-colors p-1 rounded"
                        title="Delete"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Detail modal */}
      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title="Enquiry Details" size="lg">
        {selected && (
          <div className="space-y-6">
            {/* Contact header */}
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <h3 className="text-xl font-black text-gray-900">{selected.name}</h3>
                {selected.company && <p className="text-gray-500 text-sm mt-0.5">{selected.company}</p>}
              </div>
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${STATUS_DOT[selected.status]}`} />
                <select
                  value={selected.status}
                  onChange={e => handleStatusChange(selected, e.target.value as WebLeadStatus)}
                  className="bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-sm font-semibold focus:ring-1 focus:ring-spr-accent outline-none"
                >
                  <option value="New">New</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Responded">Responded</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>
            </div>

            {/* Details grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { label: 'Phone', value: selected.phone, href: `tel:${selected.phone}` },
                { label: 'Email', value: selected.email, href: selected.email ? `mailto:${selected.email}` : undefined },
                { label: 'Service Interested In', value: selected.service },
                { label: 'Received', value: formatDate(selected.submittedAt) },
              ].filter(r => r.value).map(row => (
                <div key={row.label} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">{row.label}</p>
                  {row.href
                    ? <a href={row.href} className="text-spr-600 font-semibold text-sm hover:underline">{row.value}</a>
                    : <p className="text-gray-800 font-semibold text-sm">{row.value}</p>}
                </div>
              ))}
            </div>

            {/* Message */}
            {selected.message && (
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Their Message</p>
                <div className="bg-gray-50 border border-gray-100 rounded-xl p-5 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {selected.message}
                </div>
              </div>
            )}

            {/* Internal note */}
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Internal Note (visible to team only)</p>
              <textarea
                rows={3}
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:border-spr-accent focus:ring-1 focus:ring-spr-accent outline-none transition-all resize-none"
                placeholder="Add a note about this lead, e.g. 'Called back, interested in automation package...'"
                value={selected.internalNote || ''}
                onChange={e => handleNoteChange(e.target.value)}
              />
            </div>

            {/* Quick action buttons */}
            <div className="flex flex-wrap gap-3 pt-2">
              {selected.phone && (
                <a href={`tel:${selected.phone}`}
                  className="flex items-center gap-2 px-4 py-2.5 bg-green-50 text-green-700 border border-green-100 rounded-xl text-sm font-bold hover:bg-green-100 transition-colors">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                  Call
                </a>
              )}
              {selected.email && (
                <a href={`mailto:${selected.email}`}
                  className="flex items-center gap-2 px-4 py-2.5 bg-blue-50 text-blue-700 border border-blue-100 rounded-xl text-sm font-bold hover:bg-blue-100 transition-colors">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                  Send Email
                </a>
              )}
              <Button variant="danger" className="ml-auto text-sm" onClick={() => { setDeleteId(selected.id); setSelected(null); }}>
                Delete Lead
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmationModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Lead"
        message="This will permanently delete this web enquiry. This action cannot be undone."
      />
    </div>
  );
};
