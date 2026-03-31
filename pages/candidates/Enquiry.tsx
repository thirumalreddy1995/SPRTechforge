import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Card, Button, Input, Modal, ConfirmationModal, BackButton, SearchInput } from '../../components/Components';
import { Enquiry, EnquiryStatus } from '../../types';
import * as utils from '../../utils';
import { useNavigate } from 'react-router-dom';

const STATUS_COLORS: Record<EnquiryStatus, string> = {
  'Enquiry': 'bg-blue-100 text-blue-800 border-blue-200',
  'Follow-Up': 'bg-amber-100 text-amber-800 border-amber-200',
  'Joined': 'bg-emerald-100 text-emerald-800 border-emerald-200',
  'Not Interested': 'bg-red-100 text-red-800 border-red-200',
};

const TABS: { label: string; value: EnquiryStatus | 'All' }[] = [
  { label: 'All', value: 'All' },
  { label: 'Enquiry', value: 'Enquiry' },
  { label: 'Follow-Up', value: 'Follow-Up' },
  { label: 'Joined', value: 'Joined' },
  { label: 'Not Interested', value: 'Not Interested' },
];

const EMPTY_FORM: Partial<Enquiry> = {
  name: '', phone: '', alternatePhone: '', email: '', address: '',
  committedAmount: undefined, expectedJoiningDate: '', batch: '',
  status: 'Enquiry', enquiryDate: new Date().toISOString().split('T')[0], notes: []
};

