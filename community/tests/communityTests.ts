// Community module tests — pure-logic assertions in the app's in-app runner
// style (Community home → "Run module tests", master user only).

import { dayIndex, dayKey, fallbackQuote, learningTipOfTheDay, LEARNING_TIPS, upcomingBirthdays, greetingFor } from '../lib/daily';

export interface CommunityTestResult { name: string; status: 'PASS' | 'FAIL'; message: string }

const assert = (cond: boolean, msg: string) => { if (!cond) throw new Error(msg); };

const TESTS: { name: string; fn: () => void }[] = [
  {
    name: 'Daily rotation: same day → same pick, next day → next pick',
    fn: () => {
      const d1 = new Date(2026, 8, 15, 9), d1b = new Date(2026, 8, 15, 23), d2 = new Date(2026, 8, 16, 1);
      assert(dayIndex(d1) === dayIndex(d1b), 'same calendar day must share an index');
      assert(dayIndex(d2) === dayIndex(d1) + 1, 'next day must be +1');
      assert(dayKey(d1) === '2026-09-15', `dayKey got ${dayKey(d1)}`);
      assert(fallbackQuote(d1).text === fallbackQuote(d1b).text, 'fallback quote must be stable within a day');
      assert(learningTipOfTheDay(d1).title !== learningTipOfTheDay(d2).title, 'tip must change day to day');
      assert(LEARNING_TIPS.length >= 30, 'need at least a month of tips');
    },
  },
  {
    name: 'Birthdays: today, upcoming within window, ISO and dd/mm/yyyy formats, age',
    fn: () => {
      const now = new Date(2026, 8, 15); // 15 Sep 2026
      const hits = upcomingBirthdays([
        { candidateId: 'a', name: 'Asha', dob: '1999-09-15' },
        { candidateId: 'b', name: 'Bala', dob: '17/09/2000' },
        { candidateId: 'c', name: 'Chitra', dob: '2001-09-30' },
        { candidateId: 'd', name: 'Dev', dob: '' },
        { candidateId: 'e', name: 'Esha', dob: '1998-01-02' },
      ], 7, now);
      assert(hits.map(h => h.name).join(',') === 'Asha,Bala', `expected Asha,Bala got ${hits.map(h => h.name).join(',')}`);
      assert(hits[0].inDays === 0 && hits[0].turning === 27, `Asha today turning 27, got ${hits[0].inDays}/${hits[0].turning}`);
      assert(hits[1].inDays === 2, `Bala in 2 days, got ${hits[1].inDays}`);
    },
  },
  {
    name: 'Birthdays: year wrap (late December → early January)',
    fn: () => {
      const now = new Date(2026, 11, 30);
      const hits = upcomingBirthdays([{ candidateId: 'x', name: 'Xavier', dob: '1997-01-02' }], 7, now);
      assert(hits.length === 1 && hits[0].inDays === 3, `expected 3 days, got ${JSON.stringify(hits)}`);
    },
  },
  {
    name: 'Greeting uses first name and time of day',
    fn: () => {
      assert(greetingFor('Thirumal Reddy', new Date(2026, 8, 15, 8)) === 'Good morning, Thirumal', 'morning');
      assert(greetingFor('Thirumal Reddy', new Date(2026, 8, 15, 14)) === 'Good afternoon, Thirumal', 'afternoon');
      assert(greetingFor('', new Date(2026, 8, 15, 20)) === 'Good evening', 'evening, no name');
    },
  },
];

export const runCommunityTests = (): CommunityTestResult[] =>
  TESTS.map(t => {
    try { t.fn(); return { name: t.name, status: 'PASS' as const, message: '' }; }
    catch (e: any) { return { name: t.name, status: 'FAIL' as const, message: String(e?.message || e) }; }
  });
