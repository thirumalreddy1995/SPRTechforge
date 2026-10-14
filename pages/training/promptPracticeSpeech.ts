// Pure helpers for the Prompt Practice (Interview Prep) trainer voice.
// No DOM access here so the rules are unit-testable (promptPracticeSpeech.test.ts).

// ─── Speed levels ─────────────────────────────────────────────────────────────
// rate      = Web Speech rate multiplier. 1.0 is the voice's natural pace
//             (about 150 words a minute for English voices); below 0.8 every
//             voice starts to drawl and above 1.25 it becomes hard to echo.
// echoFactor = how long the candidate gets to repeat a phrase, as a multiple
//             of the time the trainer took to say it. 1.0 = exactly as long.
export interface SpeedSetting {
  label: string;
  rate: number;
  echoFactor: number;
  color: string;
  hint: string;
}

export const BASE_WPM = 150; // typical English TTS pace at rate 1.0

export const SPEED_SETTINGS: SpeedSetting[] = [
  { label: 'Slow',    rate: 0.8,  echoFactor: 1.8, color: '#7c3aed', hint: 'Unhurried. Nearly twice the phrase length to repeat it — good for your first sessions.' },
  { label: 'Relaxed', rate: 0.9,  echoFactor: 1.5, color: '#2563eb', hint: 'A little slower than conversation, with generous time to echo each phrase.' },
  { label: 'Normal',  rate: 1.0,  echoFactor: 1.25, color: '#16a34a', hint: 'Natural conversational pace. Recommended for regular practice.' },
  { label: 'Brisk',   rate: 1.1,  echoFactor: 1.0, color: '#d97706', hint: 'Slightly quick, with just enough time to repeat each phrase.' },
  { label: 'Fast',    rate: 1.2,  echoFactor: 0.85, color: '#dc2626', hint: 'Interview pressure. You must keep up with the trainer.' },
];

export const DEFAULT_SPEED_IDX = 2;

export const approxWpm = (s: SpeedSetting) => Math.round(BASE_WPM * s.rate);

// Colour for a saved session's speed label. Old sessions were recorded with
// the previous labels ("Very Slow", "Very Fast"); map them onto the new scale.
export function speedColor(label?: string): string {
  if (!label) return '#64748b';
  const found = SPEED_SETTINGS.find(s => s.label === label);
  if (found) return found.color;
  if (label === 'Very Slow') return SPEED_SETTINGS[0].color;
  if (label === 'Very Fast') return SPEED_SETTINGS[4].color;
  return '#64748b';
}

// ─── Phrase splitting ─────────────────────────────────────────────────────────
// A human trainer feeds an answer in short, repeatable chunks. Model answers
// are long sentences with few commas, so: split at punctuation first, then
// break anything longer than MAX_PHRASE_WORDS at a natural joining word
// ("and", "while", "such as", "by", …) and only as a last resort by count.
export const MAX_PHRASE_WORDS = 8;
const MIN_PHRASE_WORDS = 3;

// Words that start a new clause or phrase. Strong = conjunctions and clause
// openers (preferred). Weak = prepositions, used only when no strong break is
// in range. Multi-word entries first so "such as" wins over "as".
const STRONG_BREAKS = [
  "such as", "so that", "as well as", "rather than", "followed by", "instead of",
  "while", "whereas", "which", "because", "although", "whenever", "when", "where",
  "after", "before", "until", "unless", "including", "without", "using", "through",
  "and", "but", "or", "so", "then", "with", "by", "to", "for", "as", "that", "into", "from",
];
const WEAK_BREAKS = ["of", "in", "on", "at", "during", "across", "between", "over", "under", "within", "via", "about", "against", "per", "like"];

// A phrase may run up to PHRASE_TOLERANCE words past MAX_PHRASE_WORDS when
// that keeps it on a natural boundary.
export const PHRASE_TOLERANCE = 2;

const wordCount = (s: string) => s.trim().split(/\s+/).filter(Boolean).length;
const clean = (w: string) => w.toLowerCase().replace(/[^a-z]/g, "");

function splitAtPunctuation(answer: string): string[] {
  const parts = answer.split(/([.?!,;:])/).filter(s => s.length > 0);
  const segs: string[] = [];
  for (const p of parts) {
    if (/^[.?!,;:]$/.test(p)) {
      if (segs.length > 0) segs[segs.length - 1] += p;
    } else {
      const t = p.trim();
      if (t) segs.push(t);
    }
  }
  return segs;
}

