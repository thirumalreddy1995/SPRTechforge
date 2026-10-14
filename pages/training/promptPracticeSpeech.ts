// Pure helpers for the Prompt Practice (Interview Prep) trainer voice.
// No DOM access here so the rules are unit-testable (promptPracticeSpeech.test.ts).
//
// What the module simulates: a live interview where the trainer is on the
// phone with the candidate. The interviewer asks a question; the trainer
// (the "prompter") feeds the answer into the candidate's ear a few words at a
// time; the candidate says each bit out loud straight away and keeps going.
// So prompts are short, the gap after each one is only as long as it takes
// to say it, and the next prompt comes as soon as the candidate catches up.

// ─── Speed levels ─────────────────────────────────────────────────────────────
// rate       = Web Speech rate multiplier. 1.0 is the voice's natural pace
//              (about 150 words a minute); a prompter speaks a touch slower
//              than conversation so every word lands over the phone.
// chunkWords = how many words the prompter gives at a time.
// gapFactor  = how long to wait for the candidate to say the prompt, as a
//              multiple of the time the prompter took to say it (upper bound:
//              the next prompt comes earlier once the mic hears them finish).
export interface SpeedSetting {
  label: string;
  rate: number;
  chunkWords: number;
  gapFactor: number;
  color: string;
  hint: string;
}

export const BASE_WPM = 150; // typical English TTS pace at rate 1.0

