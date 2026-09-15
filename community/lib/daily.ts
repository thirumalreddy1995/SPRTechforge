// "New every day" content for the Community home: quote of the day (fetched
// online, same quote for everyone on a given day, cached per day in this
// browser, with an offline fallback) and a learning tip of the day (curated
// software-testing tips rotated by date). Also the birthday helpers.
// Pure functions except fetchQuoteOfTheDay — covered by community/tests.

export interface DailyQuote {
  text: string;
  author: string;
  source: 'online' | 'fallback';
}

/** Days since 1 Jan 1970 in the viewer's local calendar — the "day key" everything rotates on. */
export const dayIndex = (now = new Date()): number =>
  Math.floor(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) / 86_400_000);

export const dayKey = (now = new Date()): string => {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${p(now.getMonth() + 1)}-${p(now.getDate())}`;
};

const FALLBACK_QUOTES: { text: string; author: string }[] = [
  { text: 'Quality is not an act, it is a habit.', author: 'Aristotle' },
  { text: 'Testing leads to failure, and failure leads to understanding.', author: 'Burt Rutan' },
  { text: 'The expert in anything was once a beginner.', author: 'Helen Hayes' },
  { text: 'It always seems impossible until it is done.', author: 'Nelson Mandela' },
  { text: 'Success is the sum of small efforts, repeated day in and day out.', author: 'Robert Collier' },
  { text: 'Do not wait to strike till the iron is hot; make it hot by striking.', author: 'W. B. Yeats' },
  { text: 'Program testing can be used to show the presence of bugs, but never to show their absence.', author: 'Edsger W. Dijkstra' },
  { text: 'Learning never exhausts the mind.', author: 'Leonardo da Vinci' },
  { text: 'The secret of getting ahead is getting started.', author: 'Mark Twain' },
  { text: 'Little by little, one travels far.', author: 'J. R. R. Tolkien' },
  { text: 'Either write something worth reading or do something worth writing.', author: 'Benjamin Franklin' },
  { text: 'Believe you can and you are halfway there.', author: 'Theodore Roosevelt' },
  { text: 'Simplicity is the soul of efficiency.', author: 'Austin Freeman' },
  { text: 'First, solve the problem. Then, write the code.', author: 'John Johnson' },
];

export const fallbackQuote = (now = new Date()): DailyQuote => {
  const q = FALLBACK_QUOTES[dayIndex(now) % FALLBACK_QUOTES.length];
  return { ...q, source: 'fallback' };
};

const QUOTE_CACHE_PREFIX = 'SPR_QUOTE_';
// dummyjson.com hosts a public, CORS-enabled quotes API with ids 1..1454.
const QUOTE_POOL = 1454;

/**
 * Same quote for every user on a given day: the day index selects the id, so
 * the pick is deterministic without a server. Cached per day; falls back to
 * the local list when offline or if the service is down.
 */
export const fetchQuoteOfTheDay = async (now = new Date()): Promise<DailyQuote> => {
  const key = QUOTE_CACHE_PREFIX + dayKey(now);
  try {
    const cached = localStorage.getItem(key);
    if (cached) return JSON.parse(cached) as DailyQuote;
  } catch { /* storage blocked */ }
  try {
    const id = (dayIndex(now) % QUOTE_POOL) + 1;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 6000);
    const res = await fetch(`https://dummyjson.com/quotes/${id}`, { signal: controller.signal });
    clearTimeout(timer);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    if (!json || typeof json.quote !== 'string' || !json.quote.trim()) throw new Error('empty quote');
    const q: DailyQuote = { text: json.quote.trim(), author: (json.author || 'Unknown').trim(), source: 'online' };
    try {
      localStorage.setItem(key, JSON.stringify(q));
      // keep the cache small: drop older days
      Object.keys(localStorage).filter(k => k.startsWith(QUOTE_CACHE_PREFIX) && k !== key).forEach(k => localStorage.removeItem(k));
    } catch { /* ignore */ }
    return q;
  } catch {
    return fallbackQuote(now);
  }
};

