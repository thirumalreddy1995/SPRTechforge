import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Button, ConfirmationModal } from '../../components/Components';
import { Link, useNavigate } from 'react-router-dom';
import * as utils from '../../utils';
import { Account, AccountType } from '../../types';

// ─── Accounting hierarchy mapping ─────────────────────────────────────────────
type AccountCategory = 'Assets' | 'Liabilities' | 'Equity' | 'Income' | 'Expenses';

const CATEGORY_MAP: Record<AccountType, AccountCategory> = {
  [AccountType.Cash]:         'Assets',
  [AccountType.Bank]:         'Assets',
  [AccountType.CurrentAsset]: 'Assets',
  [AccountType.FixedAsset]:   'Assets',
  [AccountType.Debtor]:       'Assets',
  [AccountType.Creditor]:     'Liabilities',
  [AccountType.Loan]:         'Liabilities',
  [AccountType.Tax]:          'Liabilities',
  [AccountType.Capital]:      'Equity',
  [AccountType.Equity]:       'Equity',
  [AccountType.Income]:       'Income',
  [AccountType.Expense]:      'Expenses',
  [AccountType.Salary]:       'Expenses',
};

const CATEGORY_CONFIG: Record<AccountCategory, {
  label: string;
  icon: string;
  headerBg: string;
  headerText: string;
  borderColor: string;
  badgeColor: string;
  balanceSign: 'normal' | 'inverted';
}> = {
  Assets: {
    label: 'Assets',
    icon: '🏦',
    headerBg: 'bg-blue-50',
    headerText: 'text-blue-800',
    borderColor: 'border-blue-200',
    badgeColor: 'bg-blue-100 text-blue-700',
    balanceSign: 'normal',
  },
  Liabilities: {
    label: 'Liabilities',
    icon: '💳',
    headerBg: 'bg-red-50',
    headerText: 'text-red-800',
    borderColor: 'border-red-200',
    badgeColor: 'bg-red-100 text-red-700',
    balanceSign: 'inverted',
  },
  Equity: {
    label: 'Equity',
    icon: '📐',
    headerBg: 'bg-purple-50',
    headerText: 'text-purple-800',
    borderColor: 'border-purple-200',
    badgeColor: 'bg-purple-100 text-purple-700',
    balanceSign: 'normal',
  },
  Income: {
    label: 'Income',
    icon: '📈',
    headerBg: 'bg-emerald-50',
    headerText: 'text-emerald-800',
    borderColor: 'border-emerald-200',
    badgeColor: 'bg-emerald-100 text-emerald-700',
    balanceSign: 'inverted',
  },
  Expenses: {
    label: 'Expenses',
    icon: '📉',
    headerBg: 'bg-orange-50',
    headerText: 'text-orange-800',
    borderColor: 'border-orange-200',
    badgeColor: 'bg-orange-100 text-orange-700',
    balanceSign: 'normal',
  },
};

const CATEGORY_ORDER: AccountCategory[] = ['Assets', 'Liabilities', 'Equity', 'Income', 'Expenses'];

