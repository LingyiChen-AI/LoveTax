import { beforeEach, describe, it, expect } from 'vitest';
import { truncateAll, createUser, createCouple, db, deductions } from './helpers/db';
import { todayInTz } from '@/lib/date';
import { getTopReasons } from '@/lib/reports/reasons';

describe('getTopReasons', () => {
  beforeEach(async () => { await truncateAll(); });

  it('groups by trimmed lowercased reason, sorted by count desc', async () => {
    const c = await createCouple();
    const A = await createUser({ coupleId: c.id });
    const B = await createUser({ coupleId: c.id });
    const today = todayInTz('Asia/Shanghai');
    await db.insert(deductions).values([
      { coupleId: c.id, fromUserId: B.id, toUserId: A.id, points: 10, reason: '玩手机', occurredLocalDate: today },
      { coupleId: c.id, fromUserId: B.id, toUserId: A.id, points: 5, reason: ' 玩手机 ', occurredLocalDate: today },
      { coupleId: c.id, fromUserId: B.id, toUserId: A.id, points: 8, reason: '坏脸色', occurredLocalDate: today },
      { coupleId: c.id, fromUserId: B.id, toUserId: A.id, points: 3, reason: 'Forgot Anniversary', occurredLocalDate: today },
      { coupleId: c.id, fromUserId: B.id, toUserId: A.id, points: 2, reason: 'forgot anniversary', occurredLocalDate: today }
    ]);
    const rows = await getTopReasons(c.id, null);
    const map = Object.fromEntries(rows.map((r) => [r.reason, r]));
    expect(map['玩手机']).toEqual({ reason: '玩手机', count: 2, total: 15 });
    expect(map['forgot anniversary']).toEqual({ reason: 'forgot anniversary', count: 2, total: 5 });
    expect(rows[0].count).toBeGreaterThanOrEqual(rows[1].count);
  });

  it('ignores voided', async () => {
    const c = await createCouple();
    const A = await createUser({ coupleId: c.id });
    const B = await createUser({ coupleId: c.id });
    const today = todayInTz('Asia/Shanghai');
    await db.insert(deductions).values({
      coupleId: c.id, fromUserId: B.id, toUserId: A.id, points: 5, reason: 'gone', occurredLocalDate: today, voidedAt: new Date()
    });
    const rows = await getTopReasons(c.id, null);
    expect(rows).toEqual([]);
  });
});

describe('getTopReasons with kind filter', () => {
  beforeEach(async () => { await truncateAll(); });

  it('filters by kind', async () => {
    const c = await createCouple();
    const A = await createUser({ coupleId: c.id });
    const B = await createUser({ coupleId: c.id });
    const today = todayInTz('Asia/Shanghai');
    await db.insert(deductions).values([
      { coupleId: c.id, fromUserId: B.id, toUserId: A.id, points: 5, reason: '玩手机', occurredLocalDate: today, kind: 'deduct' },
      { coupleId: c.id, fromUserId: B.id, toUserId: A.id, points: 5, reason: '带奶茶', occurredLocalDate: today, kind: 'bonus' }
    ]);
    const deductRows = await getTopReasons(c.id, null, 20, 'deduct');
    expect(deductRows.map((r) => r.reason)).toEqual(['玩手机']);
    const bonusRows = await getTopReasons(c.id, null, 20, 'bonus');
    expect(bonusRows.map((r) => r.reason)).toEqual(['带奶茶']);
  });
});
