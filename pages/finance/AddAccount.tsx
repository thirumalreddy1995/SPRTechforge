import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Card, Button, Input, Select } from '../../components/Components';
import { useNavigate, useParams } from 'react-router-dom';
import { Account, AccountType } from '../../types';
import * as utils from '../../utils';

export const AddAccount: React.FC = () => {
  const { addAccount, updateAccount, accounts, showToast } = useApp();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [form, setForm] = useState<Partial<Account>>({
    name: '',
    type: AccountType.Expense,
    subType: '',
    openingBalance: 0,
    description: '',
    recurringAmount: 0,
    recurringStartDate: '',
    recurringDueDay: 1
  });

  useEffect(() => {
    if (id) {
      const existing = accounts.find(a => a.id === id);
      if (existing) setForm(existing);
    }
  }, [id, accounts]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name) return alert('Account Name is required');

    const accData: Account = {
      ...form as Account,
      id: id || utils.generateId(),
    };

    if (id) {
      updateAccount(accData);
      showToast('Ledger Account updated successfully');
    } else {
      addAccount(accData);
      showToast('Ledger Account created successfully');
    }
    navigate('/finance/accounts');
  };

  // Show recurring fields for Salary, Expense, and specific sub-types if needed
  const showRecurringFields = form.type === AccountType.Salary || form.type === AccountType.Expense;

  const accountTypeDescriptions: Record<string, string> = {
    [AccountType.Cash]: 'Physical cash kept in office or on hand.',
    [AccountType.Bank]: 'Bank account (savings, current, etc.).',
    [AccountType.Debtor]: 'Someone who owes you money (receivable).',
    [AccountType.Creditor]: 'Someone you owe money to (payable / loan).',
    [AccountType.Expense]: 'Regular operational expenses (rent, utilities, etc.).',
    [AccountType.Salary]: 'Employee salary or contractor payment ledger.',
    [AccountType.Income]: 'Revenue source or income category ledger.',
    [AccountType.Equity]: 'Owner equity or capital account.',
    [AccountType.FixedAsset]: 'Long-term assets: computers, furniture, vehicles, property.',
    [AccountType.CurrentAsset]: 'Short-term assets: prepaid expenses, deposits, stock.',
    [AccountType.Loan]: 'Loan taken or given — tracks principal outstanding.',
    [AccountType.Tax]: 'Tax payable or receivable accounts (GST, TDS, etc.).',
    [AccountType.Capital]: 'Capital introduced by promoters or investors.',
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate('/finance/accounts')} className="flex items-center text-gray-500 hover:text-gray-800 transition-colors shrink-0">
          <svg className="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          <span className="text-sm font-medium">Back</span>
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{id ? 'Edit Account' : 'Add New Ledger Account'}</h1>
          <p className="text-sm text-gray-400 mt-0.5">{id ? 'Update ledger account details.' : 'Create a new ledger for your chart of accounts.'}</p>
        </div>
      </div>
      <Card>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="col-span-2">
                <Input 
                label="Account / Ledger Name" 
                value={form.name} 
                onChange={e => setForm({...form, name: e.target.value})} 
                placeholder={form.type === 'Salary' ? "e.g. John Doe Salary A/c" : "e.g. Axis Bank, Office Rent"}
                required
                />
            </div>
            
            <div>
              <Select
                label="Account Type"
                value={form.type}
                onChange={e => setForm({...form, type: e.target.value as AccountType})}
              >
                {Object.values(AccountType).map(t => <option key={t} value={t}>{t}</option>)}
              </Select>
              {form.type && (
                <p className="text-xs text-gray-400 italic -mt-3 mb-4 px-1">{accountTypeDescriptions[form.type as string]}</p>
              )}
            </div>
            
            <Input 
              label="Sub Ledger / Grouping" 
              value={form.subType} 
              onChange={e => setForm({...form, subType: e.target.value})} 
              placeholder="e.g. Utilities, Employee, HDFC"
            />

            <Input 
              label="Opening Balance (₹)" 
              type="number"
              value={form.openingBalance} 
              onChange={e => setForm({...form, openingBalance: parseFloat(e.target.value) || 0})} 
            />
          </div>

          {showRecurringFields && (
              <div className="mt-6 bg-blue-50 p-4 rounded-lg border border-blue-200 animate-fade-in">
                  <h3 className="text-sm font-bold text-blue-900 uppercase mb-3">Fixed Monthly Obligations</h3>
                  <p className="text-xs text-blue-800 mb-3">
                      Configure this if you have a fixed monthly payment for this account (e.g., Employee Salary, Office Rent).
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Fixed Monthly Amount (₹)</label>
                          <Input 
                              type="number"
                              value={form.recurringAmount || 0}
                              onChange={e => setForm({...form, recurringAmount: parseFloat(e.target.value) || 0})}
                          />
                      </div>
                      <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Start Month/Date</label>
                          <Input 
                              type="date"
                              value={form.recurringStartDate || ''}
                              onChange={e => setForm({...form, recurringStartDate: e.target.value})}
                          />
                      </div>
                      <div className="col-span-1 md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Due Day of Month</label>
                        <div className="flex items-center gap-3">
                          <input 
                            type="number"
                            min="1"
                            max="31"
                            className="w-24 bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-900 focus:border-spr-accent focus:ring-1 focus:ring-spr-accent outline-none transition-colors shadow-sm"
                            value={form.recurringDueDay || 1}
                            onChange={e => setForm({...form, recurringDueDay: parseInt(e.target.value) || 1})}
                          />
                          <p className="text-xs text-gray-500 italic">
                             The payment will show as "Pending" after this day passes each month. Use 31 for end of month.
                          </p>
                        </div>
                      </div>
                  </div>
              </div>
          )}
          
          <div className="mt-4">
             <Input 
              label="Description" 
              value={form.description || ''} 
              onChange={e => setForm({...form, description: e.target.value})} 
            />
          </div>

          <div className="mt-6 flex gap-4 justify-end">
            <Button type="button" variant="secondary" onClick={() => navigate('/finance/accounts')}>Cancel</Button>
            <Button type="submit">Save Account</Button>
          </div>
        </form>
      </Card>
    </div>
  );
};