import React from 'react';
import { useApp } from '../../context/AppContext';
import { Link } from 'react-router-dom';
import * as utils from '../../utils';
import { TransactionType, AccountType } from '../../types';

const getOrdinal = (n: number) => {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
};

const calculateMonthsDue = (startDateStr: string, dueDay = 1, endDateStr?: string): number => {
  const start = new Date(startDateStr);
  const now   = endDateStr ? new Date(endDateStr) : new Date();
  let count = 0, iterations = 0;
  let cursor = new Date(start.getFullYear(), start.getMonth(), 1);
  while (cursor <= now && iterations < 600) {
    iterations++;
    const daysInMonth = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate();
    const actualDay   = Math.min(dueDay, daysInMonth);
    const due         = new Date(cursor.getFullYear(), cursor.getMonth(), actualDay);
    if (now >= due) count++;
    cursor.setMonth(cursor.getMonth() + 1);
  }
  return count;
};

export const Payroll: React.FC = () => {
  const { accounts, transactions } = useApp();

  const fixedAccounts = accounts.filter(a =>
    (a.type === AccountType.Salary || (a.recurringAmount !== undefined && a.recurringAmount > 0)) &&
    a.recurringStartDate
  );

  // Summary KPIs
  const totalMonthlyFixed = fixedAccounts.reduce((s, a) => s + (a.recurringAmount || 0), 0);

  const summaryRows = fixedAccounts.map(acc => {
    const months      = calculateMonthsDue(acc.recurringStartDate!, acc.recurringDueDay, acc.recurringEndDate);
    const totalPayable = months * (acc.recurringAmount || 0);
    const totalPaid   = transactions
      .filter(t => t.toEntityId === acc.id && t.toEntityType === 'Account' && t.type === TransactionType.Payment)
      .reduce((s, t) => s + t.amount, 0);
    const pending = totalPayable - totalPaid;
    return { acc, months, totalPayable, totalPaid, pending };
  });

  const totalPayable = summaryRows.reduce((s, r) => s + r.totalPayable, 0);
  const totalPaid    = summaryRows.reduce((s, r) => s + r.totalPaid, 0);
  const totalPending = summaryRows.reduce((s, r) => s + Math.max(0, r.pending), 0);
  const clearedCount = summaryRows.filter(r => r.pending <= 0).length;

  return (
    <div className="space-y-6">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payroll & Fixed Expenses</h1>
          <p className="text-sm text-gray-500 mt-0.5">Monthly recurring salaries, rent, and fixed obligations</p>
        </div>
        <div className="flex gap-2">
          <Link to="/finance/accounts/new">
            <button className="inline-flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-600 text-sm font-medium px-4 py-2 rounded-lg border border-gray-200 transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              New Ledger
            </button>
          </Link>
          <Link to="/finance/transactions/new">
            <button className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors shadow-sm">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
              Make Payment
            </button>
          </Link>
        </div>
      </div>

      {/* ── KPI Cards ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Monthly Fixed</p>
          <p className="text-2xl font-bold mt-1 text-gray-900 tabular-nums">{utils.formatCurrency(totalMonthlyFixed)}</p>
          <p className="text-xs text-gray-400 mt-1">{fixedAccounts.length} obligation{fixedAccounts.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 border-l-4 border-l-blue-500 shadow-sm p-5">
          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Total Payable</p>
          <p className="text-2xl font-bold mt-1 text-blue-700 tabular-nums">{utils.formatCurrency(totalPayable)}</p>
          <p className="text-xs text-gray-400 mt-1">Cumulative obligation</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 border-l-4 border-l-emerald-500 shadow-sm p-5">
          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Total Paid</p>
          <p className="text-2xl font-bold mt-1 text-emerald-700 tabular-nums">{utils.formatCurrency(totalPaid)}</p>
          <p className="text-xs text-gray-400 mt-1">{clearedCount} account{clearedCount !== 1 ? 's' : ''} cleared</p>
        </div>
        <div className={`bg-white rounded-2xl border border-gray-100 border-l-4 ${totalPending > 0 ? 'border-l-red-500' : 'border-l-emerald-500'} shadow-sm p-5`}>
          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Pending / Arrears</p>
          <p className={`text-2xl font-bold mt-1 tabular-nums ${totalPending > 0 ? 'text-red-700' : 'text-emerald-700'}`}>
            {utils.formatCurrency(totalPending)}
          </p>
          <p className="text-xs text-gray-400 mt-1">{totalPending <= 0 ? 'All cleared ✓' : 'Outstanding balance'}</p>
        </div>
      </div>

      {/* ── Table ──────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
          <h2 className="text-sm font-bold text-gray-700">Recurring Obligation Schedule</h2>
          <span className="text-xs text-gray-400">{fixedAccounts.length} accounts</span>
        </div>

        {fixedAccounts.length === 0 ? (
          <div className="py-16 text-center">
            <div className="flex flex-col items-center text-gray-400 opacity-50">
              <svg className="w-12 h-12 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
              <p className="font-medium text-gray-500">No fixed recurring payments found.</p>
              <p className="text-xs mt-2">Create a Ledger (Type: Salary / Expense) with a fixed monthly amount to track here.</p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-[11px] uppercase font-bold text-gray-400 tracking-wider">
                  <th className="py-3 px-5">Ledger / Employee</th>
                  <th className="py-3 px-5">Due Cycle</th>
                  <th className="py-3 px-5 text-center">Months Due</th>
                  <th className="py-3 px-5 text-right">Monthly (₹)</th>
                  <th className="py-3 px-5 text-right">Total Payable</th>
                  <th className="py-3 px-5 text-right">Total Paid</th>
                  <th className="py-3 px-5 text-right">Balance</th>
                  <th className="py-3 px-5 text-center w-24">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {summaryRows.map(({ acc, months, totalPayable: tp, totalPaid: pd, pending }) => {
                  const isCleared = pending <= 0;
                  return (
                    <tr key={acc.id} className={`hover:bg-blue-50/30 transition-colors ${pending > 0 ? '' : 'opacity-80'}`}>
                      <td className="py-4 px-5">
                        <div className="font-semibold text-gray-900">{acc.name}</div>
                        {acc.subType && <div className="text-[10px] text-gray-400 font-bold uppercase mt-0.5">{acc.subType}</div>}
                        <div className="text-[10px] text-gray-400 mt-0.5">
                          Since {new Date(acc.recurringStartDate!).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                        </div>
                      </td>
                      <td className="py-4 px-5">
                        <div className="font-medium text-blue-700 text-sm">
                          {acc.recurringDueDay === 31 ? 'End of month' : `${getOrdinal(acc.recurringDueDay || 1)} of month`}
                        </div>
                        {acc.recurringEndDate && (
                          <div className="text-[10px] text-amber-600 mt-0.5">
                            Ends {new Date(acc.recurringEndDate).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-5 text-center">
                        <span className={`inline-flex items-center justify-center min-w-[2.5rem] px-2.5 py-1 rounded-full text-sm font-bold ${months > 0 ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' : 'bg-gray-100 text-gray-400'}`}>
                          {months}
                        </span>
                      </td>
                      <td className="py-4 px-5 text-right font-medium text-gray-700 tabular-nums">{utils.formatCurrency(acc.recurringAmount || 0)}</td>
                      <td className="py-4 px-5 text-right text-gray-500 tabular-nums">{utils.formatCurrency(tp)}</td>
                      <td className="py-4 px-5 text-right text-emerald-600 font-medium tabular-nums">{utils.formatCurrency(pd)}</td>
                      <td className="py-4 px-5 text-right">
                        {isCleared ? (
                          <span className="inline-flex items-center gap-1 text-emerald-600 font-bold text-sm">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                            CLEARED
                          </span>
                        ) : (
                          <div className="text-right">
                            <div className="font-bold text-red-600 tabular-nums">{utils.formatCurrency(pending)}</div>
                            <div className="text-[9px] text-red-400 uppercase font-bold tracking-wide">Arrears</div>
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-5 text-center">
                        <div className="flex justify-center gap-1.5">
                          <Link to={`/finance/statement/Account/${acc.id}`}
                            className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="View Ledger Statement">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                          </Link>
                          <Link to={`/finance/accounts/edit/${acc.id}`}
                            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit Schedule">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start gap-3">
        <svg className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        <div className="text-xs text-blue-800 leading-relaxed">
          <strong>How it works:</strong> The system checks the configured Due Day for every month since the start date.
          If today's date has reached or passed that day, the month is counted as due. "Balance Pending" is total obligation minus all payments recorded in that account's ledger.
          Set a fixed monthly amount on any Salary or Expense account to track it here.
        </div>
      </div>
    </div>
  );
};
