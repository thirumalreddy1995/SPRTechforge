// Runs the three in-app module suites (Events, Seminar, Community) under Vitest,
// so `npm test` and CI exercise the same pure-logic cases the "Run module tests"
// buttons do inside the app. Each case is a named it() for readable reports.
import { describe, it } from 'vitest';
import { TESTS as EVENTS } from '../events/tests/eventsTests';
import { TESTS as SEMINAR } from '../seminar/tests/seminarTests';
import { TESTS as COMMUNITY } from '../community/tests/communityTests';

const suite = (name: string, cases: { name: string; fn: () => void }[]) =>
  describe(name, () => { for (const c of cases) it(c.name, () => c.fn()); });

suite('Events module', EVENTS);
suite('Seminar module', SEMINAR);
suite('Community module', COMMUNITY);
