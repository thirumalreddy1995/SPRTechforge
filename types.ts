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
  Equity = 'Equity',
  FixedAsset = 'Fixed Asset',
  CurrentAsset = 'Current Asset',
  Loan = 'Loan',
  Tax = 'Tax',
  Capital = 'Capital'
}

export enum TransactionType {
  Income = 'Income',
  Payment = 'Payment',
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
  phone?: string;
  address?: string;
  role: 'admin' | 'staff' | 'candidate';
  modules: string[];
  linkedCandidateId?: string;
  authProvider?: 'local' | 'google';
  // G-06: master capability is a flag on the user record, not a hardcoded username
  // comparison. Exactly one user should carry isMaster=true at a time. Server-side
  // enforcement lands with G-02 Firestore rules; the bootstrap admin is patched at
  // startup if the flag is missing.
  isMaster?: boolean;
}

// AuditEvent scaffold. Full pipeline (rate limits, full Audit page, login-failed logging)
// lands in G-07. Single unified `events` collection with a `category` discriminator —
// see CODE_REVIEW_FINDINGS.md "G-07 collection design — single collection".
export type AuditEventCategory = 'security' | 'business';
export type AuditEventType =
  | 'BOOTSTRAP_ISMASTER_PATCH'
  | 'LOGIN_FAILED'
  | 'LOGIN_RATE_LIMITED'
  | 'PERMISSION_DENIED';

