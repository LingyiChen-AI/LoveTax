import { and, eq, gte, isNull, lte, sql } from 'drizzle-orm';
import { db } from '@/lib/db/client';
import { deductions } from '@/lib/db/schema';
import { DAILY_MAX } from '@/lib/score';

export interface MonthlySummary {
  month: string;
  conflictCount: number;
  avgRemaining: number;
  worstDay: { date: string; remaining: number } | null;
  bestDay: { date: string; remaining: number } | null;
  harmonyRate: number;
  daysInMonth: number;
  praiseCount: number;
  praisePointsTotal: number;
}

function monthBounds(month: string) {
  const [y, m] = month.split('-').map(Number);
  const start = `${String(y).padStart(4, '0')}-${String(m).padStart(2, '0')}-01`;
  const lastDay = new Date(Date.UTC(y, m, 0)).getUTCDate();
  const end = `${String(y).padStart(4, '0')}-${String(m).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
  return { start, end, daysInMonth: lastDay };
}

export async function getMonthlySummary(coupleId: string, userId: string, month: string): Promise<MonthlySummary> {
  const { start, end, daysInMonth } = monthBounds(month);

  const rows = await db
    .select({
      date: deductions.occurredLocalDate,
      kind: deductions.kind,
      s: sql<number>`COALESCE(SUM(${deductions.points}),0)::int`.as('s'),
      c: sql<number>`COUNT(*)::int`.as('c')
    })
    .from(deductions)
    .where(
      and(
        eq(deductions.coupleId, coupleId),
        eq(deductions.toUserId, userId),
        isNull(deductions.voidedAt),
        gte(deductions.occurredLocalDate, start),
        lte(deductions.occurredLocalDate, end)
      )
    )
    .groupBy(deductions.occurredLocalDate, deductions.kind);

  const byDate = new Map<string, { d: number; b: number }>();
  let praiseCount = 0;
  let praisePointsTotal = 0;
  for (const r of rows) {
    const v = byDate.get(r.date) ?? { d: 0, b: 0 };
    if (r.kind === 'deduct') v.d = r.s;
    if (r.kind === 'bonus') {
      v.b = r.s;
      praiseCount += r.c;
      praisePointsTotal += r.s;
    }
    byDate.set(r.date, v);
  }

  let conflictCount = 0;
  let totalRemaining = 0;
  let worst: { date: string; remaining: number } | null = null;
  let best: { date: string; remaining: number } | null = null;
  let harmonyDays = 0;

  const [y, m] = month.split('-').map(Number);
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${String(y).padStart(4, '0')}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const v = byDate.get(dateStr) ?? { d: 0, b: 0 };
    const netDeduct = Math.max(0, v.d - v.b);
    if (netDeduct > 0) conflictCount++; else harmonyDays++;
    const remaining = Math.max(0, Math.min(DAILY_MAX, DAILY_MAX - v.d + v.b));
    totalRemaining += remaining;
    if (!worst || remaining < worst.remaining) worst = { date: dateStr, remaining };
    if (!best || remaining > best.remaining) best = { date: dateStr, remaining };
  }

  return {
    month,
    conflictCount,
    avgRemaining: Math.round(totalRemaining / daysInMonth),
    worstDay: worst,
    bestDay: best,
    harmonyRate: harmonyDays / daysInMonth,
    daysInMonth,
    praiseCount,
    praisePointsTotal
  };
}
