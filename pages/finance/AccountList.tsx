import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Card, Button, ConfirmationModal, SearchInput } from '../../components/Components';
import { Link, useNavigate } from 'react-router-dom';
import * as utils from '../../utils';
import { Account } from '../../types';

export const AccountList: React.FC = () => {
  const { accounts, getEntityBalance, deleteAccount } = useApp();
  const navigate = useNavigate();
  const [filterText, setFilterText] = useState('');
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

  // Filter accounts based on search text
  const filteredAccounts = accounts.filter(a => 
    a.name.toLowerCase().includes(filterText.toLowerCase()) || 
    (a.subType && a.subType.toLowerCase().includes(filterText.toLowerCase()))
  );

  // Group accounts by Sub Ledger (Grouping)
  // If no subType, group by Type
  const grouped = filteredAccounts.reduce((acc, curr) => {
    const groupName = curr.subType || `General ${curr.type}`;
    if (!acc[groupName]) acc[groupName] = [];
    acc[groupName].push(curr);
    return acc;
  }, {} as Record<string, Account[]>);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h1 className="text-3xl font-bold text-gray-900">Ledger Accounts</h1>
           <p className="text-sm text-gray-500">Manage your Chart of Accounts organized by Sub Ledgers.</p>
        </div>
        <Link to="/finance/accounts/new">
          <Button>+ Add Account</Button>
        </Link>
      </div>

      <Card className="p-0">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-gray-500 ml-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <SearchInput 
            placeholder="Search accounts or sub-ledgers..." 
            className="w-full border-none rounded-lg py-4 shadow-none focus:ring-0"
            value={filterText}
            onChange={e => setFilterText(e.target.value)}
            onClear={() => setFilterText('')}
          />
        </div>
      </Card>

      {Object.keys(grouped).length > 0 ? (
        Object.entries(grouped).sort().map(([groupName, accs]: [string, Account[]]) => (
          <Card key={groupName} title={groupName} action={<span className="text-[10px] font-bold bg-gray-100 text-gray-500 px-2 py-1 rounded uppercase tracking-widest">{accs[0].type}</span>} className="mb-6 border-l-4 border-l-indigo-500">
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
                            <div className="font-bold text-gray-800">{a.name}</div>
                            {a.description && <div className="text-[10px] text-gray-400 italic">{a.description}</div>}
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
        ))
      ) : (
        <div className="text-center text-gray-500 py-12 bg-white rounded-xl border border-gray-300 border-dashed">
          <p>No ledger accounts found matching "{filterText}".</p>
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