// Resilient file uploads — provider-with-fallback pattern.
//
// Primary provider: Firebase Storage (via cloudService.uploadFile). This is
// what banner/chat/email-attachment uploads used directly before, and it
// fails hard when Storage isn't provisioned for the project or its rules
// reject unauthenticated writes (this app doesn't use Firebase Auth).
//
// Fallback provider: inline base64 data: URLs stored alongside the record in
// Firestore. Images are first resized/compressed on a canvas so they fit
// comfortably inside Firestore's 1 MB document limit. Data URLs render in
// <img src> / <a href> as-is, and the updated email bridge (Code.gs) decodes
// them server-side, so emails keep working too.
//
// Every result carries `storage: 'firebase' | 'inline'` so callers can adapt
// (e.g. the seminar mailer switches to CID embedding for inline banners).

import { cloudService } from './cloud';

export interface UploadResult {
  url: string;   // https:// download URL, or a data: URL when storage === 'inline'
  name: string;
  type: string;
  size: number;
  storage: 'firebase' | 'inline';
}

export interface ImageUploadOptions {
  maxWidth?: number;   // default 1600 — plenty for banners and chat photos
  quality?: number;    // JPEG/WebP quality, default 0.82
}

const STORAGE_TIMEOUT_MS = 25_000;
// Keep inline payloads well under Firestore's 1 MiB doc limit (base64 inflates ~4/3,
// and the doc carries other fields too).
const MAX_INLINE_DATAURL_CHARS = 680_000;

const withTimeout = <T>(p: Promise<T>, ms: number, label: string): Promise<T> =>
  new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`${label} timed out after ${Math.round(ms / 1000)}s`)), ms);
    p.then(v => { clearTimeout(timer); resolve(v); }, e => { clearTimeout(timer); reject(e); });
  });

const blobToDataUrl = (blob: Blob): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('Could not read the file'));
    reader.readAsDataURL(blob);
  });

const loadImage = (file: Blob): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Not a readable image')); };
    img.src = url;
  });

/**
 * Resize/re-encode an image on a canvas. PNGs with transparency stay PNG;
 * everything else becomes JPEG (best size for photos/banners).
 */
export const compressImage = async (file: File, opts: ImageUploadOptions = {}): Promise<Blob> => {
  const { maxWidth = 1600, quality = 0.82 } = opts;
  const img = await loadImage(file);
  const scale = Math.min(1, maxWidth / img.naturalWidth);
  const w = Math.max(1, Math.round(img.naturalWidth * scale));
  const h = Math.max(1, Math.round(img.naturalHeight * scale));

  // Already small and no downscale needed — keep the original bytes.
  if (scale === 1 && file.size < 300 * 1024) return file;

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) return file;
  ctx.drawImage(img, 0, 0, w, h);

  const outType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
  const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, outType, quality));
  if (!blob) return file;
  // Re-encoding occasionally inflates tiny files — keep whichever is smaller.
  return blob.size < file.size ? blob : file;
};

const describeStorageFailure = (e: any): string => {
  const msg = String(e?.message || e);
  if (/not configured/i.test(msg)) return 'Firebase Storage is not configured';
  if (/unauthorized|permission|403/i.test(msg)) return 'Firebase Storage rejected the upload (storage rules deny writes)';
  if (/timed out/i.test(msg)) return 'Firebase Storage did not respond';
  return `Firebase Storage upload failed (${msg})`;
};

const tryFirebase = async (path: string, file: File | Blob, name: string, type: string): Promise<UploadResult> => {
  const asFile = file instanceof File ? file : new File([file], name, { type });
  const up = await withTimeout(cloudService.uploadFile(path, asFile), STORAGE_TIMEOUT_MS, 'Storage upload');
  return { ...up, storage: 'firebase' };
};

const inlineFallback = async (blob: Blob, name: string, storageError: any): Promise<UploadResult> => {
  const dataUrl = await blobToDataUrl(blob);
  if (dataUrl.length > MAX_INLINE_DATAURL_CHARS) {
    const kb = Math.round(blob.size / 1024);
    throw new Error(
      `${describeStorageFailure(storageError)}, and "${name}" (${kb} KB) is too large for the inline fallback (~500 KB max). ` +
      `Fix Storage on Admin → Communication Settings, or use a smaller file.`
    );
  }
  return { url: dataUrl, name, type: blob.type, size: blob.size, storage: 'inline' };
};

export const uploadService = {
  /**
   * Image upload: compress first (smaller Storage bills, guaranteed-fit
   * fallback), then Firebase Storage → inline data URL.
   */
  async uploadImage(path: string, file: File, opts: ImageUploadOptions = {}): Promise<UploadResult> {
    let blob: Blob;
    try {
      blob = await compressImage(file, opts);
    } catch {
      blob = file; // not fatal — try uploading the original
    }
    let storageError: any;
    try {
      return await tryFirebase(path, blob, file.name, blob.type || file.type);
    } catch (e) {
      storageError = e;
      console.warn('Storage upload failed, falling back to inline:', e);
    }
    // Fallback must fit in Firestore — compress harder if the first pass was gentle.
    if (blob.size * 1.4 > MAX_INLINE_DATAURL_CHARS) {
      try { blob = await compressImage(file, { maxWidth: 1200, quality: 0.72 }); } catch { /* keep current blob */ }
    }
    return inlineFallback(blob, file.name, storageError);
  },

  /**
   * Generic file upload: Firebase Storage → inline data URL (images are
   * compressed for the fallback; other small files are inlined as-is).
   */
  async uploadFile(path: string, file: File): Promise<UploadResult> {
    let storageError: any;
    try {
      return await tryFirebase(path, file, file.name, file.type);
    } catch (e) {
      storageError = e;
      console.warn('Storage upload failed, falling back to inline:', e);
    }
    let blob: Blob = file;
    if (file.type.startsWith('image/')) {
      try { blob = await compressImage(file, { maxWidth: 1600, quality: 0.8 }); } catch { /* keep original */ }
    }
    return inlineFallback(blob, file.name, storageError);
  },

  /** Health check used by the Communication Settings page. */
  async testStorage(): Promise<{ ok: boolean; error?: string }> {
    try {
      const probe = new File([`upload-probe ${new Date().toISOString()}`], 'upload-probe.txt', { type: 'text/plain' });
      const path = `system_check/upload-probe-${Date.now()}.txt`;
      await tryFirebase(path, probe, probe.name, probe.type);
      await cloudService.deleteFile(path);
      return { ok: true };
    } catch (e: any) {
      return { ok: false, error: describeStorageFailure(e) };
    }
  },
};
