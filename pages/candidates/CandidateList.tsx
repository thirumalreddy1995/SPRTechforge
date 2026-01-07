import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Card, Button, Pagination, ConfirmationModal, Modal, BackButton } from '../../components/Components';
import { Link, useNavigate } from 'react-router-dom';
import * as utils from '../../utils';
import { CandidateStatus, Candidate, TransactionType } from '../../types';

export const CandidateList: React.FC = () => {
  const { candidates, deleteCandidate, updateCandidate, transactions, candidateStatuses, users, addUser, showToast } = useApp();
  const [currentPage, setCurrentPage] = useState(1);
  const [filterText, setFilterText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [viewCandidate, setViewCandidate] = useState<Candidate | null>(null);
  const navigate = useNavigate();

  const ITEMS_PER_PAGE = 10;

  const filtered = candidates.filter(c => {
    const term = filterText.toLowerCase();
    const matchesText = 
      c.name.toLowerCase().includes(term) || 
      c.batchId.toLowerCase().includes(term) ||
      (c.referredBy && c.referredBy.toLowerCase().includes(term));
    const matchesStatus = statusFilter === 'All' || c.status === statusFilter;
    return matchesText && matchesStatus;
  });

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const handleDeleteClick = (id: string) => {
    const hasEntries = transactions.some(t => t.fromEntityId === id || t.toEntityId === id);
    if (hasEntries) {
      alert("Unable to delete candidate due to existing financial entries. Mark as Inactive instead.");
      return;
    }
    setDeleteId(id);
  };

  const confirmDelete = () => { if (deleteId) { deleteCandidate(deleteId); setDeleteId(null); } };
  const handleToggleActive = (c: Candidate) => updateCandidate({ ...c, isActive: !c.isActive });

  const handleCreateAccount = (c: Candidate) => {
      const existing = users.find(u => u.linkedCandidateId === c.id || u.username === c.email);
      if (existing) { alert(`Account exists: ${existing.username}`); return; }
      if(!c.email) { alert("Email required."); return; }
      addUser({
          id: utils.generateId(), name: c.name, username: c.email, password: c.phone || 'pass123',
          role: 'candidate', modules: [], linkedCandidateId: c.id, isPasswordChanged: false, authProvider: 'local'
      });
      showToast('User account created', 'success');
  };

  // Helper to calculate financial status for a candidate
  const getCandidateFinancials = (cId: string, agreed: number) => {
    const paid = transactions
      .filter(t => t.fromEntityId === cId && t.type === TransactionType.Income)
      .reduce((sum, t) => sum + t.amount, 0) -
      transactions
      .filter(t => t.toEntityId === cId && t.type === TransactionType.Refund)
      .reduce((sum, t) => sum + t.amount, 0);
    
    const due = agreed - paid;
    return { paid, due };
  };

  const getStatusColor = (s: string) => {
    switch(s) {
      case CandidateStatus.Placed: return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case CandidateStatus.Training: return 'bg-blue-100 text-blue-800 border-blue-200';
      case CandidateStatus.ReadyForInterview: return 'bg-amber-100 text-amber-800 border-amber-200';
      case CandidateStatus.Discontinued: return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200'; 
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-4">
           <BackButton />
           <h1 className="text-3xl font-bold text-gray-900">Candidates</h1>
        </div>
        <Link to="/candidates/new"><Button>+ Add Candidate</Button></Link>
      </div>

      <Card>
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <input placeholder="Search name, batch, or reference..." className="border border-gray-300 rounded-lg px-4 py-2 flex-1 focus:ring-1 focus:ring-spr-accent outline-none" value={filterText} onChange={e => setFilterText(e.target.value)} />
          <select className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-1 focus:ring-spr-accent outline-none" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="All">All Statuses</option>
            {candidateStatuses.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="py-3 px-4">Batch</th>
                <th className="py-3 px-4">Name</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Agreed</th>
                <th className="py-3 px-4 text-right">Paid</th>
                <th className="py-3 px-4 text-right">Due</th>
                <th className="py-3 px-4 text-center">Active</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginated.map(c => {
                const { paid, due } = getCandidateFinancials(c.id, c.agreedAmount);
                return (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className="py-3 px-4"><span className="bg-blue-50 text-blue-800 px-2 py-1 rounded font-mono text-xs font-bold border border-blue-100">{c.batchId}</span></td>
                    <td className="py-3 px-4 font-medium text-gray-900">
                       {c.name}
                       <div className="text-xs text-gray-400">{c.phone}</div>
                    </td>
                    <td className="py-3 px-4"><span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold border ${getStatusColor(c.status)}`}>{c.status}</span></td>
                    <td className="py-3 px-4 text-right font-medium tabular-nums">{utils.formatCurrency(c.agreedAmount)}</td>
                    <td className="py-3 px-4 text-right text-emerald-600 font-bold tabular-nums whitespace-nowrap">{utils.formatCurrency(paid)}</td>
                    <td className={`py-3 px-4 text-right font-bold tabular-nums whitespace-nowrap ${due > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                        {due <= 0 ? '✓ Cleared' : utils.formatCurrency(due)}
                    </td>
                    <td className="py-3 px-4 text-center">
                       <button onClick={() => handleToggleActive(c)} className={`w-10 h-5 rounded-full relative transition-colors ${c.isActive ? 'bg-emerald-500' : 'bg-gray-300'}`}>
                          <span className={`absolute top-1 left-1 bg-white w-3 h-3 rounded-full transition-transform ${c.isActive ? 'translate-x-5' : ''}`} />
                       </button>
                    </td>
                    <td className="py-3 px-4 text-center flex justify-center gap-2">
                       <button onClick={() => setViewCandidate(c)} className="text-gray-400 hover:text-gray-900 p-1 rounded hover:bg-gray-100" title="View Details"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg></button>
                       <Link to={`/candidates/edit/${c.id}`} className="text-blue-500 hover:text-blue-700 p-1 rounded hover:bg-blue-50" title="Edit"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg></Link>
                       <Link to={`/candidates/agreement/${c.id}`} className="text-amber-600 hover:text-amber-800 p-1 rounded hover:bg-amber-50" title="Agreement">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                       </Link>
                       <Link to={`/finance/statement/Candidate/${c.id}`} className="text-indigo-500 hover:text-indigo-700 p-1 rounded hover:bg-indigo-50" title="Financial Statement">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                       </Link>
                       <button onClick={() => handleCreateAccount(c)} className="text-amber-500 hover:text-amber-700 p-1 rounded hover:bg-amber-50" title="Create Login"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg></button>
                       <button onClick={() => handleDeleteClick(c.id)} className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50" title="Delete"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
      </Card>

      <Modal isOpen={!!viewCandidate} onClose={() => setViewCandidate(null)} title="Candidate Detailed Profile" size="lg">
         {viewCandidate && (() => {
             const { paid, due } = getCandidateFinancials(viewCandidate.id, viewCandidate.agreedAmount);
             return (
                <div className="space-y-6">
                    {/* Header: Identity & Status */}
                    <div className="flex justify-between items-start border-b border-gray-100 pb-4">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">{viewCandidate.name}</h2>
                            <p className="text-gray-500 font-mono text-sm mt-1">Batch ID: <span className="text-indigo-600 font-bold">{viewCandidate.batchId}</span></p>
                        </div>
                        <div className="text-right">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(viewCandidate.status)}`}>
                                {viewCandidate.status}
                            </span>
                            <p className="text-[10px] text-gray-400 mt-2 uppercase tracking-widest font-bold">Current Status</p>
                        </div>
                    </div>

                    {/* Contact Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                Contact Details
                            </h3>
                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-3">
                                <div>
                                    <label className="text-[10px] text-gray-400 font-bold uppercase block">Email Address</label>
                                    <p className="text-gray-900 font-medium break-all">{viewCandidate.email}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <label className="text-[10px] text-gray-400 font-bold uppercase block">Primary Phone</label>
                                        <p className="text-gray-900 font-medium">{viewCandidate.phone}</p>
                                    </div>
                                    <div>
                                        <label className="text-[10px] text-gray-400 font-bold uppercase block">Alt Phone</label>
                                        <p className="text-gray-900 font-medium">{viewCandidate.alternatePhone || '-'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                Permanent Address
                            </h3>
                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 min-h-[100px]">
                                <p className="text-gray-700 whitespace-pre-wrap italic">
                                    {viewCandidate.address || 'No address provided.'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Financial Summary */}
                    <div className="space-y-4">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            Financial Standing
                        </h3>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                                <label className="text-[10px] text-slate-500 font-bold uppercase block mb-1">Agreed Total</label>
                                <p className="text-xl font-bold text-slate-900 tabular-nums whitespace-nowrap">{utils.formatCurrency(viewCandidate.agreedAmount)}</p>
                            </div>
                            <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200">
                                <label className="text-[10px] text-emerald-600 font-bold uppercase block mb-1">Total Paid</label>
                                <p className="text-xl font-bold text-emerald-700 tabular-nums whitespace-nowrap">{utils.formatCurrency(paid)}</p>
                            </div>
                            <div className={`p-4 rounded-xl border tabular-nums whitespace-nowrap ${due > 0 ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-green-50 border-green-200 text-green-700'}`}>
                                <label className="text-[10px] font-bold uppercase block mb-1">Balance Due</label>
                                <p className="text-xl font-bold">{due <= 0 ? 'CLEARED' : utils.formatCurrency(due)}</p>
                            </div>
                        </div>
                    </div>

                    {/* Additional Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-100">
                        <div>
                             <label className="text-[10px] text-gray-400 font-bold uppercase block">Joined Date</label>
                             <p className="text-gray-900 font-medium">{new Date(viewCandidate.joinedDate).toLocaleDateString(undefined, { dateStyle: 'full' })}</p>
                        </div>
                        {viewCandidate.notes && (
                            <div>
                                <label className="text-[10px] text-gray-400 font-bold uppercase block">Admin Notes</label>
                                <p className="text-gray-600 text-sm italic">{viewCandidate.notes}</p>
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end gap-3 pt-6">
                        <Button variant="secondary" onClick={() => setViewCandidate(null)}>Close Profile</Button>
                        <Link to={`/candidates/edit/${viewCandidate.id}`}>
                            <Button>Edit Candidate</Button>
                        </Link>
                    </div>
                </div>
             );
         })()}
      </Modal>
      <ConfirmationModal isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={confirmDelete} title="Delete Candidate" message="Are you sure you want to delete this candidate? This cannot be undone if they have no financial history." />
    </div>
  );
};