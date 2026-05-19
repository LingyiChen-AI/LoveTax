'use server';

import { and, eq, isNull, sql } from 'drizzle-orm';
import { db } from '@/lib/db/client';
import { deductions } from '@/lib/db/schema';
import { createDeductionSchema } from '@/lib/validation/schemas';
import { requirePaired } from '@/lib/auth/require-session';
import { DAILY_MAX } from '@/lib/score';
import { todayInTz } from '@/lib/date';
import { renderBonus } from '@/lib/email/render';
import { sendWithRetry } from '@/lib/email/send-with-retry';
import { checkAndIncrement, LIMITS } from '@/lib/rate-limit';
import { revalidatePath } from 'next/cache';

export async function createBonusAction(input: { points: number; reason: string }): Promise<
  { ok: true; pointsApplied: number; remaining: number } | { error: string }
> {
  const me = await requirePaired();
  const rl = await checkAndIncrement({ key: `bonus:${me.id}`, ...LIMITS.bonus });
  if (!rl.allowed) return { error: 'RATE_LIMITED' };

  const parsed = createDeductionSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'INVALID_INPUT' };

  const partner = await db.query.users.findFirst({
    where: (u, { and, eq, ne }) => and(eq(u.coupleId, me.coupleId), ne(u.id, me.id))
  });
  if (!partner) return { error: 'NOT_PAIRED' };

  const today = todayInTz(partner.timezone);

  const [dRow] = await db
    .select({ s: sql<number>`COALESCE(SUM(${deductions.points}),0)::int` })
    .from(deductions)
    .where(and(
      eq(deductions.toUserId, partner.id),
      eq(deductions.occurredLocalDate, today),
      eq(deductions.kind, 'deduct'),
      isNull(deductions.voidedAt)
    ));
  const [bRow] = await db
    .select({ s: sql<number>`COALESCE(SUM(${deductions.points}),0)::int` })
    .from(deductions)
    .where(and(
      eq(deductions.toUserId, partner.id),
      eq(deductions.occurredLocalDate, today),
      eq(deductions.kind, 'bonus'),
      isNull(deductions.voidedAt)
    ));
  const deductSum = Number(dRow?.s ?? 0);
  const bonusSum = Number(bRow?.s ?? 0);
  const currentRemaining = Math.max(0, Math.min(DAILY_MAX, DAILY_MAX - deductSum + bonusSum));
  const deficit = DAILY_MAX - currentRemaining;
  if (deficit === 0) return { error: 'BONUS_FULL' };

  const pointsToApply = Math.min(parsed.data.points, deficit);

  const [row] = await db.insert(deductions).values({
    coupleId: me.coupleId,
    fromUserId: me.id,
    toUserId: partner.id,
    points: pointsToApply,
    reason: parsed.data.reason,
    occurredLocalDate: today,
    kind: 'bonus'
  }).returning();

  const newRemaining = currentRemaining + pointsToApply;
  const appUrl = process.env.APP_URL ?? 'http://localhost:30001';
  const rendered = await renderBonus({
    appUrl, fromName: me.name, toName: partner.displayName,
    points: pointsToApply, reason: parsed.data.reason, remaining: newRemaining
  });
  sendWithRetry({
    to: partner.email,
    subject: `[LoveTax] Ta 夸了你 +${pointsToApply} 分 — ${parsed.data.reason.slice(0, 40)}`,
    html: rendered.html,
    text: rendered.text,
    type: 'bonus',
    deductionId: row.id
  }).catch(() => {});

  revalidatePath('/home');
  return { ok: true, pointsApplied: pointsToApply, remaining: newRemaining };
}
