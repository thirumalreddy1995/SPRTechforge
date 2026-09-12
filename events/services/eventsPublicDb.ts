// Firestore access for the PUBLIC event pages, built on the "lite" SDK
// (firebase/firestore/lite). Lite talks plain HTTPS/REST: one request per
// read, no realtime channel. The full SDK's first read must first open its
// WebChannel (handshake + long-poll), which cost 3+ seconds on a phone for a
// single document. The public pages never need realtime updates, so they use
// this module; the admin screens keep using eventsDb.ts (onSnapshot).
//
// Both SDK flavours attach to the same FirebaseApp and the same project, so
// documents written here are seen live by the admin screens.
//
// KEEP IN SYNC: registerForEvent mirrors the transaction in eventsDb.ts.

import { getApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  query,
  where,
  limit,
  getDocs,
  getDoc,
  doc,
  runTransaction,
} from 'firebase/firestore/lite';
import { EventPrivateDetails, EventRegistration, SprEvent } from '../types';
import { EVENT_COLLECTIONS, emptyCounters, emptyPrivateDetails, RegisterOutcome } from './eventsDb';
import { formatRegistrationCode } from '../lib/slug';
import { registrationWindow } from '../lib/validate';

const db = () => getFirestore(getApp());
const stripUndefined = (data: any) => JSON.parse(JSON.stringify(data));

/** All publicly listable events (published + cancelled for their info pages). */
export const fetchPublicEvents = async (): Promise<SprEvent[]> => {
  const q = query(collection(db(), EVENT_COLLECTIONS.events), where('status', 'in', ['published', 'cancelled']));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ ...(d.data() as any), id: d.id }));
};

export const fetchEventBySlug = async (slug: string): Promise<SprEvent | null> => {
  if (!slug) return null;
  const q = query(collection(db(), EVENT_COLLECTIONS.events), where('slug', '==', slug), limit(1));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const d = snap.docs[0];
  return { ...(d.data() as any), id: d.id };
};

export const fetchPrivateDetails = async (eventId: string): Promise<EventPrivateDetails> => {
  const snap = await getDoc(doc(db(), EVENT_COLLECTIONS.private, eventId));
  return snap.exists() ? ({ ...(snap.data() as any), id: eventId }) : emptyPrivateDetails(eventId);
};

/** Duplicate check: existing registration for this event by email OR mobile. Both lookups run in parallel. */
export const findExistingRegistration = async (
  eventId: string,
  email: string,
  mobile: string,
): Promise<EventRegistration | null> => {
  const col = collection(db(), EVENT_COLLECTIONS.registrations);
  const lookups = [
    email ? getDocs(query(col, where('eventId', '==', eventId), where('email', '==', email), limit(1))) : null,
    mobile ? getDocs(query(col, where('eventId', '==', eventId), where('mobile', '==', mobile), limit(1))) : null,
  ];
  const [byEmail, byMobile] = await Promise.all(lookups);
  for (const snap of [byEmail, byMobile]) {
    if (snap && !snap.empty) { const d = snap.docs[0]; return { ...(d.data() as any), id: d.id }; }
  }
  return null;
};

/**
 * Atomically: re-check publish status + window + capacity, claim the next
 * registration-code sequence, bump the right counter, and write the
 * registration. Identical rules to eventsDb.registerForEvent.
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
