import { beforeEach, describe, it, expect } from 'vitest';
import { truncateAll } from './helpers/db';
import { checkAndIncrement } from '@/lib/rate-limit';

describe('checkAndIncrement', () => {
  beforeEach(async () => { await truncateAll(); });

  it('allows first call, denies after limit', async () => {
    for (let i = 0; i < 3; i++) {
      const r = await checkAndIncrement({ key: 'k1', windowMs: 60_000, limit: 3 });
      expect(r.allowed).toBe(true);
    }
    const r = await checkAndIncrement({ key: 'k1', windowMs: 60_000, limit: 3 });
    expect(r.allowed).toBe(false);
    expect(r.remaining).toBe(0);
  });

  it('isolates by key', async () => {
    await checkAndIncrement({ key: 'a', windowMs: 60_000, limit: 1 });
    const r = await checkAndIncrement({ key: 'b', windowMs: 60_000, limit: 1 });
    expect(r.allowed).toBe(true);
  });

  it('resets after window expires', async () => {
    await checkAndIncrement({ key: 'c', windowMs: 1, limit: 1 });
    await new Promise((r) => setTimeout(r, 20));
    const r = await checkAndIncrement({ key: 'c', windowMs: 1, limit: 1 });
    expect(r.allowed).toBe(true);
  });
});
