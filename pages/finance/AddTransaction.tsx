import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Button, SearchableSelect, SearchableSelectOption } from '../../components/Components';
import { useNavigate, useParams } from 'react-router-dom';
import { Transaction, TransactionType, AccountType } from '../../types';
import * as utils from '../../utils';

// ─── Type Descriptions ────────────────────────────────────────────────────────
const TYPE_DESCRIPTIONS: Record<string, { color: string; hint: string; debitLabel: string; creditLabel: string }> = {
  [TransactionType.Income]: {
    color: 'from-emerald-500 to-emerald-600',
    hint: 'Money received — candidate fee, service revenue, or other income.',
    debitLabel: 'Received Into (Bank / Cash)',
    creditLabel: 'Income From (Client / Revenue Account)',
  },
  [TransactionType.Payment]: {
    color: 'from-red-500 to-red-600',
    hint: 'Money paid out — salary, vendor payment, operational expense.',
    debitLabel: 'Expense / Payable Account',
    creditLabel: 'Paid From (Bank / Cash)',
  },
  [TransactionType.Transfer]: {
    color: 'from-blue-500 to-blue-600',
    hint: 'Internal fund transfer between two accounts (bank to cash, etc.).',
    debitLabel: 'Transfer To Account',
    creditLabel: 'Transfer From Account',
  },
  [TransactionType.Refund]: {
    color: 'from-amber-500 to-amber-600',
    hint: 'Refund issued to a candidate or customer.',
    debitLabel: 'Refunded To (Candidate / Account)',
    creditLabel: 'Refunded From (Bank / Cash)',
  },
};

