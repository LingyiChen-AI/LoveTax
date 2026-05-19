import { describe, it, expect } from 'vitest';
import { pickNudge } from '@/lib/email/nudges';

const rng = (v: number) => () => v; // deterministic

describe('pickNudge', () => {
  it('returns null when remaining > 60', () => {
    expect(pickNudge(61)).toBeNull();
    expect(pickNudge(100)).toBeNull();
    expect(pickNudge(80)).toBeNull();
  });

  it('returns a "mild" tier message when remaining 40..60', () => {
    const t40 = pickNudge(40, rng(0));
    const t60 = pickNudge(60, rng(0));
    const t55 = pickNudge(55, rng(0));
    expect(t40).toContain('⚠️');
    expect(t60).toContain('⚠️');
    expect(t55).toContain('⚠️');
  });

  it('returns a "warn" tier message when remaining 20..39', () => {
    expect(pickNudge(39, rng(0))).toContain('🟡');
    expect(pickNudge(20, rng(0))).toContain('🟡');
    expect(pickNudge(30, rng(0))).toContain('🟡');
  });

  it('returns a "critical" tier message when remaining 1..19', () => {
    expect(pickNudge(19, rng(0))).toContain('🔴');
    expect(pickNudge(1, rng(0))).toContain('🔴');
    expect(pickNudge(10, rng(0))).toContain('🔴');
  });

  it('returns a "zero" tier message when remaining is 0', () => {
    expect(pickNudge(0, rng(0))).toContain('💀');
  });

  it('selection is deterministic for a given rng', () => {
    expect(pickNudge(55, rng(0))).toBe(pickNudge(55, rng(0)));
    expect(pickNudge(55, rng(0.99))).toBe(pickNudge(55, rng(0.99)));
  });

  it('rotates through the pool with varying rng', () => {
    const got = new Set<string>();
    for (let i = 0; i < 5; i++) {
      const v = pickNudge(55, rng(i / 5));
      if (v) got.add(v);
    }
    // We expect more than 1 distinct nudge across 5 rng buckets
    expect(got.size).toBeGreaterThan(1);
  });
});
