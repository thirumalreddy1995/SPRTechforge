// Firestore access for the events module. Follows the seminar module's
// service-layer pattern: prefixed collections, typed helpers, and the default
// Firebase app initialized by services/cloud.ts.
//
// The one hard rule here: EVERYTHING that touches counters or the
// registration sequence goes through a Firestore TRANSACTION, so two people
// registering at the same moment can never oversell the last seat or get the
// same registration code.

import { getApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  query,
  where,
  limit,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  runTransaction,
  writeBatch,
} from 'firebase/firestore';
import {
  EventCounters,
  EventPrivateDetails,
  EventRegistration,
  SprEvent,
} from '../types';
import { formatRegistrationCode } from '../lib/slug';
import { registrationWindow } from '../lib/validate';

export const EVENT_COLLECTIONS = {
  events: 'events_events',
  registrations: 'events_registrations',
  private: 'events_private',
} as const;

const db = () => getFirestore(getApp());
const stripUndefined = (data: any) => JSON.parse(JSON.stringify(data));

export const emptyCounters = (): EventCounters => ({ confirmed: 0, waitlisted: 0 });

export const emptyPrivateDetails = (id: string): EventPrivateDetails => ({ id, joinUrl: '', meetingId: '', passcode: '' });

// --- Admin subscriptions (real-time, like the rest of the app) ---

export const subscribeEvents = (cb: (items: SprEvent[]) => void, onError?: (e: any) => void) =>
  onSnapshot(
    collection(db(), EVENT_COLLECTIONS.events),
    snap => {
      const items: SprEvent[] = [];
      snap.forEach(d => items.push({ ...(d.data() as any), id: d.id }));
      cb(items);
    },
    err => { console.error('Events subscribe failed:', err); onError?.(err); },
  );

export const subscribeRegistrations = (cb: (items: EventRegistration[]) => void, onError?: (e: any) => void) =>
  onSnapshot(
    collection(db(), EVENT_COLLECTIONS.registrations),
    snap => {
      const items: EventRegistration[] = [];
      snap.forEach(d => items.push({ ...(d.data() as any), id: d.id }));
      cb(items);
    },
    err => { console.error('Registrations subscribe failed:', err); onError?.(err); },
  );

// --- Event CRUD (admin) ---

export const saveEvent = async (ev: SprEvent): Promise<void> => {
  await setDoc(doc(db(), EVENT_COLLECTIONS.events, ev.id), stripUndefined(ev));
};

export const updateEvent = async (id: string, data: Partial<SprEvent>): Promise<void> => {
  await updateDoc(doc(db(), EVENT_COLLECTIONS.events, id), stripUndefined(data));
};

/**
 * Permanent, cascading delete: the event, its private details, and EVERY
 * registration record for it. Master-only in the UI (see isMasterUser gates
 * in EventsAdminList / EventAdminDetail) — everyone else gets "Cancel event",
 * which keeps records and can notify registrants.
 */
export const deleteEvent = async (id: string): Promise<void> => {
  // Registrations first, so a failure midway can't leave orphaned records
  // pointing at a deleted event.
  const regs = await getDocs(query(collection(db(), EVENT_COLLECTIONS.registrations), where('eventId', '==', id)));
  const refs = regs.docs.map(d => d.ref);
  const CHUNK = 450; // Firestore caps a write batch at 500 ops
  for (let i = 0; i < refs.length; i += CHUNK) {
    const batch = writeBatch(db());
    refs.slice(i, i + CHUNK).forEach(r => batch.delete(r));
    await batch.commit();
  }
  await deleteDoc(doc(db(), EVENT_COLLECTIONS.private, id)).catch(() => { /* may not exist */ });
  await deleteDoc(doc(db(), EVENT_COLLECTIONS.events, id));
};

export const savePrivateDetails = async (priv: EventPrivateDetails): Promise<void> => {
  await setDoc(doc(db(), EVENT_COLLECTIONS.private, priv.id), stripUndefined(priv));
};

export const fetchPrivateDetails = async (eventId: string): Promise<EventPrivateDetails> => {
  const snap = await getDoc(doc(db(), EVENT_COLLECTIONS.private, eventId));
  return snap.exists() ? ({ ...(snap.data() as any), id: eventId }) : emptyPrivateDetails(eventId);
};

// --- Public queries (no login) ---

/** All publicly listable events (published + cancelled for their info pages). */
export const fetchPublicEvents = async (): Promise<SprEvent[]> => {
  const q = query(collection(db(), EVENT_COLLECTIONS.events), where('status', 'in', ['published', 'cancelled']));
  const snap = await getDocs(q);
  const items: SprEvent[] = [];
  snap.forEach(d => items.push({ ...(d.data() as any), id: d.id }));
  return items;
};

export const fetchEventBySlug = async (slug: string): Promise<SprEvent | null> => {
  if (!slug) return null;
  const q = query(collection(db(), EVENT_COLLECTIONS.events), where('slug', '==', slug), limit(1));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const d = snap.docs[0];
  return { ...(d.data() as any), id: d.id };
};

