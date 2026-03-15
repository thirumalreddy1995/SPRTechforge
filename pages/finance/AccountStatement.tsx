import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { useParams, useNavigate } from 'react-router-dom';
import * as utils from '../../utils';
import { AccountType } from '../../types';

export const AccountStatement: React.FC = () => {
  const { transactions, getEntityName, accounts, candidates } = useApp();
  const { type, id } = useParams<{ type: string; id: string }>();
  const navigate = useNavigate();

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate]     = useState('');

  if (!type || !id) return <div className="p-8 text-gray-500">Invalid parameters.</div>;

  const accountObj   = type === 'Account'   ? accounts.find(a => a.id === id)   : null;
  const candidateObj = type === 'Candidate' ? candidates.find(c => c.id === id) : null;
  const entityName   = candidateObj?.name || accountObj?.name;

  if (!entityName) return <div className="p-8 text-gray-500">Entity not found.</div>;

  // Account nature flags
  const isIncomeNature    = accountObj?.type === AccountType.Income  || accountObj?.type === AccountType.Equity;
  const isLiabilityNature = accountObj?.type === AccountType.Creditor || accountObj?.type === AccountType.Salary;

  // All history for this entity (unfiltered)
  const allHistory = useMemo(() =>
    transactions
      .filter(t =>
        (t.fromEntityId === id && t.fromEntityType === type) ||
        (t.toEntityId   === id && t.toEntityType   === type)
      )
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
    [transactions, id, type]
  );

  // Date-filtered history
  const history = useMemo(() =>
    allHistory.filter(t => {
      if (startDate) {
        const s = new Date(startDate); s.setHours(0, 0, 0, 0);
        if (new Date(t.date) < s) return false;
      }
      if (endDate) {
        const e = new Date(endDate); e.setHours(23, 59, 59, 999);
        if (new Date(t.date) > e) return false;
      }
      return true;
    }),
    [allHistory, startDate, endDate]
  );

  // Opening balance (starting point before filtered transactions)
  let openingBal = 0;
  if (type === 'Account' && accountObj) {
    openingBal = isLiabilityNature ? -accountObj.openingBalance : accountObj.openingBalance;
  }

  // If date filtered, add impact of all transactions before startDate
  if (startDate && type === 'Account' && accountObj) {
    const beforeStart = allHistory.filter(t => {
      const s = new Date(startDate); s.setHours(0, 0, 0, 0);
      return new Date(t.date) < s;
    });
    beforeStart.forEach(t => {
      const isTo = t.toEntityId === id && t.toEntityType === type;
      openingBal += isTo
        ? (isIncomeNature ? -t.amount : t.amount)
        : (isIncomeNature ?  t.amount : -t.amount);
    });
  }

  // Build rows with running balance
  let running = openingBal;
  const rows = history.map(t => {
    const isTo  = t.toEntityId === id && t.toEntityType === type;
    const delta = isTo
      ? (isIncomeNature ? -t.amount :  t.amount)
      : (isIncomeNature ?  t.amount : -t.amount);
    running += delta;

    const debit  = delta < 0 ? Math.abs(delta) : 0;
    const credit = delta > 0 ? delta : 0;
    return { ...t, debit, credit, runningBalance: running };
  });

  // Summary
  const totalDebits  = rows.reduce((s, r) => s + r.debit, 0);
  const totalCredits = rows.reduce((s, r) => s + r.credit, 0);
  const closingBalance = rows.length > 0 ? rows[rows.length - 1].runningBalance : openingBal;

  const isDateFiltered = startDate !== '' || endDate !== '';

  const handleDownload = () => {
    const data = rows.map(r => ({
      Date:           new Date(r.date).toLocaleDateString('en-IN'),
      Description:    r.description,
      Party:          r.debit > 0
        ? `To: ${getEntityName(r.toEntityId, r.toEntityType)}`
        : `From: ${getEntityName(r.fromEntityId, r.fromEntityType)}`,
      Debit:          r.debit  || '',
      Credit:         r.credit || '',
      'Balance':      r.runningBalance,
    }));
    utils.downloadCSV(data, `${entityName}_ledger.csv`);
  };

  return (
    <div className="space-y-5">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row justify-between md:items-start gap-4">
        <div>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-700 mb-3 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            Back
          </button>
          <h1 className="text-2xl font-bold text-gray-900">{entityName}</h1>
          <div className="flex flex-wrap items-center gap-2 mt-1.5">
            <span className="text-[10px] font-bold uppercase px-2 py-0.5 bg-gray-100 text-gray-500 rounded">{type}</span>
            {accountObj?.type && (
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 bg-blue-50 text-blue-600 rounded">{accountObj.type}</span>
            )}
            {accountObj?.subType && (
              <span className="text-xs text-gray-400">Group: {accountObj.subType}</span>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleDownload}
            className="inline-flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-600 text-sm font-medium px-4 py-2 rounded-lg border border-gray-200 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            Download CSV
          </button>
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-600 text-sm font-medium px-4 py-2 rounded-lg border border-gray-200 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
            Print
          </button>
        </div>
      </div>

      {/* ── KPI Cards ──────────────────────────────────────────────────────── */}
      <div className={`grid gap-4 ${type === 'Account' ? 'grid-cols-2 md:grid-cols-4' : 'grid-cols-3'}`}>
        {type === 'Account' && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Opening Balance</p>
            <p className={`text-xl font-bold mt-1 tabular-nums ${openingBal >= 0 ? 'text-gray-700' : 'text-red-600'}`}>
              {utils.formatCurrency(openingBal)}
            </p>
          </div>
        )}
        <div className="bg-white rounded-xl border border-gray-100 border-l-4 border-l-emerald-400 shadow-sm p-4">
          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Total Credits (+)</p>
          <p className="text-xl font-bold mt-1 text-emerald-600 tabular-nums">{utils.formatCurrency(totalCredits)}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 border-l-4 border-l-red-400 shadow-sm p-4">
          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Total Debits (−)</p>
          <p className="text-xl font-bold mt-1 text-red-600 tabular-nums">{utils.formatCurrency(totalDebits)}</p>
        </div>
        <div className={`bg-white rounded-xl border border-gray-100 border-l-4 shadow-sm p-4 ${closingBalance >= 0 ? 'border-l-blue-500' : 'border-l-red-500'}`}>
          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
            {isDateFiltered ? 'Period Closing' : 'Closing Balance'}
          </p>
          <p className={`text-xl font-bold mt-1 tabular-nums ${closingBalance >= 0 ? 'text-blue-700' : 'text-red-600'}`}>
            {utils.formatCurrency(closingBalance)}
          </p>
        </div>
      </div>

      {/* ── Date Range Filter ─────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-5 py-3.5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Filter Period</span>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400 font-medium w-6">From</span>
          <input
            type="date"
            className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-400"
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400 font-medium w-4">To</span>
          <input
            type="date"
            className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-400"
            value={endDate}
            onChange={e => setEndDate(e.target.value)}
          />
        </div>
        {isDateFiltered && (
          <>
            <button onClick={() => { setStartDate(''); setEndDate(''); }}
              className="text-xs text-red-500 hover:text-red-700 font-medium flex items-center gap-1 whitespace-nowrap">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
              Clear dates
            </button>
            <span className="text-xs text-blue-600 font-medium">
              {rows.length} of {allHistory.length} transactions in period
            </span>
          </>
        )}
      </div>

      {/* ── Ledger Table ──────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

        {/* Ledger header bar */}
        <div className="px-5 py-3 bg-gray-800 text-white flex items-center gap-3">
          <svg className="w-4 h-4 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
          <span className="text-sm font-bold">Account Ledger — {entityName}</span>
          {isDateFiltered && (
            <span className="text-xs opacity-60 ml-auto">
              {startDate || 'Beginning'} → {endDate || 'Present'}
            </span>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-[11px] uppercase font-bold text-gray-400 tracking-wider">
                <th className="py-3 px-4 w-32">Date</th>
                <th className="py-3 px-4">Description / Particulars</th>
                <th className="py-3 px-4 w-36 text-right">Debit (Dr)</th>
                <th className="py-3 px-4 w-36 text-right">Credit (Cr)</th>
                <th className="py-3 px-4 w-40 text-right">Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">

              {/* Opening Balance Row */}
              {type === 'Account' && (
                <tr className="bg-blue-50/50">
                  <td className="py-3 px-4 text-xs text-blue-600 font-bold">Opening</td>
                  <td className="py-3 px-4 text-xs font-bold text-blue-700 italic">Opening Balance b/f</td>
                  <td className="py-3 px-4 text-right text-gray-300 text-xs">—</td>
                  <td className="py-3 px-4 text-right text-gray-300 text-xs">—</td>
                  <td className={`py-3 px-4 text-right font-bold tabular-nums text-sm ${openingBal >= 0 ? 'text-blue-700' : 'text-red-600'}`}>
                    {utils.formatCurrency(openingBal)}
                  </td>
                </tr>
              )}

              {rows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center">
                    <div className="flex flex-col items-center text-gray-400">
                      <svg className="w-10 h-10 mb-2 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                      <p className="text-sm font-medium text-gray-500">
                        No transactions found{isDateFiltered ? ' for this period' : ' for this account'}.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : rows.map((r, idx) => {
                const party = r.debit > 0
                  ? `To: ${getEntityName(r.toEntityId, r.toEntityType)}`
                  : `From: ${getEntityName(r.fromEntityId, r.fromEntityType)}`;
                return (
                  <tr key={r.id} className={`hover:bg-blue-50/20 transition-colors ${idx % 2 === 0 ? '' : 'bg-gray-50/30'}`}>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="font-medium text-gray-800">
                        {new Date(r.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                      </div>
                      <div className="text-[10px] text-gray-400">{new Date(r.date).getFullYear()}</div>
                    </td>
                    <td className="py-3 px-4 max-w-[240px]">
                      <div className="font-medium text-gray-900 truncate">{r.description}</div>
                      <div className="text-xs text-gray-400 truncate mt-0.5">{party}</div>
                    </td>
                    <td className="py-3 px-4 text-right font-mono whitespace-nowrap tabular-nums">
                      {r.debit > 0
                        ? <span className="font-bold text-red-600">{utils.formatCurrency(r.debit)}</span>
                        : <span className="text-gray-300 text-xs">—</span>}
                    </td>
                    <td className="py-3 px-4 text-right font-mono whitespace-nowrap tabular-nums">
                      {r.credit > 0
                        ? <span className="font-bold text-emerald-600">{utils.formatCurrency(r.credit)}</span>
                        : <span className="text-gray-300 text-xs">—</span>}
                    </td>
                    <td className={`py-3 px-4 text-right font-mono font-bold whitespace-nowrap tabular-nums text-sm ${r.runningBalance >= 0 ? 'text-gray-900' : 'text-red-600'}`}>
                      {utils.formatCurrency(r.runningBalance)}
                      <span className="text-[9px] font-bold ml-1 opacity-50">
                        {r.runningBalance >= 0 ? 'Dr' : 'Cr'}
                      </span>
                    </td>
                  </tr>
                );
              })}

              {/* Closing Balance Row */}
              {rows.length > 0 && (
                <tr className="bg-gray-800 text-white font-bold">
                  <td className="py-3 px-4 text-xs">Closing</td>
                  <td className="py-3 px-4 text-xs italic">Closing Balance c/f</td>
                  <td className="py-3 px-4 text-right tabular-nums text-sm">{utils.formatCurrency(totalDebits)}</td>
                  <td className="py-3 px-4 text-right tabular-nums text-sm">{utils.formatCurrency(totalCredits)}</td>
                  <td className={`py-3 px-4 text-right tabular-nums text-base ${closingBalance >= 0 ? 'text-blue-300' : 'text-red-400'}`}>
                    {utils.formatCurrency(closingBalance)}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
