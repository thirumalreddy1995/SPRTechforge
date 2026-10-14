import { describe, expect, it } from 'vitest';
import {
  SPEED_SETTINGS, DEFAULT_SPEED_IDX, approxWpm, speedColor,
  splitIntoPhrases, promptChunks, PHRASE_TOLERANCE, estimateSpeakMs, promptGapMs, minPromptGapMs, caughtUp,
  toSpokenText, questionIntro, SESSION_BRIEFING, rankVoices, voiceScore, pickInterviewerVoice,
} from './promptPracticeSpeech';

const words = (s: string) => s.split(/\s+/).filter(Boolean).length;
const NORMAL = SPEED_SETTINGS[DEFAULT_SPEED_IDX];
const SLOW = SPEED_SETTINGS[0];
const FAST = SPEED_SETTINGS[SPEED_SETTINGS.length - 1];

describe('Prompting pace levels', () => {
  it('has five levels from slow to fast with sensible TTS rates', () => {
    expect(SPEED_SETTINGS.map(s => s.label)).toEqual(['Slow', 'Relaxed', 'Normal', 'Brisk', 'Fast']);
    for (const s of SPEED_SETTINGS) {
      expect(s.rate).toBeGreaterThanOrEqual(0.8);
      expect(s.rate).toBeLessThanOrEqual(1.1);
    }
  });

  it('is strictly ordered: faster, longer prompts and less slack at every step', () => {
    for (let i = 1; i < SPEED_SETTINGS.length; i++) {
      expect(SPEED_SETTINGS[i].rate).toBeGreaterThan(SPEED_SETTINGS[i - 1].rate);
      expect(SPEED_SETTINGS[i].chunkWords).toBeGreaterThan(SPEED_SETTINGS[i - 1].chunkWords);
      expect(SPEED_SETTINGS[i].gapFactor).toBeLessThan(SPEED_SETTINGS[i - 1].gapFactor);
      expect(approxWpm(SPEED_SETTINGS[i])).toBeGreaterThan(approxWpm(SPEED_SETTINGS[i - 1]));
    }
    // a phone prompt is a few words at a time
    expect(SLOW.chunkWords).toBe(3);
    expect(NORMAL.chunkWords).toBe(5);
    expect(FAST.chunkWords).toBeLessThanOrEqual(7);
  });

  it('maps old session labels onto the new colour scale', () => {
    expect(speedColor('Very Slow')).toBe(SPEED_SETTINGS[0].color);
    expect(speedColor('Very Fast')).toBe(SPEED_SETTINGS[4].color);
    expect(speedColor('Normal')).toBe(SPEED_SETTINGS[2].color);
    expect(speedColor(undefined)).toBe('#64748b');
  });
});

describe('Prompt chunks', () => {
  const answer = 'Boundary Value Analysis tests values at the boundaries of valid input ranges including the minimum maximum and values just inside and outside those boundaries. It is effective because defects cluster at the edges of input domains.';
  const smoke = 'Smoke Testing is a broad shallow test of major functionality to verify the build is stable enough for further testing.';

  it('keeps every prompt within the level size (plus one word on a natural boundary)', () => {
    for (const level of SPEED_SETTINGS) {
      const chunks = promptChunks(answer, level);
      expect(chunks.length).toBeGreaterThan(2);
      for (const c of chunks) expect(words(c)).toBeLessThanOrEqual(level.chunkWords + PHRASE_TOLERANCE);
    }
  });

  it('gives more, shorter prompts at Slow than at Fast', () => {
    expect(promptChunks(answer, SLOW).length).toBeGreaterThan(promptChunks(answer, FAST).length);
  });

  it('loses no words and keeps their order', () => {
    const chunks = promptChunks(answer, NORMAL);
    expect(chunks.join(' ').replace(/\s+/g, ' ')).toBe(answer.replace(/\s+/g, ' '));
  });

  it('never ends a prompt on a dangling word like "of", "the" or "and"', () => {
    for (const level of SPEED_SETTINGS) {
      for (const text of [answer, smoke]) {
        for (const c of promptChunks(text, level)) {
          expect(c).not.toMatch(/\b(a|an|the|of|to|and|or|with|by|for|in|on|at|from|into)[.,]?$/i);
        }
      }
    }
  });

  it('cuts the smoke-test answer the way a prompter would say it', () => {
    expect(promptChunks(smoke, NORMAL)).toEqual([
      'Smoke Testing is',
      'a broad shallow test',
      'of major functionality',
      'to verify the build',
      'is stable enough for further testing.',
    ]);
  });

  it('keeps punctuation attached and never produces empty prompts', () => {
    const chunks = splitIntoPhrases('Arrange sets up the data. Act runs the code, and Assert checks the result.', 5);
    expect(chunks).toEqual(['Arrange sets up the data.', 'Act runs the code,', 'and Assert checks the result.']);
  });

  it('keeps two-word joiners like "followed by" together', () => {
    const chunks = splitIntoPhrases('You include this token in the Authorization header using the format Bearer followed by the token value and verify the response.', 8);
    expect(chunks.some(p => /followed$/.test(p))).toBe(false);
    expect(chunks.some(p => /^followed by/.test(p))).toBe(true);
  });

  it('leaves a short answer untouched', () => {
    expect(promptChunks('A short answer.', NORMAL)).toEqual(['A short answer.']);
  });
});

