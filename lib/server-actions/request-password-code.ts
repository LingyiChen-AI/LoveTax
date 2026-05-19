'use server';

import { and, eq, isNull } from 'drizzle-orm';
import { randomInt } from 'node:crypto';
import { db } from '@/lib/db/client';
import { verificationCodes } from '@/lib/db/schema';
import { requireUser } from '@/lib/auth/require-session';
import { renderPasswordCode } from '@/lib/email/render';
import { sendWithRetry } from '@/lib/email/send-with-retry';
import { checkAndIncrement } from '@/lib/rate-limit';

const TTL_MINUTES = 10;
const TTL_MS = TTL_MINUTES * 60_000;

function makeCode(): string {
  return String(randomInt(100_000, 1_000_000));
}

export async function requestPasswordCodeAction(): Promise<
  { ok: true; email: string } | { error: string }
> {
  const me = await requireUser();

  const rl = await checkAndIncrement({
    key: `pwd_code:${me.id}`,
    windowMs: 30 * 60_000,
    limit: 3
  });
  if (!rl.allowed) return { error: 'RATE_LIMITED' };

  // Invalidate any previous unused codes
  await db
    .update(verificationCodes)
    .set({ usedAt: new Date() })
    .where(
      and(
        eq(verificationCodes.userId, me.id),
        eq(verificationCodes.purpose, 'password_change'),
        isNull(verificationCodes.usedAt)
      )
    );

  const code = makeCode();
  const expiresAt = new Date(Date.now() + TTL_MS);
  await db.insert(verificationCodes).values({
    userId: me.id,
    code,
    purpose: 'password_change',
    expiresAt
  });

  const appUrl = process.env.APP_URL ?? 'http://localhost:30001';
  const rendered = await renderPasswordCode({
    appUrl,
    email: me.email,
    code,
    ttlMinutes: TTL_MINUTES
  });
  sendWithRetry({
    to: me.email,
    subject: `[LoveTax] 修改密码验证码: ${code}`,
    html: rendered.html,
    text: rendered.text,
    type: 'password_code'
  }).catch(() => {});

  return { ok: true, email: me.email };
}
