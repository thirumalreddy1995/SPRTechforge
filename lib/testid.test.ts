import { describe, expect, it } from 'vitest';
import { childrenText, slugForTestId, testId } from './testid';

describe('test id derivation', () => {
  it('turns labels into stable kebab-case ids', () => {
    expect(testId('input', 'Full Name')).toBe('input-full-name');
    expect(testId('input', 'Full name *')).toBe('input-full-name');
    expect(testId('select', 'Qualification / degree')).toBe('select-qualification-degree');
    expect(testId('btn', '🚀 Publish Event')).toBe('btn-publish-event');
    expect(testId('btn', 'Next: Content →')).toBe('btn-next-content');
    expect(testId('btn', '⬇ Export CSV')).toBe('btn-export-csv');
    expect(testId('card', 'Share this registration link')).toBe('card-share-this-registration-link');
  });

  it('keeps ids ASCII-only, bounded and never empty', () => {
    expect(slugForTestId('Résumé & LinkedIn')).toBe('resume-and-linkedin');
    expect(slugForTestId('🎉')).toBe('');
    expect(testId('btn', '🎉')).toBe('btn');
    expect(testId('btn', undefined)).toBe('btn');
    const long = testId('input', 'a'.repeat(100));
    expect(long.length).toBeLessThanOrEqual('input-'.length + 48);
    expect(/^[a-z0-9-]+$/.test(long)).toBe(true);
  });

  it('reads plain text out of React children', () => {
    expect(childrenText('Sign In')).toBe('Sign In');
    expect(childrenText(['Send ', 3, ' invites'])).toBe('Send  3  invites');
    expect(childrenText(null)).toBe('');
    expect(childrenText(false)).toBe('');
    expect(childrenText({ props: { children: 'nested' } })).toBe('nested');
  });
});
