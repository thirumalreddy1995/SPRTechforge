import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Card, Button, Input, Select, SearchableSelect, SearchableSelectOption } from '../../components/Components';
import { useNavigate, useParams } from 'react-router-dom';
import { Transaction, TransactionType, AccountType } from '../../types';
import * as utils from '../../utils';

export const AddTransaction: React.FC = () => {
  const { addTransaction, updateTransaction, transactions, accounts, candidates, showToast } = useApp();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  
  const [type, setType] = useState<TransactionType>(TransactionType.Income);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [fromId, setFromId] = useState('');
  const [toId, setToId] = useState('');

  useEffect(() => {
     if(id) {
        const t = transactions.find(x => x.id === id);
        if(t) { 
          setType(t.type); 
          setDate(t.date.split('T')[0]); 
          setAmount(t.amount.toString()); 
          setDescription(t.description); 
          setFromId(t.fromEntityId); 
          setToId(t.toEntityId); 
        }
     }
  }, [id, transactions]);

  // Build searchable entity options grouped by category
  const entityOptions: SearchableSelectOption[] = [
    ...accounts
      .filter(a => a.type === AccountType.Bank || a.type === AccountType.Cash)
      .sort((a, b) => a.name.localeCompare(b.name))
      .map(a => ({ value: a.id, label: a.name, group: 'Bank & Cash', meta: a.subType })),
    ...candidates
      .sort((a, b) => a.name.localeCompare(b.name))
      .map(c => ({ value: c.id, label: c.name, group: 'Candidates', meta: c.batchId })),
    ...accounts
      .filter(a => a.type === AccountType.Creditor || a.type === AccountType.Salary)
      .sort((a, b) => a.name.localeCompare(b.name))
      .map(a => ({ value: a.id, label: a.name, group: 'Creditors / Staff', meta: a.subType })),
    ...accounts
      .filter(a => ![AccountType.Bank, AccountType.Cash, AccountType.Creditor, AccountType.Salary].includes(a.type))
      .sort((a, b) => a.name.localeCompare(b.name))
      .map(a => ({ value: a.id, label: a.name, group: a.type, meta: a.subType })),
  ];

  const handleSubmit = (e: React.FormEvent) => {
     e.preventDefault();
     if (!fromId || !toId || !amount) {
       alert("Please fill all mandatory fields.");
       return;
     }

     // Determine entity types from the arrays
     const fromIsCandidate = candidates.some(c => c.id === fromId);
     const toIsCandidate = candidates.some(c => c.id === toId);

     const tData: Transaction = {
        id: id || utils.generateId(),
        date: new Date(date).toISOString(),
        type,
        amount: parseFloat(amount),
        description: description || `${type} Entry`,
        fromEntityId: fromId,
        fromEntityType: fromIsCandidate ? 'Candidate' : 'Account',
        toEntityId: toId,
        toEntityType: toIsCandidate ? 'Candidate' : 'Account',
        isLocked: false
     };

     if(id) updateTransaction(tData); else addTransaction(tData);
     showToast(id ? 'Transaction updated' : 'Transaction recorded');
     navigate('/finance/transactions');
  };

  return (
    <div className="max-w-2xl mx-auto">
       <div className="flex items-center gap-4 mb-6">
          <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-gray-600 transition-colors">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          </button>
          <h1 className="text-3xl font-bold text-gray-900">{id ? 'Edit' : 'Record'} Transaction</h1>
       </div>

       <Card>
          <form onSubmit={handleSubmit} className="space-y-6">
             <div className="flex bg-gray-100 p-1.5 rounded-xl border border-gray-200">
                {Object.values(TransactionType).map(t => (
                   <button 
                    key={t} 
                    type="button" 
                    onClick={() => setType(t)} 
                    className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${type === t ? 'bg-white text-spr-900 shadow-sm border border-gray-100' : 'text-gray-500 hover:text-gray-700'}`}
                   >
                    {t}
                   </button>
                ))}
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                   <label className="block text-sm font-bold text-gray-700 mb-1">Transaction Date</label>
                   <input type="date" className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-900 focus:ring-1 focus:ring-spr-accent outline-none" value={date} onChange={e => setDate(e.target.value)} required />
                </div>
                <div>
                   <label className="block text-sm font-bold text-gray-700 mb-1">Amount (₹)</label>
                   <input type="number" className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-900 font-bold focus:ring-1 focus:ring-spr-accent outline-none" placeholder="0.00" value={amount} onChange={e => setAmount(e.target.value)} required />
                </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <SearchableSelect
                  label="From (Source of Funds)"
                  value={fromId}
                  onChange={setFromId}
                  options={entityOptions}
                  placeholder="-- Select Payer --"
                  required
                  hint="Who is paying or where money is coming from"
                  containerClassName=""
                />
                <SearchableSelect
                  label="To (Destination Ledger)"
                  value={toId}
                  onChange={setToId}
                  options={entityOptions}
                  placeholder="-- Select Receiver --"
                  required
                  hint="Where the money is being deposited or sent"
                  containerClassName=""
                />
             </div>

             <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Description / Memo</label>
                <textarea 
                  className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-900 focus:ring-1 focus:ring-spr-accent outline-none"
                  rows={2}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="e.g. Monthly Rent, Registration Fee, Staff Salary..."
                ></textarea>
             </div>

             <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <Button type="button" variant="secondary" onClick={() => navigate('/finance/transactions')}>Cancel</Button>
                <Button type="submit" className="px-10">{id ? 'Update Entry' : 'Save Transaction'}</Button>
             </div>
          </form>
       </Card>
    </div>
  );
};