describe('Gap timing', () => {
  it('estimates speaking time from word count and rate', () => {
    expect(estimateSpeakMs('one two three four five', { ...NORMAL, rate: 1 })).toBe(2000); // 5 words at 150 wpm
    expect(estimateSpeakMs('one two three', SLOW)).toBeGreaterThan(estimateSpeakMs('one two three', FAST));
  });

  it('waits about as long as the prompt took at Normal, more at Slow, less at Fast', () => {
    const prompt = 'to verify the build';
    const said = 1500;
    expect(promptGapMs(prompt, NORMAL, said)).toBe(1500 + 250);
    expect(promptGapMs(prompt, SLOW, said)).toBeGreaterThan(promptGapMs(prompt, NORMAL, said));
    expect(promptGapMs(prompt, FAST, said)).toBeLessThan(promptGapMs(prompt, NORMAL, said));
  });

  it('never leaves the long silences of the old echo mode', () => {
    // a 5-word prompt at any level waits well under 4 seconds
    for (const level of SPEED_SETTINGS) expect(promptGapMs('one two three four five', level)).toBeLessThan(4000);
    expect(promptGapMs('Hi.', FAST)).toBeGreaterThanOrEqual(500);
    expect(promptGapMs('word '.repeat(80), SLOW)).toBeLessThanOrEqual(5000);
  });

  it('uses the measured utterance length when the browser reports one', () => {
    const text = 'a phrase of six words here';
    expect(promptGapMs(text, NORMAL, 4000)).toBeGreaterThan(promptGapMs(text, NORMAL));
    expect(promptGapMs(text, NORMAL, 10)).toBe(promptGapMs(text, NORMAL)); // cancelled utterance → estimate
    expect(minPromptGapMs(text, NORMAL, 2000)).toBe(1000);
  });

  it('moves on early once the mic has heard most of the prompt', () => {
    expect(caughtUp(0, 'to verify the build')).toBe(false);
    expect(caughtUp(2, 'to verify the build')).toBe(false);
    expect(caughtUp(3, 'to verify the build')).toBe(true);
    expect(caughtUp(1, 'Yes.')).toBe(true);
  });
});

describe('What is said', () => {
  it('the interviewer asks like a person, never "Question 1:"', () => {
    const first = questionIntro(0, 5, 'What is Boundary Value Analysis?');
    const mid = questionIntro(2, 5, 'What is Regression Testing and when do you run it');
    const last = questionIntro(4, 5, 'What is Exploratory Testing?');
    expect(first).toMatch(/^Okay, let's start/);
    expect(first).not.toMatch(/Question 1/);
    expect(mid).toMatch(/^(Okay|Good|Alright|Thanks)/);
    expect(mid.endsWith('when do you run it?')).toBe(true);
    expect(last).toMatch(/last question/);
  });

  it('varies the lead-in between consecutive questions', () => {
    const a = questionIntro(1, 6, 'Q?'), b = questionIntro(2, 6, 'Q?'), c = questionIntro(3, 6, 'Q?');
    expect(new Set([a, b, c]).size).toBe(3);
  });

  it('the prompter briefs the candidate once, in plain words', () => {
    expect(SESSION_BRIEFING).toMatch(/a few words at a time/);
    expect(SESSION_BRIEFING).toMatch(/out loud/);
  });
});

describe('Pronunciation for the voice', () => {
  it('spells out acronyms and splits identifiers', () => {
    expect(toSpokenText('NUnit uses the TestCase attribute')).toBe('N-Unit uses the Test Case attribute');
    expect(toSpokenText('REST returns JSON or XML over HTTP')).toBe('rest returns jason or X M L over H T T P');
    expect(toSpokenText('cast to ITakesScreenshot and call GetScreenshot then SaveAsFile')).toBe('cast to I Takes Screenshot and call Get Screenshot then Save As File');
    expect(toSpokenText('Selenium C# with SpecFlow')).toBe('Selenium C sharp with Spec Flow');
  });

  it('does not touch ordinary words', () => {
    expect(toSpokenText('Regression Testing re-runs previously passing test cases.')).toBe('Regression Testing re-runs previously passing test cases.');
  });
});

describe('Voices', () => {
  const voices = [
    { name: 'Microsoft David - English (United States)', lang: 'en-US' },
    { name: 'Microsoft Neerja Online (Natural) - English (India)', lang: 'en-IN' },
    { name: 'Google UK English Female', lang: 'en-GB' },
    { name: 'Microsoft Prabhat Online (Natural) - English (India)', lang: 'en-IN' },
    { name: 'Microsoft Zira - English (United States)', lang: 'en-US' },
    { name: 'Google हिन्दी', lang: 'hi-IN' },
    { name: 'eSpeak English', lang: 'en' },
  ];

  it('puts a natural Indian-English voice first and drops non-English voices', () => {
    const ranked = rankVoices(voices).map(v => v.name);
    expect(ranked[0]).toMatch(/Neerja|Prabhat/);
    expect(ranked[1]).toMatch(/Neerja|Prabhat/);
    expect(ranked).not.toContain('Google हिन्दी');
    expect(ranked[ranked.length - 1]).toMatch(/eSpeak/);
  });

  it('scores the classic SAPI voices below neural ones', () => {
    expect(voiceScore(voices[0])).toBeLessThan(voiceScore(voices[2]));
    expect(voiceScore({ name: 'Nothing', lang: 'fr-FR' })).toBe(-1);
  });

  it('gives the interviewer a different voice, of the other gender when one exists', () => {
    const ranked = rankVoices(voices);
    const iv = pickInterviewerVoice(ranked, 'Microsoft Neerja Online (Natural) - English (India)');
    expect(iv?.name).toMatch(/Prabhat/);
    const iv2 = pickInterviewerVoice(ranked, 'Microsoft Prabhat Online (Natural) - English (India)');
    expect(iv2?.name).toMatch(/Neerja/);
    const only = [{ name: 'Solo', lang: 'en-US' }];
    expect(pickInterviewerVoice(only, 'Solo')?.name).toBe('Solo');
    expect(pickInterviewerVoice([], 'x')).toBeNull();
  });
});
