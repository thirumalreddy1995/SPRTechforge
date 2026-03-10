import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Card, Button } from '../../components/Components';
import { TransactionType, AccountType } from '../../types';
import * as utilsFixed from '../../utils';

export const FinancialStatements: React.FC = () => {
  const { transactions, accounts, candidates, getEntityBalance } = useApp();
  const [activeTab, setActiveTab] = useState<'BS' | 'PL'>('BS');
  const [plStartDate, setPlStartDate] = useState('');
  const [plEndDate, setPlEndDate] = useState('');

  // Filter transactions for P&L by date range
  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      let ok = true;
      if (plStartDate) {
        const s = new Date(plStartDate); s.setHours(0, 0, 0, 0);
        ok = ok && new Date(t.date) >= s;
      }
      if (plEndDate) {
        const e = new Date(plEndDate); e.setHours(23, 59, 59, 999);
        ok = ok && new Date(t.date) <= e;
      }
      return ok;
    });
  }, [transactions, plStartDate, plEndDate]);

  const isDateFiltered = plStartDate !== '' || plEndDate !== '';

  // --- PROFIT & LOSS CALCULATION ---
  const incomeTransactions = filteredTransactions.filter(t => {
    if (t.type !== TransactionType.Income) return false;
    if (t.fromEntityType === 'Candidate') return true;
    if (t.fromEntityType === 'Account') {
      const fromAcc = accounts.find(a => a.id === t.fromEntityId);
      return fromAcc?.type === AccountType.Income;
    }
    return false;
  });

  const paymentTransactions = filteredTransactions.filter(t => t.type === TransactionType.Payment);

  const totalIncome = incomeTransactions.reduce((sum, t) => sum + t.amount, 0);
  const totalPayment = paymentTransactions.reduce((sum, t) => sum + t.amount, 0);
  const netProfit = totalIncome - totalPayment;

  // Group Payments by Category
  const paymentBreakdown = paymentTransactions.reduce((acc, t) => {
    let category = 'General Payment';
    if (t.toEntityType === 'Account') {
      const accObj = accounts.find(a => a.id === t.toEntityId);
      if (accObj) category = accObj.subType || accObj.name;
    }
    acc[category] = (acc[category] || 0) + t.amount;
    return acc;
  }, {} as Record<string, number>);

  // --- BALANCE SHEET CALCULATION (always uses all transactions) ---
  const cashAccounts = accounts.filter(a => a.type === AccountType.Cash);
  const bankAccounts = accounts.filter(a => a.type === AccountType.Bank);
  const debtors = accounts.filter(a => a.type === AccountType.Debtor);

  const totalCash = cashAccounts.reduce((sum, a) => sum + getEntityBalance(a.id, 'Account'), 0);
  const totalBank = bankAccounts.reduce((sum, a) => sum + getEntityBalance(a.id, 'Account'), 0);
  const totalDebtors = debtors.reduce((sum, a) => sum + getEntityBalance(a.id, 'Account'), 0);

  const totalCandidateReceivables = candidates.reduce((sum, c) => {
    if (!c.isActive && c.status === 'Discontinued') return sum;
    const paid = transactions
      .filter(t => t.fromEntityId === c.id && t.type === TransactionType.Income)
      .reduce((s, t) => s + t.amount, 0);
    const refunded = transactions
      .filter(t => t.toEntityId === c.id && t.type === TransactionType.Refund)
      .reduce((s, t) => s + t.amount, 0);
    const netPaid = paid - refunded;
    const due = c.agreedAmount - netPaid;
    return sum + (due > 0 ? due : 0);
  }, 0);

  const totalAssets = totalCash + totalBank + totalDebtors + totalCandidateReceivables;

  const creditors = accounts.filter(a => a.type === AccountType.Creditor);
  const totalCreditors = creditors.reduce((sum, a) => {
    const bal = getEntityBalance(a.id, 'Account');
    return sum + (bal < 0 ? Math.abs(bal) : 0);
  }, 0);

  const impliedEquity = totalAssets - totalCreditors;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center print:hidden">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Financial Statements</h1>
          <p className="text-sm text-gray-500 mt-0.5">SPR Techforge Pvt Ltd · As of {new Date().toLocaleDateString()}</p>
        </div>
        <Button onClick={() => window.print()}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
          Print / Save PDF
        </Button>
      </div>

      {/* Tab Bar */}
      <div className="print:hidden flex space-x-1 border-b border-gray-200 bg-white rounded-t-xl px-4 pt-3">
        <button
          className={`py-2.5 px-5 font-semibold text-sm border-b-2 transition-colors rounded-t-lg -mb-px ${activeTab === 'BS' ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
          onClick={() => setActiveTab('BS')}
        >
          Balance Sheet
        </button>
        <button
          className={`py-2.5 px-5 font-semibold text-sm border-b-2 transition-colors rounded-t-lg -mb-px ${activeTab === 'PL' ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
          onClick={() => setActiveTab('PL')}
        >
          Profit & Loss
        </button>
      </div>

      {/* P&L Date Filter (only show when P&L tab) */}
      {activeTab === 'PL' && (
        <div className="print:hidden bg-white border border-gray-200 rounded-xl px-5 py-3 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">P&L Period</span>
          <div className="flex items-center gap-2 flex-1">
            <span className="text-xs text-gray-400 uppercase font-bold w-8">From</span>
            <input
              type="date"
              className="bg-white border border-gray-300 rounded-lg px-3 py-1.5 text-sm text-gray-900 focus:ring-1 focus:ring-spr-accent outline-none"
              value={plStartDate}
              onChange={e => setPlStartDate(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 flex-1">
            <span className="text-xs text-gray-400 uppercase font-bold w-8">To</span>
            <input
              type="date"
              className="bg-white border border-gray-300 rounded-lg px-3 py-1.5 text-sm text-gray-900 focus:ring-1 focus:ring-spr-accent outline-none"
              value={plEndDate}
              onChange={e => setPlEndDate(e.target.value)}
            />
          </div>
          {isDateFiltered && (
            <button
              onClick={() => { setPlStartDate(''); setPlEndDate(''); }}
              className="text-xs text-red-500 hover:text-red-700 font-medium flex items-center gap-1 whitespace-nowrap"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
              Clear dates
            </button>
          )}
          {isDateFiltered && (
            <span className="text-xs text-indigo-600 font-medium">{filteredTransactions.length} of {transactions.length} transactions</span>
          )}
        </div>
      )}

      <div className="bg-white p-6 md:p-10 shadow-sm border border-gray-200 rounded-xl print:shadow-none print:border-none print:p-0">

        {/* Header */}
        <div className="text-center border-b-2 border-gray-800 pb-6 mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 uppercase tracking-widest">SPR Techforge Pvt Ltd</h2>
          <p className="text-gray-500 mt-1">Consultancy & Training Services</p>
          {isDateFiltered && activeTab === 'PL' ? (
            <p className="text-sm text-indigo-600 font-medium mt-2">
              Period: {plStartDate ? new Date(plStartDate).toLocaleDateString() : 'Beginning'} — {plEndDate ? new Date(plEndDate).toLocaleDateString() : 'Present'}
            </p>
          ) : (
            <p className="text-sm text-gray-500 mt-2">As at {new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          )}
        </div>

        {/* BALANCE SHEET */}
        {(activeTab === 'BS' || typeof window !== 'undefined') && (
          <div className={activeTab === 'BS' ? 'block' : 'hidden print:block print:break-after-page'}>
            <h3 className="text-xl font-bold text-center underline mb-8">BALANCE SHEET</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* ASSETS side */}
              <div>
                <div className="flex justify-between border-b-2 border-gray-400 pb-2 mb-3">
                  <span className="font-bold text-emerald-800 uppercase tracking-wide">Assets</span>
                  <span className="font-bold text-emerald-800">Amount (₹)</span>
                </div>

                <div className="space-y-1 text-sm">
                  <p className="font-semibold text-gray-700 uppercase text-[11px] tracking-wider mt-2 mb-1">Current Assets</p>
                  {cashAccounts.map(a => (
                    <div key={a.id} className="flex justify-between pl-4 text-gray-600">
                      <span>{a.name}</span>
                      <span className="whitespace-nowrap tabular-nums">{utilsFixed.formatCurrency(getEntityBalance(a.id, 'Account'))}</span>
                    </div>
                  ))}
                  {bankAccounts.map(a => (
                    <div key={a.id} className="flex justify-between pl-4 text-gray-600">
                      <span>{a.name}</span>
                      <span className="whitespace-nowrap tabular-nums">{utilsFixed.formatCurrency(getEntityBalance(a.id, 'Account'))}</span>
                    </div>
                  ))}
                  <div className="flex justify-between pl-4 text-gray-500 border-t border-dashed border-gray-200 pt-1">
                    <span className="italic text-xs">Subtotal — Cash & Bank</span>
                    <span className="whitespace-nowrap tabular-nums font-medium">{utilsFixed.formatCurrency(totalCash + totalBank)}</span>
                  </div>

                  <p className="font-semibold text-gray-700 uppercase text-[11px] tracking-wider mt-4 mb-1">Receivables</p>
                  <div className="flex justify-between pl-4 text-gray-600">
                    <span>Candidate Fees Pending</span>
                    <span className="whitespace-nowrap tabular-nums">{utilsFixed.formatCurrency(totalCandidateReceivables)}</span>
                  </div>
                  {debtors.map(a => (
                    <div key={a.id} className="flex justify-between pl-4 text-gray-600">
                      <span>{a.name}</span>
                      <span className="whitespace-nowrap tabular-nums">{utilsFixed.formatCurrency(getEntityBalance(a.id, 'Account'))}</span>
                    </div>
                  ))}
                  <div className="flex justify-between pl-4 text-gray-500 border-t border-dashed border-gray-200 pt-1">
                    <span className="italic text-xs">Subtotal — Receivables</span>
                    <span className="whitespace-nowrap tabular-nums font-medium">{utilsFixed.formatCurrency(totalDebtors + totalCandidateReceivables)}</span>
                  </div>
                </div>

                <div className="flex justify-between border-t-2 border-gray-800 pt-3 mt-8 font-bold text-gray-900 text-base">
                  <span>TOTAL ASSETS</span>
                  <span className="whitespace-nowrap tabular-nums">{utilsFixed.formatCurrency(totalAssets)}</span>
                </div>
              </div>

              {/* LIABILITIES side */}
              <div>
                <div className="flex justify-between border-b-2 border-gray-400 pb-2 mb-3">
                  <span className="font-bold text-red-800 uppercase tracking-wide">Liabilities</span>
                  <span className="font-bold text-red-800">Amount (₹)</span>
                </div>

                <div className="space-y-1 text-sm">
                  <p className="font-semibold text-gray-700 uppercase text-[11px] tracking-wider mt-2 mb-1">Current Liabilities</p>
                  {creditors.map(a => (
                    <div key={a.id} className="flex justify-between pl-4 text-gray-600">
                      <span>{a.name}</span>
                      <span className="whitespace-nowrap tabular-nums">{utilsFixed.formatCurrency(Math.abs(Math.min(0, getEntityBalance(a.id, 'Account'))))}</span>
                    </div>
                  ))}
                  {creditors.length === 0 && (
                    <div className="pl-4 text-gray-400 italic text-xs">No creditors recorded</div>
                  )}
                </div>

                <div className="flex justify-between border-t border-gray-300 pt-2 mt-4 font-semibold text-gray-700">
                  <span>Total Liabilities</span>
                  <span className="whitespace-nowrap tabular-nums">{utilsFixed.formatCurrency(totalCreditors)}</span>
                </div>

                <div className="mt-8">
                  <div className="flex justify-between border-b-2 border-gray-400 pb-2 mb-3">
                    <span className="font-bold text-indigo-800 uppercase tracking-wide">Equity</span>
                    <span className="font-bold text-indigo-800">Amount (₹)</span>
                  </div>
                  <div className="flex justify-between pl-4 text-gray-600 text-sm">
                    <span>Owners Capital / Net Worth</span>
                    <span className={`whitespace-nowrap tabular-nums font-medium ${impliedEquity >= 0 ? 'text-indigo-700' : 'text-red-600'}`}>{utilsFixed.formatCurrency(impliedEquity)}</span>
                  </div>
                </div>

                <div className="flex justify-between border-t-2 border-gray-800 pt-3 mt-8 font-bold text-gray-900 text-base">
                  <span>TOTAL LIABILITIES & EQUITY</span>
                  <span className="whitespace-nowrap tabular-nums">{utilsFixed.formatCurrency(totalCreditors + impliedEquity)}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PROFIT & LOSS */}
        {(activeTab === 'PL' || typeof window !== 'undefined') && (
          <div className={`${activeTab === 'PL' ? 'block' : 'hidden print:block'} print:mt-8`}>
            <h3 className="text-xl font-bold text-center underline mb-8">
              PROFIT & LOSS ACCOUNT
              {isDateFiltered && <span className="text-sm font-normal text-gray-500 block mt-1">(Filtered Period)</span>}
            </h3>

            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-800 text-white font-bold">
                  <tr>
                    <th className="p-3 border-r border-gray-600 w-2/3">Particulars</th>
                    <th className="p-3 text-right">Amount (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <tr className="bg-emerald-50 font-bold text-emerald-800">
                    <td className="p-3 border-r border-gray-100">OPERATING INCOME</td>
                    <td className="p-3 text-right"></td>
                  </tr>
                  <tr>
                    <td className="p-3 pl-8 border-r border-gray-100 text-gray-700">Fees & Consultancy Revenue</td>
                    <td className="p-3 text-right text-gray-900 whitespace-nowrap tabular-nums">{utilsFixed.formatCurrency(totalIncome)}</td>
                  </tr>
                  <tr className="font-bold bg-gray-50">
                    <td className="p-3 border-r border-gray-100 text-right text-gray-700">Total Operating Revenue (A)</td>
                    <td className="p-3 text-right text-emerald-700 whitespace-nowrap tabular-nums">{utilsFixed.formatCurrency(totalIncome)}</td>
                  </tr>

                  <tr className="bg-red-50 font-bold text-red-800">
                    <td className="p-3 border-r border-gray-100">OPERATING EXPENSES</td>
                    <td className="p-3 text-right"></td>
                  </tr>
                  {Object.entries(paymentBreakdown).map(([cat, amt]: [string, number]) => (
                    <tr key={cat}>
                      <td className="p-3 pl-8 border-r border-gray-100 text-gray-700">{cat}</td>
                      <td className="p-3 text-right text-gray-900 whitespace-nowrap tabular-nums">{utilsFixed.formatCurrency(amt)}</td>
                    </tr>
                  ))}
                  {Object.keys(paymentBreakdown).length === 0 && (
                    <tr>
                      <td className="p-3 pl-8 border-r border-gray-100 text-gray-400 italic" colSpan={2}>No expenses recorded in this period.</td>
                    </tr>
                  )}
                  <tr className="font-bold bg-gray-50">
                    <td className="p-3 border-r border-gray-100 text-right text-gray-700">Total Operating Expenses (B)</td>
                    <td className="p-3 text-right text-red-700 whitespace-nowrap tabular-nums">{utilsFixed.formatCurrency(totalPayment)}</td>
                  </tr>

                  <tr className={`text-lg font-bold ${netProfit >= 0 ? 'bg-emerald-100 text-emerald-900' : 'bg-red-100 text-red-900'}`}>
                    <td className="p-4 border-r border-gray-200 text-right uppercase">
                      {netProfit >= 0 ? 'Net Operating Profit (A − B)' : 'Net Operating Loss (A − B)'}
                    </td>
                    <td className="p-4 text-right whitespace-nowrap tabular-nums">
                      {utilsFixed.formatCurrency(netProfit)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="mt-4 text-[11px] text-gray-400 italic">* Loans, creditor receipts, and liability transactions are excluded from Operating Profit.</p>
          </div>
        )}

        <div className="mt-12 text-center text-xs text-gray-400 border-t border-gray-100 pt-6">
          <p>This is a computer-generated statement — SPR Techforge Management System</p>
        </div>
      </div>
    </div>
  );
};
