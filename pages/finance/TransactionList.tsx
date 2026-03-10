import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Card, Button, Pagination, Modal, ConfirmationModal, SearchInput, SearchableSelect, SearchableSelectOption } from '../../components/Components';
import { Link, useNavigate } from 'react-router-dom';
import * as utils from '../../utils';
import { TransactionType, Transaction } from '../../types';

// ─── Type tile config ───────────────────────────────────────────────────────
const TYPE_CONFIG: Record<string, { label: string; color: string; bg: string; border: string; textColor: string; icon: React.ReactNode }> = {
  [TransactionType.Income]: {
    label: 'Income',
    color: 'emerald',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    textColor: 'text-emerald-700',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  [TransactionType.Payment]: {
    label: 'Payments',
    color: 'red',
    bg: 'bg-red-50',
    border: 'border-red-200',
    textColor: 'text-red-700',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
  },
  [TransactionType.Transfer]: {
    label: 'Transfers',
    color: 'blue',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    textColor: 'text-blue-700',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
      </svg>
    ),
  },
  [TransactionType.Refund]: {
    label: 'Refunds',
    color: 'amber',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    textColor: 'text-amber-700',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
      </svg>
    ),
  },
};

export const TransactionList: React.FC = () => {
  const { transactions, getEntityName, deleteTransaction, user, accounts, candidates } = useApp();
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [filterText, setFilterText] = useState('');
  const [lockFilter, setLockFilter] = useState<string>('All');
  const [fromFilter, setFromFilter] = useState<string>('');
  const [toFilter, setToFilter] = useState<string>('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [viewTransaction, setViewTransaction] = useState<Transaction | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const navigate = useNavigate();

  const ITEMS_PER_PAGE = 10;

  const sortedTransactions = useMemo(() =>
    [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [transactions]
  );

  // Per-type totals for the overview tiles
  const typeTotals = useMemo(() => {
    const totals: Record<string, { count: number; amount: number }> = {};
    for (const type of Object.values(TransactionType)) {
      const group = transactions.filter(t => t.type === type);
      totals[type] = { count: group.length, amount: group.reduce((s, t) => s + t.amount, 0) };
    }
    return totals;
  }, [transactions]);

  // Filtered list within the selected type view
  const filtered = useMemo(() => {
    if (!selectedType) return [];
    return sortedTransactions.filter(t => {
      if (t.type !== selectedType) return false;
      const matchesLock = lockFilter === 'All' ||
        (lockFilter === 'Locked' && t.isLocked) ||
        (lockFilter === 'Unlocked' && !t.isLocked);
      const matchesFrom = fromFilter === '' || t.fromEntityId === fromFilter;
      const matchesTo = toFilter === '' || t.toEntityId === toFilter;
      const fromName = getEntityName(t.fromEntityId, t.fromEntityType).toLowerCase();
      const toName = getEntityName(t.toEntityId, t.toEntityType).toLowerCase();
      const matchesText =
        t.description.toLowerCase().includes(filterText.toLowerCase()) ||
        fromName.includes(filterText.toLowerCase()) ||
        toName.includes(filterText.toLowerCase());
      let matchesDate = true;
      if (startDate) { const s = new Date(startDate); s.setHours(0,0,0,0); matchesDate = matchesDate && new Date(t.date) >= s; }
      if (endDate) { const e = new Date(endDate); e.setHours(23,59,59,999); matchesDate = matchesDate && new Date(t.date) <= e; }
      return matchesText && matchesDate && matchesLock && matchesFrom && matchesTo;
    });
  }, [selectedType, sortedTransactions, lockFilter, fromFilter, toFilter, filterText, startDate, endDate]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginatedData = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
  const rangeStart = filtered.length === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1;
  const rangeEnd = Math.min(currentPage * ITEMS_PER_PAGE, filtered.length);

  const hasAdvancedFilter = fromFilter !== '' || toFilter !== '' || startDate !== '' || endDate !== '' || lockFilter !== 'All';
  const activeFilterCount = [fromFilter !== '', toFilter !== '', startDate !== '', endDate !== '', lockFilter !== 'All'].filter(Boolean).length;

  const handleDeleteClick = (t: Transaction) => {
    if (t.isLocked && user?.role !== 'admin') { alert('This transaction is locked.'); return; }
    setDeleteId(t.id);
  };
  const confirmDelete = () => { if (deleteId) { deleteTransaction(deleteId); setDeleteId(null); } };

  const handleExport = () => {
    const exportData = filtered.map(t => ({
      Date: new Date(t.date).toLocaleDateString(),
      Type: t.type,
      Description: t.description,
      From: getEntityName(t.fromEntityId, t.fromEntityType),
      To: getEntityName(t.toEntityId, t.toEntityType),
      Amount: t.amount,
      Locked: t.isLocked ? 'Yes' : 'No'
    }));
    utils.downloadCSV(exportData, `transactions_${selectedType}.csv`);
  };

  const clearFilters = () => {
    setFilterText(''); setLockFilter('All');
    setFromFilter(''); setToFilter(''); setStartDate(''); setEndDate('');
    setCurrentPage(1);
  };

  const handleSelectType = (type: string) => {
    setSelectedType(type);
    clearFilters();
    setShowAdvanced(false);
  };

  const handleBackToOverview = () => {
    setSelectedType(null);
    clearFilters();
    setShowAdvanced(false);
  };

  const sortedAccounts = useMemo(() => [...accounts].sort((a, b) => a.name.localeCompare(b.name)), [accounts]);
  const sortedCandidates = useMemo(() => [...candidates].sort((a, b) => a.name.localeCompare(b.name)), [candidates]);

  const entityFilterOptions = useMemo((): SearchableSelectOption[] => [
    ...sortedAccounts.map(a => ({ value: a.id, label: a.name, group: 'Accounts', meta: a.type })),
    ...sortedCandidates.map(c => ({ value: c.id, label: c.name, group: 'Candidates', meta: c.batchId })),
  ], [sortedAccounts, sortedCandidates]);

  const typeAmountColors: Record<string, string> = {
    [TransactionType.Income]: 'text-emerald-600',
    [TransactionType.Payment]: 'text-red-600',
    [TransactionType.Transfer]: 'text-blue-600',
    [TransactionType.Refund]: 'text-amber-600',
  };

  // ── OVERVIEW VIEW ─────────────────────────────────────────────────────────
  if (!selectedType) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h1 className="text-3xl font-bold text-gray-900">Transactions</h1>
          <Link to="/finance/transactions/new">
            <Button>
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                New Transaction
              </span>
            </Button>
          </Link>
        </div>

        {/* Type Navigation Tiles */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.values(TransactionType).map(type => {
            const cfg = TYPE_CONFIG[type];
            const totals = typeTotals[type];
            return (
              <button
                key={type}
                onClick={() => handleSelectType(type)}
                className={`group text-left p-5 rounded-2xl border-2 ${cfg.bg} ${cfg.border} hover:shadow-md transition-all hover:-translate-y-0.5`}
              >
                <div className={`${cfg.textColor} mb-3`}>{cfg.icon}</div>
                <div className={`text-lg font-bold ${cfg.textColor}`}>{cfg.label}</div>
                <div className={`text-2xl font-bold tabular-nums mt-1 ${typeAmountColors[type]}`}>
                  {utils.formatCurrency(totals.amount)}
                </div>
                <div className="text-xs text-gray-400 mt-1">{totals.count} transaction{totals.count !== 1 ? 's' : ''}</div>
                <div className={`text-xs font-medium mt-3 flex items-center gap-1 ${cfg.textColor} opacity-0 group-hover:opacity-100 transition-opacity`}>
                  View all <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7"/></svg>
                </div>
              </button>
            );
          })}
        </div>

        {/* Recent Transactions preview */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Recent Transactions</h2>
            <span className="text-xs text-gray-400">{transactions.length} total</span>
          </div>
          <div className="divide-y divide-gray-50">
            {sortedTransactions.slice(0, 8).map(t => {
              const cfg = TYPE_CONFIG[t.type];
              const toName = getEntityName(t.toEntityId, t.toEntityType);
              const fromName = getEntityName(t.fromEntityId, t.fromEntityType);
              const primaryParty = t.type === TransactionType.Income ? fromName : toName;
              return (
                <div key={t.id} className="flex items-center justify-between py-3 gap-3">
                  <div className={`w-8 h-8 rounded-full ${cfg.bg} ${cfg.textColor} flex items-center justify-center shrink-0`}>
                    <div className="w-4 h-4">{cfg.icon}</div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-gray-800 truncate">{primaryParty}</div>
                    <div className="text-xs text-gray-400 truncate">{t.description}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className={`text-sm font-bold tabular-nums ${typeAmountColors[t.type]}`}>
                      {t.type === TransactionType.Income ? '+' : t.type === TransactionType.Payment ? '−' : ''}{utils.formatCurrency(t.amount)}
                    </div>
                    <div className="text-[10px] text-gray-400">{new Date(t.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</div>
                  </div>
                </div>
              );
            })}
          </div>
          {transactions.length === 0 && (
            <div className="py-8 text-center text-gray-400 text-sm">No transactions yet.</div>
          )}
        </Card>
      </div>
    );
  }

  // ── FILTERED TYPE VIEW ────────────────────────────────────────────────────
  const cfg = TYPE_CONFIG[selectedType];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={handleBackToOverview}
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            <span>All Types</span>
          </button>
          <span className="text-gray-300">/</span>
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full border ${cfg.bg} ${cfg.border} ${cfg.textColor}`}>
            <div className="w-4 h-4">{cfg.icon}</div>
            <span className="font-bold text-sm">{cfg.label}</span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={handleExport}>Export CSV</Button>
          <Link to="/finance/transactions/new">
            <Button>+ New Entry</Button>
          </Link>
        </div>
      </div>

      <Card>
        {/* Compact Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="flex-1">
            <SearchInput
              placeholder={`Search ${cfg.label.toLowerCase()}...`}
              value={filterText}
              onChange={e => { setFilterText(e.target.value); setCurrentPage(1); }}
              onClear={() => { setFilterText(''); setCurrentPage(1); }}
            />
          </div>
          <button
            onClick={() => setShowAdvanced(v => !v)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-colors whitespace-nowrap ${showAdvanced || hasAdvancedFilter ? `${cfg.bg} ${cfg.border} ${cfg.textColor}` : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" /></svg>
            Filters
            {activeFilterCount > 0 && (
              <span className="bg-indigo-600 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">{activeFilterCount}</span>
            )}
          </button>
        </div>

        {/* Advanced Filters Panel */}
        {showAdvanced && (
          <div className="mb-4 p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-3 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <SearchableSelect
                  label="Source (From)"
                  value={fromFilter}
                  onChange={v => { setFromFilter(v); setCurrentPage(1); }}
                  options={entityFilterOptions}
                  placeholder="All Sources"
                  containerClassName=""
                />
              </div>
              <div>
                <SearchableSelect
                  label="Destination (To)"
                  value={toFilter}
                  onChange={v => { setToFilter(v); setCurrentPage(1); }}
                  options={entityFilterOptions}
                  placeholder="All Destinations"
                  containerClassName=""
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="text-[10px] font-bold uppercase text-gray-400 mb-1 block">Status</label>
                <select className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 w-full focus:ring-1 focus:ring-spr-accent outline-none"
                  value={lockFilter} onChange={e => { setLockFilter(e.target.value); setCurrentPage(1); }}>
                  <option value="All">All</option>
                  <option value="Locked">Locked</option>
                  <option value="Unlocked">Unlocked</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase text-gray-400 mb-1 block">From Date</label>
                <input type="date" className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 w-full focus:ring-1 focus:ring-spr-accent outline-none"
                  value={startDate} onChange={e => { setStartDate(e.target.value); setCurrentPage(1); }} />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase text-gray-400 mb-1 block">To Date</label>
                <input type="date" className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 w-full focus:ring-1 focus:ring-spr-accent outline-none"
                  value={endDate} onChange={e => { setEndDate(e.target.value); setCurrentPage(1); }} />
              </div>
            </div>
            {hasAdvancedFilter && (
              <button onClick={clearFilters} className="text-xs text-red-500 hover:text-red-700 font-medium flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                Clear all filters
              </button>
            )}
          </div>
        )}

        {/* Results bar */}
        <div className="flex items-center justify-between mb-3 text-sm text-gray-500 border-t border-gray-100 pt-3">
          <span>
            Showing <span className="font-bold text-gray-800">{rangeStart}–{rangeEnd}</span> of{' '}
            <span className="font-bold text-gray-800">{filtered.length}</span> {cfg.label.toLowerCase()}
            {filtered.length !== typeTotals[selectedType].count && <span className="text-gray-400 ml-1">(filtered from {typeTotals[selectedType].count})</span>}
          </span>
          <span className={`font-bold tabular-nums text-sm ${typeAmountColors[selectedType]}`}>
            Total: {utils.formatCurrency(filtered.reduce((s, t) => s + t.amount, 0))}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-gray-600">
            <thead>
              <tr className="border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500 bg-gray-50">
                <th className="py-3 px-4 w-32">Date</th>
                <th className="py-3 px-4">Party / Details</th>
                <th className="py-3 px-4 text-right">Amount</th>
                <th className="py-3 px-4 text-center w-24">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedData.length > 0 ? paginatedData.map(t => {
                const isLocked = t.isLocked;
                const isEditable = !isLocked || user?.role === 'admin';
                const fromName = getEntityName(t.fromEntityId, t.fromEntityType);
                const toName = getEntityName(t.toEntityId, t.toEntityType);
                const primaryParty = t.type === TransactionType.Income ? fromName : toName;
                return (
                  <tr key={t.id} className={`hover:bg-gray-50/80 transition-colors ${isLocked ? 'opacity-75' : ''}`}>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-800">
                        {new Date(t.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                      </div>
                      <div className="text-[10px] text-gray-400">{new Date(t.date).getFullYear()}</div>
                    </td>
                    <td className="py-3 px-4 cursor-pointer" onClick={() => setViewTransaction(t)}>
                      <div className="flex items-center gap-2 min-w-0">
                        <span className={`font-semibold text-sm truncate ${isLocked ? 'text-gray-500' : 'text-gray-900 hover:text-indigo-700'}`}>
                          {primaryParty}
                        </span>
                        {isLocked && (
                          <svg className="w-3.5 h-3.5 text-amber-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                        )}
                      </div>
                      <div className="text-xs text-gray-400 truncate max-w-[240px] mt-0.5">{t.description}</div>
                      <div className="flex items-center gap-1 mt-0.5 text-[10px] text-gray-400">
                        <span className="truncate max-w-[100px]" title={fromName}>{fromName}</span>
                        <svg className="w-3 h-3 shrink-0 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/></svg>
                        <span className="truncate max-w-[100px]" title={toName}>{toName}</span>
                      </div>
                    </td>
                    <td className={`py-3 px-4 text-right font-mono font-bold whitespace-nowrap tabular-nums text-sm ${typeAmountColors[t.type] || 'text-gray-700'}`}>
                      {t.type === TransactionType.Income ? '+' : t.type === TransactionType.Payment ? '−' : ''}{utils.formatCurrency(t.amount)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex justify-center gap-1">
                        <button onClick={() => setViewTransaction(t)} className="text-gray-400 hover:text-gray-700 p-1.5 rounded hover:bg-gray-100 transition-colors" title="View">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                        {isEditable ? (
                          <>
                            <button onClick={() => navigate(`/finance/transactions/edit/${t.id}`)} className="text-blue-400 hover:text-blue-700 p-1.5 rounded hover:bg-blue-50 transition-colors" title="Edit">
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button onClick={() => handleDeleteClick(t)} className="text-red-400 hover:text-red-700 p-1.5 rounded hover:bg-red-50 transition-colors" title="Delete">
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </>
                        ) : (
                          <span className="p-1.5 text-gray-300" title="Locked">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan={4} className="py-12 text-center">
                    <div className="flex flex-col items-center text-gray-400 opacity-60">
                      <svg className="w-10 h-10 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                      <p className="font-medium text-gray-500">No {cfg.label.toLowerCase()} found.</p>
                      {(filterText || hasAdvancedFilter) && (
                        <button onClick={clearFilters} className="mt-2 text-xs text-indigo-500 hover:underline">Clear filters</button>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={p => setCurrentPage(p)} />
      </Card>

      {/* Transaction Detail Modal */}
      <Modal isOpen={!!viewTransaction} onClose={() => setViewTransaction(null)} title="Transaction Details">
        {viewTransaction && (
          <div className="space-y-5">
            <div className="text-center pb-4 border-b border-gray-100">
              <p className="text-gray-500 text-xs uppercase tracking-wider font-bold mb-1">Amount</p>
              <p className={`text-4xl font-bold tabular-nums ${typeAmountColors[viewTransaction.type] || 'text-gray-900'}`}>
                {viewTransaction.type === TransactionType.Income ? '+' : viewTransaction.type === TransactionType.Payment ? '−' : ''}{utils.formatCurrency(viewTransaction.amount)}
              </p>
              <span className="mt-2 inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-700">{viewTransaction.type}</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 uppercase font-bold mb-1">Date</p>
                <p className="text-gray-900 font-medium">{new Date(viewTransaction.date).toDateString()}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-bold mb-1">Transaction ID</p>
                <p className="text-gray-400 font-mono text-xs truncate" title={viewTransaction.id}>{viewTransaction.id}</p>
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase font-bold mb-1">Description</p>
              <p className="text-gray-900 font-medium leading-relaxed">{viewTransaction.description}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 space-y-3">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-[10px] text-gray-400 uppercase font-bold">From (Source)</p>
                  <p className="text-indigo-700 font-bold">{getEntityName(viewTransaction.fromEntityId, viewTransaction.fromEntityType)}</p>
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full bg-white border border-gray-200 text-gray-500 font-medium">{viewTransaction.fromEntityType}</span>
              </div>
              <div className="flex justify-center">
                <svg className="w-4 h-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </div>
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-[10px] text-gray-400 uppercase font-bold">To (Destination)</p>
                  <p className="text-indigo-700 font-bold">{getEntityName(viewTransaction.toEntityId, viewTransaction.toEntityType)}</p>
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full bg-white border border-gray-200 text-gray-500 font-medium">{viewTransaction.toEntityType}</span>
              </div>
            </div>
            {viewTransaction.isLocked && (
              <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-sm">
                <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                This transaction is locked and cannot be modified by staff.
              </div>
            )}
            <div className="flex gap-2 justify-end pt-1">
              {(!viewTransaction.isLocked || user?.role === 'admin') && (
                <Button variant="secondary" onClick={() => { navigate(`/finance/transactions/edit/${viewTransaction.id}`); setViewTransaction(null); }}>Edit</Button>
              )}
              <Button variant="secondary" onClick={() => setViewTransaction(null)}>Close</Button>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmationModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={confirmDelete}
        title="Delete Transaction"
        message="Are you sure you want to delete this transaction? This will affect account balances."
      />
    </div>
  );
};
