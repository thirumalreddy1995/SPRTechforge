import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Card, Button } from '../../components/Components';
import { useParams, useNavigate } from 'react-router-dom';
import * as utils from '../../utils';
import { AccountType } from '../../types';

export const AccountStatement: React.FC = () => {
  const { transactions, getEntityName, accounts, candidates } = useApp();
  const { type, id } = useParams<{ type: string, id: string }>(); // type = 'Account' | 'Candidate'
  const navigate = useNavigate();
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  if (!type || !id) return <div>Invalid Parameters</div>;

  // Find Entity Info
  const accountObj = type === 'Account' ? accounts.find(a => a.id === id) : null;
  const candidateObj = type === 'Candidate' ? candidates.find(c => c.id === id) : null;
  const entityName = candidateObj?.name || accountObj?.name;

  if (!entityName) return <div className="text-gray-900 p-4">Entity not found.</div>;

  const allHistory = transactions
    .filter(t =>
      (t.fromEntityId === id && t.fromEntityType === type) ||
      (t.toEntityId === id && t.toEntityType === type)
    )
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Date filter on the history
  const history = allHistory.filter(t => {
    let ok = true;
    if (startDate) {
      const s = new Date(startDate); s.setHours(0,0,0,0);
      ok = ok && new Date(t.date) >= s;
    }
    if (endDate) {
      const e = new Date(endDate); e.setHours(23,59,59,999);
      ok = ok && new Date(t.date) <= e;
    }
    return ok;
  });

  const ascHistory = [...history].reverse();

  // Account Types that invert the standard flow logic
  const isIncomeNature = accountObj?.type === AccountType.Income || accountObj?.type === AccountType.Equity;
  const isLiabilityNature = accountObj?.type === AccountType.Creditor || accountObj?.type === AccountType.Salary;

  let runningBal = 0;
  if (type === 'Account' && accountObj) {
    runningBal = isLiabilityNature ? -accountObj.openingBalance : accountObj.openingBalance;
  }

  const rowsWithBalance = ascHistory.map(t => {
    let impact = 0;
    const isTo = t.toEntityId === id && t.toEntityType === type;

    if (isTo) {
      impact = isIncomeNature ? -t.amount : t.amount;
    } else {
      impact = isIncomeNature ? t.amount : -t.amount;
    }

    runningBal += impact;
    return { ...t, impact, runningBalance: runningBal };
  }).reverse(); // Show newest first

  // Summary calculations
  const totalCredits = rowsWithBalance.filter(r => r.impact > 0).reduce((sum, r) => sum + r.amount, 0);
  const totalDebits = rowsWithBalance.filter(r => r.impact < 0).reduce((sum, r) => sum + r.amount, 0);
  const closingBalance = rowsWithBalance.length > 0 ? rowsWithBalance[0].runningBalance : (accountObj?.openingBalance || 0);
  const openingBal = type === 'Account' && accountObj
    ? (isLiabilityNature ? -accountObj.openingBalance : accountObj.openingBalance)
    : 0;

  const isDateFiltered = startDate !== '' || endDate !== '';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between md:items-start gap-4">
        <div>
          <Button variant="secondary" onClick={() => navigate(-1)} className="mb-3 text-xs">← Back</Button>
          <h1 className="text-2xl font-bold text-gray-900">{entityName}</h1>
          <p className="text-gray-500 text-sm font-medium mt-0.5">
            <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs font-bold uppercase mr-2">{type}</span>
            {accountObj?.subType && <span className="text-gray-400">Group: {accountObj.subType}</span>}
            {accountObj?.type && <span className="text-gray-400 ml-2">· {accountObj.type}</span>}
          </p>
        </div>
        <Button onClick={() => utils.downloadCSV(rowsWithBalance, `${entityName}_Statement.csv`)}>
          Download CSV
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {type === 'Account' && (
          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Opening Balance</p>
            <p className={`text-xl font-bold mt-1 tabular-nums whitespace-nowrap ${openingBal >= 0 ? 'text-gray-700' : 'text-red-600'}`}>
              {utils.formatCurrency(openingBal)}
            </p>
          </div>
        )}
        <div className="bg-white border border-emerald-200 rounded-xl p-4 shadow-sm border-l-4 border-l-emerald-500">
          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Total Credits (+)</p>
          <p className="text-xl font-bold mt-1 text-emerald-600 tabular-nums whitespace-nowrap">
            {utils.formatCurrency(totalCredits)}
          </p>
        </div>
        <div className="bg-white border border-red-200 rounded-xl p-4 shadow-sm border-l-4 border-l-red-400">
          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Total Debits (−)</p>
          <p className="text-xl font-bold mt-1 text-red-600 tabular-nums whitespace-nowrap">
            {utils.formatCurrency(totalDebits)}
          </p>
        </div>
        <div className={`bg-white border border-gray-200 rounded-xl p-4 shadow-sm border-l-4 ${closingBalance >= 0 ? 'border-l-indigo-500' : 'border-l-red-500'}`}>
          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
            {isDateFiltered ? 'Period Closing' : 'Closing Balance'}
          </p>
          <p className={`text-xl font-bold mt-1 tabular-nums whitespace-nowrap ${closingBalance >= 0 ? 'text-indigo-700' : 'text-red-600'}`}>
            {utils.formatCurrency(closingBalance)}
          </p>
        </div>
      </div>

      {/* Date Filter */}
      <Card className="py-3 px-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Filter by Date</span>
          <div className="flex items-center gap-2 flex-1">
            <span className="text-xs text-gray-400 uppercase font-bold w-8">From</span>
            <input
              type="date"
              className="bg-white border border-gray-300 rounded-lg px-3 py-1.5 text-sm text-gray-900 focus:ring-1 focus:ring-spr-accent outline-none"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 flex-1">
            <span className="text-xs text-gray-400 uppercase font-bold w-8">To</span>
            <input
              type="date"
              className="bg-white border border-gray-300 rounded-lg px-3 py-1.5 text-sm text-gray-900 focus:ring-1 focus:ring-spr-accent outline-none"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
            />
          </div>
          {isDateFiltered && (
            <button
              onClick={() => { setStartDate(''); setEndDate(''); }}
              className="text-xs text-red-500 hover:text-red-700 font-medium flex items-center gap-1 whitespace-nowrap"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
              Clear dates
            </button>
          )}
        </div>
        {isDateFiltered && (
          <p className="text-xs text-indigo-600 mt-2 font-medium">
            Showing {rowsWithBalance.length} of {allHistory.length} transactions in selected period
          </p>
        )}
      </Card>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-gray-600">
            <thead>
              <tr className="border-b border-gray-100 text-xs uppercase text-gray-500 bg-gray-50">
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4 text-right">Credit (+)</th>
                <th className="py-3 px-4 text-right">Debit (−)</th>
                <th className="py-3 px-4 text-right">Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rowsWithBalance.length > 0 ? rowsWithBalance.map(t => {
                const isAddition = t.impact > 0;
                return (
                  <tr key={t.id} className="hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm font-medium whitespace-nowrap">{new Date(t.date).toLocaleDateString()}</td>
                    <td className="py-3 px-4">
                      <div className="text-gray-900 font-medium">{t.description}</div>
                      <div className="text-[10px] text-gray-400 uppercase font-bold tracking-tight">
                        {t.impact > 0
                          ? `From: ${getEntityName(t.fromEntityId, t.fromEntityType)}`
                          : `To: ${getEntityName(t.toEntityId, t.toEntityType)}`}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right text-emerald-600 font-bold whitespace-nowrap tabular-nums">
                      {isAddition ? utils.formatCurrency(t.amount) : <span className="text-gray-300">—</span>}
                    </td>
                    <td className="py-3 px-4 text-right text-red-600 font-bold whitespace-nowrap tabular-nums">
                      {!isAddition ? utils.formatCurrency(t.amount) : <span className="text-gray-300">—</span>}
                    </td>
                    <td className={`py-3 px-4 text-right font-mono font-bold whitespace-nowrap tabular-nums ${t.runningBalance >= 0 ? 'text-gray-900' : 'text-red-600'}`}>
                      {utils.formatCurrency(t.runningBalance)}
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan={5} className="text-center py-12">
                    <div className="flex flex-col items-center text-gray-400 opacity-60">
                      <svg className="w-10 h-10 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                      <p className="font-medium text-gray-500">No transactions found{isDateFiltered ? ' for this period.' : ' for this entity.'}</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
