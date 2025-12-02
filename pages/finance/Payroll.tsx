
import React from 'react';
import { useApp } from '../../context/AppContext';
import { Card, Button } from '../../components/Components';
import { Link } from 'react-router-dom';
import * as utils from '../../utils';
import { TransactionType, AccountType } from '../../types';

export const Payroll: React.FC = () => {
  const { accounts, transactions } = useApp();

  // Filter Accounts that have a recurring amount set (Salaries, Rent, etc.)
  // We check for type 'Salary' OR any other type (like Expense) that has a recurringAmount > 0
  const fixedExpenseAccounts = accounts.filter(a => 
      (a.type === AccountType.Salary || (a.recurringAmount !== undefined && a.recurringAmount > 0)) && 
      a.recurringStartDate
  );

  // Helper to calculate months passed since start
  const getMonthsPassed = (startDateStr: string, endDateStr?: string) => {
    const start = new Date(startDateStr);
    const now = endDateStr ? new Date(endDateStr) : new Date();
    
    // Simple month difference logic
    let months = (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth());
    
    // If today is past the start date day, count current month as payable
    // Usually, rent/salary is due for the month.
    if (months < 0) months = 0;
    
    // We add 1 to include the starting month as a payable month
    return months + 1;
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
            <Button>+ Pay Expense</Button>
            </Link>
        </div>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-gray-600">
            <thead>
              <tr className="border-b border-spr-700 text-xs uppercase text-gray-500 bg-gray-50">
                <th className="py-3 px-4">Ledger / Employee</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Start Date</th>
                <th className="py-3 px-4 text-right">Fixed Monthly (₹)</th>
                <th className="py-3 px-4 text-center">Months</th>
                <th className="py-3 px-4 text-right">Total Payable</th>
                <th className="py-3 px-4 text-right">Total Paid</th>
                <th className="py-3 px-4 text-right">Pending</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-spr-700">
              {fixedExpenseAccounts.length > 0 ? fixedExpenseAccounts.map(acc => {
                const months = getMonthsPassed(acc.recurringStartDate!, acc.recurringEndDate);
                const totalPayable = months * (acc.recurringAmount || 0);
                
                // Calculate Total Paid via Transactions
                // Look for Expenses where toEntityId = account.id
                // Note: We are paying INTO this account (Debit in accounting terms, but for us it's an Expense Transaction TO this Ledger)
                const totalPaid = transactions
                  .filter(t => t.toEntityId === acc.id && t.toEntityType === 'Account' && t.type === TransactionType.Expense)
                  .reduce((sum, t) => sum + t.amount, 0);

                const pending = totalPayable - totalPaid;

                return (
                  <tr key={acc.id} className="hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium text-gray-900">
                        {acc.name}
                        {acc.subType && <div className="text-xs text-gray-400">{acc.subType}</div>}
                    </td>
                    <td className="py-3 px-4">
                        <span className={`text-xs px-2 py-1 rounded border ${acc.type === 'Salary' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-gray-100 border-gray-200'}`}>
                            {acc.type}
                        </span>
                    </td>
                    <td className="py-3 px-4 text-sm">{new Date(acc.recurringStartDate!).toLocaleDateString()}</td>
                    <td className="py-3 px-4 text-right text-gray-900">{utils.formatCurrency(acc.recurringAmount || 0)}</td>
                    <td className="py-3 px-4 text-center">{months}</td>
                    <td className="py-3 px-4 text-right font-medium">{utils.formatCurrency(totalPayable)}</td>
                    <td className="py-3 px-4 text-right text-emerald-600 font-medium">{utils.formatCurrency(totalPaid)}</td>
                    <td className={`py-3 px-4 text-right font-bold ${pending > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                      {utils.formatCurrency(pending)}
                    </td>
                    <td className="py-3 px-4 text-center">
                        <Link to={`/finance/accounts/edit/${acc.id}`} className="text-blue-600 hover:underline text-xs">Edit</Link>
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                   <td colSpan={9} className="py-8 text-center text-gray-500">
                     No fixed recurring expenses found. <br/>
                     Create a Ledger Account (Type: Salary or Expense) and set a "Fixed Monthly Amount" to see it here.
                   </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
