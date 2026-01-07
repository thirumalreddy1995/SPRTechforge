import React from 'react';
import { useApp } from '../context/AppContext';
import { Card, Button } from '../components/Components';
import { AccountType, TransactionType, CandidateStatus, InterviewSchedule } from '../types';
import { Link, useNavigate } from 'react-router-dom';
import * as utils from '../utils';

export const Dashboard: React.FC = () => {
  const { user, candidates, accounts, transactions, getEntityBalance, trainingTopics, trainingLogs, interviews } = useApp();
  const navigate = useNavigate();

  if (!user) return null;

  const isSuperAdmin = user.username === 'thirumalreddy@sprtechforge.com';

  // --- CANDIDATE DASHBOARD VIEW ---
  if (user.role === 'candidate') {
    const candidate = candidates.find(c => c.id === user.linkedCandidateId);
    const myLogs = trainingLogs.filter(l => l.candidateId === candidate?.id);
    const myInterviews = interviews.filter(i => i.candidateId === candidate?.id && i.status === 'Scheduled');
    
    const paid = transactions
      .filter(t => t.fromEntityId === candidate?.id && t.type === TransactionType.Income)
      .reduce((sum, t) => sum + t.amount, 0) -
      transactions
      .filter(t => t.toEntityId === candidate?.id && t.type === TransactionType.Refund)
      .reduce((sum, t) => sum + t.amount, 0);
    
    const due = (candidate?.agreedAmount || 0) - paid;
    const progressPercent = trainingTopics.length > 0 ? Math.round((new Set(myLogs.map(l => l.topicId)).size / trainingTopics.length) * 100) : 0;

    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Student Dashboard</h1>
            <p className="text-gray-600 mt-1">Hello {user.name}, tracked your progress and schedule below.</p>
          </div>
          <div className="bg-white border border-gray-200 px-4 py-2 rounded-xl shadow-sm">
             <span className="text-[10px] text-gray-400 font-bold uppercase block tracking-widest">Enrollment Status</span>
             <span className="text-spr-600 font-bold">{candidate?.status || 'Active'}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card title="Training Progress" className="border-l-4 border-l-blue-500">
             <div className="text-center py-4">
                <div className="relative inline-flex items-center justify-center mb-4">
                   <svg className="w-24 h-24 transform -rotate-90">
                      <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-gray-100" />
                      <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray={251.2} strokeDashoffset={251.2 - (251.2 * progressPercent) / 100} className="text-blue-500 transition-all duration-1000" />
                   </svg>
                   <span className="absolute text-xl font-black text-gray-800">{progressPercent}%</span>
                </div>
                <p className="text-sm text-gray-500">Curriculum Coverage</p>
                <div className="mt-6">
                   <Button variant="secondary" className="w-full text-xs" onClick={() => navigate('/training/dashboard')}>View Syllabus</Button>
                </div>
             </div>
          </Card>

          <Card title="Fee Standing" className="border-l-4 border-l-emerald-500">
             <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-gray-50 pb-2">
                   <span className="text-xs text-gray-400 font-bold uppercase">Total Agreed</span>
                   <span className="font-bold text-gray-900">{utils.formatCurrency(candidate?.agreedAmount || 0)}</span>
                </div>
                <div className="flex justify-between items-center border-b border-gray-50 pb-2">
                   <span className="text-xs text-gray-400 font-bold uppercase">Total Paid</span>
                   <span className="font-bold text-emerald-600">{utils.formatCurrency(paid)}</span>
                </div>
                <div className="pt-2">
                   <span className="text-[10px] text-gray-400 font-bold uppercase block mb-1">Balance Due</span>
                   <span className={`text-2xl font-black ${due > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                      {due <= 0 ? 'Fully Cleared ✓' : utils.formatCurrency(due)}
                   </span>
                </div>
             </div>
          </Card>

          <Card title="Upcoming Interviews" className="border-l-4 border-l-purple-500">
             <div className="space-y-3">
                {myInterviews.length > 0 ? myInterviews.map(inv => (
                   <div key={inv.id} className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                      <p className="font-bold text-gray-900 text-sm">{inv.companyName}</p>
                      <p className="text-[10px] text-indigo-600 font-bold uppercase">{inv.round} Round</p>
                      <p className="text-xs text-gray-500 mt-1">{new Date(inv.date).toDateString()} at {inv.time}</p>
                   </div>
                )) : (
                   <div className="text-center py-8 text-gray-400 italic">
                      <svg className="w-10 h-10 mx-auto mb-2 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      No interviews scheduled.
                   </div>
                )}
             </div>
          </Card>
        </div>

        <Card title="Quick Resources">
           <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link to="/training/interview-questions" className="p-4 bg-orange-50 rounded-xl border border-orange-100 hover:shadow-md transition-all group">
                 <div className="text-orange-600 font-bold text-sm mb-1 group-hover:underline">Interview Prep</div>
                 <p className="text-[10px] text-orange-400">Master frequently asked Q&A</p>
              </Link>
              <Link to="/candidates/info" className="p-4 bg-blue-50 rounded-xl border border-blue-100 hover:shadow-md transition-all group">
                 <div className="text-blue-600 font-bold text-sm mb-1 group-hover:underline">My Profile</div>
                 <p className="text-[10px] text-blue-400">Fill your professional details</p>
              </Link>
              <Link to="/training/curriculum" className="p-4 bg-purple-50 rounded-xl border border-purple-100 hover:shadow-md transition-all group">
                 <div className="text-purple-600 font-bold text-sm mb-1 group-hover:underline">Curriculum</div>
                 <p className="text-[10px] text-purple-400">View what you will learn</p>
              </Link>
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 opacity-50 grayscale cursor-not-allowed">
                 <div className="text-gray-600 font-bold text-sm mb-1">Certificates</div>
                 <p className="text-[10px] text-gray-400">Available after placement</p>
              </div>
           </div>
        </Card>
      </div>
    );
  }

  // --- STAFF / REGULAR ADMIN DASHBOARD VIEW ---
  if (!isSuperAdmin) {
    const activeCandidates = candidates.filter(c => c.isActive);
    const placedThisMonth = candidates.filter(c => c.status === CandidateStatus.Placed).length; // Simplified check
    const todayInterviews = interviews.filter(i => i.date === new Date().toISOString().split('T')[0]);

    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-2">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Management Dashboard</h1>
            <p className="text-gray-600 mt-1">Hello {user.name}, here's a summary of consultancy operations.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-white border-blue-100 border shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg text-blue-600 shrink-0">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
              </div>
              <div className="min-w-0">
                <p className="text-[11px] text-gray-400 font-bold uppercase">Active Students</p>
                <p className="text-2xl font-bold text-gray-900">{activeCandidates.length}</p>
              </div>
            </div>
          </Card>

          <Card className="bg-white border-emerald-100 border shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600 shrink-0">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <div className="min-w-0">
                <p className="text-[11px] text-gray-400 font-bold uppercase">Total Placements</p>
                <p className="text-2xl font-bold text-gray-900">{placedThisMonth}</p>
              </div>
            </div>
          </Card>

          <Card className="bg-white border-purple-100 border shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-50 rounded-lg text-purple-600 shrink-0">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              </div>
              <div className="min-w-0">
                <p className="text-[11px] text-gray-400 font-bold uppercase">Today's Interviews</p>
                <p className="text-2xl font-bold text-gray-900">{todayInterviews.length}</p>
              </div>
            </div>
          </Card>

          <Card className="bg-white border-amber-100 border shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-50 rounded-lg text-amber-600 shrink-0">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <div className="min-w-0">
                <p className="text-[11px] text-gray-400 font-bold uppercase">Upcoming Tasks</p>
                <p className="text-2xl font-bold text-gray-900">5</p>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
           <Card title="Today's Interview Pipeline" action={<Link to="/training/interviews" className="text-xs text-spr-600 font-bold hover:underline">View All</Link>}>
              <div className="space-y-4">
                 {todayInterviews.length > 0 ? todayInterviews.map(inv => {
                    const c = candidates.find(x => x.id === inv.candidateId);
                    return (
                       <div key={inv.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-100">
                          <div>
                             <p className="font-bold text-gray-900 text-sm">{c?.name || 'Unknown'}</p>
                             <p className="text-[10px] text-gray-500 uppercase">{inv.companyName} • {inv.time}</p>
                          </div>
                          <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-blue-100 text-blue-700">{inv.status}</span>
                       </div>
                    );
                 }) : (
                    <div className="text-center py-10 text-gray-400 italic text-sm">No interviews scheduled for today.</div>
                 )}
              </div>
           </Card>

           <Card title="Batch Performance" action={<Link to="/training/monitor" className="text-xs text-spr-600 font-bold hover:underline">Full Monitor</Link>}>
              <div className="space-y-4">
                 {candidates.slice(0, 5).map(c => {
                    const logs = trainingLogs.filter(l => l.candidateId === c.id);
                    const progress = trainingTopics.length > 0 ? Math.round((new Set(logs.map(l => l.topicId)).size / trainingTopics.length) * 100) : 0;
                    return (
                       <div key={c.id} className="space-y-1">
                          <div className="flex justify-between text-xs font-medium">
                             <span className="text-gray-700">{c.name} ({c.batchId})</span>
                             <span className="text-gray-500">{progress}%</span>
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-1.5">
                             <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${progress}%` }}></div>
                          </div>
                       </div>
                    );
                 })}
              </div>
           </Card>
        </div>
      </div>
    );
  }

  // --- FULL SUPER ADMIN DASHBOARD VIEW (ORIGINAL FINANCIAL VIEW) ---
  const totalCash = accounts.filter(a => a.type === AccountType.Cash).reduce((sum, acc) => sum + getEntityBalance(acc.id, 'Account'), 0);
  const totalBank = accounts.filter(a => a.type === AccountType.Bank).reduce((sum, acc) => sum + getEntityBalance(acc.id, 'Account'), 0);
  const totalIncome = transactions.filter(t => t.type === TransactionType.Income).reduce((sum, t) => sum + t.amount, 0);
  const totalPayments = transactions.filter(t => t.type === TransactionType.Payment).reduce((sum, t) => sum + t.amount, 0);

  const getCandidatePaid = (cId: string) => {
     const income = transactions.filter(t => t.fromEntityId === cId && t.type === TransactionType.Income).reduce((sum, t) => sum + t.amount, 0);
     const refunds = transactions.filter(t => t.toEntityId === cId && t.type === TransactionType.Refund).reduce((sum, t) => sum + t.amount, 0);
     return income - refunds;
  };

  const placedCandidates = candidates.filter(c => c.status === CandidateStatus.Placed);
  const activeCandidatesForAdmin = candidates.filter(c => c.isActive);
  const incomeFromPlaced = placedCandidates.reduce((sum, c) => sum + getCandidatePaid(c.id), 0);
  
  const totalCandidateFeesPending = activeCandidatesForAdmin.reduce((sum, c) => {
      const paid = getCandidatePaid(c.id);
      const due = c.agreedAmount - paid;
      return sum + (due > 0 ? due : 0);
  }, 0);

  // Updated Ledger Summary Logic using unified getEntityBalance
  const totalSundryDebtors = accounts.filter(a => a.type === AccountType.Debtor).reduce((sum, a) => {
      const bal = getEntityBalance(a.id, 'Account');
      return sum + (bal > 0 ? bal : 0);
  }, 0);

  const totalSundryCreditors = accounts.filter(a => a.type === AccountType.Creditor || a.type === AccountType.Salary).reduce((sum, a) => {
      const bal = getEntityBalance(a.id, 'Account');
      // Balance for liabilities is negative if we owe money
      return sum + (bal < 0 ? Math.abs(bal) : 0);
  }, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-2">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Director Dashboard</h1>
          <p className="text-gray-600 mt-1">Full transparency oversee of consultancy financials.</p>
        </div>
        <div className="text-left md:text-right">
          <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">Net Liquidity</p>
          <p className="text-2xl font-bold text-emerald-600 whitespace-nowrap tabular-nums">{utils.formatCurrency(totalCash + totalBank)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-white border-emerald-100 border shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600 shrink-0">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
            </div>
            <div className="min-w-0">
              <p className="text-[11px] text-gray-400 font-bold uppercase truncate">Cash in Hand</p>
              <p className="text-lg font-bold text-gray-900 whitespace-nowrap tabular-nums truncate">{utils.formatCurrency(totalCash)}</p>
            </div>
          </div>
        </Card>
        
        <Card className="bg-white border-blue-100 border shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg text-blue-600 shrink-0">
               <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" /></svg>
            </div>
            <div className="min-w-0">
              <p className="text-[11px] text-gray-400 font-bold uppercase truncate">Bank Balance</p>
              <p className="text-lg font-bold text-gray-900 whitespace-nowrap tabular-nums truncate">{utils.formatCurrency(totalBank)}</p>
            </div>
          </div>
        </Card>

        <Card className="bg-white border-indigo-100 border shadow-sm">
           <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600 shrink-0">
               <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
            </div>
            <div className="min-w-0">
              <p className="text-[11px] text-gray-400 font-bold uppercase truncate">Total Income</p>
              <p className="text-lg font-bold text-gray-900 whitespace-nowrap tabular-nums truncate">{utils.formatCurrency(totalIncome)}</p>
            </div>
          </div>
        </Card>

        <Card className="bg-white border-red-100 border shadow-sm">
           <div className="flex items-center gap-3">
            <div className="p-2 bg-red-50 rounded-lg text-red-600 shrink-0">
               <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" /></svg>
            </div>
            <div className="min-w-0">
              <p className="text-[11px] text-gray-400 font-bold uppercase truncate">Total Payments</p>
              <p className="text-lg font-bold text-gray-900 whitespace-nowrap tabular-nums truncate">{utils.formatCurrency(totalPayments)}</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card title="Candidate Financials" className="lg:col-span-2">
           <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex flex-col justify-center">
                 <p className="text-gray-500 text-[10px] uppercase tracking-wider font-bold">Total Candidates</p>
                 <p className="text-2xl font-extrabold text-gray-900 mt-1">{candidates.length}</p>
                 <p className="text-[10px] text-indigo-500 mt-1 font-bold">{activeCandidatesForAdmin.length} Currently Active</p>
              </div>
              <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100 flex flex-col justify-center">
                 <p className="text-emerald-700 text-[10px] uppercase tracking-wider font-bold">From Placed</p>
                 <p className="text-xl font-bold text-emerald-600 mt-1 whitespace-nowrap tabular-nums truncate">{utils.formatCurrency(incomeFromPlaced)}</p>
              </div>
              <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-100 flex flex-col justify-center">
                 <p className="text-amber-700 text-[10px] uppercase tracking-wider font-bold">Pending Dues</p>
                 <p className="text-xl font-bold text-amber-600 mt-1 whitespace-nowrap tabular-nums truncate">{utils.formatCurrency(totalCandidateFeesPending)}</p>
              </div>
           </div>
        </Card>

        <Card title="Ledger Summary">
           <div className="space-y-4">
             <div className="p-4 bg-emerald-50/30 rounded-xl border border-emerald-100">
                <p className="text-[10px] text-emerald-700 uppercase font-bold tracking-wider mb-1">Debtors (Total Receivables)</p>
                <p className="text-2xl font-extrabold text-emerald-600 tabular-nums truncate">{utils.formatCurrency(totalSundryDebtors + totalCandidateFeesPending)}</p>
             </div>
             <div className="p-4 bg-red-50/30 rounded-xl border border-red-100">
                <p className="text-[10px] text-red-700 uppercase font-bold tracking-wider mb-1">Creditors (Total Payables)</p>
                <p className="text-2xl font-extrabold text-red-600 tabular-nums truncate">{utils.formatCurrency(totalSundryCreditors)}</p>
             </div>
           </div>
        </Card>
      </div>

      <Card title="Consolidated Profit & Loss (Realized)">
        <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <span className="text-gray-500 font-medium text-sm">Total Realized Income</span>
              <span className="text-emerald-600 font-bold whitespace-nowrap tabular-nums">{utils.formatCurrency(totalIncome)}</span>
            </div>
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <span className="text-gray-500 font-medium text-sm">Total Realized Payments</span>
              <span className="text-red-600 font-bold whitespace-nowrap tabular-nums">- {utils.formatCurrency(totalPayments)}</span>
            </div>
            <div className="flex justify-between items-center pt-1">
              <span className="text-gray-900 text-lg font-extrabold">Net Realized Result</span>
              <span className={`text-2xl font-black whitespace-nowrap tabular-nums ${totalIncome - totalPayments >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                  {utils.formatCurrency(totalIncome - totalPayments)}
              </span>
            </div>
        </div>
      </Card>
    </div>
  );
};