export const EnquiryPage: React.FC = () => {
  const { enquiries, addEnquiry, updateEnquiry, deleteEnquiry, addEnquiryNote, mergeEnquiryToCandidate, user, showToast } = useApp();
  const navigate = useNavigate();
  const isMaster = user?.username === 'thirumalreddy@sprtechforge.com';

  const [activeTab, setActiveTab] = useState<EnquiryStatus | 'All'>('All');
  const [searchText, setSearchText] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEnquiry, setEditingEnquiry] = useState<Enquiry | null>(null);
  const [viewEnquiry, setViewEnquiry] = useState<Enquiry | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [mergeConfirmId, setMergeConfirmId] = useState<string | null>(null);
  const [noteText, setNoteText] = useState('');
  const [noteEnquiryId, setNoteEnquiryId] = useState<string | null>(null);
  const [formError, setFormError] = useState('');
  const [form, setForm] = useState<Partial<Enquiry>>(EMPTY_FORM);

  const filtered = useMemo(() => {
    return enquiries.filter(e => {
      const matchesTab = activeTab === 'All' || e.status === activeTab;
      const term = searchText.toLowerCase();
      const matchesSearch = !term || e.name.toLowerCase().includes(term) ||
        e.phone.includes(term) || (e.email?.toLowerCase().includes(term));
      return matchesTab && matchesSearch;
    });
  }, [enquiries, activeTab, searchText]);

  const counts = useMemo(() => ({
    All: enquiries.length,
    'Enquiry': enquiries.filter(e => e.status === 'Enquiry').length,
    'Follow-Up': enquiries.filter(e => e.status === 'Follow-Up').length,
    'Joined': enquiries.filter(e => e.status === 'Joined').length,
    'Not Interested': enquiries.filter(e => e.status === 'Not Interested').length,
  }), [enquiries]);

  const openAdd = () => { setForm({ ...EMPTY_FORM, enquiryDate: new Date().toISOString().split('T')[0], notes: [] }); setEditingEnquiry(null); setFormError(''); setIsFormOpen(true); };
  const openEdit = (e: Enquiry) => { setForm({ ...e }); setEditingEnquiry(e); setFormError(''); setIsFormOpen(true); };

  const validatePhone = (p: string) => /^\d{10}$/.test(p);

  const handleSubmit = (ev: React.FormEvent) => {
    ev.preventDefault();
    setFormError('');
    if (!form.name?.trim()) { setFormError('Name is required'); return; }
    if (!form.phone?.trim()) { setFormError('Phone number is required'); return; }
    if (!validatePhone(form.phone)) { setFormError('Phone number must be exactly 10 digits'); return; }
    if (form.alternatePhone && form.alternatePhone.trim() && !validatePhone(form.alternatePhone)) {
      setFormError('Alternate phone must be exactly 10 digits'); return;
    }

    if (editingEnquiry) {
      updateEnquiry({ ...editingEnquiry, ...form } as Enquiry);
      showToast('Enquiry updated successfully');
    } else {
      const newEnquiry: Enquiry = {
        id: utils.generateId(),
        name: form.name!,
        phone: form.phone!,
        alternatePhone: form.alternatePhone,
        email: form.email,
        address: form.address,
        committedAmount: form.committedAmount,
        expectedJoiningDate: form.expectedJoiningDate,
        batch: form.batch,
        status: form.status as EnquiryStatus,
        enquiryDate: form.enquiryDate || new Date().toISOString(),
        notes: [],
      };
      addEnquiry(newEnquiry);
      showToast('Enquiry added successfully');
    }
    setIsFormOpen(false);
  };

  const handleAddNote = () => {
    if (!noteText.trim() || !noteEnquiryId) return;
    addEnquiryNote(noteEnquiryId, noteText.trim());
    setNoteText('');
    setNoteEnquiryId(null);
    showToast('Note added');
    // refresh viewEnquiry
    const updated = enquiries.find(e => e.id === noteEnquiryId);
    if (updated) setViewEnquiry({ ...updated, notes: [...(updated.notes || []), { id: '', date: new Date().toISOString(), note: noteText.trim(), addedBy: user?.name || '' }] });
  };

  const handleMerge = () => {
    if (!mergeConfirmId) return;
    const newCandidate = mergeEnquiryToCandidate(mergeConfirmId);
    setMergeConfirmId(null);
    if (newCandidate) {
      showToast(`${newCandidate.name} merged to Candidates successfully`, 'success');
      navigate('/candidates');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <BackButton />
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Enquiries</h1>
            <p className="text-sm text-gray-500 mt-0.5">{enquiries.length} total enquiries · {counts['Follow-Up']} follow-ups pending</p>
          </div>
        </div>
        <Button onClick={openAdd}>+ New Enquiry</Button>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {(['Enquiry', 'Follow-Up', 'Joined', 'Not Interested'] as EnquiryStatus[]).map(s => (
          <div key={s} onClick={() => setActiveTab(s)}
            className={`bg-white border rounded-xl p-4 shadow-sm cursor-pointer transition-all hover:shadow-md ${activeTab === s ? 'border-spr-accent ring-1 ring-spr-accent' : 'border-gray-200'}`}>
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{s}</p>
            <p className={`text-2xl font-bold mt-1 ${s === 'Joined' ? 'text-emerald-600' : s === 'Not Interested' ? 'text-red-500' : s === 'Follow-Up' ? 'text-amber-600' : 'text-blue-600'}`}>{counts[s]}</p>
          </div>
        ))}
      </div>

      <Card>
        {/* Tabs */}
        <div className="flex gap-1 border-b border-gray-200 mb-4 overflow-x-auto">
          {TABS.map(tab => (
            <button key={tab.value} onClick={() => setActiveTab(tab.value)}
              className={`pb-2 px-4 text-sm font-medium whitespace-nowrap transition-colors ${activeTab === tab.value ? 'border-b-2 border-spr-600 text-spr-600' : 'text-gray-500 hover:text-gray-700'}`}>
              {tab.label}
              <span className="ml-1.5 text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full">{counts[tab.value]}</span>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="mb-4">
          <SearchInput placeholder="Search by name, phone, email..." value={searchText}
            onChange={e => setSearchText(e.target.value)} onClear={() => setSearchText('')} />
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-600">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="py-3 px-4 text-[11px] font-bold uppercase tracking-wider text-gray-400">#</th>
                <th className="py-3 px-4 text-[11px] font-bold uppercase tracking-wider text-gray-400">Name</th>
                <th className="py-3 px-4 text-[11px] font-bold uppercase tracking-wider text-gray-400">Contact</th>
                <th className="py-3 px-4 text-[11px] font-bold uppercase tracking-wider text-gray-400">Batch / Date</th>
                <th className="py-3 px-4 text-right text-[11px] font-bold uppercase tracking-wider text-gray-400">Committed</th>
                <th className="py-3 px-4 text-center text-[11px] font-bold uppercase tracking-wider text-gray-400">Status</th>
                <th className="py-3 px-4 text-center text-[11px] font-bold uppercase tracking-wider text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length > 0 ? filtered.map((e, idx) => (
                <tr key={e.id} className={`hover:bg-gray-50 transition-colors ${e.isMerged ? 'opacity-60' : ''}`}>
                  <td className="py-3 px-4 text-gray-400 text-xs">{idx + 1}</td>
                  <td className="py-3 px-4">
                    <p className="font-semibold text-gray-900">{e.name}</p>
                    {e.email && <p className="text-xs text-gray-400">{e.email}</p>}
                    {e.isMerged && <span className="text-xs text-emerald-600 font-bold">✓ Merged</span>}
                  </td>
                  <td className="py-3 px-4">
                    <p className="font-medium">{e.phone}</p>
                    {e.alternatePhone && <p className="text-xs text-gray-400">{e.alternatePhone}</p>}
                  </td>
                  <td className="py-3 px-4">
                    {e.batch && <span className="bg-blue-50 text-blue-800 px-2 py-0.5 rounded font-mono text-xs font-bold border border-blue-100 block mb-1">{e.batch}</span>}
                    <p className="text-xs text-gray-400">{new Date(e.enquiryDate).toLocaleDateString()}</p>
                    {e.expectedJoiningDate && <p className="text-xs text-indigo-600">Join: {new Date(e.expectedJoiningDate).toLocaleDateString()}</p>}
                  </td>
                  <td className="py-3 px-4 text-right font-medium tabular-nums">
                    {e.committedAmount ? utils.formatCurrency(e.committedAmount) : <span className="text-gray-400">—</span>}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold border ${STATUS_COLORS[e.status]}`}>{e.status}</span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex justify-center gap-1">
                      {/* View */}
                      <button onClick={() => setViewEnquiry(e)} className="text-gray-400 hover:text-gray-900 p-1 rounded hover:bg-gray-100" title="View">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                      </button>
                      {/* Edit */}
                      {!e.isMerged && (
                        <button onClick={() => openEdit(e)} className="text-blue-400 hover:text-blue-700 p-1 rounded hover:bg-blue-50" title="Edit">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                        </button>
                      )}
                      {/* Add Note */}
                      {!e.isMerged && (
                        <button onClick={() => { setNoteEnquiryId(e.id); setNoteText(''); }} className="text-amber-400 hover:text-amber-700 p-1 rounded hover:bg-amber-50" title="Add Note">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5M16 3l5 5-9 9H7v-5l9-9z" /></svg>
                        </button>
                      )}
                      {/* Merge - Director only */}
                      {isMaster && !e.isMerged && (
                        <button onClick={() => setMergeConfirmId(e.id)} className="text-emerald-500 hover:text-emerald-700 p-1 rounded hover:bg-emerald-50" title="Merge to Candidate">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
                        </button>
                      )}
                      {/* Delete - Director only */}
                      {isMaster && (
                        <button onClick={() => setDeleteId(e.id)} className="text-red-400 hover:text-red-600 p-1 rounded hover:bg-red-50" title="Delete">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-gray-400">
                    <svg className="w-12 h-12 mx-auto mb-3 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 4H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-2m-4-1v8m0 0l3-3m-3 3L9 8m-5 5h2.586a1 1 0 01.707.293l2.414 2.414a1 1 0 00.707.293h3.172a1 1 0 00.707-.293l2.414-2.414a1 1 0 01.707-.293H20" /></svg>
                    <p className="font-medium">No enquiries found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add/Edit Form Modal */}
      <Modal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} title={editingEnquiry ? 'Edit Enquiry' : 'New Enquiry'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded text-sm text-red-700 font-medium">{formError}</div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name <span className="text-red-500">*</span></label>
              <Input value={form.name || ''} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Enter full name" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number <span className="text-red-500">*</span></label>
              <Input value={form.phone || ''} onChange={e => setForm({ ...form, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })} placeholder="10-digit number" numericOnly maxLength={10} />
              {form.phone && form.phone.length > 0 && form.phone.length < 10 && (
                <p className="text-xs text-amber-600 mt-1">{10 - form.phone.length} more digits required</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Alternate Phone</label>
              <Input value={form.alternatePhone || ''} onChange={e => setForm({ ...form, alternatePhone: e.target.value.replace(/\D/g, '').slice(0, 10) })} placeholder="10-digit number" numericOnly maxLength={10} />
              {form.alternatePhone && form.alternatePhone.length > 0 && form.alternatePhone.length < 10 && (
                <p className="text-xs text-amber-600 mt-1">{10 - form.alternatePhone.length} more digits required</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <Input type="email" value={form.email || ''} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="email@example.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Committed Amount (₹)</label>
              <Input type="number" value={form.committedAmount || ''} onChange={e => setForm({ ...form, committedAmount: parseFloat(e.target.value) || undefined })} placeholder="Amount discussed" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select className="w-full bg-white border border-spr-700 rounded-lg px-4 py-2 text-gray-900 focus:border-spr-accent focus:ring-1 focus:ring-spr-accent outline-none"
                value={form.status} onChange={e => setForm({ ...form, status: e.target.value as EnquiryStatus })}>
                <option value="Enquiry">Enquiry</option>
                <option value="Follow-Up">Follow-Up</option>
                <option value="Joined">Joined</option>
                <option value="Not Interested">Not Interested</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Expected Joining Date</label>
              <Input type="date" value={form.expectedJoiningDate || ''} onChange={e => setForm({ ...form, expectedJoiningDate: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Batch</label>
              <Input value={form.batch || ''} onChange={e => setForm({ ...form, batch: e.target.value })} placeholder="e.g. Batch-2025-A" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
            <textarea className="w-full bg-white border border-spr-700 rounded-lg px-4 py-2 text-gray-900 focus:border-spr-accent focus:ring-1 focus:ring-spr-accent outline-none" rows={2}
              value={form.address || ''} onChange={e => setForm({ ...form, address: e.target.value })} placeholder="Full address" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Enquiry Date</label>
            <Input type="date" value={form.enquiryDate ? form.enquiryDate.split('T')[0] : ''} onChange={e => setForm({ ...form, enquiryDate: e.target.value })} />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <Button type="button" variant="secondary" onClick={() => setIsFormOpen(false)}>Cancel</Button>
            <Button type="submit">{editingEnquiry ? 'Update Enquiry' : 'Save Enquiry'}</Button>
          </div>
        </form>
      </Modal>

      {/* View Detail Modal */}
      <Modal isOpen={!!viewEnquiry} onClose={() => setViewEnquiry(null)} title="Enquiry Details" size="lg">
        {viewEnquiry && (
          <div className="space-y-5">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-bold text-gray-900">{viewEnquiry.name}</h2>
                <p className="text-sm text-gray-500">Enquiry on {new Date(viewEnquiry.enquiryDate).toLocaleDateString(undefined, { dateStyle: 'long' })}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold border ${STATUS_COLORS[viewEnquiry.status]}`}>{viewEnquiry.status}</span>
            </div>

            <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
              <div><label className="text-[10px] text-gray-400 font-bold uppercase">Phone</label><p className="font-medium text-gray-900">{viewEnquiry.phone}</p></div>
              {viewEnquiry.alternatePhone && <div><label className="text-[10px] text-gray-400 font-bold uppercase">Alternate Phone</label><p className="font-medium text-gray-900">{viewEnquiry.alternatePhone}</p></div>}
              {viewEnquiry.email && <div><label className="text-[10px] text-gray-400 font-bold uppercase">Email</label><p className="font-medium text-gray-900">{viewEnquiry.email}</p></div>}
              {viewEnquiry.batch && <div><label className="text-[10px] text-gray-400 font-bold uppercase">Batch</label><p className="font-medium text-gray-900">{viewEnquiry.batch}</p></div>}
              {viewEnquiry.committedAmount && <div><label className="text-[10px] text-gray-400 font-bold uppercase">Committed Amount</label><p className="font-bold text-emerald-700 text-lg">{utils.formatCurrency(viewEnquiry.committedAmount)}</p></div>}
              {viewEnquiry.expectedJoiningDate && <div><label className="text-[10px] text-gray-400 font-bold uppercase">Expected Joining</label><p className="font-medium text-indigo-700">{new Date(viewEnquiry.expectedJoiningDate).toLocaleDateString()}</p></div>}
            </div>

            {viewEnquiry.address && (
              <div><label className="text-[10px] text-gray-400 font-bold uppercase block mb-1">Address</label>
                <p className="text-gray-700 bg-gray-50 p-3 rounded-lg border border-gray-100">{viewEnquiry.address}</p>
              </div>
            )}

            {/* Discussion History - Immutable */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Discussion & Commitment History</h3>
                <span className="text-xs text-gray-400 italic">Records cannot be deleted or modified</span>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 space-y-2 max-h-48 overflow-y-auto">
                {(viewEnquiry.notes || []).length > 0 ? (
                  viewEnquiry.notes.map(n => (
                    <div key={n.id || n.date} className="bg-white border border-gray-100 rounded-lg p-3">
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-xs font-bold text-indigo-600">{n.addedBy}</span>
                        <span className="text-[10px] text-gray-400">{new Date(n.date).toLocaleDateString(undefined, { dateStyle: 'medium' })}</span>
                      </div>
                      <p className="text-sm text-gray-700">{n.note}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-gray-400 text-sm py-4">No discussion notes yet.</p>
                )}
              </div>
              {/* Add note inline */}
              {!viewEnquiry.isMerged && (
                <div className="mt-2 flex gap-2">
                  <input type="text" className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-spr-accent outline-none"
                    placeholder="Add a discussion note..." value={noteEnquiryId === viewEnquiry.id ? noteText : ''}
                    onChange={e => { setNoteEnquiryId(viewEnquiry.id); setNoteText(e.target.value); }} />
                  <Button type="button" onClick={() => {
                    if (!noteText.trim()) return;
                    addEnquiryNote(viewEnquiry.id, noteText.trim());
                    const updated = enquiries.find(e => e.id === viewEnquiry.id);
                    if (updated) setViewEnquiry({ ...updated, notes: [...(updated.notes || []), { id: utils.generateId(), date: new Date().toISOString(), note: noteText.trim(), addedBy: user?.name || '' }] });
                    setNoteText('');
                    showToast('Note added');
                  }}>Add</Button>
                </div>
              )}
            </div>

            {viewEnquiry.isMerged && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-sm text-emerald-700 font-medium">
                ✓ This enquiry was merged to a candidate on {viewEnquiry.mergedDate ? new Date(viewEnquiry.mergedDate).toLocaleDateString() : 'unknown date'}.
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <Button variant="secondary" onClick={() => setViewEnquiry(null)}>Close</Button>
              {!viewEnquiry.isMerged && <Button onClick={() => { setViewEnquiry(null); openEdit(viewEnquiry); }}>Edit</Button>}
              {isMaster && !viewEnquiry.isMerged && (
                <Button variant="success" onClick={() => { setViewEnquiry(null); setMergeConfirmId(viewEnquiry.id); }}>
                  Merge to Candidate
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Add Note Modal (from table row) */}
      <Modal isOpen={!!(noteEnquiryId && !viewEnquiry)} onClose={() => setNoteEnquiryId(null)} title="Add Discussion Note">
        <div className="space-y-4">
          <p className="text-sm text-gray-600">Add a note about the discussion or commitment made with this enquiry.</p>
          <textarea className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-spr-accent outline-none" rows={4}
            placeholder="Enter discussion details, commitments made, amount discussed, etc." value={noteText} onChange={e => setNoteText(e.target.value)} />
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => { setNoteEnquiryId(null); setNoteText(''); }}>Cancel</Button>
            <Button onClick={handleAddNote}>Save Note</Button>
          </div>
        </div>
      </Modal>

      {/* Merge Confirmation */}
      <Modal isOpen={!!mergeConfirmId} onClose={() => setMergeConfirmId(null)} title="Merge Enquiry to Candidate">
        <div className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <p className="text-sm text-amber-800 font-medium">This will create a new Candidate from this enquiry. The enquiry details including discussion history will be preserved and visible.</p>
            <p className="text-sm text-amber-700 mt-2 font-bold">Note: This action is for Directors only and cannot be undone.</p>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setMergeConfirmId(null)}>Cancel</Button>
            <Button variant="success" onClick={handleMerge}>Confirm Merge</Button>
          </div>
        </div>
      </Modal>

      <ConfirmationModal isOpen={!!deleteId} onClose={() => setDeleteId(null)}
        onConfirm={() => { if (deleteId) { deleteEnquiry(deleteId); setDeleteId(null); showToast('Enquiry deleted'); } }}
        title="Delete Enquiry" message="Are you sure you want to delete this enquiry? This action cannot be undone." />
    </div>
  );
};
