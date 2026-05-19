import { eq } from 'drizzle-orm';
import { db } from '@/lib/db/client';
import { rateLimits } from '@/lib/db/schema';

export interface LimitOpts { key: string; windowMs: number; limit: number; }

export async function checkAndIncrement(opts: LimitOpts): Promise<{ allowed: boolean; remaining: number }> {
  return await db.transaction(async (tx) => {
    const now = new Date();
    const windowStart = new Date(now.getTime() - opts.windowMs);

    const [row] = await tx.select().from(rateLimits).where(eq(rateLimits.key, opts.key)).for('update');

    if (!row || row.windowStart < windowStart) {
      // start a new window
      if (row) {
        await tx.update(rateLimits).set({ count: 1, windowStart: now }).where(eq(rateLimits.key, opts.key));
      } else {
        await tx.insert(rateLimits).values({ key: opts.key, count: 1, windowStart: now });
      }
      return { allowed: true, remaining: opts.limit - 1 };
    }

    if (row.count >= opts.limit) {
      return { allowed: false, remaining: 0 };
    }
    await tx.update(rateLimits).set({ count: row.count + 1 }).where(eq(rateLimits.key, opts.key));
    return { allowed: true, remaining: opts.limit - row.count - 1 };
  });
}

export const LIMITS = {
  register: { windowMs: 3600_000, limit: 3 },
  login: { windowMs: 300_000, limit: 10 },
  deduct: { windowMs: 60_000, limit: 10 },
  bonus: { windowMs: 60_000, limit: 10 },
  invite: { windowMs: 3600_000, limit: 5 }
} as const;
