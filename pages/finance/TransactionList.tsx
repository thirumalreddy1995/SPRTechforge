import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Button, Pagination, Modal, ConfirmationModal, SearchableSelect, SearchableSelectOption } from '../../components/Components';
import { Link, useNavigate } from 'react-router-dom';
import * as utils from '../../utils';
import { TransactionType, Transaction } from '../../types';

// ─── Type Config ──────────────────────────────────────────────────────────────
const TYPE_CFG: Record<string, { label: string; bgBadge: string; textBadge: string; dotColor: string; amtColor: string; prefix: string }> = {
  [TransactionType.Income]:   { label: 'Income',   bgBadge: 'bg-emerald-50',  textBadge: 'text-emerald-700', dotColor: 'bg-emerald-500', amtColor: 'text-emerald-600', prefix: '+' },
  [TransactionType.Payment]:  { label: 'Payment',  bgBadge: 'bg-red-50',      textBadge: 'text-red-700',     dotColor: 'bg-red-500',     amtColor: 'text-red-600',     prefix: '−' },
  [TransactionType.Transfer]: { label: 'Transfer', bgBadge: 'bg-blue-50',     textBadge: 'text-blue-700',    dotColor: 'bg-blue-500',    amtColor: 'text-blue-600',    prefix: ''  },
  [TransactionType.Refund]:   { label: 'Refund',   bgBadge: 'bg-amber-50',    textBadge: 'text-amber-700',   dotColor: 'bg-amber-500',   amtColor: 'text-amber-600',   prefix: ''  },
};

const ITEMS_PER_PAGE = 15;