export const AddTransaction: React.FC = () => {
  const { addTransaction, updateTransaction, transactions, accounts, candidates, showToast } = useApp();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [type, setType]               = useState<TransactionType>(TransactionType.Income);
  const [date, setDate]               = useState(new Date().toISOString().split('T')[0]);
  const [amount, setAmount]           = useState('');
  const [description, setDescription] = useState('');
  const [fromId, setFromId]           = useState('');   // credit side
  const [toId, setToId]               = useState('');   // debit side

  useEffect(() => {
    if (id) {
      const t = transactions.find(x => x.id === id);
      if (t) {
        setType(t.type);
        setDate(t.date.split('T')[0]);
        setAmount(t.amount.toString());
        setDescription(t.description);
        setFromId(t.fromEntityId);
        setToId(t.toEntityId);
      }
    }
  }, [id, transactions]);

  // Build grouped entity options
  const buildOptions = (includeAll = false): SearchableSelectOption[] => [
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
      .filter(a => a.type === AccountType.Expense)
      .sort((a, b) => a.name.localeCompare(b.name))
      .map(a => ({ value: a.id, label: a.name, group: 'Expenses', meta: a.subType })),
    ...accounts
      .filter(a => a.type === AccountType.Income)
      .sort((a, b) => a.name.localeCompare(b.name))
      .map(a => ({ value: a.id, label: a.name, group: 'Income Accounts', meta: a.subType })),
    ...accounts
      .filter(a => ![AccountType.Bank, AccountType.Cash, AccountType.Creditor, AccountType.Salary, AccountType.Expense, AccountType.Income].includes(a.type))
      .sort((a, b) => a.name.localeCompare(b.name))
      .map(a => ({ value: a.id, label: a.name, group: a.type, meta: a.subType })),
  ];

  const entityOptions = buildOptions();
  const cfg = TYPE_DESCRIPTIONS[type];

  const amountNum = parseFloat(amount) || 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fromId || !toId)  { alert('Please select both Debit and Credit accounts.'); return; }
    if (!amount || amountNum <= 0) { alert('Please enter a valid amount.'); return; }

    const fromIsCandidate = candidates.some(c => c.id === fromId);
    const toIsCandidate   = candidates.some(c => c.id === toId);

    const tData: Transaction = {
      id: id || utils.generateId(),
      date: new Date(date).toISOString(),
      type,
      amount: amountNum,
      description: description.trim() || `${type} Entry`,
      fromEntityId:   fromId,
      fromEntityType: fromIsCandidate ? 'Candidate' : 'Account',
      toEntityId:     toId,
      toEntityType:   toIsCandidate   ? 'Candidate' : 'Account',
      isLocked: false,
    };

    if (id) updateTransaction(tData); else addTransaction(tData);
    showToast(id ? 'Journal entry updated' : 'Journal entry recorded');
    navigate('/finance/transactions');
  };

  return (
    <div className="max-w-3xl mx-auto">

      {/* Page Header */}
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate('/finance/transactions')} className="p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{id ? 'Edit Journal Entry' : 'New Journal Entry'}</h1>
          <p className="text-sm text-gray-500 mt-0.5">Double-entry bookkeeping · Every debit has an equal credit</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">

        {/* ── Transaction Type Selector ──────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <label className="text-xs font-bold uppercase text-gray-400 tracking-wider mb-3 block">Transaction Type</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {Object.values(TransactionType).map(t => {
              const c = TYPE_DESCRIPTIONS[t];
              const isSelected = type === t;
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => { setType(t); setFromId(''); setToId(''); }}
                  className={`py-3 px-4 rounded-xl border-2 text-sm font-bold transition-all ${isSelected
                    ? `bg-gradient-to-br ${c.color} text-white border-transparent shadow-md`
                    : 'bg-white border-gray-100 text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }`}
                >
                  {t}
                </button>
              );
            })}
          </div>
          <p className="text-xs text-gray-400 mt-3 italic">{cfg.hint}</p>
        </div>

        {/* ── Entry Header (Date, Amount, Description) ───────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h2 className="text-xs font-bold uppercase text-gray-400 tracking-wider mb-4">Entry Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Date <span className="text-red-500">*</span></label>
              <input
                type="date"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-colors"
                value={date}
                onChange={e => setDate(e.target.value)}
                required
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Amount (₹) <span className="text-red-500">*</span></label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">₹</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className="w-full pl-8 pr-4 py-2.5 border border-gray-200 rounded-xl text-gray-900 text-lg font-bold focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-colors"
                  placeholder="0.00"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Description / Memo</label>
            <input
              type="text"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-colors"
              placeholder="e.g. July Salary — Rahul Kumar, Batch-01 Registration Fee, Office Rent August…"
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
          </div>
        </div>

        {/* ── Journal Entry Lines ────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-50">
            <h2 className="text-xs font-bold uppercase text-gray-400 tracking-wider">Journal Entry Lines</h2>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-[11px] uppercase font-bold text-gray-400 tracking-wider">
                  <th className="py-3 px-4 text-left w-8">#</th>
                  <th className="py-3 px-4 text-left">Account</th>
                  <th className="py-3 px-4 text-right w-40">Debit (Dr)</th>
                  <th className="py-3 px-4 text-right w-40">Credit (Cr)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {/* Debit Line */}
                <tr className="hover:bg-blue-50/20 transition-colors">
                  <td className="py-4 px-4">
                    <span className="w-6 h-6 bg-blue-100 text-blue-700 text-[10px] font-bold rounded-full flex items-center justify-center">Dr</span>
                  </td>
                  <td className="py-4 px-4">
                    <SearchableSelect
                      label=""
                      value={toId}
                      onChange={setToId}
                      options={entityOptions}
                      placeholder={`— ${cfg.debitLabel} —`}
                      required
                      containerClassName=""
                    />
                    <p className="text-[10px] text-gray-400 mt-1 ml-1">{cfg.debitLabel}</p>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <div className="font-bold text-gray-900 tabular-nums text-base">
                      {amountNum > 0 ? utils.formatCurrency(amountNum) : <span className="text-gray-300">₹ 0.00</span>}
                    </div>
                  </td>
                  <td className="py-4 px-4 text-right text-gray-300 text-sm">—</td>
                </tr>

                {/* Credit Line */}
                <tr className="hover:bg-emerald-50/20 transition-colors">
                  <td className="py-4 px-4">
                    <span className="w-6 h-6 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded-full flex items-center justify-center">Cr</span>
                  </td>
                  <td className="py-4 px-4">
                    <SearchableSelect
                      label=""
                      value={fromId}
                      onChange={setFromId}
                      options={entityOptions}
                      placeholder={`— ${cfg.creditLabel} —`}
                      required
                      containerClassName=""
                    />
                    <p className="text-[10px] text-gray-400 mt-1 ml-1">{cfg.creditLabel}</p>
                  </td>
                  <td className="py-4 px-4 text-right text-gray-300 text-sm">—</td>
                  <td className="py-4 px-4 text-right">
                    <div className="font-bold text-gray-900 tabular-nums text-base">
                      {amountNum > 0 ? utils.formatCurrency(amountNum) : <span className="text-gray-300">₹ 0.00</span>}
                    </div>
                  </td>
                </tr>
              </tbody>

              {/* Footer: totals */}
              <tfoot className="bg-gray-50 border-t-2 border-gray-200 text-sm font-bold">
                <tr>
                  <td className="py-3 px-4" colSpan={2}>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600">Totals</span>
                      {amountNum > 0 && fromId && toId && (
                        <span className="text-[10px] bg-emerald-100 text-emerald-700 font-bold px-2 py-0.5 rounded-full">✓ Balanced</span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right text-gray-900 tabular-nums">
                    {amountNum > 0 ? utils.formatCurrency(amountNum) : '—'}
                  </td>
                  <td className="py-3 px-4 text-right text-gray-900 tabular-nums">
                    {amountNum > 0 ? utils.formatCurrency(amountNum) : '—'}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* ── Action Buttons ─────────────────────────────────────────────────── */}
        <div className="flex justify-between items-center gap-3 pt-1">
          <div className="text-xs text-gray-400">
            All entries follow double-entry accounting — debits always equal credits.
          </div>
          <div className="flex gap-3">
            <Button type="button" variant="secondary" onClick={() => navigate('/finance/transactions')}>Cancel</Button>
            <button
              type="submit"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2.5 rounded-xl transition-colors shadow-sm text-sm"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              {id ? 'Update Entry' : 'Save Journal Entry'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
