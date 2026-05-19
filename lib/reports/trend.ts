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

  const rows = await db
    .select({
      date: deductions.occurredLocalDate,
      toId: deductions.toUserId,
      kind: deductions.kind,
      s: sql<number>`COALESCE(SUM(${deductions.points}),0)::int`
    })
    .from(deductions)
    .where(
      and(
        eq(deductions.coupleId, coupleId),
        isNull(deductions.voidedAt),
        gte(deductions.occurredLocalDate, start)
      )
    )
    .groupBy(deductions.occurredLocalDate, deductions.toUserId, deductions.kind);

  const byDate = new Map<string, { meD: number; meB: number; pD: number; pB: number }>();
  function bucket(date: string) {
    let v = byDate.get(date);
    if (!v) { v = { meD: 0, meB: 0, pD: 0, pB: 0 }; byDate.set(date, v); }
    return v;
  }
  for (const r of rows) {
    const v = bucket(r.date);
    if (r.toId === meId && r.kind === 'deduct') v.meD = r.s;
    if (r.toId === meId && r.kind === 'bonus')  v.meB = r.s;
    if (r.toId === partnerId && r.kind === 'deduct') v.pD = r.s;
    if (r.toId === partnerId && r.kind === 'bonus')  v.pB = r.s;
  }

  const clamp = (d: number, b: number) => Math.max(0, Math.min(DAILY_MAX, DAILY_MAX - d + b));

  const out: TrendPoint[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = daysAgo(todayMe, i);
    const v = byDate.get(d) ?? { meD: 0, meB: 0, pD: 0, pB: 0 };
    out.push({
      date: d,
      meRemaining: clamp(v.meD, v.meB),
      partnerRemaining: clamp(v.pD, v.pB)
    });
  }
  return out;
}