// Index of the break word (from `list`) nearest to `target`, within [lo, hi].
function nearestBreak(words: string[], list: string[], lo: number, hi: number, target: number): number {
  let best = -1, bestDist = Infinity;
  let blocked = -1; // second word of a two-word break ("by" in "followed by") is not a cut point
  for (let i = lo; i <= hi; i++) {
    const one = clean(words[i]);
    const two = i + 1 < words.length ? `${one} ${clean(words[i + 1])}` : "";
    const pair = list.includes(two);
    if (pair) blocked = i + 1;
    if (!pair && (i === blocked || !list.includes(one))) continue;
    const dist = Math.abs(i - target);
    if (dist < bestDist) { bestDist = dist; best = i; }
  }
  return best;
}

// Split one long segment into phrases of about maxWords.
function splitLong(seg: string, maxWords: number): string[] {
  const words = seg.split(/\s+/).filter(Boolean);
  const limit = maxWords + PHRASE_TOLERANCE;
  if (words.length <= limit) return [seg];

  const lo = MIN_PHRASE_WORDS;
  const hi = Math.min(limit, words.length - MIN_PHRASE_WORDS);
  const target = Math.min(maxWords, Math.floor(words.length / 2));
  let cut = nearestBreak(words, STRONG_BREAKS, lo, hi, target);
  if (cut < 0) cut = nearestBreak(words, WEAK_BREAKS, lo, hi, target);
  if (cut < 0) cut = Math.min(maxWords, words.length - MIN_PHRASE_WORDS);

  const left = words.slice(0, cut).join(" ");
  const right = words.slice(cut).join(" ");
  return [left, ...splitLong(right, maxWords)];
}

export function splitIntoPhrases(answer: string, maxWords = MAX_PHRASE_WORDS): string[] {
  const out: string[] = [];
  for (const seg of splitAtPunctuation(answer)) {
    for (const p of splitLong(seg, maxWords)) {
      const t = p.trim();
      if (t) out.push(t);
    }
  }
  return out;
}

// ─── Timing ───────────────────────────────────────────────────────────────────
// How long a phrase takes to say at a given speed (ms). Used as the fallback
// when the browser cannot tell us the real utterance duration.
export function estimateSpeakMs(text: string, speed: SpeedSetting): number {
  const words = Math.max(1, wordCount(text));
  return Math.round((words / (BASE_WPM * speed.rate)) * 60_000);
}

// Silence to leave after a phrase so the candidate can repeat it.
// measuredMs = how long the trainer actually took (from the speech events).
export function echoPauseMs(text: string, speed: SpeedSetting, measuredMs?: number): number {
  const spoken = measuredMs && measuredMs > 250 ? measuredMs : estimateSpeakMs(text, speed);
  const endsSentence = /[.?!]$/.test(text.trim());
  const pause = spoken * speed.echoFactor + 400 + (endsSentence ? 250 : 0);
  return Math.round(Math.min(9000, Math.max(900, pause)));
}

