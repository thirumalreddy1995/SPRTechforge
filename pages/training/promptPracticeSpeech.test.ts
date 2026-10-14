import { describe, expect, it } from 'vitest';
import {
  SPEED_SETTINGS, DEFAULT_SPEED_IDX, approxWpm, speedColor,
  answerSentences, sentencePauseMs, estimateSpeakMs,
  toSpokenText, withNaturalPauses, questionIntro, SESSION_BRIEFING,
  rankVoices, voiceScore, pickInterviewerVoice,
} from './promptPracticeSpeech';

const NORMAL = SPEED_SETTINGS[DEFAULT_SPEED_IDX];
const SLOW = SPEED_SETTINGS[0];
const FAST = SPEED_SETTINGS[SPEED_SETTINGS.length - 1];

describe('Prompting pace levels', () => {
  it('has five levels from slow to fast with sensible TTS rates', () => {
    expect(SPEED_SETTINGS.map(s => s.label)).toEqual(['Slow', 'Relaxed', 'Normal', 'Brisk', 'Fast']);
    for (const s of SPEED_SETTINGS) {
      expect(s.rate).toBeGreaterThanOrEqual(0.7);
      expect(s.rate).toBeLessThanOrEqual(1.1);
    }
    // a prompter on the phone speaks a touch slower than conversation
    expect(NORMAL.rate).toBe(0.9);
  });

  it('is strictly ordered: faster speech and a shorter breath at every step', () => {
    for (let i = 1; i < SPEED_SETTINGS.length; i++) {
      expect(SPEED_SETTINGS[i].rate).toBeGreaterThan(SPEED_SETTINGS[i - 1].rate);
      expect(SPEED_SETTINGS[i].sentencePauseMs).toBeLessThan(SPEED_SETTINGS[i - 1].sentencePauseMs);
      expect(approxWpm(SPEED_SETTINGS[i])).toBeGreaterThan(approxWpm(SPEED_SETTINGS[i - 1]));
    }
  });

  it('never leaves a long silence: the breath at a full stop is under a second at every level', () => {
    for (const s of SPEED_SETTINGS) {
      expect(sentencePauseMs(s)).toBeGreaterThanOrEqual(200);
      expect(sentencePauseMs(s)).toBeLessThanOrEqual(800);
    }
    expect(sentencePauseMs(SLOW)).toBeGreaterThan(sentencePauseMs(FAST));
  });

  it('maps old session labels onto the new colour scale', () => {
    expect(speedColor('Very Slow')).toBe(SPEED_SETTINGS[0].color);
    expect(speedColor('Very Fast')).toBe(SPEED_SETTINGS[4].color);
    expect(speedColor('Normal')).toBe(SPEED_SETTINGS[2].color);
    expect(speedColor(undefined)).toBe('#64748b');
  });
});

describe('Answer sentences', () => {
  const answer = 'Boundary Value Analysis tests values at the boundaries of valid input ranges including the minimum maximum and values just inside and outside those boundaries. It is effective because defects cluster at the edges of input domains.';

  it('splits only at full stops, question and exclamation marks, keeping the mark', () => {
    expect(answerSentences(answer)).toEqual([
      'Boundary Value Analysis tests values at the boundaries of valid input ranges including the minimum maximum and values just inside and outside those boundaries.',
      'It is effective because defects cluster at the edges of input domains.',
    ]);
    expect(answerSentences('Is it ready? Yes, it is ready! Ship it today.')).toEqual(['Is it ready?', 'Yes, it is ready!', 'Ship it today.']);
  });

  it('does not break at commas, so the voice reads through them', () => {
    expect(answerSentences('Arrange sets up the data, Act runs the code, and Assert checks the result.')).toHaveLength(1);
  });

  it('merges a tiny trailing fragment into the previous sentence', () => {
    expect(answerSentences('We use NUnit for tests. E.g. TestCase.')).toEqual(['We use NUnit for tests. E.g. TestCase.']);
  });

  it('loses no words and handles odd spacing', () => {
    const s = answerSentences('  One   two.   Three four  five. ');
    expect(s).toEqual(['One two.', 'Three four five.']);
  });

  it('estimates speaking time from word count and rate', () => {
    expect(estimateSpeakMs('one two three four five', { ...NORMAL, rate: 1 })).toBe(2000); // 5 words at 150 wpm
    expect(estimateSpeakMs('one two three', SLOW)).toBeGreaterThan(estimateSpeakMs('one two three', FAST));
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

  it('the prompter briefs the candidate once: straight through, speak along', () => {
    expect(SESSION_BRIEFING).toMatch(/straight through/);
    expect(SESSION_BRIEFING).toMatch(/speak along/i);
    expect(SESSION_BRIEFING).not.toMatch(/repeat after me/i);
  });
});

describe('Pronunciation for the voice', () => {
  it('spells out acronyms and splits identifiers', () => {
    expect(toSpokenText('NUnit uses the TestCase attribute')).toBe('N-Unit uses the Test Case attribute');
    expect(toSpokenText('REST returns JSON or XML over HTTP')).toBe('rest returns jason or X M L over H T T P');
    expect(toSpokenText('cast to ITakesScreenshot and call GetScreenshot then SaveAsFile')).toBe('cast to I Takes Screenshot and call Get Screenshot then Save As File');
    expect(toSpokenText('Selenium C# with SpecFlow')).toBe('Selenium C sharp with Spec Flow');
  });

  it('adds the breath a reader takes before a new clause', () => {
    expect(withNaturalPauses('tests values at the boundaries including the minimum')).toBe('tests values at the boundaries, including the minimum');
    expect(withNaturalPauses('drivers such as ChromeDriver')).toBe('drivers, such as ChromeDriver');
    // never doubles an existing comma
    expect(withNaturalPauses('the class, which holds the elements')).toBe('the class, which holds the elements');
    expect(toSpokenText('a global timeout while Explicit Wait polls')).toBe('a global timeout, while Explicit Wait polls');
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
    expect(pickInterviewerVoice(ranked, 'Microsoft Neerja Online (Natural) - English (India)')?.name).toMatch(/Prabhat/);
    expect(pickInterviewerVoice(ranked, 'Microsoft Prabhat Online (Natural) - English (India)')?.name).toMatch(/Neerja/);
    expect(pickInterviewerVoice([{ name: 'Solo', lang: 'en-US' }], 'Solo')?.name).toBe('Solo');
    expect(pickInterviewerVoice([], 'x')).toBeNull();
  });
});
