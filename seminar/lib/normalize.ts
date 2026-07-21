// Pure normalization/validation helpers. Kept dependency-free so the in-app
// test suite (seminar/tests) can exercise them directly.

const EMAIL_RE = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

export const isValidEmail = (email: string): boolean => EMAIL_RE.test(email.trim());

export const normalizeEmail = (email: any): string => String(email ?? '').trim().toLowerCase();

/**
 * Normalize a phone number to E.164.
 * Rules (India-first, per the import spec):
 *  - strip spaces, dashes, dots, parentheses
 *  - `+<11-15 digits>` is kept as-is
 *  - 10 digits            -> +91XXXXXXXXXX
 *  - 11 digits, leading 0 -> drop the 0, then +91
 *  - 12 digits, leading 91-> +91XXXXXXXXXX
 * Returns '' when the value cannot be normalized.
 */
export const normalizePhone = (raw: any): string => {
  if (raw === null || raw === undefined) return '';
  let s = String(raw).trim();
  if (!s) return '';
  const hasPlus = s.startsWith('+');
  const digits = s.replace(/[^0-9]/g, '');
  if (!digits) return '';
  if (hasPlus) {
    return digits.length >= 11 && digits.length <= 15 ? `+${digits}` : '';
  }
  if (digits.length === 10) return `+91${digits}`;
  if (digits.length === 11 && digits.startsWith('0')) return `+91${digits.slice(1)}`;
  if (digits.length === 12 && digits.startsWith('91')) return `+${digits}`;
  return '';
};

export const cleanText = (v: any): string =>
  String(v ?? '').replace(/\s+/g, ' ').trim();

/**
 * Dedupe key for a candidate: lowercase email when present, otherwise the
 * normalized phone. '' means the row has no usable identity.
 */
export const dedupeKey = (email: string, phone: string): string => {
  const e = normalizeEmail(email);
  if (e && isValidEmail(e)) return `e:${e}`;
  if (phone) return `p:${phone}`;
  return '';
};
