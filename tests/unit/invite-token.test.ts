import { describe, it, expect } from 'vitest';
import { generateInviteToken, isInviteTokenShape } from '@/lib/invite-token';

describe('generateInviteToken', () => {
  it('produces a url-safe base64 string', () => {
    const t = generateInviteToken();
    expect(t).toMatch(/^[A-Za-z0-9_-]+$/);
    expect(t.length).toBeGreaterThanOrEqual(40);
  });
  it('produces different tokens each call', () => {
    expect(generateInviteToken()).not.toEqual(generateInviteToken());
  });
});

describe('isInviteTokenShape', () => {
  it('accepts a generated token', () => {
    expect(isInviteTokenShape(generateInviteToken())).toBe(true);
  });
  it('rejects too short', () => {
    expect(isInviteTokenShape('abc')).toBe(false);
  });
  it('rejects bad chars', () => {
    expect(isInviteTokenShape('!!!badchars$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$')).toBe(false);
  });
});
