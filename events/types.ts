// Events module types. Self-contained (like seminar/types.ts) — nothing here
// leaks into the root types.ts. Collections are prefixed events_ (see
// services/eventsDb.ts).

export type EventType = 'webinar' | 'demo_class' | 'seminar' | 'workshop' | 'other';
export type EventMode = 'online' | 'offline' | 'hybrid';

/** Stored status. 'live' / 'completed' are COMPUTED from start/end times (see lifecycleOf). */
export type EventStatus = 'draft' | 'published' | 'cancelled';

/** Computed phase of a published event. */
export type EventLifecycle = 'upcoming' | 'live' | 'past';

export type RegistrationStatus = 'confirmed' | 'waitlisted' | 'cancelled' | 'attended' | 'no_show';
export type FollowUpStatus = 'none' | 'contacted' | 'interested' | 'not_interested' | 'converted';
export type AttendeeCurrentStatus = 'student' | 'fresher' | 'working' | 'career_break';

export interface EventSpeaker {
  name: string;
  title: string;   // e.g. "Senior QA Lead, 12+ yrs"
}

export interface EventAgendaItem {
  time: string;    // free text, e.g. "11:00 AM"
  title: string;
}

export interface EventCustomQuestion {
  id: string;
  label: string;
  fieldType: 'text' | 'select';
  required: boolean;
  options: string[]; // only for select
}

/** Which optional standard fields the registration form shows. */
export interface EventCollectFields {
  city: boolean;
  qualification: boolean;
  passingYear: boolean;
  currentStatus: boolean;
  howDidYouHear: boolean;
}

/**
 * Denormalized seat counters on the event doc — the minimum the public page
 * and the capacity transaction need. Attended / no-show / cancelled counts
 * are derived from the registrations collection in the admin UI instead of
 * being double-tracked here.
 */
export interface EventCounters {
  /** Seat-holders: registrations in confirmed, attended, or no_show status. */
  confirmed: number;
  waitlisted: number;
}

export interface EventRecap {
  recordingUrl: string;
  finalAttendeeCount: number;
  photoUrls: string[];
  notes: string;
}

export interface SprEvent {
  id: string;
  /** URL slug — assigned on first save, stable forever after publish. */
  slug: string;
  title: string;
  type: EventType;
  shortDescription: string;
  fullDescription: string;
  whatYouWillLearn: string[];
  whoShouldAttend: string[];
  prerequisites: string[];

  bannerPath: string; // Firebase Storage path ('' when banner is inline)
  bannerUrl: string;  // https:// or data: URL
  speakers: EventSpeaker[];
  agenda: EventAgendaItem[];

  mode: EventMode;
  platform: string;     // "Zoom", "Google Meet" — public, join URL is NOT public
  venueName: string;
  venueAddress: string;
  venueMapUrl: string;

  startAt: string;              // UTC ISO
  endAt: string;                // UTC ISO
  timezone: string;             // always 'Asia/Kolkata' today
  registrationClosesAt: string; // UTC ISO; '' = closes at event start

  capacity: number;             // 0 = unlimited
  waitlistEnabled: boolean;
  collectFields: EventCollectFields;
  customQuestions: EventCustomQuestion[];

  status: EventStatus;
  registrationClosedEarly: boolean;
  publishedAt?: string;
  publishedBy?: string;
  cancelledAt?: string;
  cancelReason?: string;

  counters: EventCounters;
  /** Monotonic sequence feeding registration codes (SPR-WEB-0042). Transaction-only. */
  registrationSeq: number;

  recap: EventRecap;

  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
}

/**
 * Join secrets live apart from the public event doc so the public page never
 * loads them. Shown only on the post-registration success page and in the
 * confirmation/reminder emails.
 */
export interface EventPrivateDetails {
  id: string; // same id as the event
  joinUrl: string;
  meetingId: string;
  passcode: string;
}

export interface ConsentStamp {
  given: boolean;
  at: string; // ISO timestamp when the box was ticked (or '' if not given)
}

export interface EventRegistration {
  id: string;
  eventId: string;
  eventSlug: string;
  eventTitle: string; // denormalized for exports & candidate notes
  registrationCode: string;

  fullName: string;
  email: string;   // normalized lowercase
  mobile: string;  // +91-normalized
  city: string;
  qualification: string;
  passingYear: string;
  currentStatus: AttendeeCurrentStatus | '';
  howDidYouHear: string;
  customAnswers: Record<string, string>;

  // DPDP: three separate consents, unticked by default, each timestamped.
  consentTerms: ConsentStamp;
  consentEmail: ConsentStamp;
  consentWhatsApp: ConsentStamp;

  status: RegistrationStatus;
  utm: { source: string; medium: string; campaign: string };
  registeredAt: string;
  remindersSent: { kind: string; at: string }[];

  adminNotes: string;
  followUpStatus: FollowUpStatus;
  convertedToCandidateId?: string;
  attendedAt?: string;
}
