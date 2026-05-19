import { beforeEach, describe, it, expect } from 'vitest';
import { truncateAll, createUser, createCouple, db, deductions } from './helpers/db';
import { sql } from 'drizzle-orm';
import { todayInTz } from '@/lib/date';
import { getCoupleTodayView } from '@/lib/reports/today';
import { deductions as deductionsT } from '@/lib/db/schema';

describe('getCoupleTodayView', () => {
  beforeEach(async () => { await truncateAll(); });

  it('returns 100/100 with empty feed when no deductions', async () => {
    const couple = await createCouple();
    const A = await createUser({ coupleId: couple.id });
    const B = await createUser({ coupleId: couple.id });
    const v = await getCoupleTodayView(couple.id, A.id);
    expect(v.me.remaining).toBe(100);
    expect(v.partner.remaining).toBe(100);
    expect(v.feed).toEqual([]);
  });

  it('subtracts active deductions, ignores voided', async () => {
    const couple = await createCouple();
    const A = await createUser({ coupleId: couple.id, timezone: 'Asia/Shanghai' });
    const B = await createUser({ coupleId: couple.id, timezone: 'Asia/Shanghai' });
    const today = todayInTz('Asia/Shanghai');
    await db.insert(deductions).values([
      { coupleId: couple.id, fromUserId: B.id, toUserId: A.id, points: 15, reason: 'x', occurredLocalDate: today },
      { coupleId: couple.id, fromUserId: A.id, toUserId: B.id, points: 5, reason: 'y', occurredLocalDate: today },
      { coupleId: couple.id, fromUserId: B.id, toUserId: A.id, points: 20, reason: 'z', occurredLocalDate: today, voidedAt: new Date() }
    ]);
    const v = await getCoupleTodayView(couple.id, A.id);
    expect(v.me.remaining).toBe(85);
    expect(v.partner.remaining).toBe(95);
    expect(v.feed).toHaveLength(3);
  });
});

describe('getCoupleTodayView with bonus', () => {
  beforeEach(async () => { await truncateAll(); });

  it('bonus rows offset deductions in remaining', async () => {
    const couple = await createCouple();
    const A = await createUser({ coupleId: couple.id, timezone: 'Asia/Shanghai' });
    const B = await createUser({ coupleId: couple.id, timezone: 'Asia/Shanghai' });
    const today = todayInTz('Asia/Shanghai');
    await db.insert(deductionsT).values([
      { coupleId: couple.id, fromUserId: B.id, toUserId: A.id, points: 15, reason: 'd', occurredLocalDate: today, kind: 'deduct' },
      { coupleId: couple.id, fromUserId: B.id, toUserId: A.id, points: 15, reason: 'd2', occurredLocalDate: today, kind: 'deduct' },
      { coupleId: couple.id, fromUserId: B.id, toUserId: A.id, points: 10, reason: 'b', occurredLocalDate: today, kind: 'bonus' }
    ]);
    const v = await getCoupleTodayView(couple.id, A.id);
    expect(v.me.remaining).toBe(80); // 100 - 30 + 10
  });

  it('caps remaining at 100 even when bonus > deductions', async () => {
    const couple = await createCouple();
    const A = await createUser({ coupleId: couple.id });
    const B = await createUser({ coupleId: couple.id });
    const today = todayInTz('Asia/Shanghai');
    await db.insert(deductionsT).values([
      { coupleId: couple.id, fromUserId: B.id, toUserId: A.id, points: 5, reason: 'd', occurredLocalDate: today, kind: 'deduct' },
      { coupleId: couple.id, fromUserId: B.id, toUserId: A.id, points: 20, reason: 'b', occurredLocalDate: today, kind: 'bonus' }
    ]);
    const v = await getCoupleTodayView(couple.id, A.id);
    expect(v.me.remaining).toBe(100);
  });

  it('feed items carry kind', async () => {
    const couple = await createCouple();
    const A = await createUser({ coupleId: couple.id });
    const B = await createUser({ coupleId: couple.id });
    const today = todayInTz('Asia/Shanghai');
    await db.insert(deductionsT).values([
      { coupleId: couple.id, fromUserId: B.id, toUserId: A.id, points: 10, reason: 'd', occurredLocalDate: today, kind: 'deduct' },
      { coupleId: couple.id, fromUserId: B.id, toUserId: A.id, points: 5, reason: 'b', occurredLocalDate: today, kind: 'bonus' }
    ]);
    const v = await getCoupleTodayView(couple.id, A.id);
    const kinds = v.feed.map((f) => f.kind).sort();
    expect(kinds).toEqual(['bonus', 'deduct']);
  });
});
