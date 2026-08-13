// Single shared IST date/time utility for the events module.
// Rule: STORE UTC ISO strings, DISPLAY IST — always via these helpers, never
// ad-hoc toLocaleString calls, so timezone logic lives in exactly one file.
// IST is a fixed UTC+05:30 with no DST, so the input<->UTC conversion is pure
// arithmetic and needs no library.

export const IST_TZ = 'Asia/Kolkata';
const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;

export const isValidIso = (iso: string): boolean => !!iso && !isNaN(new Date(iso).getTime());

/** "Sat, 15 Aug 2026" */
export const formatISTDate = (iso: string): string => {
  if (!isValidIso(iso)) return '';
  return new Date(iso).toLocaleDateString('en-IN', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric', timeZone: IST_TZ,
  });
};

/** "11:00 AM" */
export const formatISTTime = (iso: string): string => {
  if (!isValidIso(iso)) return '';
  return new Date(iso).toLocaleTimeString('en-IN', {
    hour: 'numeric', minute: '2-digit', timeZone: IST_TZ,
  });
};

/** "Sat, 15 Aug 2026, 11:00 AM IST" */
export const formatISTDateTime = (iso: string): string => {
  if (!isValidIso(iso)) return '';
  return `${formatISTDate(iso)}, ${formatISTTime(iso)} IST`;
};

/** "Sat, 15 Aug 2026 · 11:00 AM – 1:00 PM IST" (same-day) or full range across days. */
export const formatISTRange = (startIso: string, endIso: string): string => {
  if (!isValidIso(startIso)) return '';
  if (!isValidIso(endIso)) return formatISTDateTime(startIso);
  const sameDay = formatISTDate(startIso) === formatISTDate(endIso);
  return sameDay
    ? `${formatISTDate(startIso)} · ${formatISTTime(startIso)} – ${formatISTTime(endIso)} IST`
    : `${formatISTDateTime(startIso)} → ${formatISTDateTime(endIso)}`;
};

/**
 * <input type="datetime-local"> value (interpreted as IST wall time) → UTC ISO.
 * Works regardless of the admin's browser timezone.
 */
export const istInputToUtcIso = (input: string): string => {
  if (!input) return '';
  const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(input);
  if (!m) return '';
  const [, y, mo, d, h, mi] = m;
  const utcMs = Date.UTC(+y, +mo - 1, +d, +h, +mi) - IST_OFFSET_MS;
  return new Date(utcMs).toISOString();
};

/** UTC ISO → value for <input type="datetime-local"> showing IST wall time. */
export const utcIsoToIstInput = (iso: string): string => {
  if (!isValidIso(iso)) return '';
  const shifted = new Date(new Date(iso).getTime() + IST_OFFSET_MS);
  const p = (n: number) => String(n).padStart(2, '0');
  return `${shifted.getUTCFullYear()}-${p(shifted.getUTCMonth() + 1)}-${p(shifted.getUTCDate())}T${p(shifted.getUTCHours())}:${p(shifted.getUTCMinutes())}`;
};

/** Human "in 3 days" / "2 hours ago" for admin lists. */
export const relativeToNow = (iso: string): string => {
  if (!isValidIso(iso)) return '';
  const diff = new Date(iso).getTime() - Date.now();
  const abs = Math.abs(diff);
  const mins = Math.round(abs / 60000);
  const label =
    mins < 60 ? `${mins} min` :
    mins < 60 * 24 ? `${Math.round(mins / 60)} hour${Math.round(mins / 60) === 1 ? '' : 's'}` :
    `${Math.round(mins / 60 / 24)} day${Math.round(mins / 60 / 24) === 1 ? '' : 's'}`;
  return diff >= 0 ? `in ${label}` : `${label} ago`;
};
