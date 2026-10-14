import { describe, expect, it } from 'vitest';
import {
  SPEED_SETTINGS, DEFAULT_SPEED_IDX, approxWpm, speedColor,
  splitIntoPhrases, MAX_PHRASE_WORDS, PHRASE_TOLERANCE, estimateSpeakMs, echoPauseMs,
  toSpokenText, questionIntro, answerLeadIn, rankVoices, voiceScore,
} from './promptPracticeSpeech';

const words = (s: string) => s.split(/\s+/).filter(Boolean).length;

describe('Prompt Practice speed levels', () => {
  it('has five levels from slow to fast with sensible TTS rates', () => {
    expect(SPEED_SETTINGS.map(s => s.label)).toEqual(['Slow', 'Relaxed', 'Normal', 'Brisk', 'Fast']);
    for (const s of SPEED_SETTINGS) {
      expect(s.rate).toBeGreaterThanOrEqual(0.8);
      expect(s.rate).toBeLessThanOrEqual(1.25);
    }
    expect(SPEED_SETTINGS[DEFAULT_SPEED_IDX].rate).toBe(1.0);
  });

  it('is strictly ordered: faster speech and less echo time at every step', () => {
    for (let i = 1; i < SPEED_SETTINGS.length; i++) {
      expect(SPEED_SETTINGS[i].rate).toBeGreaterThan(SPEED_SETTINGS[i - 1].rate);
      expect(SPEED_SETTINGS[i].echoFactor).toBeLessThan(SPEED_SETTINGS[i - 1].echoFactor);
      expect(approxWpm(SPEED_SETTINGS[i])).toBeGreaterThan(approxWpm(SPEED_SETTINGS[i - 1]));
    }
    expect(approxWpm(SPEED_SETTINGS[DEFAULT_SPEED_IDX])).toBe(150);
  });

  it('maps old session labels onto the new colour scale', () => {
    expect(speedColor('Very Slow')).toBe(SPEED_SETTINGS[0].color);
    expect(speedColor('Very Fast')).toBe(SPEED_SETTINGS[4].color);
    expect(speedColor('Normal')).toBe(SPEED_SETTINGS[2].color);
    expect(speedColor(undefined)).toBe('#64748b');
  });
});

describe('Phrase splitting', () => {
  const answer = 'Boundary Value Analysis tests values at the boundaries of valid input ranges including the minimum maximum and values just inside and outside those boundaries. It is effective because defects cluster at the edges of input domains.';

  it('keeps every phrase short enough to repeat', () => {
    const phrases = splitIntoPhrases(answer);
    expect(phrases.length).toBeGreaterThan(3);
    for (const p of phrases) expect(words(p)).toBeLessThanOrEqual(MAX_PHRASE_WORDS + PHRASE_TOLERANCE);
  });

  it('loses no words and keeps their order', () => {
    const phrases = splitIntoPhrases(answer);
    const joined = phrases.join(' ').replace(/\s+/g, ' ');
    expect(joined).toBe(answer.replace(/\s+/g, ' '));
  });

  it('breaks at joining words rather than mid-phrase', () => {
    const phrases = splitIntoPhrases('Smoke Testing is a broad shallow test of major functionality to verify the build is stable enough for further testing.');
    // first cut happens at a joining word, so the next phrase starts with one
    expect(/^(to|for|of|and|while|which|by|with|such as|including)\b/i.test(phrases[1])).toBe(true);
  });

  it('keeps punctuation attached and never produces empty phrases', () => {
    const phrases = splitIntoPhrases('Arrange sets up the data. Act runs the code, and Assert checks the result.');
    expect(phrases).toEqual(['Arrange sets up the data.', 'Act runs the code,', 'and Assert checks the result.']);
  });

  it('keeps two-word joiners like "followed by" together', () => {
    const phrases = splitIntoPhrases('You include this token in the Authorization header using the format Bearer followed by the token value and verify the response.');
    expect(phrases.some(p => /followed$/.test(p))).toBe(false);
    expect(phrases.some(p => /^followed by/.test(p))).toBe(true);
  });

  it('leaves a short answer untouched', () => {
    expect(splitIntoPhrases('A short answer.')).toEqual(['A short answer.']);
  });
});

