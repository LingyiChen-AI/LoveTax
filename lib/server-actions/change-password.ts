'use server';

import bcrypt from 'bcryptjs';
import { and, eq, gt, isNull } from 'drizzle-orm';
import { db } from '@/lib/db/client';
import { users, verificationCodes } from '@/lib/db/schema';
import { passwordSchema } from '@/lib/validation/schemas';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';

export type ChangePasswordState = { error?: string } | null;

export async function changePasswordAction(
  _prev: ChangePasswordState,
  formData: FormData
): Promise<ChangePasswordState> {
  const session = await auth();
  const sUser: any = session?.user;
  if (!sUser?.id) return { error: 'UNAUTHORIZED' };

  const newPasswordRaw = formData.get('newPassword');
  const codeRaw = formData.get('code');

  const parsed = passwordSchema.safeParse(newPasswordRaw);
  if (!parsed.success) return { error: 'WEAK_PASSWORD' };

  const [user] = await db.select().from(users).where(eq(users.id, sUser.id)).limit(1);
  if (!user) return { error: 'NOT_FOUND' };

  // Voluntary change requires an unexpired verification code.
  // Forced change (admin reset) skips the code requirement.
  if (!user.mustChangePassword) {
    const code = typeof codeRaw === 'string' ? codeRaw.trim() : '';
    if (!code) return { error: 'CODE_REQUIRED' };

    const [vc] = await db
      .select()
      .from(verificationCodes)
      .where(
        and(
          eq(verificationCodes.userId, user.id),
          eq(verificationCodes.purpose, 'password_change'),
          eq(verificationCodes.code, code),
          isNull(verificationCodes.usedAt),
          gt(verificationCodes.expiresAt, new Date())
        )
      )
      .limit(1);
    if (!vc) return { error: 'CODE_INVALID' };

    await db
      .update(verificationCodes)
      .set({ usedAt: new Date() })
      .where(eq(verificationCodes.id, vc.id));
  }

  const newHash = await bcrypt.hash(parsed.data, 12);
  await db
    .update(users)
    .set({ passwordHash: newHash, mustChangePassword: false, updatedAt: new Date() })
    .where(eq(users.id, user.id));

  redirect('/');
}