export interface LearningTip {
  title: string;
  body: string;
  tag: string;
}

/** Curated, rotates daily. Staff can add their own "Learning" posts which show above this. */
export const LEARNING_TIPS: LearningTip[] = [
  { tag: 'Manual testing', title: 'Boundary value analysis', body: 'Bugs hide at the edges. For a field that accepts 1–100, test 0, 1, 2, 99, 100 and 101 — not 50.' },
  { tag: 'Manual testing', title: 'Equivalence partitioning', body: 'Group inputs that the system should treat the same way and test one value from each group. Fewer tests, same coverage.' },
  { tag: 'Bug reports', title: 'Steps, expected, actual', body: 'A great bug report has numbered steps anyone can follow, what you expected, what actually happened, and a screenshot or log.' },
  { tag: 'Automation', title: 'Prefer stable locators', body: 'In Selenium/Playwright, prefer ids, data-testid attributes or accessible roles over long XPaths that break when the layout shifts.' },
  { tag: 'Automation', title: 'Explicit waits beat sleeps', body: 'Never sleep(5). Wait for a condition — element visible, request finished — so tests are fast when the app is fast and patient when it is slow.' },
  { tag: 'API testing', title: 'Status codes tell a story', body: '2xx success, 4xx the client did something wrong, 5xx the server broke. A 200 with an error message in the body is itself a bug.' },
  { tag: 'API testing', title: 'Negative tests for APIs', body: 'Send missing fields, wrong types, huge payloads and expired tokens. How an API fails matters as much as how it succeeds.' },
  { tag: 'SQL', title: 'Verify the database, not just the screen', body: 'After a form submit, query the table. Data saved with wrong types, trailing spaces or missing rows is a common class of defect.' },
  { tag: 'Agile', title: 'Testing starts at the story', body: 'Ask "how will we know this works?" during refinement. Acceptance criteria written before coding prevent half the bugs.' },
  { tag: 'Career', title: 'Read the app like a user', body: 'Before test cases, use the product for 15 minutes as a real customer would. Exploratory sessions find what scripts miss.' },
  { tag: 'Manual testing', title: 'Decision tables', body: 'When rules combine (member? coupon? first order?), a decision table lists every combination so none is forgotten.' },
  { tag: 'Automation', title: 'Page Object Model', body: 'Keep locators and page actions in one class per page. Tests then read like English and one UI change means one fix.' },
  { tag: 'Performance', title: 'Know your p95', body: 'Average response time hides pain. The 95th percentile tells you what one in twenty users actually experiences.' },
  { tag: 'Bug reports', title: 'Severity vs priority', body: 'Severity is impact (crash, data loss). Priority is urgency for the business. A typo on the payment page is low severity, high priority.' },
  { tag: 'API testing', title: 'Idempotency', body: 'Calling the same PUT or DELETE twice should leave the system in the same state. Retry a request and check nothing doubled.' },
  { tag: 'Security', title: 'Try the obvious injections', body: "Type ' OR 1=1 -- and <script>alert(1)</script> into text fields. If the app misbehaves, you have found a real vulnerability." },
  { tag: 'Mobile', title: 'Interrupt testing', body: 'Rotate the screen, take a call, lose network mid-action, background the app. Mobile bugs live in interruptions.' },
  { tag: 'Regression', title: 'Smoke before deep dive', body: 'Run the 10-minute smoke suite first. If login is broken there is no point testing report exports.' },
  { tag: 'Automation', title: 'One assertion per behaviour', body: 'A test that checks twelve things fails on the first and hides the other eleven. Split by behaviour so failures point at the cause.' },
  { tag: 'Career', title: 'Explain a bug to a non-technical person', body: 'The best testers translate. Practise describing an issue in two sentences a product owner understands.' },
  { tag: 'Manual testing', title: 'State transition testing', body: 'Draw the states (draft → published → cancelled) and test every allowed and forbidden transition.' },
  { tag: 'Test data', title: 'Fresh data every run', body: 'Tests that depend on yesterday\'s records break mysteriously. Create what you need at the start and clean up at the end.' },
  { tag: 'Accessibility', title: 'Tab through the page', body: 'Unplug the mouse. Can you reach and operate every control with Tab, Enter and Space? Many users must.' },
  { tag: 'API testing', title: 'Read the contract', body: 'Compare the response against the API spec (OpenAPI/Swagger): field names, types, nullability. Drift is a bug even when the UI still works.' },
  { tag: 'Automation', title: 'Flaky is failing', body: 'A test that passes on retry is telling you about a race condition — in the test or in the product. Investigate, do not add retries.' },
  { tag: 'Manual testing', title: 'Localisation checks', body: 'Long German words, right-to-left Arabic, dates as dd/mm vs mm/dd and ₹ vs $ formatting break layouts and logic.' },
  { tag: 'Git', title: 'Small commits, clear messages', body: 'Automation code is code. Commit one logical change at a time with a message that says why, not just what.' },
  { tag: 'Career', title: 'Keep a bug journal', body: 'Note the most interesting defect you found each week and how you found it. It becomes your best interview material.' },
  { tag: 'Performance', title: 'Test with realistic data volume', body: 'A table with 10 rows is fast. Load 10,000 and watch pagination, search and export — that is where users live.' },
  { tag: 'Agile', title: 'Definition of Done includes tests', body: 'A story is not done when the code compiles. It is done when it is tested, and the automation for it is green.' },
];

