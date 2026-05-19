'use server';
import { db } from '@/lib/db/client';
import { emailLog } from '@/lib/db/schema';
import { requireAdmin } from '@/lib/auth/require-session';
import { renderDeduction, renderBonus } from '@/lib/email/render';
import { sendWithRetry } from '@/lib/email/send-with-retry';
import { revalidatePath } from 'next/cache';

export async function adminResendEmail(logId: string): Promise<{ ok: true } | { error: string }> {
  await requireAdmin();
  const log = await db.query.emailLog.findFirst({ where: (e, { eq }) => eq(e.id, logId) });
  if (!log) return { error: 'NOT_FOUND' };
  if (log.status === 'sent') return { error: 'CONFLICT' };

  const appUrl = process.env.APP_URL ?? 'http://localhost:30001';
  let payload: { html: string; text: string };
  if (log.type === 'deduction' || log.type === 'bonus') {
    if (!log.deductionId) return { error: 'NOT_FOUND' };
    const d = await db.query.deductions.findFirst({ where: (x, { eq }) => eq(x.id, log.deductionId!) });
    if (!d) return { error: 'NOT_FOUND' };
    const from = await db.query.users.findFirst({ where: (u, { eq }) => eq(u.id, d.fromUserId) });
    const to = await db.query.users.findFirst({ where: (u, { eq }) => eq(u.id, d.toUserId) });
    if (!from || !to) return { error: 'NOT_FOUND' };
    const args = {
      appUrl,
      fromName: from.displayName,
      toName: to.displayName,
      points: d.points,
      reason: d.reason,
      remaining: 100
    };
    payload = log.type === 'deduction' ? await renderDeduction(args) : await renderBonus(args);
  } else {
    return { error: 'CONFLICT' };
  }

  // Fire-and-forget; sendWithRetry never throws (logs failures to email_log)
  sendWithRetry({
    to: log.toEmail, subject: log.subject,
    html: payload.html, text: payload.text,
    type: log.type, deductionId: log.deductionId
  }).catch(() => {});
  revalidatePath('/admin/email-failures');
  return { ok: true };
}
