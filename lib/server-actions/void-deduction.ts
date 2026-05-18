'use server';

import { and, eq, isNull, sum } from 'drizzle-orm';
import { db } from '@/lib/db/client';
import { deductions } from '@/lib/db/schema';
import { voidDeductionSchema } from '@/lib/validation/schemas';
import { requirePaired } from '@/lib/auth/require-session';
import { todayInTz } from '@/lib/date';
import { DAILY_MAX } from '@/lib/score';
import { renderVoid } from '@/lib/email/render';
import { sendWithRetry } from '@/lib/email/send-with-retry';
import { revalidatePath } from 'next/cache';

export async function voidDeductionAction(input: { id: string; reason?: string }): Promise<{ ok: true } | { error: string }> {
  const me = await requirePaired();
  const parsed = voidDeductionSchema.safeParse(input);
  if (!parsed.success) return { error: 'INVALID_INPUT' };

  const row = await db.query.deductions.findFirst({ where: (d, { eq }) => eq(d.id, parsed.data.id) });
  if (!row) return { error: 'NOT_FOUND' };
  if (row.coupleId !== me.coupleId) return { error: 'FORBIDDEN_VOID' };
  if (row.fromUserId !== me.id) return { error: 'FORBIDDEN_VOID' };
  if (row.voidedAt) return { error: 'FORBIDDEN_VOID' };

  const partner = await db.query.users.findFirst({ where: (u, { eq }) => eq(u.id, row.toUserId) });
  if (!partner) return { error: 'NOT_FOUND' };

  if (todayInTz(partner.timezone) !== row.occurredLocalDate) return { error: 'FORBIDDEN_VOID' };

  await db.update(deductions)
    .set({ voidedAt: new Date(), voidedReason: parsed.data.reason ?? null })
    .where(eq(deductions.id, row.id));

  const [agg] = await db.select({ s: sum(deductions.points) }).from(deductions).where(
    and(eq(deductions.toUserId, partner.id), eq(deductions.occurredLocalDate, row.occurredLocalDate), isNull(deductions.voidedAt))
  );
  const remaining = Math.max(0, DAILY_MAX - Number(agg?.s ?? 0));

  const appUrl = process.env.APP_URL ?? 'http://localhost:3000';
  const rendered = await renderVoid({
    appUrl, fromName: me.name, toName: partner.displayName,
    points: row.points, reason: row.reason, remaining
  });
  await sendWithRetry({
    to: partner.email,
    subject: `[zchat] Ta 撤销了一次扣分`,
    html: rendered.html,
    text: rendered.text,
    type: 'void',
    deductionId: row.id
  });

  revalidatePath('/home');
  return { ok: true };
}
