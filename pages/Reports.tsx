
import React, { useRef, useState } from 'react';
import { useApp } from '../context/AppContext';
import { Card, Button } from '../components/Components';
import { TransactionType } from '../types';
import * as utils from '../utils';

export const Reports: React.FC = () => {
  const { exportData, importDatabase, isCloudEnabled, transactions } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<'Data' | 'Info'>('Data');

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
      // Reset input
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsText(file);
  };

  // --- Chart Logic ---
  // Get last 6 months
  const last6Months = Array.from({ length: 6 }, (_, i) => {
      const d = new Date();
      d.setMonth(d.getMonth() - (5 - i));
      return d;
  });

  const chartData = last6Months.map(date => {
      const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
      const monthLabel = date.toLocaleString('default', { month: 'short', year: '2-digit' });
      
      const income = transactions
        .filter(t => t.type === TransactionType.Income && new Date(t.date).getMonth() === date.getMonth() && new Date(t.date).getFullYear() === date.getFullYear())
        .reduce((sum, t) => sum + t.amount, 0);
        
      const expense = transactions
        .filter(t => t.type === TransactionType.Expense && new Date(t.date).getMonth() === date.getMonth() && new Date(t.date).getFullYear() === date.getFullYear())
        .reduce((sum, t) => sum + t.amount, 0);

      return { label: monthLabel, income, expense };
  });

  const maxVal = Math.max(...chartData.map(d => Math.max(d.income, d.expense)), 1000); // Minimum 1000 scale

  return (
    <div className="space-y-6">
       <div className="flex justify-between items-end">
          <h1 className="text-3xl font-bold text-gray-900">Data & Analytics</h1>
          <div className="flex space-x-2">
             <button 
                onClick={() => setActiveTab('Data')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'Data' ? 'bg-spr-accent text-white' : 'bg-white text-gray-600 hover:bg-gray-100'}`}
             >
               Backup & Restore
             </button>
             <button 
                onClick={() => setActiveTab('Info')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'Info' ? 'bg-spr-accent text-white' : 'bg-white text-gray-600 hover:bg-gray-100'}`}
             >
               Database Info
             </button>
          </div>
       </div>
       
       {activeTab === 'Data' && (
        <div className="space-y-6 animate-fade-in">
          <Card title="Financial Trends (Last 6 Months)">
               <div className="h-64 flex items-end justify-between gap-2 px-2 pb-2 pt-6">
                  {chartData.map((d, i) => (
                     <div key={i} className="flex-1 flex flex-col justify-end items-center gap-2 group">
                        <div className="w-full flex justify-center gap-1 h-full items-end relative">
                           {/* Tooltip */}
                           <div className="absolute bottom-full mb-2 hidden group-hover:block bg-gray-800 text-white text-xs p-2 rounded shadow-lg z-10 whitespace-nowrap">
                              Income: {utils.formatCurrency(d.income)}<br/>
                              Expense: {utils.formatCurrency(d.expense)}
                           </div>

                           {/* Income Bar */}
                           <div 
                             className="w-1/3 bg-emerald-500 hover:bg-emerald-600 rounded-t transition-all duration-500" 
                             style={{ height: `${(d.income / maxVal) * 100}%` }}
                           ></div>
                           
                           {/* Expense Bar */}
                           <div 
                             className="w-1/3 bg-red-500 hover:bg-red-600 rounded-t transition-all duration-500" 
                             style={{ height: `${(d.expense / maxVal) * 100}%` }}
                           ></div>
                        </div>
                        <span className="text-xs text-gray-500 font-medium">{d.label}</span>
                     </div>
                  ))}
               </div>
               <div className="flex justify-center gap-6 mt-4">
                  <div className="flex items-center gap-2">
                     <span className="w-3 h-3 bg-emerald-500 rounded"></span>
                     <span className="text-xs text-gray-600">Income</span>
                  </div>
                  <div className="flex items-center gap-2">
                     <span className="w-3 h-3 bg-red-500 rounded"></span>
                     <span className="text-xs text-gray-600">Expenses</span>
                  </div>
               </div>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card title="Backup (Export)" className="h-full">
              <div className="space-y-4">
                <p className="text-gray-600">
                  Download a complete copy of the system database. This JSON file contains all Candidates, Accounts, Transactions, Users, and Logs.
                </p>
                <div className="pt-4">
                  <Button onClick={exportData}>
                      Download Full Database
                  </Button>
                </div>
              </div>
            </Card>

            <Card title="Restore (Import)" className="h-full">
                <div className="space-y-4">
                  <p className="text-gray-600">
                    Upload a previously exported JSON file to restore the system state.
                  </p>
                  <div className="bg-amber-50 border border-amber-200 p-3 rounded text-sm text-amber-800">
                    <strong>Warning:</strong> This action updates your current database with the data from the file.
                  </div>
                  <div className="pt-4">
                    <input 
                      type="file" 
                      accept=".json" 
                      ref={fileInputRef}
                      style={{ display: 'none' }}
                      onChange={handleFileUpload}
                    />
                    <Button variant="secondary" onClick={() => fileInputRef.current?.click()}>
                      Upload & Restore Backup
                    </Button>
                  </div>
                </div>
            </Card>
          </div>
        </div>
       )}

       {activeTab === 'Info' && (
         <div className="animate-fade-in">
            <Card title="Database Structure">
               <div className="text-gray-600 space-y-4">
                 <p>
                   The application currently uses a NoSQL structure (JSON-based).
                 </p>
                 {isCloudEnabled ? (
                   <div className="bg-orange-50 border border-orange-200 p-4 rounded text-orange-900">
                     <strong>Cloud Provider:</strong> Google Firebase (Firestore)<br/>
                     <strong>Status:</strong> Connected<br/>
                     <p className="mt-2 text-sm">Data is synced in real-time. Collections are created automatically (Schemaless).</p>
                   </div>
                 ) : (
                   <div className="bg-gray-100 border border-gray-300 p-4 rounded">
                     <strong>Storage:</strong> Local Browser Storage<br/>
                     <strong>Status:</strong> Offline Mode
                   </div>
                 )}
               </div>
            </Card>
         </div>
       )}
    </div>
  );
};
