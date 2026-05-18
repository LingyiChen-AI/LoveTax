'use server';
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { randomBytes } from 'node:crypto';
import { db } from '@/lib/db/client';
import { users } from '@/lib/db/schema';
import { requireAdmin } from '@/lib/auth/require-session';
import { renderPasswordReset } from '@/lib/email/render';
import { sendWithRetry } from '@/lib/email/send-with-retry';
import { revalidatePath } from 'next/cache';

function makeTempPassword(): string {
  const alpha = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz';
  const num = '23456789';
  const all = alpha + num;
  const bytes = randomBytes(16);
  let pw = '';
  for (let i = 0; i < 14; i++) pw += all[bytes[i] % all.length];
  pw += alpha[bytes[14] % alpha.length];
  pw += num[bytes[15] % num.length];
  return pw;
}

export async function adminResetPassword(userId: string): Promise<{ ok: true } | { error: string }> {
  await requireAdmin();
  const user = await db.query.users.findFirst({ where: (u, { eq }) => eq(u.id, userId) });
  if (!user) return { error: 'NOT_FOUND' };

  const temp = makeTempPassword();
  const hash = await bcrypt.hash(temp, 12);
  await db.update(users).set({ passwordHash: hash, mustChangePassword: true, updatedAt: new Date() }).where(eq(users.id, userId));

  const appUrl = process.env.APP_URL ?? 'http://localhost:30001';
  const rendered = await renderPasswordReset({ appUrl, email: user.email, tempPassword: temp });
  // Fire-and-forget; sendWithRetry never throws (logs failures to email_log)
  sendWithRetry({
    to: user.email,
    subject: '[zchat] 你的临时密码',
    html: rendered.html,
    text: rendered.text,
    type: 'password_reset'
  }).catch(() => {});

  revalidatePath('/admin/users');
  return { ok: true };
}
