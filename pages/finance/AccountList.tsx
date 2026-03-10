import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Card, Button, ConfirmationModal, SearchInput } from '../../components/Components';
import { Link, useNavigate } from 'react-router-dom';
import * as utils from '../../utils';
import { Account, AccountType } from '../../types';

export const AccountList: React.FC = () => {
  const { accounts, getEntityBalance, deleteAccount } = useApp();
  const navigate = useNavigate();
  const [filterText, setFilterText] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('All');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleDeleteClick = (id: string, isSystem: boolean | undefined) => {
    if (isSystem) {
      alert("Cannot delete system accounts");
      return;
    }
    setDeleteId(id);
  };

  const confirmDelete = () => {
    if (deleteId) {
      deleteAccount(deleteId);
      setDeleteId(null);
    }
  };

  const getBalanceColor = (balance: number) => {
    if (balance > 0) return 'text-emerald-600';
    if (balance < 0) return 'text-red-600';
    return 'text-gray-400';
  };

  // Filter accounts based on search text and type
  const filteredAccounts = accounts.filter(a => {
    const matchesText =
      a.name.toLowerCase().includes(filterText.toLowerCase()) ||
      (a.subType && a.subType.toLowerCase().includes(filterText.toLowerCase())) ||
      (a.description && a.description.toLowerCase().includes(filterText.toLowerCase()));
    const matchesType = typeFilter === 'All' || a.type === typeFilter;
    return matchesText && matchesType;
  });

  // Group accounts by Sub Ledger
  const grouped = filteredAccounts.reduce((acc, curr) => {
    const groupName = curr.subType || `General ${curr.type}`;
    if (!acc[groupName]) acc[groupName] = [];
    acc[groupName].push(curr);
    return acc;
  }, {} as Record<string, Account[]>);

  // Summary stats
  const cashBankAccounts = accounts.filter(a => a.type === AccountType.Cash || a.type === AccountType.Bank);
  const totalCashBank = cashBankAccounts.reduce((sum, a) => sum + getEntityBalance(a.id, 'Account'), 0);
  const debtorAccounts = accounts.filter(a => a.type === AccountType.Debtor);
  const totalDebtors = debtorAccounts.reduce((sum, a) => sum + getEntityBalance(a.id, 'Account'), 0);
  const creditorAccounts = accounts.filter(a => a.type === AccountType.Creditor);
  const totalCreditors = creditorAccounts.reduce((sum, a) => {
    const b = getEntityBalance(a.id, 'Account');
    return sum + (b < 0 ? Math.abs(b) : 0);
  }, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Ledger Accounts</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {filteredAccounts.length !== accounts.length
              ? `${filteredAccounts.length} of ${accounts.length} accounts`
              : `${accounts.length} accounts`} &nbsp;·&nbsp; {Object.keys(grouped).length} sub-ledger{Object.keys(grouped).length !== 1 ? 's' : ''}
          </p>
        </div>
        <Link to="/finance/accounts/new">
          <Button>+ Add Account</Button>
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm border-l-4 border-l-emerald-500">
          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Cash & Bank Balance</p>
          <p className={`text-2xl font-bold mt-1 tabular-nums whitespace-nowrap ${totalCashBank >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
            {utils.formatCurrency(totalCashBank)}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">{cashBankAccounts.length} account{cashBankAccounts.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm border-l-4 border-l-blue-500">
          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Sundry Debtors</p>
          <p className={`text-2xl font-bold mt-1 tabular-nums whitespace-nowrap ${totalDebtors >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
            {utils.formatCurrency(totalDebtors)}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">{debtorAccounts.length} debtor{debtorAccounts.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm border-l-4 border-l-red-400">
          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Creditors / Payables</p>
          <p className={`text-2xl font-bold mt-1 tabular-nums whitespace-nowrap ${totalCreditors > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
            {utils.formatCurrency(totalCreditors)}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">{creditorAccounts.length} creditor{creditorAccounts.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <SearchInput
            placeholder="Search accounts, sub-ledgers or descriptions..."
            value={filterText}
            onChange={e => setFilterText(e.target.value)}
            onClear={() => setFilterText('')}
          />
        </div>
        <select
          className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 focus:ring-1 focus:ring-spr-accent outline-none min-w-[160px]"
          value={typeFilter}
          onChange={e => setTypeFilter(e.target.value)}
        >
          <option value="All">All Types</option>
          {Object.values(AccountType).map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        {(filterText !== '' || typeFilter !== 'All') && (
          <button
            onClick={() => { setFilterText(''); setTypeFilter('All'); }}
            className="text-xs text-red-500 hover:text-red-700 font-medium px-3 py-2 bg-red-50 rounded-lg border border-red-100 whitespace-nowrap"
          >
            Clear
          </button>
        )}
      </div>

      {Object.keys(grouped).length > 0 ? (
        Object.entries(grouped).sort().map(([groupName, accs]: [string, Account[]]) => {
          const groupTotal = accs.reduce((sum, a) => sum + getEntityBalance(a.id, 'Account'), 0);
          return (
            <Card
              key={groupName}
              title={groupName}
              action={
                <div className="flex items-center gap-3">
                  <span className={`font-bold text-sm tabular-nums whitespace-nowrap ${groupTotal >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                    {utils.formatCurrency(groupTotal)}
                  </span>
                  <span className="text-[10px] font-bold bg-gray-100 text-gray-500 px-2 py-1 rounded uppercase tracking-widest">{accs[0].type}</span>
                </div>
              }
              className="mb-6 border-l-4 border-l-indigo-500"
            >
              <div className="overflow-x-auto">
                <table className="w-full text-left text-gray-600">
                  <thead>
                    <tr className="border-b border-gray-100 text-[10px] uppercase font-bold text-gray-400">
                      <th className="py-2 px-4">Ledger Name</th>
                      <th className="py-2 px-4 text-right">Current Balance</th>
                      <th className="py-2 px-4 text-center w-32">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {accs.map(a => {
                      const balance = getEntityBalance(a.id, 'Account');
                      return (
                        <tr key={a.id} className="hover:bg-indigo-50/30 transition-colors">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <div>
                                <div className="font-bold text-gray-800">{a.name}</div>
                                {a.description && <div className="text-[10px] text-gray-400 italic">{a.description}</div>}
                              </div>
                              {a.isSystem && (
                                <span className="text-[9px] bg-gray-100 text-gray-400 border border-gray-200 px-1.5 py-0.5 rounded uppercase font-bold tracking-wider">System</span>
                              )}
                            </div>
                          </td>
                          <td className={`py-3 px-4 text-right font-mono font-bold whitespace-nowrap tabular-nums ${getBalanceColor(balance)}`}>
                            {utils.formatCurrency(balance)}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <div className="flex justify-center gap-1">
                              <button
                                onClick={() => navigate(`/finance/statement/Account/${a.id}`)}
                                className="p-1.5 text-indigo-600 hover:bg-indigo-100 rounded"
                                title="Statement"
                              >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                              </button>
                              <button
                                onClick={() => navigate(`/finance/accounts/edit/${a.id}`)}
                                className="p-1.5 text-blue-600 hover:bg-blue-100 rounded"
                                title="Edit"
                              >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                              </button>
                              {!a.isSystem && (
                                <button
                                  onClick={() => handleDeleteClick(a.id, a.isSystem)}
                                  className="p-1.5 text-red-500 hover:bg-red-100 rounded"
                                  title="Delete"
                                >
                                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          );
        })
      ) : (
        <div className="text-center text-gray-500 py-16 bg-white rounded-xl border border-gray-300 border-dashed">
          <svg className="w-10 h-10 mx-auto mb-3 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
          <p className="font-medium">No ledger accounts found{filterText ? ` matching "${filterText}"` : ''}.</p>
        </div>
      )}

      <ConfirmationModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={confirmDelete}
        title="Delete Account"
        message="Are you sure you want to delete this account? History will be preserved but the account name will be lost in filters."
      />
    </div>
  );
};
