'use server';

import { and, eq, isNull, sum } from 'drizzle-orm';
import { db } from '@/lib/db/client';
import { deductions } from '@/lib/db/schema';
import { createDeductionSchema } from '@/lib/validation/schemas';
import { requirePaired } from '@/lib/auth/require-session';
import { DAILY_MAX, capPoints } from '@/lib/score';
import { todayInTz } from '@/lib/date';
import { renderDeduction } from '@/lib/email/render';
import { sendWithRetry } from '@/lib/email/send-with-retry';
import { revalidatePath } from 'next/cache';

export async function createDeductionAction(input: { points: number; reason: string }): Promise<
  { ok: true; pointsApplied: number; remaining: number } | { error: string }
> {
  const me = await requirePaired();
  const parsed = createDeductionSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'INVALID_INPUT' };

  const partner = await db.query.users.findFirst({
    where: (u, { and, eq, ne }) => and(eq(u.coupleId, me.coupleId), ne(u.id, me.id))
  });
  if (!partner) return { error: 'NOT_PAIRED' };

  const today = todayInTz(partner.timezone);
  const [agg] = await db.select({ s: sum(deductions.points) }).from(deductions).where(
    and(eq(deductions.toUserId, partner.id), eq(deductions.occurredLocalDate, today), isNull(deductions.voidedAt))
  );
  const currentSum = Number(agg?.s ?? 0);
  const remaining = Math.max(0, DAILY_MAX - currentSum);
  if (remaining === 0) return { error: 'BLOOD_EMPTY' };

  const pointsToApply = capPoints(parsed.data.points, remaining);

  const [row] = await db.insert(deductions).values({
    coupleId: me.coupleId,
    fromUserId: me.id,
    toUserId: partner.id,
    points: pointsToApply,
    reason: parsed.data.reason,
    occurredLocalDate: today
  }).returning();

  const newRemaining = remaining - pointsToApply;
  const appUrl = process.env.APP_URL ?? 'http://localhost:3000';
  const rendered = await renderDeduction({
    appUrl, fromName: me.name, toName: partner.displayName,
    points: pointsToApply, reason: parsed.data.reason, remaining: newRemaining
  });
  await sendWithRetry({
    to: partner.email,
    subject: `[zchat] Ta 给你扣了 ${pointsToApply} 分 — ${parsed.data.reason.slice(0, 40)}`,
    html: rendered.html,
    text: rendered.text,
    type: 'deduction',
    deductionId: row.id
  });

  revalidatePath('/home');
  return { ok: true, pointsApplied: pointsToApply, remaining: newRemaining };
}