/** Duplicate check: existing registration for this event by email OR mobile. */
export const findExistingRegistration = async (
  eventId: string,
  email: string,
  mobile: string,
): Promise<EventRegistration | null> => {
  const col = collection(db(), EVENT_COLLECTIONS.registrations);
  if (email) {
    const snap = await getDocs(query(col, where('eventId', '==', eventId), where('email', '==', email), limit(1)));
    if (!snap.empty) { const d = snap.docs[0]; return { ...(d.data() as any), id: d.id }; }
  }
  if (mobile) {
    const snap = await getDocs(query(col, where('eventId', '==', eventId), where('mobile', '==', mobile), limit(1)));
    if (!snap.empty) { const d = snap.docs[0]; return { ...(d.data() as any), id: d.id }; }
  }
  return null;
};

export const fetchRegistrationsForEvent = async (eventId: string): Promise<EventRegistration[]> => {
  const snap = await getDocs(query(collection(db(), EVENT_COLLECTIONS.registrations), where('eventId', '==', eventId)));
  const items: EventRegistration[] = [];
  snap.forEach(d => items.push({ ...(d.data() as any), id: d.id }));
  return items;
};

// --- The registration transaction ---

export type RegisterOutcome =
  | { ok: true; registration: EventRegistration }
  | { ok: false; reason: 'full' | 'closed' | 'not_found' };

/**
 * Atomically: re-check publish status + window + capacity, claim the next
 * registration-code sequence, bump the right counter, and write the
 * registration. Two simultaneous registrations for the last seat cannot both
 * succeed — the second retries on the updated snapshot and lands on the
 * waitlist (or is refused).
 */
export const registerForEvent = async (
  eventId: string,
  draft: Omit<EventRegistration, 'registrationCode' | 'status'>,
): Promise<RegisterOutcome> => {
  return runTransaction(db(), async tx => {
    const evRef = doc(db(), EVENT_COLLECTIONS.events, eventId);
    const snap = await tx.get(evRef);
    if (!snap.exists()) return { ok: false as const, reason: 'not_found' as const };
    const ev = { ...(snap.data() as any), id: eventId } as SprEvent;

    const window = registrationWindow(ev);
    if (!window.open) return { ok: false as const, reason: 'closed' as const };

    const counters = { ...emptyCounters(), ...(ev.counters || {}) };
    const isFull = !!ev.capacity && ev.capacity > 0 && counters.confirmed >= ev.capacity;
    if (isFull && !ev.waitlistEnabled) return { ok: false as const, reason: 'full' as const };

    const seq = (ev.registrationSeq || 0) + 1;
    const status = isFull ? 'waitlisted' : 'confirmed';
    const registration: EventRegistration = {
      ...draft,
      registrationCode: formatRegistrationCode(ev.type, seq),
      status,
    };

    if (status === 'confirmed') counters.confirmed += 1; else counters.waitlisted += 1;
    tx.update(evRef, { registrationSeq: seq, counters });
    tx.set(doc(db(), EVENT_COLLECTIONS.registrations, registration.id), stripUndefined(registration));
    return { ok: true as const, registration };
  });
};

// --- Registration admin updates ---

export const updateRegistration = async (id: string, data: Partial<EventRegistration>): Promise<void> => {
  await updateDoc(doc(db(), EVENT_COLLECTIONS.registrations, id), stripUndefined(data));
};

/** confirmed / attended / no_show all hold a seat; waitlisted & cancelled don't. */
const holdsSeat = (s: EventRegistration['status']) => s === 'confirmed' || s === 'attended' || s === 'no_show';

/**
 * Status changes run in a transaction so the event's seat counters stay
 * consistent (e.g. a cancellation frees a seat, promoting from the waitlist
 * claims one).
 */
export const changeRegistrationStatus = async (
  reg: EventRegistration,
  newStatus: EventRegistration['status'],
): Promise<void> => {
  if (reg.status === newStatus) return;
  await runTransaction(db(), async tx => {
    const evRef = doc(db(), EVENT_COLLECTIONS.events, reg.eventId);
    const snap = await tx.get(evRef);
    if (snap.exists()) {
      const counters = { ...emptyCounters(), ...((snap.data() as any).counters || {}) };
      counters.confirmed = Math.max(0, counters.confirmed + (holdsSeat(newStatus) ? 1 : 0) - (holdsSeat(reg.status) ? 1 : 0));
      counters.waitlisted = Math.max(0, counters.waitlisted + (newStatus === 'waitlisted' ? 1 : 0) - (reg.status === 'waitlisted' ? 1 : 0));
      tx.update(evRef, { counters });
    }
    tx.update(doc(db(), EVENT_COLLECTIONS.registrations, reg.id), stripUndefined({
      status: newStatus,
      attendedAt: newStatus === 'attended' ? new Date().toISOString() : reg.attendedAt,
    }));
  });
};
