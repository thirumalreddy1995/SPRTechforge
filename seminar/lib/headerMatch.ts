import { SeminarField, SheetMapping } from '../types';

// Fuzzy, case-insensitive header detection. Headers are normalized to
// lowercase alphanumerics before matching, so "E-mail ID", "Email", "MAIL id"
// all resolve to the email column.

const SYNONYMS: Record<SeminarField, string[]> = {
  fullName: ['fullname', 'name', 'candidatename', 'student', 'studentname', 'candidate'],
  email: ['email', 'emailid', 'emailaddress', 'mail', 'mailid'],
  phone: ['phone', 'phoneno', 'phonenumber', 'mobile', 'mobileno', 'mobilenumber', 'contact', 'contactno', 'contactnumber', 'whatsapp', 'whatsappno', 'whatsappnumber'],
  city: ['city', 'location', 'town'],
  state: ['state'],
  qualification: ['qualification', 'degree', 'qualificationdegree', 'education', 'course'],
};

export const normalizeHeader = (h: any): string =>
  String(h ?? '').toLowerCase().replace(/[^a-z0-9]/g, '');

/**
 * Score a header against a field's synonym list.
 * Exact match beats prefix/contains; 0 = no match.
 */
const scoreHeader = (header: string, field: SeminarField): number => {
  const h = normalizeHeader(header);
  if (!h) return 0;
  let best = 0;
  for (const syn of SYNONYMS[field]) {
    if (h === syn) best = Math.max(best, 100);
    else if (h.startsWith(syn) || h.endsWith(syn)) best = Math.max(best, 60);
    else if (h.includes(syn) && syn.length >= 4) best = Math.max(best, 40);
  }
  return best;
};

export const SEMINAR_FIELDS: SeminarField[] = ['fullName', 'email', 'phone', 'city', 'state', 'qualification'];

export const FIELD_LABELS: Record<SeminarField, string> = {
  fullName: 'Name',
  email: 'Email',
  phone: 'Phone',
  city: 'City',
  state: 'State',
  qualification: 'Qualification / Degree',
};

/**
 * Detect the best column index for each field. Each column is used at most
 * once; higher scores win. Returns -1 for undetected fields.
 */
export const detectMapping = (headers: any[]): Record<SeminarField, number> => {
  const mapping = {
    fullName: -1, email: -1, phone: -1, city: -1, state: -1, qualification: -1,
  } as Record<SeminarField, number>;

  // Collect all (field, column, score) candidates, assign greedily by score.
  const scored: { field: SeminarField; col: number; score: number }[] = [];
  headers.forEach((h, col) => {
    SEMINAR_FIELDS.forEach(field => {
      const score = scoreHeader(String(h ?? ''), field);
      if (score > 0) scored.push({ field, col, score });
    });
  });
  scored.sort((a, b) => b.score - a.score);

  const usedCols = new Set<number>();
  for (const { field, col, score } of scored) {
    if (mapping[field] !== -1 || usedCols.has(col)) continue;
    if (score < 40) continue;
    mapping[field] = col;
    usedCols.add(col);
  }
  return mapping;
};

/**
 * A sheet is importable when it has a name column plus at least one contact
 * column (email or phone). Summary/pivot sheets fail this and are auto-skipped.
 */
export const sheetSkipReason = (mapping: Record<SeminarField, number>): string | undefined => {
  if (mapping.fullName === -1) return 'No name column detected';
  if (mapping.email === -1 && mapping.phone === -1) return 'No email or phone column detected';
  return undefined;
};

/** Build the initial SheetMapping for a parsed sheet (header row + data rows). */
export const buildSheetMapping = (sheetName: string, allRows: any[][]): SheetMapping => {
  // First non-empty row is treated as the header row.
  let headerIdx = 0;
  while (headerIdx < allRows.length && allRows[headerIdx].every(c => cleanCell(c) === '')) headerIdx++;
  const headers = (allRows[headerIdx] || []).map(c => cleanCell(c));
  const rows = allRows.slice(headerIdx + 1).filter(r => r.some(c => cleanCell(c) !== ''));
  const mapping = detectMapping(headers);
  const skipReason = sheetSkipReason(mapping);
  return { sheetName, headers, mapping, rows, included: !skipReason, skipReason };
};

const cleanCell = (c: any): string => String(c ?? '').trim();
