

export enum CandidateStatus {
  Training = 'Training',
  ReadyForInterview = 'Ready for Interview',
  Placed = 'Placed',
  Discontinued = 'Discontinued'
}

export enum AccountType {
  Bank = 'Bank',
  Cash = 'Cash',
  Debtor = 'Debtor',
  Creditor = 'Creditor',
  Expense = 'Expense',
  Salary = 'Salary',
  Income = 'Income',
  Equity = 'Equity'
}

export enum TransactionType {
  Income = 'Income',
  Expense = 'Expense',
  Transfer = 'Transfer',
  Refund = 'Refund'
}

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

export interface User {
  id: string;
  name: string;
  username: string;
  password?: string;
  isPasswordChanged?: boolean;
  email?: string;
  role: 'admin' | 'staff' | 'candidate';
  modules: string[];
  linkedCandidateId?: string;
  authProvider?: 'local' | 'google';
}

export interface PasswordResetRequest {
  id: string;
  username: string;
  requestDate: string;
  status: 'pending' | 'resolved';
}

// Detailed Info for Candidate (Filled after login)
export interface CandidateProfile {
  candidateId: string;
  dob?: string;
  gender?: string;
  nationality?: string;
  permanentAddress?: string;
  currentAddress?: string;
  
  // Education
  degree?: string;
  university?: string;
  passingYear?: string;
  percentage?: string;

  // Previous Employment
  hasExperience?: boolean;
  lastCompany?: string;
  designation?: string;
  yearsOfExperience?: number;
  skills?: string;
}

export interface Candidate {
  id: string;
  name: string;
  batchId: string;
  email: string;
  phone: string;
  alternatePhone?: string; 
  address?: string; 
  referredBy?: string; 
  agreementText?: string; 
  
  agreementSentDate?: string;
  agreementAcceptedDate?: string;

  agreedAmount: number;
  paidAmount?: number;
  status: string; 
  
  placedCompany?: string;
  packageDetails?: string; 

  workSupportStatus?: 'None' | 'Active' | 'Ended';
  workSupportStartDate?: string;
  workSupportEndDate?: string;
  workSupportMonthlyAmount?: number;

  isActive: boolean; 
  joinedDate: string;
  notes?: string;
  
  resume?: string; // Base64
  resumeName?: string;
}

export interface InterviewSchedule {
  id: string;
  candidateId: string;
  date: string;
  time: string;
  companyName: string;
  interviewType: 'F2F' | 'Zoom' | 'Teams' | 'Telephonic';
  round: string; // e.g. "L1", "L2", "HR"
  supportPerson?: string; // Who is supporting
  status: 'Scheduled' | 'Completed' | 'Rescheduled' | 'Cancelled';
  outcome?: 'Selected' | 'Rejected' | 'Pending';
  notes?: string;
}

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  subType?: string; 
  isSystem?: boolean; 
  openingBalance: number; 
  description?: string;
  recurringAmount?: number;
  recurringStartDate?: string;
  recurringEndDate?: string;
}

export interface Transaction {
  id: string;
  date: string;
  type: TransactionType;
  amount: number;
  fromEntityId: string; 
  fromEntityType: 'Account' | 'Candidate' | 'Staff';
  toEntityId: string;
  toEntityType: 'Account' | 'Candidate' | 'Staff';
  description: string;
  isLocked: boolean;
  category?: string; 
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  actorId: string;
  actorName: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'RESTORE' | 'OTHER';
  entityType: string;
  entityId?: string;
  description: string;
}

export interface TrainingModule {
  id: string;
  title: string;
  description?: string;
  order: number;
}

export interface TrainingTopic {
  id: string;
  moduleId: string;
  title: string;
  description?: string;
  estimatedHours: number;
}

export interface TrainingLog {
  id: string;
  candidateId: string;
  date: string;
  topicId: string;
  timeSpentMinutes: number;
  assignmentStatus: 'Pending' | 'Completed' | 'N/A';
  attendanceStatus: 'Present' | 'Absent' | 'No Class';
  notes?: string;
}

export interface InterviewModule {
  id: string;
  title: string;
  color: string;
  order: number;
}

export interface InterviewQuestion {
  id: string;
  moduleId: string;
  question: string;
  order: number;
}

export interface AppState {
  currentUser: User | null;
  users: User[];
  candidates: Candidate[];
  candidateProfiles: CandidateProfile[];
  accounts: Account[];
  transactions: Transaction[];
  candidateStatuses: string[];
  passwordResetRequests: PasswordResetRequest[];
  activityLogs: ActivityLog[];
  trainingModules: TrainingModule[];
  trainingTopics: TrainingTopic[];
  trainingLogs: TrainingLog[];
  interviewModules: InterviewModule[];
  interviewQuestions: InterviewQuestion[];
  interviews: InterviewSchedule[];
}