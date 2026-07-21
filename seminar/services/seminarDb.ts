// Firestore access for the seminar module. Reuses the Firebase app that
// services/cloud.ts initializes (default app), so there is no extra config.
// All collections are prefixed seminar_ — the app has no SQL migration system
// (Firestore collections are created on first write), so this file IS the
// module's "migration": it defines the collection names and single-row config.

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
  doc,
  writeBatch,
  onSnapshot,
  getCountFromServer,
} from 'firebase/firestore';
import {
  SeminarCandidate,
  SeminarQuestion,
  SeminarRegistration,
  SeminarSettings,
} from '../types';
import { DEFAULT_SETTINGS_FIELDS } from '../lib/template';

export const SEMINAR_COLLECTIONS = {
  candidates: 'seminar_candidates',
  registrations: 'seminar_registrations',
  questions: 'seminar_questions',
  campaignLog: 'seminar_campaign_log',
  settings: 'seminar_settings',
} as const;

const SETTINGS_DOC_ID = 'config';

const db = () => getFirestore(getApp());

const stripUndefined = (data: any) => JSON.parse(JSON.stringify(data));

// --- Generic helpers (admin pages subscribe; public page uses point queries) ---

export const subscribeSeminarCollection = <T,>(
  name: string,
  callback: (items: T[]) => void,
  onError?: (e: any) => void,
) => {
  const colRef = collection(db(), name);
  return onSnapshot(
    colRef,
    snapshot => {
      const items: T[] = [];
      snapshot.forEach(d => items.push({ ...(d.data() as any), id: d.id }));
      callback(items);
    },
    error => {
      console.error(`Seminar: error subscribing to ${name}:`, error);
      if (onError) onError(error);
    },
  );
};

export const saveSeminarDoc = async (name: string, item: { id: string }) => {
  await setDoc(doc(db(), name, item.id), stripUndefined(item));
};

export const updateSeminarDoc = async (name: string, id: string, data: any) => {
  await updateDoc(doc(db(), name, id), stripUndefined(data));
};

/** Batched upsert (Firestore caps a write batch at 500 ops). */
export const saveSeminarBatch = async (name: string, items: { id: string }[]) => {
  const CHUNK = 450;
  for (let i = 0; i < items.length; i += CHUNK) {
    const batch = writeBatch(db());
    items.slice(i, i + CHUNK).forEach(item => {
      batch.set(doc(db(), name, item.id), stripUndefined(item));
    });
    await batch.commit();
  }
};

/** Batched delete across collections: [{collection, id}, ...]. */
export const deleteSeminarDocs = async (refs: { collection: string; id: string }[]) => {
  const CHUNK = 450;
  for (let i = 0; i < refs.length; i += CHUNK) {
    const batch = writeBatch(db());
    refs.slice(i, i + CHUNK).forEach(r => {
      batch.delete(doc(db(), r.collection, r.id));
    });
    await batch.commit();
  }
};

// --- Settings (single-row config) ---

export const defaultSeminarSettings = (): SeminarSettings => ({
  id: SETTINGS_DOC_ID,
  dateTime: '',
  venue: '',
  onlineLink: '',
  trainerName: '',
  seatsLimit: 0,
  showSeatsRemaining: true,
  bannerPath: '',
  bannerUrl: '',
  publicBaseUrl: '',
  ...DEFAULT_SETTINGS_FIELDS,
});

export const fetchSeminarSettings = async (): Promise<SeminarSettings> => {
  const snap = await getDoc(doc(db(), SEMINAR_COLLECTIONS.settings, SETTINGS_DOC_ID));
  const defaults = defaultSeminarSettings();
  if (!snap.exists()) return defaults;
  return { ...defaults, ...(snap.data() as any), id: SETTINGS_DOC_ID };
};

export const saveSeminarSettings = async (settings: SeminarSettings) => {
  await setDoc(
    doc(db(), SEMINAR_COLLECTIONS.settings, SETTINGS_DOC_ID),
    stripUndefined({ ...settings, id: SETTINGS_DOC_ID, updatedAt: new Date().toISOString() }),
  );
};

// --- Public registration page queries (no login, token-scoped) ---

export const fetchCandidateByToken = async (token: string): Promise<SeminarCandidate | null> => {
  if (!token) return null;
  const q = query(
    collection(db(), SEMINAR_COLLECTIONS.candidates),
    where('inviteToken', '==', token),
    limit(1),
  );
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const d = snap.docs[0];
  return { ...(d.data() as any), id: d.id };
};

export const fetchRegistrationForCandidate = async (candidateId: string): Promise<SeminarRegistration | null> => {
  const q = query(
    collection(db(), SEMINAR_COLLECTIONS.registrations),
    where('candidateId', '==', candidateId),
    limit(1),
  );
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const d = snap.docs[0];
  return { ...(d.data() as any), id: d.id };
};

export const fetchQuestionsForCandidate = async (candidateId: string): Promise<SeminarQuestion[]> => {
  const q = query(
    collection(db(), SEMINAR_COLLECTIONS.questions),
    where('candidateId', '==', candidateId),
  );
  const snap = await getDocs(q);
  const items: SeminarQuestion[] = [];
  snap.forEach(d => items.push({ ...(d.data() as any), id: d.id }));
  // Sort client-side to avoid needing a composite index for where + orderBy.
  return items.sort((a, b) => (a.createdAt < b.createdAt ? -1 : 1));
};

export const countRegisteredSeats = async (): Promise<number> => {
  const q = query(
    collection(db(), SEMINAR_COLLECTIONS.registrations),
    where('status', '==', 'registered'),
  );
  const snap = await getCountFromServer(q);
  return snap.data().count;
};
