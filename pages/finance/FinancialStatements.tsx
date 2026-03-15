import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { TransactionType, AccountType } from '../../types';
import * as utils from '../../utils';

type Tab = 'BS' | 'PL' | 'TB';

// ─── Section row component for report tables ──────────────────────────────────
const ReportRow: React.FC<{ label: string; amount?: number; indent?: number; bold?: boolean; separator?: boolean; highlight?: 'profit' | 'loss' | 'total' }> = ({
  label, amount, indent = 0, bold = false, separator = false, highlight
}) => {
  const highlightCls =
    highlight === 'profit' ? 'bg-emerald-50 text-emerald-900 font-bold' :
    highlight === 'loss'   ? 'bg-red-50 text-red-900 font-bold' :
    highlight === 'total'  ? 'bg-gray-800 text-white font-bold' : '';

  return (
    <tr className={`${separator ? 'border-t-2 border-gray-800' : 'border-b border-gray-50'} ${highlightCls}`}>
      <td className={`py-2.5 text-sm ${bold ? 'font-bold' : ''}`} style={{ paddingLeft: `${(indent + 1) * 1}rem` }}>
        {label}
      </td>
      <td className={`py-2.5 text-right text-sm tabular-nums whitespace-nowrap font-${bold ? 'bold' : 'medium'} pr-4`}>
        {amount !== undefined ? utils.formatCurrency(amount) : ''}
      </td>
    </tr>
  );
};

