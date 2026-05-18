import { and, desc, eq, isNull, sum } from 'drizzle-orm';
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
}

export interface CoupleTodayView {
  me: { id: string; remaining: number };
  partner: { id: string; remaining: number };
  feed: FeedItem[];
}

export async function getCoupleTodayView(coupleId: string, meId: string): Promise<CoupleTodayView> {
  const couple = await db.select({
    id: users.id, tz: users.timezone, coupleId: users.coupleId
  }).from(users).where(eq(users.coupleId, coupleId));
  const me = couple.find((u) => u.id === meId);
  const partner = couple.find((u) => u.id !== meId);
  if (!me || !partner) throw new Error('NOT_PAIRED');

  const meDateStr = todayInTz(me.tz);
  const partnerDateStr = todayInTz(partner.tz);

  const [meSum] = await db.select({ s: sum(deductions.points) }).from(deductions)
    .where(and(eq(deductions.toUserId, me.id), eq(deductions.occurredLocalDate, meDateStr), isNull(deductions.voidedAt)));
  const [pSum] = await db.select({ s: sum(deductions.points) }).from(deductions)
    .where(and(eq(deductions.toUserId, partner.id), eq(deductions.occurredLocalDate, partnerDateStr), isNull(deductions.voidedAt)));

  const meRemaining = Math.max(0, DAILY_MAX - Number(meSum?.s ?? 0));
  const partnerRemaining = Math.max(0, DAILY_MAX - Number(pSum?.s ?? 0));

  const feedRows = await db.select().from(deductions)
    .where(and(eq(deductions.coupleId, coupleId), eq(deductions.occurredLocalDate, meDateStr)))
    .orderBy(desc(deductions.occurredAt));

  return {
    me: { id: me.id, remaining: meRemaining },
    partner: { id: partner.id, remaining: partnerRemaining },
    feed: feedRows.map((r) => ({
      id: r.id,
      fromUserId: r.fromUserId,
      toUserId: r.toUserId,
      points: r.points,
      reason: r.reason,
      occurredAt: r.occurredAt,
      occurredLocalDate: r.occurredLocalDate,
      voidedAt: r.voidedAt
    }))
  };
}
