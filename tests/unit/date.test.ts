import { describe, it, expect } from 'vitest';
import { toLocalDate, todayInTz, daysAgo } from '@/lib/date';

describe('toLocalDate', () => {
  it('converts UTC to Asia/Shanghai date', () => {
    // 2026-05-18 23:00:00 UTC = 2026-05-19 07:00 in Shanghai
    expect(toLocalDate(new Date('2026-05-18T23:00:00Z'), 'Asia/Shanghai')).toBe('2026-05-19');
  });
  it('returns same day for midday Shanghai time', () => {
    // 2026-05-18 04:00 UTC = 2026-05-18 12:00 Shanghai
    expect(toLocalDate(new Date('2026-05-18T04:00:00Z'), 'Asia/Shanghai')).toBe('2026-05-18');
  });
  it('handles America/Los_Angeles', () => {
    // 2026-05-19 02:00 UTC = 2026-05-18 19:00 LA
    expect(toLocalDate(new Date('2026-05-19T02:00:00Z'), 'America/Los_Angeles')).toBe('2026-05-18');
  });
  it('throws on invalid tz', () => {
    expect(() => toLocalDate(new Date(), 'Mars/Olympus')).toThrow();
  });
});

describe('todayInTz', () => {
  it('returns YYYY-MM-DD string', () => {
    const d = todayInTz('Asia/Shanghai');
    expect(d).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe('daysAgo', () => {
  it('returns date N days before given date in same tz', () => {
    expect(daysAgo('2026-05-18', 7)).toBe('2026-05-11');
    expect(daysAgo('2026-05-01', 1)).toBe('2026-04-30');
  });
});
