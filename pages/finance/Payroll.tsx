import React from 'react';
import { useApp } from '../../context/AppContext';
import { Card, Button } from '../../components/Components';
import { Link } from 'react-router-dom';
import * as utils from '../../utils';
import { TransactionType, AccountType } from '../../types';

export const Payroll: React.FC = () => {
  const { accounts, transactions } = useApp();

  // Filter Accounts that have a recurring amount set (Salaries, Rent, etc.)
  const fixedExpenseAccounts = accounts.filter(a => 
      (a.type === AccountType.Salary || (a.recurringAmount !== undefined && a.recurringAmount > 0)) && 
      a.recurringStartDate
  );

  /**
   * Enhanced Logic to calculate months due based on specific due date.
   * A month becomes "due" if the current date is >= the due date for that specific month cycle.
   */
  const calculateMonthsDue = (startDateStr: string, dueDay: number = 1, endDateStr?: string) => {
    const start = new Date(startDateStr);
    const now = endDateStr ? new Date(endDateStr) : new Date();
    
    let monthsCount = 0;
    // Start iterating from the start month up to the current month
    let cursor = new Date(start.getFullYear(), start.getMonth(), 1); 
    
    // Safety check to prevent infinite loops
    let iterations = 0;
    const MAX_ITERATIONS = 600; // 50 years max tracking

    while (cursor <= now && iterations < MAX_ITERATIONS) {
      iterations++;
      
      let year = cursor.getFullYear();
      let month = cursor.getMonth();
      let actualDueDay = dueDay;
      
      // Determine the actual last day of this month (handles Feb 28/29, etc.)
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      if (actualDueDay > daysInMonth) {
        actualDueDay = daysInMonth;
      }
      
      const dueDateThisMonth = new Date(year, month, actualDueDay);
      
      // If today has reached or passed the due date for this month, count it as due
      if (now >= dueDateThisMonth) {
        monthsCount++;
      }
      
      // Move to next month
      cursor.setMonth(cursor.getMonth() + 1);
    }
    
    return monthsCount;
  };

  const getOrdinal = (n: number) => {
      const s = ["th", "st", "nd", "rd"];
      const v = n % 100;
      return n + (s[(v - 20) % 10] || s[v] || s[0]);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h1 className="text-3xl font-bold text-gray-900">Payroll & Fixed Expenses</h1>
           <p className="text-gray-500">Track monthly salaries, office rent, and other recurring fixed obligations.</p>
        </div>
        <div className="flex gap-2">
            <Link to="/finance/accounts/new">
            <Button variant="secondary">+ New Ledger</Button>
            </Link>
            <Link to="/finance/transactions/new">
            <Button>+ Make Payment</Button>
            </Link>
        </div>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-gray-600">
            <thead>
              <tr className="border-b border-spr-700 text-xs uppercase text-gray-500 bg-gray-50">
                <th className="py-3 px-4">Ledger / Employee</th>
                <th className="py-3 px-4">Cycle</th>
                <th className="py-3 px-4 text-center">Months Due</th>
                <th className="py-3 px-4 text-right">Fixed Monthly (₹)</th>
                <th className="py-3 px-4 text-right">Total Payable</th>
                <th className="py-3 px-4 text-right">Total Paid</th>
                <th className="py-3 px-4 text-right">Balance Pending</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-spr-700">
              {fixedExpenseAccounts.length > 0 ? fixedExpenseAccounts.map(acc => {
                const months = calculateMonthsDue(acc.recurringStartDate!, acc.recurringDueDay, acc.recurringEndDate);
                const totalPayable = months * (acc.recurringAmount || 0);
                
                // Calculate Total Paid via Transactions
                const totalPaid = transactions
                  .filter(t => t.toEntityId === acc.id && t.toEntityType === 'Account' && t.type === TransactionType.Payment)
                  .reduce((sum, t) => sum + t.amount, 0);

                const pending = totalPayable - totalPaid;

                return (
                  <tr key={acc.id} className="hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium text-gray-900">
                        {acc.name}
                        {acc.subType && <div className="text-[10px] text-gray-400 font-bold uppercase">{acc.subType}</div>}
                    </td>
                    <td className="py-3 px-4 text-sm">
                        <div className="flex flex-col">
                            <span className="font-medium text-indigo-600">{acc.recurringDueDay === 31 ? 'End of month' : `${getOrdinal(acc.recurringDueDay || 1)} of month`}</span>
                            <span className="text-[10px] text-gray-400">Since {new Date(acc.recurringStartDate!).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}</span>
                        </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                       <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold ${months > 0 ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' : 'bg-gray-100 text-gray-400'}`}>
                          {months} Mo.
                       </span>
                    </td>
                    <td className="py-3 px-4 text-right text-gray-900 whitespace-nowrap tabular-nums">{utils.formatCurrency(acc.recurringAmount || 0)}</td>
                    <td className="py-3 px-4 text-right font-medium whitespace-nowrap tabular-nums text-gray-400">{utils.formatCurrency(totalPayable)}</td>
                    <td className="py-3 px-4 text-right text-emerald-600 font-medium whitespace-nowrap tabular-nums">{utils.formatCurrency(totalPaid)}</td>
                    <td className={`py-3 px-4 text-right font-bold whitespace-nowrap tabular-nums ${pending > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                      {pending > 0 ? (
                          <div className="flex flex-col items-end">
                             <span>{utils.formatCurrency(pending)}</span>
                             <span className="text-[9px] uppercase tracking-tighter text-red-400">Arrears</span>
                          </div>
                      ) : 'CLEARED ✓'}
                    </td>
                    <td className="py-3 px-4 text-center">
                        <div className="flex justify-center gap-2">
                           <Link to={`/finance/statement/Account/${acc.id}`} className="text-gray-400 hover:text-indigo-600 transition-colors" title="Statement">
                              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                           </Link>
                           <Link to={`/finance/accounts/edit/${acc.id}`} className="text-gray-400 hover:text-blue-600 transition-colors" title="Edit Schedule">
                              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
                           </Link>
                        </div>
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                   <td colSpan={8} className="py-12 text-center text-gray-500">
                     <div className="flex flex-col items-center opacity-40">
                        <svg className="w-12 h-12 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
                        <p className="font-medium">No fixed recurring payments found.</p>
                     </div>
                     <p className="text-xs mt-2 text-gray-400">
                       Create a Ledger Account (Type: Salary or Expense) and set a "Fixed Monthly Amount" to see it here.
                     </p>
                   </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
      
      <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 flex items-start gap-3">
         <svg className="w-5 h-5 text-amber-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
         <div className="text-xs text-amber-800 leading-relaxed">
            <strong>How calculations work:</strong> The system checks the "Due Day" for every month since your configured start date. If today's date has reached or passed that day in the current month, it is added to your total obligations. "Balance Pending" is the difference between total obligations and payments recorded in your ledger.
         </div>
      </div>
    </div>
  );
};