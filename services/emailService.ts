// Unified email core — the ONE place that talks to the Google Apps Script
// email bridge (apps-script/Code.gs). Used by the SPRConnect Email page,
// the seminar mailer, and anything else that sends mail.
//
// Pattern: runtime config (services/messagingConfig.ts) + timeout + retry
// with backoff on transient failures + human-readable error mapping.
// Attachments and inline images may reference either a hosted URL or a
// base64 data: URL (the inline-upload fallback) — data URLs are decoded
// server-side by the bridge, so they work even when Firebase Storage is down.

import { EmailMessage, EmailAttachment } from '../types';
import { getEmailBridgeConfig, isEmailBridgeConfigured } from './messagingConfig';

interface GasMessage {
  id: string;
  threadId: string;
  from: string;
  to: string[];
  cc?: string[];
  subject: string;
  snippet: string;
  body: string;
  bodyHtml?: string;
  date: string;
  isRead: boolean;
  hasAttachments: boolean;
  attachmentNames: string[];
}

interface ListResponse {
  ok: boolean;
  messages?: GasMessage[];
  error?: string;
}

interface SendResponse {
  ok: boolean;
  sentTo?: string;
  sentFrom?: string;
  quotaRemaining?: number;
  /** 'gmail' | 'graph' — reported by the updated bridge (ping + send). */
  provider?: string;
  /** Mailbox the bridge will send from when no `from` is given. */
  sender?: string;
  error?: string;
}

export interface InlineImageInput {
  /** CID key — reference in the HTML body as <img src="cid:KEY"> */
  key: string;
  /** Hosted URL (fetched by the bridge) OR a base64 data: URL. */
  url: string;
  name?: string;
  mimeType?: string;
}

export interface SendEmailInput {
  to: string | string[];
  cc?: string | string[];
  subject: string;
  body: string;
  isHtml?: boolean;
  /**
   * From address. Defaults to the "default sender" saved on Admin →
   * Communication Settings. With the Outlook/Microsoft 365 bridge provider
   * this picks the sending mailbox; with Gmail it must be a "Send mail as"
   * alias of the bridge account (otherwise the bridge uses its own address).
   */
  from?: string;
  /** Sender display name. Defaults to the configured sender name. */
  fromName?: string;
  attachments?: EmailAttachment[];
  inlineImages?: InlineImageInput[];
}

export interface EmailDiagnostics {
  ok: boolean;
  error?: string;
  quotaRemaining?: number;
  provider?: 'gmail' | 'graph' | string;
  sender?: string;
}

export const isEmailConfigured = (): boolean => isEmailBridgeConfigured();

const REQUEST_TIMEOUT_MS = 30_000;
const MAX_ATTEMPTS = 3;

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

const fetchWithTimeout = async (url: string, init: RequestInit = {}): Promise<Response> => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
};

/** Network / 5xx failures are retried; logical bridge errors are not. */
const requestBridge = async <T extends { ok: boolean; error?: string }>(url: string, init?: RequestInit): Promise<T> => {
  let lastError: any = null;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const res = await fetchWithTimeout(url, init);
      if (res.status >= 500) {
        lastError = new Error(`The email bridge returned HTTP ${res.status} (Google-side hiccup).`);
      } else if (!res.ok) {
        throw new Error(`The email bridge returned HTTP ${res.status} — check the deployment URL on Admin → Communication Settings.`);
      } else {
        return (await res.json()) as T;
      }
    } catch (e: any) {
      if (e?.name === 'AbortError') {
        lastError = new Error('The email bridge did not respond within 30 seconds.');
      } else if (e instanceof TypeError) {
        // fetch() network failure (offline, DNS, CORS, blocked)
        lastError = new Error('Could not reach the email bridge — check your internet connection and the bridge URL.');
      } else {
        throw e; // non-retryable
      }
    }
    if (attempt < MAX_ATTEMPTS) await sleep(1000 * attempt);
  }
  throw lastError || new Error('Email bridge request failed.');
};

const friendlyBridgeError = (raw: string | undefined): string => {
  const msg = raw || 'Unknown bridge error';
  if (/bad secret/i.test(msg)) return 'The shared secret does not match the bridge — fix it on Admin → Communication Settings (it must equal the SHARED_SECRET in the Apps Script\'s Script Properties).';
  if (/SHARED_SECRET not configured/i.test(msg)) return 'The bridge has no SHARED_SECRET set — add it in the Apps Script project settings (see SETUP-EMAIL.md, step 3).';
  if (/service invoked too many times|quota/i.test(msg)) return 'Gmail\'s daily send quota is exhausted (100/day on free Gmail). It resets at midnight Pacific Time.';
  if (/AADSTS7000215|invalid_client/i.test(msg)) return 'Microsoft sign-in failed: the MS_CLIENT_SECRET in the Apps Script properties is wrong or expired — create a new client secret in Entra and update it (SETUP-EMAIL.md, Outlook section).';
  if (/AADSTS700016|AADSTS90002/i.test(msg)) return 'Microsoft sign-in failed: MS_CLIENT_ID or MS_TENANT_ID in the Apps Script properties does not match the Entra app registration.';
  if (/ErrorAccessDenied|Access is denied|Authorization_RequestDenied|Insufficient privileges/i.test(msg)) return 'Outlook refused the send: grant the app the Mail.Send APPLICATION permission in Entra and click "Grant admin consent" (SETUP-EMAIL.md, Outlook section).';
  if (/ErrorInvalidUser|MailboxNotEnabledForRESTAPI|ResourceNotFound/i.test(msg)) return 'Outlook refused the send: the sender mailbox does not exist or has no Exchange Online licence — check the default sender address.';
  return msg;
};

