import React, { useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Link } from 'react-router-dom';
import * as utils from '../../utils';
import { TransactionType, AccountType } from '../../types';

// ─── Mini KPI Card ────────────────────────────────────────────────────────────
const KpiCard: React.FC<{
  label: string;
  value: string;
  sub?: string;
  color: string;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
}> = ({ label, value, sub, color, icon, trend }) => (
  <div className={`bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-start gap-4`}>
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
      {icon}
    </div>
    <div className="min-w-0 flex-1">
      <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">{label}</p>
      <p className="text-2xl font-bold text-gray-900 tabular-nums leading-tight truncate">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
    {trend && (
      <div className={`text-xs font-bold px-2 py-1 rounded-full shrink-0 ${trend === 'up' ? 'bg-emerald-50 text-emerald-600' : trend === 'down' ? 'bg-red-50 text-red-600' : 'bg-gray-50 text-gray-500'}`}>
        {trend === 'up' ? '▲' : trend === 'down' ? '▼' : '—'}
      </div>
    )}
  </div>
);

// ─── Inline Bar Chart (CSS) ────────────────────────────────────────────────────
const MiniBar: React.FC<{ value: number; max: number; color: string }> = ({ value, max, color }) => (
  <div className="flex items-end h-14 w-full gap-0.5">
    <div className={`w-full rounded-t ${color} transition-all duration-500`} style={{ height: max > 0 ? `${Math.max(4, (value / max) * 100)}%` : '4%' }} />
  </div>
);