export interface AuditEvent {
  id: string;
  timestamp: string;
  category: AuditEventCategory;
  eventType: AuditEventType;
  actorId?: string;
  actorUsername?: string;
  targetId?: string;
  reason?: string;
  userAgent?: string;
  payload?: Record<string, unknown>;
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
  agreementRejectedDate?: string;
  agreementRejectionReason?: string;

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

export type InterviewStatus =
  | 'pending_confirmation'  // candidate-scheduled, awaiting admin confirmation
  | 'Scheduled'             // confirmed and active
  | 'Attended'              // interview took place
  | 'No-show'               // candidate did not appear
  | 'Cleared'               // passed / selected
  | 'Rejected'              // failed / rejected
  | 'Completed'             // legacy — treated as Attended
  | 'Rescheduled'
  | 'Cancelled';

export interface InterviewStatusChange {
  status: string;
  changedBy: string;       // userId
  changedByName: string;
  changedAt: string;       // ISO timestamp
  previousStatus: string;
}

export interface InterviewSchedule {
  id: string;
  candidateId: string;
  date: string;
  time: string;
  endTime?: string;                              // for conflict-overlap detection
  companyName: string;
  interviewType: 'F2F' | 'Zoom' | 'Teams' | 'Telephonic';
  round: string;
  supportPerson?: string;
  interviewerName?: string;                      // assigned interviewer display name
  status: InterviewStatus;
  outcome?: 'Selected' | 'Rejected' | 'Pending';
  notes?: string;
  scheduledBy?: string;                          // userId of who created it
  scheduledByRole?: 'admin' | 'staff' | 'candidate';
  scheduledAt?: string;                          // ISO creation timestamp
  statusHistory?: InterviewStatusChange[];       // full audit trail
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
  recurringDueDay?: number; // Day of the month (1-31)
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

export type EnquiryStatus = 'Enquiry' | 'Follow-Up' | 'Joined' | 'Not Interested';

export interface EnquiryNote {
  id: string;
  date: string;
  note: string;
  addedBy: string;
}

export interface Enquiry {
  id: string;
  name: string;
  phone: string;
  alternatePhone?: string;
  email?: string;
  address?: string;
  committedAmount?: number;
  expectedJoiningDate?: string;
  batch?: string;
  status: EnquiryStatus;
  enquiryDate: string;
  notes: EnquiryNote[];
  isMerged?: boolean;
  mergedCandidateId?: string;
  mergedDate?: string;
}

export type WebLeadStatus = 'New' | 'In Progress' | 'Responded' | 'Closed';

export interface WebLead {
  id: string;
  name: string;
  phone: string;
  email?: string;
  company?: string;
  service?: string;    // service they're enquiring about
  message?: string;
  submittedAt: string; // ISO string
  isRead: boolean;
  status: WebLeadStatus;
  internalNote?: string;
}

export interface InterviewPrepResponse {
  questionId: string;
  question: string;
  category: string;
  modelAnswer: string;
  spokenAnswer: string;
  score: number;
  feedback: string;
  missedKeywords: string[];
}

export interface InterviewPrepSession {
  id: string;
  candidateId: string;
  candidateName: string;
  date: string;
  totalQuestions: number;
  responses: InterviewPrepResponse[];
  overallScore: number;
  grade: string;
  improvementAreas: string[];
  strongAreas: string[];
  speedLabel?: string;   // e.g. "Normal", "Slow"
  speedRate?: number;    // TTS rate used
}

export interface ChatAttachment {
  url: string;
  name: string;
  type: string;
  size: number;
}

export type ChatType = 'dm' | 'announcement';

export interface Chat {
  id: string;
  type: ChatType;
  name?: string;
  participants: string[];
  createdAt: string;
  createdBy: string;
  lastMessageText?: string;
  lastMessageAt?: string;
  lastSenderId?: string;
}

export interface ChatMessage {
  id: string;
  chatId: string;
  senderId: string;
  senderName: string;
  text: string;
  attachments?: ChatAttachment[];
  callRoomId?: string;
  callStartedAt?: string;
  timestamp: string;
  readBy: string[];
}

export interface EmailAttachment {
  url: string;
  name: string;
  mimeType: string;
  size: number;
}

export type EmailDirection = 'inbound' | 'outbound';

export interface EmailMessage {
  id: string;             // Gmail message id for inbound, generated for outbound
  direction: EmailDirection;
  from: string;
  to: string[];
  cc?: string[];
  subject: string;
  body: string;
  isHtml?: boolean;
  snippet?: string;
  attachments?: EmailAttachment[];
  date: string;           // ISO
  threadId?: string;
  isRead?: boolean;
  sentByUserId?: string;
  sentByUserName?: string;
}

export type NotificationType = 'chat' | 'announcement' | 'meeting' | 'email' | 'system';

// In-app notification event. Written to the `notifications` collection by the
// action that triggers it (chat send, meeting create, ...), delivered to every
// client through the existing real-time Firestore subscription, surfaced in
// the header bell (components/NotificationBell.tsx).
export interface AppNotification {
  id: string;
  /** Target user id, or 'all' for a broadcast visible to everyone. */
  recipientId: string;
  type: NotificationType;
  title: string;
  body?: string;
  /** In-app route to open when the notification is clicked. */
  link?: string;
  /** Who triggered it — actors never see their own notifications as unread. */
  actorId?: string;
  createdAt: string; // ISO
  readBy: string[];
}

export type CallInvitationStatus = 'ringing' | 'accepted' | 'declined' | 'ended' | 'missed';

export interface CallInvitation {
  id: string;
  callerId: string;
  callerName: string;
  calleeId: string;
  calleeName?: string;
  chatId?: string;
  roomId: string;
  status: CallInvitationStatus;
  createdAt: string;
  respondedAt?: string;
}

export type MeetingType = 'meeting' | 'class' | 'other';
export type MeetingStatus = 'scheduled' | 'cancelled' | 'completed';
export type RsvpStatus = 'pending' | 'accepted' | 'declined' | 'tentative';

export interface MeetingParticipant {
  userId: string;
  rsvp: RsvpStatus;
  respondedAt?: string;
}

export interface Meeting {
  id: string;
  title: string;
  description?: string;
  meetingType: MeetingType;
  organizerId: string;
  organizerName: string;
  participants: MeetingParticipant[];
  startTime: string; // ISO
  endTime: string;   // ISO
  location?: string;
  linkedChatId?: string;
  status: MeetingStatus;
  createdAt: string;
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
  enquiries: Enquiry[];
  webLeads: WebLead[];
  interviewPrepSessions: InterviewPrepSession[];
}