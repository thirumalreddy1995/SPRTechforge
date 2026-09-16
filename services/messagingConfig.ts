// Runtime-resolved email-bridge configuration.
//
// The old pattern baked VITE_EMAIL_ENDPOINT / VITE_EMAIL_SHARED_SECRET into the
// bundle at build time — if the secrets were missing at build time (the usual
// local-dev case) email was dead everywhere with no way to fix it short of a
// rebuild. This module resolves the config at runtime with a clear precedence:
//
//   1. localStorage override (this browser only — for testing a new bridge)
//   2. Firestore `system_settings/messaging` (shared by every deployed client,
//      editable in-app on Admin → Communication Settings, no rebuild needed)
//   3. Build-time env vars (the old behaviour, kept as the fallback)
//
// Note on secrecy: the shared secret was already shipped inside the public JS
// bundle, so storing it in Firestore (readable by the same clients) is not a
// security regression. Real secrecy requires a server-side proxy — out of
// scope for a static-hosted app.

import { getApp } from 'firebase/app';
import { getFirestore as getLiteFirestore, doc as liteDoc, getDoc as liteGetDoc } from 'firebase/firestore/lite';
import { cloudService } from './cloud';

export interface EmailBridgeConfig {
  endpoint: string;
  secret: string;
  /**
   * Default From address (e.g. admin@sprtechforge.com). With the Outlook /
   * Microsoft 365 provider this selects the mailbox that sends; with Gmail it
   * must be a configured "Send mail as" alias of the bridge account, otherwise
   * the bridge falls back to its own address. Optional.
   */
  senderEmail?: string;
  /** Default From display name, e.g. "SPR Techforge". Optional. */
  senderName?: string;
}

export type MessagingConfigSource = 'local-override' | 'cloud' | 'build' | 'none';

const LS_KEY = 'SPR_TECHFORGE_MESSAGING_CONFIG';
const CLOUD_COLLECTION = 'system_settings';
const CLOUD_DOC_ID = 'messaging';

const env = (import.meta as any).env ?? {};

const buildConfig: EmailBridgeConfig = {
  endpoint: (env.VITE_EMAIL_ENDPOINT as string) || '',
  secret: (env.VITE_EMAIL_SHARED_SECRET as string) || '',
  senderEmail: (env.VITE_EMAIL_SENDER as string) || '',
  senderName: (env.VITE_EMAIL_SENDER_NAME as string) || '',
};

const str = (v: unknown): string => (typeof v === 'string' ? v.trim() : '');

/** Normalize any stored/typed shape into a clean config object. */
const cleanConfig = (c: Partial<EmailBridgeConfig>): EmailBridgeConfig => ({
  endpoint: str(c.endpoint),
  secret: str(c.secret),
  senderEmail: str(c.senderEmail).toLowerCase(),
  senderName: str(c.senderName),
});

let remoteConfig: EmailBridgeConfig | null = null;
let remoteLoadStarted = false;

const listeners = new Set<() => void>();
const notifyListeners = () => listeners.forEach(l => { try { l(); } catch { /* listener errors must not break others */ } });

const isComplete = (c: Partial<EmailBridgeConfig> | null | undefined): c is EmailBridgeConfig =>
  !!c && typeof c.endpoint === 'string' && typeof c.secret === 'string' && !!c.endpoint.trim() && !!c.secret.trim();

const readLocalOverride = (): EmailBridgeConfig | null => {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return isComplete(parsed) ? cleanConfig(parsed) : null;
  } catch {
    return null;
  }
};

/** The effective config, following the precedence above. */
export const getEmailBridgeConfig = (): EmailBridgeConfig => {
  const local = readLocalOverride();
  if (local) return local;
  if (isComplete(remoteConfig)) return remoteConfig;
  return buildConfig;
};

export const getMessagingConfigSource = (): MessagingConfigSource => {
  if (readLocalOverride()) return 'local-override';
  if (isComplete(remoteConfig)) return 'cloud';
  if (isComplete(buildConfig)) return 'build';
  return 'none';
};

export const isEmailBridgeConfigured = (): boolean => isComplete(getEmailBridgeConfig());

/**
 * Fetch the shared config from Firestore once per session. Safe to call
 * multiple times; no-ops after the first call. Fires config listeners when
 * a cloud config is found.
 */
export const loadRemoteMessagingConfig = async (): Promise<void> => {
  if (remoteLoadStarted || !cloudService.isConfigured()) return;
  remoteLoadStarted = true;
  try {
    // One plain HTTPS read via the lite SDK. Using the realtime SDK here made
    // every PUBLIC visitor open a WebChannel just to learn the email settings.
    const snap = await liteGetDoc(liteDoc(getLiteFirestore(getApp()), CLOUD_COLLECTION, CLOUD_DOC_ID));
    const doc = snap.exists() ? snap.data() : null;
    if (isComplete(doc)) {
      remoteConfig = cleanConfig(doc);
      notifyListeners();
    }
  } catch (e) {
    console.warn('Could not load messaging config from cloud:', e);
    remoteLoadStarted = false; // allow a retry on next call
  }
};

/**
 * Persist a new config. Cloud save makes it live for every client of this
 * deployment; the local copy makes it effective in this browser immediately
 * (and keeps working if Firestore is unreachable).
 */
export const saveMessagingConfig = async (config: EmailBridgeConfig, opts: { toCloud: boolean }): Promise<void> => {
  const clean = cleanConfig(config);
  if (!isComplete(clean)) throw new Error('Both the bridge URL and the shared secret are required.');
  if (clean.senderEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean.senderEmail)) {
    throw new Error('The default sender email address does not look valid.');
  }
  localStorage.setItem(LS_KEY, JSON.stringify(clean));
  if (opts.toCloud && cloudService.isConfigured()) {
    await cloudService.saveItem(CLOUD_COLLECTION, { id: CLOUD_DOC_ID, ...clean, updatedAt: new Date().toISOString() });
    remoteConfig = clean;
  }
  notifyListeners();
};

/** Remove the this-browser override, reverting to cloud/build config. */
export const clearLocalMessagingOverride = (): void => {
  localStorage.removeItem(LS_KEY);
  notifyListeners();
};

/** Subscribe to config changes. Returns an unsubscribe function. */
export const subscribeMessagingConfig = (cb: () => void): (() => void) => {
  listeners.add(cb);
  return () => listeners.delete(cb);
};
