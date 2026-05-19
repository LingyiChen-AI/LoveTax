import { and, desc, eq, isNull, sql } from 'drizzle-orm';
import { db } from '@/lib/db/client';
import { deductions, users } from '@/lib/db/schema';
import { DAILY_MAX } from '@/lib/score';
import { todayInTz } from '@/lib/date';

export interface FeedItem {
  id: string;
  fromUserId: string;
  toUserId: string;
  points: number;
  reason: string;
  occurredAt: Date;
  occurredLocalDate: string;
  voidedAt: Date | null;
  kind: 'deduct' | 'bonus';
}

export interface CoupleTodayView {
  me: { id: string; remaining: number };
  partner: { id: string; remaining: number };
  feed: FeedItem[];
}

async function sumByKind(
  toUserId: string,
  date: string,
  kind: 'deduct' | 'bonus'
): Promise<number> {
  const [row] = await db
    .select({ s: sql<number>`COALESCE(SUM(${deductions.points}), 0)::int` })
    .from(deductions)
    .where(
      and(
        eq(deductions.toUserId, toUserId),
        eq(deductions.occurredLocalDate, date),
        eq(deductions.kind, kind),
        isNull(deductions.voidedAt)
      )
    );
  return Number(row?.s ?? 0);
}

function clampRemaining(d: number, b: number): number {
  return Math.max(0, Math.min(DAILY_MAX, DAILY_MAX - d + b));
}

export async function getCoupleTodayView(
  coupleId: string,
  meId: string
): Promise<CoupleTodayView> {
  const couple = await db
    .select({ id: users.id, tz: users.timezone, coupleId: users.coupleId })
    .from(users)
    .where(eq(users.coupleId, coupleId));
  const me = couple.find((u) => u.id === meId);
  const partner = couple.find((u) => u.id !== meId);
  if (!me || !partner) throw new Error('NOT_PAIRED');

  const meDate = todayInTz(me.tz);
  const partnerDate = todayInTz(partner.tz);

  const [meD, meB, pD, pB] = await Promise.all([
    sumByKind(me.id, meDate, 'deduct'),
    sumByKind(me.id, meDate, 'bonus'),
    sumByKind(partner.id, partnerDate, 'deduct'),
    sumByKind(partner.id, partnerDate, 'bonus')
  ]);

  const feedRows = await db
    .select()
    .from(deductions)
    .where(and(eq(deductions.coupleId, coupleId), eq(deductions.occurredLocalDate, meDate)))
    .orderBy(desc(deductions.occurredAt));

  return {
    me: { id: me.id, remaining: clampRemaining(meD, meB) },
    partner: { id: partner.id, remaining: clampRemaining(pD, pB) },
    feed: feedRows.map((r) => ({
      id: r.id,
      fromUserId: r.fromUserId,
      toUserId: r.toUserId,
      points: r.points,
      reason: r.reason,
      occurredAt: r.occurredAt,
      occurredLocalDate: r.occurredLocalDate,
      voidedAt: r.voidedAt,
      kind: r.kind
    }))
  };
}
