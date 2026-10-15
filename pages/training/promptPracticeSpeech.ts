// Pure helpers for the Prompt Practice (Interview Prep) voices.
// No DOM access here so the rules are unit-testable (promptPracticeSpeech.test.ts).
//
// What the module simulates: a live interview where the trainer is on the
// phone with the candidate. The interviewer asks a question; the trainer (the
// "prompter") reads the answer straight through into the candidate's ear,
// pausing only where a person would — at commas and full stops — and never
// waiting. The candidate speaks along, a step behind, without stopping.

// ─── Pace levels ─────────────────────────────────────────────────────────────
// rate            = Web Speech rate multiplier. 1.0 is the voice's natural
//                   pace (about 150 words a minute); a prompter speaks a touch
//                   slower than conversation so every word lands over the phone.
// sentencePauseMs = the breath the prompter takes at each full stop. Commas
//                   are paused by the voice itself, as in natural speech.
export interface SpeedSetting {
  label: string;
  rate: number;
  sentencePauseMs: number;
  color: string;
  hint: string;
}

export const BASE_WPM = 150; // typical English TTS pace at rate 1.0

export const SPEED_SETTINGS: SpeedSetting[] = [
  { label: 'Slow',    rate: 0.7, sentencePauseMs: 800, color: '#7c3aed', hint: 'Slow and clear, with a longer breath at each full stop. For your first sessions.' },
  { label: 'Relaxed', rate: 0.8, sentencePauseMs: 600, color: '#2563eb', hint: 'A little slower than conversation; easy to stay a step behind.' },
  { label: 'Normal',  rate: 0.9, sentencePauseMs: 450, color: '#16a34a', hint: 'How a prompter sounds over the phone: a touch slower than normal talk, with natural pauses.' },
  { label: 'Brisk',   rate: 1.0, sentencePauseMs: 350, color: '#d97706', hint: 'Normal conversational pace. Stay right on the prompter\'s heels.' },
  { label: 'Fast',    rate: 1.1, sentencePauseMs: 250, color: '#dc2626', hint: 'Interview pressure: quick, with only the briefest breath between sentences.' },
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

// ─── Sentences ───────────────────────────────────────────────────────────────
// The answer is spoken sentence by sentence, each sentence as one utterance:
// the voice places its own pauses at commas, the module adds the breath at
// the full stop, and the flow never stops. (One utterance per sentence also
// sidesteps Chrome cutting off long utterances.) A trailing fragment shorter
// than three words is merged into the sentence before it.
const wordCount = (s: string) => s.trim().split(/\s+/).filter(Boolean).length;

export function answerSentences(answer: string): string[] {
  const parts = answer.replace(/\s+/g, ' ').trim().split(/(?<=[.?!])\s+/).map(p => p.trim()).filter(Boolean);
  const out: string[] = [];
  for (const p of parts) {
    if (out.length && wordCount(p) < 3) out[out.length - 1] += ' ' + p;
    else out.push(p);
  }
  return out;
}

export const sentencePauseMs = (speed: SpeedSetting) => speed.sentencePauseMs;

// ─── Timing ───────────────────────────────────────────────────────────────────
// How long a text takes to say at a given pace (ms); used for the watchdog
// that moves on if the browser never reports the end of an utterance.
export function estimateSpeakMs(text: string, speed: SpeedSetting): number {
  const words = Math.max(1, wordCount(text));
  return Math.round((words / (BASE_WPM * speed.rate)) * 60_000);
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

// Model answers are written with few commas. A person reading them aloud
// still breathes before a new clause, so add a comma for the voice there.
const CLAUSE_OPENERS = /\s+(while|whereas|which|such as|including|so that|followed by|rather than|as well as|because|although)\s+/g;
export const withNaturalPauses = (text: string) => text.replace(CLAUSE_OPENERS, (m, w) => `, ${w} `).replace(/,\s*,/g, ',');

export function toSpokenText(text: string): string {
  let t = withNaturalPauses(text);
  for (const [re, say] of SAY) t = t.replace(re, say);
  // Remaining CamelCase identifiers (e.g. GetScreenshot, SaveAsFile) read
  // better as separate words.
  t = t.replace(/\b([A-Z][a-z]+)([A-Z][a-z]+)+\b/g, m => m.replace(/([a-z])([A-Z])/g, '$1 $2'));
  return t.replace(/\s+/g, ' ').trim();
}

// ─── What is said, and by whom ───────────────────────────────────────────────
// Two voices: the INTERVIEWER asks the questions; the PROMPTER (the trainer on
// the phone) reads the answer. Nothing else is said during an answer — a real
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
export const SESSION_BRIEFING = 'I\'m on the line with you. When the interviewer asks a question, I\'ll say the answer straight through, just like over the phone. Speak along with me as you hear it, a step behind, and don\'t stop. Here we go.';

export const VOICE_PREVIEW_TEXT = 'Hi, I\'ll be on the line with you. I\'ll say the answer straight through, and you speak along with me, a step behind.';

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
