// Seminar mailer — thin wrapper over the app's unified email core
// (services/emailService.ts). All transport concerns (runtime config, retry,
// timeouts, error mapping) live there; this module only composes the
// banner-on-top HTML and picks the right banner delivery mode.
//
// Banner delivery:
//  - hosted URL banner + bannerInline=false → referenced by URL (any bridge)
//  - hosted URL banner + bannerInline=true  → CID inline attachment
//  - data: URL banner (the Storage-down inline-upload fallback) → ALWAYS CID,
//    because Gmail strips data: URIs from <img src>. The updated bridge
//    decodes the base64 payload server-side.

import { emailService, isEmailConfigured, EmailDiagnostics } from '../../services/emailService';

export const isSeminarMailerConfigured = (): boolean => isEmailConfigured();

export interface SeminarEmailInput {
  to: string;
  subject: string;
  html: string;
  /** Public URL (or data: URL) of the banner image shown at the top of the email. */
  bannerUrl?: string;
  bannerAlt?: string;
  /**
   * true = embed as CID inline attachment (needs the updated bridge deployed);
   * false/omitted = reference the hosted URL (works with any bridge version).
   * data: URL banners are always CID-embedded regardless of this flag.
   */
  bannerInline?: boolean;
  /** Sender display name (the address is the bridge's Gmail account). */
  fromName?: string;
}

/** Pings the bridge and reports exactly what's wrong. */
export const testSeminarConnection = async (): Promise<EmailDiagnostics> => emailService.testConnection();

const BANNER_CID = 'seminar-banner';

/**
 * Wrap the rendered body with the banner image. Uses cid: when the banner will
 * be sent as an inline attachment; alt text keeps the email readable when
 * images are blocked.
 */
export const composeEmailHtml = (bodyHtml: string, bannerUrl: string | undefined, bannerAlt: string, inline: boolean): string => {
  const banner = bannerUrl
    ? `<div style="max-width:600px;margin:0 auto 16px auto;"><img src="${inline ? `cid:${BANNER_CID}` : bannerUrl}" alt="${bannerAlt}" style="width:100%;max-width:600px;height:auto;display:block;border-radius:8px;"/></div>`
    : '';
  return `${banner}${bodyHtml}`;
};

export const sendSeminarEmail = async (input: SeminarEmailInput): Promise<void> => {
  const isDataUrlBanner = !!input.bannerUrl && input.bannerUrl.startsWith('data:');
  const useInline = !!input.bannerUrl && (!!input.bannerInline || isDataUrlBanner);
  const html = composeEmailHtml(input.html, input.bannerUrl, input.bannerAlt || 'Seminar banner', useInline);

  await emailService.sendEmail({
    to: input.to,
    subject: input.subject,
    body: html,
    isHtml: true,
    fromName: input.fromName,
    inlineImages: useInline
      ? [{ key: BANNER_CID, url: input.bannerUrl!, name: 'banner' }]
      : undefined,
  });
};