const parseDataUrl = (dataUrl: string): { mimeType: string; data: string } | null => {
  const m = /^data:([^;,]+)?(?:;charset=[^;,]+)?;base64,(.+)$/s.exec(dataUrl);
  if (!m) return null;
  return { mimeType: m[1] || 'application/octet-stream', data: m[2] };
};

/** Map an attachment/inline-image ref to the bridge wire format. */
const toWireRef = (ref: { url: string; name?: string; mimeType?: string; key?: string }): any => {
  const out: any = { name: ref.name, mimeType: ref.mimeType };
  if (ref.key) out.key = ref.key;
  if (ref.url.startsWith('data:')) {
    const parsed = parseDataUrl(ref.url);
    if (parsed) {
      out.data = parsed.data;
      if (!out.mimeType) out.mimeType = parsed.mimeType;
      return out;
    }
  }
  out.url = ref.url;
  return out;
};

const notConfiguredError = () =>
  new Error('Email is not configured. A master user can set the bridge URL and secret on Admin → Communication Settings (no rebuild needed) — see SETUP-EMAIL.md for creating the bridge.');

const toMessage = (m: GasMessage): EmailMessage => ({
  id: m.id,
  direction: 'inbound',
  from: m.from,
  to: m.to,
  cc: m.cc,
  subject: m.subject,
  body: m.body,
  snippet: m.snippet,
  date: m.date,
  threadId: m.threadId,
  isRead: m.isRead,
});

export const emailService = {
  async listInbox(limit = 50): Promise<EmailMessage[]> {
    if (!isEmailConfigured()) throw notConfiguredError();
    const cfg = getEmailBridgeConfig();
    const url = `${cfg.endpoint}?action=list&secret=${encodeURIComponent(cfg.secret)}&limit=${limit}`;
    const data = await requestBridge<ListResponse>(url, { method: 'GET' });
    if (!data.ok) throw new Error(friendlyBridgeError(data.error));
    return (data.messages || []).map(toMessage);
  },

  async sendEmail(input: SendEmailInput): Promise<{ quotaRemaining?: number }> {
    if (!isEmailConfigured()) throw notConfiguredError();
    const cfg = getEmailBridgeConfig();
    const url = `${cfg.endpoint}?secret=${encodeURIComponent(cfg.secret)}`;
    const body: any = {
      to: input.to,
      cc: input.cc,
      subject: input.subject,
      body: input.body,
      isHtml: !!input.isHtml,
      attachments: (input.attachments || []).map(a => toWireRef(a)),
    };
    const from = (input.from || cfg.senderEmail || '').trim();
    const fromName = (input.fromName || cfg.senderName || '').trim();
    if (from) body.from = from;
    if (fromName) body.fromName = fromName;
    if (input.inlineImages && input.inlineImages.length) {
      body.inlineImages = input.inlineImages.map(img => toWireRef(img));
    }
    // GAS Web Apps require a redirect-follow + plain Content-Type to avoid CORS preflight.
    const data = await requestBridge<SendResponse>(url, {
      method: 'POST',
      redirect: 'follow',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(body),
    });
    if (!data.ok) throw new Error(friendlyBridgeError(data.error));
    return { quotaRemaining: data.quotaRemaining };
  },

  /**
   * Pings the bridge and reports exactly what is wrong (nothing configured,
   * unreachable URL, secret mismatch, ...). Uses action=ping on an updated
   * bridge and falls back to action=list on older deployments.
   */
  async testConnection(): Promise<EmailDiagnostics> {
    if (!isEmailConfigured()) {
      return {
        ok: false,
        error: 'No email bridge is configured. Set the bridge URL and shared secret on Admin → Communication Settings, or bake VITE_EMAIL_ENDPOINT / VITE_EMAIL_SHARED_SECRET into the build. See SETUP-EMAIL.md.',
      };
    }
    const cfg = getEmailBridgeConfig();
    try {
      let data = await requestBridge<SendResponse & ListResponse>(
        `${cfg.endpoint}?action=ping&secret=${encodeURIComponent(cfg.secret)}`
      );
      if (!data.ok && /unknown action/i.test(data.error || '')) {
        // Older bridge deployment without ping — list is an equivalent health check.
        data = await requestBridge<SendResponse & ListResponse>(
          `${cfg.endpoint}?action=list&secret=${encodeURIComponent(cfg.secret)}&limit=1`
        );
      }
      if (!data.ok) return { ok: false, error: friendlyBridgeError(data.error) };
      return { ok: true, quotaRemaining: data.quotaRemaining, provider: data.provider, sender: data.sender };
    } catch (e: any) {
      return { ok: false, error: String(e?.message || e) };
    }
  },
};