export const learningTipOfTheDay = (now = new Date()): LearningTip => LEARNING_TIPS[dayIndex(now) % LEARNING_TIPS.length];

// ---------- birthdays ----------

export interface BirthdayHit {
  candidateId: string;
  name: string;
  /** 0 = today, 1 = tomorrow, … */
  inDays: number;
  /** "15 Sept" */
  dateLabel: string;
  turning?: number;
}

const parseDob = (dob: string): { m: number; d: number; y?: number } | null => {
  if (!dob) return null;
  let m = /^(\d{4})-(\d{2})-(\d{2})/.exec(dob);              // 1998-09-15 (date input)
  if (m) return { y: +m[1], m: +m[2], d: +m[3] };
  m = /^(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})/.exec(dob);      // 15/09/1998 (typed, dd/mm/yyyy)
  if (m) return { y: +m[3], m: +m[2], d: +m[1] };
  const t = new Date(dob);
  if (!isNaN(t.getTime())) return { y: t.getFullYear(), m: t.getMonth() + 1, d: t.getDate() };
  return null;
};

/**
 * Candidates whose birthday falls within the next `withinDays` days (today
 * included), sorted soonest first. 29 Feb birthdays land on 1 Mar in
 * non-leap years, which is what most people expect.
 */
export const upcomingBirthdays = (
  people: { candidateId: string; name: string; dob?: string }[],
  withinDays = 7,
  now = new Date(),
): BirthdayHit[] => {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const hits: BirthdayHit[] = [];
  for (const p of people) {
    const dob = parseDob(p.dob || '');
    if (!dob) continue;
    for (const year of [today.getFullYear(), today.getFullYear() + 1]) {
      const next = new Date(year, dob.m - 1, dob.d);
      const inDays = Math.round((next.getTime() - today.getTime()) / 86_400_000);
      if (inDays >= 0 && inDays < withinDays) {
        hits.push({
          candidateId: p.candidateId,
          name: p.name,
          inDays,
          dateLabel: next.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
          turning: dob.y ? year - dob.y : undefined,
        });
        break;
      }
    }
  }
  return hits.sort((a, b) => a.inDays - b.inDays || a.name.localeCompare(b.name));
};

export const greetingFor = (name: string, now = new Date()): string => {
  const h = now.getHours();
  const part = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
  const first = (name || '').trim().split(/\s+/)[0] || '';
  return first ? `${part}, ${first}` : part;
};