export const TransactionList: React.FC = () => {
  const { transactions, getEntityName, deleteTransaction, user, accounts, candidates } = useApp();
  const navigate = useNavigate();

  const [typeFilter, setTypeFilter]     = useState<string>('All');
  const [fromFilter, setFromFilter]     = useState<string>('');
  const [toFilter, setToFilter]         = useState<string>('');
  const [lockFilter, setLockFilter]     = useState<string>('All');
  const [startDate, setStartDate]       = useState('');
  const [endDate, setEndDate]           = useState('');
  const [search, setSearch]             = useState('');
  const [showFilters, setShowFilters]   = useState(false);
  const [currentPage, setCurrentPage]   = useState(1);
  const [viewTxn, setViewTxn]           = useState<Transaction | null>(null);
  const [deleteId, setDeleteId]         = useState<string | null>(null);

  // Summary totals
  const typeTotals = useMemo(() => {
    const t: Record<string, number> = {};
    Object.values(TransactionType).forEach(type => {
      t[type] = transactions.filter(tx => tx.type === type).reduce((s, tx) => s + tx.amount, 0);
    });
    return t;
  }, [transactions]);

  // Entity options for filters
  const entityOptions = useMemo((): SearchableSelectOption[] => [
    ...accounts.sort((a, b) => a.name.localeCompare(b.name)).map(a => ({ value: a.id, label: a.name, group: a.type, meta: a.subType })),
    ...candidates.sort((a, b) => a.name.localeCompare(b.name)).map(c => ({ value: c.id, label: c.name, group: 'Candidates' })),
  ], [accounts, candidates]);

  // Filtered + sorted
  const filtered = useMemo(() => {
    return [...transactions]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .filter(t => {
        if (typeFilter !== 'All' && t.type !== typeFilter) return false;
        if (fromFilter && t.fromEntityId !== fromFilter) return false;
        if (toFilter && t.toEntityId !== toFilter) return false;
        if (lockFilter === 'Locked' && !t.isLocked) return false;
        if (lockFilter === 'Unlocked' && t.isLocked) return false;
        if (startDate) {
          const s = new Date(startDate); s.setHours(0, 0, 0, 0);
          if (new Date(t.date) < s) return false;
        }
        if (endDate) {
          const e = new Date(endDate); e.setHours(23, 59, 59, 999);
          if (new Date(t.date) > e) return false;
        }
        if (search) {
          const q = search.toLowerCase();
          const fromName = getEntityName(t.fromEntityId, t.fromEntityType).toLowerCase();
          const toName   = getEntityName(t.toEntityId,   t.toEntityType).toLowerCase();
          if (!t.description.toLowerCase().includes(q) && !fromName.includes(q) && !toName.includes(q)) return false;
        }
        return true;
      });
  }, [transactions, typeFilter, fromFilter, toFilter, lockFilter, startDate, endDate, search, getEntityName]);

  const totalFiltered = filtered.reduce((s, t) => {
    if (t.type === TransactionType.Income) return s + t.amount;
    if (t.type === TransactionType.Payment) return s - t.amount;
    return s;
  }, 0);

  const totalPages    = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated     = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
  const hasFilter     = typeFilter !== 'All' || fromFilter || toFilter || lockFilter !== 'All' || startDate || endDate || search;
  const activeFilters = [typeFilter !== 'All', !!fromFilter, !!toFilter, lockFilter !== 'All', !!startDate, !!endDate].filter(Boolean).length;

  const clearFilters = () => {
    setTypeFilter('All'); setFromFilter(''); setToFilter(''); setLockFilter('All');
    setStartDate(''); setEndDate(''); setSearch(''); setCurrentPage(1);
  };

  const handleDelete = (t: Transaction) => {
    if (t.isLocked && user?.role !== 'admin') { alert('This transaction is locked and cannot be deleted.'); return; }
    setDeleteId(t.id);
  };

  const handleExport = () => {
    const data = filtered.map(t => ({
      Date: new Date(t.date).toLocaleDateString('en-IN'),
      Type: t.type,
      Description: t.description,
      'Credit Account': getEntityName(t.fromEntityId, t.fromEntityType),
      'Debit Account':  getEntityName(t.toEntityId,   t.toEntityType),
      Amount: t.amount,
      Locked: t.isLocked ? 'Yes' : 'No',
    }));
    utils.downloadCSV(data, 'transaction_register.csv');
  };

  return (
    <div className="space-y-5">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Transaction Register</h1>
          <p className="text-sm text-gray-500 mt-0.5">{transactions.length} entries · Double-entry ledger</p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleExport} className="inline-flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-600 text-sm font-medium px-3 py-2 rounded-lg border border-gray-200 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            Export
          </button>
          <Link to="/finance/transactions/new">
            <button className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors shadow-sm">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              New Entry
            </button>
          </Link>
        </div>
      </div>

      {/* ── Summary Tiles ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {Object.values(TransactionType).map(type => {
          const cfg   = TYPE_CFG[type];
          const count = transactions.filter(t => t.type === type).length;
          const isActive = typeFilter === type;
          return (
            <button
              key={type}
              onClick={() => { setTypeFilter(isActive ? 'All' : type); setCurrentPage(1); }}
              className={`text-left p-4 rounded-xl border-2 transition-all ${isActive ? `${cfg.bgBadge} border-current ${cfg.textBadge} shadow-sm` : 'bg-white border-gray-100 hover:border-gray-200 hover:shadow-sm'}`}
            >
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-2.5 h-2.5 rounded-full ${cfg.dotColor}`} />
                <span className={`text-xs font-bold uppercase tracking-wider ${isActive ? cfg.textBadge : 'text-gray-400'}`}>{cfg.label}</span>
              </div>
              <div className={`text-xl font-bold tabular-nums ${isActive ? cfg.amtColor : 'text-gray-800'}`}>
                {utils.formatCurrency(typeTotals[type] || 0)}
              </div>
              <div className="text-[10px] text-gray-400 mt-0.5">{count} transaction{count !== 1 ? 's' : ''}</div>
            </button>
          );
        })}
      </div>

      {/* ── Filter Bar ──────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-50">
          <div className="flex-1 relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
              placeholder="Search transactions, accounts, descriptions…"
              value={search}
              onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
            />
          </div>

          {/* Type pill tabs */}
          <div className="hidden md:flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            {['All', ...Object.values(TransactionType)].map(t => (
              <button
                key={t}
                onClick={() => { setTypeFilter(t); setCurrentPage(1); }}
                className={`text-xs font-semibold px-3 py-1.5 rounded-md transition-all ${typeFilter === t ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                {t === 'All' ? 'All' : TYPE_CFG[t]?.label || t}
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowFilters(v => !v)}
            className={`flex items-center gap-2 text-sm font-medium px-3 py-2 rounded-lg border transition-colors shrink-0 ${showFilters || activeFilters > 0 ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" /></svg>
            Filters
            {activeFilters > 0 && (
              <span className="bg-blue-600 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">{activeFilters}</span>
            )}
          </button>
        </div>

        {/* Advanced Filters Panel */}
        {showFilters && (
          <div className="px-4 py-4 bg-gray-50/60 border-b border-gray-100 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
            <SearchableSelect
              label="Credit Account (From)"
              value={fromFilter}
              onChange={v => { setFromFilter(v); setCurrentPage(1); }}
              options={entityOptions}
              placeholder="All"
              containerClassName=""
            />
            <SearchableSelect
              label="Debit Account (To)"
              value={toFilter}
              onChange={v => { setToFilter(v); setCurrentPage(1); }}
              options={entityOptions}
              placeholder="All"
              containerClassName=""
            />
            <div>
              <label className="text-[10px] font-bold uppercase text-gray-500 mb-1 block">Status</label>
              <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-blue-400" value={lockFilter} onChange={e => setLockFilter(e.target.value)}>
                <option value="All">All</option>
                <option value="Locked">Locked</option>
                <option value="Unlocked">Unlocked</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase text-gray-500 mb-1 block">From Date</label>
              <input type="date" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-blue-400" value={startDate} onChange={e => { setStartDate(e.target.value); setCurrentPage(1); }} />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase text-gray-500 mb-1 block">To Date</label>
              <input type="date" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-blue-400" value={endDate} onChange={e => { setEndDate(e.target.value); setCurrentPage(1); }} />
            </div>
          </div>
        )}

        {/* Results bar */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-50 text-xs text-gray-500">
          <span>
            <span className="font-semibold text-gray-800">{filtered.length}</span> entries
            {hasFilter && <span className="ml-1">(filtered from {transactions.length})</span>}
          </span>
          <div className="flex items-center gap-4">
            {filtered.length > 0 && (
              <span className={`font-bold tabular-nums text-sm ${totalFiltered >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                Net: {totalFiltered >= 0 ? '+' : '−'}{utils.formatCurrency(Math.abs(totalFiltered))}
              </span>
            )}
            {hasFilter && (
              <button onClick={clearFilters} className="text-red-500 hover:text-red-700 font-semibold flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                Clear
              </button>
            )}
          </div>
        </div>

        {/* ── Table ─────────────────────────────────────────────────────────── */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-[11px] uppercase font-bold text-gray-400 tracking-wider">
                <th className="py-3 px-4 w-32">Date</th>
                <th className="py-3 px-4">Description / Particulars</th>
                <th className="py-3 px-4 hidden md:table-cell">Credit (From)</th>
                <th className="py-3 px-4 hidden md:table-cell">Debit (To)</th>
                <th className="py-3 px-4 text-right">Amount</th>
                <th className="py-3 px-4 text-center w-8">Type</th>
                <th className="py-3 px-4 text-center w-24">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center">
                    <div className="flex flex-col items-center text-gray-400">
                      <svg className="w-10 h-10 mb-2 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                      <p className="text-sm font-medium text-gray-500">No transactions found</p>
                      {hasFilter && <button onClick={clearFilters} className="mt-1 text-xs text-blue-500 hover:underline">Clear filters</button>}
                    </div>
                  </td>
                </tr>
              ) : paginated.map(t => {
                const cfg = TYPE_CFG[t.type];
                const isEditable = !t.isLocked || user?.role === 'admin';
                const fromName = getEntityName(t.fromEntityId, t.fromEntityType);
                const toName   = getEntityName(t.toEntityId,   t.toEntityType);
                return (
                  <tr key={t.id} className={`hover:bg-blue-50/30 transition-colors ${t.isLocked ? 'opacity-80' : ''}`}>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="font-medium text-gray-800">
                        {new Date(t.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                      </div>
                      <div className="text-[10px] text-gray-400">{new Date(t.date).getFullYear()}</div>
                    </td>
                    <td className="py-3 px-4 cursor-pointer max-w-[220px]" onClick={() => setViewTxn(t)}>
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="font-semibold text-gray-900 truncate hover:text-blue-700">{t.description || '—'}</span>
                        {t.isLocked && (
                          <svg className="w-3.5 h-3.5 text-amber-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                        )}
                      </div>
                      <div className="text-xs text-gray-400 truncate mt-0.5 md:hidden">{fromName} → {toName}</div>
                    </td>
                    <td className="py-3 px-4 hidden md:table-cell text-gray-600 text-xs max-w-[160px]">
                      <span className="truncate block" title={fromName}>{fromName}</span>
                    </td>
                    <td className="py-3 px-4 hidden md:table-cell text-gray-600 text-xs max-w-[160px]">
                      <span className="truncate block" title={toName}>{toName}</span>
                    </td>
                    <td className={`py-3 px-4 text-right font-bold tabular-nums whitespace-nowrap ${cfg.amtColor}`}>
                      {cfg.prefix}{utils.formatCurrency(t.amount)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${cfg.bgBadge} ${cfg.textBadge}`}>
                        {cfg.label}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex justify-center gap-1">
                        <button onClick={() => setViewTxn(t)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors" title="View details">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                        </button>
                        {isEditable ? (
                          <>
                            <button onClick={() => navigate(`/finance/transactions/edit/${t.id}`)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors" title="Edit">
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                            </button>
                            <button onClick={() => handleDelete(t)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors" title="Delete">
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </button>
                          </>
                        ) : (
                          <span className="p-1.5 text-amber-400" title="Locked — admin only">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-4 py-3 border-t border-gray-50">
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={p => setCurrentPage(p)} />
        </div>
      </div>

      {/* ── Detail Modal ─────────────────────────────────────────────────────── */}
      <Modal isOpen={!!viewTxn} onClose={() => setViewTxn(null)} title="Journal Entry Details">
        {viewTxn && (() => {
          const cfg = TYPE_CFG[viewTxn.type];
          const fromName = getEntityName(viewTxn.fromEntityId, viewTxn.fromEntityType);
          const toName   = getEntityName(viewTxn.toEntityId,   viewTxn.toEntityType);
          return (
            <div className="space-y-5">
              {/* Amount + type badge */}
              <div className="text-center pb-4 border-b border-gray-100">
                <p className="text-xs uppercase font-bold text-gray-400 mb-2">{cfg.label} Entry</p>
                <p className={`text-4xl font-bold tabular-nums ${cfg.amtColor}`}>
                  {cfg.prefix}{utils.formatCurrency(viewTxn.amount)}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {new Date(viewTxn.date).toLocaleDateString('en-IN', { weekday: 'short', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>

              {/* Description */}
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase mb-1">Description / Memo</p>
                <p className="text-gray-900 font-medium">{viewTxn.description || '—'}</p>
              </div>

              {/* Double-entry table */}
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase mb-2">Journal Entry Lines</p>
                <div className="border border-gray-200 rounded-xl overflow-hidden text-sm">
                  <table className="w-full">
                    <thead className="bg-gray-50 text-[11px] uppercase font-bold text-gray-400">
                      <tr>
                        <th className="py-2 px-3 text-left">Account</th>
                        <th className="py-2 px-3 text-right">Debit (Dr)</th>
                        <th className="py-2 px-3 text-right">Credit (Cr)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      <tr>
                        <td className="py-2.5 px-3">
                          <div className="font-medium text-gray-900">{toName}</div>
                          <div className="text-[10px] text-gray-400">{viewTxn.toEntityType}</div>
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold text-gray-900 tabular-nums">{utils.formatCurrency(viewTxn.amount)}</td>
                        <td className="py-2.5 px-3 text-right text-gray-300">—</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-3">
                          <div className="font-medium text-gray-900">{fromName}</div>
                          <div className="text-[10px] text-gray-400">{viewTxn.fromEntityType}</div>
                        </td>
                        <td className="py-2.5 px-3 text-right text-gray-300">—</td>
                        <td className="py-2.5 px-3 text-right font-bold text-gray-900 tabular-nums">{utils.formatCurrency(viewTxn.amount)}</td>
                      </tr>
                    </tbody>
                    <tfoot className="bg-gray-50 text-xs font-bold">
                      <tr>
                        <td className="py-2 px-3 text-gray-500">Total</td>
                        <td className="py-2 px-3 text-right text-gray-900 tabular-nums">{utils.formatCurrency(viewTxn.amount)}</td>
                        <td className="py-2 px-3 text-right text-gray-900 tabular-nums">{utils.formatCurrency(viewTxn.amount)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {viewTxn.isLocked && (
                <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-xs">
                  <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                  This entry is locked — only administrators can edit or delete it.
                </div>
              )}

              <div className="flex justify-end gap-2 pt-1">
                {(!viewTxn.isLocked || user?.role === 'admin') && (
                  <Button variant="secondary" onClick={() => { navigate(`/finance/transactions/edit/${viewTxn.id}`); setViewTxn(null); }}>Edit</Button>
                )}
                <Button variant="secondary" onClick={() => setViewTxn(null)}>Close</Button>
              </div>
            </div>
          );
        })()}
      </Modal>

      <ConfirmationModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => { if (deleteId) { deleteTransaction(deleteId); setDeleteId(null); } }}
        title="Delete Transaction"
        message="Are you sure you want to delete this transaction? This action will affect account balances and cannot be undone."
      />
    </div>
  );
};
