
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Card, Button, Pagination, ConfirmationModal, Modal, BackButton } from '../../components/Components';
import { Link, useNavigate } from 'react-router-dom';
import * as utils from '../../utils';
import { CandidateStatus, Candidate } from '../../types';

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

  const getStatusColor = (s: string) => {
    switch(s) {
      case CandidateStatus.Placed: return 'bg-emerald-100 text-emerald-800';
      case CandidateStatus.Training: return 'bg-blue-100 text-blue-800';
      case CandidateStatus.ReadyForInterview: return 'bg-amber-100 text-amber-800';
      default: return 'bg-gray-100 text-gray-800'; 
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
          <input placeholder="Search..." className="border rounded-lg px-4 py-2 flex-1" value={filterText} onChange={e => setFilterText(e.target.value)} />
          <select className="border rounded-lg px-4 py-2" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
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
                <th className="py-3 px-4 text-center">Active</th>
                <th className="py-3 px-4 text-right">Agreed Amt</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginated.map(c => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="py-3 px-4"><span className="bg-blue-50 text-blue-800 px-2 py-1 rounded font-mono">{c.batchId}</span></td>
                  <td className="py-3 px-4 font-medium text-gray-900">
                     {c.name}
                     <div className="text-xs text-gray-400">{c.phone}</div>
                  </td>
                  <td className="py-3 px-4"><span className={`px-2 py-1 rounded text-xs font-bold ${getStatusColor(c.status)}`}>{c.status}</span></td>
                  <td className="py-3 px-4 text-center">
                     <button onClick={() => handleToggleActive(c)} className={`w-10 h-5 rounded-full relative transition-colors ${c.isActive ? 'bg-emerald-500' : 'bg-gray-300'}`}>
                        <span className={`absolute top-1 left-1 bg-white w-3 h-3 rounded-full transition-transform ${c.isActive ? 'translate-x-5' : ''}`} />
                     </button>
                  </td>
                  <td className="py-3 px-4 text-right font-bold">{utils.formatCurrency(c.agreedAmount)}</td>
                  <td className="py-3 px-4 text-center flex justify-center gap-2">
                     <button onClick={() => setViewCandidate(c)} className="text-gray-500 hover:text-gray-800 p-1" title="View"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg></button>
                     <Link to={`/candidates/edit/${c.id}`} className="text-blue-500 hover:text-blue-700 p-1" title="Edit"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg></Link>
                     <Link to={`/candidates/agreement/${c.id}`} className="text-purple-500 hover:text-purple-700 p-1" title="Send Agreement"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg></Link>
                     <button onClick={() => handleCreateAccount(c)} className="text-amber-500 hover:text-amber-700 p-1" title="Create Login"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg></button>
                     <button onClick={() => handleDeleteClick(c.id)} className="text-red-500 hover:text-red-700 p-1" title="Delete"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
      </Card>

      <Modal isOpen={!!viewCandidate} onClose={() => setViewCandidate(null)} title="Candidate Details">
         {viewCandidate && (
             <div className="space-y-4">
                 <h2 className="text-xl font-bold">{viewCandidate.name}</h2>
                 <div className="grid grid-cols-2 gap-4">
                     <div><label className="text-xs text-gray-500">Email</label><p>{viewCandidate.email}</p></div>
                     <div><label className="text-xs text-gray-500">Phone</label><p>{viewCandidate.phone}</p></div>
                     <div><label className="text-xs text-gray-500">Batch</label><p>{viewCandidate.batchId}</p></div>
                     <div><label className="text-xs text-gray-500">Status</label><p>{viewCandidate.status}</p></div>
                 </div>
                 <div className="flex justify-end"><Button variant="secondary" onClick={() => setViewCandidate(null)}>Close</Button></div>
             </div>
         )}
      </Modal>
      <ConfirmationModal isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={confirmDelete} title="Delete Candidate" message="Confirm deletion?" />
    </div>
  );
};
