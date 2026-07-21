import { SeminarCandidate, SheetImportReport, SheetMapping } from '../types';
import { cleanText, dedupeKey, isValidEmail, normalizeEmail, normalizePhone } from './normalize';
import { generateInviteToken, generateSeminarId } from './token';

// Pure import pipeline: (parsed sheets + existing candidates) -> (upserts + report).
// Re-imports merge on lowercase email (fallback: phone) so repeated uploads
// never create duplicates. Exercised directly by seminar/tests.

export interface ImportResult {
  upserts: SeminarCandidate[];
  reports: SheetImportReport[];
}

export const buildCandidatesFromSheets = (
  sheets: SheetMapping[],
  existing: SeminarCandidate[],
): ImportResult => {
  const now = new Date().toISOString();

  // Index existing candidates by dedupe key (email first, phone fallback).
  const existingByKey = new Map<string, SeminarCandidate>();
  existing.forEach(c => {
    if (c.email) existingByKey.set(`e:${c.email}`, c);
    if (c.phone && !existingByKey.has(`p:${c.phone}`)) existingByKey.set(`p:${c.phone}`, c);
  });

  const seenInFile = new Set<string>();
  const upsertsById = new Map<string, SeminarCandidate>();
  const reports: SheetImportReport[] = [];

  for (const sheet of sheets) {
    if (!sheet.included) continue;
    const m = sheet.mapping;
    if (m.fullName === -1 || (m.email === -1 && m.phone === -1)) continue;

    const report: SheetImportReport = {
      sheetName: sheet.sheetName,
      imported: 0,
      merged: 0,
      duplicatesInFile: 0,
      invalidEmail: 0,
      invalidPhone: 0,
      skippedRows: 0,
    };

    for (const row of sheet.rows) {
      const cell = (idx: number) => (idx >= 0 ? row[idx] : undefined);

      const fullName = cleanText(cell(m.fullName));
      const rawEmail = cleanText(cell(m.email));
      const rawPhone = cleanText(cell(m.phone));

      const email = normalizeEmail(rawEmail);
      const emailOk = !!email && isValidEmail(email);
      if (rawEmail && !emailOk) report.invalidEmail++;

      const phone = normalizePhone(rawPhone);
      if (rawPhone && !phone) report.invalidPhone++;

      const key = dedupeKey(emailOk ? email : '', phone);
      if (!fullName || !key) {
        report.skippedRows++;
        continue;
      }
      if (seenInFile.has(key)) {
        report.duplicatesInFile++;
        continue;
      }
      seenInFile.add(key);

      const fields = {
        fullName,
        email: emailOk ? email : '',
        phone,
        city: cleanText(cell(m.city)) || undefined,
        state: cleanText(cell(m.state)) || undefined,
        qualification: cleanText(cell(m.qualification)) || undefined,
        degreeGroup: sheet.sheetName,
      };

      const match =
        (emailOk && existingByKey.get(`e:${email}`)) ||
        (phone && existingByKey.get(`p:${phone}`)) ||
        undefined;

      if (match) {
        // Upsert: refresh contact fields, preserve identity + send state.
        upsertsById.set(match.id, { ...match, ...fields, updatedAt: now });
        report.merged++;
      } else {
        const candidate: SeminarCandidate = {
          id: generateSeminarId('semc'),
          ...fields,
          inviteToken: generateInviteToken(),
          emailStatus: 'pending',
          createdAt: now,
        };
        upsertsById.set(candidate.id, candidate);
        // Register under both identities so later rows/sheets in this file
        // merge whether they match by email or by phone.
        if (candidate.email) existingByKey.set(`e:${candidate.email}`, candidate);
        if (candidate.phone) existingByKey.set(`p:${candidate.phone}`, candidate);
        report.imported++;
      }
    }

    reports.push(report);
  }

  return { upserts: Array.from(upsertsById.values()), reports };
};
