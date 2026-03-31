import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Card, Button, Pagination, ConfirmationModal, Modal, BackButton, SearchInput } from '../../components/Components';
import { Link, useNavigate } from 'react-router-dom';
import * as utils from '../../utils';
import { CandidateStatus, Candidate, TransactionType } from '../../types';

type TabType = 'active' | 'placed' | 'all';

export const CandidateList: React.FC = () => {
  const { candidates, deleteCandidate, updateCandidate, transactions, users, addUser, showToast, user } = useApp();
  const [currentPage, setCurrentPage] = useState(1);
  const [filterText, setFilterText] = useState('');
  const [batchFilter, setBatchFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [activeTab, setActiveTab] = useState<TabType>('active');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [viewCandidate, setViewCandidate] = useState<Candidate | null>(null);
  const [showAllAmounts, setShowAllAmounts] = useState(false);
  const [revealedRows, setRevealedRows] = useState<Set<string>>(new Set());
  const navigate = useNavigate();

  const isMaster = user?.username === 'thirumalreddy@sprtechforge.com';
  const ITEMS_PER_PAGE = 10;

  // Only show batches that have candidates in the current tab
  const uniqueBatches = useMemo(() => {
    const tabCandidates =
      activeTab === 'all' ? candidates :
      activeTab === 'placed' ? candidates.filter(c => c.status === CandidateStatus.Placed) :
      candidates.filter(c => c.status !== CandidateStatus.Placed);
    return [...new Set(tabCandidates.map(c => c.batchId))].sort();
  }, [candidates, activeTab]);

  const toggleRowAmount = (id: string) => {
    setRevealedRows(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const isAmountVisible = (id: string) => showAllAmounts || revealedRows.has(id);

  const getCandidateFinancials = (cId: string, agreed: number) => {
    const paid = transactions
      .filter(t => t.fromEntityId === cId && t.type === TransactionType.Income)
      .reduce((sum, t) => sum + t.amount, 0) -
      transactions
      .filter(t => t.toEntityId === cId && t.type === TransactionType.Refund)
      .reduce((sum, t) => sum + t.amount, 0);
    return { paid, due: agreed - paid };
  };

  const tabCounts = useMemo(() => ({
    active: candidates.filter(c => c.status !== CandidateStatus.Placed).length,
    placed: candidates.filter(c => c.status === CandidateStatus.Placed).length,
    all: candidates.length,
  }), [candidates]);

  const filtered = useMemo(() => {
    return candidates.filter(c => {
      const term = filterText.toLowerCase();
      const matchesText =
        c.name.toLowerCase().includes(term) ||
        c.batchId.toLowerCase().includes(term) ||
        (c.referredBy && c.referredBy.toLowerCase().includes(term)) ||
        c.phone.includes(term);
      const matchesBatch = batchFilter === 'All' || c.batchId === batchFilter;
      const matchesStatus = statusFilter === 'All' || c.status === statusFilter;
      const matchesTab =
        activeTab === 'all' ? true :
        activeTab === 'placed' ? c.status === CandidateStatus.Placed :
        c.status !== CandidateStatus.Placed;
      return matchesText && matchesBatch && matchesStatus && matchesTab;
    });
  }, [candidates, filterText, batchFilter, statusFilter, activeTab]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const summaryStats = useMemo(() => {
    const totalAgreed = candidates.reduce((sum, c) => sum + c.agreedAmount, 0);
    const totalCollected = candidates.reduce((sum, c) => {
      const { paid } = getCandidateFinancials(c.id, c.agreedAmount);
      return sum + paid;
    }, 0);
    return {
      total: candidates.length,
      active: candidates.filter(c => c.isActive && c.status !== CandidateStatus.Placed).length,
      placed: candidates.filter(c => c.status === CandidateStatus.Placed).length,
      training: candidates.filter(c => c.status === CandidateStatus.Training).length,
      totalDue: totalAgreed - totalCollected,
      totalCollected,
    };
  }, [candidates, transactions]);

  const handleExportCSV = () => {
    const exportData = candidates.map(c => {
      const { paid, due } = getCandidateFinancials(c.id, c.agreedAmount);
      return {
        'Full Name': c.name, 'Batch ID': c.batchId, 'Email': c.email, 'Phone': c.phone,
        'Status': c.status, 'Agreed Amount': c.agreedAmount, 'Total Paid': paid,
        'Balance Due': due, 'Referred By': c.referredBy || 'N/A',
        'Joined Date': new Date(c.joinedDate).toLocaleDateString(), 'Is Active': c.isActive ? 'Yes' : 'No'
      };
    });
    utils.downloadCSV(exportData, `SPR_Candidates_${new Date().toISOString().split('T')[0]}.csv`);
    showToast('Candidate list exported');
  };

  const handleDeleteClick = (id: string) => {
    if (!isMaster) { showToast('Only the Director can delete candidates', 'error'); return; }
    const hasEntries = transactions.some(t => t.fromEntityId === id || t.toEntityId === id);
    if (hasEntries) { showToast('Cannot delete: candidate has financial entries. Mark inactive instead.', 'error'); return; }
    setDeleteId(id);
  };

  const confirmDelete = () => { if (deleteId) { deleteCandidate(deleteId); setDeleteId(null); showToast('Candidate deleted'); } };
  const handleToggleActive = (c: Candidate) => updateCandidate({ ...c, isActive: !c.isActive });

  const handleCreateAccount = (c: Candidate) => {
    const existing = users.find(u => u.linkedCandidateId === c.id || u.username === c.email);
    if (existing) { showToast(`Account already exists: ${existing.username}`, 'info'); return; }
    if (!c.email) { showToast('Email is required to create an account', 'error'); return; }
    addUser({ id: utils.generateId(), name: c.name, username: c.email, password: c.phone || 'pass123', role: 'candidate', modules: [], linkedCandidateId: c.id, isPasswordChanged: false, authProvider: 'local' });
    showToast('Login account created for candidate', 'success');
  };

  const getStatusColor = (s: string) => {
    switch (s) {
      case CandidateStatus.Placed: return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case CandidateStatus.Training: return 'bg-blue-100 text-blue-800 border-blue-200';
      case CandidateStatus.ReadyForInterview: return 'bg-amber-100 text-amber-800 border-amber-200';
      case CandidateStatus.Discontinued: return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <BackButton />
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Candidates</h1>
            <p className="text-sm text-gray-500 mt-0.5">{summaryStats.total} total · {summaryStats.active} active · {summaryStats.placed} placed</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={handleExportCSV}>Export CSV</Button>
          <Link to="/candidates/enquiry"><Button variant="outline">Enquiries</Button></Link>
          <Link to="/candidates/new"><Button>+ Add Candidate</Button></Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Total Enrolled</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{summaryStats.total}</p>
          <p className="text-xs text-gray-400 mt-0.5">{[...new Set(candidates.map(c => c.batchId))].length} batch{[...new Set(candidates.map(c => c.batchId))].length !== 1 ? 'es' : ''}</p>
        </div>
        <div className="bg-white border border-blue-100 rounded-xl p-4 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-wider text-blue-400">In Training</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">{summaryStats.training}</p>
          <p className="text-xs text-gray-400 mt-0.5">currently enrolled</p>
        </div>
        <div className="bg-white border border-emerald-100 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">Total Collected</p>
            <button onClick={() => setShowAllAmounts(v => !v)} className="text-gray-400 hover:text-emerald-600 transition-colors" title={showAllAmounts ? 'Hide all amounts' : 'Show all amounts'}>
              {showAllAmounts ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
              )}
            </button>
          </div>
          <p className="text-2xl font-bold text-emerald-600 mt-1 tabular-nums whitespace-nowrap">
            {showAllAmounts ? utils.formatCurrency(summaryStats.totalCollected) : '₹ ••••••'}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">{summaryStats.placed} placed</p>
        </div>
        <div className="bg-white border border-amber-100 rounded-xl p-4 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-wider text-amber-400">Outstanding</p>
          <p className={`text-2xl font-bold mt-1 tabular-nums whitespace-nowrap ${summaryStats.totalDue > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
            {showAllAmounts ? utils.formatCurrency(summaryStats.totalDue) : '₹ ••••••'}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">balance due</p>
        </div>
      </div>

      <Card>
        {/* Tabs */}
        <div className="flex gap-1 border-b border-gray-200 mb-5">
          {([
            { key: 'active', label: 'Active Candidates', count: tabCounts.active },
            { key: 'placed', label: 'Placed', count: tabCounts.placed },
            { key: 'all', label: 'All', count: tabCounts.all },
          ] as { key: TabType; label: string; count: number }[]).map(tab => (
            <button key={tab.key} onClick={() => { setActiveTab(tab.key); setCurrentPage(1); setBatchFilter('All'); setStatusFilter('All'); }}
              className={`pb-2.5 px-4 text-sm font-medium transition-colors whitespace-nowrap ${activeTab === tab.key ? 'border-b-2 border-spr-600 text-spr-600' : 'text-gray-500 hover:text-gray-700'}`}>
              {tab.label}
              <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${activeTab === tab.key ? 'bg-spr-100 text-spr-700' : 'bg-gray-100 text-gray-500'}`}>{tab.count}</span>
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-3 mb-4">
          <div className="flex-1">
            <SearchInput placeholder="Search name, batch, phone..." value={filterText}
              onChange={e => { setFilterText(e.target.value); setCurrentPage(1); }}
              onClear={() => { setFilterText(''); setCurrentPage(1); }} />
          </div>
          <select
            className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-1 focus:ring-spr-accent outline-none bg-white text-gray-800 text-sm"
            value={batchFilter}
            onChange={e => { setBatchFilter(e.target.value); setCurrentPage(1); }}
          >
            <option value="All">All Batches</option>
            {uniqueBatches.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
          {activeTab !== 'placed' && (
            <select
              className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-1 focus:ring-spr-accent outline-none bg-white text-gray-800 text-sm"
              value={statusFilter}
              onChange={e => { setStatusFilter(e.target.value); setCurrentPage(1); }}
            >
              <option value="All">All Statuses</option>
              <option value={CandidateStatus.Training}>Training</option>
              <option value={CandidateStatus.ReadyForInterview}>Ready for Interview</option>
              <option value={CandidateStatus.Discontinued}>Discontinued</option>
              {activeTab === 'all' && <option value={CandidateStatus.Placed}>Placed</option>}
            </select>
          )}
          <button
            onClick={() => { setShowAllAmounts(v => !v); setRevealedRows(new Set()); }}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm font-medium transition-colors whitespace-nowrap ${showAllAmounts ? 'bg-spr-50 border-spr-200 text-spr-700' : 'border-gray-300 text-gray-600 hover:bg-gray-50'}`}
            title={showAllAmounts ? 'Hide all amounts' : 'Show all amounts'}
          >
            {showAllAmounts ? (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
            )}
            {showAllAmounts ? 'Hide Amounts' : 'Show Amounts'}
          </button>
          {(filterText || batchFilter !== 'All' || statusFilter !== 'All') && (
            <button onClick={() => { setFilterText(''); setBatchFilter('All'); setStatusFilter('All'); setCurrentPage(1); }}
              className="text-xs text-red-500 hover:text-red-700 font-medium flex items-center gap-1 whitespace-nowrap">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
              Clear
            </button>
          )}
        </div>

        <div className="text-xs text-gray-400 mb-3">
          Showing <span className="font-bold text-gray-700">{filtered.length}</span> {activeTab === 'placed' ? 'placed' : activeTab === 'active' ? 'active' : ''} candidates
        </div>

        {/* Mobile card view */}
        <div className="md:hidden space-y-3">
          {paginated.length > 0 ? paginated.map((c, idx) => {
            const { paid, due } = getCandidateFinancials(c.id, c.agreedAmount);
            return (
              <div key={c.id} className={`bg-white border border-gray-200 rounded-xl p-4 shadow-sm ${!c.isActive ? 'opacity-60' : ''}`}>
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900">{c.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{c.phone}</p>
                    {c.email && <p className="text-xs text-gray-400 truncate">{c.email}</p>}
                  </div>
                  <div className="flex flex-col items-end gap-1 ml-2 shrink-0">
                    <span className="bg-blue-50 text-blue-800 px-2 py-0.5 rounded font-mono text-xs font-bold border border-blue-100">{c.batchId}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold border ${getStatusColor(c.status)}`}>{c.status}</span>
                  </div>
                </div>
                {activeTab === 'placed' && c.placedCompany && (
                  <p className="text-xs text-emerald-700 font-semibold mb-2">{c.placedCompany}</p>
                )}
                {isAmountVisible(c.id) && (
                  <div className="grid grid-cols-3 gap-2 mb-3 text-center">
                    <div className="bg-gray-50 rounded-lg p-2">
                      <p className="text-[9px] text-gray-400 font-bold uppercase">Agreed</p>
                      <p className="text-xs font-bold text-gray-700 tabular-nums">{utils.formatCurrency(c.agreedAmount)}</p>
                    </div>
                    <div className="bg-emerald-50 rounded-lg p-2">
                      <p className="text-[9px] text-emerald-500 font-bold uppercase">Paid</p>
                      <p className="text-xs font-bold text-emerald-600 tabular-nums">{utils.formatCurrency(paid)}</p>
                    </div>
                    <div className={`rounded-lg p-2 ${due > 0 ? 'bg-amber-50' : 'bg-green-50'}`}>
                      <p className="text-[9px] font-bold uppercase text-gray-400">Due</p>
                      <p className={`text-xs font-bold tabular-nums ${due > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>{due <= 0 ? 'Cleared' : utils.formatCurrency(due)}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-center justify-between border-t border-gray-100 pt-3 gap-2">
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleToggleActive(c)} className={`w-9 h-5 rounded-full relative transition-colors ${c.isActive ? 'bg-emerald-500' : 'bg-gray-300'}`}>
                      <span className={`absolute top-1 left-1 bg-white w-3 h-3 rounded-full transition-transform shadow-sm ${c.isActive ? 'translate-x-4' : ''}`} />
                    </button>
                    <span className="text-xs text-gray-400">{c.isActive ? 'Active' : 'Inactive'}</span>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => toggleRowAmount(c.id)} className={`p-2 rounded-lg transition-colors ${isAmountVisible(c.id) ? 'text-spr-600 bg-spr-50' : 'text-gray-400 hover:bg-gray-100'}`} title="Toggle amounts">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                    </button>
                    <button onClick={() => setViewCandidate(c)} className="p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100" title="View">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                    </button>
                    <Link to={`/candidates/edit/${c.id}`} className="p-2 rounded-lg text-blue-500 hover:text-blue-700 hover:bg-blue-50" title="Edit">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                    </Link>
                    <Link to={`/candidates/agreement/${c.id}`} className="p-2 rounded-lg text-amber-500 hover:bg-amber-50" title="Agreement">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    </Link>
                    {isMaster && (
                      <button onClick={() => handleDeleteClick(c.id)} className="p-2 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50" title="Delete">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          }) : (
            <div className="py-16 text-center text-gray-400">
              <svg className="w-12 h-12 mb-3 opacity-25 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              <p className="font-medium text-gray-500">No candidates found</p>
            </div>
          )}
        </div>

        {/* Desktop table view */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="py-3 px-4 text-[11px] font-bold uppercase tracking-wider text-gray-400">#</th>
                <th className="py-3 px-4 text-[11px] font-bold uppercase tracking-wider text-gray-400">Batch</th>
                <th className="py-3 px-4 text-[11px] font-bold uppercase tracking-wider text-gray-400">Candidate</th>
                <th className="py-3 px-4 text-[11px] font-bold uppercase tracking-wider text-gray-400">Status</th>
                {activeTab === 'placed' && <th className="py-3 px-4 text-[11px] font-bold uppercase tracking-wider text-gray-400">Company</th>}
                <th className="py-3 px-4 text-right text-[11px] font-bold uppercase tracking-wider text-gray-400">Agreed</th>
                <th className="py-3 px-4 text-right text-[11px] font-bold uppercase tracking-wider text-gray-400">Paid</th>
                <th className="py-3 px-4 text-right text-[11px] font-bold uppercase tracking-wider text-gray-400">Due</th>
                <th className="py-3 px-4 text-center text-[11px] font-bold uppercase tracking-wider text-gray-400">Active</th>
                <th className="py-3 px-4 text-center text-[11px] font-bold uppercase tracking-wider text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginated.length > 0 ? paginated.map((c, idx) => {
                const { paid, due } = getCandidateFinancials(c.id, c.agreedAmount);
                const rowNum = (currentPage - 1) * ITEMS_PER_PAGE + idx + 1;
                return (
                  <tr key={c.id} className={`hover:bg-gray-50/80 transition-colors ${!c.isActive ? 'opacity-55' : ''}`}>
                    <td className="py-3 px-4 text-gray-400 text-xs">{rowNum}</td>
                    <td className="py-3 px-4">
                      <span className="bg-blue-50 text-blue-800 px-2 py-1 rounded font-mono text-xs font-bold border border-blue-100">{c.batchId}</span>
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-semibold text-gray-900">{c.name}</p>
                      <p className="text-xs text-gray-400">{c.phone}</p>
                      {c.email && <p className="text-xs text-gray-400 truncate max-w-[160px]">{c.email}</p>}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold border ${getStatusColor(c.status)}`}>{c.status}</span>
                    </td>
                    {activeTab === 'placed' && (
                      <td className="py-3 px-4">
                        <p className="font-medium text-emerald-800 text-xs">{c.placedCompany || '—'}</p>
                        {c.packageDetails && <p className="text-xs text-gray-400">{c.packageDetails}</p>}
                      </td>
                    )}
                    <td className="py-3 px-4 text-right font-medium tabular-nums text-gray-700">
                      {isAmountVisible(c.id) ? utils.formatCurrency(c.agreedAmount) : <span className="tracking-widest text-gray-400">••••</span>}
                    </td>
                    <td className="py-3 px-4 text-right text-emerald-600 font-bold tabular-nums">
                      {isAmountVisible(c.id) ? utils.formatCurrency(paid) : <span className="tracking-widest text-gray-400">••••</span>}
                    </td>
                    <td className={`py-3 px-4 text-right font-bold tabular-nums ${due > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                      {isAmountVisible(c.id) ? (
                        due <= 0 ? (
                          <span className="flex items-center justify-end gap-1 text-emerald-600">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                            Cleared
                          </span>
                        ) : utils.formatCurrency(due)
                      ) : <span className="tracking-widest text-gray-400">••••</span>}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button onClick={() => handleToggleActive(c)} className={`w-10 h-5 rounded-full relative transition-colors ${c.isActive ? 'bg-emerald-500' : 'bg-gray-300'}`}>
                        <span className={`absolute top-1 left-1 bg-white w-3 h-3 rounded-full transition-transform shadow-sm ${c.isActive ? 'translate-x-5' : ''}`} />
                      </button>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex justify-center gap-1">
                        <button onClick={() => toggleRowAmount(c.id)} className={`p-1.5 rounded-lg transition-colors ${isAmountVisible(c.id) ? 'text-spr-600 bg-spr-50 hover:bg-spr-100' : 'text-gray-400 hover:text-spr-600 hover:bg-gray-100'}`} title={isAmountVisible(c.id) ? 'Hide amounts' : 'Reveal amounts'}>
                          {isAmountVisible(c.id) ? (
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                          ) : (
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                          )}
                        </button>
                        <button onClick={() => setViewCandidate(c)} className="text-gray-400 hover:text-gray-700 p-1.5 rounded-lg hover:bg-gray-100" title="View Details">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                        </button>
                        <Link to={`/candidates/edit/${c.id}`} className="text-blue-500 hover:text-blue-700 p-1.5 rounded-lg hover:bg-blue-50" title="Edit">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                        </Link>
                        <Link to={`/candidates/agreement/${c.id}`} className="text-amber-500 hover:text-amber-700 p-1.5 rounded-lg hover:bg-amber-50" title="Agreement">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                        </Link>
                        {isMaster && (
                          <Link to={`/finance/statement/Candidate/${c.id}`} className="text-indigo-500 hover:text-indigo-700 p-1.5 rounded-lg hover:bg-indigo-50" title="Financial Statement">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                          </Link>
                        )}
                        <button onClick={() => handleCreateAccount(c)} className="text-teal-500 hover:text-teal-700 p-1.5 rounded-lg hover:bg-teal-50" title="Create Login Account">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
                        </button>
                        {/* Delete - Director only */}
                        {isMaster && (
                          <button onClick={() => handleDeleteClick(c.id)} className="text-red-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50" title="Delete (Director only)">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan={activeTab === 'placed' ? 10 : 9} className="py-16 text-center">
                    <div className="flex flex-col items-center text-gray-400">
                      <svg className="w-12 h-12 mb-3 opacity-25" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                      <p className="font-medium text-gray-500">No candidates found</p>
                      {activeTab === 'placed' && <p className="text-xs mt-1 text-gray-400">No placed candidates yet</p>}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
      </Card>

      {/* Candidate Detail Modal */}
      <Modal isOpen={!!viewCandidate} onClose={() => setViewCandidate(null)} title="Candidate Profile" size="lg">
        {viewCandidate && (() => {
          const { paid, due } = getCandidateFinancials(viewCandidate.id, viewCandidate.agreedAmount);
          return (
            <div className="space-y-5">
              <div className="flex justify-between items-start border-b border-gray-100 pb-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{viewCandidate.name}</h2>
                  <p className="text-sm text-gray-500 font-mono mt-0.5">Batch: <span className="text-indigo-600 font-bold">{viewCandidate.batchId}</span></p>
                  <p className="text-xs text-gray-400 mt-0.5">Joined: {new Date(viewCandidate.joinedDate).toLocaleDateString(undefined, { dateStyle: 'long' })}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(viewCandidate.status)}`}>{viewCandidate.status}</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-3">
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Contact Information</h3>
                  <div>
                    <label className="text-[10px] text-gray-400 font-bold uppercase block">Email</label>
                    <p className="text-gray-900 font-medium break-all text-sm">{viewCandidate.email || '—'}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] text-gray-400 font-bold uppercase block">Phone</label>
                      <p className="text-gray-900 font-medium text-sm">{viewCandidate.phone}</p>
                    </div>
                    <div>
                      <label className="text-[10px] text-gray-400 font-bold uppercase block">Alt Phone</label>
                      <p className="text-gray-900 font-medium text-sm">{viewCandidate.alternatePhone || '—'}</p>
                    </div>
                  </div>
                  {viewCandidate.referredBy && (
                    <div>
                      <label className="text-[10px] text-gray-400 font-bold uppercase block">Referred By</label>
                      <p className="text-gray-900 font-medium text-sm">{viewCandidate.referredBy}</p>
                    </div>
                  )}
                </div>

                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Address</h3>
                  <p className="text-gray-700 whitespace-pre-wrap text-sm italic">{viewCandidate.address || 'No address provided.'}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {(() => {
                  const modalVisible = isAmountVisible(viewCandidate.id);
                  return (
                    <>
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-center relative">
                        <label className="text-[10px] text-slate-500 font-bold uppercase block mb-1">Agreed</label>
                        <p className="text-lg font-bold text-slate-900 tabular-nums">{modalVisible ? utils.formatCurrency(viewCandidate.agreedAmount) : <span className="tracking-widest">••••••</span>}</p>
                      </div>
                      <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200 text-center">
                        <label className="text-[10px] text-emerald-600 font-bold uppercase block mb-1">Paid</label>
                        <p className="text-lg font-bold text-emerald-700 tabular-nums">{modalVisible ? utils.formatCurrency(paid) : <span className="tracking-widest">••••••</span>}</p>
                      </div>
                      <div className={`p-4 rounded-xl border text-center ${due > 0 ? 'bg-amber-50 border-amber-200' : 'bg-green-50 border-green-200'}`}>
                        <label className="text-[10px] font-bold uppercase block mb-1">Balance</label>
                        <p className={`text-lg font-bold tabular-nums ${due > 0 ? 'text-amber-700' : 'text-green-700'}`}>{modalVisible ? (due <= 0 ? 'CLEARED' : utils.formatCurrency(due)) : <span className="tracking-widest">••••••</span>}</p>
                      </div>
                    </>
                  );
                })()}
              </div>
              <div className="flex justify-center">
                <button onClick={() => toggleRowAmount(viewCandidate.id)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${isAmountVisible(viewCandidate.id) ? 'bg-spr-50 border-spr-200 text-spr-700' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}>
                  {isAmountVisible(viewCandidate.id) ? (
                    <><svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>Hide Amounts</>
                  ) : (
                    <><svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>Reveal Amounts</>
                  )}
                </button>
              </div>

              {viewCandidate.status === CandidateStatus.Placed && (viewCandidate.placedCompany || viewCandidate.packageDetails) && (
                <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4">
                  <h3 className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-2">Placement Details</h3>
                  {viewCandidate.placedCompany && <p className="font-semibold text-emerald-900">{viewCandidate.placedCompany}</p>}
                  {viewCandidate.packageDetails && <p className="text-sm text-emerald-700">{viewCandidate.packageDetails}</p>}
                </div>
              )}

              {viewCandidate.notes && (
                <div>
                  <label className="text-[10px] text-gray-400 font-bold uppercase block mb-1">Notes</label>
                  <p className="text-gray-600 text-sm italic bg-gray-50 p-3 rounded-lg border border-gray-100">{viewCandidate.notes}</p>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <Button variant="secondary" onClick={() => setViewCandidate(null)}>Close</Button>
                <Link to={`/candidates/edit/${viewCandidate.id}`} onClick={() => setViewCandidate(null)}>
                  <Button>Edit Candidate</Button>
                </Link>
              </div>
            </div>
          );
        })()}
      </Modal>

      <ConfirmationModal isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={confirmDelete}
        title="Delete Candidate"
        message="Are you sure you want to permanently delete this candidate? This action cannot be undone." />
    </div>
  );
};
