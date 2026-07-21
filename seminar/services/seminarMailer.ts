// Seminar mailer — talks to the app's existing Google Apps Script email bridge
// (see SETUP-EMAIL.md and apps-script/Code.gs). Same endpoint + shared secret
// env vars as services/emailService.ts, but posts the extra `inlineImages`
// field so the seminar banner is CID-embedded (renders in Gmail/Outlook
// without the "download images" prompt). Requires the bridge to be redeployed
// with the updated Code.gs — see seminar/README.md.

const env = (import.meta as any).env ?? {};

const cfg = {
  endpoint: (env.VITE_EMAIL_ENDPOINT as string) || '',
  secret: (env.VITE_EMAIL_SHARED_SECRET as string) || '',
};

export const isSeminarMailerConfigured = (): boolean => !!cfg.endpoint && !!cfg.secret;

export interface SeminarEmailInput {
  to: string;
  subject: string;
  html: string;
  /** Public URL of the banner image; embedded as CID attachment when set. */
  bannerUrl?: string;
  bannerAlt?: string;
}

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
  if (!isSeminarMailerConfigured()) {
    throw new Error('Email is not configured (set VITE_EMAIL_ENDPOINT and VITE_EMAIL_SHARED_SECRET).');
  }
  const useInline = !!input.bannerUrl;
  const html = composeEmailHtml(input.html, input.bannerUrl, input.bannerAlt || 'Seminar banner', useInline);

  const body: any = {
    to: input.to,
    subject: input.subject,
    body: html,
    isHtml: true,
  };
  if (useInline) {
    body.inlineImages = [{ key: BANNER_CID, url: input.bannerUrl, name: 'banner', mimeType: '' }];
  }

  // GAS Web Apps require redirect-follow + plain Content-Type to avoid CORS preflight.
  const url = `${cfg.endpoint}?secret=${encodeURIComponent(cfg.secret)}`;
  const res = await fetch(url, {
    method: 'POST',
    redirect: 'follow',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Email bridge returned ${res.status}`);
  const data = await res.json();
  if (!data.ok) throw new Error(data.error || 'Send failed');
};
