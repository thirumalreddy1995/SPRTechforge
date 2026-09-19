// Website content access.
//  - PUBLIC reads use the lite (REST) SDK: one request per collection, all in
//    parallel, no realtime channel — the marketing page must stay fast.
//  - ADMIN writes go through cloudService like every other staff collection.

import { getApp } from 'firebase/app';
import { getFirestore, collection, getDocs, getDoc, doc } from 'firebase/firestore/lite';
import { cloudService } from '../../services/cloud';
import {
  SITE_COLLECTIONS, SiteBanner, SitePhoto, SiteTestimonial, SiteStats, SiteSettings, SiteContent,
  defaultSettings, defaultStats,
} from '../types';

const liteDb = () => getFirestore(getApp());
const byOrder = <T extends { order: number; createdAt: string }>(a: T, b: T) => a.order - b.order || a.createdAt.localeCompare(b.createdAt);

const normBanner = (r: any): SiteBanner => ({ id: r.id, imageUrl: r.imageUrl || '', title: r.title || '', subtitle: r.subtitle || '', ctaLabel: r.ctaLabel || '', ctaUrl: r.ctaUrl || '', order: Number(r.order) || 0, active: r.active !== false, createdAt: r.createdAt || '' });
const normPhoto = (r: any): SitePhoto => ({ id: r.id, imageUrl: r.imageUrl || '', caption: r.caption || '', order: Number(r.order) || 0, createdAt: r.createdAt || '' });
const normTestimonial = (r: any): SiteTestimonial => ({ id: r.id, name: r.name || '', role: r.role || '', quote: r.quote || '', photoUrl: r.photoUrl || '', rating: Math.min(5, Math.max(1, Number(r.rating) || 5)), order: Number(r.order) || 0, approved: !!r.approved, createdAt: r.createdAt || '' });
const normStats = (r: any): SiteStats => ({ ...defaultStats(), ...Object.fromEntries(Object.entries(r || {}).filter(([k]) => k in defaultStats()).map(([k, v]) => [k, Math.max(0, Number(v) || 0)])) });
const normSettings = (r: any): SiteSettings => ({ ...defaultSettings(), ...Object.fromEntries(Object.entries(r || {}).filter(([k, v]) => k in defaultSettings() && typeof v === 'string').map(([k, v]) => [k, String(v).trim()])) });

/** Everything the public page needs, fetched in parallel. Missing pieces fall back to defaults. */
export const fetchSiteContent = async (): Promise<SiteContent> => {
  const db = liteDb();
  const safe = async <T>(p: Promise<T>, fallback: T): Promise<T> => { try { return await p; } catch { return fallback; } };
  const [banners, photos, testimonials, statsSnap, settingsSnap] = await Promise.all([
    safe(getDocs(collection(db, SITE_COLLECTIONS.banners)).then(s => s.docs.map(d => normBanner({ ...d.data(), id: d.id }))), []),
    safe(getDocs(collection(db, SITE_COLLECTIONS.photos)).then(s => s.docs.map(d => normPhoto({ ...d.data(), id: d.id }))), []),
    safe(getDocs(collection(db, SITE_COLLECTIONS.testimonials)).then(s => s.docs.map(d => normTestimonial({ ...d.data(), id: d.id }))), []),
    safe(getDoc(doc(db, SITE_COLLECTIONS.content, 'stats')).then(s => (s.exists() ? s.data() : null)), null),
    safe(getDoc(doc(db, SITE_COLLECTIONS.content, 'settings')).then(s => (s.exists() ? s.data() : null)), null),
  ]);
  return {
    banners: banners.filter(b => b.imageUrl && b.active).sort(byOrder),
    photos: photos.filter(p => p.imageUrl).sort(byOrder),
    testimonials: testimonials.filter(t => t.approved && t.photoUrl).sort(byOrder),
    stats: normStats(statsSnap),
    settings: normSettings(settingsSnap),
  };
};

// ---------- admin (realtime, cloudService) ----------

const strip = (o: any) => JSON.parse(JSON.stringify(o));

export const subscribeBanners = (cb: (items: SiteBanner[]) => void) =>
  cloudService.subscribe(SITE_COLLECTIONS.banners, (items: any[]) => cb(items.map(normBanner).sort(byOrder)));
export const subscribePhotos = (cb: (items: SitePhoto[]) => void) =>
  cloudService.subscribe(SITE_COLLECTIONS.photos, (items: any[]) => cb(items.map(normPhoto).sort(byOrder)));
export const subscribeTestimonials = (cb: (items: SiteTestimonial[]) => void) =>
  cloudService.subscribe(SITE_COLLECTIONS.testimonials, (items: any[]) => cb(items.map(normTestimonial).sort(byOrder)));

export const saveBanner = (b: SiteBanner) => cloudService.saveItem(SITE_COLLECTIONS.banners, strip(b));
export const updateBanner = (id: string, patch: Partial<SiteBanner>) => cloudService.updateItem(SITE_COLLECTIONS.banners, id, strip(patch));
export const deleteBanner = (id: string) => cloudService.deleteItem(SITE_COLLECTIONS.banners, id);

export const savePhoto = (p: SitePhoto) => cloudService.saveItem(SITE_COLLECTIONS.photos, strip(p));
export const updatePhoto = (id: string, patch: Partial<SitePhoto>) => cloudService.updateItem(SITE_COLLECTIONS.photos, id, strip(patch));
export const deletePhoto = (id: string) => cloudService.deleteItem(SITE_COLLECTIONS.photos, id);

export const saveTestimonial = (t: SiteTestimonial) => cloudService.saveItem(SITE_COLLECTIONS.testimonials, strip(t));
export const updateTestimonial = (id: string, patch: Partial<SiteTestimonial>) => cloudService.updateItem(SITE_COLLECTIONS.testimonials, id, strip(patch));
export const deleteTestimonial = (id: string) => cloudService.deleteItem(SITE_COLLECTIONS.testimonials, id);

export const loadStats = async (): Promise<SiteStats> => normStats(await cloudService.getItem(SITE_COLLECTIONS.content, 'stats'));
export const saveStats = (s: SiteStats) => cloudService.saveItem(SITE_COLLECTIONS.content, { id: 'stats', ...strip(s), updatedAt: new Date().toISOString() });
/** Public (REST) read of the site settings — used by the event page for the community link. */
export const fetchSiteSettingsLite = async (): Promise<SiteSettings> => {
  try { const snap = await getDoc(doc(liteDb(), SITE_COLLECTIONS.content, 'settings')); return normSettings(snap.exists() ? snap.data() : {}); } catch { return defaultSettings(); }
};
export const loadSettings = async (): Promise<SiteSettings> => normSettings(await cloudService.getItem(SITE_COLLECTIONS.content, 'settings'));
export const saveSettings = (s: SiteSettings) => cloudService.saveItem(SITE_COLLECTIONS.content, { id: 'settings', ...strip(s), updatedAt: new Date().toISOString() });
