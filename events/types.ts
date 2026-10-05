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
  /** Optional YouTube link — embedded at the top of the public page so people see what they'll learn. Absent on older events. */
  videoUrl?: string;
  speakers: EventSpeaker[];
  agenda: EventAgendaItem[];

  mode: EventMode;
  platform: string;     // "Zoom", "Google Meet" — public, join URL is NOT public
  venueName: string;
  venueAddress: string;
  venueMapUrl: string;
  /** Public WhatsApp group/community invite (https://chat.whatsapp.com/…). Shown after registration and in emails. '' = use the site-wide community link. */
  whatsappGroupUrl?: string;

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

  /** Admin-edited invitation email (Invite tab). Absent = the built-in default. */
  inviteTemplate?: EventInviteTemplate;
  /** Admin-edited post-event follow-up email (Invite tab, "Follow-up survey" mode). Absent = the built-in default. */
  followupTemplate?: EventInviteTemplate;

  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
}

/**
 * One person on the event's invite list (uploaded from Excel/CSV on the
 * admin "Invite" tab). Collection events_invites. Whether they went on to
 * register is derived in the UI by matching email/mobile against
 * events_registrations — never double-tracked here.
 */
export type InviteStatus = 'pending' | 'sent' | 'failed' | 'no_email';

export interface EventInvite {
  id: string;
  eventId: string;
  name: string;
  email: string;   // normalized lowercase; '' when the row had only a mobile number
  mobile: string;  // E.164 or ''
  status: InviteStatus;
  /** How many invitation emails were sent to this person (resends included). */
  sentCount: number;
  sentAt?: string;
  lastError?: string;
  /** File the row came from, for the admin's reference. */
  source: string;
  createdAt: string;
  createdBy: string;
}

/**
 * The editable parts of the invitation email. Plain text with {{placeholders}}
 * and **bold**; the banner, facts box, button and footer are laid out by the
 * template in events/lib/emails.ts.
 */
export interface EventInviteTemplate {
  subject: string;
  headline: string;
  message: string;
  buttonLabel: string;
  closing: string;
  includeHighlights: boolean;
  includeAgenda: boolean;
  /**
   * Registration link to put in the email instead of this event's page on the
   * current site — e.g. the production link when the campaign is run from QA.
   * '' = this site's own page. ?ref=email is appended either way.
   * For the follow-up survey email this is the survey page link instead.
   */
  linkOverride?: string;
  /** Follow-up survey only: how the next session is described, e.g. "Saturday 10 Oct, 7:00 PM IST". */
  nextSessionLabel?: string;
}

/** Why someone did not join the live session (follow-up survey). */
export type FeedbackReason = 'link_mobile' | 'link_failed' | 'busy' | 'forgot' | 'no_details' | 'other';
export type CourseInterest = 'yes' | 'maybe' | 'no';
export type YesNoMaybe = 'yes' | 'no' | 'maybe';

/**
 * One post-event survey response. Collection events_feedback; one per
 * event + email (the document id is derived from them, so re-submitting
 * updates the earlier answer instead of duplicating it).
 */
export interface EventFeedback {
  id: string;
  eventId: string;
  eventSlug: string;
  eventTitle: string;
  name: string;
  email: string;    // normalized lowercase
  mobile: string;   // E.164 or ''
  /** Registration code when the email matched a registration, else ''. */
  registrationCode: string;
  joined: boolean;
  // joined = true
  rating: number;            // 1–5, 0 = not given
  liked: string[];           // what they liked most
  improve: string;           // free text
  // joined = false
  reason: FeedbackReason | '';
  reasonOther: string;
  nextSession: YesNoMaybe | '';
  wantRecording: boolean;
  // both
  courseInterest: CourseInterest | '';
  preferredMode: 'online' | 'offline' | 'either' | '';
  callTime: string;
  comments: string;
  submittedAt: string;
  updatedAt: string;
  source: string;            // 'email' when opened from the follow-up mail, else 'direct'
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

  // DPDP: consents are timestamped and unticked by default. The public form
  // shows ONE terms checkbox that covers event contact by email and WhatsApp,
  // so all three stamps are set together; the fields stay separate so older
  // registrations (three boxes) keep their exact record.
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
