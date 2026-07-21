// Seminar module — self-contained types.
// Firestore collections use the seminar_ prefix so the module can be removed
// cleanly (delete the seminar/ folder, the routes in App.tsx, the nav group in
// Layout.tsx, and the seminar_* collections in Firestore).

export type SeminarEmailStatus = 'pending' | 'sent' | 'failed';
export type SubjectVariant = 'A' | 'B';

export interface SeminarCandidate {
  id: string;
  fullName: string;
  email: string; // stored lowercase; '' when the row only had a phone
  phone: string; // E.164 (+91XXXXXXXXXX) or '' when invalid/missing
  city?: string;
  state?: string;
  gender?: string;
  qualification?: string;
  courseStream?: string;
  institution?: string;
  yearOfPassing?: string;
  totalExperience?: string;
  degreeGroup: string; // source sheet name, e.g. "B.Tech-BE"
  inviteToken: string; // unique URL token for the public registration page
  emailStatus: SeminarEmailStatus;
  subjectVariant?: SubjectVariant; // which A/B subject was used for the invite
  createdAt: string;
  updatedAt?: string;
}

export type SeminarRegistrationStatus = 'registered' | 'declined';
export type SeminarPreferredMode = 'online' | 'in_person';

export interface SeminarRegistration {
  id: string;
  candidateId: string;
  status: SeminarRegistrationStatus;
  preferredMode: SeminarPreferredMode;
  registeredAt: string;
}

export interface SeminarQuestion {
  id: string;
  candidateId: string;
  questionText: string;
  createdAt: string;
  replyText?: string | null;
  repliedAt?: string | null;
  replyEmailed?: boolean;
}

export type SeminarChannel = 'email_invite' | 'email_reminder' | 'email_reply' | 'email_test';

export interface SeminarCampaignLog {
  id: string;
  candidateId: string; // '' for test sends
  channel: SeminarChannel;
  subjectVariant?: SubjectVariant;
  sentAt: string;
  error?: string | null; // null/undefined = success
}

export interface SeminarSettings {
  id: string; // always 'config' — single-row config document
  title: string;
  dateTime: string; // ISO local datetime, e.g. 2026-08-02T10:30
  venue: string; // physical venue; '' if online-only
  onlineLink: string; // meeting link; '' if in-person-only
  trainerName: string;
  seatsLimit: number; // 0 = unlimited
  showSeatsRemaining: boolean;
  bannerPath: string; // Firebase Storage path (for delete/replace)
  bannerUrl: string; // public download URL
  // Base URL used to build invite links in emails/WhatsApp. Defaults to the
  // current origin when empty (useful when composing from the deployed site).
  publicBaseUrl: string;
  // Campaign templates. Placeholders: {name} {city} {link} {date} {time} {venue} {trainer}
  emailSubjectA: string;
  emailSubjectB: string;
  emailBodyHtml: string;
  reminderSubject: string;
  reminderBodyHtml: string;
  whatsappTemplate: string;
  // Batch-send controls
  dailySendLimit: number; // default 90 (Gmail free tier is 100/day)
  sendDelayMs: number; // default 2000
  updatedAt?: string;
}

// Import pipeline types -------------------------------------------------------

export type SeminarField =
  | 'fullName' | 'email' | 'phone' | 'city' | 'state' | 'gender'
  | 'qualification' | 'courseStream' | 'institution' | 'yearOfPassing' | 'totalExperience';

export interface SheetMapping {
  sheetName: string;
  headers: string[];
  // header index per detected field; -1 = not mapped
  mapping: Record<SeminarField, number>;
  rows: any[][]; // data rows (header row excluded)
  included: boolean; // auto-false for sheets missing name + (email|phone)
  skipReason?: string;
}

export interface SheetImportReport {
  sheetName: string;
  imported: number; // brand new candidates
  merged: number; // matched an existing candidate (upsert)
  duplicatesInFile: number;
  invalidEmail: number;
  invalidPhone: number;
  skippedRows: number; // rows with no usable name or contact
}
