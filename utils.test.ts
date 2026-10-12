import { describe, expect, it } from 'vitest';
import { formatCurrency, generateId, isMasterUser } from './utils';

describe('utils', () => {
  it('formats rupees in Indian grouping', () => {
    expect(formatCurrency(100000)).toContain('1,00,000');
    expect(formatCurrency(0)).toContain('0');
    expect(formatCurrency(1234567.5)).toContain('12,34,567');
  });

  it('generates unique ids', () => {
    const ids = new Set(Array.from({ length: 500 }, () => generateId()));
    expect(ids.size).toBe(500);
  });

  it('isMasterUser only trusts the isMaster flag', () => {
    expect(isMasterUser(null)).toBe(false);
    expect(isMasterUser({ isMaster: true } as any)).toBe(true);
    expect(isMasterUser({ role: 'admin', isMaster: false } as any)).toBe(false);
    expect(isMasterUser({ role: 'admin' } as any)).toBe(false);
  });
});
