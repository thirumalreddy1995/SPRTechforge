// Seminar module test suite — pure-logic assertions over the import pipeline,
// normalization, header detection, templating and A/B rotation. Runs in the
// browser from Seminar → Dashboard → "Run Module Tests", following the app's
// existing in-app TestRunner convention (pages/admin/TestRunner.tsx); the
// project has no Node-based test runner.

import { normalizePhone, isValidEmail, normalizeEmail, dedupeKey } from '../lib/normalize';
import { detectMapping, buildSheetMapping, sheetSkipReason } from '../lib/headerMatch';
import { buildCandidatesFromSheets } from '../lib/importer';
import { escapeHtml, renderTemplate, pickSubjectVariant } from '../lib/template';
import { generateInviteToken } from '../lib/token';
import { SeminarCandidate } from '../types';

export interface SeminarTestResult {
  name: string;
  status: 'PASS' | 'FAIL';
  message: string;
  duration: number;
}

const assert = (cond: boolean, msg: string) => {
  if (!cond) throw new Error(msg);
};

const TESTS: { name: string; fn: () => void }[] = [
  {
    name: 'Phone: 10 digits get +91',
    fn: () => assert(normalizePhone('98491 23456') === '+919849123456', `got ${normalizePhone('98491 23456')}`),
  },
  {
    name: 'Phone: 91-prefixed 12 digits become +91',
    fn: () => assert(normalizePhone('919849123456') === '+919849123456', `got ${normalizePhone('919849123456')}`),
  },
  {
    name: 'Phone: leading 0 dropped, spaces/dashes stripped',
    fn: () => assert(normalizePhone('098-491 234-56') === '+919849123456', `got ${normalizePhone('098-491 234-56')}`),
  },
  {
    name: 'Phone: existing + kept as-is',
    fn: () => assert(normalizePhone('+91 98491-23456') === '+919849123456', `got ${normalizePhone('+91 98491-23456')}`),
  },
  {
    name: 'Phone: garbage rejected',
    fn: () => {
      assert(normalizePhone('12345') === '', 'short number should be invalid');
      assert(normalizePhone('not a phone') === '', 'text should be invalid');
      assert(normalizePhone('') === '', 'empty should be invalid');
    },
  },
  {
    name: 'Email: validation and lowercasing',
    fn: () => {
      assert(isValidEmail('Person@Example.COM'), 'valid email rejected');
      assert(!isValidEmail('bad@@example'), 'invalid email accepted');
      assert(!isValidEmail('no-at-sign.com'), 'invalid email accepted');
      assert(normalizeEmail('  Person@Example.COM ') === 'person@example.com', 'not lowercased/trimmed');
    },
  },
  {
    name: 'Dedupe key: email first, phone fallback',
    fn: () => {
      assert(dedupeKey('a@b.co', '+911234567890') === 'e:a@b.co', 'email should win');
      assert(dedupeKey('', '+911234567890') === 'p:+911234567890', 'phone fallback failed');
      assert(dedupeKey('invalid-email', '') === '', 'invalid identity should be empty');
    },
  },
  {
    name: 'Headers: fuzzy detection (Full Name / E-mail ID / WhatsApp No)',
    fn: () => {
      const m = detectMapping(['S.No', 'Full Name', 'E-mail ID', 'WhatsApp No', 'City', 'Qualification / Degree']);
      assert(m.fullName === 1, `fullName got col ${m.fullName}`);
      assert(m.email === 2, `email got col ${m.email}`);
      assert(m.phone === 3, `phone got col ${m.phone}`);
      assert(m.city === 4, `city got col ${m.city}`);
      assert(m.qualification === 5, `qualification got col ${m.qualification}`);
    },
  },
  {
    name: 'Headers: full template format detected (12 columns, S.No ignored)',
    fn: () => {
      const m = detectMapping([
        'S.No', 'Full Name', 'Email', 'Phone', 'Gender', 'State', 'City',
        'Qualification / Degree', 'Course / Stream', 'Institution',
        'Year of Passing', 'Total Experience (Years)',
      ]);
      assert(m.fullName === 1, `fullName got col ${m.fullName}`);
      assert(m.email === 2, `email got col ${m.email}`);
      assert(m.phone === 3, `phone got col ${m.phone}`);
      assert(m.gender === 4, `gender got col ${m.gender}`);
      assert(m.state === 5, `state got col ${m.state}`);
      assert(m.city === 6, `city got col ${m.city}`);
      assert(m.qualification === 7, `qualification got col ${m.qualification}`);
      assert(m.courseStream === 8, `courseStream got col ${m.courseStream}`);
      assert(m.institution === 9, `institution got col ${m.institution}`);
      assert(m.yearOfPassing === 10, `yearOfPassing got col ${m.yearOfPassing}`);
      assert(m.totalExperience === 11, `totalExperience got col ${m.totalExperience}`);
    },
  },
  {
    name: 'Headers: summary sheet is auto-skipped',
    fn: () => {
      const m = detectMapping(['Degree', 'Count', 'Percentage']);
      assert(!!sheetSkipReason(m), 'summary sheet should be skipped');
    },
  },
  {
    name: 'Sheet parse: header row found after blank rows',
    fn: () => {
      const sheet = buildSheetMapping('B.Tech-BE', [
        ['', '', ''],
        ['Full Name', 'Email', 'Phone'],
        ['Asha', 'asha@x.com', '9849123456'],
      ]);
      assert(sheet.headers[0] === 'Full Name', 'header row not detected');
      assert(sheet.rows.length === 1, `expected 1 data row, got ${sheet.rows.length}`);
      assert(sheet.included, 'sheet should be included');
    },
  },
  {
    name: 'Import: new rows get token + pending status',
    fn: () => {
      const sheet = buildSheetMapping('MCA', [
        ['Name', 'Email', 'Mobile'],
        ['Ravi', 'ravi@x.com', '9849100001'],
        ['Sita', 'sita@x.com', '9849100002'],
      ]);
      const { upserts, reports } = buildCandidatesFromSheets([sheet], []);
      assert(upserts.length === 2, `expected 2 upserts, got ${upserts.length}`);
      assert(reports[0].imported === 2, `expected 2 imported, got ${reports[0].imported}`);
      assert(upserts.every(u => u.inviteToken.length >= 20), 'tokens missing/short');
      assert(upserts.every(u => u.emailStatus === 'pending'), 'status should be pending');
      assert(upserts[0].degreeGroup === 'MCA', 'degreeGroup should be the sheet name');
      assert(upserts[0].phone === '+919849100001', 'phone not normalized');
    },
  },
  {
    name: 'Import: re-upload merges (upsert), never duplicates',
    fn: () => {
      const existing: SeminarCandidate[] = [{
        id: 'c1', fullName: 'Old Name', email: 'ravi@x.com', phone: '+919849100001',
        degreeGroup: 'MCA', inviteToken: 'TOK-EXISTING', emailStatus: 'sent',
        subjectVariant: 'A', createdAt: '2026-01-01T00:00:00Z',
      }];
      const sheet = buildSheetMapping('MCA', [
        ['Name', 'Email', 'Mobile', 'City'],
        ['Ravi Kumar', 'RAVI@X.COM', '9849100001', 'Hyderabad'],
      ]);
      const { upserts, reports } = buildCandidatesFromSheets([sheet], existing);
      assert(reports[0].merged === 1 && reports[0].imported === 0, `merged=${reports[0].merged} imported=${reports[0].imported}`);
      assert(upserts[0].id === 'c1', 'must keep the existing id');
      assert(upserts[0].inviteToken === 'TOK-EXISTING', 'must keep the existing token');
      assert(upserts[0].emailStatus === 'sent', 'must keep send status');
      assert(upserts[0].fullName === 'Ravi Kumar' && upserts[0].city === 'Hyderabad', 'fields not refreshed');
    },
  },
  {
    name: 'Import: duplicates within one file counted once',
    fn: () => {
      const sheet = buildSheetMapping('BCA', [
        ['Name', 'Email', 'Phone'],
        ['A', 'same@x.com', '9849100001'],
        ['A again', 'same@x.com', '9849100009'],
      ]);
      const { upserts, reports } = buildCandidatesFromSheets([sheet], []);
      assert(upserts.length === 1, `expected 1 upsert, got ${upserts.length}`);
      assert(reports[0].duplicatesInFile === 1, `expected 1 duplicate, got ${reports[0].duplicatesInFile}`);
    },
  },
  {
    name: 'Import: invalid email falls back to phone; both invalid is skipped',
    fn: () => {
      const sheet = buildSheetMapping('MBA-PGDM', [
        ['Name', 'Email', 'Phone'],
        ['P1', 'not-an-email', '9849100001'],
        ['P2', 'also bad', '12'],
      ]);
      const { upserts, reports } = buildCandidatesFromSheets([sheet], []);
      assert(upserts.length === 1, `expected 1 upsert, got ${upserts.length}`);
      assert(upserts[0].email === '' && upserts[0].phone === '+919849100001', 'phone fallback failed');
      assert(reports[0].invalidEmail === 2, `invalidEmail expected 2, got ${reports[0].invalidEmail}`);
      assert(reports[0].invalidPhone === 1, `invalidPhone expected 1, got ${reports[0].invalidPhone}`);
      assert(reports[0].skippedRows === 1, `skippedRows expected 1, got ${reports[0].skippedRows}`);
    },
  },
  {
    name: 'Template: candidate data is escaped, admin HTML is not',
    fn: () => {
      const out = renderTemplate('<b>Hi {name}</b>', { name: '<script>alert(1)</script>' }, true);
      assert(out.includes('<b>'), 'admin HTML must be preserved');
      assert(!out.includes('<script>'), 'candidate data must be escaped');
      assert(out.includes('&lt;script&gt;'), 'escaped entity missing');
    },
  },
  {
    name: 'Template: unescaped mode for subjects/WhatsApp',
    fn: () => {
      const out = renderTemplate('Hi {name}, link: {link}', { name: "D'Souza", link: 'https://x/#/s/t?a=1' }, false);
      assert(out === "Hi D'Souza, link: https://x/#/s/t?a=1", `got ${out}`);
    },
  },
  {
    name: 'escapeHtml covers the critical characters',
    fn: () => {
      assert(escapeHtml(`<>&"'`) === '&lt;&gt;&amp;&quot;&#39;', `got ${escapeHtml(`<>&"'`)}`);
    },
  },
  {
    name: 'A/B rotation is 50/50 and deterministic',
    fn: () => {
      const seq = [0, 1, 2, 3].map(pickSubjectVariant);
      assert(seq.join('') === 'ABAB', `got ${seq.join('')}`);
    },
  },
  {
    name: 'Invite tokens: URL-safe and unique',
    fn: () => {
      const tokens = new Set(Array.from({ length: 200 }, () => generateInviteToken()));
      assert(tokens.size === 200, 'token collision in 200 draws');
      tokens.forEach(t => assert(/^[A-Za-z0-9_-]+$/.test(t), `non-URL-safe token: ${t}`));
    },
  },
];

export const runSeminarTests = (): SeminarTestResult[] =>
  TESTS.map(t => {
    const start = performance.now();
    try {
      t.fn();
      return { name: t.name, status: 'PASS' as const, message: 'OK', duration: performance.now() - start };
    } catch (e: any) {
      return { name: t.name, status: 'FAIL' as const, message: e.message || String(e), duration: performance.now() - start };
    }
  });