export const SPEED_SETTINGS: SpeedSetting[] = [
  { label: 'Slow',    rate: 0.8,  chunkWords: 3, gapFactor: 1.4, color: '#7c3aed', hint: 'Three words at a time, said slowly, with room to spare. For your first sessions.' },
  { label: 'Relaxed', rate: 0.85, chunkWords: 4, gapFactor: 1.2, color: '#2563eb', hint: 'Four words at a time with a little extra time to say them.' },
  { label: 'Normal',  rate: 0.9,  chunkWords: 5, gapFactor: 1.0, color: '#16a34a', hint: 'How a real phone prompt feels: five words at a time, next one as soon as you finish.' },
  { label: 'Brisk',   rate: 1.0,  chunkWords: 6, gapFactor: 0.85, color: '#d97706', hint: 'Six words at a time at conversational pace. You must keep up.' },
  { label: 'Fast',    rate: 1.1,  chunkWords: 7, gapFactor: 0.7, color: '#dc2626', hint: 'Interview pressure: longer prompts, quick pace, no slack.' },
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

// ─── Prompt chunks ────────────────────────────────────────────────────────────
// A prompter feeds an answer a few words at a time. Model answers are long
// sentences with few commas, so: split at punctuation first, then break
// anything longer than the level's chunk size at a natural joining word
// ("and", "while", "such as", "by", …) and only as a last resort by count.
export const MAX_PHRASE_WORDS = 5; // default chunk size (Normal level)
const MIN_PHRASE_WORDS = 2;

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
// Soft = start of a noun phrase or verb group ("the build", "is stable"): a
// fair place to pause when nothing better is in range.
const SOFT_BREAKS = ["a", "an", "the", "this", "that", "these", "those", "your", "our", "their", "its", "each", "every", "all", "some", "any", "no",
  "is", "are", "was", "were", "has", "have", "had", "can", "should", "will", "must", "may"];
// Never end a prompt on one of these — nobody says "...of" and stops.
const NO_TRAILING = new Set([...WEAK_BREAKS, "a", "an", "the", "and", "or", "but", "to", "with", "by", "for", "as", "into", "from", "such", "so"]);

// A chunk may run one word past the level's size when that keeps it on a
// natural boundary.
export const PHRASE_TOLERANCE = 1;

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
  if (cut < 0) cut = nearestBreak(words, SOFT_BREAKS, lo, hi, target);
  if (cut < 0) {
    cut = Math.min(maxWords, words.length - MIN_PHRASE_WORDS);
    while (cut > lo && NO_TRAILING.has(clean(words[cut - 1]))) cut--;
  }

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

// The prompts for one answer at a given level.
export const promptChunks = (answer: string, speed: SpeedSetting) => splitIntoPhrases(answer, speed.chunkWords);

export const countWords = (s: string) => wordCount(s);

// ─── Timing ───────────────────────────────────────────────────────────────────
// How long a prompt takes to say at a given speed (ms). Used as the fallback
// when the browser cannot tell us the real utterance duration.
export function estimateSpeakMs(text: string, speed: SpeedSetting): number {
  const words = Math.max(1, wordCount(text));
  return Math.round((words / (BASE_WPM * speed.rate)) * 60_000);
}

// Longest wait after a prompt before the next one, so the candidate can say
// it. Roughly the time the prompter took (scaled by the level) plus a beat for
// the candidate to start; a touch more at the end of a sentence. The session
// moves on earlier than this once the mic hears the candidate catch up.
// measuredMs = how long the prompter actually took (from the speech events).
export function promptGapMs(text: string, speed: SpeedSetting, measuredMs?: number): number {
  const spoken = measuredMs && measuredMs > 250 ? measuredMs : estimateSpeakMs(text, speed);
  const endsSentence = /[.?!]$/.test(text.trim());
  const gap = spoken * speed.gapFactor + 250 + (endsSentence ? 150 : 0);
  return Math.round(Math.min(5000, Math.max(500, gap)));
}

// Earliest the next prompt may come, even if the mic says the candidate has
// finished (guards against the mic picking up the prompter's own voice).
export const minPromptGapMs = (text: string, speed: SpeedSetting, measuredMs?: number) =>
  Math.round(Math.max(300, (measuredMs && measuredMs > 250 ? measuredMs : estimateSpeakMs(text, speed)) * 0.5));

// True when the words the mic has heard since the prompt started cover most of
// the prompt — the candidate has said it, move on.
export function caughtUp(wordsHeardSincePrompt: number, promptText: string): boolean {
  const need = Math.ceil(wordCount(promptText) * 0.7);
  return wordsHeardSincePrompt >= need;
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

// ─── What is said, and by whom ───────────────────────────────────────────────
// Two voices: the INTERVIEWER asks the questions; the PROMPTER (the trainer on
// the phone) feeds the answer. Nothing else is said during an answer — a real
// prompter does not stop to give instructions.
const NEXT_LEADS = [
  'Okay, next question.',
  'Alright, moving on.',
  'Good. Let me ask you this.',
  'Okay. Tell me,',
  'Thanks. Next one.',
];

// The interviewer asking the question; varies so it does not sound mechanical.
export function questionIntro(index: number, total: number, question: string): string {
  const q = question.trim().replace(/[.?!]*$/, '?');
  let lead: string;
  if (index === 0) lead = 'Okay, let\'s start with the first question.';
  else if (index === total - 1) lead = 'Alright, last question.';
  else lead = NEXT_LEADS[(index - 1) % NEXT_LEADS.length];
  return `${lead} ${q}`;
}

// The prompter, once at the start of a session, before the first question.
export const SESSION_BRIEFING = 'I\'m on the line with you. When the interviewer asks a question, I\'ll give you the answer a few words at a time. Say each bit out loud the moment you hear it, and keep going. Here we go.';

export const VOICE_PREVIEW_TEXT = 'Hi, I\'ll be on the line with you. I\'ll give you the answer a few words at a time, and you say it out loud as you hear it.';

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

// The interviewer should sound like a different person from the prompter:
// prefer a voice of the other gender (by well-known voice names), else any
// other English voice, else the same one.
const FEMALE = /\b(neerja|zira|hazel|susan|heera|samantha|karen|moira|tessa|veena|aria|jenny|sonia|libby|female|woman)\b/;
const MALE = /\b(prabhat|david|mark|george|ravi|daniel|rishi|guy|ryan|thomas|william|male|man)\b/;
const genderOf = (name: string): 'f' | 'm' | '' => {
  const n = name.toLowerCase();
  if (FEMALE.test(n)) return 'f';
  if (MALE.test(n)) return 'm';
  return '';
};

export function pickInterviewerVoice<T extends VoiceInfo>(ranked: T[], prompterName: string): T | null {
  if (!ranked.length) return null;
  const prompter = ranked.find(v => v.name === prompterName) || ranked[0];
  const g = genderOf(prompter.name);
  const other = g ? ranked.find(v => v.name !== prompter.name && genderOf(v.name) && genderOf(v.name) !== g) : undefined;
  return other || ranked.find(v => v.name !== prompter.name) || prompter;
}

export const VOICE_PREF_KEY = 'spr_interview_prep_voice';