export const AccountList: React.FC = () => {
  const { accounts, getEntityBalance, deleteAccount } = useApp();
  const navigate = useNavigate();

  const [search, setSearch]           = useState('');
  const [typeFilter, setTypeFilter]   = useState<string>('All');
  const [collapsed, setCollapsed]     = useState<Set<AccountCategory>>(new Set());
  const [deleteId, setDeleteId]       = useState<string | null>(null);

  const toggleCategory = (cat: AccountCategory) => {
    setCollapsed(prev => {
      const next = new Set(prev);
      next.has(cat) ? next.delete(cat) : next.add(cat);
      return next;
    });
  };

  // Filter accounts
  const filtered = useMemo(() => accounts.filter(a => {
    const q = search.toLowerCase();
    const matchText =
      a.name.toLowerCase().includes(q) ||
      (a.subType?.toLowerCase().includes(q) ?? false) ||
      (a.description?.toLowerCase().includes(q) ?? false);
    const matchType = typeFilter === 'All' || a.type === typeFilter;
    return matchText && matchType;
  }), [accounts, search, typeFilter]);

  // Group by accounting category > sub-type
  const grouped = useMemo(() => {
    const cats: Record<AccountCategory, Record<string, Account[]>> = {
      Assets: {}, Liabilities: {}, Equity: {}, Income: {}, Expenses: {},
    };
    filtered.forEach(a => {
      const cat = CATEGORY_MAP[a.type] || 'Assets';
      const sub = a.subType || a.type;
      if (!cats[cat][sub]) cats[cat][sub] = [];
      cats[cat][sub].push(a);
    });
    return cats;
  }, [filtered]);

  // Summary KPIs
  const totalCashBank = useMemo(() =>
    accounts.filter(a => a.type === AccountType.Cash || a.type === AccountType.Bank)
      .reduce((s, a) => s + getEntityBalance(a.id, 'Account'), 0),
    [accounts, getEntityBalance]
  );
  const totalDebtors = useMemo(() =>
    accounts.filter(a => a.type === AccountType.Debtor)
      .reduce((s, a) => s + getEntityBalance(a.id, 'Account'), 0),
    [accounts, getEntityBalance]
  );
  const totalPayables = useMemo(() =>
    accounts.filter(a => a.type === AccountType.Creditor)
      .reduce((s, a) => { const b = getEntityBalance(a.id, 'Account'); return s + (b < 0 ? Math.abs(b) : 0); }, 0),
    [accounts, getEntityBalance]
  );
  const totalAssets = useMemo(() =>
    accounts.filter(a => CATEGORY_MAP[a.type] === 'Assets')
      .reduce((s, a) => s + getEntityBalance(a.id, 'Account'), 0),
    [accounts, getEntityBalance]
  );

  const handleDelete = (a: Account) => {
    if (a.isSystem) { alert('System accounts cannot be deleted.'); return; }
    setDeleteId(a.id);
  };

  return (
    <div className="space-y-6">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Chart of Accounts</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {accounts.length} ledger accounts · Organized by accounting classification
          </p>
        </div>
        <Link to="/finance/accounts/new">
          <button className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors shadow-sm">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            New Account
          </button>
        </Link>
      </div>

      {/* ── KPI Summary Row ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Cash & Bank', value: totalCashBank, color: 'border-l-blue-500', text: 'text-blue-700' },
          { label: 'Total Assets', value: totalAssets, color: 'border-l-emerald-500', text: 'text-emerald-700' },
          { label: 'Sundry Debtors', value: totalDebtors, color: 'border-l-indigo-500', text: 'text-indigo-700' },
          { label: 'Payables (Creditors)', value: totalPayables, color: 'border-l-red-500', text: totalPayables > 0 ? 'text-red-700' : 'text-emerald-700' },
        ].map(kpi => (
          <div key={kpi.label} className={`bg-white rounded-xl border border-gray-100 border-l-4 ${kpi.color} shadow-sm p-4`}>
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{kpi.label}</p>
            <p className={`text-xl font-bold mt-1 tabular-nums ${kpi.text}`}>{utils.formatCurrency(kpi.value)}</p>
          </div>
        ))}
      </div>

      {/* ── Search & Filter ──────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 bg-white"
            placeholder="Search accounts, groups, descriptions…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 min-w-[180px]"
          value={typeFilter}
          onChange={e => setTypeFilter(e.target.value)}
        >
          <option value="All">All Account Types</option>
          {Object.values(AccountType).map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        {(search || typeFilter !== 'All') && (
          <button onClick={() => { setSearch(''); setTypeFilter('All'); }}
            className="text-sm text-red-500 hover:text-red-700 font-semibold px-3 py-2 bg-red-50 rounded-lg border border-red-100 whitespace-nowrap">
            Clear
          </button>
        )}
      </div>

      {/* ── Accounting Hierarchy ─────────────────────────────────────────────── */}
      {CATEGORY_ORDER.map(cat => {
        const subGroups = grouped[cat];
        const accCount  = Object.values(subGroups).flat().length;
        if (accCount === 0 && !search && typeFilter === 'All') return null;
        if (accCount === 0) return null;

        const cfg = CATEGORY_CONFIG[cat];
        const isCollapsed = collapsed.has(cat);

        const categoryTotal = Object.values(subGroups)
          .flat()
          .reduce((s, a) => s + getEntityBalance(a.id, 'Account'), 0);

        return (
          <div key={cat} className={`bg-white rounded-2xl border shadow-sm overflow-hidden ${cfg.borderColor}`}>
            {/* Category Header */}
            <button
              onClick={() => toggleCategory(cat)}
              className={`w-full flex items-center justify-between px-5 py-4 ${cfg.headerBg} hover:opacity-90 transition-opacity`}
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">{cfg.icon}</span>
                <div className="text-left">
                  <h2 className={`text-base font-bold ${cfg.headerText}`}>{cfg.label}</h2>
                  <p className="text-xs text-gray-400">{accCount} account{accCount !== 1 ? 's' : ''} · {Object.keys(subGroups).length} group{Object.keys(subGroups).length !== 1 ? 's' : ''}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-[10px] text-gray-400 uppercase font-bold">Total Balance</p>
                  <p className={`text-base font-bold tabular-nums ${categoryTotal >= 0 ? 'text-gray-900' : 'text-red-600'}`}>
                    {utils.formatCurrency(categoryTotal)}
                  </p>
                </div>
                <svg
                  className={`w-5 h-5 text-gray-400 transition-transform ${isCollapsed ? 'rotate-0' : 'rotate-180'}`}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </button>

            {/* Sub-groups + Accounts */}
            {!isCollapsed && (
              <div className="divide-y divide-gray-50">
                {Object.entries(subGroups).sort().map(([groupName, accs]) => {
                  const groupTotal = accs.reduce((s, a) => s + getEntityBalance(a.id, 'Account'), 0);
                  return (
                    <div key={groupName}>
                      {/* Sub-group header */}
                      <div className="flex items-center justify-between px-5 py-2 bg-gray-50/60">
                        <div className="flex items-center gap-2">
                          <div className="w-1 h-4 bg-gray-200 rounded-full" />
                          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{groupName}</span>
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${cfg.badgeColor}`}>
                            {accs.length}
                          </span>
                        </div>
                        <span className={`text-xs font-bold tabular-nums ${groupTotal >= 0 ? 'text-gray-700' : 'text-red-600'}`}>
                          {utils.formatCurrency(groupTotal)}
                        </span>
                      </div>

                      {/* Account rows */}
                      <div className="divide-y divide-gray-50">
                        {accs.map(a => {
                          const balance = getEntityBalance(a.id, 'Account');
                          return (
                            <div key={a.id} className="flex items-center justify-between px-5 py-3 hover:bg-blue-50/30 transition-colors group">
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="pl-4">
                                  <div className="flex items-center gap-2">
                                    <span className="font-semibold text-gray-800 text-sm">{a.name}</span>
                                    {a.isSystem && (
                                      <span className="text-[9px] bg-gray-100 text-gray-400 border border-gray-200 px-1.5 py-0.5 rounded uppercase font-bold">System</span>
                                    )}
                                  </div>
                                  {a.description && (
                                    <p className="text-xs text-gray-400 italic mt-0.5">{a.description}</p>
                                  )}
                                  <div className="flex items-center gap-2 mt-0.5">
                                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${cfg.badgeColor}`}>{a.type}</span>
                                    {a.openingBalance !== 0 && (
                                      <span className="text-[10px] text-gray-400">Opening: {utils.formatCurrency(a.openingBalance)}</span>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-3 shrink-0">
                                <span className={`text-base font-bold tabular-nums ${balance > 0 ? 'text-emerald-600' : balance < 0 ? 'text-red-600' : 'text-gray-400'}`}>
                                  {utils.formatCurrency(balance)}
                                </span>
                                {/* Action buttons - visible on hover */}
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button
                                    onClick={() => navigate(`/finance/statement/Account/${a.id}`)}
                                    className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                    title="View Statement"
                                  >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                  </button>
                                  <button
                                    onClick={() => navigate(`/finance/accounts/edit/${a.id}`)}
                                    className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                    title="Edit Account"
                                  >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                  </button>
                                  {!a.isSystem && (
                                    <button
                                      onClick={() => handleDelete(a)}
                                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                      title="Delete Account"
                                    >
                                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}

      {filtered.length === 0 && (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-300">
          <svg className="w-10 h-10 mx-auto mb-3 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
          <p className="font-medium text-gray-500">No accounts found{search ? ` matching "${search}"` : ''}.</p>
        </div>
      )}

      <ConfirmationModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => { if (deleteId) { deleteAccount(deleteId); setDeleteId(null); } }}
        title="Delete Account"
        message="Are you sure you want to delete this account? Transaction history will be preserved, but the account will be removed from the chart of accounts."
      />
    </div>
  );
};
