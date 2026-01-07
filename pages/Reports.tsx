import React from 'react';
import { useApp } from '../context/AppContext';
import { Card, Button } from '../components/Components';
import { TransactionType, AccountType, CandidateStatus } from '../types';
import * as utils from '../utils';

export const Reports: React.FC = () => {
  const { exportData, exportFullExcel, importDatabase, factoryReset, isCloudEnabled, transactions, accounts, candidates, getEntityBalance } = useApp();
  const [activeTab, setActiveTab] = React.useState<'Data' | 'Info'>('Data');
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        
        let warning = "You are about to restore the database from a backup file. This will OVERWRITE current local data.";
        if (isCloudEnabled) {
          warning += " Since Cloud is enabled, this will also upload the backup data to Firebase, potentially overwriting or adding to existing records.";
        }
        
        if (window.confirm(warning + "\n\nAre you sure you want to proceed?")) {
          await importDatabase(json);
        }
      } catch (err) {
        alert("Invalid JSON File. Please upload a valid backup file.");
      }
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsText(file);
  };

  // --- Financial Aggregates ---
  
  // 1. Total Realized
  const totalIncomeRealized = transactions.filter(t => t.type === TransactionType.Income).reduce((sum, t) => sum + t.amount, 0);
  const totalPaymentsRealized = transactions.filter(t => t.type === TransactionType.Payment).reduce((sum, t) => sum + t.amount, 0);

  // 2. Pending Payables (Creditors & Salaries)
  const totalPendingPayables = accounts
    .filter(a => a.type === AccountType.Creditor || a.type === AccountType.Salary)
    .reduce((sum, a) => {
      const bal = getEntityBalance(a.id, 'Account');
      // Balance is negative if we owe them money
      return sum + (bal < 0 ? Math.abs(bal) : 0);
    }, 0);

  // 3. Pending Receivables (Candidates & Debtors)
  const totalPendingReceivables = accounts
    .filter(a => a.type === AccountType.Debtor)
    .reduce((sum, a) => {
      const bal = getEntityBalance(a.id, 'Account');
      return sum + (bal > 0 ? bal : 0);
    }, 0) + candidates.reduce((sum, c) => {
        if (!c.isActive && c.status === CandidateStatus.Discontinued) return sum;
        const paid = transactions
          .filter(t => t.fromEntityId === c.id && t.type === TransactionType.Income)
          .reduce((s, t) => s + t.amount, 0) -
          transactions
          .filter(t => t.toEntityId === c.id && t.type === TransactionType.Refund)
          .reduce((s, t) => s + t.amount, 0);
        const due = c.agreedAmount - paid;
        return sum + (due > 0 ? due : 0);
    }, 0);

  // --- Chart Logic ---
  const last6Months = Array.from({ length: 6 }, (_, i) => {
      const d = new Date();
      d.setMonth(d.getMonth() - (5 - i));
      return d;
  });

  const chartData = last6Months.map(date => {
      const monthLabel = date.toLocaleString('default', { month: 'short', year: '2-digit' });
      const income = transactions
        .filter(t => t.type === TransactionType.Income && new Date(t.date).getMonth() === date.getMonth() && new Date(t.date).getFullYear() === date.getFullYear())
        .reduce((sum, t) => sum + t.amount, 0);
      const payment = transactions
        .filter(t => t.type === TransactionType.Payment && new Date(t.date).getMonth() === date.getMonth() && new Date(t.date).getFullYear() === date.getFullYear())
        .reduce((sum, t) => sum + t.amount, 0);
      return { label: monthLabel, income, payment };
  });

  const maxVal = Math.max(...chartData.map(d => Math.max(d.income, d.payment)), 5000);

  return (
    <div className="space-y-6">
       <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">System Management & Reports</h1>
            <p className="text-gray-500">Comprehensive financial analysis and system health.</p>
          </div>
          <div className="flex bg-gray-100 p-1 rounded-lg">
             <button onClick={() => setActiveTab('Data')} className={`px-4 py-2 rounded-md font-medium transition-all ${activeTab === 'Data' ? 'bg-white text-spr-accent shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Data & Metrics</button>
             <button onClick={() => setActiveTab('Info')} className={`px-4 py-2 rounded-md font-medium transition-all ${activeTab === 'Info' ? 'bg-white text-spr-accent shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>System Status</button>
          </div>
       </div>
       
       {activeTab === 'Data' && (
        <div className="space-y-6 animate-fade-in">
          
          <Card title="Advanced Data Export" className="border-l-4 border-l-indigo-600">
             <div className="flex flex-col md:flex-row gap-6 items-center">
                <div className="flex-1">
                   <h3 className="text-lg font-bold text-gray-800">Comprehensive Excel Report</h3>
                   <p className="text-sm text-gray-500 mt-1">Download a single Excel file containing multiple sheets: Candidates, Transactions, Debtors, Creditors, Balance Sheet, and P&L.</p>
                </div>
                <Button onClick={exportFullExcel} className="shrink-0 bg-indigo-700 hover:bg-indigo-800 py-3 px-8">
                   <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                   Download Full Excel Report
                </Button>
             </div>
          </Card>

          {/* Realized vs Pending Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card title="Pending Obligations Summary" action={<span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded border border-amber-100 uppercase">Snapshot</span>}>
                  <div className="space-y-4">
                      <div className="flex justify-between items-center p-3 bg-red-50/50 rounded-xl border border-red-100">
                          <div>
                              <p className="text-xs text-red-700 font-bold uppercase tracking-wider">Pending Payments (Payables)</p>
                              <p className="text-xs text-red-500">Money you owe to Creditors/Staff</p>
                          </div>
                          <p className="text-xl font-black text-red-600 tabular-nums">{utils.formatCurrency(totalPendingPayables)}</p>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-emerald-50/50 rounded-xl border border-emerald-100">
                          <div>
                              <p className="text-xs text-emerald-700 font-bold uppercase tracking-wider">Pending Receivables</p>
                              <p className="text-xs text-emerald-500">Money owed to you by Students/Debtors</p>
                          </div>
                          <p className="text-xl font-black text-emerald-600 tabular-nums">{utils.formatCurrency(totalPendingReceivables)}</p>
                      </div>
                      <div className="pt-2 border-t border-gray-100">
                          <div className="flex justify-between items-center">
                              <span className="text-sm font-bold text-gray-700">Projected Net Liquidity Increase</span>
                              <span className={`text-lg font-black tabular-nums ${totalPendingReceivables - totalPendingPayables >= 0 ? 'text-spr-600' : 'text-red-600'}`}>
                                  {utils.formatCurrency(totalPendingReceivables - totalPendingPayables)}
                              </span>
                          </div>
                          <p className="text-[10px] text-gray-400 mt-1 italic">Total Receivables minus Total Payables</p>
                      </div>
                  </div>
              </Card>

              <Card title="Cash Flow Integrity" action={<span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded border border-indigo-100 uppercase">Realized</span>}>
                  <div className="space-y-4">
                      <div className="flex justify-between items-center border-b border-gray-50 pb-2">
                          <span className="text-sm text-gray-500">Total Income (Cash In)</span>
                          <span className="font-bold text-emerald-600 tabular-nums">{utils.formatCurrency(totalIncomeRealized)}</span>
                      </div>
                      <div className="flex justify-between items-center border-b border-gray-50 pb-2">
                          <span className="text-sm text-gray-500">Total Payments (Cash Out)</span>
                          <span className="font-bold text-red-600 tabular-nums">{utils.formatCurrency(totalPaymentsRealized)}</span>
                      </div>
                      <div className="flex justify-between items-center pt-2">
                          <span className="text-base font-bold text-gray-900">Net Realized Profit</span>
                          <span className="text-xl font-black text-gray-900 tabular-nums">{utils.formatCurrency(totalIncomeRealized - totalPaymentsRealized)}</span>
                      </div>
                  </div>
              </Card>
          </div>

          <Card title="Financial Performance Overview (Realized Cash Flow)">
               <div className="h-64 flex items-end justify-between gap-4 px-2 pb-2 pt-6">
                  {chartData.map((d, i) => (
                     <div key={i} className="flex-1 flex flex-col justify-end items-center gap-2 group">
                        <div className="w-full flex justify-center gap-1 h-full items-end relative">
                           <div className="absolute bottom-full mb-2 hidden group-hover:block bg-gray-900 text-white text-[10px] p-2 rounded shadow-xl z-10 whitespace-nowrap">
                              <span className="text-emerald-400">In: {utils.formatCurrency(d.income)}</span><br/>
                              <span className="text-red-400">Out: {utils.formatCurrency(d.payment)}</span>
                           </div>
                           <div className="w-4 bg-emerald-500/80 hover:bg-emerald-500 rounded-t-sm transition-all duration-300" style={{ height: `${(d.income / maxVal) * 100}%` }}></div>
                           <div className="w-4 bg-red-500/80 hover:bg-red-500 rounded-t-sm transition-all duration-300" style={{ height: `${(d.payment / maxVal) * 100}%` }}></div>
                        </div>
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">{d.label}</span>
                     </div>
                  ))}
               </div>
               <div className="flex justify-center gap-6 mt-6 border-t border-gray-100 pt-4">
                  <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 bg-emerald-500 rounded-full"></span><span className="text-xs text-gray-600 font-medium">Income</span></div>
                  <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 bg-red-500 rounded-full"></span><span className="text-xs text-gray-600 font-medium">Payments</span></div>
               </div>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="flex flex-col justify-between hover:border-blue-200 transition-colors">
              <div>
                <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                </div>
                <h3 className="font-bold text-gray-900 mb-2">System Backup (JSON)</h3>
                <p className="text-sm text-gray-500 mb-6">Generate a full technical snapshot of all modules, transactions, and settings for migration or recovery.</p>
              </div>
              <Button onClick={exportData} className="w-full">Export Database</Button>
            </Card>

            <Card className="flex flex-col justify-between hover:border-emerald-200 transition-colors">
                <div>
                  <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center mb-4">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">Restore System</h3>
                  <p className="text-sm text-gray-500 mb-6">Upload a backup file to restore the application to a previous state.</p>
                </div>
                <div>
                  <input type="file" accept=".json" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileUpload} />
                  <Button variant="secondary" onClick={() => fileInputRef.current?.click()} className="w-full">Import JSON File</Button>
                </div>
            </Card>

            <Card className="flex flex-col justify-between border-red-100 bg-red-50/20 hover:bg-red-50/40 transition-colors">
              <div>
                <div className="w-10 h-10 bg-red-50 text-red-600 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </div>
                <h3 className="font-bold text-gray-900 mb-2">Factory Reset</h3>
                <p className="text-sm text-gray-500 mb-6">Wipe all local data and start fresh. Make sure you have a backup first.</p>
              </div>
              <Button variant="danger" onClick={factoryReset} className="w-full">Reset to Fresh</Button>
            </Card>
          </div>
        </div>
       )}

       {activeTab === 'Info' && (
         <div className="animate-fade-in">
            <Card title="System Environment">
               <div className="space-y-6">
                 <div className="flex items-start gap-4">
                    <div className={`p-4 rounded-xl ${isCloudEnabled ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-600'}`}>
                       <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                    </div>
                    <div>
                       <h4 className="font-bold text-gray-900">Database Engine</h4>
                       <p className="text-sm text-gray-600">Mode: {isCloudEnabled ? 'Google Firebase Cloud' : 'Browser IndexedDB / LocalStorage'}</p>
                       <p className="text-xs text-gray-400 mt-1">{isCloudEnabled ? 'Your data is secured in real-time across devices.' : 'Your data is stored privately on this device.'}</p>
                    </div>
                 </div>

                 <div className="border-t border-gray-100 pt-6">
                    <h4 className="font-bold text-gray-900 mb-4">Storage Statistics</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                       <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                          <span className="text-[10px] text-gray-400 font-bold uppercase block">Total Entries</span>
                          <span className="text-xl font-bold text-gray-800">{transactions.length} Transactions</span>
                       </div>
                       <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                          <span className="text-[10px] text-gray-400 font-bold uppercase block">Total Accounts</span>
                          <span className="text-xl font-bold text-gray-800">{accounts.length} Ledgers</span>
                       </div>
                       <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                          <span className="text-[10px] text-gray-400 font-bold uppercase block">Total Students</span>
                          <span className="text-xl font-bold text-gray-800">{candidates.length} Candidates</span>
                       </div>
                       <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                          <span className="text-[10px] text-gray-400 font-bold uppercase block">Last Sync</span>
                          <span className="text-sm font-medium text-gray-600">{new Date().toLocaleTimeString()}</span>
                       </div>
                    </div>
                 </div>
               </div>
            </Card>
         </div>
       )}
    </div>
  );
};