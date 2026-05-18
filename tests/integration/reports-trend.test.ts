import { beforeEach, describe, it, expect } from 'vitest';
import { truncateAll, createUser, createCouple, db, deductions } from './helpers/db';
import { todayInTz, daysAgo } from '@/lib/date';
import { getTrend } from '@/lib/reports/trend';

describe('getTrend', () => {
  beforeEach(async () => { await truncateAll(); });

  it('returns 7 points with full HP when no data', async () => {
    const c = await createCouple();
    const A = await createUser({ coupleId: c.id });
    const B = await createUser({ coupleId: c.id });
    const pts = await getTrend(c.id, A.id, 'Asia/Shanghai', B.id, 'Asia/Shanghai', 7);
    expect(pts).toHaveLength(7);
    expect(pts.every((p) => p.meRemaining === 100 && p.partnerRemaining === 100)).toBe(true);
  });

  it('aggregates per-date sums and ignores voided', async () => {
    const c = await createCouple();
    const A = await createUser({ coupleId: c.id });
    const B = await createUser({ coupleId: c.id });
    const today = todayInTz('Asia/Shanghai');
    const y = daysAgo(today, 1);
    // Insert multiple rows to accumulate points within 1-20 per-row constraint
    // A receives 15+15=30 points today → meRemaining = 70
    // B receives 10 points today → partnerRemaining = 90
    // A receives 20 points yesterday (voided) → should be ignored
    await db.insert(deductions).values([
      { coupleId: c.id, fromUserId: B.id, toUserId: A.id, points: 15, reason: 'x', occurredLocalDate: today },
      { coupleId: c.id, fromUserId: B.id, toUserId: A.id, points: 15, reason: 'x2', occurredLocalDate: today },
      { coupleId: c.id, fromUserId: A.id, toUserId: B.id, points: 10, reason: 'y', occurredLocalDate: today },
      { coupleId: c.id, fromUserId: B.id, toUserId: A.id, points: 20, reason: 'z', occurredLocalDate: y, voidedAt: new Date() }
    ]);
    const pts = await getTrend(c.id, A.id, 'Asia/Shanghai', B.id, 'Asia/Shanghai', 7);
    const todayP = pts[pts.length - 1];
    expect(todayP.date).toBe(today);
    expect(todayP.meRemaining).toBe(70);
    expect(todayP.partnerRemaining).toBe(90);
    const yPt = pts[pts.length - 2];
    expect(yPt.date).toBe(y);
    expect(yPt.meRemaining).toBe(100);
  });
});
