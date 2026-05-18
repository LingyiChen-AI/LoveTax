import { and, eq, isNull, sql } from 'drizzle-orm';
import { db } from '@/lib/db/client';
import { deductions } from '@/lib/db/schema';

export interface ReasonRow { reason: string; count: number; total: number; }

export async function getTopReasons(coupleId: string, toUserId: string | null, limit = 20): Promise<ReasonRow[]> {
  const reasonExpr = sql<string>`LOWER(BTRIM(${deductions.reason}))`;
  const rows = await db.select({
    reason: reasonExpr,
    count: sql<number>`COUNT(*)::int`.as('count'),
    total: sql<number>`SUM(${deductions.points})::int`.as('total')
  }).from(deductions)
    .where(and(
      eq(deductions.coupleId, coupleId),
      isNull(deductions.voidedAt),
      toUserId ? eq(deductions.toUserId, toUserId) : sql`true`
    ))
    .groupBy(reasonExpr)
    .orderBy(sql`count DESC`)
    .limit(limit);
  return rows.map((r) => ({ reason: r.reason, count: r.count, total: r.total }));
}
