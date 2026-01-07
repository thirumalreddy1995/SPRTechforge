import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Candidate, Account, Transaction, AccountType, CandidateStatus, PasswordResetRequest, ActivityLog, TrainingModule, TrainingTopic, TrainingLog, Toast, InterviewModule, InterviewQuestion, CandidateProfile, InterviewSchedule, TransactionType } from '../types';
import * as utils from '../utils';
import { cloudService } from '../services/cloud';

interface AppContextType {
  user: User | null;
  login: (username?: string, pass?: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  isInitialized: boolean;

  toast: Toast | null;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;

  users: User[];
  addUser: (u: User) => void;
  updateUser: (u: User) => void;
  deleteUser: (id: string) => void;

  passwordResetRequests: PasswordResetRequest[];
  addPasswordResetRequest: (username: string) => void;
  resolvePasswordResetRequest: (id: string) => void;

  candidates: Candidate[];
  addCandidate: (c: Candidate) => void;
  updateCandidate: (c: Candidate) => void;
  deleteCandidate: (id: string) => void;

  candidateProfiles: CandidateProfile[];
  updateCandidateProfile: (p: CandidateProfile) => void;

  interviews: InterviewSchedule[];
  addInterview: (i: InterviewSchedule) => void;
  updateInterview: (i: InterviewSchedule) => void;
  deleteInterview: (id: string) => void;

  markAgreementSent: (candidateId: string) => void;
  markAgreementAccepted: (candidateId: string) => void;
  markAgreementRejected: (candidateId: string, reason: string) => void;

  candidateStatuses: string[];
  addCandidateStatus: (status: string) => void;

  accounts: Account[];
  addAccount: (a: Account) => void;
  updateAccount: (a: Account) => void;
  deleteAccount: (id: string) => void;

  transactions: Transaction[];
  addTransaction: (t: Transaction) => void;
  updateTransaction: (t: Transaction) => void;
  deleteTransaction: (id: string) => void;
  lockTransaction: (id: string) => void;

  activityLogs: ActivityLog[];
  clearActivityLogs: () => void;

  trainingModules: TrainingModule[];
  addTrainingModule: (m: TrainingModule) => void;
  updateTrainingModule: (m: TrainingModule) => void;
  deleteTrainingModule: (id: string) => void;

  trainingTopics: TrainingTopic[];
  addTrainingTopic: (t: TrainingTopic) => void;
  updateTrainingTopic: (t: TrainingTopic) => void;
  deleteTrainingTopic: (id: string) => void;

  trainingLogs: TrainingLog[];
  addTrainingLog: (l: TrainingLog) => void;
  batchUpdateTrainingLogs: (logs: TrainingLog[]) => void;

  interviewModules: InterviewModule[];
  addInterviewModule: (m: InterviewModule) => void;
  updateInterviewModule: (m: InterviewModule) => void;
  deleteInterviewModule: (id: string) => void;

  interviewQuestions: InterviewQuestion[];
  addInterviewQuestion: (q: InterviewQuestion) => void;
  updateInterviewQuestion: (q: InterviewQuestion) => void;
  deleteInterviewQuestion: (id: string) => void;

  getEntityName: (id: string, type: 'Account' | 'Candidate' | 'Staff') => string;
  getEntityBalance: (id: string, type: 'Account' | 'Candidate' | 'Staff') => number;

  exportData: () => void;
  exportFullExcel: () => void;
  importDatabase: (json: any) => Promise<void>;
  factoryReset: () => void;

  isCloudEnabled: boolean;
  syncLocalToCloud: () => Promise<void>;
  cloudError: string | null;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

const STORAGE_KEY = 'SPR_TECHFORGE_FRESH_V10';
const SESSION_KEY = 'SPR_TECHFORGE_SESSION_V4';
const SESSION_TIMEOUT_MS = 60 * 60 * 1000;

const DEFAULT_ADMIN: User = {
  id: 'admin-01',
  name: 'Thirumal Reddy',
  username: 'thirumalreddy@sprtechforge.com',
  password: 'ThiruPriya@13',
  role: 'admin',
  modules: ['candidates', 'finance', 'users', 'training'],
  authProvider: 'local',
  isPasswordChanged: true
};

const DEFAULT_ACCOUNTS: Account[] = [
  { id: 'cash-01', name: 'Office Cash', type: AccountType.Cash, openingBalance: 0, isSystem: true },
];
const DEFAULT_STATUSES: string[] = [
  CandidateStatus.Training,
  CandidateStatus.ReadyForInterview,
  CandidateStatus.Placed,
  CandidateStatus.Discontinued
];

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const [users, setUsers] = useState<User[]>([DEFAULT_ADMIN]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [candidateProfiles, setCandidateProfiles] = useState<CandidateProfile[]>([]);
  const [interviews, setInterviews] = useState<InterviewSchedule[]>([]);
  const [accounts, setAccounts] = useState<Account[]>(DEFAULT_ACCOUNTS);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [candidateStatuses, setCandidateStatuses] = useState<string[]>(DEFAULT_STATUSES);
  const [passwordResetRequests, setPasswordResetRequests] = useState<PasswordResetRequest[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);

  const [trainingModules, setTrainingModules] = useState<TrainingModule[]>([]);
  const [trainingTopics, setTrainingTopics] = useState<TrainingTopic[]>([]);
  const [trainingLogs, setTrainingLogs] = useState<TrainingLog[]>([]);

  const [interviewModules, setInterviewModules] = useState<InterviewModule[]>([]);
  const [interviewQuestions, setInterviewQuestions] = useState<InterviewQuestion[]>([]);

  const [toast, setToast] = useState<Toast | null>(null);
  const [cloudError, setCloudError] = useState<string | null>(null);
  const [dataLoaded, setDataLoaded] = useState(false);

  const isCloudEnabled = cloudService.isConfigured();

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Date.now().toString();
    setToast({ id, message, type });
    setTimeout(() => setToast((c) => (c?.id === id ? null : c)), 3000);
  };

  const logActivity = (action: ActivityLog['action'], desc: string, entityType: string, entityId?: string) => {
    if (!user) return;
    const log: ActivityLog = {
      id: utils.generateId(),
      timestamp: new Date().toISOString(),
      actorId: user.id,
      actorName: user.name,
      action,
      description: desc,
      entityType,
      entityId
    };
    setActivityLogs(p => [log, ...p]);
    if (isCloudEnabled) cloudService.saveItem('activityLogs', log).catch(console.error);
  };

  useEffect(() => {
    if (isCloudEnabled) {
      const handleSubError = (err: any) => { setCloudError(err.message); setDataLoaded(true); };
      //const unsubUsers = cloudService.subscribe('users', d => { if(d.length > 0) setUsers(d); else setUsers([DEFAULT_ADMIN]); setDataLoaded(true);}, handleSubError);
      const unsubUsers = cloudService.subscribe(
        'users',
        d => {
          if (d.length > 0) setUsers(d);
          else setUsers([DEFAULT_ADMIN]);

          setDataLoaded(true);
          setIsInitialized(true); // 🔥 REQUIRED
        },
        handleSubError
      );

      const unsubCand = cloudService.subscribe('candidates', setCandidates);
      const unsubProf = cloudService.subscribe('candidateProfiles', setCandidateProfiles);
      const unsubInter = cloudService.subscribe('interviews', setInterviews);
      const unsubAcc = cloudService.subscribe('accounts', d => { if (d.length > 0) setAccounts(d); else setAccounts(DEFAULT_ACCOUNTS); });
      const unsubTrans = cloudService.subscribe('transactions', setTransactions);
      const unsubMods = cloudService.subscribe('trainingModules', setTrainingModules);
      const unsubTops = cloudService.subscribe('trainingTopics', setTrainingTopics);
      const unsubLogs = cloudService.subscribe('trainingLogs', setTrainingLogs);
      const unsubIntM = cloudService.subscribe('interviewModules', setInterviewModules);
      const unsubIntQ = cloudService.subscribe('interviewQuestions', setInterviewQuestions);
      const unsubAct = cloudService.subscribe('activityLogs', setActivityLogs);

      return () => {
        unsubUsers(); unsubCand(); unsubProf(); unsubInter(); unsubAcc(); unsubTrans();
        unsubMods(); unsubTops(); unsubLogs(); unsubIntM(); unsubIntQ(); unsubAct();
      };
    } else {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const data = JSON.parse(stored);
          setUsers(data.users || [DEFAULT_ADMIN]);
          setCandidates(data.candidates || []);
          setCandidateProfiles(data.candidateProfiles || []);
          setInterviews(data.interviews || []);
          setAccounts(data.accounts || DEFAULT_ACCOUNTS);
          setTransactions(data.transactions || []);
          setTrainingModules(data.trainingModules || []);
          setTrainingTopics(data.trainingTopics || []);
          setTrainingLogs(data.trainingLogs || []);
          setInterviewModules(data.interviewModules || []);
          setInterviewQuestions(data.interviewQuestions || []);
          setActivityLogs(data.activityLogs || []);
          setCandidateStatuses(data.candidateStatuses || DEFAULT_STATUSES);
        }
      } catch (e) { }
      setDataLoaded(true);
      setIsInitialized(true);
    }
  }, [isCloudEnabled]);

  useEffect(() => {
    if (dataLoaded && !user) {
      const sessionStr = localStorage.getItem(SESSION_KEY);
      if (sessionStr) {
        try {
          const session = JSON.parse(sessionStr);
          if (Date.now() - session.timestamp < SESSION_TIMEOUT_MS) {
            const u = users.find(x => x.id === session.userId);
            if (u) setUser(u);
          }
        } catch (e) { }
      }
    }
  }, [dataLoaded, users]);

  useEffect(() => {
    if (!isCloudEnabled && dataLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        users, candidates, candidateProfiles, interviews, accounts, transactions,
        trainingModules, trainingTopics, trainingLogs, interviewModules, interviewQuestions,
        activityLogs, candidateStatuses
      }));
    }
  }, [users, candidates, candidateProfiles, interviews, accounts, transactions, trainingModules, trainingTopics, trainingLogs, interviewModules, interviewQuestions, activityLogs, candidateStatuses, isCloudEnabled, dataLoaded]);

  const login = async (u?: string, p?: string) => {
    if (!u || !p) return { success: false, message: "Missing credentials" };
    const usr = users.find(x => x.username.toLowerCase() === u.toLowerCase());
    if (usr && usr.password === p) {
      setUser(usr);
      localStorage.setItem(SESSION_KEY, JSON.stringify({ userId: usr.id, timestamp: Date.now() }));
      logActivity('LOGIN', `User logged in`, 'User', usr.id);
      return { success: true };
    }
    return { success: false, message: "Invalid credentials" };
  };
  const logout = () => { setUser(null); localStorage.removeItem(SESSION_KEY); };

  const addUser = (u: User) => { setUsers(p => [...p, u]); if (isCloudEnabled) cloudService.saveItem('users', u); logActivity('CREATE', `User added: ${u.name}`, 'User', u.id); };
  const updateUser = (u: User) => { setUsers(p => p.map(x => x.id === u.id ? u : x)); if (isCloudEnabled) cloudService.updateItem('users', u.id, u); if (user?.id === u.id) setUser(u); logActivity('UPDATE', `User updated: ${u.name}`, 'User', u.id); };
  const deleteUser = (id: string) => { setUsers(p => p.filter(x => x.id !== id)); if (isCloudEnabled) cloudService.deleteItem('users', id); logActivity('DELETE', `User deleted`, 'User', id); };

  const addCandidate = (c: Candidate) => { setCandidates(p => [...p, c]); if (isCloudEnabled) cloudService.saveItem('candidates', c); logActivity('CREATE', `Candidate added: ${c.name}`, 'Candidate', c.id); };
  const updateCandidate = (c: Candidate) => { setCandidates(p => p.map(x => x.id === c.id ? c : x)); if (isCloudEnabled) cloudService.updateItem('candidates', c.id, c); };
  const deleteCandidate = (id: string) => { setCandidates(p => p.filter(x => x.id !== id)); if (isCloudEnabled) cloudService.deleteItem('candidates', id); logActivity('DELETE', `Candidate deleted`, 'Candidate', id); };

  const updateCandidateProfile = (profile: CandidateProfile) => {
    setCandidateProfiles(p => {
      const exists = p.find(x => x.candidateId === profile.candidateId);
      return exists ? p.map(x => x.candidateId === profile.candidateId ? profile : x) : [...p, profile];
    });
    if (isCloudEnabled) cloudService.saveItem('candidateProfiles', { ...profile, id: profile.candidateId });
  };

  const addInterview = (i: InterviewSchedule) => { setInterviews(p => [...p, i]); if (isCloudEnabled) cloudService.saveItem('interviews', i); };
  const updateInterview = (i: InterviewSchedule) => { setInterviews(p => p.map(x => x.id === i.id ? i : x)); if (isCloudEnabled) cloudService.updateItem('interviews', i.id, i); };
  const deleteInterview = (id: string) => { setInterviews(p => p.filter(x => x.id !== id)); if (isCloudEnabled) cloudService.deleteItem('interviews', id); };

  const addAccount = (a: Account) => { setAccounts(p => [...p, a]); if (isCloudEnabled) cloudService.saveItem('accounts', a); };
  const updateAccount = (a: Account) => { setAccounts(p => p.map(x => x.id === a.id ? a : x)); if (isCloudEnabled) cloudService.updateItem('accounts', a.id, a); };
  const deleteAccount = (id: string) => { setAccounts(p => p.filter(x => x.id !== id)); if (isCloudEnabled) cloudService.deleteItem('accounts', id); };

  const addTransaction = (t: Transaction) => { setTransactions(p => [...p, t]); if (isCloudEnabled) cloudService.saveItem('transactions', t); logActivity('CREATE', `${t.type} of ${t.amount}`, 'Transaction', t.id); };
  const updateTransaction = (t: Transaction) => { setTransactions(p => p.map(x => x.id === t.id ? t : x)); if (isCloudEnabled) cloudService.updateItem('transactions', t.id, t); };
  const deleteTransaction = (id: string) => { setTransactions(p => p.filter(x => x.id !== id)); if (isCloudEnabled) cloudService.deleteItem('transactions', id); };
  const lockTransaction = (id: string) => { const t = transactions.find(x => x.id === id); if (t) updateTransaction({ ...t, isLocked: true }); };

  const addTrainingModule = (m: TrainingModule) => { setTrainingModules(p => [...p, m]); if (isCloudEnabled) cloudService.saveItem('trainingModules', m); };
  const updateTrainingModule = (m: TrainingModule) => { setTrainingModules(p => p.map(x => x.id === m.id ? m : x)); if (isCloudEnabled) cloudService.updateItem('trainingModules', m.id, m); };
  const deleteTrainingModule = (id: string) => { setTrainingModules(p => p.filter(x => x.id !== id)); if (isCloudEnabled) cloudService.deleteItem('trainingModules', id); };

  const addTrainingTopic = (t: TrainingTopic) => { setTrainingTopics(p => [...p, t]); if (isCloudEnabled) cloudService.saveItem('trainingTopics', t); };
  const updateTrainingTopic = (t: TrainingTopic) => { setTrainingTopics(p => p.map(x => x.id === t.id ? t : x)); if (isCloudEnabled) cloudService.updateItem('trainingTopics', t.id, t); };
  const deleteTrainingTopic = (id: string) => { setTrainingTopics(p => p.filter(x => x.id !== id)); if (isCloudEnabled) cloudService.deleteItem('trainingTopics', id); };

  const addTrainingLog = (l: TrainingLog) => { setTrainingLogs(p => [...p, l]); if (isCloudEnabled) cloudService.saveItem('trainingLogs', l); };
  const batchUpdateTrainingLogs = (logs: TrainingLog[]) => {
    setTrainingLogs(prev => {
      const newLogs = [...prev];
      logs.forEach(l => {
        const idx = newLogs.findIndex(x => x.id === l.id);
        if (idx >= 0) newLogs[idx] = l; else newLogs.push(l);
      });
      return newLogs;
    });
    if (isCloudEnabled) cloudService.uploadBatch('trainingLogs', logs);
  };

  const addInterviewModule = (m: InterviewModule) => { setInterviewModules(p => [...p, m]); if (isCloudEnabled) cloudService.saveItem('interviewModules', m); };
  const updateInterviewModule = (m: InterviewModule) => { setInterviewModules(p => p.map(x => x.id === m.id ? m : x)); if (isCloudEnabled) cloudService.updateItem('interviewModules', m.id, m); };
  const deleteInterviewModule = (id: string) => { setInterviewModules(p => p.filter(x => x.id !== id)); if (isCloudEnabled) cloudService.deleteItem('interviewModules', id); };

  const addInterviewQuestion = (q: InterviewQuestion) => { setInterviewQuestions(p => [...p, q]); if (isCloudEnabled) cloudService.saveItem('interviewQuestions', q); };
  const updateInterviewQuestion = (q: InterviewQuestion) => { setInterviewQuestions(p => p.map(x => x.id === q.id ? q : x)); if (isCloudEnabled) cloudService.updateItem('interviewQuestions', q.id, q); };
  const deleteInterviewQuestion = (id: string) => { setInterviewQuestions(p => p.filter(x => x.id !== id)); if (isCloudEnabled) cloudService.deleteItem('interviewQuestions', id); };

  const clearActivityLogs = () => { setActivityLogs([]); if (isCloudEnabled) showToast("Cloud logs must be cleared manually in console.", "info"); };
  const addCandidateStatus = (s: string) => { if (!candidateStatuses.includes(s)) setCandidateStatuses(p => [...p, s]); };

  const markAgreementSent = (id: string) => {
    const c = candidates.find(cand => cand.id === id);
    if (c) updateCandidate({ ...c, agreementSentDate: new Date().toISOString() });
  };

  const markAgreementAccepted = (id: string) => {
    const c = candidates.find(cand => cand.id === id);
    if (c) updateCandidate({ ...c, agreementAcceptedDate: new Date().toISOString(), agreementRejectedDate: undefined, agreementRejectionReason: undefined });
  };

  const markAgreementRejected = (id: string, reason: string) => {
    const c = candidates.find(cand => cand.id === id);
    if (c) updateCandidate({ ...c, agreementRejectedDate: new Date().toISOString(), agreementRejectionReason: reason, agreementAcceptedDate: undefined });
  };

  const addPasswordResetRequest = (u: string) => setPasswordResetRequests(p => [...p, { id: utils.generateId(), username: u, requestDate: new Date().toISOString(), status: 'pending' }]);
  const resolvePasswordResetRequest = (id: string) => setPasswordResetRequests(p => p.filter(x => x.id !== id));

  const getEntityName = (id: string, type: any) => {
    if (type === 'Account') return accounts.find(a => a.id === id)?.name || 'Unknown';
    if (type === 'Candidate') return candidates.find(c => c.id === id)?.name || 'Unknown';
    return users.find(u => u.id === id)?.name || 'Unknown';
  };
  const getEntityBalance = (id: string, type: any) => {
    const acc = accounts.find(a => a.id === id);
    return utils.calculateEntityBalance(id, type, transactions, acc?.openingBalance || 0, acc?.type);
  };

  const exportData = () => {
    utils.downloadJSON({
      users,
      candidates,
      candidateProfiles,
      interviews,
      accounts,
      transactions,
      trainingModules,
      trainingTopics,
      trainingLogs,
      interviewModules,
      interviewQuestions,
      activityLogs,
      candidateStatuses
    }, `SPR_Backup_${new Date().toISOString().split('T')[0]}.json`);
  };

  const exportFullExcel = () => {
    // 1. Candidate List Sheet
    const candidateData = candidates.map(c => {
      const paid = transactions
        .filter(t => t.fromEntityId === c.id && t.type === TransactionType.Income)
        .reduce((sum, t) => sum + t.amount, 0) -
        transactions
          .filter(t => t.toEntityId === c.id && t.type === TransactionType.Refund)
          .reduce((sum, t) => sum + t.amount, 0);
      return {
        'Full Name': c.name,
        'Batch ID': c.batchId,
        'Email': c.email,
        'Phone': c.phone,
        'Agreed Amount': c.agreedAmount,
        'Paid Amount': paid,
        'Balance Due': c.agreedAmount - paid,
        'Status': c.status,
        'Active': c.isActive ? 'Yes' : 'No',
        'Joined Date': new Date(c.joinedDate).toLocaleDateString()
      };
    });

    // 2. Transactions Sheet
    const txData = [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(t => ({
      'Date': new Date(t.date).toLocaleDateString(),
      'Type': t.type,
      'Description': t.description,
      'From (Source)': getEntityName(t.fromEntityId, t.fromEntityType),
      'To (Dest)': getEntityName(t.toEntityId, t.toEntityType),
      'Amount': t.amount,
      'Locked': t.isLocked ? 'Yes' : 'No'
    }));

    // 3. Sundry Debtors Sheet
    const debtorsData = accounts
      .filter(a => a.type === AccountType.Debtor)
      .map(a => {
        const bal = getEntityBalance(a.id, 'Account');
        return { 'Entity': a.name, 'Type': 'Sundry Debtor', 'Amount Owed': bal > 0 ? bal : 0 };
      }).filter(i => i['Amount Owed'] > 0);

    // 4. Debts & Creditors Sheet
    const creditorsData = accounts
      .filter(a => a.type === AccountType.Creditor || a.type === AccountType.Salary || a.type === AccountType.Expense)
      .map(a => {
        const bal = getEntityBalance(a.id, 'Account');
        return { 'Entity': a.name, 'Type': a.type, 'Amount Payable (Debt)': bal < 0 ? Math.abs(bal) : 0 };
      }).filter(i => i['Amount Payable (Debt)'] > 0);

    // 5. Balance Sheet Snapshot
    const totalAssets = candidateData.reduce((s, c) => s + (c['Balance Due'] > 0 ? c['Balance Due'] : 0), 0) +
      accounts.filter(a => [AccountType.Bank, AccountType.Cash, AccountType.Debtor].includes(a.type))
        .reduce((s, a) => s + Math.max(0, getEntityBalance(a.id, 'Account')), 0);
    const totalLiabs = creditorsData.reduce((s, c) => s + c['Amount Payable (Debt)'], 0);

    const balanceSheetData = [
      { 'Component': 'Current Assets (Cash/Bank)', 'Value': accounts.filter(a => [AccountType.Cash, AccountType.Bank].includes(a.type)).reduce((s, a) => s + getEntityBalance(a.id, 'Account'), 0) },
      { 'Component': 'Accounts Receivable (Candidates)', 'Value': candidateData.reduce((s, c) => s + (c['Balance Due'] > 0 ? c['Balance Due'] : 0), 0) },
      { 'Component': 'Other Receivables (Sundry Debtors)', 'Value': debtorsData.reduce((s, a) => s + a['Amount Owed'], 0) },
      { 'Component': '--- TOTAL ASSETS ---', 'Value': totalAssets },
      { 'Component': '', 'Value': '' },
      { 'Component': 'Current Liabilities (Debts/Creditors/Salary)', 'Value': totalLiabs },
      { 'Component': 'Owner Equity (Calculated)', 'Value': totalAssets - totalLiabs },
      { 'Component': '--- TOTAL LIABILITIES & EQUITY ---', 'Value': totalAssets }
    ];

    // 6. P&L Sheet (Filtered for true revenue)
    const revenueTxs = transactions.filter(t => {
      if (t.type !== TransactionType.Income) return false;
      if (t.fromEntityType === 'Candidate') return true;
      if (t.fromEntityType === 'Account') {
        const acc = accounts.find(a => a.id === t.fromEntityId);
        return acc?.type === AccountType.Income;
      }
      return false;
    });

    const totalRevenue = revenueTxs.reduce((s, t) => s + t.amount, 0);
    const totalExpense = transactions.filter(t => t.type === TransactionType.Payment).reduce((s, t) => s + t.amount, 0);

    const profitAndLossData = [
      { 'Particulars': 'Operating Revenue (Training Fees)', 'Amount': totalRevenue },
      { 'Particulars': 'Total Revenue (A)', 'Amount': totalRevenue },
      { 'Particulars': '', 'Amount': '' },
      { 'Particulars': 'Operating Expenses (Rent/Admin/Salaries)', 'Amount': totalExpense },
      { 'Particulars': 'Total Expenses (B)', 'Amount': totalExpense },
      { 'Particulars': '', 'Amount': '' },
      { 'Particulars': 'NET OPERATING PROFIT (A - B)', 'Amount': totalRevenue - totalExpense }
    ];

    utils.downloadMultiSheetExcel([
      { name: 'Candidates', data: candidateData },
      { name: 'Transactions', data: txData },
      { name: 'Sundry Debtors', data: debtorsData },
      { name: 'Debts and Creditors', data: creditorsData },
      { name: 'Balance Sheet', data: balanceSheetData },
      { name: 'Profit and Loss', data: profitAndLossData }
    ], `SPR_Techforge_Full_Report_${new Date().toISOString().split('T')[0]}.xls`);

    showToast('Multi-sheet report generated successfully');
  };

  const importDatabase = async (json: any) => {
    try {
      if (json.users) setUsers(json.users);
      if (json.candidates) setCandidates(json.candidates);
      if (json.candidateProfiles) setCandidateProfiles(json.candidateProfiles);
      if (json.interviews) setInterviews(json.interviews);
      if (json.accounts) setAccounts(json.accounts);
      if (json.transactions) setTransactions(json.transactions);
      if (json.trainingModules) setTrainingModules(json.trainingModules);
      if (json.trainingTopics) setTrainingTopics(json.trainingTopics);
      if (json.trainingLogs) setTrainingLogs(json.trainingLogs);
      if (json.interviewModules) setInterviewModules(json.interviewModules);
      if (json.interviewQuestions) setInterviewQuestions(json.interviewQuestions);
      if (json.activityLogs) setActivityLogs(json.activityLogs);
      if (json.candidateStatuses) setCandidateStatuses(json.candidateStatuses);

      if (isCloudEnabled) {
        showToast("Restoring to Cloud... please wait", "info");
        const collections = [
          { name: 'users', data: json.users },
          { name: 'candidates', data: json.candidates },
          { name: 'candidateProfiles', data: json.candidateProfiles },
          { name: 'interviews', data: json.interviews },
          { name: 'accounts', data: json.accounts },
          { name: 'transactions', data: json.transactions },
          { name: 'trainingModules', data: json.trainingModules },
          { name: 'trainingTopics', data: json.trainingTopics },
          { name: 'trainingLogs', data: json.trainingLogs },
          { name: 'interviewModules', data: json.interviewModules },
          { name: 'interviewQuestions', data: json.interviewQuestions },
          { name: 'activityLogs', data: json.activityLogs },
        ];

        for (const col of collections) {
          if (col.data && col.data.length > 0) {
            await cloudService.uploadBatch(col.name, col.data);
          }
        }
      }

      showToast("Database restored successfully!", "success");
      logActivity('RESTORE', 'Database restored from backup file', 'System');
    } catch (err) {
      console.error(err);
      showToast("Restore failed: Invalid data format", "error");
    }
  };

  const factoryReset = () => {
    if (window.confirm("CRITICAL: This will delete ALL local data and reset the app to factory defaults. Are you sure?")) {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(SESSION_KEY);
      window.location.reload();
    }
  };

  const syncLocalToCloud = async () => {
    if (!isCloudEnabled) return;
    try {
      showToast("Syncing all local data to cloud...", "info");
      await importDatabase({ users, candidates, candidateProfiles, interviews, accounts, transactions, trainingModules, trainingTopics, trainingLogs, interviewModules, interviewQuestions, activityLogs, candidateStatuses });
    } catch (e) {
      showToast("Sync failed", "error");
    }
  };

  return (
    <AppContext.Provider value={{
      user, login, logout, isInitialized, toast, showToast,
      users, addUser, updateUser, deleteUser,
      candidates, addCandidate, updateCandidate, deleteCandidate,
      candidateProfiles, updateCandidateProfile,
      interviews, addInterview, updateInterview, deleteInterview,
      accounts, addAccount, updateAccount, deleteAccount,
      transactions, addTransaction, updateTransaction, deleteTransaction, lockTransaction,
      trainingModules, addTrainingModule, updateTrainingModule, deleteTrainingModule,
      trainingTopics, addTrainingTopic, updateTrainingTopic, deleteTrainingTopic,
      trainingLogs, addTrainingLog, batchUpdateTrainingLogs,
      interviewModules, addInterviewModule, updateInterviewModule, deleteInterviewModule,
      interviewQuestions, addInterviewQuestion, updateInterviewQuestion, deleteInterviewQuestion,
      candidateStatuses, addCandidateStatus, passwordResetRequests, addPasswordResetRequest, resolvePasswordResetRequest,
      activityLogs, clearActivityLogs,
      markAgreementSent, markAgreementAccepted, markAgreementRejected, getEntityName, getEntityBalance,
      exportData, exportFullExcel, importDatabase, factoryReset, isCloudEnabled, syncLocalToCloud, cloudError
    }}>
      {children}
    </AppContext.Provider>
  );
};