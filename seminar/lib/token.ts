// URL-safe invite token — browser equivalent of Python's secrets.token_urlsafe.
// 18 random bytes -> 24 base64url chars.

export const generateInviteToken = (bytes = 18): string => {
  const buf = new Uint8Array(bytes);
  crypto.getRandomValues(buf);
  let bin = '';
  buf.forEach(b => { bin += String.fromCharCode(b); });
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};

// Firestore document id for seminar records (sortable, collision-safe).
export const generateSeminarId = (prefix: string): string =>
  `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