export const FinancialStatements: React.FC = () => {
  const { transactions, accounts, candidates, getEntityBalance } = useApp();
  const [activeTab, setActiveTab] = useState<Tab>('BS');
  const [plStart, setPlStart]     = useState('');
  const [plEnd, setPlEnd]         = useState('');

  const isDateFiltered = plStart !== '' || plEnd !== '';

  // P&L filtered transactions
  const plTxns = useMemo(() => transactions.filter(t => {
    if (plStart) { const s = new Date(plStart); s.setHours(0,0,0,0); if (new Date(t.date) < s) return false; }
    if (plEnd)   { const e = new Date(plEnd);   e.setHours(23,59,59,999); if (new Date(t.date) > e) return false; }
    return true;
  }), [transactions, plStart, plEnd]);

  // ── P&L Calculations ──────────────────────────────────────────────────────
  const incomeTxns = plTxns.filter(t => {
    if (t.type !== TransactionType.Income) return false;
    if (t.fromEntityType === 'Candidate') return true;
    const acc = accounts.find(a => a.id === t.fromEntityId);
    return acc?.type === AccountType.Income;
  });

  const paymentTxns = plTxns.filter(t => t.type === TransactionType.Payment);

  const totalIncome  = incomeTxns.reduce((s, t) => s + t.amount, 0);
  const totalExpense = paymentTxns.reduce((s, t) => s + t.amount, 0);
  const netPL        = totalIncome - totalExpense;

  // Group expenses by category
  const expenseBreakdown = paymentTxns.reduce((acc, t) => {
    const acctObj = accounts.find(a => a.id === t.toEntityId);
    const cat = acctObj?.subType || acctObj?.name || 'General Payment';
    acc[cat] = (acc[cat] || 0) + t.amount;
    return acc;
  }, {} as Record<string, number>);

  // ── Balance Sheet Calculations ─────────────────────────────────────────────
  const cashAccounts  = accounts.filter(a => a.type === AccountType.Cash);
  const bankAccounts  = accounts.filter(a => a.type === AccountType.Bank);
  const debtors       = accounts.filter(a => a.type === AccountType.Debtor);
  const fixedAssets   = accounts.filter(a => a.type === AccountType.FixedAsset);
  const currAssets    = accounts.filter(a => a.type === AccountType.CurrentAsset);

  const totalCash       = cashAccounts.reduce((s, a) => s + getEntityBalance(a.id, 'Account'), 0);
  const totalBank       = bankAccounts.reduce((s, a) => s + getEntityBalance(a.id, 'Account'), 0);
  const totalDebtors    = debtors.reduce((s, a) => s + getEntityBalance(a.id, 'Account'), 0);
  const totalFixed      = fixedAssets.reduce((s, a) => s + getEntityBalance(a.id, 'Account'), 0);
  const totalCurrAssets = currAssets.reduce((s, a) => s + getEntityBalance(a.id, 'Account'), 0);

  const candidateReceivables = candidates.reduce((s, c) => {
    if (!c.isActive && c.status === 'Discontinued') return s;
    const paid = transactions.filter(t => t.fromEntityId === c.id && t.type === TransactionType.Income).reduce((x, t) => x + t.amount, 0);
    const refunded = transactions.filter(t => t.toEntityId === c.id && t.type === TransactionType.Refund).reduce((x, t) => x + t.amount, 0);
    const due = c.agreedAmount - (paid - refunded);
    return s + (due > 0 ? due : 0);
  }, 0);

  const creditors  = accounts.filter(a => a.type === AccountType.Creditor);
  const loans      = accounts.filter(a => a.type === AccountType.Loan);
  const taxAccts   = accounts.filter(a => a.type === AccountType.Tax);

  const totalCreditors = creditors.reduce((s, a) => { const b = getEntityBalance(a.id, 'Account'); return s + (b < 0 ? Math.abs(b) : 0); }, 0);
  const totalLoans     = loans.reduce((s, a) => { const b = getEntityBalance(a.id, 'Account'); return s + (b < 0 ? Math.abs(b) : 0); }, 0);
  const totalTax       = taxAccts.reduce((s, a) => { const b = getEntityBalance(a.id, 'Account'); return s + (b < 0 ? Math.abs(b) : 0); }, 0);

  const totalAssets      = totalCash + totalBank + totalDebtors + candidateReceivables + totalFixed + totalCurrAssets;
  const totalLiabilities = totalCreditors + totalLoans + totalTax;
  const impliedEquity    = totalAssets - totalLiabilities;

  // ── Trial Balance ──────────────────────────────────────────────────────────
  const trialRows = useMemo(() =>
    accounts.map(a => {
      const bal = getEntityBalance(a.id, 'Account');
      const isLiability = [AccountType.Creditor, AccountType.Loan, AccountType.Tax, AccountType.Salary].includes(a.type);
      const isIncome     = [AccountType.Income, AccountType.Equity, AccountType.Capital].includes(a.type);
      let debit = 0, credit = 0;
      if (isLiability || isIncome) {
        if (bal < 0) debit = Math.abs(bal); else credit = bal;
      } else {
        if (bal > 0) debit = bal; else credit = Math.abs(bal);
      }
      return { account: a, balance: bal, debit, credit };
    }).sort((a, b) => a.account.name.localeCompare(b.account.name)),
    [accounts, getEntityBalance]
  );

  const trialTotalDebit  = trialRows.reduce((s, r) => s + r.debit, 0);
  const trialTotalCredit = trialRows.reduce((s, r) => s + r.credit, 0);
  const isTrialBalanced  = Math.abs(trialTotalDebit - trialTotalCredit) < 1;

  const tabs: { key: Tab; label: string; icon: string }[] = [
    { key: 'BS', label: 'Balance Sheet',  icon: '📊' },
    { key: 'PL', label: 'Profit & Loss',  icon: '📈' },
    { key: 'TB', label: 'Trial Balance',  icon: '⚖️' },
  ];

  return (
    <div className="space-y-5">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 print:hidden">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Financial Reports</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            SPR Techforge Pvt Ltd · As at {new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-600 text-sm font-medium px-4 py-2 rounded-lg border border-gray-200 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
          Print / PDF
        </button>
      </div>

      {/* ── Tab Navigation ────────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm print:hidden">
        <div className="flex border-b border-gray-100">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-6 py-3.5 text-sm font-semibold border-b-2 transition-all ${activeTab === tab.key
                ? 'border-blue-600 text-blue-600 bg-blue-50/50'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* P&L Date Filter */}
        {activeTab === 'PL' && (
          <div className="px-5 py-3.5 bg-gray-50/60 border-b border-gray-100 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">P&L Period</span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400 font-medium w-8">From</span>
              <input type="date" className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-blue-400" value={plStart} onChange={e => setPlStart(e.target.value)} />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400 font-medium w-4">To</span>
              <input type="date" className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-blue-400" value={plEnd} onChange={e => setPlEnd(e.target.value)} />
            </div>
            {isDateFiltered && (
              <>
                <button onClick={() => { setPlStart(''); setPlEnd(''); }}
                  className="text-xs text-red-500 hover:text-red-700 font-medium flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                  Clear
                </button>
                <span className="text-xs text-blue-600 font-medium">{plTxns.length} of {transactions.length} transactions</span>
              </>
            )}
          </div>
        )}
      </div>

      {/* ── Report Content ────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden print:shadow-none print:border-none">

        {/* Printable Header */}
        <div className="text-center border-b-2 border-gray-800 px-8 py-6 print:block">
          <h2 className="text-2xl font-bold text-gray-900 uppercase tracking-widest">SPR Techforge Pvt Ltd</h2>
          <p className="text-gray-500 text-sm mt-1">Consultancy & Training Services</p>
          <p className="text-sm font-bold text-gray-700 mt-2">
            {activeTab === 'BS' && 'BALANCE SHEET'}
            {activeTab === 'PL' && 'PROFIT & LOSS ACCOUNT'}
            {activeTab === 'TB' && 'TRIAL BALANCE'}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {isDateFiltered && activeTab === 'PL'
              ? `Period: ${plStart || 'Beginning'} — ${plEnd || 'Present'}`
              : `As at ${new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}`}
          </p>
        </div>

        {/* ── BALANCE SHEET ──────────────────────────────────────────────── */}
        {activeTab === 'BS' && (
          <div className="p-6 md:p-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">

              {/* ASSETS */}
              <div>
                <div className="flex justify-between items-center border-b-2 border-emerald-700 pb-2 mb-4">
                  <span className="font-bold text-emerald-800 uppercase tracking-wide text-sm">Assets</span>
                  <span className="font-bold text-emerald-800 text-sm">Amount (₹)</span>
                </div>
                <table className="w-full">
                  <tbody>
                    <ReportRow label="Current Assets" bold />
                    {cashAccounts.map(a => <ReportRow key={a.id} label={a.name} amount={getEntityBalance(a.id,'Account')} indent={1} />)}
                    {bankAccounts.map(a => <ReportRow key={a.id} label={a.name} amount={getEntityBalance(a.id,'Account')} indent={1} />)}
                    <ReportRow label="Cash & Bank Subtotal" amount={totalCash + totalBank} indent={1} bold />

                    <ReportRow label="Receivables" bold />
                    <ReportRow label="Candidate Fees Pending" amount={candidateReceivables} indent={1} />
                    {debtors.map(a => <ReportRow key={a.id} label={a.name} amount={getEntityBalance(a.id,'Account')} indent={1} />)}
                    <ReportRow label="Receivables Subtotal" amount={candidateReceivables + totalDebtors} indent={1} bold />

                    {(currAssets.length > 0) && (
                      <>
                        <ReportRow label="Other Current Assets" bold />
                        {currAssets.map(a => <ReportRow key={a.id} label={a.name} amount={getEntityBalance(a.id,'Account')} indent={1} />)}
                        <ReportRow label="Subtotal" amount={totalCurrAssets} indent={1} bold />
                      </>
                    )}

                    {(fixedAssets.length > 0) && (
                      <>
                        <ReportRow label="Fixed Assets" bold />
                        {fixedAssets.map(a => <ReportRow key={a.id} label={a.name} amount={getEntityBalance(a.id,'Account')} indent={1} />)}
                        <ReportRow label="Fixed Assets Subtotal" amount={totalFixed} indent={1} bold />
                      </>
                    )}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-gray-800 bg-gray-800 text-white">
                      <td className="py-3 px-4 font-bold uppercase text-sm">TOTAL ASSETS</td>
                      <td className="py-3 px-4 text-right font-bold tabular-nums text-sm">{utils.formatCurrency(totalAssets)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* LIABILITIES + EQUITY */}
              <div>
                <div className="flex justify-between items-center border-b-2 border-red-700 pb-2 mb-4">
                  <span className="font-bold text-red-800 uppercase tracking-wide text-sm">Liabilities</span>
                  <span className="font-bold text-red-800 text-sm">Amount (₹)</span>
                </div>
                <table className="w-full">
                  <tbody>
                    <ReportRow label="Current Liabilities" bold />
                    {creditors.length === 0 && <ReportRow label="No creditors recorded" indent={1} />}
                    {creditors.map(a => <ReportRow key={a.id} label={a.name} amount={Math.abs(Math.min(0, getEntityBalance(a.id,'Account')))} indent={1} />)}
                    <ReportRow label="Creditors Subtotal" amount={totalCreditors} indent={1} bold />

                    {loans.length > 0 && (
                      <>
                        <ReportRow label="Loans & Borrowings" bold />
                        {loans.map(a => <ReportRow key={a.id} label={a.name} amount={Math.abs(Math.min(0, getEntityBalance(a.id,'Account')))} indent={1} />)}
                        <ReportRow label="Loans Subtotal" amount={totalLoans} indent={1} bold />
                      </>
                    )}
                    {taxAccts.length > 0 && (
                      <>
                        <ReportRow label="Tax Payable" bold />
                        {taxAccts.map(a => <ReportRow key={a.id} label={a.name} amount={Math.abs(Math.min(0, getEntityBalance(a.id,'Account')))} indent={1} />)}
                        <ReportRow label="Tax Subtotal" amount={totalTax} indent={1} bold />
                      </>
                    )}
                    <ReportRow label="Total Liabilities" amount={totalLiabilities} bold separator />
                  </tbody>
                </table>

                <div className="mt-6">
                  <div className="flex justify-between items-center border-b-2 border-indigo-700 pb-2 mb-4">
                    <span className="font-bold text-indigo-800 uppercase tracking-wide text-sm">Equity</span>
                    <span className="font-bold text-indigo-800 text-sm">Amount (₹)</span>
                  </div>
                  <table className="w-full">
                    <tbody>
                      <ReportRow label="Owners Capital / Net Worth" amount={impliedEquity} indent={1} />
                    </tbody>
                    <tfoot>
                      <tr className="border-t-2 border-gray-800 bg-gray-800 text-white">
                        <td className="py-3 px-4 font-bold uppercase text-sm">TOTAL LIABILITIES & EQUITY</td>
                        <td className="py-3 px-4 text-right font-bold tabular-nums text-sm">{utils.formatCurrency(totalLiabilities + impliedEquity)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── PROFIT & LOSS ─────────────────────────────────────────────── */}
        {activeTab === 'PL' && (
          <div className="p-6 md:p-10">
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-800 text-white">
                  <tr>
                    <th className="py-3 px-5 text-left font-bold border-r border-gray-600">Particulars</th>
                    <th className="py-3 px-5 text-right font-bold w-48">Amount (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {/* Revenue */}
                  <tr className="bg-emerald-50">
                    <td className="py-3 px-5 font-bold text-emerald-800 uppercase text-xs tracking-wider border-r border-gray-100">OPERATING INCOME</td>
                    <td />
                  </tr>
                  <tr>
                    <td className="py-2.5 px-5 pl-10 text-gray-700 border-r border-gray-100">Fees & Consultancy Revenue</td>
                    <td className="py-2.5 px-5 text-right text-gray-900 tabular-nums">{utils.formatCurrency(totalIncome)}</td>
                  </tr>
                  <tr className="bg-gray-50 font-bold">
                    <td className="py-3 px-5 text-right text-gray-700 border-r border-gray-100">Total Operating Revenue (A)</td>
                    <td className="py-3 px-5 text-right text-emerald-700 tabular-nums">{utils.formatCurrency(totalIncome)}</td>
                  </tr>

                  {/* Expenses */}
                  <tr className="bg-red-50">
                    <td className="py-3 px-5 font-bold text-red-800 uppercase text-xs tracking-wider border-r border-gray-100">OPERATING EXPENSES</td>
                    <td />
                  </tr>
                  {Object.entries(expenseBreakdown).map(([cat, amt]) => (
                    <tr key={cat}>
                      <td className="py-2.5 px-5 pl-10 text-gray-700 border-r border-gray-100">{cat}</td>
                      <td className="py-2.5 px-5 text-right text-gray-900 tabular-nums">{utils.formatCurrency(amt)}</td>
                    </tr>
                  ))}
                  {Object.keys(expenseBreakdown).length === 0 && (
                    <tr>
                      <td className="py-3 px-5 pl-10 text-gray-400 italic border-r border-gray-100" colSpan={2}>No expenses recorded in this period.</td>
                    </tr>
                  )}
                  <tr className="bg-gray-50 font-bold">
                    <td className="py-3 px-5 text-right text-gray-700 border-r border-gray-100">Total Operating Expenses (B)</td>
                    <td className="py-3 px-5 text-right text-red-700 tabular-nums">{utils.formatCurrency(totalExpense)}</td>
                  </tr>

                  {/* Net P&L */}
                  <tr className={`text-lg font-bold ${netPL >= 0 ? 'bg-emerald-100 text-emerald-900' : 'bg-red-100 text-red-900'}`}>
                    <td className="py-4 px-5 text-right uppercase border-r border-gray-200">
                      {netPL >= 0 ? 'Net Operating Profit (A − B)' : 'Net Operating Loss (A − B)'}
                    </td>
                    <td className="py-4 px-5 text-right tabular-nums">{utils.formatCurrency(Math.abs(netPL))}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="mt-4 text-[11px] text-gray-400 italic">* Loans, transfers, and creditor receipts are excluded from operating profit.</p>
          </div>
        )}

        {/* ── TRIAL BALANCE ─────────────────────────────────────────────── */}
        {activeTab === 'TB' && (
          <div className="p-6 md:p-10">
            {/* Balance status banner */}
            <div className={`mb-5 flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-semibold ${
              isTrialBalanced
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-red-50 border-red-200 text-red-800'
            }`}>
              {isTrialBalanced
                ? <><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg> Trial Balance is balanced — Debits equal Credits</>
                : <><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg> Difference: {utils.formatCurrency(Math.abs(trialTotalDebit - trialTotalCredit))}</>
              }
            </div>

            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-800 text-white">
                  <tr>
                    <th className="py-3 px-5 text-left font-bold">Account Name</th>
                    <th className="py-3 px-5 text-left font-bold w-32 hidden md:table-cell">Type</th>
                    <th className="py-3 px-5 text-right font-bold w-40">Debit (Dr)</th>
                    <th className="py-3 px-5 text-right font-bold w-40">Credit (Cr)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {trialRows.map(r => (
                    <tr key={r.account.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-2.5 px-5">
                        <div className="font-medium text-gray-900">{r.account.name}</div>
                        {r.account.subType && <div className="text-xs text-gray-400">{r.account.subType}</div>}
                      </td>
                      <td className="py-2.5 px-5 hidden md:table-cell">
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 bg-gray-100 text-gray-600 rounded">{r.account.type}</span>
                      </td>
                      <td className="py-2.5 px-5 text-right tabular-nums font-mono">
                        {r.debit > 0 ? <span className="font-bold text-gray-900">{utils.formatCurrency(r.debit)}</span> : <span className="text-gray-300">—</span>}
                      </td>
                      <td className="py-2.5 px-5 text-right tabular-nums font-mono">
                        {r.credit > 0 ? <span className="font-bold text-gray-900">{utils.formatCurrency(r.credit)}</span> : <span className="text-gray-300">—</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-gray-800 text-white font-bold">
                    <td className="py-3 px-5 uppercase text-sm" colSpan={2}>TOTALS</td>
                    <td className="py-3 px-5 text-right tabular-nums text-sm">{utils.formatCurrency(trialTotalDebit)}</td>
                    <td className={`py-3 px-5 text-right tabular-nums text-sm ${isTrialBalanced ? '' : 'text-red-400'}`}>{utils.formatCurrency(trialTotalCredit)}</td>
                  </tr>
                  {!isTrialBalanced && (
                    <tr className="bg-red-50 text-red-800 font-bold text-sm">
                      <td className="py-2 px-5" colSpan={2}>Difference</td>
                      <td className="py-2 px-5 text-right tabular-nums" colSpan={2}>
                        {utils.formatCurrency(Math.abs(trialTotalDebit - trialTotalCredit))}
                      </td>
                    </tr>
                  )}
                </tfoot>
              </table>
            </div>
            <p className="mt-4 text-[11px] text-gray-400 italic">
              * Trial Balance shows all ledger account balances classified into Debit or Credit columns as at today.
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="border-t border-gray-100 px-8 py-4 text-center text-xs text-gray-400">
          Computer-generated report · SPR Techforge Management System · {new Date().toLocaleString()}
        </div>
      </div>
    </div>
  );
};
