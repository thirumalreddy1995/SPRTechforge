
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
    recurringStartDate: ''
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

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">{id ? 'Edit Account' : 'Add New Account'}</h1>
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
            
            <Select 
              label="Account Type"
              value={form.type}
              onChange={e => setForm({...form, type: e.target.value as AccountType})}
            >
              {Object.values(AccountType).map(t => <option key={t} value={t}>{t}</option>)}
            </Select>
            
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
                          <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                          <Input 
                              type="date"
                              value={form.recurringStartDate || ''}
                              onChange={e => setForm({...form, recurringStartDate: e.target.value})}
                          />
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