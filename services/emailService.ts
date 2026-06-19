import { EmailMessage, EmailAttachment } from '../types';

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
  quotaRemaining?: number;
  error?: string;
}

export interface SendEmailInput {
  to: string | string[];
  cc?: string | string[];
  subject: string;
  body: string;
  isHtml?: boolean;
  attachments?: EmailAttachment[];
}

const env = (import.meta as any).env ?? {};

const cfg = {
  endpoint: (env.VITE_EMAIL_ENDPOINT as string) || '',
  secret: (env.VITE_EMAIL_SHARED_SECRET as string) || '',
};

export const isEmailConfigured = (): boolean => !!cfg.endpoint && !!cfg.secret;

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
    if (!isEmailConfigured()) throw new Error('Email is not configured (set VITE_EMAIL_ENDPOINT and VITE_EMAIL_SHARED_SECRET).');
    const url = `${cfg.endpoint}?action=list&secret=${encodeURIComponent(cfg.secret)}&limit=${limit}`;
    const res = await fetch(url, { method: 'GET' });
    if (!res.ok) throw new Error(`Email bridge returned ${res.status}`);
    const data: ListResponse = await res.json();
    if (!data.ok) throw new Error(data.error || 'Email bridge error');
    return (data.messages || []).map(toMessage);
  },

  async sendEmail(input: SendEmailInput): Promise<void> {
    if (!isEmailConfigured()) throw new Error('Email is not configured (set VITE_EMAIL_ENDPOINT and VITE_EMAIL_SHARED_SECRET).');
    const url = `${cfg.endpoint}?secret=${encodeURIComponent(cfg.secret)}`;
    const body = {
      to: input.to,
      cc: input.cc,
      subject: input.subject,
      body: input.body,
      isHtml: !!input.isHtml,
      attachments: (input.attachments || []).map(a => ({
        url: a.url,
        name: a.name,
        mimeType: a.mimeType,
      })),
    };
    // GAS Web Apps require a redirect-follow + plain Content-Type to avoid CORS preflight.
    const res = await fetch(url, {
      method: 'POST',
      redirect: 'follow',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`Email bridge returned ${res.status}`);
    const data: SendResponse = await res.json();
    if (!data.ok) throw new Error(data.error || 'Send failed');
  },
};
