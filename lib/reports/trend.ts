import { and, eq, gte, isNull, sql } from 'drizzle-orm';
import { db } from '@/lib/db/client';
import { deductions } from '@/lib/db/schema';
import { DAILY_MAX } from '@/lib/score';
import { todayInTz, daysAgo } from '@/lib/date';

export interface TrendPoint { date: string; meRemaining: number; partnerRemaining: number; }

export async function getTrend(
  coupleId: string,
  meId: string, meTz: string,
  partnerId: string, partnerTz: string,
  days: 7 | 30
): Promise<TrendPoint[]> {
  const todayMe = todayInTz(meTz);
  const startMe = daysAgo(todayMe, days - 1);
  const todayP = todayInTz(partnerTz);
  const startP = daysAgo(todayP, days - 1);
  const start = startMe < startP ? startMe : startP;

  const rows = await db.select({
    date: deductions.occurredLocalDate,
    toId: deductions.toUserId,
    s: sql<number>`SUM(${deductions.points})::int`
  }).from(deductions).where(and(
    eq(deductions.coupleId, coupleId),
    isNull(deductions.voidedAt),
    gte(deductions.occurredLocalDate, start)
  )).groupBy(deductions.occurredLocalDate, deductions.toUserId);

  const byDate = new Map<string, { me: number; partner: number }>();
  for (const r of rows) {
    const entry = byDate.get(r.date) ?? { me: 0, partner: 0 };
    if (r.toId === meId) entry.me = r.s;
    else if (r.toId === partnerId) entry.partner = r.s;
    byDate.set(r.date, entry);
  }

  const out: TrendPoint[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = daysAgo(todayMe, i);
    const v = byDate.get(d) ?? { me: 0, partner: 0 };
    out.push({
      date: d,
      meRemaining: Math.max(0, DAILY_MAX - v.me),
      partnerRemaining: Math.max(0, DAILY_MAX - v.partner)
    });
  }
  return out;
}