export const FinanceDashboard: React.FC = () => {
  const { accounts, transactions, candidates, getEntityBalance } = useApp();

  const now = new Date();

  // ── KPI: Cash & Bank ──────────────────────────────────────────────────────
  const cashBankAccounts = useMemo(
    () => accounts.filter(a => a.type === AccountType.Cash || a.type === AccountType.Bank),
    [accounts]
  );
  const totalCashBank = useMemo(
    () => cashBankAccounts.reduce((sum, a) => sum + getEntityBalance(a.id, 'Account'), 0),
    [cashBankAccounts, getEntityBalance]
  );

  // ── KPI: Payables ─────────────────────────────────────────────────────────
  const totalPayables = useMemo(() => {
    return accounts
      .filter(a => a.type === AccountType.Creditor)
      .reduce((sum, a) => {
        const b = getEntityBalance(a.id, 'Account');
        return sum + (b < 0 ? Math.abs(b) : 0);
      }, 0);
  }, [accounts, getEntityBalance]);

  // ── KPI: Receivables (Candidate fees pending) ──────────────────────────────
  const totalReceivables = useMemo(() => {
    return candidates.reduce((sum, c) => {
      if (!c.isActive && c.status === 'Discontinued') return sum;
      const paid = transactions
        .filter(t => t.fromEntityId === c.id && t.type === TransactionType.Income)
        .reduce((s, t) => s + t.amount, 0);
      const refunded = transactions
        .filter(t => t.toEntityId === c.id && t.type === TransactionType.Refund)
        .reduce((s, t) => s + t.amount, 0);
      const due = c.agreedAmount - (paid - refunded);
      return sum + (due > 0 ? due : 0);
    }, 0);
  }, [candidates, transactions]);

  // ── KPI: This Month P&L ───────────────────────────────────────────────────
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const thisMonthTxns = useMemo(
    () => transactions.filter(t => new Date(t.date) >= thisMonthStart),
    [transactions]
  );
  const thisMonthIncome = thisMonthTxns.filter(t => t.type === TransactionType.Income).reduce((s, t) => s + t.amount, 0);
  const thisMonthExpense = thisMonthTxns.filter(t => t.type === TransactionType.Payment).reduce((s, t) => s + t.amount, 0);
  const netProfit = thisMonthIncome - thisMonthExpense;

  // ── Monthly Chart Data (last 6 months) ────────────────────────────────────
  const monthlyData = useMemo(() => {
    return Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      const end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);
      const monthTxns = transactions.filter(t => {
        const td = new Date(t.date);
        return td >= d && td <= end;
      });
      return {
        label: d.toLocaleString('default', { month: 'short' }),
        income: monthTxns.filter(t => t.type === TransactionType.Income).reduce((s, t) => s + t.amount, 0),
        expense: monthTxns.filter(t => t.type === TransactionType.Payment).reduce((s, t) => s + t.amount, 0),
      };
    });
  }, [transactions]);

  const maxMonthlyVal = Math.max(...monthlyData.flatMap(m => [m.income, m.expense]), 1);

  // ── Recent Transactions ───────────────────────────────────────────────────
  const recentTxns = useMemo(
    () => [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 8),
    [transactions]
  );

  const getEntityName = useApp().getEntityName;

  const typeStyle: Record<string, { label: string; dot: string; text: string }> = {
    [TransactionType.Income]: { label: 'Income', dot: 'bg-emerald-500', text: 'text-emerald-600' },
    [TransactionType.Payment]: { label: 'Payment', dot: 'bg-red-500', text: 'text-red-600' },
    [TransactionType.Transfer]: { label: 'Transfer', dot: 'bg-blue-500', text: 'text-blue-600' },
    [TransactionType.Refund]: { label: 'Refund', dot: 'bg-amber-500', text: 'text-amber-600' },
  };

  // ── Top expense categories (this month) ────────────────────────────────────
  const topExpenses = useMemo(() => {
    const map: Record<string, number> = {};
    thisMonthTxns
      .filter(t => t.type === TransactionType.Payment)
      .forEach(t => {
        const acc = accounts.find(a => a.id === t.toEntityId);
        const cat = acc?.subType || acc?.name || 'General';
        map[cat] = (map[cat] || 0) + t.amount;
      });
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 4);
  }, [thisMonthTxns, accounts]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Finance Overview</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {now.toLocaleString('default', { month: 'long', year: 'numeric' })} · SPR Techforge
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Link to="/finance/transactions/new">
            <button className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors shadow-sm">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              New Entry
            </button>
          </Link>
          <Link to="/finance/accounts/new">
            <button className="inline-flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 text-sm font-semibold px-4 py-2 rounded-lg border border-gray-200 transition-colors shadow-sm">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
              New Account
            </button>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard
          label="Cash & Bank"
          value={utils.formatCurrency(totalCashBank)}
          sub={`${cashBankAccounts.length} account${cashBankAccounts.length !== 1 ? 's' : ''}`}
          color="bg-blue-50 text-blue-600"
          icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>}
        />
        <KpiCard
          label="Receivables"
          value={utils.formatCurrency(totalReceivables)}
          sub="Candidate fees pending"
          color="bg-emerald-50 text-emerald-600"
          icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" /></svg>}
        />
        <KpiCard
          label="Payables"
          value={utils.formatCurrency(totalPayables)}
          sub="Outstanding to creditors"
          color="bg-red-50 text-red-600"
          icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>}
        />
        <KpiCard
          label={`Net ${netProfit >= 0 ? 'Profit' : 'Loss'} (This Month)`}
          value={utils.formatCurrency(Math.abs(netProfit))}
          sub={`Income: ${utils.formatCurrency(thisMonthIncome)} · Exp: ${utils.formatCurrency(thisMonthExpense)}`}
          color={netProfit >= 0 ? 'bg-indigo-50 text-indigo-600' : 'bg-orange-50 text-orange-600'}
          trend={netProfit > 0 ? 'up' : netProfit < 0 ? 'down' : 'neutral'}
          icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>}
        />
      </div>

      {/* Charts + Quick Links row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Income vs Expense Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-gray-700">Income vs Expenses — Last 6 Months</h2>
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-emerald-400 inline-block"></span>Income</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-400 inline-block"></span>Expense</span>
            </div>
          </div>
          <div className="flex items-end gap-2 h-32">
            {monthlyData.map(m => (
              <div key={m.label} className="flex-1 flex flex-col items-center gap-1">
                <div className="flex items-end gap-0.5 w-full h-24">
                  <div
                    className="flex-1 bg-emerald-400 rounded-t-sm transition-all duration-500 min-h-[3px]"
                    style={{ height: `${Math.max(2, (m.income / maxMonthlyVal) * 100)}%` }}
                    title={`Income: ${utils.formatCurrency(m.income)}`}
                  />
                  <div
                    className="flex-1 bg-red-400 rounded-t-sm transition-all duration-500 min-h-[3px]"
                    style={{ height: `${Math.max(2, (m.expense / maxMonthlyVal) * 100)}%` }}
                    title={`Expense: ${utils.formatCurrency(m.expense)}`}
                  />
                </div>
                <span className="text-[10px] text-gray-400 font-medium">{m.label}</span>
              </div>
            ))}
          </div>
          {transactions.length === 0 && (
            <p className="text-center text-xs text-gray-400 mt-2">No transactions recorded yet</p>
          )}
        </div>

        {/* Quick Navigation */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h2 className="text-sm font-bold text-gray-700 mb-4">Quick Navigation</h2>
          <div className="space-y-2">
            {[
              { to: '/finance/transactions', icon: '📋', label: 'Transaction Register', sub: `${transactions.length} entries` },
              { to: '/finance/accounts', icon: '📊', label: 'Chart of Accounts', sub: `${accounts.length} ledgers` },
              { to: '/finance/financial-statements', icon: '📈', label: 'Financial Reports', sub: 'P&L · Balance Sheet · Trial Balance' },
              { to: '/finance/payroll', icon: '💼', label: 'Payroll & Fixed Expenses', sub: 'Recurring obligations' },
            ].map(item => (
              <Link key={item.to} to={item.to}>
                <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-blue-50 transition-colors group cursor-pointer">
                  <span className="text-xl">{item.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-gray-800 group-hover:text-blue-700">{item.label}</div>
                    <div className="text-xs text-gray-400 truncate">{item.sub}</div>
                  </div>
                  <svg className="w-4 h-4 text-gray-300 group-hover:text-blue-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Transactions + Top Expenses row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Recent Transactions */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
            <h2 className="text-sm font-bold text-gray-700">Recent Transactions</h2>
            <Link to="/finance/transactions" className="text-xs text-blue-600 hover:text-blue-800 font-semibold">View all →</Link>
          </div>
          <div className="divide-y divide-gray-50">
            {recentTxns.length === 0 ? (
              <div className="py-12 text-center text-gray-400 text-sm">
                <svg className="w-8 h-8 mx-auto mb-2 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                No transactions yet
              </div>
            ) : recentTxns.map(t => {
              const style = typeStyle[t.type] || { label: t.type, dot: 'bg-gray-400', text: 'text-gray-600' };
              const fromName = getEntityName(t.fromEntityId, t.fromEntityType);
              const toName = getEntityName(t.toEntityId, t.toEntityType);
              return (
                <div key={t.id} className="flex items-center justify-between px-5 py-3 hover:bg-gray-50/80 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-2 h-2 rounded-full shrink-0 ${style.dot}`} />
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-gray-800 truncate">
                        {t.type === TransactionType.Income ? fromName : toName}
                      </div>
                      <div className="text-xs text-gray-400 truncate">
                        {fromName} → {toName} · {new Date(t.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' })}
                      </div>
                    </div>
                  </div>
                  <div className="text-right shrink-0 ml-4">
                    <div className={`text-sm font-bold tabular-nums ${style.text}`}>
                      {t.type === TransactionType.Income ? '+' : t.type === TransactionType.Payment ? '−' : ''}
                      {utils.formatCurrency(t.amount)}
                    </div>
                    <div className={`text-[10px] font-bold ${style.text} opacity-70`}>{style.label}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Expenses + Bank Balances */}
        <div className="space-y-4">

          {/* Bank Account Balances */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h2 className="text-sm font-bold text-gray-700 mb-3">Bank & Cash Accounts</h2>
            {cashBankAccounts.length === 0 ? (
              <p className="text-xs text-gray-400 py-4 text-center">No cash/bank accounts</p>
            ) : (
              <div className="space-y-2">
                {cashBankAccounts.map(a => {
                  const bal = getEntityBalance(a.id, 'Account');
                  return (
                    <Link key={a.id} to={`/finance/statement/Account/${a.id}`}>
                      <div className="flex items-center justify-between py-2 px-2 rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-gray-800 truncate">{a.name}</div>
                          <div className="text-[10px] text-gray-400 uppercase font-bold">{a.type}</div>
                        </div>
                        <span className={`text-sm font-bold tabular-nums ${bal >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                          {utils.formatCurrency(bal)}
                        </span>
                      </div>
                    </Link>
                  );
                })}
                <div className="flex justify-between pt-2 border-t border-gray-100 text-xs font-bold text-gray-600">
                  <span>Total</span>
                  <span className={totalCashBank >= 0 ? 'text-emerald-700' : 'text-red-700'}>{utils.formatCurrency(totalCashBank)}</span>
                </div>
              </div>
            )}
          </div>

          {/* Top Expense Categories */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h2 className="text-sm font-bold text-gray-700 mb-3">Top Expenses — This Month</h2>
            {topExpenses.length === 0 ? (
              <p className="text-xs text-gray-400 py-4 text-center">No expenses this month</p>
            ) : (
              <div className="space-y-3">
                {topExpenses.map(([cat, amt]) => (
                  <div key={cat}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-medium text-gray-700 truncate">{cat}</span>
                      <span className="font-bold text-red-600 tabular-nums ml-2">{utils.formatCurrency(amt)}</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                      <div
                        className="bg-red-400 h-1.5 rounded-full transition-all"
                        style={{ width: `${(amt / (topExpenses[0][1] || 1)) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};