describe('Echo timing', () => {
  const normal = SPEED_SETTINGS[DEFAULT_SPEED_IDX];
  const slow = SPEED_SETTINGS[0];
  const fast = SPEED_SETTINGS[4];

  it('estimates speaking time from word count and rate', () => {
    expect(estimateSpeakMs('one two three four five', normal)).toBe(2000); // 5 words at 150 wpm
    expect(estimateSpeakMs('one two three four five', slow)).toBeGreaterThan(2000);
    expect(estimateSpeakMs('one two three four five', fast)).toBeLessThan(2000);
  });

  it('gives longer phrases longer pauses, and slow speeds longer than fast', () => {
    const short = 'Verification checks the documents.';
    const long = 'Verification ensures we are building the product right by reviewing documents.';
    expect(echoPauseMs(long, normal)).toBeGreaterThan(echoPauseMs(short, normal));
    expect(echoPauseMs(long, slow)).toBeGreaterThan(echoPauseMs(long, normal));
    expect(echoPauseMs(long, normal)).toBeGreaterThan(echoPauseMs(long, fast));
  });

  it('prefers the measured utterance length when the browser reports one', () => {
    const text = 'a phrase of six words here';
    expect(echoPauseMs(text, normal, 4000)).toBeGreaterThan(echoPauseMs(text, normal));
    // nonsense measurements (cancelled utterance) fall back to the estimate
    expect(echoPauseMs(text, normal, 10)).toBe(echoPauseMs(text, normal));
  });

  it('never drops below the floor nor above the ceiling', () => {
    expect(echoPauseMs('Hi.', fast)).toBeGreaterThanOrEqual(900);
    expect(echoPauseMs('word '.repeat(80), slow)).toBeLessThanOrEqual(9000);
  });
});

describe('Trainer wording', () => {
  it('introduces the first, middle and last questions like a person would', () => {
    const first = questionIntro(0, 5, 'What is Boundary Value Analysis?');
    const mid = questionIntro(2, 5, 'What is Regression Testing and when do you run it');
    const last = questionIntro(4, 5, 'What is Exploratory Testing?');
    expect(first).toMatch(/^Alright, let's begin/);
    expect(first).not.toMatch(/Question 1/);
    expect(mid).toMatch(/^(Okay|Good|Alright|Thanks)/);
    expect(mid.endsWith('when do you run it?')).toBe(true);
    expect(last).toMatch(/last one/);
  });

  it('varies the lead-in between consecutive questions', () => {
    const a = questionIntro(1, 6, 'Q?'), b = questionIntro(2, 6, 'Q?'), c = questionIntro(3, 6, 'Q?');
    expect(new Set([a, b, c]).size).toBe(3);
  });

  it('explains the echo rule once on the first answer, briefly after that', () => {
    expect(answerLeadIn(0)).toMatch(/repeat each one after me/i);
    expect(answerLeadIn(1).length).toBeLessThan(answerLeadIn(0).length);
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

describe('Voice ranking', () => {
  const voices = [
    { name: 'Microsoft David - English (United States)', lang: 'en-US' },
    { name: 'Microsoft Neerja Online (Natural) - English (India)', lang: 'en-IN' },
    { name: 'Google UK English Female', lang: 'en-GB' },
    { name: 'Microsoft Zira - English (United States)', lang: 'en-US' },
    { name: 'Google हिन्दी', lang: 'hi-IN' },
    { name: 'eSpeak English', lang: 'en' },
  ];

  it('puts a natural Indian-English voice first and drops non-English voices', () => {
    const ranked = rankVoices(voices).map(v => v.name);
    expect(ranked[0]).toMatch(/Neerja/);
    expect(ranked[1]).toMatch(/Google UK/);
    expect(ranked).not.toContain('Google हिन्दी');
    expect(ranked[ranked.length - 1]).toMatch(/eSpeak/);
  });

  it('scores the classic SAPI voices below neural ones', () => {
    expect(voiceScore(voices[0])).toBeLessThan(voiceScore(voices[2]));
    expect(voiceScore({ name: 'Nothing', lang: 'fr-FR' })).toBe(-1);
  });
});
