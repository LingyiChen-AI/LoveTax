import { beforeEach, describe, it, expect } from 'vitest';
import { truncateAll, createUser, createCouple, db, deductions } from './helpers/db';
import { getMonthlySummary } from '@/lib/reports/monthly';

describe('getMonthlySummary', () => {
  beforeEach(async () => { await truncateAll(); });

  it('empty month → 0 conflict, 100 avg, harmony 1.0', async () => {
    const c = await createCouple();
    const A = await createUser({ coupleId: c.id });
    const B = await createUser({ coupleId: c.id });
    const s = await getMonthlySummary(c.id, A.id, '2026-02');
    expect(s.conflictCount).toBe(0);
    expect(s.avgRemaining).toBe(100);
    expect(s.harmonyRate).toBe(1);
    expect(s.daysInMonth).toBe(28);
    expect(s.worstDay?.remaining).toBe(100);
    expect(s.bestDay?.remaining).toBe(100);
  });

  it('computes worst/best correctly', async () => {
    const c = await createCouple();
    const A = await createUser({ coupleId: c.id });
    const B = await createUser({ coupleId: c.id });
    await db.insert(deductions).values([
      { coupleId: c.id, fromUserId: B.id, toUserId: A.id, points: 20, reason: 'x', occurredLocalDate: '2026-03-05' },
      { coupleId: c.id, fromUserId: B.id, toUserId: A.id, points: 20, reason: 'x', occurredLocalDate: '2026-03-05' },
      { coupleId: c.id, fromUserId: B.id, toUserId: A.id, points: 5, reason: 'x', occurredLocalDate: '2026-03-10' }
    ]);
    const s = await getMonthlySummary(c.id, A.id, '2026-03');
    expect(s.worstDay).toEqual({ date: '2026-03-05', remaining: 60 });
    expect(s.conflictCount).toBe(2);
    expect(s.daysInMonth).toBe(31);
  });
});

describe('getMonthlySummary praise stats', () => {
  beforeEach(async () => { await truncateAll(); });

  it('counts praise events for the user', async () => {
    const c = await createCouple();
    const A = await createUser({ coupleId: c.id });
    const B = await createUser({ coupleId: c.id });
    await db.insert(deductions).values([
      { coupleId: c.id, fromUserId: B.id, toUserId: A.id, points: 5,  reason: 'b1', occurredLocalDate: '2026-03-05', kind: 'bonus' },
      { coupleId: c.id, fromUserId: B.id, toUserId: A.id, points: 10, reason: 'b2', occurredLocalDate: '2026-03-10', kind: 'bonus' },
      { coupleId: c.id, fromUserId: B.id, toUserId: A.id, points: 5,  reason: 'd',  occurredLocalDate: '2026-03-05', kind: 'deduct' }
    ]);
    const s = await getMonthlySummary(c.id, A.id, '2026-03');
    expect(s.praiseCount).toBe(2);
    expect(s.praisePointsTotal).toBe(15);
  });
});
