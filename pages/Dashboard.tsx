import React from 'react';
import { useApp } from '../context/AppContext';
import { Card, Button } from '../components/Components';
import { AccountType, TransactionType, CandidateStatus } from '../types';
import { Link, useNavigate } from 'react-router-dom';
import * as utils from '../utils';

export const Dashboard: React.FC = () => {
  const { user, candidates, accounts, transactions, getEntityBalance, trainingTopics, trainingLogs, interviews } = useApp();
  const navigate = useNavigate();

  if (!user) return null;

  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const isSuperAdmin = user.username === 'thirumalreddy@sprtechforge.com';

  // --- CANDIDATE DASHBOARD VIEW ---
  if (user.role === 'candidate') {
    const candidate = candidates.find(c => c.id === user.linkedCandidateId);
    const myLogs = trainingLogs.filter(l => l.candidateId === candidate?.id);
    const myInterviews = interviews
      .filter(i => i.candidateId === candidate?.id && i.status === 'Scheduled')
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const paid = transactions
      .filter(t => t.fromEntityId === candidate?.id && t.type === TransactionType.Income)
      .reduce((sum, t) => sum + t.amount, 0) -
      transactions
      .filter(t => t.toEntityId === candidate?.id && t.type === TransactionType.Refund)
      .reduce((sum, t) => sum + t.amount, 0);

    const due = (candidate?.agreedAmount || 0) - paid;
    const progressPercent = trainingTopics.length > 0
      ? Math.round((new Set(myLogs.map(l => l.topicId)).size / trainingTopics.length) * 100)
      : 0;

    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Student Dashboard</h1>
            <p className="text-gray-500 mt-1">Welcome back, <span className="font-semibold text-gray-700">{user.name}</span>.</p>
          </div>
          <div className="bg-white border border-gray-200 px-4 py-2 rounded-xl shadow-sm text-right">
            <span className="text-[10px] text-gray-400 font-bold uppercase block tracking-widest">Status</span>
            <span className="text-spr-600 font-bold">{candidate?.status || 'Active'}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card title="Training Progress" className="border-l-4 border-l-blue-500">
            <div className="text-center py-4">
              <div className="relative inline-flex items-center justify-center mb-4">
                <svg className="w-28 h-28 transform -rotate-90">
                  <circle cx="56" cy="56" r="46" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-gray-100" />
                  <circle cx="56" cy="56" r="46" stroke="currentColor" strokeWidth="8" fill="transparent"
                    strokeDasharray={289.0}
                    strokeDashoffset={289.0 - (289.0 * progressPercent) / 100}
                    className="text-blue-500 transition-all duration-1000"
                    strokeLinecap="round"
                  />
                </svg>
                <span className="absolute text-2xl font-black text-gray-800">{progressPercent}%</span>
              </div>
              <p className="text-sm font-medium text-gray-600">Curriculum Coverage</p>
              <p className="text-xs text-gray-400 mt-1">{new Set(myLogs.map(l => l.topicId)).size} of {trainingTopics.length} topics covered</p>
              <div className="mt-5">
                <Button variant="secondary" className="w-full text-xs" onClick={() => navigate('/training/dashboard')}>View Full Syllabus</Button>
              </div>
            </div>
          </Card>

          <Card title="Fee Standing" className="border-l-4 border-l-emerald-500">
            <div className="space-y-4 pt-1">
              <div className="flex justify-between items-center border-b border-gray-50 pb-3">
                <span className="text-xs text-gray-400 font-bold uppercase">Total Agreed</span>
                <span className="font-bold text-gray-900 tabular-nums">{utils.formatCurrency(candidate?.agreedAmount || 0)}</span>
              </div>
              <div className="flex justify-between items-center border-b border-gray-50 pb-3">
                <span className="text-xs text-gray-400 font-bold uppercase">Total Paid</span>
                <span className="font-bold text-emerald-600 tabular-nums">{utils.formatCurrency(paid)}</span>
              </div>
              {(candidate?.agreedAmount || 0) > 0 && (
                <div>
                  <div className="w-full bg-gray-100 rounded-full h-2 mb-1">
                    <div
                      className="bg-emerald-500 h-2 rounded-full transition-all duration-700"
                      style={{ width: `${Math.min(100, (paid / (candidate?.agreedAmount || 1)) * 100)}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-gray-400 text-right">{Math.round((paid / (candidate?.agreedAmount || 1)) * 100)}% paid</p>
                </div>
              )}
              <div className="pt-1">
                <span className="text-[10px] text-gray-400 font-bold uppercase block mb-1">Balance Due</span>
                <span className={`text-2xl font-black ${due > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                  {due <= 0 ? 'Fully Cleared ✓' : utils.formatCurrency(due)}
                </span>
              </div>
            </div>
          </Card>

          <Card title="Upcoming Interviews" className="border-l-4 border-l-purple-500">
            <div className="space-y-3">
              {myInterviews.length > 0 ? myInterviews.slice(0, 3).map(inv => (
                <div key={inv.id} className="p-3 bg-gray-50 rounded-lg border border-gray-100 hover:border-purple-100 transition-colors">
                  <p className="font-bold text-gray-900 text-sm">{inv.companyName}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] text-indigo-600 font-bold uppercase bg-indigo-50 px-2 py-0.5 rounded">{inv.round}</span>
                    <span className="text-[10px] text-gray-400">{inv.interviewType}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1.5">{new Date(inv.date).toDateString()} at {inv.time}</p>
                </div>
              )) : (
                <div className="text-center py-10 text-gray-400">
                  <svg className="w-10 h-10 mx-auto mb-2 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  <p className="text-sm font-medium text-gray-500">No upcoming interviews</p>
                </div>
              )}
            </div>
          </Card>
        </div>

        <Card title="Quick Resources">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link to="/training/interview-questions" className="p-4 bg-orange-50 rounded-xl border border-orange-100 hover:shadow-md hover:border-orange-200 transition-all group">
              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center mb-2">
                <svg className="w-4 h-4 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <div className="text-orange-700 font-bold text-sm mb-0.5 group-hover:underline">Interview Prep</div>
              <p className="text-[11px] text-orange-400">Master frequently asked Q&A</p>
            </Link>
            <Link to="/candidates/info" className="p-4 bg-blue-50 rounded-xl border border-blue-100 hover:shadow-md hover:border-blue-200 transition-all group">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mb-2">
                <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
              </div>
              <div className="text-blue-700 font-bold text-sm mb-0.5 group-hover:underline">My Profile</div>
              <p className="text-[11px] text-blue-400">Fill your professional details</p>
            </Link>
            <Link to="/training/curriculum" className="p-4 bg-purple-50 rounded-xl border border-purple-100 hover:shadow-md hover:border-purple-200 transition-all group">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mb-2">
                <svg className="w-4 h-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
              </div>
              <div className="text-purple-700 font-bold text-sm mb-0.5 group-hover:underline">Curriculum</div>
              <p className="text-[11px] text-purple-400">View the full syllabus</p>
            </Link>
            <Link to="/training/dashboard" className="p-4 bg-emerald-50 rounded-xl border border-emerald-100 hover:shadow-md hover:border-emerald-200 transition-all group">
              <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center mb-2">
                <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
              </div>
              <div className="text-emerald-700 font-bold text-sm mb-0.5 group-hover:underline">Training Stats</div>
              <p className="text-[11px] text-emerald-400">View your progress report</p>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  // --- STAFF / REGULAR ADMIN DASHBOARD VIEW ---
  if (!isSuperAdmin) {
    const activeCandidates = candidates.filter(c => c.isActive);
    const placed = candidates.filter(c => c.status === CandidateStatus.Placed);
    const readyForInterview = candidates.filter(c => c.status === CandidateStatus.ReadyForInterview);
    const todayInterviews = interviews.filter(i => i.date === todayStr);
    const upcomingInterviews = interviews
      .filter(i => i.status === 'Scheduled' && i.date >= todayStr)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 8);

    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-2">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Management Dashboard</h1>
            <p className="text-gray-500 mt-1">
              Welcome, <span className="font-semibold text-gray-700">{user.name}</span>
              <span className="text-gray-400 ml-2 hidden sm:inline">· {today.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</span>
            </p>
          </div>
          <Link to="/candidates/new">
            <Button className="text-sm">+ Add Candidate</Button>
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-white border-blue-100 border shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-50 rounded-xl text-blue-600 shrink-0">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              </div>
              <div className="min-w-0">
                <p className="text-[11px] text-gray-400 font-bold uppercase">Active Students</p>
                <p className="text-2xl font-bold text-gray-900">{activeCandidates.length}</p>
                <p className="text-[10px] text-gray-400">{candidates.length} total enrolled</p>
              </div>
            </div>
          </Card>

          <Card className="bg-white border-emerald-100 border shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-50 rounded-xl text-emerald-600 shrink-0">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <div className="min-w-0">
                <p className="text-[11px] text-gray-400 font-bold uppercase">Placed</p>
                <p className="text-2xl font-bold text-gray-900">{placed.length}</p>
                <p className="text-[10px] text-emerald-500 font-medium">Successfully placed</p>
              </div>
            </div>
          </Card>

          <Card className="bg-white border-amber-100 border shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-amber-50 rounded-xl text-amber-600 shrink-0">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
              </div>
              <div className="min-w-0">
                <p className="text-[11px] text-gray-400 font-bold uppercase">Ready to Interview</p>
                <p className="text-2xl font-bold text-gray-900">{readyForInterview.length}</p>
                <p className="text-[10px] text-amber-500 font-medium">Awaiting opportunities</p>
              </div>
            </div>
          </Card>

          <Card className="bg-white border-purple-100 border shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-purple-50 rounded-xl text-purple-600 shrink-0">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              </div>
              <div className="min-w-0">
                <p className="text-[11px] text-gray-400 font-bold uppercase">Today's Interviews</p>
                <p className="text-2xl font-bold text-gray-900">{todayInterviews.length}</p>
                <p className="text-[10px] text-purple-500 font-medium">Scheduled today</p>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card title="Interview Pipeline" action={<Link to="/training/interviews" className="text-xs text-spr-600 font-bold hover:underline">View All</Link>}>
            <div className="space-y-2 pt-1">
              {upcomingInterviews.length > 0 ? upcomingInterviews.map(inv => {
                const c = candidates.find(x => x.id === inv.candidateId);
                const isToday = inv.date === todayStr;
                return (
                  <div key={inv.id} className={`flex justify-between items-center p-3 rounded-lg border transition-colors ${isToday ? 'bg-purple-50 border-purple-100' : 'bg-gray-50 border-gray-100 hover:bg-gray-100'}`}>
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-gray-900 text-sm truncate">{c?.name || 'Unknown'}</p>
                      <p className="text-[10px] text-gray-500 truncate">{inv.companyName} · {new Date(inv.date).toLocaleDateString()} · {inv.time}</p>
                    </div>
                    <div className="flex items-center gap-2 ml-2 shrink-0">
                      {isToday && <span className="text-[9px] font-bold bg-purple-600 text-white px-1.5 py-0.5 rounded uppercase">Today</span>}
                      <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-blue-100 text-blue-700">{inv.round}</span>
                    </div>
                  </div>
                );
              }) : (
                <div className="text-center py-10 text-gray-400 text-sm">No upcoming interviews scheduled.</div>
              )}
            </div>
          </Card>

          <Card title="Batch Overview" action={<Link to="/candidates" className="text-xs text-spr-600 font-bold hover:underline">All Candidates</Link>}>
            <div className="space-y-3 pt-1">
              {candidates.slice(0, 6).map(c => {
                const logs = trainingLogs.filter(l => l.candidateId === c.id);
                const progress = trainingTopics.length > 0
                  ? Math.round((new Set(logs.map(l => l.topicId)).size / trainingTopics.length) * 100)
                  : 0;
                return (
                  <div key={c.id} className="space-y-1">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-gray-700 truncate max-w-[70%]">{c.name}
                        <span className="text-gray-400 ml-1 font-mono text-[10px]">({c.batchId})</span>
                      </span>
                      <span className={`font-bold shrink-0 ml-2 ${progress === 100 ? 'text-emerald-600' : 'text-gray-500'}`}>{progress}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                      <div
                        className={`h-1.5 rounded-full transition-all duration-500 ${progress >= 75 ? 'bg-emerald-500' : progress >= 40 ? 'bg-blue-500' : 'bg-amber-500'}`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                );
              })}
              {candidates.length > 6 && (
                <p className="text-xs text-gray-400 text-center pt-1">+ {candidates.length - 6} more candidates</p>
              )}
              {candidates.length === 0 && (
                <div className="text-center py-6 text-gray-400 text-sm">No candidates enrolled yet.</div>
              )}
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // --- FULL SUPER ADMIN DASHBOARD VIEW ---
  const totalCash = accounts.filter(a => a.type === AccountType.Cash).reduce((sum, acc) => sum + getEntityBalance(acc.id, 'Account'), 0);
  const totalBank = accounts.filter(a => a.type === AccountType.Bank).reduce((sum, acc) => sum + getEntityBalance(acc.id, 'Account'), 0);
  const totalIncome = transactions.filter(t => t.type === TransactionType.Income).reduce((sum, t) => sum + t.amount, 0);
  const totalPayments = transactions.filter(t => t.type === TransactionType.Payment).reduce((sum, t) => sum + t.amount, 0);
  const netProfit = totalIncome - totalPayments;

  const getCandidatePaid = (cId: string) => {
    const income = transactions.filter(t => t.fromEntityId === cId && t.type === TransactionType.Income).reduce((sum, t) => sum + t.amount, 0);
    const refunds = transactions.filter(t => t.toEntityId === cId && t.type === TransactionType.Refund).reduce((sum, t) => sum + t.amount, 0);
    return income - refunds;
  };

  const placedCandidates = candidates.filter(c => c.status === CandidateStatus.Placed);
  const activeCandidatesForAdmin = candidates.filter(c => c.isActive);
  const readyCount = candidates.filter(c => c.status === CandidateStatus.ReadyForInterview).length;
  const trainingCount = candidates.filter(c => c.status === CandidateStatus.Training).length;
  const todayInterviewsCount = interviews.filter(i => i.date === todayStr).length;

  const totalCandidateFeesPending = activeCandidatesForAdmin.reduce((sum, c) => {
    const paid = getCandidatePaid(c.id);
    const due = c.agreedAmount - paid;
    return sum + (due > 0 ? due : 0);
  }, 0);

  const totalSundryDebtors = accounts.filter(a => a.type === AccountType.Debtor).reduce((sum, a) => {
    const bal = getEntityBalance(a.id, 'Account');
    return sum + (bal > 0 ? bal : 0);
  }, 0);

  const totalSundryCreditors = accounts.filter(a => a.type === AccountType.Creditor || a.type === AccountType.Salary).reduce((sum, a) => {
    const bal = getEntityBalance(a.id, 'Account');
    return sum + (bal < 0 ? Math.abs(bal) : 0);
  }, 0);

  const recentTransactions = [...transactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-2">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Director Dashboard</h1>
          <p className="text-gray-500 mt-1">
            {today.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div className="text-left md:text-right bg-white border border-emerald-200 px-4 py-2 rounded-xl shadow-sm">
          <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">Net Liquidity</p>
          <p className="text-2xl font-bold text-emerald-600 whitespace-nowrap tabular-nums">{utils.formatCurrency(totalCash + totalBank)}</p>
        </div>
      </div>

      {/* Top KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-white border-emerald-100 border shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-50 rounded-xl text-emerald-600 shrink-0">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
            </div>
            <div className="min-w-0">
              <p className="text-[11px] text-gray-400 font-bold uppercase">Cash in Hand</p>
              <p className="text-lg font-bold text-gray-900 whitespace-nowrap tabular-nums">{utils.formatCurrency(totalCash)}</p>
            </div>
          </div>
        </Card>

        <Card className="bg-white border-blue-100 border shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-50 rounded-xl text-blue-600 shrink-0">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" /></svg>
            </div>
            <div className="min-w-0">
              <p className="text-[11px] text-gray-400 font-bold uppercase">Bank Balance</p>
              <p className="text-lg font-bold text-gray-900 whitespace-nowrap tabular-nums">{utils.formatCurrency(totalBank)}</p>
            </div>
          </div>
        </Card>

        <Card className="bg-white border-indigo-100 border shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-50 rounded-xl text-indigo-600 shrink-0">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
            </div>
            <div className="min-w-0">
              <p className="text-[11px] text-gray-400 font-bold uppercase">Total Income</p>
              <p className="text-lg font-bold text-gray-900 whitespace-nowrap tabular-nums">{utils.formatCurrency(totalIncome)}</p>
            </div>
          </div>
        </Card>

        <Card className="bg-white border-red-100 border shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-red-50 rounded-xl text-red-600 shrink-0">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" /></svg>
            </div>
            <div className="min-w-0">
              <p className="text-[11px] text-gray-400 font-bold uppercase">Total Payments</p>
              <p className="text-lg font-bold text-gray-900 whitespace-nowrap tabular-nums">{utils.formatCurrency(totalPayments)}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Candidate + Ledger row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card title="Candidate Overview" className="lg:col-span-2" action={<Link to="/candidates" className="text-xs text-spr-600 font-bold hover:underline">View All</Link>}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-1">
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 text-center">
              <p className="text-2xl font-extrabold text-blue-700">{candidates.length}</p>
              <p className="text-[10px] text-blue-500 uppercase font-bold mt-0.5">Total</p>
            </div>
            <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100 text-center">
              <p className="text-2xl font-extrabold text-emerald-700">{placedCandidates.length}</p>
              <p className="text-[10px] text-emerald-500 uppercase font-bold mt-0.5">Placed</p>
            </div>
            <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 text-center">
              <p className="text-2xl font-extrabold text-amber-700">{readyCount}</p>
              <p className="text-[10px] text-amber-500 uppercase font-bold mt-0.5">Ready</p>
            </div>
            <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 text-center">
              <p className="text-2xl font-extrabold text-indigo-700">{trainingCount}</p>
              <p className="text-[10px] text-indigo-500 uppercase font-bold mt-0.5">Training</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 mt-3">
            <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 flex items-center justify-between">
              <span className="text-xs text-gray-500 font-bold uppercase">Fees Pending</span>
              <span className="font-bold text-amber-600 tabular-nums whitespace-nowrap text-sm">{utils.formatCurrency(totalCandidateFeesPending)}</span>
            </div>
            <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 flex items-center justify-between">
              <span className="text-xs text-gray-500 font-bold uppercase">Today's Interviews</span>
              <span className="font-bold text-purple-600 text-lg">{todayInterviewsCount}</span>
            </div>
          </div>
        </Card>

        <Card title="Ledger Summary" action={<Link to="/finance/accounts" className="text-xs text-spr-600 font-bold hover:underline">View Accounts</Link>}>
          <div className="space-y-3 pt-1">
            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
              <p className="text-[10px] text-emerald-700 uppercase font-bold tracking-wider mb-1">Total Receivables</p>
              <p className="text-2xl font-extrabold text-emerald-600 tabular-nums">{utils.formatCurrency(totalSundryDebtors + totalCandidateFeesPending)}</p>
              <p className="text-[10px] text-emerald-500 mt-0.5">Candidates + Sundry Debtors</p>
            </div>
            <div className="p-4 bg-red-50 rounded-xl border border-red-100">
              <p className="text-[10px] text-red-700 uppercase font-bold tracking-wider mb-1">Total Payables</p>
              <p className="text-2xl font-extrabold text-red-600 tabular-nums">{utils.formatCurrency(totalSundryCreditors)}</p>
              <p className="text-[10px] text-red-500 mt-0.5">Creditors + Salary Accounts</p>
            </div>
          </div>
        </Card>
      </div>

      {/* P&L + Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card title="Profit & Loss" action={<Link to="/finance/financial-statements" className="text-xs text-spr-600 font-bold hover:underline">Full Report</Link>}>
          <div className="space-y-3 pt-1">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <span className="text-gray-500 font-medium text-sm">Total Income</span>
              <span className="text-emerald-600 font-bold whitespace-nowrap tabular-nums">{utils.formatCurrency(totalIncome)}</span>
            </div>
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <span className="text-gray-500 font-medium text-sm">Total Expenses</span>
              <span className="text-red-600 font-bold whitespace-nowrap tabular-nums">− {utils.formatCurrency(totalPayments)}</span>
            </div>
            <div className={`flex justify-between items-center p-3 rounded-xl ${netProfit >= 0 ? 'bg-emerald-50 border border-emerald-100' : 'bg-red-50 border border-red-100'}`}>
              <span className="font-extrabold text-gray-900 text-sm">Net Result</span>
              <span className={`text-xl font-black whitespace-nowrap tabular-nums ${netProfit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                {utils.formatCurrency(netProfit)}
              </span>
            </div>
          </div>
        </Card>

        <Card title="Recent Transactions" className="lg:col-span-2" action={<Link to="/finance/transactions" className="text-xs text-spr-600 font-bold hover:underline">All Transactions</Link>}>
          {recentTransactions.length > 0 ? (
            <div className="space-y-1 pt-1">
              {recentTransactions.map(t => (
                <div key={t.id} className="flex justify-between items-center py-2.5 border-b border-gray-50 last:border-0">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-800 truncate">{t.description}</p>
                    <p className="text-[10px] text-gray-400">{new Date(t.date).toLocaleDateString()} ·&nbsp;
                      <span className={`font-bold uppercase ${t.type === TransactionType.Income ? 'text-emerald-600' : t.type === TransactionType.Payment ? 'text-red-500' : 'text-gray-500'}`}>{t.type}</span>
                    </p>
                  </div>
                  <span className={`ml-3 font-bold tabular-nums whitespace-nowrap text-sm shrink-0 ${t.type === TransactionType.Income ? 'text-emerald-600' : t.type === TransactionType.Payment ? 'text-red-600' : 'text-gray-700'}`}>
                    {t.type === TransactionType.Payment ? '− ' : '+ '}{utils.formatCurrency(t.amount)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400 text-sm">No transactions recorded yet.</div>
          )}
        </Card>
      </div>
    </div>
  );
};
