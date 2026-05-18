'use server';

import { and, eq, gt } from 'drizzle-orm';
import { db } from '@/lib/db/client';
import { invitations } from '@/lib/db/schema';
import { inviteSchema } from '@/lib/validation/schemas';
import { generateInviteToken } from '@/lib/invite-token';
import { renderInvite } from '@/lib/email/render';
import { sendWithRetry } from '@/lib/email/send-with-retry';
import { requireUser } from '@/lib/auth/require-session';
import { revalidatePath } from 'next/cache';
import { checkAndIncrement, LIMITS } from '@/lib/rate-limit';

const INVITE_TTL_DAYS = 7;

export async function inviteUserAction(formData: FormData): Promise<{ ok: true } | { error: string }> {
  const user = await requireUser();
  const rl = await checkAndIncrement({ key: `invite:${user.id}`, ...LIMITS.invite });
  if (!rl.allowed) return { error: 'RATE_LIMITED' };
  if (user.coupleId) return { error: 'CONFLICT' };

  const parsed = inviteSchema.safeParse({ inviteeEmail: formData.get('inviteeEmail') });
  if (!parsed.success) return { error: 'INVALID_EMAIL' };

  // Reuse a pending invite if one exists & not expired
  const existing = await db.select().from(invitations).where(
    and(eq(invitations.inviterUserId, user.id), eq(invitations.status, 'pending'), gt(invitations.expiresAt, new Date()))
  ).limit(1);

  let token: string;
  if (existing.length) {
    token = existing[0].token;
  } else {
    token = generateInviteToken();
    const expiresAt = new Date(Date.now() + INVITE_TTL_DAYS * 86400 * 1000);
    await db.insert(invitations).values({
      inviterUserId: user.id,
      inviteeEmail: parsed.data.inviteeEmail,
      token,
      status: 'pending',
      expiresAt
    });
  }

  const appUrl = process.env.APP_URL ?? 'http://localhost:30001';
  const rendered = await renderInvite({
    inviterName: user.name,
    acceptUrl: `${appUrl}/invite/${token}`,
    expiresInDays: INVITE_TTL_DAYS
  });
  // Fire-and-forget; sendWithRetry never throws (logs failures to email_log)
  sendWithRetry({
    to: parsed.data.inviteeEmail,
    subject: `[LoveTax] ${user.name} 邀请你加入 LoveTax`,
    html: rendered.html,
    text: rendered.text,
    type: 'invite'
  }).catch(() => {});
  revalidatePath('/onboarding');
  return { ok: true };
}
