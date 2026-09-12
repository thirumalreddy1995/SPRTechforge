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
  writeBatch,
  increment,
} from 'firebase/firestore/lite';
import { EventPrivateDetails, EventRegistration, SprEvent } from '../types';
import { EVENT_COLLECTIONS, emptyCounters, emptyPrivateDetails, RegisterOutcome, withContentionRetry } from './eventsDb';
import { formatRegistrationCode, randomRegistrationCode } from '../lib/slug';
import { registrationWindow } from '../lib/validate';

const db = () => getFirestore(getApp());
const stripUndefined = (data: any) => JSON.parse(JSON.stringify(data));

// ---------------------------------------------------------------------------
// Prefetch hand-off. index.html starts the slug query with a plain fetch the
// moment the HTML arrives (before any JS bundle downloads), and parks the
// promise on window.__SPR_EVENT_PREFETCH. We consume it here when it matches
// the requested slug and project; otherwise we fall through to the SDK.
// ---------------------------------------------------------------------------

interface EventPrefetch {
  slug: string;
  projectId: string;
  promise: Promise<any>;
}

/** Firestore REST value → plain JS (the subset of types this app stores). */
const decodeRestValue = (v: any): any => {
  if (v === null || typeof v !== 'object') return v;
  if ('stringValue' in v) return v.stringValue;
  if ('booleanValue' in v) return v.booleanValue;
  if ('integerValue' in v) return Number(v.integerValue);
  if ('doubleValue' in v) return v.doubleValue;
  if ('nullValue' in v) return null;
  if ('timestampValue' in v) return v.timestampValue;
  if ('arrayValue' in v) return (v.arrayValue.values || []).map(decodeRestValue);
  if ('mapValue' in v) return decodeRestFields(v.mapValue.fields || {});
  return undefined;
};

const decodeRestFields = (fields: Record<string, any>): Record<string, any> => {
  const out: Record<string, any> = {};
  for (const k of Object.keys(fields)) out[k] = decodeRestValue(fields[k]);
  return out;
};

const takePrefetchedEvent = async (slug: string): Promise<SprEvent | null | undefined> => {
  try {
    const pf: EventPrefetch | undefined = (window as any).__SPR_EVENT_PREFETCH;
    if (!pf || pf.slug !== slug) return undefined;
    (window as any).__SPR_EVENT_PREFETCH = undefined; // single use
    if (pf.projectId !== getApp().options.projectId) return undefined; // admin browser with a config override
    const rows = await pf.promise;
    if (!Array.isArray(rows)) return undefined;
    const row = rows.find(r => r && r.document);
    if (!row) return null; // query ran fine: no such slug
    const name: string = row.document.name || '';
    const id = name.slice(name.lastIndexOf('/') + 1);
    return { ...(decodeRestFields(row.document.fields || {}) as any), id } as SprEvent;
  } catch {
    return undefined; // any hiccup → normal SDK path
  }
};

/** All publicly listable events (published + cancelled for their info pages). */
export const fetchPublicEvents = async (): Promise<SprEvent[]> => {
  const q = query(collection(db(), EVENT_COLLECTIONS.events), where('status', 'in', ['published', 'cancelled']));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ ...(d.data() as any), id: d.id }));
};

export const fetchEventBySlug = async (slug: string): Promise<SprEvent | null> => {
  if (!slug) return null;
  const prefetched = await takePrefetchedEvent(slug);
  if (prefetched !== undefined) return prefetched;
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
 * Registers one person. Two write paths, same rules as eventsDb.registerForEvent:
 *
 * UNLIMITED seats (capacity 0 — the normal free webinar): NO transaction.
 *   Load-testing showed that a transaction on the shared event document
 *   fails for ~25 % of people once 10 register at the same moment (every
 *   commit conflicts with every other). Instead we read the event once to
 *   check the window, then write the registration plus blind `increment`
 *   counters in one batch. Increments never conflict, so thousands can sign
 *   up simultaneously; the code is time+random instead of sequential.
 *
 * LIMITED seats (capacity > 0): the transaction stays, because "is there a
 *   seat left?" must be decided atomically. Contention is retried with
 *   backoff; a burst gets slower, not wrong.
 */
export const registerForEvent = async (
  eventId: string,
  draft: Omit<EventRegistration, 'registrationCode' | 'status'>,
): Promise<RegisterOutcome> => {
  const evRef = doc(db(), EVENT_COLLECTIONS.events, eventId);
  const first = await getDoc(evRef);
  if (!first.exists()) return { ok: false, reason: 'not_found' };
  const ev0 = { ...(first.data() as any), id: eventId } as SprEvent;
  if (!registrationWindow(ev0).open) return { ok: false, reason: 'closed' };

  if (!ev0.capacity || ev0.capacity <= 0) {
    const registration: EventRegistration = { ...draft, registrationCode: randomRegistrationCode(ev0.type), status: 'confirmed' };
    const batch = writeBatch(db());
    batch.set(doc(db(), EVENT_COLLECTIONS.registrations, registration.id), stripUndefined(registration));
    batch.update(evRef, { 'counters.confirmed': increment(1), registrationSeq: increment(1) });
    await withContentionRetry(() => batch.commit(), 4);
    return { ok: true, registration };
  }

  return withContentionRetry(() => runTransaction(db(), async tx => {
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
  }, { maxAttempts: 10 }));
};
