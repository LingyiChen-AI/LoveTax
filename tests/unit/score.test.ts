import { describe, it, expect } from 'vitest';
import { capPoints, remainingFromSum, DAILY_MAX } from '@/lib/score';

describe('capPoints', () => {
  it('returns submitted when remaining is greater', () => {
    expect(capPoints(10, 50)).toBe(10);
  });
  it('caps to remaining when submitted exceeds it', () => {
    expect(capPoints(10, 5)).toBe(5);
  });
  it('returns 0 when remaining is 0', () => {
    expect(capPoints(10, 0)).toBe(0);
  });
  it('throws on submitted < 1', () => {
    expect(() => capPoints(0, 10)).toThrow('INVALID_POINTS');
    expect(() => capPoints(-1, 10)).toThrow('INVALID_POINTS');
  });
  it('throws on submitted > 20', () => {
    expect(() => capPoints(21, 10)).toThrow('INVALID_POINTS');
  });
  it('throws on remaining < 0', () => {
    expect(() => capPoints(5, -1)).toThrow('INVALID_REMAINING');
  });
});

describe('remainingFromSum', () => {
  it('subtracts sum from DAILY_MAX', () => {
    expect(remainingFromSum(0)).toBe(100);
    expect(remainingFromSum(40)).toBe(60);
    expect(remainingFromSum(100)).toBe(0);
  });
  it('floors at 0 if sum exceeds DAILY_MAX (defensive)', () => {
    expect(remainingFromSum(150)).toBe(0);
  });
});

describe('DAILY_MAX', () => {
  it('is 100', () => { expect(DAILY_MAX).toBe(100); });
});