// ─── Pronunciation ────────────────────────────────────────────────────────────
// What the voice says, not what the screen shows or what the score compares.
const SAY: [RegExp, string][] = [
  [/\bC#/g, 'C sharp'],
  [/\bNUnit\b/g, 'N-Unit'],
  [/\bxUnit\b/g, 'X-Unit'],
  [/\bMSTest\b/g, 'M S Test'],
  [/\bJSON\b/g, 'jason'],
  [/\bYAML\b/g, 'yammel'],
  [/\bSQL\b/g, 'sequel'],
  [/\bAPIs\b/g, 'A P Is'],
  [/\bAPI\b/g, 'A P I'],
  [/\bXML\b/g, 'X M L'],
  [/\bHTTPS\b/g, 'H T T P S'],
  [/\bHTTP\b/g, 'H T T P'],
  [/\bURLs\b/g, 'U R Ls'],
  [/\bURL\b/g, 'U R L'],
  [/\bUI\b/g, 'U I'],
  [/\bIDE\b/g, 'I D E'],
  [/\bQA\b/g, 'Q A'],
  [/\bTDD\b/g, 'T D D'],
  [/\bBDD\b/g, 'B D D'],
  [/\bCI\/CD\b/g, 'C I C D'],
  [/\bCI\b/g, 'C I'],
  [/\bSDLC\b/g, 'S D L C'],
  [/\bSTLC\b/g, 'S T L C'],
  [/\bDOM\b/g, 'dom'],
  [/\bREST\b/g, 'rest'],
  [/\bSOAP\b/g, 'soap'],
  [/\bGUID\b/g, 'goo-id'],
  [/\bIEnumerable\b/g, 'I Enumerable'],
  [/\bIWebDriver\b/g, 'I Web Driver'],
  [/\bITakesScreenshot\b/g, 'I Takes Screenshot'],
  [/\bWebDriverWait\b/g, 'Web Driver Wait'],
  [/\bChromeDriver\b/g, 'Chrome Driver'],
  [/\bGeckoDriver\b/g, 'Gecko Driver'],
  [/\bRestSharp\b/g, 'Rest Sharp'],
  [/\bSpecFlow\b/g, 'Spec Flow'],
  [/\bScenarioContext\b/g, 'Scenario Context'],
  [/\bStaleElementReferenceException\b/g, 'Stale Element Reference Exception'],
  [/\bPublishTestResults\b/g, 'Publish Test Results'],
  [/\bTestFixture\b/g, 'Test Fixture'],
  [/\bTestCase\b/g, 'Test Case'],
  [/\bSetUp\b/g, 'Set Up'],
  [/\bTearDown\b/g, 'Tear Down'],
  [/\bBeforeScenario\b/g, 'Before Scenario'],
  [/\bAfterScenario\b/g, 'After Scenario'],
];

export function toSpokenText(text: string): string {
  let t = text;
  for (const [re, say] of SAY) t = t.replace(re, say);
  // Remaining CamelCase identifiers (e.g. GetScreenshot, SaveAsFile) read
  // better as separate words.
  t = t.replace(/\b([A-Z][a-z]+)([A-Z][a-z]+)+\b/g, m => m.replace(/([a-z])([A-Z])/g, '$1 $2'));
  return t.replace(/\s+/g, ' ').trim();
}

// ─── What the trainer says ───────────────────────────────────────────────────
const NEXT_LEADS = [
  'Okay, next question.',
  'Good. Let\'s move on.',
  'Alright, here\'s another one.',
  'Thanks. Next one.',
  'Okay, let\'s try this.',
];

// Spoken before the question text; varies so it does not sound mechanical.
export function questionIntro(index: number, total: number, question: string): string {
  const q = question.trim().replace(/[.?!]*$/, '?');
  let lead: string;
  if (index === 0) lead = 'Alright, let\'s begin. Here\'s your first question.';
  else if (index === total - 1) lead = 'Okay, this is the last one.';
  else lead = NEXT_LEADS[(index - 1) % NEXT_LEADS.length];
  return `${lead} ${q}`;
}

// Spoken once before the model answer is fed phrase by phrase.
export function answerLeadIn(index: number): string {
  if (index === 0) return 'Here\'s how you could answer that. I\'ll say it in short phrases. Repeat each one after me.';
  return index % 2 === 0 ? 'Listen, and repeat after me.' : 'Here\'s the answer. Say each phrase after me.';
}

export const VOICE_PREVIEW_TEXT = 'Hi, I\'m your practice trainer. I\'ll ask a question, then say the answer in short phrases. You repeat each one after me.';

// ─── Voice choice ─────────────────────────────────────────────────────────────
// The browser's default voice is usually the old robotic one (Microsoft David /
// Zira, or eSpeak). Rank the installed voices so the most natural English
// voice is picked, preferring Indian English.
export interface VoiceInfo { name: string; lang: string; localService?: boolean; default?: boolean; }

export function voiceScore(v: VoiceInfo): number {
  const lang = (v.lang || '').toLowerCase().replace('_', '-');
  if (!lang.startsWith('en')) return -1;
  const name = v.name.toLowerCase();
  let s = 0;
  if (lang === 'en-in') s += 30;
  else if (lang === 'en-gb') s += 20;
  else if (lang === 'en-us') s += 15;
  else if (lang === 'en-au' || lang === 'en-ie' || lang === 'en-nz' || lang === 'en-ca') s += 10;
  else s += 5;
  // Neural voices (Edge "Online (Natural)", Chrome OS/Android "Google", Safari "Enhanced"/"Premium")
  if (name.includes('natural')) s += 40;
  if (name.includes('neural')) s += 40;
  if (name.includes('online')) s += 20;
  if (name.includes('google')) s += 25;
  if (name.includes('premium') || name.includes('enhanced')) s += 30;
  if (name.includes('siri')) s += 20;
  // Known good classic voices
  if (/\b(samantha|daniel|karen|moira|tessa|rishi|veena)\b/.test(name)) s += 15;
  // Known robotic ones
  if (name.includes('espeak')) s -= 50;
  if (/microsoft (david|zira|mark|hazel|george|susan|heera|ravi)\b/.test(name) && !name.includes('online')) s -= 5;
  if (name.includes('compact')) s -= 20;
  return s;
}

export function rankVoices<T extends VoiceInfo>(voices: T[]): T[] {
  return voices
    .filter(v => (v.lang || "").toLowerCase().startsWith("en"))
    .sort((a, b) => voiceScore(b) - voiceScore(a) || a.name.localeCompare(b.name));
}

export const VOICE_PREF_KEY = 'spr_interview_prep_voice';
